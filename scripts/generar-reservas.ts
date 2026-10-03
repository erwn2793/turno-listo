import fs from "node:fs";
import path from "node:path";
import type { Business, Reservation, Weekday } from "../src/lib/types";

const TOTAL = 2000;
const businessesDir = path.join(process.cwd(), "content", "negocios");
const outputFile = path.join(process.cwd(), "content", "reservas.json");

const NAMES = [
  "María Quispe",
  "José Huamán",
  "Lucía Torres",
  "Carlos Mendoza",
  "Andrea Ríos",
  "Pedro Chávez",
  "Rosa Delgado",
  "Luis Vargas",
  "Carmen Flores",
  "Diego Salazar",
  "Fiorella Ramos",
  "Jorge Paredes",
  "Natalia Cruz",
  "Héctor Vila",
  "Sofía Navarro",
  "Miguel Ángel Soto",
  "Patricia León",
  "Renato Díaz",
  "Valeria Paredes",
  "Hugo Salazar",
];

const WEEKDAY_BY_INDEX: Weekday[] = [
  "domingo",
  "lunes",
  "martes",
  "miercoles",
  "jueves",
  "viernes",
  "sabado",
];

function random(seed: number) {
  let state = seed;
  return function next() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let value = Math.imul(state ^ (state >>> 15), 1 | state);
    value = (value + Math.imul(value ^ (value >>> 7), 61 | value)) ^ value;
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
}

function pick<T>(items: T[], roll: () => number): T {
  return items[Math.floor(roll() * items.length)];
}

function readBusinesses(): Business[] {
  return fs
    .readdirSync(businessesDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort()
    .map((fileName) =>
      JSON.parse(fs.readFileSync(path.join(businessesDir, fileName), "utf8")) as Business,
    );
}

function weekday(isoDate: string): Weekday {
  const [year, month, day] = isoDate.split("-").map(Number);
  return WEEKDAY_BY_INDEX[new Date(Date.UTC(year, month - 1, day)).getUTCDay()];
}

function eachDate(start: string, end: string): string[] {
  const dates: string[] = [];
  const cursor = new Date(`${start}T00:00:00.000Z`);
  const last = new Date(`${end}T00:00:00.000Z`);
  while (cursor <= last) {
    dates.push(cursor.toISOString().slice(0, 10));
    cursor.setUTCDate(cursor.getUTCDate() + 1);
  }
  return dates;
}

function minutes(value: string): number {
  const [hours, mins] = value.split(":").map(Number);
  return hours * 60 + mins;
}

function clock(total: number): string {
  const hours = Math.floor(total / 60);
  const mins = total % 60;
  return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
}

function main() {
  const businesses = readBusinesses();
  const roll = random(20261002);
  const dates = eachDate("2026-01-05", "2026-09-30");
  const busy = new Set<string>();
  const reservations: Reservation[] = [];
  let guard = 0;

  while (reservations.length < TOTAL) {
    guard += 1;
    if (guard > 200000) {
      throw new Error("No se pudieron generar 2000 reservas sin solaparse.");
    }

    const business = pick(businesses, roll);
    const date = pick(dates, roll);
    const schedule = business.horario[weekday(date)];
    if (!("abre" in schedule)) {
      continue;
    }

    const service = pick(business.servicios, roll);
    const opens = minutes(schedule.abre);
    const closes = minutes(schedule.cierra);
    const latest = closes - service.duracionMin;
    if (latest < opens) {
      continue;
    }

    const slotCount = Math.floor((latest - opens) / 30) + 1;
    const start = opens + Math.floor(roll() * slotCount) * 30;
    let overlaps = false;
    for (let minute = start; minute < start + service.duracionMin; minute += 1) {
      if (busy.has(`${business.slug}|${date}|${minute}`)) {
        overlaps = true;
        break;
      }
    }
    if (overlaps) {
      continue;
    }

    for (let minute = start; minute < start + service.duracionMin; minute += 1) {
      busy.add(`${business.slug}|${date}|${minute}`);
    }

    const index = reservations.length + 1;
    const phone = `9${String(Math.floor(roll() * 100000000)).padStart(8, "0")}`;
    reservations.push({
      id: `r-${String(index).padStart(4, "0")}`,
      slugNegocio: business.slug,
      servicioId: service.id,
      fecha: date,
      hora: clock(start),
      nombreCliente: pick(NAMES, roll),
      telefonoCliente: phone,
      creadaEn: `${date}T15:00:00.000Z`,
    });
  }

  reservations.sort((a, b) =>
    `${a.fecha}${a.hora}${a.slugNegocio}`.localeCompare(`${b.fecha}${b.hora}${b.slugNegocio}`),
  );

  const body = reservations.map((reservation) => JSON.stringify(reservation)).join(",\n");
  fs.writeFileSync(outputFile, `[\n${body}\n]\n`);
  console.log(`Listo: ${reservations.length} reservas en ${outputFile}`);
}

main();
