"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import {
  CalendarDays,
  Check,
  Clock3,
  LoaderCircle,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Users,
  X,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  type AcademyEvent,
  type Campus,
  formatDate,
  formatPrice,
  sessionKey,
} from "@/lib/events";

type Availability = Record<string, Record<string, number>>;

const inputClassName =
  "h-9 w-full rounded-lg border border-border bg-background px-3 text-sm placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-ring";
const whatsappLink =
  "https://wa.me/27660086821?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20an%20LCA%20event.";

export function EventBooking({ event }: { event: AcademyEvent }) {
  const today = new Date().toISOString().slice(0, 10);
  const hasSessions = event.sessions.some((session) => session.date >= today);
  const [open, setOpen] = useState(false);

  if (!hasSessions) {
    return (
      <Button
        size="sm"
        variant="outline"
        nativeButton={false}
        render={<a href={whatsappLink} target="_blank" rel="noreferrer" />}
      >
        Ask about next date
      </Button>
    );
  }

  return (
    <>
      <Button size="sm" onClick={() => setOpen(true)}>
        Book a spot <CalendarDays aria-hidden="true" />
      </Button>
      <EventBookingSheet
        event={event}
        open={open}
        onClose={() => setOpen(false)}
      />
    </>
  );
}

function EventBookingSheet({
  event,
  open,
  onClose,
}: {
  event: AcademyEvent;
  open: boolean;
  onClose: () => void;
}) {
  const [campus, setCampus] = useState<Campus | "">(
    event.campuses.length === 1 ? event.campuses[0]! : "",
  );
  const [date, setDate] = useState("");
  const [choiceId, setChoiceId] = useState(event.bookingChoices?.[0]?.id ?? "");
  const [participants, setParticipants] = useState(1);
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [availability, setAvailability] = useState<Availability>({});
  const [availabilityLoading, setAvailabilityLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sessions = event.sessions.filter(
    (session) => !campus || session.campus === campus,
  );
  const upcomingSessions = sessions.filter(
    (session) => session.date >= new Date().toISOString().slice(0, 10),
  );
  const selectedSession = event.sessions.find(
    (session) => session.date === date && session.campus === campus,
  );
  const selectedChoice = event.bookingChoices?.find(
    (choice) => choice.id === choiceId,
  );
  const capacity =
    selectedChoice?.capacity ?? selectedSession?.capacity ?? event.capacity;
  const remaining = selectedSession
    ? Math.max(
        availability[event.id]?.[
          sessionKey(date, campus as Campus, selectedChoice?.id)
        ] ?? capacity,
        0,
      )
    : 0;
  const price = selectedChoice?.price ?? event.price;
  const total = price * participants;
  const canBook = Boolean(
    campus &&
    date &&
    selectedSession &&
    remaining > 0 &&
    participants <= remaining &&
    firstName.trim() &&
    lastName.trim() &&
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) &&
    phone.trim(),
  );

  useEffect(() => {
    if (!open) return;
    let mounted = true;

    fetch("/api/availability", { cache: "no-store" })
      .then(async (response) => {
        if (!response.ok) throw new Error("Could not check event availability");
        return (await response.json()) as { availability: Availability };
      })
      .then((data) => {
        if (mounted) setAvailability(data.availability ?? {});
      })
      .catch(() => {
        if (mounted) setAvailability({});
      })
      .finally(() => {
        if (mounted) setAvailabilityLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, [open]);

  async function handleBook() {
    if (!canBook || loading) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventId: event.id,
          campus,
          date,
          participants,
          bookingChoiceId: selectedChoice?.id,
          firstName: firstName.trim(),
          lastName: lastName.trim(),
          email: email.trim(),
          phone: phone.trim(),
        }),
      });

      const data = (await response.json().catch(() => ({}))) as {
        redirectUrl?: string;
        error?: string;
      };
      if (!response.ok || !data.redirectUrl) {
        throw new Error(data.error ?? "Could not start secure checkout");
      }
      window.location.assign(data.redirectUrl);
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error
          ? checkoutError.message
          : "Something went wrong. Please try again.",
      );
      setLoading(false);
    }
  }

  return (
    <Sheet open={open} onOpenChange={(isOpen) => !isOpen && onClose()}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 overflow-hidden p-0 sm:max-w-md"
        showCloseButton={false}
      >
        <div className="relative shrink-0 bg-primary px-5 pb-5 pt-5 text-primary-foreground">
          <SheetClose className="absolute right-3 top-3 flex size-8 items-center justify-center rounded-full bg-white/20 transition-colors hover:bg-white/30">
            <X className="size-4" aria-hidden="true" />
            <span className="sr-only">Close booking</span>
          </SheetClose>
          <div className="relative mb-3 h-28 overflow-hidden rounded-lg bg-white/15 ring-1 ring-white/25">
            <Image
              src={event.image}
              alt={event.title}
              fill
              className="object-cover"
              sizes="420px"
            />
          </div>
          <SheetHeader className="gap-0.5 p-0">
            <SheetTitle className="text-xl font-bold leading-snug text-primary-foreground">
              {event.title}
            </SheetTitle>
          </SheetHeader>
          <div className="mt-3 flex flex-wrap gap-1.5">
            <Badge className="flex items-center gap-1 border-white/30 bg-white/20 text-[10px] text-white">
              <Clock3 className="size-3" /> {event.duration}
            </Badge>
            <Badge className="flex items-center gap-1 border-white/30 bg-white/20 text-[10px] text-white">
              <Users className="size-3" /> {remaining} spots left
            </Badge>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto">
          <div className="space-y-5 p-5">
            <p className="text-sm leading-relaxed text-muted-foreground">
              {event.description}
            </p>
            <Separator />

            <section>
              <h3 className="mb-3 flex items-center gap-1.5 text-sm font-semibold">
                <MapPin className="size-3.5 text-primary" /> Select Campus
              </h3>
              <div className="grid grid-cols-2 gap-2">
                {event.campuses.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      setCampus(option);
                      setDate("");
                    }}
                    className={`rounded-lg border p-3 text-sm font-medium transition-colors ${
                      campus === option
                        ? "border-primary bg-primary/8 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/50"
                    }`}
                  >
                    <MapPin className="mx-auto mb-1 size-4" />
                    {option}
                  </button>
                ))}
              </div>
            </section>

            <Separator />
            <section>
              <h3 className="mb-3 text-sm font-semibold">Choose a Date</h3>
              {!campus ? (
                <p className="text-sm text-muted-foreground">
                  Select a campus to see its available dates.
                </p>
              ) : (
                <div className="grid grid-cols-2 gap-2">
                  {upcomingSessions.map((session) => (
                    <button
                      key={`${session.date}-${session.campus}`}
                      type="button"
                      onClick={() => setDate(session.date)}
                      className={`rounded-lg border px-3 py-2.5 text-left text-xs font-medium transition-colors ${
                        date === session.date
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-muted-foreground hover:border-primary hover:text-primary"
                      }`}
                    >
                      {formatDate(session.date)}
                    </button>
                  ))}
                </div>
              )}
            </section>

            {event.bookingChoices && (
              <>
                <Separator />
                <section>
                  <h3 className="mb-3 text-sm font-semibold">Choose Option</h3>
                  <div className="grid gap-2">
                    {event.bookingChoices.map((choice) => (
                      <button
                        key={choice.id}
                        type="button"
                        onClick={() => setChoiceId(choice.id)}
                        className={`rounded-lg border p-3 text-left transition-colors ${
                          choiceId === choice.id
                            ? "border-primary bg-primary/8"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        <span className="flex items-center justify-between gap-3">
                          <span className="text-sm font-semibold">
                            {choice.label}
                          </span>
                          <span className="text-sm font-bold text-primary">
                            {formatPrice(choice.price)}
                          </span>
                        </span>
                        <span className="mt-1 block text-xs text-muted-foreground">
                          {choice.timeLabel} · {choice.note}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              </>
            )}

            <Separator />
            <section>
              <h3 className="mb-3 text-sm font-semibold">Participants</h3>
              <div className="flex items-center gap-4">
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Remove one participant"
                  disabled={participants <= 1}
                  onClick={() =>
                    setParticipants((value) => Math.max(1, value - 1))
                  }
                >
                  <Minus />
                </Button>
                <span className="min-w-10 text-center">
                  <span className="block text-2xl font-bold">
                    {participants}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    {participants === 1 ? "person" : "people"}
                  </span>
                </span>
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label="Add one participant"
                  disabled={participants >= remaining || remaining === 0}
                  onClick={() =>
                    setParticipants((value) => Math.min(remaining, value + 1))
                  }
                >
                  <Plus />
                </Button>
                <span className="text-xs text-muted-foreground">
                  {remaining} spots left
                </span>
              </div>
              {availabilityLoading && (
                <p className="mt-2 text-xs text-muted-foreground">
                  Checking availability…
                </p>
              )}
              {!availabilityLoading && selectedSession && remaining === 0 && (
                <p className="mt-2 text-xs text-destructive">
                  This session is sold out.
                </p>
              )}
            </section>

            <Separator />
            <section>
              <h3 className="mb-3 text-sm font-semibold">Your Details</h3>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-xs font-medium">
                  First Name *
                  <input
                    autoComplete="given-name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className={`${inputClassName} mt-1`}
                  />
                </label>
                <label className="text-xs font-medium">
                  Last Name *
                  <input
                    autoComplete="family-name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className={`${inputClassName} mt-1`}
                  />
                </label>
                <label className="col-span-2 text-xs font-medium">
                  Email Address *
                  <input
                    type="email"
                    autoComplete="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="jane@example.com"
                    className={`${inputClassName} mt-1`}
                  />
                </label>
                <label className="col-span-2 text-xs font-medium">
                  Phone Number *
                  <input
                    type="tel"
                    autoComplete="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+27 82 XXX XXXX"
                    className={`${inputClassName} mt-1`}
                  />
                </label>
              </div>
            </section>

            <Separator />
            <section>
              <h3 className="mb-3 text-sm font-semibold">
                What&apos;s Included
              </h3>
              <ul className="space-y-2">
                {event.includes.map((item) => (
                  <li
                    key={item}
                    className="flex items-center gap-2 text-sm text-muted-foreground"
                  >
                    <Check className="size-4 shrink-0 text-primary" /> {item}
                  </li>
                ))}
              </ul>
            </section>

            <Separator />
            <section className="space-y-2.5 rounded-lg bg-muted p-4">
              <div className="flex justify-between text-sm text-muted-foreground">
                <span>
                  {formatPrice(price)} × {participants}{" "}
                  {participants === 1 ? "person" : "people"}
                </span>
                <span className="font-medium text-foreground">
                  {formatPrice(total)}
                </span>
              </div>
              <Separator />
              <div className="flex items-end justify-between">
                <span className="text-sm font-semibold">Total</span>
                <span className="text-2xl font-bold text-primary">
                  {formatPrice(total)}
                </span>
              </div>
            </section>
          </div>
        </div>

        <div className="shrink-0 border-t border-border bg-card p-5">
          {error && (
            <p
              role="alert"
              className="mb-3 text-center text-xs text-destructive"
            >
              {error}
            </p>
          )}
          <Button
            className="h-12 w-full text-base font-semibold"
            disabled={!canBook || loading || availabilityLoading}
            onClick={handleBook}
          >
            {loading ? (
              <>
                <LoaderCircle className="animate-spin" /> Redirecting to
                payment…
              </>
            ) : canBook ? (
              `Proceed to Payment · ${formatPrice(total)}`
            ) : (
              "Fill in all details to continue"
            )}
          </Button>
          <p className="mt-2.5 flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
            <ShieldCheck className="size-3" /> Secure payment via Yoco
          </p>
        </div>
      </SheetContent>
    </Sheet>
  );
}
