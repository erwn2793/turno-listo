"use client";

export default function ErrorPage({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="mx-auto max-w-xl px-4 py-24 text-center">
      <h1 className="text-4xl font-bold text-slate-900">Algo salió mal</h1>
      <p className="mt-4 text-lg text-slate-600">
        No pudimos cargar esta vista. Intenta de nuevo en unos segundos.
      </p>
      <button
        type="button"
        onClick={() => reset()}
        className="mt-8 rounded-full bg-teal-700 px-6 py-3 font-semibold text-white hover:bg-teal-800"
      >
        Reintentar
      </button>
    </main>
  );
}
