import { createClient } from "@supabase/supabase-js";
import type { Business, NewReservation, Reservation } from "../types";
import type { Repository } from "./repository";

// Used only when DATA_MODE=supabase. Mock stays active by default.
function client() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) {
    throw new Error(
      "Supabase no está configurado. Define NEXT_PUBLIC_SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY.",
    );
  }
  return createClient(url, key);
}

export const supabaseRepository: Repository = {
  async listBusinesses() {
    const { data, error } = await client().from("negocios").select("*");
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as Business[];
  },

  async getBusiness(slug) {
    const { data, error } = await client()
      .from("negocios")
      .select("*")
      .eq("slug", slug)
      .maybeSingle();
    if (error) {
      throw new Error(error.message);
    }
    return (data as Business | null) ?? null;
  },

  async listReservations() {
    const { data, error } = await client().from("reservas").select("*");
    if (error) {
      throw new Error(error.message);
    }
    return (data ?? []) as Reservation[];
  },

  async createReservation(input: NewReservation) {
    const reservation: Reservation = {
      ...input,
      id: crypto.randomUUID(),
      creadaEn: new Date().toISOString(),
    };
    const { error } = await client().from("reservas").insert(reservation);
    if (error) {
      throw new Error(error.message);
    }
    return reservation;
  },
};
