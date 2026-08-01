import { NextRequest, NextResponse } from "next/server";
import { getNotices, upsertNotice, deleteNotice } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth";

export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ notices: await getNotices() });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const body = await req.json();
  const notice = await upsertNotice(body);
  return NextResponse.json({ notice });
}

export async function DELETE(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await req.json();
  await deleteNotice(id);
  return NextResponse.json({ ok: true });
}
