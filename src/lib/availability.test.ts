import { describe, expect, it } from "vitest";
import {
  isRangeFree,
  validateStayRequest,
  type OccupancyRange,
} from "./availability";
import { nightsBetween, rangesOverlap } from "./dates";
import { quoteStay } from "./pricing";

const occupied: OccupancyRange[] = [
  {
    id: "b1",
    start: "2026-12-10",
    end: "2026-12-17",
    kind: "booking",
  },
  {
    id: "bl1",
    start: "2026-12-24",
    end: "2026-12-31",
    kind: "block",
  },
];

describe("rangesOverlap / checkout day free", () => {
  it("treats checkout day as free for the next arrival", () => {
    expect(rangesOverlap("2026-12-17", "2026-12-24", "2026-12-10", "2026-12-17")).toBe(
      false,
    );
    expect(isRangeFree("2026-12-17", "2026-12-24", occupied)).toBe(true);
  });

  it("rejects overlapping stays", () => {
    expect(rangesOverlap("2026-12-12", "2026-12-19", "2026-12-10", "2026-12-17")).toBe(
      true,
    );
    expect(isRangeFree("2026-12-12", "2026-12-19", occupied)).toBe(false);
  });

  it("rejects ranges that hit an admin block", () => {
    expect(isRangeFree("2026-12-20", "2026-12-27", occupied)).toBe(false);
  });
});

describe("validateStayRequest", () => {
  it("enforces minimum stay", () => {
    const result = validateStayRequest({
      checkIn: "2026-07-01",
      checkOut: "2026-07-05",
      minNights: 7,
      capacity: 10,
      guests: 4,
    });
    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.reason).toMatch(/Minimum stay/i);
    }
  });

  it("accepts a valid week", () => {
    const result = validateStayRequest({
      checkIn: "2026-07-01",
      checkOut: "2026-07-08",
      minNights: 7,
      capacity: 10,
      guests: 4,
    });
    expect(result).toEqual({ ok: true, nights: 7, totalCents: 0 });
  });

  it("rejects over capacity", () => {
    const result = validateStayRequest({
      checkIn: "2026-07-01",
      checkOut: "2026-07-08",
      minNights: 7,
      capacity: 6,
      guests: 8,
    });
    expect(result.ok).toBe(false);
  });
});

describe("quoteStay", () => {
  it("charges weekly rate for full weeks and nightly for leftovers", () => {
    expect(nightsBetween("2026-07-01", "2026-07-08")).toBe(7);
    expect(quoteStay("2026-07-01", "2026-07-08", 200_000, 1_200_000)).toEqual({
      nights: 7,
      totalCents: 1_200_000,
    });
    expect(quoteStay("2026-07-01", "2026-07-10", 200_000, 1_200_000)).toEqual({
      nights: 9,
      totalCents: 1_600_000,
    });
  });
});

describe("pending vs confirmed inventory", () => {
  it("only confirmed bookings and blocks occupy inventory", () => {
    // Pending requests are intentionally omitted from OccupancyRange lists
    // by getOccupiedRanges — this documents the contract for search.
    const onlyConfirmedAndBlocks = occupied.filter(
      (r) => r.kind === "booking" || r.kind === "block",
    );
    expect(onlyConfirmedAndBlocks).toHaveLength(2);
    expect(isRangeFree("2026-12-01", "2026-12-08", onlyConfirmedAndBlocks)).toBe(
      true,
    );
  });
});
