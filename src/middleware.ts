import { NextRequest, NextResponse } from "next/server";

// Nota: la verificación criptográfica completa del JWT (jsonwebtoken usa APIs
// de Node no disponibles en el runtime Edge de los middlewares) se hace en
// cada layout/ruta protegida vía lib/auth.ts. Este middleware solo hace una
// verificación rápida de presencia de cookie para redirigir sin parpadeo.
const COOKIE_NAME = "ansup_admin_session";

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  if (pathname === "/admin/login") return NextResponse.next();
  if (!pathname.startsWith("/admin")) return NextResponse.next();

  const token = req.cookies.get(COOKIE_NAME)?.value;
  if (!token) return NextResponse.redirect(new URL("/admin/login", req.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
