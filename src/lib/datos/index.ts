import { mockRepository } from "./mock-repository";
import type { Repository } from "./repository";
import { supabaseRepository } from "./supabase-repository";

export function getRepository(): Repository {
  const mode = process.env.DATA_MODE ?? "mock";
  if (mode === "supabase") {
    return supabaseRepository;
  }
  return mockRepository;
}

export type { Repository } from "./repository";
