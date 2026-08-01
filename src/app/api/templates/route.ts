import { NextRequest, NextResponse } from "next/server";
import { getTemplates, upsertTemplate, deleteTemplate } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ templates: await getTemplates() });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const body = await req.json();
  const now = new Date().toISOString();
  const template = await upsertTemplate({
    id: body.id || `tpl_${nanoid(6)}`,
    fecha_creacion: body.fecha_creacion || now,
    fecha_actualizacion: now,
    ...body,
  });
  return NextResponse.json({ template });
}

export async function DELETE(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await req.json();
  await deleteTemplate(id);
  return NextResponse.json({ ok: true });
}
