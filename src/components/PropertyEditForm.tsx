"use client";

import { useActionState } from "react";
import {
  createBlock,
  updateProperty,
  type AdminActionState,
} from "@/app/actions/admin";
import type { Block, Property } from "@/db/schema";
import { deleteBlock } from "@/app/actions/admin";
import { formatEuro } from "@/lib/pricing";

const initial: AdminActionState = { ok: false, message: "" };

export function PropertyEditForm({
  property,
  propertyBlocks,
  occupied,
}: {
  property: Property;
  propertyBlocks: Block[];
  occupied: { start: string; end: string; kind: string; id: string }[];
}) {
  const [saveState, saveAction, savePending] = useActionState(
    updateProperty,
    initial,
  );
  const [blockState, blockAction, blockPending] = useActionState(
    createBlock,
    initial,
  );

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form action={saveAction} className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-stone-200">
        <h2 className="text-xl font-medium text-stone-900">Property details</h2>
        <input type="hidden" name="id" value={property.id} />
        <label className="block text-sm">
          Name
          <input
            name="name"
            defaultValue={property.name}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm">
          Location label
          <input
            name="locationLabel"
            defaultValue={property.locationLabel}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            required
          />
        </label>
        <label className="block text-sm">
          Description
          <textarea
            name="description"
            defaultValue={property.description}
            rows={5}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            required
          />
        </label>
        <div className="grid grid-cols-3 gap-3">
          <label className="block text-sm">
            Bedrooms
            <input
              type="number"
              name="bedrooms"
              defaultValue={property.bedrooms}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Bathrooms
            <input
              type="number"
              name="bathrooms"
              defaultValue={property.bathrooms}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Capacity
            <input
              type="number"
              name="capacity"
              defaultValue={property.capacity}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            />
          </label>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <label className="block text-sm">
            Nightly (cents)
            <input
              type="number"
              name="nightlyPriceCents"
              defaultValue={property.nightlyPriceCents}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Weekly (cents)
            <input
              type="number"
              name="weeklyPriceCents"
              defaultValue={property.weeklyPriceCents}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            />
          </label>
          <label className="block text-sm">
            Min nights
            <input
              type="number"
              name="minNights"
              defaultValue={property.minNights}
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            />
          </label>
        </div>
        <p className="text-xs text-stone-500">
          Current weekly: {formatEuro(property.weeklyPriceCents)}
        </p>
        <label className="block text-sm">
          Amenities (comma separated)
          <input
            name="amenities"
            defaultValue={property.amenities.join(", ")}
            className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
          />
        </label>
        <div className="flex gap-6 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="published"
              defaultChecked={property.published}
            />
            Published
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              name="featured"
              defaultChecked={property.featured}
            />
            Featured
          </label>
        </div>
        {saveState.message ? (
          <p
            className={`text-sm ${saveState.ok ? "text-emerald-700" : "text-rose-700"}`}
          >
            {saveState.message}
          </p>
        ) : null}
        <button
          type="submit"
          disabled={savePending}
          className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm text-white disabled:opacity-50"
        >
          {savePending ? "Saving…" : "Save property"}
        </button>
      </form>

      <div className="space-y-6">
        <form
          action={blockAction}
          className="space-y-4 rounded-2xl bg-white p-6 ring-1 ring-stone-200"
        >
          <h2 className="text-xl font-medium text-stone-900">Block dates</h2>
          <input type="hidden" name="propertyId" value={property.id} />
          <div className="grid grid-cols-2 gap-3">
            <label className="block text-sm">
              Start
              <input
                type="date"
                name="startDate"
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
                required
              />
            </label>
            <label className="block text-sm">
              End
              <input
                type="date"
                name="endDate"
                className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
                required
              />
            </label>
          </div>
          <label className="block text-sm">
            Reason
            <input
              name="reason"
              defaultValue="Owner stay"
              className="mt-1 w-full rounded-xl border border-stone-200 px-3 py-2"
            />
          </label>
          {blockState.message ? (
            <p
              className={`text-sm ${blockState.ok ? "text-emerald-700" : "text-rose-700"}`}
            >
              {blockState.message}
            </p>
          ) : null}
          <button
            type="submit"
            disabled={blockPending}
            className="rounded-xl bg-stone-900 px-4 py-2.5 text-sm text-white disabled:opacity-50"
          >
            {blockPending ? "Blocking…" : "Add block"}
          </button>
        </form>

        <section className="rounded-2xl bg-white p-6 ring-1 ring-stone-200">
          <h2 className="text-xl font-medium text-stone-900">Calendar occupancy</h2>
          <ul className="mt-4 space-y-3">
            {occupied.length === 0 ? (
              <li className="text-sm text-stone-500">No confirmed stays or blocks.</li>
            ) : (
              occupied.map((item) => (
                <li
                  key={`${item.kind}-${item.id}`}
                  className="flex items-center justify-between gap-3 rounded-xl bg-stone-50 px-3 py-2 text-sm"
                >
                  <span>
                    <span className="font-medium capitalize">{item.kind}</span>
                    {": "}
                    {item.start} → {item.end}
                  </span>
                  {item.kind === "block" ? (
                    <form action={deleteBlock}>
                      <input type="hidden" name="id" value={item.id} />
                      <input type="hidden" name="propertyId" value={property.id} />
                      <button type="submit" className="text-rose-700 hover:underline">
                        Remove
                      </button>
                    </form>
                  ) : null}
                </li>
              ))
            )}
          </ul>
          <p className="mt-4 text-xs text-stone-500">
            Manual blocks on file: {propertyBlocks.length}
          </p>
        </section>
      </div>
    </div>
  );
}
