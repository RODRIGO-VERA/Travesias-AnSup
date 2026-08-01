import { NextRequest, NextResponse } from "next/server";
import { getPanoramas, upsertPanorama, deletePanorama } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth";
import { nanoid } from "nanoid";
import type { Panorama } from "@/types";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ panoramas: await getPanoramas() });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const body = await req.json();
  const panorama: Panorama = {
    id: body.id || `pan_${nanoid(8)}`,
    fecha_creacion: body.fecha_creacion || new Date().toISOString(),
    images: body.images || [],
    videos: body.videos || [],
    ...body,
  };
  const saved = await upsertPanorama(panorama);
  return NextResponse.json({ panorama: saved });
}

export async function DELETE(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await req.json();
  await deletePanorama(id);
  return NextResponse.json({ ok: true });
}
