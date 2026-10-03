import { NextResponse } from "next/server";
import { listAvailableHours } from "@/lib/availability";
import { getRepository } from "@/lib/datos";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const slug = url.searchParams.get("slug");
  const fecha = url.searchParams.get("fecha");
  const servicio = url.searchParams.get("servicio");

  if (!slug || !fecha || !servicio) {
    return NextResponse.json(
      { mensaje: "Indica el negocio, la fecha y el servicio." },
      { status: 400 },
    );
  }

  const repository = getRepository();
  const business = await repository.getBusiness(slug);
  if (!business) {
    return NextResponse.json(
      { mensaje: "No encontramos ese negocio." },
      { status: 404 },
    );
  }

  const reservations = await repository.listReservations();
  const result = listAvailableHours({
    business,
    date: fecha,
    serviceId: servicio,
    reservations,
  });

  if (!result.ok) {
    return NextResponse.json({ mensaje: result.message }, { status: result.status });
  }

  if (result.closed) {
    return NextResponse.json({
      horas: [],
      mensaje: "Ese día el negocio está cerrado.",
    });
  }

  return NextResponse.json({ horas: result.hours });
}
