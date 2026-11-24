import { and, eq, inArray, ne } from "drizzle-orm";
import { db } from "@/db";
import { ensureDb } from "@/db/ensure";
import { blocks, bookings, properties } from "@/db/schema";
import { isDateRangeValid, nightsBetween, rangesOverlap } from "./dates";
import { quoteStay } from "./pricing";

export type OccupancyRange = {
  start: string;
  end: string;
  kind: "booking" | "block";
  id: string;
};

export type AvailabilityResult =
  | { ok: true; nights: number; totalCents: number }
  | { ok: false; reason: string };

export function validateStayRequest(input: {
  checkIn: string;
  checkOut: string;
  minNights: number;
  capacity: number;
  guests: number;
}): AvailabilityResult {
  if (!isDateRangeValid(input.checkIn, input.checkOut)) {
    return { ok: false, reason: "Check-out must be after check-in." };
  }

  const nights = nightsBetween(input.checkIn, input.checkOut);
  if (nights < input.minNights) {
    return {
      ok: false,
      reason: `Minimum stay is ${input.minNights} nights.`,
    };
  }

  if (input.guests < 1) {
    return { ok: false, reason: "At least one guest is required." };
  }

  if (input.guests > input.capacity) {
    return {
      ok: false,
      reason: `This property sleeps up to ${input.capacity} guests.`,
    };
  }

  return { ok: true, nights, totalCents: 0 };
}

export function isRangeFree(
  checkIn: string,
  checkOut: string,
  occupied: OccupancyRange[],
): boolean {
  return !occupied.some((range) =>
    rangesOverlap(checkIn, checkOut, range.start, range.end),
  );
}

export async function getOccupiedRanges(
  propertyId: string,
  options?: { excludeBookingId?: string },
): Promise<OccupancyRange[]> {
  await ensureDb();
  const confirmed = await db
    .select({
      id: bookings.id,
      start: bookings.checkIn,
      end: bookings.checkOut,
    })
    .from(bookings)
    .where(
      and(
        eq(bookings.propertyId, propertyId),
        eq(bookings.status, "confirmed"),
        options?.excludeBookingId
          ? ne(bookings.id, options.excludeBookingId)
          : undefined,
      ),
    );

  const propertyBlocks = await db
    .select({
      id: blocks.id,
      start: blocks.startDate,
      end: blocks.endDate,
    })
    .from(blocks)
    .where(eq(blocks.propertyId, propertyId));

  return [
    ...confirmed.map((row) => ({
      id: row.id,
      start: row.start,
      end: row.end,
      kind: "booking" as const,
    })),
    ...propertyBlocks.map((row) => ({
      id: row.id,
      start: row.start,
      end: row.end,
      kind: "block" as const,
    })),
  ];
}

export async function checkPropertyAvailability(input: {
  propertyId: string;
  checkIn: string;
  checkOut: string;
  guests: number;
  excludeBookingId?: string;
}): Promise<AvailabilityResult> {
  await ensureDb();
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, input.propertyId))
    .limit(1);

  if (!property || !property.published) {
    return { ok: false, reason: "Property not found." };
  }

  const basics = validateStayRequest({
    checkIn: input.checkIn,
    checkOut: input.checkOut,
    minNights: property.minNights,
    capacity: property.capacity,
    guests: input.guests,
  });

  if (!basics.ok) {
    return basics;
  }

  const occupied = await getOccupiedRanges(property.id, {
    excludeBookingId: input.excludeBookingId,
  });

  if (!isRangeFree(input.checkIn, input.checkOut, occupied)) {
    return {
      ok: false,
      reason: "Those dates are unavailable for this property.",
    };
  }

  const quote = quoteStay(
    input.checkIn,
    input.checkOut,
    property.nightlyPriceCents,
    property.weeklyPriceCents,
  );

  return { ok: true, nights: quote.nights, totalCents: quote.totalCents };
}

export async function searchAvailableProperties(input: {
  destinationSlug?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: number;
}) {
  await ensureDb();
  const all = await db.select().from(properties).where(eq(properties.published, true));

  const guests = input.guests ?? 1;
  let filtered = all.filter((property) => property.capacity >= guests);

  if (input.destinationSlug && input.destinationSlug !== "all") {
    const { destinations } = await import("@/db/schema");
    const destRows = await db.select().from(destinations);
    const match = destRows.find((d) => d.slug === input.destinationSlug);
    if (match) {
      filtered = filtered.filter((p) => p.destinationId === match.id);
    } else {
      filtered = [];
    }
  }

  if (input.checkIn && input.checkOut) {
    const propertyIds = filtered.map((p) => p.id);
    if (propertyIds.length === 0) {
      return [];
    }

    const confirmed = await db
      .select()
      .from(bookings)
      .where(
        and(
          inArray(bookings.propertyId, propertyIds),
          eq(bookings.status, "confirmed"),
        ),
      );

    const allBlocks = await db
      .select()
      .from(blocks)
      .where(inArray(blocks.propertyId, propertyIds));

    filtered = filtered.filter((property) => {
      if (nightsBetween(input.checkIn!, input.checkOut!) < property.minNights) {
        return false;
      }

      const occupied: OccupancyRange[] = [
        ...confirmed
          .filter((b) => b.propertyId === property.id)
          .map((b) => ({
            id: b.id,
            start: b.checkIn,
            end: b.checkOut,
            kind: "booking" as const,
          })),
        ...allBlocks
          .filter((b) => b.propertyId === property.id)
          .map((b) => ({
            id: b.id,
            start: b.startDate,
            end: b.endDate,
            kind: "block" as const,
          })),
      ];

      return isRangeFree(input.checkIn!, input.checkOut!, occupied);
    });
  }

  return filtered;
}
