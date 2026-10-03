import Link from "next/link";

export function SiteHeader() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "TurnoListo";

  return (
    <header className="sticky top-0 z-20 border-b border-teal-100 bg-white/95 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-teal-800">
          <span className="inline-flex h-9 w-9 items-center justify-center rounded-xl bg-teal-700 text-base text-white">
            T
          </span>
          {siteName}
        </Link>
        <nav className="flex items-center gap-5 text-sm font-semibold text-slate-700">
          <Link href="/" className="hover:text-teal-800">
            Negocios
          </Link>
          <Link
            href="/panel"
            className="rounded-full bg-teal-700 px-4 py-2 text-white hover:bg-teal-800"
          >
            Panel
          </Link>
        </nav>
      </div>
    </header>
  );
}
