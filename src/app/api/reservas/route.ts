import { serialize } from "cookie";
import { NextResponse } from "next/server";
import { checkRequestedSlot } from "@/lib/availability";
import { getRepository } from "@/lib/datos";
import { parseReservation } from "@/lib/reservation-schema";

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { mensaje: "El cuerpo de la reserva no es válido." },
      { status: 400 },
    );
  }

  const parsed = parseReservation(payload);
  if (!parsed.success) {
    const mensaje =
      parsed.error.issues[0]?.message ?? "Revisa los datos de la reserva.";
    return NextResponse.json({ mensaje }, { status: 400 });
  }

  const repository = getRepository();
  const business = await repository.getBusiness(parsed.data.slugNegocio);
  if (!business) {
    return NextResponse.json(
      { mensaje: "No encontramos ese negocio." },
      { status: 400 },
    );
  }

  const reservations = await repository.listReservations();
  const slot = checkRequestedSlot({
    business,
    date: parsed.data.fecha,
    serviceId: parsed.data.servicioId,
    time: parsed.data.hora,
    reservations,
  });

  if (!slot.ok) {
    return NextResponse.json({ mensaje: slot.message }, { status: slot.status });
  }

  const reserva = await repository.createReservation(parsed.data);
  const setCookie = serialize("turnolisto_cita", reserva.id, {
    path: "/",
    httpOnly: true,
    sameSite: "lax",
  });

  return NextResponse.json(
    { reserva },
    { status: 201, headers: { "Set-Cookie": setCookie } },
  );
}
