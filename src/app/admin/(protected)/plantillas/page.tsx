import { getTemplates } from "@/lib/db";
import PlantillasAdmin from "@/components/admin/PlantillasAdmin";

export const dynamic = "force-dynamic";

export default async function AdminPlantillasPage() {
  const templates = await getTemplates();
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-display font-semibold text-deep-800 mb-1">Plantillas de aprobación</h1>
      <p className="text-sm text-stone mb-6">
        Edita el mensaje que reciben tus clientes al aprobar su reserva. La imagen es opcional — el martín
        pescador es solo un ejemplo inicial.
      </p>
      <PlantillasAdmin plantillasIniciales={templates} />
    </div>
  );
}
