import { describe, expect, it } from "vitest";
import { GET as getAvailability } from "./disponibilidad/route";
import { GET as getHealth } from "./health/route";
import { GET as getPanel } from "./panel/reservas/route";
import { POST as postReservation } from "./reservas/route";

const ADMIN_KEY = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "demo-123";

function reservationBody(overrides: Record<string, string> = {}) {
  return {
    slugNegocio: "barberia-don-lucho",
    servicioId: "corte-clasico",
    fecha: "2030-01-07",
    hora: "09:00",
    nombreCliente: "Lucía Quispe",
    telefonoCliente: "987654321",
    ...overrides,
  };
}

describe("API routes", () => {
  it("GET /api/health returns the local status", async () => {
    const response = await getHealth();
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.status).toBe("ok");
    expect(body.version).toBe("local");
    expect(body.entorno).toBe("development");
    expect(typeof body.timestamp).toBe("string");
  });

  it("GET /api/disponibilidad returns no hours on Sunday", async () => {
    const response = await getAvailability(
      new Request(
        "http://localhost/api/disponibilidad?slug=barberia-don-lucho&fecha=2030-01-06&servicio=corte-clasico",
      ),
    );
    const body = await response.json();

    expect(response.status).toBe(200);
    expect(body.horas).toEqual([]);
    expect(body.mensaje).toBe("Ese día el negocio está cerrado.");
  });

  it("GET /api/disponibilidad asks for the missing query", async () => {
    const response = await getAvailability(
      new Request("http://localhost/api/disponibilidad?slug=barberia-don-lucho"),
    );
    expect(response.status).toBe(400);
  });

  it("POST /api/reservas rejects an invalid body", async () => {
    const response = await postReservation(
      new Request("http://localhost/api/reservas", {
        method: "POST",
        body: JSON.stringify(reservationBody({ nombreCliente: "A" })),
      }),
    );
    const body = await response.json();

    expect(response.status).toBe(400);
    expect(body.mensaje).toBe("Ingresa el nombre del cliente.");
  });

  it("POST /api/reservas creates a slot and then returns 409", async () => {
    const first = await postReservation(
      new Request("http://localhost/api/reservas", {
        method: "POST",
        body: JSON.stringify(reservationBody()),
      }),
    );
    const created = await first.json();

    expect(first.status).toBe(201);
    expect(created.reserva.nombreCliente).toBe("Lucía Quispe");
    expect(first.headers.get("set-cookie")).toContain("turnolisto_cita");

    const second = await postReservation(
      new Request("http://localhost/api/reservas", {
        method: "POST",
        body: JSON.stringify(reservationBody()),
      }),
    );
    const conflict = await second.json();

    expect(second.status).toBe(409);
    expect(conflict.mensaje).toBe("Esa hora ya está reservada.");
  });

  it("GET /api/panel/reservas requires the admin header", async () => {
    const denied = await getPanel(new Request("http://localhost/api/panel/reservas"));
    expect(denied.status).toBe(401);

    const allowed = await getPanel(
      new Request("http://localhost/api/panel/reservas", {
        headers: { "x-admin-key": ADMIN_KEY },
      }),
    );
    const body = await allowed.json();

    expect(allowed.status).toBe(200);
    expect(Array.isArray(body.reservas)).toBe(true);
    expect(body.reservas.length).toBeGreaterThan(0);
  });
});
