"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { LoaderCircle, LogOut, Printer, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { formatDate, formatPrice } from "@/lib/events";

type BookingRow = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  eventTitle: string;
  bookingChoiceLabel: string | null;
  campus: string;
  date: string;
  participants: number;
  amount: number;
  status: string;
  createdAt: string;
};

export default function AdminPage() {
  const [bookings, setBookings] = useState<BookingRow[]>([]);
  const [loggedIn, setLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("paid");
  const [error, setError] = useState("");

  async function loadBookings() {
    const response = await fetch(`/api/admin/bookings?ts=${Date.now()}`, {
      cache: "no-store",
    });
    if (response.status === 401) {
      setLoggedIn(false);
      setBookings([]);
      return;
    }
    if (!response.ok) throw new Error("Could not load bookings.");
    const result = (await response.json()) as { bookings: BookingRow[] };
    setBookings(result.bookings);
    setLoggedIn(true);
  }

  useEffect(() => {
    let active = true;
    Promise.resolve()
      .then(() => loadBookings())
      .catch(() => {
        if (active) setError("Could not connect to the booking register.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  async function handleLogin(formData: FormData) {
    setSubmitting(true);
    setError("");
    try {
      const response = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: formData.get("username"),
          password: formData.get("password"),
        }),
      });
      if (!response.ok) {
        const result = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        throw new Error(result.error ?? "Sign in failed.");
      }
      await loadBookings();
      setPassword("");
    } catch (loginError) {
      setError(
        loginError instanceof Error ? loginError.message : "Sign in failed.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    setLoggedIn(false);
    setBookings([]);
  }

  const filteredBookings = bookings.filter(
    (booking) => status === "all" || booking.status === status,
  );
  const paidBookings = bookings.filter((booking) => booking.status === "paid");
  const paidGuests = paidBookings.reduce(
    (count, booking) => count + booking.participants,
    0,
  );

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <LoaderCircle className="size-5 animate-spin text-primary" />
      </main>
    );
  }

  if (!loggedIn) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-muted/30 px-4">
        <Card className="w-full max-w-md p-6">
          <div className="mb-4 flex items-center gap-2">
            <ShieldCheck className="size-5 text-primary" />
            <h1 className="text-lg font-bold">Event Booking Admin</h1>
          </div>
          <p className="mb-5 text-sm text-muted-foreground">
            Sign in to view the event booking register.
          </p>
          <form action={handleLogin} className="space-y-3">
            <label className="block text-xs font-medium">
              Username
              <input
                name="username"
                autoComplete="username"
                required
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              />
            </label>
            <label className="block text-xs font-medium">
              Password
              <input
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="mt-1 h-10 w-full rounded-lg border border-border bg-background px-3 text-sm"
              />
            </label>
            {error && (
              <p role="alert" className="text-sm text-destructive">
                {error}
              </p>
            )}
            <Button className="w-full" disabled={submitting}>
              {submitting ? "Signing in…" : "Sign in"}
            </Button>
            <Button
              variant="outline"
              className="w-full"
              nativeButton={false}
              render={<Link href="/" />}
            >
              Back to events
            </Button>
          </form>
        </Card>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <header className="border-b border-border bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-bold">Event Bookings</h1>
            <p className="text-xs text-muted-foreground">
              Only successful payments count as confirmed.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => window.print()}>
              <Printer /> Print
            </Button>
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut /> Sign out
            </Button>
          </div>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-6 grid gap-4 sm:grid-cols-3">
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Total bookings</p>
            <p className="mt-1 text-2xl font-bold">{bookings.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Paid bookings</p>
            <p className="mt-1 text-2xl font-bold">{paidBookings.length}</p>
          </Card>
          <Card className="p-4">
            <p className="text-sm text-muted-foreground">Confirmed guests</p>
            <p className="mt-1 text-2xl font-bold">{paidGuests}</p>
          </Card>
        </div>
        <div className="mb-4 flex items-center justify-between gap-3">
          <h2 className="text-base font-semibold">Booking register</h2>
          <select
            aria-label="Filter by payment status"
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className="h-9 rounded-lg border border-border bg-background px-3 text-sm"
          >
            <option value="paid">Paid</option>
            <option value="pending">Pending</option>
            <option value="failed">Failed</option>
            <option value="all">All statuses</option>
          </select>
        </div>
        {error && (
          <p role="alert" className="mb-3 text-sm text-destructive">
            {error}
          </p>
        )}
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full min-w-212.5 border-collapse text-sm">
            <thead className="bg-muted/60 text-left text-xs uppercase text-muted-foreground">
              <tr>
                <th className="px-3 py-2">Event / Date</th>
                <th className="px-3 py-2">Guest</th>
                <th className="px-3 py-2">Campus</th>
                <th className="px-3 py-2">Guests</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Status</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => (
                <tr
                  key={booking.id}
                  className="border-t border-border align-top"
                >
                  <td className="px-3 py-3">
                    <p className="font-medium">
                      {booking.eventTitle}
                      {booking.bookingChoiceLabel
                        ? ` (${booking.bookingChoiceLabel})`
                        : ""}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatDate(booking.date)}
                    </p>
                  </td>
                  <td className="px-3 py-3">
                    <p>
                      {booking.firstName} {booking.lastName}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {booking.email}
                      {booking.phone ? ` · ${booking.phone}` : ""}
                    </p>
                  </td>
                  <td className="px-3 py-3">{booking.campus}</td>
                  <td className="px-3 py-3">{booking.participants}</td>
                  <td className="px-3 py-3">
                    {formatPrice(booking.amount / 100)}
                  </td>
                  <td className="px-3 py-3">
                    <Badge
                      variant={
                        booking.status === "paid" ? "default" : "secondary"
                      }
                    >
                      {booking.status}
                    </Badge>
                  </td>
                </tr>
              ))}
              {filteredBookings.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="px-3 py-10 text-center text-muted-foreground"
                  >
                    No bookings match this filter.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </section>
    </main>
  );
}
