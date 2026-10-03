import { NextResponse } from "next/server";
import { getRepository } from "@/lib/datos";

export async function GET(request: Request) {
  const expected = process.env.NEXT_PUBLIC_ADMIN_KEY ?? "demo-123";
  const provided = request.headers.get("x-admin-key");
  if (!provided || provided !== expected) {
    return NextResponse.json({ mensaje: "No autorizado" }, { status: 401 });
  }

  const reservas = await getRepository().listReservations();
  return NextResponse.json({ reservas });
}
