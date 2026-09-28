CREATE TABLE "event_bookings" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "eventId" TEXT NOT NULL,
    "eventTitle" TEXT NOT NULL,
    "bookingChoiceId" TEXT,
    "bookingChoiceLabel" TEXT,
    "campus" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "participants" INTEGER NOT NULL,
    "amount" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'ZAR',
    "status" TEXT NOT NULL DEFAULT 'pending',
    "yocoCheckoutId" TEXT,
    "yocoPaymentId" TEXT,
    "clientReferenceId" TEXT,

    CONSTRAINT "event_bookings_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "event_bookings_yocoCheckoutId_key" ON "event_bookings"("yocoCheckoutId");
CREATE UNIQUE INDEX "event_bookings_clientReferenceId_key" ON "event_bookings"("clientReferenceId");
CREATE INDEX "event_bookings_eventId_date_campus_status_idx" ON "event_bookings"("eventId", "date", "campus", "status");
CREATE INDEX "event_bookings_createdAt_idx" ON "event_bookings"("createdAt");