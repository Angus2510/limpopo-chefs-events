import { createHmac, timingSafeEqual } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { confirmPaidBooking } from "@/lib/booking-payments";

function safeCompare(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  return (
    leftBuffer.length === rightBuffer.length &&
    timingSafeEqual(leftBuffer, rightBuffer)
  );
}

function verifySignature(
  request: NextRequest,
  rawBody: string,
  secret: string,
) {
  const signature = request.headers.get("webhook-signature") ?? "";
  if (!signature) return false;

  if (secret.startsWith("whsec_")) {
    const id = request.headers.get("webhook-id") ?? "";
    const timestamp = request.headers.get("webhook-timestamp") ?? "";
    const timestampNumber = Number(timestamp);
    if (!id || !timestamp || !Number.isFinite(timestampNumber)) return false;
    if (Math.abs(Date.now() / 1000 - timestampNumber) > 180) return false;
    const encodedSecret = secret.slice("whsec_".length);
    const signed = `${id}.${timestamp}.${rawBody}`;
    const expected = createHmac("sha256", Buffer.from(encodedSecret, "base64"))
      .update(signed)
      .digest("base64");
    return signature.split(" ").some((part) => {
      const provided = part.split(",", 2)[1] ?? "";
      return provided !== "" && safeCompare(provided, expected);
    });
  }

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const provided = signature.startsWith("v1,")
    ? (signature.split(",", 2)[1] ?? "")
    : signature;
  return provided !== "" && safeCompare(provided, expected);
}

export async function POST(request: NextRequest) {
  const secret = process.env.YOCO_WEBHOOK_SECRET;
  if (!secret) {
    return NextResponse.json(
      { error: "Webhook verification is not configured." },
      { status: 503 },
    );
  }

  const rawBody = await request.text();
  if (!verifySignature(request, rawBody, secret)) {
    return NextResponse.json(
      { error: "Invalid webhook signature." },
      { status: 401 },
    );
  }

  let event: {
    type?: string;
    payload?: {
      id?: string;
      amount?: number;
      currency?: string;
      metadata?: Record<string, string>;
    };
  };
  try {
    event = JSON.parse(rawBody);
  } catch {
    return NextResponse.json({ error: "Invalid JSON body." }, { status: 400 });
  }

  const payload = event.payload;
  const reference = payload?.metadata?.clientReferenceId;
  if (!reference || !payload?.id) return NextResponse.json({ received: true });

  if (event.type === "payment.succeeded" && payload.currency === "ZAR") {
    const booking = await prisma.eventBooking.findUnique({
      where: { clientReferenceId: reference },
      select: { amount: true },
    });
    if (booking && payload.amount === booking.amount) {
      await confirmPaidBooking(reference, payload.id, payload.amount);
    }
  } else if (event.type === "payment.failed") {
    await prisma.eventBooking.updateMany({
      where: { clientReferenceId: reference, status: "pending" },
      data: { status: "failed" },
    });
  }

  return NextResponse.json({ received: true });
}
