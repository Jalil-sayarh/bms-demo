import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SearchBar } from "@/components/SearchBar";
import { PropertyCard } from "@/components/PropertyCard";
import { db } from "@/db";
import { destinations } from "@/db/schema";
import { searchAvailableProperties } from "@/lib/availability";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{
  destination?: string;
  checkIn?: string;
  checkOut?: string;
  guests?: string;
}>;

export default async function StaysPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const params = await searchParams;
  const destinationRows = await db.select().from(destinations);
  const guests = params.guests ? Number(params.guests) : 2;

  const results = await searchAvailableProperties({
    destinationSlug: params.destination,
    checkIn: params.checkIn,
    checkOut: params.checkOut,
    guests: Number.isFinite(guests) ? guests : 2,
  });

  const hasDates = Boolean(params.checkIn && params.checkOut);

  return (
    <>
      <div className="relative bg-stone-900 pb-10 pt-28">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-6">
          <h1 className="text-3xl font-light text-white md:text-4xl">
            Luxury villas & chalets
          </h1>
          <p className="mt-3 max-w-2xl text-stone-300">
            Filter by destination, dates, and guests. Unavailable properties are
            hidden when a date range is selected.
          </p>
          <div className="mt-8">
            <SearchBar
              compact
              destinations={destinationRows.map((d) => ({
                slug: d.slug,
                name: d.name,
              }))}
              initial={{
                destination: params.destination,
                checkIn: params.checkIn,
                checkOut: params.checkOut,
                guests: params.guests || "2",
              }}
            />
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-7xl flex-1 px-6 py-12">
        <div className="mb-8 flex items-center justify-between gap-4">
          <p className="text-sm text-stone-600">
            {results.length} stay{results.length === 1 ? "" : "s"}
            {hasDates ? " available for your dates" : ""}
          </p>
        </div>

        {results.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-stone-300 bg-white px-6 py-16 text-center">
            <p className="text-lg text-stone-800">No stays match this search.</p>
            <p className="mt-2 text-sm text-stone-500">
              Try different dates, fewer guests, or clear the destination filter.
            </p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {results.map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        )}
      </main>
      <SiteFooter />
    </>
  );
}
