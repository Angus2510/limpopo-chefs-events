CREATE TABLE "Booking" (
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

    CONSTRAINT "Booking_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Booking_yocoCheckoutId_key" ON "Booking"("yocoCheckoutId");
CREATE UNIQUE INDEX "Booking_clientReferenceId_key" ON "Booking"("clientReferenceId");
CREATE INDEX "Booking_eventId_date_campus_status_idx" ON "Booking"("eventId", "date", "campus", "status");
CREATE INDEX "Booking_createdAt_idx" ON "Booking"("createdAt");