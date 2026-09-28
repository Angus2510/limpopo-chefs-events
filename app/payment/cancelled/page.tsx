import Link from "next/link";
import { ChefHat, CircleX } from "lucide-react";

export default function PaymentCancelledPage() {
  return (
    <main className="flex min-h-screen flex-col bg-background">
      <header className="flex items-center gap-3 border-b border-border bg-white px-4 py-3">
        <ChefHat className="size-5 text-primary" aria-hidden="true" />
        <span className="text-xs font-bold uppercase tracking-widest text-primary">
          Limpopo Chefs Academy
        </span>
      </header>
      <div className="flex flex-1 items-center justify-center px-4 py-12">
        <section className="w-full max-w-md text-center">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-destructive/10">
            <CircleX className="size-10 text-destructive" />
          </div>
          <h1 className="mb-2 text-2xl font-bold">Payment Not Completed</h1>
          <p className="mb-8 text-muted-foreground">
            Your payment was cancelled or did not go through. No booking has
            been confirmed.
          </p>
          <Link
            href="/"
            className="inline-flex h-10 items-center justify-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
          >
            <ChefHat className="size-4" /> Return to events
          </Link>
        </section>
      </div>
    </main>
  );
}
