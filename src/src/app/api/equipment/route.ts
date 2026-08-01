import { NextRequest, NextResponse } from "next/server";
import { getEquipment, upsertEquipment, deleteEquipment } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ equipment: await getEquipment() });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const body = await req.json();
  const eq = await upsertEquipment({ id: body.id || `eq_${nanoid(6)}`, ...body });
  return NextResponse.json({ equipment: eq });
}

export async function DELETE(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await req.json();
  await deleteEquipment(id);
  return NextResponse.json({ ok: true });
}
