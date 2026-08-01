import { createClient } from "@supabase/supabase-js";

/**
 * Cliente de Supabase para uso EXCLUSIVO en el servidor (rutas API, páginas
 * server component, lib/db.ts). Usa la Service Role Key, que ignora Row
 * Level Security — por eso este archivo nunca debe importarse desde un
 * componente "use client".
 *
 * Requiere en .env.local / variables de entorno de Vercel:
 *   NEXT_PUBLIC_SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */
const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !serviceKey) {
  // No lanzamos error en el import para no romper `next build` sin .env,
  // pero cualquier consulta real fallará con un mensaje claro.
  console.warn(
    "[supabase] Faltan NEXT_PUBLIC_SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY. " +
      "Configura tus variables de entorno antes de usar la base de datos."
  );
}

export const supabaseAdmin = createClient(url || "", serviceKey || "", {
  auth: { persistSession: false },
});
