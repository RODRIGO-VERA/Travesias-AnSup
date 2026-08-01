import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { getGalleryImages, addGalleryImage, deleteGalleryImage } from "@/lib/db";

export const runtime = "nodejs";

export async function GET() {
  const images = await getGalleryImages();
  return NextResponse.json({ images });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const body = await req.json();
  const image = await addGalleryImage(body);
  return NextResponse.json({ image });
}

export async function DELETE(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await req.json();
  await deleteGalleryImage(id);
  return NextResponse.json({ ok: true });
}
