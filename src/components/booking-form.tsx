"use client";

import { useEffect, useState } from "react";
import { formatSoles, todayInLima } from "@/lib/format";
import type { Business, Reservation, Service } from "@/lib/types";

type HoursResponse = {
  horas?: string[];
  mensaje?: string;
};

export function BookingForm({ business }: { business: Business }) {
  const [serviceId, setServiceId] = useState(business.servicios[0]?.id ?? "");
  const [date, setDate] = useState(todayInLima());
  const [hours, setHours] = useState<string[]>([]);
  const [hoursMessage, setHoursMessage] = useState<string | null>(null);
  const [hoursStatus, setHoursStatus] = useState<"loading" | "ready" | "error">("loading");
  const [selectedHour, setSelectedHour] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [confirmation, setConfirmation] = useState<Reservation | null>(null);

  const service = business.servicios.find((item) => item.id === serviceId);

  useEffect(() => {
    if (!serviceId || !date) {
      return;
    }

    const controller = new AbortController();
    const params = new URLSearchParams({
      slug: business.slug,
      fecha: date,
      servicio: serviceId,
    });

    fetch(`/api/disponibilidad?${params.toString()}`, { signal: controller.signal })
      .then(async (response) => {
        const body = (await response.json()) as HoursResponse;
        if (!response.ok) {
          throw new Error(body.mensaje ?? "No pudimos consultar el horario.");
        }
        setHours(body.horas ?? []);
        setHoursMessage(body.mensaje ?? null);
        setHoursStatus("ready");
      })
      .catch((error: unknown) => {
        if (error instanceof DOMException && error.name === "AbortError") {
          return;
        }
        setHoursStatus("error");
        setHoursMessage(
          error instanceof Error ? error.message : "No pudimos consultar el horario.",
        );
      });

    return () => controller.abort();
  }, [business.slug, date, serviceId]);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError(null);

    if (!service || !selectedHour) {
      setFormError("Elige un servicio y una hora.");
      return;
    }

    setSubmitting(true);
    try {
      const response = await fetch("/api/reservas", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          slugNegocio: business.slug,
          servicioId: service.id,
          fecha: date,
          hora: selectedHour,
          nombreCliente: name,
          telefonoCliente: phone,
        }),
      });
      const body = (await response.json()) as { reserva?: Reservation; mensaje?: string };
      if (!response.ok || !body.reserva) {
        setFormError(body.mensaje ?? "No pudimos guardar la reserva.");
        return;
      }
      setConfirmation(body.reserva);
    } catch {
      setFormError("No pudimos guardar la reserva. Intenta de nuevo.");
    } finally {
      setSubmitting(false);
    }
  }

  if (confirmation && service) {
    return (
      <section className="rounded-3xl border border-teal-100 bg-white p-6 shadow-sm">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-700">
          Listo
        </p>
        <h2 className="mt-2 text-2xl font-bold text-slate-900">Tu cita quedó reservada</h2>
        <dl className="mt-6 space-y-3 text-slate-700">
          <div>
            <dt className="text-sm text-slate-500">Servicio</dt>
            <dd className="font-semibold">{service.nombre}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Cuándo</dt>
            <dd className="font-semibold">
              {confirmation.fecha} · {confirmation.hora}
            </dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">A nombre de</dt>
            <dd className="font-semibold">{confirmation.nombreCliente}</dd>
          </div>
        </dl>
        <p className="mt-6 text-slate-600">
          Te esperamos en {business.nombre}. Si necesitas cambiar la hora, escribe por WhatsApp.
        </p>
      </section>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-8">
      <fieldset>
        <legend className="text-lg font-bold text-slate-900">1. Elige el servicio</legend>
        <div className="mt-4 grid gap-3">
          {business.servicios.map((item) => (
            <ServiceOption
              key={item.id}
              service={item}
              selected={item.id === serviceId}
              onSelect={() => {
                setServiceId(item.id);
                setSelectedHour("");
                setHoursStatus("loading");
                setHoursMessage(null);
              }}
            />
          ))}
        </div>
      </fieldset>

      <div>
        <label htmlFor="fecha" className="text-lg font-bold text-slate-900">
          2. Elige el día
        </label>
        <input
          id="fecha"
          type="date"
          min={todayInLima()}
          value={date}
          onChange={(event) => {
            setDate(event.target.value);
            setSelectedHour("");
            setHoursStatus("loading");
            setHoursMessage(null);
          }}
          className="mt-4 w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base"
          required
        />
      </div>

      <div>
        <p className="text-lg font-bold text-slate-900">3. Elige la hora</p>
        {hoursStatus === "loading" ? (
          <p className="mt-4 text-slate-600">Buscando horas libres…</p>
        ) : null}
        {hoursStatus === "error" ? (
          <p className="mt-4 text-red-700">{hoursMessage}</p>
        ) : null}
        {hoursStatus === "ready" && hours.length === 0 ? (
          <p className="mt-4 text-slate-600">
            {hoursMessage ?? "No hay horas libres ese día. Prueba con otra fecha."}
          </p>
        ) : null}
        {hoursStatus === "ready" && hours.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {hours.map((hour) => (
              <button
                key={hour}
                type="button"
                onClick={() => setSelectedHour(hour)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  selectedHour === hour
                    ? "bg-teal-700 text-white"
                    : "bg-white text-slate-800 ring-1 ring-slate-200"
                }`}
                aria-pressed={selectedHour === hour}
              >
                {hour}
              </button>
            ))}
          </div>
        ) : null}
      </div>

      <div className="grid gap-4">
        <p className="text-lg font-bold text-slate-900">4. Tus datos</p>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Nombre
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-base"
            placeholder="Lucía Quispe"
            required
          />
        </label>
        <label className="grid gap-2 text-sm font-medium text-slate-700">
          Celular
          <input
            value={phone}
            onChange={(event) => setPhone(event.target.value)}
            className="rounded-2xl border border-slate-200 px-4 py-3 text-base"
            placeholder="987654321"
            inputMode="numeric"
            required
          />
        </label>
        <p className="text-sm text-slate-500">9 dígitos, sin espacios. Ejemplo: 987654321.</p>
      </div>

      {formError ? <p className="text-red-700">{formError}</p> : null}

      <button
        type="submit"
        disabled={submitting || !selectedHour}
        className="w-full rounded-full bg-teal-700 px-5 py-3 text-base font-semibold text-white hover:bg-teal-800 disabled:cursor-not-allowed disabled:bg-slate-300"
      >
        {submitting ? "Guardando…" : "Confirmar reserva"}
      </button>
    </form>
  );
}

function ServiceOption({
  service,
  selected,
  onSelect,
}: {
  service: Service;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`flex items-center justify-between rounded-2xl border px-4 py-4 text-left ${
        selected ? "border-teal-700 bg-teal-50" : "border-slate-200 bg-white"
      }`}
    >
      <span>
        <span className="block font-semibold text-slate-900">{service.nombre}</span>
        <span className="text-sm text-slate-500">{service.duracionMin} min</span>
      </span>
      <span className="font-bold text-teal-800">{formatSoles(service.precioSoles)}</span>
    </button>
  );
}
