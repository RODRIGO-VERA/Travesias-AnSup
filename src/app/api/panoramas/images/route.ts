import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { deletePanoramaImage } from "@/lib/db";

export const runtime = "nodejs";

export async function DELETE(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await req.json();
  try {
    await deletePanoramaImage(id);
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "No se pudo eliminar la foto.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
