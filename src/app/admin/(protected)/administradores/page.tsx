import { getSessionFromCookies } from "@/lib/auth";
import { getAdmins } from "@/lib/db";
import AdministradoresAdmin from "@/components/admin/AdministradoresAdmin";

export const dynamic = "force-dynamic";

export default async function AdminAdministradoresPage() {
  const session = getSessionFromCookies();
  const esSuperadmin = session?.rol === "Superadministrador";
  const admins = esSuperadmin ? await getAdmins() : [];

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-display font-semibold text-deep-800 mb-1">Administradores</h1>
      <p className="text-sm text-stone mb-6">Crea nuevas cuentas de acceso al panel y gestiona su estado.</p>
      {esSuperadmin ? (
        <AdministradoresAdmin adminsIniciales={admins} miId={session!.id} />
      ) : (
        <div className="card p-6 text-sm text-deep-600">
          Solo un <strong>Superadministrador</strong> puede crear o gestionar otros administradores.
        </div>
      )}
    </div>
  );
}
