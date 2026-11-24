import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { PropertyEditForm } from "@/components/PropertyEditForm";
import { db } from "@/db";
import { blocks, properties } from "@/db/schema";
import { getOccupiedRanges } from "@/lib/availability";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminPropertyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const { id } = await params;
  const [property] = await db
    .select()
    .from(properties)
    .where(eq(properties.id, id))
    .limit(1);

  if (!property) {
    notFound();
  }

  const propertyBlocks = await db
    .select()
    .from(blocks)
    .where(eq(blocks.propertyId, property.id));

  const occupied = await getOccupiedRanges(property.id);

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <Link href="/admin/properties" className="text-sm text-stone-500 hover:text-stone-800">
        ← Properties
      </Link>
      <h1 className="mt-4 text-3xl font-light text-stone-900">{property.name}</h1>
      <p className="mt-2 text-stone-500">{property.locationLabel}</p>
      <div className="mt-8">
        <PropertyEditForm
          property={property}
          propertyBlocks={propertyBlocks}
          occupied={occupied}
        />
      </div>
    </main>
  );
}
