import { eq } from "drizzle-orm";
import { nanoid } from "nanoid";
import { db } from "../src/db";
import { bookings } from "../src/db/schema";
import {
  checkPropertyAvailability,
  searchAvailableProperties,
} from "../src/lib/availability";

async function main() {
  const checkIn = "2026-09-05";
  const checkOut = "2026-09-12";

  const before = await searchAvailableProperties({
    destinationSlug: "saint-tropez",
    checkIn,
    checkOut,
    guests: 4,
  });

  if (!before.find((p) => p.slug === "villa-lina")) {
    throw new Error("Villa Lina should be free in September");
  }

  const avail = await checkPropertyAvailability({
    propertyId: "prop-lina",
    checkIn,
    checkOut,
    guests: 4,
  });

  if (!avail.ok) {
    throw new Error(avail.reason);
  }

  const bookingId = nanoid();
  await db.insert(bookings).values({
    id: bookingId,
    propertyId: "prop-lina",
    checkIn,
    checkOut,
    guests: 4,
    guestName: "Verify Guest",
    guestEmail: "verify@example.com",
    guestPhone: "",
    message: "e2e",
    status: "pending",
    totalCents: avail.totalCents,
    createdAt: new Date().toISOString(),
  });

  const duringPending = await searchAvailableProperties({
    destinationSlug: "saint-tropez",
    checkIn,
    checkOut,
    guests: 4,
  });

  if (!duringPending.find((p) => p.slug === "villa-lina")) {
    throw new Error("Pending request must not hide Villa Lina");
  }
  console.log("OK: pending does not block inventory");

  await db
    .update(bookings)
    .set({ status: "confirmed" })
    .where(eq(bookings.id, bookingId));

  const afterConfirm = await searchAvailableProperties({
    destinationSlug: "saint-tropez",
    checkIn,
    checkOut,
    guests: 4,
  });

  if (afterConfirm.find((p) => p.slug === "villa-lina")) {
    throw new Error("Confirmed booking should hide Villa Lina");
  }
  console.log("OK: confirmed booking hides property from search");

  const overlap = await checkPropertyAvailability({
    propertyId: "prop-lina",
    checkIn,
    checkOut,
    guests: 4,
  });

  if (overlap.ok) {
    throw new Error("Overlap should be rejected");
  }
  console.log("OK:", overlap.reason);

  await db.delete(bookings).where(eq(bookings.id, bookingId));
  console.log("E2E availability flow passed.");
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
