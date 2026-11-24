"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type DestinationOption = {
  slug: string;
  name: string;
};

export function SearchBar({
  destinations,
  initial,
  compact = false,
}: {
  destinations: DestinationOption[];
  initial?: {
    destination?: string;
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  };
  compact?: boolean;
}) {
  const router = useRouter();
  const [destination, setDestination] = useState(initial?.destination || "all");
  const [checkIn, setCheckIn] = useState(initial?.checkIn || "");
  const [checkOut, setCheckOut] = useState(initial?.checkOut || "");
  const [guests, setGuests] = useState(initial?.guests || "2");

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (destination && destination !== "all") {
      params.set("destination", destination);
    }
    if (checkIn) params.set("checkIn", checkIn);
    if (checkOut) params.set("checkOut", checkOut);
    if (guests) params.set("guests", guests);
    router.push(`/stays?${params.toString()}`);
  }

  return (
    <form
      onSubmit={onSubmit}
      className={`grid gap-3 rounded-2xl bg-white/95 p-4 shadow-xl backdrop-blur md:grid-cols-[1.2fr_1fr_1fr_0.7fr_auto] ${
        compact ? "ring-1 ring-stone-200" : ""
      }`}
    >
      <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-stone-500">
        Destination
        <select
          value={destination}
          onChange={(e) => setDestination(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900"
        >
          <option value="all">All destinations</option>
          {destinations.map((dest) => (
            <option key={dest.slug} value={dest.slug}>
              {dest.name}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-stone-500">
        Check-in
        <input
          type="date"
          value={checkIn}
          onChange={(e) => setCheckIn(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-stone-500">
        Check-out
        <input
          type="date"
          value={checkOut}
          min={checkIn || undefined}
          onChange={(e) => setCheckOut(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900"
        />
      </label>
      <label className="flex flex-col gap-1 text-xs font-medium uppercase tracking-wide text-stone-500">
        Guests
        <input
          type="number"
          min={1}
          max={30}
          value={guests}
          onChange={(e) => setGuests(e.target.value)}
          className="rounded-xl border border-stone-200 bg-white px-3 py-2.5 text-sm text-stone-900"
        />
      </label>
      <button
        type="submit"
        className="rounded-xl bg-stone-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-stone-800 md:self-end"
      >
        Search
      </button>
    </form>
  );
}
