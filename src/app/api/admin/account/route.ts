import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { getAdminById, actualizarCuentaAdmin } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const admin = await getAdminById(session.id);
  return NextResponse.json({ admin });
}

export async function PATCH(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  try {
    const body = await req.json();
    const admin = await actualizarCuentaAdmin(session.id, body);
    return NextResponse.json({ admin });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "No se pudo actualizar la cuenta.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
