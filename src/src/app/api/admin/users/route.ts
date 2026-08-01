import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { getAdmins, crearAdmin, cambiarEstadoAdmin } from "@/lib/db";

export const runtime = "nodejs";

function requireSuperadmin() {
  const session = getSessionFromCookies();
  if (!session) return { error: NextResponse.json({ error: "No autorizado." }, { status: 401 }) };
  if (session.rol !== "Superadministrador") {
    return { error: NextResponse.json({ error: "Solo un Superadministrador puede gestionar administradores." }, { status: 403 }) };
  }
  return { session };
}

export async function GET() {
  const check = requireSuperadmin();
  if (check.error) return check.error;
  const admins = await getAdmins();
  return NextResponse.json({ admins });
}

export async function POST(req: NextRequest) {
  const check = requireSuperadmin();
  if (check.error) return check.error;
  try {
    const body = await req.json();
    const admin = await crearAdmin(body);
    return NextResponse.json({ admin });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "No se pudo crear el administrador.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const check = requireSuperadmin();
  if (check.error) return check.error;
  const { id, estado } = await req.json();
  await cambiarEstadoAdmin(id, estado);
  return NextResponse.json({ ok: true });
}
