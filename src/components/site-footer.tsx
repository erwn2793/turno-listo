import Link from "next/link";

export function SiteFooter() {
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME ?? "TurnoListo";

  return (
    <footer className="mt-16 border-t border-teal-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 md:flex-row md:items-center md:justify-between">
        <p className="font-semibold text-teal-800">{siteName}</p>
        <p>Reservas para barberías, consultorios y estudios en el Perú.</p>
        <Link href="/panel" className="font-semibold text-teal-800 hover:underline">
          Ir al panel
        </Link>
      </div>
    </footer>
  );
}
