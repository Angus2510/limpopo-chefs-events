import { randomUUID } from "node:crypto";
import { NextRequest, NextResponse } from "next/server";
import { getEvent, getSession } from "@/lib/events";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  if (!process.env.YOCO_SECRET_KEY) {
    return NextResponse.json(
      { error: "Secure checkout is not configured yet. Please contact us." },
      { status: 503 },
    );
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "Booking storage is not configured yet. Please contact us." },
      { status: 503 },
    );
  }

  if (!process.env.NEXT_PUBLIC_BASE_URL) {
    return NextResponse.json(
      { error: "The checkout return address is not configured." },
      { status: 503 },
    );
  }

  try {
    const body = (await request.json()) as Record<string, unknown>;
    const eventId = typeof body.eventId === "string" ? body.eventId : "";
    const campus = typeof body.campus === "string" ? body.campus : "";
    const date = typeof body.date === "string" ? body.date : "";
    const participants = Number(body.participants);
    const firstName =
      typeof body.firstName === "string" ? body.firstName.trim() : "";
    const lastName =
      typeof body.lastName === "string" ? body.lastName.trim() : "";
    const email =
      typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    const phone = typeof body.phone === "string" ? body.phone.trim() : "";
    const bookingChoiceId =
      typeof body.bookingChoiceId === "string" ? body.bookingChoiceId : null;

    if (
      !Number.isSafeInteger(participants) ||
      participants < 1 ||
      participants > 20 ||
      firstName.length < 1 ||
      firstName.length > 80 ||
      lastName.length < 1 ||
      lastName.length > 80 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      email.length > 254 ||
      phone.length < 5 ||
      phone.length > 40 ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date)
    ) {
      return NextResponse.json(
        { error: "Please check the booking details." },
        { status: 400 },
      );
    }

    const event = getEvent(eventId);
    if (!event) {
      return NextResponse.json(
        { error: "This event is not available." },
        { status: 400 },
      );
    }

    const session = getSession(event, date, campus);
    if (!session || date < new Date().toISOString().slice(0, 10)) {
      return NextResponse.json(
        { error: "That date or campus is no longer available." },
        { status: 400 },
      );
    }

    const choice = bookingChoiceId
      ? event.bookingChoices?.find((item) => item.id === bookingChoiceId)
      : undefined;
    if (
      (event.bookingChoices && !choice) ||
      (!event.bookingChoices && bookingChoiceId)
    ) {
      return NextResponse.json(
        { error: "Please select a valid booking option." },
        { status: 400 },
      );
    }

    const capacity = choice?.capacity ?? session.capacity;
    const pendingSince = new Date(Date.now() - 20 * 60 * 1000);
    const existing = await prisma.booking.aggregate({
      _sum: { participants: true },
      where: {
        eventId,
        date,
        campus,
        bookingChoiceId: choice?.id ?? null,
        OR: [
          { status: "paid" },
          { status: "pending", createdAt: { gte: pendingSince } },
        ],
      },
    });
    const remaining = Math.max(capacity - (existing._sum.participants ?? 0), 0);
    if (participants > remaining) {
      return NextResponse.json(
        {
          error: remaining
            ? `Only ${remaining} spot(s) remain.`
            : "This session is sold out.",
        },
        { status: 409 },
      );
    }

    const pricePerPerson = choice?.price ?? event.price;
    const amount = Math.round(pricePerPerson * participants * 100);
    const clientReferenceId = randomUUID();
    const booking = await prisma.booking.create({
      data: {
        firstName,
        lastName,
        email,
        phone,
        eventId,
        eventTitle: event.title,
        bookingChoiceId: choice?.id,
        bookingChoiceLabel: choice?.label,
        campus,
        date,
        participants,
        amount,
        currency: "ZAR",
        status: "pending",
        clientReferenceId,
      },
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL.replace(/\/$/, "");
      const yocoResponse = await fetch(
        "https://payments.yoco.com/api/checkouts",
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${process.env.YOCO_SECRET_KEY}`,
            "Content-Type": "application/json",
            "Idempotency-Key": clientReferenceId,
          },
          body: JSON.stringify({
            amount,
            currency: "ZAR",
            successUrl: `${baseUrl}/payment/success?ref=${encodeURIComponent(clientReferenceId)}`,
            cancelUrl: `${baseUrl}/payment/cancelled`,
            failureUrl: `${baseUrl}/payment/cancelled`,
            clientReferenceId,
            metadata: {
              eventId,
              campus,
              date,
              participants: String(participants),
              bookingChoiceId: choice?.id ?? "",
              clientReferenceId,
            },
            lineItems: [
              {
                displayName: choice
                  ? `${event.title} (${choice.label})`
                  : event.title,
                quantity: participants,
                pricingDetails: { price: Math.round(pricePerPerson * 100) },
                description: `${campus} Campus · ${date}`,
              },
            ],
          }),
        },
      );

      const checkout = (await yocoResponse.json().catch(() => ({}))) as {
        id?: string;
        redirectUrl?: string;
      };
      if (!yocoResponse.ok || !checkout.id || !checkout.redirectUrl) {
        await prisma.booking.update({
          where: { id: booking.id },
          data: { status: "failed" },
        });
        return NextResponse.json(
          {
            error:
              "The payment provider could not start checkout. Please try again.",
          },
          { status: 502 },
        );
      }

      await prisma.booking.update({
        where: { id: booking.id },
        data: { yocoCheckoutId: checkout.id },
      });
      return NextResponse.json({ redirectUrl: checkout.redirectUrl });
    } catch (error) {
      await prisma.booking.update({
        where: { id: booking.id },
        data: { status: "failed" },
      });
      throw error;
    }
  } catch (error) {
    console.error("[events-checkout] Failed to create checkout", error);
    return NextResponse.json(
      { error: "We could not create your booking. Please try again." },
      { status: 500 },
    );
  }
}
