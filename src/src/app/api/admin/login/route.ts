import { NextRequest, NextResponse } from "next/server";
import { verifyPassword, createSessionToken, ADMIN_COOKIE_NAME } from "@/lib/auth";
import { getAdminByEmailRaw, registrarUltimoAcceso } from "@/lib/db";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  if (!email || !password) {
    return NextResponse.json({ error: "Ingresa tu correo y contraseña." }, { status: 400 });
  }

  const admin = await getAdminByEmailRaw(email);
  if (!admin || !verifyPassword(password, admin.password_hash)) {
    return NextResponse.json({ error: "Usuario o contraseña incorrectos." }, { status: 401 });
  }

  const token = createSessionToken({
    id: admin.id,
    nombre: admin.nombre,
    email: admin.correo,
    rol: admin.rol,
  });

  registrarUltimoAcceso(admin.id).catch(() => {});

  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(ADMIN_COOKIE_NAME);
  return res;
}
