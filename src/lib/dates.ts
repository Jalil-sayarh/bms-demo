import {
  differenceInCalendarDays,
  format,
  isBefore,
  isValid,
  parseISO,
} from "date-fns";

export function parseDate(value: string): Date {
  const date = parseISO(value);
  if (!isValid(date)) {
    throw new Error(`Invalid date: ${value}`);
  }
  return date;
}

export function toDateString(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export function nightsBetween(checkIn: string, checkOut: string): number {
  return differenceInCalendarDays(parseDate(checkOut), parseDate(checkIn));
}

/** Half-open stay intervals: [checkIn, checkOut). Checkout day is free. */
export function rangesOverlap(
  aStart: string,
  aEnd: string,
  bStart: string,
  bEnd: string,
): boolean {
  return aStart < bEnd && aEnd > bStart;
}

export function isDateRangeValid(checkIn: string, checkOut: string): boolean {
  try {
    const start = parseDate(checkIn);
    const end = parseDate(checkOut);
    return isBefore(start, end);
  } catch {
    return false;
  }
}
