import Link from "next/link";
import { eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { db } from "@/db";
import { destinations, properties } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatEuro } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminPropertiesPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const rows = await db
    .select({
      property: properties,
      destinationName: destinations.name,
    })
    .from(properties)
    .innerJoin(destinations, eq(properties.destinationId, destinations.id));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-light text-stone-900">Properties</h1>
      <div className="mt-8 grid gap-4">
        {rows.map(({ property, destinationName }) => (
          <Link
            key={property.id}
            href={`/admin/properties/${property.id}`}
            className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-white p-5 ring-1 ring-stone-200 hover:ring-stone-400"
          >
            <div>
              <h2 className="font-medium text-stone-900">{property.name}</h2>
              <p className="mt-1 text-sm text-stone-500">
                {destinationName} · {property.locationLabel}
              </p>
            </div>
            <div className="text-right text-sm text-stone-600">
              <p>{formatEuro(property.weeklyPriceCents)} / week</p>
              <p className="mt-1">
                {property.published ? "Published" : "Hidden"}
                {property.featured ? " · Featured" : ""}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
