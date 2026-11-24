import Link from "next/link";
import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { updateBookingStatus } from "@/app/actions/admin";
import { db } from "@/db";
import { bookings, properties } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatEuro } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminDashboardPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const pending = await db
    .select({
      booking: bookings,
      propertyName: properties.name,
      propertySlug: properties.slug,
    })
    .from(bookings)
    .innerJoin(properties, eq(bookings.propertyId, properties.id))
    .where(eq(bookings.status, "pending"))
    .orderBy(desc(bookings.createdAt));

  const confirmedCount = (
    await db.select().from(bookings).where(eq(bookings.status, "confirmed"))
  ).length;

  const propertyCount = (await db.select().from(properties)).length;

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-light text-stone-900">Dashboard</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">Pending requests</p>
          <p className="mt-2 text-3xl font-semibold">{pending.length}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">Confirmed stays</p>
          <p className="mt-2 text-3xl font-semibold">{confirmedCount}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 ring-1 ring-stone-200">
          <p className="text-sm text-stone-500">Properties</p>
          <p className="mt-2 text-3xl font-semibold">{propertyCount}</p>
        </div>
      </div>

      <section className="mt-10">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-medium text-stone-900">Pending requests</h2>
          <Link href="/admin/bookings" className="text-sm text-stone-600 hover:text-stone-900">
            All bookings →
          </Link>
        </div>

        {pending.length === 0 ? (
          <p className="mt-6 rounded-2xl border border-dashed border-stone-300 bg-white px-5 py-10 text-center text-stone-500">
            No pending requests right now.
          </p>
        ) : (
          <div className="mt-6 space-y-4">
            {pending.map(({ booking, propertyName }) => (
              <article
                key={booking.id}
                className="rounded-2xl bg-white p-5 ring-1 ring-stone-200"
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <h3 className="font-medium text-stone-900">{propertyName}</h3>
                    <p className="mt-1 text-sm text-stone-600">
                      {booking.checkIn} → {booking.checkOut} · {booking.guests} guests
                    </p>
                    <p className="mt-1 text-sm text-stone-600">
                      {booking.guestName} · {booking.guestEmail}
                    </p>
                    <p className="mt-2 text-sm font-medium text-stone-800">
                      {formatEuro(booking.totalCents)}
                    </p>
                    {booking.message ? (
                      <p className="mt-2 text-sm text-stone-500">{booking.message}</p>
                    ) : null}
                  </div>
                  <div className="flex gap-2">
                    <form action={updateBookingStatus}>
                      <input type="hidden" name="id" value={booking.id} />
                      <input type="hidden" name="status" value="confirmed" />
                      <button
                        type="submit"
                        className="rounded-xl bg-emerald-700 px-4 py-2 text-sm text-white hover:bg-emerald-600"
                      >
                        Confirm
                      </button>
                    </form>
                    <form action={updateBookingStatus}>
                      <input type="hidden" name="id" value={booking.id} />
                      <input type="hidden" name="status" value="declined" />
                      <button
                        type="submit"
                        className="rounded-xl border border-stone-300 px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
                      >
                        Decline
                      </button>
                    </form>
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
