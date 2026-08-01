import { NextRequest, NextResponse } from "next/server";
import { getBookingByCodigo, getHistoryForBooking, getPanoramaById, getScheduleById } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { codigo, contacto } = await req.json();
  if (!codigo || !contacto) {
    return NextResponse.json({ error: "Ingresa tu código y tu teléfono o correo." }, { status: 400 });
  }
  const booking = await getBookingByCodigo(codigo);
  if (!booking) {
    return NextResponse.json({ error: "No encontramos una reserva con ese código." }, { status: 404 });
  }
  // Sección 31: nunca permitir consultar solo con el código.
  const contactoNormalizado = contacto.trim().toLowerCase();
  const coincide =
    booking.telefono.replace(/\s/g, "") === contacto.replace(/\s/g, "") ||
    booking.correo.toLowerCase() === contactoNormalizado;
  if (!coincide) {
    return NextResponse.json({ error: "Los datos no coinciden con la reserva." }, { status: 403 });
  }

  const [panorama, schedule, historial] = await Promise.all([
    getPanoramaById(booking.panorama_id),
    getScheduleById(booking.schedule_id),
    getHistoryForBooking(booking.id),
  ]);

  return NextResponse.json({ booking, panorama, schedule, historial });
}
