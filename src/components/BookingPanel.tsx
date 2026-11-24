"use client";

import { addDays, format, isBefore, parseISO, startOfDay } from "date-fns";
import { useActionState, useMemo, useState } from "react";
import { DayPicker, type DateRange } from "react-day-picker";
import "react-day-picker/style.css";
import {
  createBookingRequest,
  type ActionState,
} from "@/app/actions/bookings";
import { nightsBetween } from "@/lib/dates";
import { formatEuro, quoteStay } from "@/lib/pricing";

type Occupied = { start: string; end: string };

const initialState: ActionState = { ok: false, message: "" };

export function BookingPanel({
  propertyId,
  minNights,
  capacity,
  nightlyPriceCents,
  weeklyPriceCents,
  occupied,
  initialCheckIn,
  initialCheckOut,
  initialGuests,
}: {
  propertyId: string;
  minNights: number;
  capacity: number;
  nightlyPriceCents: number;
  weeklyPriceCents: number;
  occupied: Occupied[];
  initialCheckIn?: string;
  initialCheckOut?: string;
  initialGuests?: number;
}) {
  const [range, setRange] = useState<DateRange | undefined>(() => {
    if (initialCheckIn && initialCheckOut) {
      return {
        from: parseISO(initialCheckIn),
        to: parseISO(initialCheckOut),
      };
    }
    return undefined;
  });
  const [guests, setGuests] = useState(initialGuests || 2);
  const [state, formAction, pending] = useActionState(
    createBookingRequest,
    initialState,
  );

  const checkIn = range?.from ? format(range.from, "yyyy-MM-dd") : "";
  const checkOut = range?.to ? format(range.to, "yyyy-MM-dd") : "";

  const disabledMatchers = useMemo(() => {
    const today = startOfDay(new Date());
    return [
      { before: today },
      ...occupied.map((item) => ({
        from: parseISO(item.start),
        to: addDays(parseISO(item.end), -1),
      })),
    ];
  }, [occupied]);

  const nights =
    checkIn && checkOut ? nightsBetween(checkIn, checkOut) : 0;
  const quote =
    checkIn && checkOut
      ? quoteStay(checkIn, checkOut, nightlyPriceCents, weeklyPriceCents)
      : null;

  let validation = "";
  if (checkIn && checkOut) {
    if (nights < minNights) {
      validation = `Please select at least ${minNights} nights to continue your booking.`;
    } else if (guests > capacity) {
      validation = `This property sleeps up to ${capacity} guests.`;
    }
  }

  return (
    <div className="rounded-3xl bg-white p-6 shadow-xl ring-1 ring-stone-200">
      <div className="flex items-end justify-between gap-4">
        <div>
          <p className="text-sm text-stone-500">From</p>
          <p className="text-2xl font-semibold text-stone-900">
            {formatEuro(weeklyPriceCents)}
          </p>
          <p className="text-sm text-stone-500">per week · min {minNights} nights</p>
        </div>
        <p className="text-sm text-stone-500">Up to {capacity} guests</p>
      </div>

      <div className="mt-6 overflow-x-auto">
        <DayPicker
          mode="range"
          selected={range}
          onSelect={setRange}
          numberOfMonths={1}
          disabled={disabledMatchers}
          className="rdp-root mx-auto"
        />
      </div>

      <form action={formAction} className="mt-4 space-y-3">
        <input type="hidden" name="propertyId" value={propertyId} />
        <input type="hidden" name="checkIn" value={checkIn} />
        <input type="hidden" name="checkOut" value={checkOut} />

        <label className="block text-sm text-stone-600">
          Guests
          <input
            type="number"
            name="guests"
            min={1}
            max={capacity}
            value={guests}
            onChange={(e) => setGuests(Number(e.target.value))}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm text-stone-600">
          Full name
          <input
            name="guestName"
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm text-stone-600">
          Email
          <input
            type="email"
            name="guestEmail"
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm text-stone-600">
          Phone
          <input
            name="guestPhone"
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
          />
        </label>
        <label className="block text-sm text-stone-600">
          Message
          <textarea
            name="message"
            rows={3}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
          />
        </label>

        {quote && nights >= minNights ? (
          <p className="rounded-xl bg-stone-50 px-3 py-2 text-sm text-stone-700">
            {nights} nights · {formatEuro(quote.totalCents)}
          </p>
        ) : null}

        {validation ? (
          <p className="text-sm text-amber-700">{validation}</p>
        ) : null}

        {state.message ? (
          <p
            className={`text-sm ${state.ok ? "text-emerald-700" : "text-rose-700"}`}
          >
            {state.message}
          </p>
        ) : null}

        <button
          type="submit"
          disabled={
            pending ||
            !checkIn ||
            !checkOut ||
            !!validation ||
            isBefore(parseISO(checkOut || "2099-01-01"), parseISO(checkIn || "2099-01-02"))
          }
          className="w-full rounded-xl bg-stone-900 px-4 py-3 text-sm font-medium text-white hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {pending ? "Sending request…" : "Request to book"}
        </button>
        <p className="text-xs text-stone-500">
          Requests stay pending until an admin confirms. Confirmed stays then
          block the calendar for everyone.
        </p>
      </form>
    </div>
  );
}
