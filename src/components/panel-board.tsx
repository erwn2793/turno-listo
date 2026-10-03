"use client";

import _ from "lodash";
import moment from "moment";
import "moment/locale/es";
import { useEffect, useState } from "react";
import type { Reservation, Service } from "@/lib/types";

moment.locale("es");

export type PanelBusiness = {
  slug: string;
  nombre: string;
  servicios: Pick<Service, "id" | "nombre">[];
};

export function PanelBoard({ businesses }: { businesses: PanelBusiness[] }) {
  const [reservations, setReservations] = useState<Reservation[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");
  const [query, setQuery] = useState("");
  const [businessSlug, setBusinessSlug] = useState("todos");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  useEffect(() => {
    const adminKey = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "demo-123";
    let active = true;

    fetch("/api/panel/reservas", {
      headers: { "x-admin-key": adminKey },
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("No autorizado");
        }
        const body = (await response.json()) as { reservas: Reservation[] };
        if (active) {
          setReservations(body.reservas);
          setStatus("ready");
        }
      })
      .catch(() => {
        if (active) {
          setStatus("error");
        }
      });

    return () => {
      active = false;
    };
  }, []);

  const filtered = _.orderBy(
    reservations.filter((reservation) => {
      const matchesName = reservation.nombreCliente
        .toLowerCase()
        .includes(query.trim().toLowerCase());
      const matchesBusiness =
        businessSlug === "todos" || reservation.slugNegocio === businessSlug;
      return matchesName && matchesBusiness;
    }),
    ["fecha", "hora"],
    ["desc", "desc"],
  );

  return (
    <section className="space-y-6">
      <div className="grid gap-3 md:grid-cols-[1fr_16rem]">
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Buscar por cliente
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Nombre del cliente"
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-normal"
          />
        </label>
        <label className="grid gap-2 text-sm font-semibold text-slate-700">
          Negocio
          <select
            value={businessSlug}
            onChange={(event) => setBusinessSlug(event.target.value)}
            className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base font-normal"
          >
            <option value="todos">Todos</option>
            {businesses.map((business) => (
              <option key={business.slug} value={business.slug}>
                {business.nombre}
              </option>
            ))}
          </select>
        </label>
      </div>

      {status === "loading" ? <p className="text-slate-600">Cargando reservas…</p> : null}
      {status === "error" ? (
        <p className="text-red-700">No se pudo abrir el panel. Revisa la clave de acceso.</p>
      ) : null}

      {status === "ready" ? (
        <>
          <p className="text-sm font-semibold text-slate-600">
            {filtered.length.toLocaleString("es-PE")} citas
          </p>
          {filtered.length === 0 ? (
            <p className="rounded-2xl bg-white p-6 text-slate-600">
              Ningún cliente coincide con esa búsqueda.
            </p>
          ) : (
            <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white">
              <table className="min-w-full text-left text-sm">
                <thead className="bg-teal-50 text-slate-700">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Cliente</th>
                    <th className="px-4 py-3 font-semibold">Celular</th>
                    <th className="px-4 py-3 font-semibold">Negocio</th>
                    <th className="px-4 py-3 font-semibold">Servicio</th>
                    <th className="px-4 py-3 font-semibold">Fecha</th>
                    <th className="px-4 py-3 font-semibold">Hora</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((reservation) => (
                    <ReservationRow
                      key={reservation.id}
                      reservation={reservation}
                      businessName={
                        businesses.find((business) => business.slug === reservation.slugNegocio)
                          ?.nombre ?? reservation.slugNegocio
                      }
                      serviceName={serviceLabel(businesses, reservation)}
                      selected={selectedId === reservation.id}
                      onSelect={(id) => setSelectedId(id)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      ) : null}
    </section>
  );
}

function serviceLabel(businesses: PanelBusiness[], reservation: Reservation): string {
  const business = businesses.find((item) => item.slug === reservation.slugNegocio);
  return (
    business?.servicios.find((service) => service.id === reservation.servicioId)?.nombre ??
    reservation.servicioId
  );
}

function ReservationRow({
  reservation,
  businessName,
  serviceName,
  selected,
  onSelect,
}: {
  reservation: Reservation;
  businessName: string;
  serviceName: string;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const when = moment(reservation.fecha, "YYYY-MM-DD").format("D MMM YYYY");

  return (
    <tr
      onClick={() => onSelect(reservation.id)}
      className={selected ? "bg-teal-50" : "border-t border-slate-100 bg-white"}
    >
      <td className="px-4 py-3 font-medium text-slate-900">{reservation.nombreCliente}</td>
      <td className="px-4 py-3 text-slate-600">{reservation.telefonoCliente}</td>
      <td className="px-4 py-3 text-slate-700">{businessName}</td>
      <td className="px-4 py-3 text-slate-700">{serviceName}</td>
      <td className="px-4 py-3 text-slate-700">{when}</td>
      <td className="px-4 py-3 text-slate-700">{reservation.hora}</td>
    </tr>
  );
}
