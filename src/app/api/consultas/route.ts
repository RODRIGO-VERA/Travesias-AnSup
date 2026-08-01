import { NextRequest, NextResponse } from "next/server";
import { crearConsulta, getConsultas, actualizarConsulta } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const consulta = await crearConsulta(body);
  return NextResponse.json({ consulta });
}

export async function GET() {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  return NextResponse.json({ consultas: await getConsultas() });
}

export async function PATCH(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id, estado } = await req.json();
  const consulta = await actualizarConsulta(id, estado);
  return NextResponse.json({ consulta });
}
