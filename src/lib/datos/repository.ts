import type { Business, NewReservation, Reservation } from "../types";

export interface Repository {
  listBusinesses(): Promise<Business[]>;
  getBusiness(slug: string): Promise<Business | null>;
  listReservations(): Promise<Reservation[]>;
  createReservation(input: NewReservation): Promise<Reservation>;
}
