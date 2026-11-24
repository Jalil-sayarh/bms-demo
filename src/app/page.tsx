import Image from "next/image";
import Link from "next/link";
import { eq } from "drizzle-orm";
import { SiteFooter } from "@/components/SiteFooter";
import { SiteHeader } from "@/components/SiteHeader";
import { SearchBar } from "@/components/SearchBar";
import { PropertyCard } from "@/components/PropertyCard";
import { db } from "@/db";
import { destinations, properties } from "@/db/schema";

export const dynamic = "force-dynamic";

const faqs = [
  {
    q: "What is included in a Courchevel chalet rental?",
    a: "Demo chalets include housekeeping options, premium linens, and concierge support. Many also feature spas, pools, and ski rooms.",
  },
  {
    q: "When is the best time to book?",
    a: "For winter alpine weeks, autumn bookings secure the strongest inventory. Peak demand lands around Christmas and February school holidays.",
  },
  {
    q: "Do concierge services cover both destinations?",
    a: "Yes. Private chefs, transfers, wellness, and local experiences can be arranged for both Saint-Tropez and Courchevel stays.",
  },
];

export default async function HomePage() {
  const destinationRows = await db.select().from(destinations);
  const featured = await db
    .select()
    .from(properties)
    .where(eq(properties.featured, true));

  return (
    <>
      <SiteHeader />
      <main>
        <section className="relative min-h-[88vh] overflow-hidden">
          <Image
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=2000&q=80"
            alt="Luxury villa overlooking the sea"
            fill
            priority
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/55 via-black/35 to-black/70" />
          <div className="relative mx-auto flex min-h-[88vh] max-w-7xl flex-col justify-end px-6 pb-16 pt-32">
            <p className="text-sm uppercase tracking-[0.25em] text-white/80">
              Mediterranean & Alpine escapes
            </p>
            <h1 className="mt-4 max-w-3xl text-4xl font-light leading-tight text-white md:text-6xl">
              Luxury chalet rentals in Courchevel & prestige villas in Saint-Tropez
            </h1>
            <p className="mt-5 max-w-2xl text-lg text-white/85">
              Tailored stays and bespoke concierge services for an unforgettable
              Riviera and alpine experience.
            </p>
            <div className="mt-10 max-w-5xl">
              <SearchBar
                destinations={destinationRows.map((d) => ({
                  slug: d.slug,
                  name: d.name,
                }))}
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-7xl px-6 py-20">
          <div className="flex items-end justify-between gap-6">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
                Prestige & collection
              </p>
              <h2 className="mt-3 text-3xl font-light text-stone-900 md:text-4xl">
                Seasonal picks
              </h2>
            </div>
            <Link href="/stays" className="text-sm font-medium text-stone-700 hover:text-stone-900">
              View all stays →
            </Link>
          </div>
          <div className="mt-10 grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {featured.slice(0, 6).map((property) => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        </section>

        <section id="services" className="bg-white py-20">
          <div className="mx-auto max-w-7xl px-6">
            <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
              Personalised services
            </p>
            <h2 className="mt-3 max-w-2xl text-3xl font-light text-stone-900 md:text-4xl">
              From luxury essentials to exclusive experiences
            </h2>
            <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
              {[
                {
                  title: "Home services",
                  body: "Housekeeping, private chefs, and in-villa spa treatments for hotel-quality comfort.",
                },
                {
                  title: "Transport",
                  body: "Airport transfers, chauffeurs, and helicopter charters arranged around your itinerary.",
                },
                {
                  title: "Well-being & sports",
                  body: "Yoga, trainers, tennis, hikes, and water sports tailored to your stay.",
                },
                {
                  title: "Local experiences",
                  body: "Private tours, tastings, and access to events curated for each destination.",
                },
              ].map((service) => (
                <article
                  key={service.title}
                  className="rounded-3xl border border-stone-200 bg-stone-50 p-6"
                >
                  <h3 className="text-lg font-medium text-stone-900">
                    {service.title}
                  </h3>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    {service.body}
                  </p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="mx-auto grid max-w-7xl gap-10 px-6 py-20 lg:grid-cols-2">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-stone-500">
              Hosts
            </p>
            <h2 className="mt-3 text-3xl font-light text-stone-900">
              Curated by hospitality specialists
            </h2>
            <p className="mt-5 text-stone-600 leading-relaxed">
              This demo mirrors a boutique villa desk: every property is selected
              for privacy, character, and service readiness. Guests search by
              destination and dates; the back office confirms requests against a
              single availability calendar.
            </p>
          </div>
          <div className="rounded-3xl bg-stone-900 p-8 text-stone-100">
            <p className="text-sm uppercase tracking-[0.2em] text-stone-400">
              Demo office
            </p>
            <h3 className="mt-3 text-2xl font-light">Saint-Tropez desk</h3>
            <p className="mt-4 text-stone-300">
              Meet virtually or in person to shape a Riviera or alpine escape.
              Concierge, transfers, and staffing can be layered onto any confirmed
              booking.
            </p>
            <p className="mt-6 text-sm text-stone-400">
              sayarhjalil@gmail.com · +33 6 11 12 68 46 · Monday–Friday 9:00–19:00
            </p>
            <p className="mt-3 text-sm text-stone-500">
              Demo made for Thomas Tomaski by Jalil Sayarh ·{" "}
              <a
                href="https://jalilsayarh.com/now"
                target="_blank"
                rel="noreferrer"
                className="text-stone-300 underline-offset-2 hover:underline"
              >
                jalilsayarh.com/now
              </a>
            </p>
          </div>
        </section>

        <section className="border-t border-stone-200 bg-white py-20">
          <div className="mx-auto max-w-3xl px-6">
            <h2 className="text-center text-3xl font-light text-stone-900">
              Frequently asked questions
            </h2>
            <div className="mt-10 space-y-4">
              {faqs.map((item) => (
                <details
                  key={item.q}
                  className="rounded-2xl border border-stone-200 px-5 py-4"
                >
                  <summary className="cursor-pointer font-medium text-stone-900">
                    {item.q}
                  </summary>
                  <p className="mt-3 text-sm leading-relaxed text-stone-600">
                    {item.a}
                  </p>
                </details>
              ))}
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
