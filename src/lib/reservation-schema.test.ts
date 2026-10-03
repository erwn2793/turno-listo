import { describe, expect, it } from "vitest";
import { firstReservationError, parseReservation } from "./reservation-schema";

const valid = {
  slugNegocio: "barberia-don-lucho",
  servicioId: "corte-clasico",
  fecha: "2026-10-05",
  hora: "09:30",
  nombreCliente: "Lucía Quispe",
  telefonoCliente: "987654321",
};

describe("reservationSchema", () => {
  it("accepts a complete reservation", () => {
    const parsed = parseReservation(valid);
    expect(parsed.success).toBe(true);
  });

  it("asks for the client name", () => {
    expect(firstReservationError({ ...valid, nombreCliente: "A" })).toBe(
      "Ingresa el nombre del cliente.",
    );
  });

  it("rejects a phone that is not a Peruvian mobile", () => {
    expect(firstReservationError({ ...valid, telefonoCliente: "12345" })).toBe(
      "Ingresa un celular peruano de 9 dígitos.",
    );
  });

  it("rejects a date that is not YYYY-MM-DD", () => {
    expect(firstReservationError({ ...valid, fecha: "05/10/2026" })).toBe(
      "La fecha debe tener formato AAAA-MM-DD.",
    );
  });

  it("rejects an hour that is not HH:mm", () => {
    expect(firstReservationError({ ...valid, hora: "9:30" })).toBe(
      "La hora debe tener formato HH:mm.",
    );
  });

  it("trims the client name before checking the length", () => {
    const parsed = parseReservation({ ...valid, nombreCliente: "  Ada  " });
    expect(parsed.success).toBe(true);
    if (parsed.success) {
      expect(parsed.data.nombreCliente).toBe("Ada");
    }
  });
});
