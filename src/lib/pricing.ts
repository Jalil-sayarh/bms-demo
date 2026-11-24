import { nightsBetween } from "./dates";

export function quoteStay(
  checkIn: string,
  checkOut: string,
  nightlyPriceCents: number,
  weeklyPriceCents: number,
): { nights: number; totalCents: number } {
  const nights = nightsBetween(checkIn, checkOut);
  if (nights <= 0) {
    return { nights: 0, totalCents: 0 };
  }

  const fullWeeks = Math.floor(nights / 7);
  const leftoverNights = nights % 7;
  const totalCents =
    fullWeeks * weeklyPriceCents + leftoverNights * nightlyPriceCents;

  return { nights, totalCents };
}

export function formatEuro(cents: number): string {
  return new Intl.NumberFormat("en-EU", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(cents / 100);
}
