import { NextRequest, NextResponse } from "next/server";
import { crearReserva, cambiarEstadoReserva, getBookings } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!body.acepta_terminos) {
      return NextResponse.json({ error: "Debes aceptar los términos y condiciones." }, { status: 400 });
    }
    const booking = await crearReserva(body);
    return NextResponse.json({ booking });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "No se pudo crear la reserva.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

// Utilizado por el panel administrativo para listar/filtrar reservas.
export async function GET() {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  return NextResponse.json({ bookings: await getBookings() });
}

export async function PATCH(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const { bookingId, nuevoEstado, mensajeCliente, observacionInterna, motivoRechazo } = await req.json();
    const booking = await cambiarEstadoReserva(bookingId, nuevoEstado, {
      mensajeCliente,
      observacionInterna,
      motivoRechazo,
      administrador: session.email,
    });
    return NextResponse.json({ booking });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "No se pudo actualizar la reserva.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
