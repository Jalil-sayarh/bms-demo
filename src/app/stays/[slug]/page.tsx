import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { eq } from "drizzle-orm";
import { BookingPanel } from "@/components/BookingPanel";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { db } from "@/db";
import { destinations, properties } from "@/db/schema";
import { getOccupiedRanges } from "@/lib/availability";
import { formatEuro } from "@/lib/pricing";

export const dynamic = "force-dynamic";

type PageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{
    checkIn?: string;
    checkOut?: string;
    guests?: string;
  }>;
};

export default async function PropertyPage({ params, searchParams }: PageProps) {
  const { slug } = await params;
  const query = await searchParams;

  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.slug, slug))
    .limit(1);

  if (!property || !property.published) {
    notFound();
  }

  const [destination] = await db
    .select()
    .from(destinations)
    .where(eq(destinations.id, property.destinationId))
    .limit(1);

  const occupied = await getOccupiedRanges(property.id);

  return (
    <>
      <div className="bg-stone-900 pb-8 pt-28">
        <SiteHeader />
        <div className="mx-auto max-w-7xl px-6">
          <Link href="/stays" className="text-sm text-stone-300 hover:text-white">
            ← Back to stays
          </Link>
          <h1 className="mt-4 text-3xl font-light text-white md:text-5xl">
            {property.name}
          </h1>
          <p className="mt-2 text-stone-300">
            {property.locationLabel}
            {destination ? ` · ${destination.region}` : ""}
          </p>
        </div>
      </div>

      <main className="mx-auto grid max-w-7xl gap-10 px-6 py-10 lg:grid-cols-[1.4fr_0.9fr]">
        <div className="space-y-8">
          <div className="grid gap-3 md:grid-cols-2">
            {property.images.map((src, index) => (
              <div
                key={src}
                className={`relative overflow-hidden rounded-3xl ${
                  index === 0 ? "md:col-span-2 aspect-[16/9]" : "aspect-[4/3]"
                }`}
              >
                <Image
                  src={src}
                  alt={`${property.name} photo ${index + 1}`}
                  fill
                  className="object-cover"
                  sizes="(max-width: 1024px) 100vw, 60vw"
                  priority={index === 0}
                />
              </div>
            ))}
          </div>

          <section className="rounded-3xl bg-white p-8 ring-1 ring-stone-200">
            <div className="flex flex-wrap gap-4 text-sm uppercase tracking-wide text-stone-500">
              <span>{property.bedrooms} bedrooms</span>
              <span>{property.bathrooms} bathrooms</span>
              <span>{property.capacity} travelers</span>
              <span>From {formatEuro(property.weeklyPriceCents)} / week</span>
            </div>
            <h2 className="mt-6 text-2xl font-light text-stone-900">Description</h2>
            <p className="mt-4 leading-relaxed text-stone-600">
              {property.description}
            </p>
          </section>

          <section className="rounded-3xl bg-white p-8 ring-1 ring-stone-200">
            <h2 className="text-2xl font-light text-stone-900">Amenities</h2>
            <div className="mt-5 flex flex-wrap gap-2">
              {property.amenities.map((item) => (
                <span
                  key={item}
                  className="rounded-full bg-stone-100 px-3 py-1.5 text-sm text-stone-700"
                >
                  {item}
                </span>
              ))}
            </div>
          </section>

          <section className="rounded-3xl bg-white p-8 ring-1 ring-stone-200">
            <h2 className="text-2xl font-light text-stone-900">Concierge included</h2>
            <p className="mt-4 text-stone-600">
              Concierge coordination, housekeeping options, and arrival support
              can be arranged with every confirmed stay on this demo.
            </p>
          </section>
        </div>

        <div className="lg:sticky lg:top-8 lg:self-start">
          <BookingPanel
            propertyId={property.id}
            minNights={property.minNights}
            capacity={property.capacity}
            nightlyPriceCents={property.nightlyPriceCents}
            weeklyPriceCents={property.weeklyPriceCents}
            occupied={occupied.map((item) => ({
              start: item.start,
              end: item.end,
            }))}
            initialCheckIn={query.checkIn}
            initialCheckOut={query.checkOut}
            initialGuests={query.guests ? Number(query.guests) : undefined}
          />
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
