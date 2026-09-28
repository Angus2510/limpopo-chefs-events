import { prisma } from "@/lib/prisma";
import { sendBookingConfirmation } from "@/lib/booking-confirmation-email";

export async function confirmPaidBooking(
  reference: string,
  paymentId: string,
  amount?: number,
) {
  const pending = await prisma.booking.findUnique({
    where: { clientReferenceId: reference },
  });
  if (!pending || pending.status !== "pending") return pending;
  if (amount !== undefined && amount !== pending.amount) return pending;

  const updated = await prisma.booking.updateMany({
    where: { id: pending.id, status: "pending" },
    data: { status: "paid", yocoPaymentId: paymentId },
  });
  if (updated.count === 0)
    return prisma.booking.findUnique({ where: { id: pending.id } });

  const booking = await prisma.booking.findUnique({
    where: { id: pending.id },
  });
  if (booking) await sendBookingConfirmation(booking);
  return booking;
}
