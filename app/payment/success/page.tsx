import Link from "next/link";
import {
  CalendarDays,
  CheckCircle2,
  ChefHat,
  MapPin,
  Users,
} from "lucide-react";
import { prisma } from "@/lib/prisma";
import { confirmPaidBooking } from "@/lib/booking-payments";
import { formatDate, formatPrice } from "@/lib/events";

export const dynamic = "force-dynamic";

export default async function PaymentSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ ref?: string }>;
}) {
  const { ref } = await searchParams;
  let booking = ref
    ? await prisma.booking.findUnique({ where: { clientReferenceId: ref } })
    : null;

  if (
    booking?.status === "pending" &&
    booking.yocoCheckoutId &&
    process.env.YOCO_SECRET_KEY
  ) {
    try {
      const response = await fetch(
        `https://payments.yoco.com/api/checkouts/${encodeURIComponent(booking.yocoCheckoutId)}`,
        {
          headers: { Authorization: `Bearer ${process.env.YOCO_SECRET_KEY}` },
          cache: "no-store",
        },
      );
      const checkout = (await response.json().catch(() => ({}))) as {
        status?: string;
        paymentId?: string;
        amount?: number;
      };
      if (response.ok && checkout.status === "completed") {
        await confirmPaidBooking(
          ref!,
          checkout.paymentId ?? booking.yocoCheckoutId,
          checkout.amount,
        );
        booking = await prisma.booking.findUnique({
          where: { id: booking.id },
        });
      }
    } catch (error) {
      console.error("[payment-success] Could not verify checkout", error);
    }
  }

  const paid = booking?.status === "paid";
  const title = booking?.bookingChoiceLabel
    ? `${booking.eventTitle} (${booking.bookingChoiceLabel})`
    : booking?.eventTitle;

  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-3">
        <ChefHat className="size-5 text-primary" aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Limpopo Chefs Academy
        </span>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-md">
          <div className="mb-8 text-center">
            <div
              className={`mx-auto mb-4 flex size-20 items-center justify-center rounded-full ${paid ? "bg-primary/10" : "bg-muted"}`}
            >
              <CheckCircle2
                className={`size-10 ${paid ? "text-primary" : "text-muted-foreground"}`}
              />
            </div>
            <h1 className="mb-2 text-2xl font-bold">
              {paid ? "Booking Confirmed" : "Payment Verification"}
            </h1>
            <p className="text-muted-foreground">
              {paid
                ? "Your place is reserved. A confirmation will be sent to your email."
                : "Your payment is being confirmed. Please check your email shortly or contact us if you need help."}
            </p>
          </div>
          {booking && (
            <div className="mb-6 overflow-hidden rounded-lg border border-border bg-card">
              <div className="bg-primary px-5 py-4 text-primary-foreground">
                <p className="mb-0.5 text-xs font-medium uppercase tracking-wide text-white/70">
                  Event
                </p>
                <p className="text-lg font-bold leading-snug">{title}</p>
              </div>
              <div className="space-y-3 p-5 text-sm">
                <p className="flex items-center gap-3">
                  <MapPin className="size-4 text-primary" />
                  Campus: <strong>{booking.campus}</strong>
                </p>
                <p className="flex items-center gap-3">
                  <CalendarDays className="size-4 text-primary" />
                  Date: <strong>{formatDate(booking.date)}</strong>
                </p>
                <p className="flex items-center gap-3">
                  <Users className="size-4 text-primary" />
                  Participants: <strong>{booking.participants}</strong>
                </p>
                <div className="flex items-center justify-between border-t border-border pt-3">
                  <span className="text-muted-foreground">Total</span>
                  <strong className="text-xl text-primary">
                    {formatPrice(booking.amount / 100)}
                  </strong>
                </div>
                {paid && (
                  <p className="text-xs text-muted-foreground">
                    Confirmation sent to {booking.email}
                  </p>
                )}
              </div>
            </div>
          )}
          <Link
            href="/"
            className="flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <ChefHat className="size-4" /> Browse events
          </Link>
        </section>
      </div>
    </main>
  );
}
