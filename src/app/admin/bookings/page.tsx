import { desc, eq } from "drizzle-orm";
import { redirect } from "next/navigation";
import { updateBookingStatus } from "@/app/actions/admin";
import { db } from "@/db";
import { bookings, properties } from "@/db/schema";
import { isAdminAuthenticated } from "@/lib/auth";
import { formatEuro } from "@/lib/pricing";

export const dynamic = "force-dynamic";

export default async function AdminBookingsPage() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }

  const rows = await db
    .select({
      booking: bookings,
      propertyName: properties.name,
    })
    .from(bookings)
    .innerJoin(properties, eq(bookings.propertyId, properties.id))
    .orderBy(desc(bookings.createdAt));

  return (
    <main className="mx-auto max-w-6xl px-6 py-10">
      <h1 className="text-3xl font-light text-stone-900">Bookings</h1>
      <div className="mt-8 overflow-x-auto rounded-2xl bg-white ring-1 ring-stone-200">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b border-stone-200 bg-stone-50 text-stone-500">
            <tr>
              <th className="px-4 py-3 font-medium">Property</th>
              <th className="px-4 py-3 font-medium">Guest</th>
              <th className="px-4 py-3 font-medium">Dates</th>
              <th className="px-4 py-3 font-medium">Total</th>
              <th className="px-4 py-3 font-medium">Status</th>
              <th className="px-4 py-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ booking, propertyName }) => (
              <tr key={booking.id} className="border-b border-stone-100">
                <td className="px-4 py-3 text-stone-900">{propertyName}</td>
                <td className="px-4 py-3">
                  <div>{booking.guestName}</div>
                  <div className="text-stone-500">{booking.guestEmail}</div>
                </td>
                <td className="px-4 py-3">
                  {booking.checkIn} → {booking.checkOut}
                  <div className="text-stone-500">{booking.guests} guests</div>
                </td>
                <td className="px-4 py-3">{formatEuro(booking.totalCents)}</td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                      booking.status === "confirmed"
                        ? "bg-emerald-100 text-emerald-800"
                        : booking.status === "declined"
                          ? "bg-rose-100 text-rose-800"
                          : "bg-amber-100 text-amber-800"
                    }`}
                  >
                    {booking.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    {booking.status !== "confirmed" ? (
                      <form action={updateBookingStatus}>
                        <input type="hidden" name="id" value={booking.id} />
                        <input type="hidden" name="status" value="confirmed" />
                        <button
                          type="submit"
                          className="rounded-lg bg-emerald-700 px-3 py-1.5 text-xs text-white"
                        >
                          Confirm
                        </button>
                      </form>
                    ) : null}
                    {booking.status !== "declined" ? (
                      <form action={updateBookingStatus}>
                        <input type="hidden" name="id" value={booking.id} />
                        <input type="hidden" name="status" value="declined" />
                        <button
                          type="submit"
                          className="rounded-lg border border-stone-300 px-3 py-1.5 text-xs"
                        >
                          Decline
                        </button>
                      </form>
                    ) : null}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
