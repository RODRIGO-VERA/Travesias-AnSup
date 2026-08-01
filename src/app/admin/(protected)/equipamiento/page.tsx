import { getEquipment } from "@/lib/db";
import EquipamientoAdmin from "@/components/admin/EquipamientoAdmin";

export const dynamic = "force-dynamic";

export default async function AdminEquipamientoPage() {
  const equipo = await getEquipment();
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-display font-semibold text-deep-800 mb-1">Equipamiento</h1>
      <p className="text-sm text-stone mb-6">Controla el inventario disponible para arriendo.</p>
      <EquipamientoAdmin equipoInicial={equipo} />
    </div>
  );
}
