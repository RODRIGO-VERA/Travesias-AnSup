import { NextRequest, NextResponse } from "next/server";
import { getSessionFromCookies } from "@/lib/auth";
import { getSiteSettings, updateSiteSetting } from "@/lib/db";

export const runtime = "nodejs";

// Público (sin autenticación): lo consumen los componentes de cliente
// como el botón flotante de WhatsApp.
export async function GET() {
  const settings = await getSiteSettings();
  return NextResponse.json({ settings });
}

export async function PATCH(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const body = await req.json();
  try {
    if (body.whatsapp_number !== undefined) await updateSiteSetting("whatsapp_number", body.whatsapp_number);
    if (body.instagram_url !== undefined) await updateSiteSetting("instagram_url", body.instagram_url);
    const settings = await getSiteSettings();
    return NextResponse.json({ settings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "No se pudo guardar la configuración.";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
