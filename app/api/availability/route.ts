import { NextResponse } from "next/server";
import { EVENTS, sessionKey } from "@/lib/events";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const pendingSince = new Date(Date.now() - 20 * 60 * 1000);
  const bookings = await prisma.eventBooking.findMany({
    where: {
      OR: [
        { status: "paid" },
        { status: "pending", createdAt: { gte: pendingSince } },
      ],
    },
    select: {
      eventId: true,
      date: true,
      campus: true,
      bookingChoiceId: true,
      participants: true,
    },
  });

  const availability: Record<string, Record<string, number>> = {};

  for (const event of EVENTS) {
    availability[event.id] = {};
    for (const session of event.sessions) {
      const choices = event.bookingChoices ?? [null];
      for (const choice of choices) {
        const used = bookings
          .filter(
            (booking) =>
              booking.eventId === event.id &&
              booking.date === session.date &&
              booking.campus === session.campus &&
              booking.bookingChoiceId === (choice?.id ?? null),
          )
          .reduce((total, booking) => total + booking.participants, 0);
        const capacity = choice?.capacity ?? session.capacity;
        availability[event.id]![
          sessionKey(session.date, session.campus, choice?.id)
        ] = Math.max(capacity - used, 0);
      }
    }
  }

  return NextResponse.json(
    { availability },
    { headers: { "Cache-Control": "no-store, max-age=0" } },
  );
}
