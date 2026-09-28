import Image from "next/image";
import {
  ArrowUpRight,
  ChefHat,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EventBooking } from "@/components/event-booking";
import { EVENTS } from "@/lib/events";

const whatsappLink =
  "https://wa.me/27660086821?text=Hi%2C%20I%27d%20like%20to%20enquire%20about%20an%20LCA%20event.";

export default function EventsPage() {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-50 border-b border-border bg-white">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <a
            href="#top"
            className="flex items-center gap-3"
            aria-label="Limpopo Chefs Academy home"
          >
            <Image
              src="/logo.png"
              alt="Limpopo Chefs Academy"
              width={180}
              height={70}
              className="h-10 w-auto shrink-0 object-contain"
              priority
            />
            <span className="leading-none">
              <span className="block text-[11px] font-bold uppercase tracking-widest text-primary">
                Limpopo Chefs Academy
              </span>
              <span className="mt-0.5 block text-[10px] text-muted-foreground">
                Events & Functions
              </span>
            </span>
          </a>

          <nav
            className="hidden items-center gap-6 text-sm md:flex"
            aria-label="Main navigation"
          >
            <a
              href="#events"
              className="border-b-2 border-primary pb-0.5 font-semibold text-primary"
            >
              Events
            </a>
            <a
              href="#about"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              About
            </a>
            <a
              href="#contact"
              className="text-muted-foreground transition-colors hover:text-primary"
            >
              Contact
            </a>
            <Button
              size="sm"
              nativeButton={false}
              render={
                <a href={whatsappLink} target="_blank" rel="noreferrer" />
              }
            >
              Enquire <ArrowUpRight aria-hidden="true" />
            </Button>
          </nav>

          <div className="flex shrink-0 items-center gap-1.5 rounded-full bg-muted px-3 py-1.5 text-xs text-muted-foreground">
            <MapPin className="size-3" aria-hidden="true" />
            <span className="hidden sm:inline">Mokopane · Polokwane</span>
          </div>
        </div>
      </header>

      <section id="top" className="w-full border-b border-border bg-white">
        <div className="relative h-48 w-full overflow-hidden sm:h-64 md:h-80 lg:h-104">
          <Image
            src="/events-banner.jpeg"
            alt="Limpopo Chefs Academy culinary workshops and short courses"
            fill
            priority
            className="object-contain object-center"
            sizes="100vw"
          />
        </div>
      </section>

      <main
        id="events"
        className="mx-auto w-full max-w-7xl flex-1 px-4 py-10 sm:px-6 sm:py-12 lg:px-8"
      >
        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="mb-1 text-xs font-bold uppercase tracking-widest text-primary">
              Cook, learn, connect
            </p>
            <h1 className="text-2xl font-bold tracking-tight text-foreground md:text-3xl">
              Events & Functions
            </h1>
            <p className="mt-1 max-w-2xl text-sm text-muted-foreground sm:text-base">
              Join us in the kitchen for hands-on classes, competitions, and
              memorable meals.
            </p>
          </div>
          <Badge variant="secondary" className="w-fit rounded-full px-3 py-1">
            Mokopane · Polokwane
          </Badge>
        </section>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {EVENTS.map((event) => (
            <Card
              key={event.title}
              className="group overflow-hidden rounded-xl bg-card transition-shadow duration-300 hover:shadow-lg"
            >
              <div className="relative h-48 shrink-0 overflow-hidden bg-muted">
                <Image
                  src={event.image}
                  alt={event.title}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                  sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                />
              </div>
              <div className="flex flex-1 flex-col px-4 pt-4">
                <Badge variant="secondary" className="mb-3 w-fit">
                  {event.category}
                </Badge>
                <h2 className="text-lg font-bold leading-snug text-foreground transition-colors group-hover:text-primary">
                  {event.title}
                </h2>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">
                  {event.description}
                </p>
                <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <MapPin
                    className="size-3 shrink-0 text-primary"
                    aria-hidden="true"
                  />
                  {event.campuses.join(" · ")}
                </p>
              </div>
              <div className="mt-4 flex items-center justify-between border-t border-border px-4 py-3">
                <span className="text-sm text-muted-foreground">
                  {event.sessions.length
                    ? "See available dates"
                    : "Next date to be announced"}
                </span>
                <EventBooking event={event} />
              </div>
            </Card>
          ))}
        </div>
      </main>

      <footer id="contact" className="mt-8 bg-foreground text-white">
        <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
            <div id="about">
              <div className="mb-3 flex items-center gap-2">
                <ChefHat className="size-4 opacity-70" aria-hidden="true" />
                <span className="text-xs font-bold uppercase tracking-widest text-white/70">
                  Limpopo Chefs Academy
                </span>
              </div>
              <p className="max-w-sm text-sm leading-relaxed text-white/55">
                Culinary events, functions, workshops, and gatherings hosted by
                the leading culinary school in Limpopo.
              </p>
            </div>
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/60">
                Mokopane Campus
              </h2>
              <div className="space-y-2 text-sm text-white/55">
                <p className="flex items-center gap-2">
                  <Phone className="size-3" aria-hidden="true" /> 015 491 1226
                </p>
                <p className="flex items-center gap-2">
                  <MessageCircle className="size-3" aria-hidden="true" /> 066
                  008 6821
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-3 shrink-0" aria-hidden="true" /> 82
                  Rabe Street, Mokopane 0600
                </p>
              </div>
            </div>
            <div>
              <h2 className="mb-3 text-xs font-bold uppercase tracking-widest text-white/60">
                Polokwane Campus
              </h2>
              <div className="space-y-2 text-sm text-white/55">
                <p className="flex items-center gap-2">
                  <Phone className="size-3" aria-hidden="true" /> 015 292 0102
                </p>
                <p className="flex items-center gap-2">
                  <MessageCircle className="size-3" aria-hidden="true" /> 066
                  245 0458
                </p>
                <p className="flex items-center gap-2">
                  <MapPin className="size-3 shrink-0" aria-hidden="true" /> 22
                  Hans van Rensburg Street, Polokwane 0699
                </p>
              </div>
            </div>
          </div>
          <div className="mt-8 border-t border-white/10 pt-5 text-center text-xs text-white/35">
            © {new Date().getFullYear()} Limpopo Chefs Academy · All Rights
            Reserved
          </div>
        </div>
      </footer>
    </div>
  );
}
