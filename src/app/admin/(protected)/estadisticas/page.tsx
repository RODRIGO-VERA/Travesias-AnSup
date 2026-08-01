import { getEstadisticas, getBookings, getPanoramas } from "@/lib/db";
import { formatCLP } from "@/lib/utils";
import EstadisticasChart from "@/components/admin/EstadisticasChart";

export const dynamic = "force-dynamic";

export default async function AdminEstadisticasPage() {
  const [stats, bookings, panoramas] = await Promise.all([getEstadisticas(), getBookings(), getPanoramas()]);

  const porPanorama = panoramas.map((p) => ({
    nombre: p.nombre,
    reservas: bookings.filter((b) => b.panorama_id === p.id).length,
  }));

  return (
    <div className="p-6 sm:p-8 space-y-8">
      <h1 className="text-2xl font-display font-semibold text-deep-800">Estadísticas</h1>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          ["Total de reservas", stats.total_reservas],
          ["Aprobadas", stats.aprobadas],
          ["Pendientes", stats.pendientes],
          ["Rechazadas", stats.rechazadas],
          ["Canceladas", stats.canceladas],
          ["Participantes totales", stats.participantes],
          ["Códigos disponibles", stats.codigos_disponibles],
          ["Ingresos estimados", formatCLP(stats.ingresos_estimados)],
        ].map(([label, value]) => (
          <div key={label as string} className="card p-5">
            <p className="text-xs text-stone uppercase tracking-wide">{label}</p>
            <p className="text-2xl font-display font-semibold text-deep-800 mt-1">{value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <h2 className="font-semibold text-deep-800 mb-4">Reservas por panorama</h2>
        <EstadisticasChart data={porPanorama} />
      </div>
    </div>
  );
}
