export type Weekday =
  | "lunes"
  | "martes"
  | "miercoles"
  | "jueves"
  | "viernes"
  | "sabado"
  | "domingo";

export type DaySchedule =
  | { cerrado: true }
  | { abre: string; cierra: string };

export interface Service {
  id: string;
  nombre: string;
  duracionMin: number;
  precioSoles: number;
}

export interface Business {
  slug: string;
  nombre: string;
  rubro: string;
  distrito: string;
  descripcion: string;
  telefonoWhatsapp: string;
  colorMarca: string;
  horario: Record<Weekday, DaySchedule>;
  servicios: Service[];
}

export interface Reservation {
  id: string;
  slugNegocio: string;
  servicioId: string;
  fecha: string;
  hora: string;
  nombreCliente: string;
  telefonoCliente: string;
  creadaEn: string;
}

export type NewReservation = Omit<Reservation, "id" | "creadaEn">;
