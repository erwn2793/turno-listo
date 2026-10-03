import { z } from "zod";

export const reservationSchema = z.object({
  slugNegocio: z.string().min(1, "Elige un negocio."),
  servicioId: z.string().min(1, "Elige un servicio."),
  fecha: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "La fecha debe tener formato AAAA-MM-DD."),
  hora: z.string().regex(/^\d{2}:\d{2}$/, "La hora debe tener formato HH:mm."),
  nombreCliente: z
    .string()
    .trim()
    .min(2, "Ingresa el nombre del cliente.")
    .max(80, "El nombre es demasiado largo."),
  telefonoCliente: z
    .string()
    .regex(/^9\d{8}$/, "Ingresa un celular peruano de 9 dígitos."),
});

export type ReservationInput = z.infer<typeof reservationSchema>;

export function parseReservation(payload: unknown) {
  return reservationSchema.safeParse(payload);
}

export function firstReservationError(payload: unknown): string | null {
  const parsed = parseReservation(payload);
  if (parsed.success) {
    return null;
  }
  return parsed.error.issues[0]?.message ?? "Revisa los datos de la reserva.";
}
