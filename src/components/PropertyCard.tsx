import Image from "next/image";
import Link from "next/link";
import type { Property } from "@/db/schema";
import { formatEuro } from "@/lib/pricing";

export function PropertyCard({ property }: { property: Property }) {
  return (
    <Link
      href={`/stays/${property.slug}`}
      className="group overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-stone-200 transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={property.images[0]}
          alt={property.name}
          fill
          className="object-cover transition duration-500 group-hover:scale-105"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {property.featured ? (
          <span className="absolute left-3 top-3 rounded-full bg-white/90 px-3 py-1 text-xs font-medium tracking-wide text-stone-800">
            Seasonal pick
          </span>
        ) : null}
      </div>
      <div className="space-y-3 p-5">
        <div>
          <h3 className="text-lg font-medium text-stone-900">{property.name}</h3>
          <p className="text-sm text-stone-500">{property.locationLabel}</p>
        </div>
        <div className="flex flex-wrap gap-3 text-xs uppercase tracking-wide text-stone-500">
          <span>{property.bedrooms} bed</span>
          <span>{property.bathrooms} bath</span>
          <span>{property.capacity} guests</span>
        </div>
        <p className="text-sm text-stone-700">
          From {formatEuro(property.weeklyPriceCents)} / week
        </p>
      </div>
    </Link>
  );
}
