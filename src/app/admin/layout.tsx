import Link from "next/link";
import { logoutAdmin } from "@/app/actions/admin";
import { isAdminAuthenticated } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const authed = await isAdminAuthenticated();

  return (
    <div className="min-h-screen bg-stone-100">
      {authed ? (
        <header className="border-b border-stone-200 bg-white">
          <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
            <div className="flex items-center gap-6">
              <Link href="/admin" className="font-semibold tracking-wide text-stone-900">
                CS Stays Admin
              </Link>
              <nav className="flex gap-4 text-sm text-stone-600">
                <Link href="/admin" className="hover:text-stone-900">
                  Dashboard
                </Link>
                <Link href="/admin/bookings" className="hover:text-stone-900">
                  Bookings
                </Link>
                <Link href="/admin/properties" className="hover:text-stone-900">
                  Properties
                </Link>
                <Link href="/" className="hover:text-stone-900">
                  View site
                </Link>
              </nav>
            </div>
            <form action={logoutAdmin}>
              <button
                type="submit"
                className="rounded-full border border-stone-300 px-4 py-1.5 text-sm text-stone-700 hover:bg-stone-50"
              >
                Log out
              </button>
            </form>
          </div>
        </header>
      ) : null}
      {children}
    </div>
  );
}
