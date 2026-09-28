import { Resend } from "resend";
import { formatDate, formatPrice } from "@/lib/events";

type BookingConfirmation = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  eventTitle: string;
  bookingChoiceLabel: string | null;
  campus: string;
  date: string;
  participants: number;
  amount: number;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export async function sendBookingConfirmation(booking: BookingConfirmation) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.RESEND_FROM_EMAIL;
  if (!apiKey || !from) {
    console.warn(
      "[event-confirmation] RESEND_API_KEY or RESEND_FROM_EMAIL is not configured",
    );
    return;
  }

  const eventTitle = booking.bookingChoiceLabel
    ? `${booking.eventTitle} (${booking.bookingChoiceLabel})`
    : booking.eventTitle;
  const name = `${booking.firstName} ${booking.lastName}`.trim();
  const date = formatDate(booking.date);
  const amount = formatPrice(booking.amount / 100);
  const html = `<div style="font-family:Arial,sans-serif;color:#171717;max-width:560px;margin:24px auto;border:1px solid #e5e7eb;border-radius:10px;overflow:hidden"><div style="background:#315631;color:#fff;padding:24px"><p style="margin:0 0 8px;text-transform:uppercase;font-size:12px;letter-spacing:1px">Limpopo Chefs Academy</p><h1 style="margin:0;font-size:24px">Your event booking is confirmed</h1></div><div style="padding:24px"><p>Hello ${escapeHtml(name)}, your booking has been confirmed.</p><div style="border:1px solid #e5e7eb;border-radius:8px;padding:16px"><p><strong>Event:</strong> ${escapeHtml(eventTitle)}</p><p><strong>Campus:</strong> ${escapeHtml(booking.campus)}</p><p><strong>Date:</strong> ${escapeHtml(date)}</p><p><strong>Participants:</strong> ${booking.participants}</p><p><strong>Total paid:</strong> ${escapeHtml(amount)}</p><p><strong>Reference:</strong> ${escapeHtml(booking.id)}</p></div><p style="margin-top:24px;font-size:13px;color:#666">For assistance, contact Limpopo Chefs Academy at 066 008 6821.</p></div></div>`;

  try {
    const { error } = await new Resend(apiKey).emails.send({
      from,
      to: booking.email,
      subject: "Your Limpopo Chefs Academy event booking is confirmed",
      html,
      text: `Hello ${name}, your booking for ${eventTitle} on ${date} at ${booking.campus} is confirmed. Participants: ${booking.participants}. Total paid: ${amount}. Reference: ${booking.id}.`,
    });
    if (error) console.error("[event-confirmation] Resend error", error);
  } catch (error) {
    console.error("[event-confirmation] Could not send confirmation", error);
  }
}
