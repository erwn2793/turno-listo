import Link from "next/link";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">404</p>
      <h1 className="mt-3 text-4xl font-bold text-slate-900">No encontramos esa página</h1>
      <p className="mt-4 text-lg text-slate-600">
        El enlace puede estar mal escrito o el negocio todavía no está publicado.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex rounded-full bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
      >
        Volver al inicio
      </Link>
    </main>
  );
}
