import type { Metadata } from "next";
import { PanelBoard } from "@/components/panel-board";
import { getRepository } from "@/lib/datos";

export const metadata: Metadata = {
  title: "Panel",
  description: "Reservas de todos los negocios de TurnoListo.",
};

export default async function PanelPage() {
  const businesses = await getRepository().listBusinesses();

  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="text-4xl font-bold text-slate-900">Panel de reservas</h1>
      <p className="mt-3 max-w-2xl text-lg text-slate-600">
        Todas las citas de los negocios. Busca por el nombre del cliente o filtra por local.
      </p>
      <div className="mt-8">
        <PanelBoard
          businesses={businesses.map((business) => ({
            slug: business.slug,
            nombre: business.nombre,
            servicios: business.servicios.map((service) => ({
              id: service.id,
              nombre: service.nombre,
            })),
          }))}
        />
      </div>
    </main>
  );
}
