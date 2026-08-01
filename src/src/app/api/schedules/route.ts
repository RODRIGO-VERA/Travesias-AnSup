import { NextRequest, NextResponse } from "next/server";
import { getSchedules, getSchedulesByPanorama, upsertSchedule, deleteSchedule } from "@/lib/db";
import { getSessionFromCookies } from "@/lib/auth";
import { nanoid } from "nanoid";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const panoramaId = req.nextUrl.searchParams.get("panorama_id");
  const schedules = panoramaId ? await getSchedulesByPanorama(panoramaId) : await getSchedules();
  return NextResponse.json({ schedules });
}

export async function POST(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const body = await req.json();
  const schedule = await upsertSchedule({ id: body.id || `sch_${nanoid(8)}`, cupos_reservados: 0, ...body });
  return NextResponse.json({ schedule });
}

export async function DELETE(req: NextRequest) {
  const session = getSessionFromCookies();
  if (!session) return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  const { id } = await req.json();
  await deleteSchedule(id);
  return NextResponse.json({ ok: true });
}
