import fs from "node:fs";
import path from "node:path";
import type { Business, NewReservation, Reservation } from "../types";
import type { Repository } from "./repository";

const businessesDir = path.join(process.cwd(), "content", "negocios");
const reservationsFile = path.join(process.cwd(), "content", "reservas.json");

let cachedReservations: Reservation[] | null = null;

function readBusinesses(): Business[] {
  const fileNames = fs
    .readdirSync(businessesDir)
    .filter((fileName) => fileName.endsWith(".json"))
    .sort();

  return fileNames.map((fileName) => {
    const filePath = path.join(businessesDir, fileName);
    const raw = JSON.parse(fs.readFileSync(filePath, "utf8")) as Business;
    if (!raw.slug || !raw.nombre || !Array.isArray(raw.servicios)) {
      throw new Error(
        `El archivo ${fileName} no tiene la forma de un negocio.`,
      );
    }
    return raw;
  });
}

function readSeedReservations(): Reservation[] {
  if (!fs.existsSync(reservationsFile)) {
    return [];
  }
  return JSON.parse(fs.readFileSync(reservationsFile, "utf8")) as Reservation[];
}

function reservationStore(): Reservation[] {
  if (!cachedReservations) {
    cachedReservations = readSeedReservations();
  }
  return cachedReservations;
}

export const mockRepository: Repository = {
  async listBusinesses() {
    return readBusinesses();
  },

  async getBusiness(slug) {
    return readBusinesses().find((business) => business.slug === slug) ?? null;
  },

  async listReservations() {
    return reservationStore();
  },

  async createReservation(input: NewReservation) {
    const reservation: Reservation = {
      ...input,
      id: crypto.randomUUID(),
      creadaEn: new Date().toISOString(),
    };
    reservationStore().push(reservation);
    return reservation;
  },
};
