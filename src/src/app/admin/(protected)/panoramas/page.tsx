import { getPanoramas } from "@/lib/db";
import PanoramasAdmin from "@/components/admin/PanoramasAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPanoramasPage() {
  const panoramas = await getPanoramas();
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-display font-semibold text-deep-800 mb-1">Panoramas</h1>
      <p className="text-sm text-stone mb-6">Crea, edita, oculta u ordena los panoramas disponibles.</p>
      <PanoramasAdmin panoramasIniciales={panoramas} />
    </div>
  );
}
