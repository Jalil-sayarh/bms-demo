import Link from "next/link";

export function SiteFooter() {
  return (
    <footer id="contact" className="border-t border-stone-200 bg-stone-950 text-stone-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-6 py-16 md:grid-cols-3">
        <div>
          <p className="text-lg font-semibold tracking-[0.2em]">CS STAYS</p>
          <p className="mt-4 max-w-sm text-sm text-stone-400">
            Demo booking site for luxury villa and chalet stays across the Riviera and the Alps.
          </p>
          <p className="mt-4 max-w-sm text-sm text-stone-400">
            Demo made for Thomas Tomaski by{" "}
            <a
              href="https://jalilsayarh.com/now"
              target="_blank"
              rel="noreferrer"
              className="text-stone-200 underline-offset-2 hover:underline"
            >
              Jalil Sayarh
            </a>
            .
          </p>
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-stone-500">Explore</p>
          <div className="mt-4 flex flex-col gap-2 text-sm">
            <Link href="/stays" className="hover:text-white">
              Browse stays
            </Link>
            <Link href="/stays?destination=saint-tropez" className="hover:text-white">
              Saint-Tropez
            </Link>
            <Link href="/stays?destination=courchevel" className="hover:text-white">
              Courchevel
            </Link>
          </div>
        </div>
        <div>
          <p className="text-sm font-medium uppercase tracking-wider text-stone-500">Contact</p>
          <p className="mt-4 text-sm">Monday to Friday 9:00–19:00</p>
          <p className="mt-2 text-sm">
            <a href="mailto:sayarhjalil@gmail.com" className="hover:text-white">
              sayarhjalil@gmail.com
            </a>
          </p>
          <p className="mt-2 text-sm">
            <a href="tel:+33611126846" className="hover:text-white">
              +33 6 11 12 68 46
            </a>
          </p>
          <p className="mt-3 text-sm text-stone-400">
            Portfolio:{" "}
            <a
              href="https://jalilsayarh.com/now"
              target="_blank"
              rel="noreferrer"
              className="text-stone-200 underline-offset-2 hover:underline"
            >
              jalilsayarh.com/now
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
