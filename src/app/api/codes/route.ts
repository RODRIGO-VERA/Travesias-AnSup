import { NextRequest, NextResponse } from "next/server";
import { getCodes, createCode, anularCode, codeExists } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  return NextResponse.json({ codes: await getCodes() });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const body = await req.json();
  try {
    if (await codeExists(body.codigo)) {
      return NextResponse.json({ error: `El código "${body.codigo}" ya existe.` }, { status: 409 });
    }
    const code = await createCode({ ...body, creado_por: session.email });
    return NextResponse.json({ code });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "No se pudo crear el código.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id, motivo } = await req.json();
  await anularCode(id, motivo || "Anulado por el administrador.", session.email);
  return NextResponse.json({ ok: true });
}
