import { describe, expect, it } from "vitest";
import { checkRequestedSlot, listAvailableHours } from "./availability";
import type { Business, Reservation } from "./types";

const NOW = new Date("2026-10-01T15:00:00.000Z");

function business(): Business {
  return {
    slug: "barberia-demo",
    nombre: "Demo",
    rubro: "Barbería",
    distrito: "Surquillo",
    descripcion: "Local de prueba",
    telefonoWhatsapp: "51911111111",
    colorMarca: "#0f766e",
    horario: {
      lunes: { abre: "09:00", cierra: "13:00" },
      martes: { abre: "09:00", cierra: "13:00" },
      miercoles: { abre: "09:00", cierra: "13:00" },
      jueves: { abre: "09:00", cierra: "13:00" },
      viernes: { abre: "09:00", cierra: "13:00" },
      sabado: { abre: "09:00", cierra: "12:00" },
      domingo: { cerrado: true },
    },
    servicios: [
      { id: "corte", nombre: "Corte", duracionMin: 30, precioSoles: 25 },
      { id: "largo", nombre: "Tratamiento", duracionMin: 90, precioSoles: 80 },
    ],
  };
}

function reservation(partial: Partial<Reservation>): Reservation {
  return {
    id: "r-1",
    slugNegocio: "barberia-demo",
    servicioId: "corte",
    fecha: "2026-10-05",
    hora: "10:00",
    nombreCliente: "Ada",
    telefonoCliente: "987654321",
    creadaEn: "2026-10-01T15:00:00.000Z",
    ...partial,
  };
}

describe("listAvailableHours", () => {
  it("returns no hours on a closed day", () => {
    const result = listAvailableHours({
      business: business(),
      date: "2026-10-04",
      serviceId: "corte",
      reservations: [],
      now: NOW,
    });

    expect(result).toEqual({ ok: true, hours: [], closed: true });
  });

  it("lists slots that finish at or before closing time", () => {
    const result = listAvailableHours({
      business: business(),
      date: "2026-10-05",
      serviceId: "corte",
      reservations: [],
      now: NOW,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hours[0]).toBe("09:00");
      expect(result.hours).toContain("12:30");
      expect(result.hours).not.toContain("13:00");
    }
  });

  it("drops an occupied hour and keeps the next free slot", () => {
    const result = listAvailableHours({
      business: business(),
      date: "2026-10-05",
      serviceId: "corte",
      reservations: [reservation({ hora: "10:00", servicioId: "corte" })],
      now: NOW,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hours).not.toContain("10:00");
      expect(result.hours).toContain("10:30");
    }
  });

  it("rejects a service that would end after closing", () => {
    const result = listAvailableHours({
      business: business(),
      date: "2026-10-03",
      serviceId: "largo",
      reservations: [],
      now: NOW,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hours).toContain("10:30");
      expect(result.hours).not.toContain("11:00");
    }
  });

  it("blocks later starts that overlap a longer reservation", () => {
    const result = listAvailableHours({
      business: business(),
      date: "2026-10-05",
      serviceId: "corte",
      reservations: [reservation({ hora: "10:00", servicioId: "largo" })],
      now: NOW,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hours).not.toContain("10:00");
      expect(result.hours).not.toContain("10:30");
      expect(result.hours).not.toContain("11:00");
      expect(result.hours).toContain("11:30");
    }
  });

  it("ignores reservations from another day", () => {
    const result = listAvailableHours({
      business: business(),
      date: "2026-10-05",
      serviceId: "corte",
      reservations: [reservation({ fecha: "2026-10-06", hora: "09:00" })],
      now: NOW,
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hours).toContain("09:00");
    }
  });

  it("hides hours that already passed today", () => {
    const result = listAvailableHours({
      business: business(),
      date: "2026-10-05",
      serviceId: "corte",
      reservations: [],
      now: new Date("2026-10-05T15:15:00.000Z"),
    });

    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.hours).not.toContain("09:00");
      expect(result.hours).not.toContain("10:00");
      expect(result.hours).toContain("10:30");
    }
  });

  it("returns an error for an unknown service", () => {
    const result = listAvailableHours({
      business: business(),
      date: "2026-10-05",
      serviceId: "no-existe",
      reservations: [],
      now: NOW,
    });

    expect(result).toEqual({
      ok: false,
      status: 400,
      message: "El servicio no existe.",
    });
  });
});

describe("checkRequestedSlot", () => {
  it("accepts a free slot and rejects the same hour with 409", () => {
    const open = checkRequestedSlot({
      business: business(),
      date: "2026-10-05",
      serviceId: "corte",
      time: "09:30",
      reservations: [],
      now: NOW,
    });
    const taken = checkRequestedSlot({
      business: business(),
      date: "2026-10-05",
      serviceId: "corte",
      time: "10:00",
      reservations: [reservation({ hora: "10:00" })],
      now: NOW,
    });

    expect(open).toEqual({ ok: true });
    expect(taken).toEqual({
      ok: false,
      status: 409,
      message: "Esa hora ya está reservada.",
    });
  });

  it("rejects a closed day and a time outside the grid", () => {
    const closed = checkRequestedSlot({
      business: business(),
      date: "2026-10-04",
      serviceId: "corte",
      time: "10:00",
      reservations: [],
      now: NOW,
    });
    const offGrid = checkRequestedSlot({
      business: business(),
      date: "2026-10-05",
      serviceId: "corte",
      time: "10:15",
      reservations: [],
      now: NOW,
    });

    expect(closed.ok).toBe(false);
    if (!closed.ok) {
      expect(closed.status).toBe(400);
    }
    expect(offGrid).toEqual({
      ok: false,
      status: 400,
      message: "Esa hora no está disponible.",
    });
  });
});
