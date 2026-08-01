import { getSessionFromCookies } from "@/lib/auth";
import { getAdminById } from "@/lib/db";
import CuentaAdmin from "@/components/admin/CuentaAdmin";

export const dynamic = "force-dynamic";

export default async function AdminCuentaPage() {
  const session = getSessionFromCookies();
  const admin = session ? await getAdminById(session.id) : null;

  return (
    <div className="p-6 sm:p-8 max-w-lg">
      <h1 className="text-2xl font-display font-semibold text-deep-800 mb-1">Mi cuenta</h1>
      <p className="text-sm text-stone mb-6">Cambia tu nombre, correo o contraseña de acceso al panel.</p>
      {admin && <CuentaAdmin admin={admin} />}
    </div>
  );
}
