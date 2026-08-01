import { getNotices } from "@/lib/db";
import AvisosAdmin from "@/components/admin/AvisosAdmin";

export const dynamic = "force-dynamic";

export default async function AdminAvisosPage() {
  const avisos = await getNotices();
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-display font-semibold text-deep-800 mb-1">Avisos</h1>
      <p className="text-sm text-stone mb-6">Publica novedades, promociones o suspensiones visibles en la página de inicio.</p>
      <AvisosAdmin avisosIniciales={avisos} />
    </div>
  );
}
