import { getPanoramas, getSchedules } from "@/lib/db";
import DisponibilidadAdmin from "@/components/admin/DisponibilidadAdmin";

export default async function AdminDisponibilidadPage() {
  const [panoramas, schedules] = await Promise.all([getPanoramas(), getSchedules()]);
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-display font-semibold text-deep-800 mb-1">Fechas y horarios</h1>
      <p className="text-sm text-stone mb-6">
        Crea, edita o elimina las fechas y horarios disponibles para cada panorama, junto con sus cupos.
      </p>
      <DisponibilidadAdmin panoramas={panoramas} schedulesIniciales={schedules} />
    </div>
  );
}
