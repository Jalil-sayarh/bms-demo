import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="absolute inset-x-0 top-0 z-40">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <Link href="/" className="text-lg font-semibold tracking-[0.2em] text-white">
          CS STAYS
        </Link>
        <nav className="flex items-center gap-6 text-sm text-white/90">
          <Link href="/stays" className="hover:text-white">
            Our stays
          </Link>
          <Link href="/#services" className="hover:text-white">
            Concierge
          </Link>
          <Link href="/#contact" className="hover:text-white">
            Contact
          </Link>
          <Link
            href="/admin"
            className="rounded-full border border-white/40 px-4 py-1.5 hover:bg-white/10"
          >
            Admin
          </Link>
        </nav>
      </div>
    </header>
  );
}
