import { todayInLima } from "./format";
import type { Business, Reservation, Service, Weekday } from "./types";

const SLOT_STEP_MINUTES = 30;

const WEEKDAY_BY_INDEX: Weekday[] = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

export type AvailabilityInput = {
  business: Business;
  date: string;
  serviceId: string;
  reservations: Reservation[];
  now?: Date;
};

export type SlotListResult =
  | { ok: true; hours: string[]; closed: boolean }
  | { ok: false; status: 400; message: string };

export type SlotCheckResult =
  | { ok: true }
  | { ok: false; status: 400 | 409; message: string };

export function weekdayFromDate(isoDate: string): Weekday | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(isoDate);
  if (!match) {
    return null;
  }
  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const utc = new Date(Date.UTC(year, month - 1, day));
  if (
    utc.getUTCFullYear() !== year ||
    utc.getUTCMonth() !== month - 1 ||
    utc.getUTCDate() !== day
  ) {
    return null;
  }
  return WEEKDAY_BY_INDEX[utc.getUTCDay()];
}

export function parseTimeToMinutes(value: string): number | null {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match) {
    return null;
  }
  const hours = Number(match[1]);
  const minutes = Number(match[2]);
  if (hours > 23 || minutes > 59) {
    return null;
  }
  return hours * 60 + minutes;
}

export function formatMinutes(total: number): string {
  const hours = Math.floor(total / 60);
  const minutes = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function minutesInLima(now: Date): number {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "America/Lima",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  }).formatToParts(now);
  const hour = Number(parts.find((part) => part.type === "hour")?.value);
  const minute = Number(parts.find((part) => part.type === "minute")?.value);
  return hour * 60 + minute;
}

function findService(business: Business, serviceId: string): Service | null {
  return business.servicios.find((service) => service.id === serviceId) ?? null;
}

function rangesOverlap(
  startA: number,
  endA: number,
  startB: number,
  endB: number,
): boolean {
  return startA < endB && startB < endA;
}

export function listAvailableHours(input: AvailabilityInput): SlotListResult {
  const now = input.now ?? new Date();
  const weekday = weekdayFromDate(input.date);
  if (!weekday) {
    return { ok: false, status: 400, message: "La fecha no es válida." };
  }

  const service = findService(input.business, input.serviceId);
  if (!service) {
    return { ok: false, status: 400, message: "El servicio no existe." };
  }

  if (input.date < todayInLima(now)) {
    return { ok: false, status: 400, message: "Esa fecha ya pasó." };
  }

  const schedule = input.business.horario[weekday];
  if ("cerrado" in schedule && schedule.cerrado) {
    return { ok: true, hours: [], closed: true };
  }

  if (!("abre" in schedule) || !("cierra" in schedule)) {
    return { ok: true, hours: [], closed: true };
  }

  const opensAt = parseTimeToMinutes(schedule.abre);
  const closesAt = parseTimeToMinutes(schedule.cierra);
  if (opensAt === null || closesAt === null || closesAt <= opensAt) {
    return { ok: false, status: 400, message: "El horario del negocio no es válido." };
  }

  const today = todayInLima(now);
  const currentMinutes = input.date === today ? minutesInLima(now) : -1;
  const hours: string[] = [];

  for (
    let start = opensAt;
    start + service.duracionMin <= closesAt;
    start += SLOT_STEP_MINUTES
  ) {
    if (start <= currentMinutes) {
      continue;
    }
    const blocked = input.reservations.some((reservation) =>
      reservationBlocks(input.business, reservation, input.date, start, service.duracionMin),
    );
    if (!blocked) {
      hours.push(formatMinutes(start));
    }
  }

  return { ok: true, hours, closed: false };
}

function reservationBlocks(
  business: Business,
  reservation: Reservation,
  date: string,
  start: number,
  duration: number,
): boolean {
  if (reservation.slugNegocio !== business.slug || reservation.fecha !== date) {
    return false;
  }
  const reservedStart = parseTimeToMinutes(reservation.hora);
  if (reservedStart === null) {
    return false;
  }
  const reservedService = findService(business, reservation.servicioId);
  const reservedDuration = reservedService?.duracionMin ?? 30;
  return rangesOverlap(start, start + duration, reservedStart, reservedStart + reservedDuration);
}

export function checkRequestedSlot(
  input: AvailabilityInput & { time: string },
): SlotCheckResult {
  const listed = listAvailableHours(input);
  if (!listed.ok) {
    return listed;
  }
  if (listed.closed) {
    return { ok: false, status: 400, message: "Ese día el negocio está cerrado." };
  }
  if (listed.hours.includes(input.time)) {
    return { ok: true };
  }

  const withoutBookings = listAvailableHours({
    ...input,
    reservations: [],
  });
  if (withoutBookings.ok && withoutBookings.hours.includes(input.time)) {
    return { ok: false, status: 409, message: "Esa hora ya está reservada." };
  }
  return { ok: false, status: 400, message: "Esa hora no está disponible." };
}
