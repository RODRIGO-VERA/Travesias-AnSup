import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { deletePanoramaImage, updatePanoramaImageTitulo, setImagenPrincipal, addPanoramaImage } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const body = await req.json();
  try {
    const image = await addPanoramaImage(body);
    return NextResponse.json({ image });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "No se pudo agregar la foto.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const body = await req.json();
  try {
    if (body.accion === "principal") {
      await setImagenPrincipal(body.panorama_id, body.id);
    } else {
      await updatePanoramaImageTitulo(body.id, body.titulo);
    }
    return NextResponse.json({ ok: true });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "No se pudo actualizar la foto.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

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
