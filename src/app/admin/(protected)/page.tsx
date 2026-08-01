import Link from "next/link";
import { getEstadisticas, getBookings } from "@/lib/db";
import StatusBadge from "@/components/StatusBadge";
import { formatCLP } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  const [stats, allBookings] = await Promise.all([getEstadisticas(), getBookings()]);
  const recientes = allBookings.slice(0, 6);

  const cards = [
    { label: "Total de reservas", value: stats.total_reservas },
    { label: "Pendientes", value: stats.pendientes },
    { label: "Aprobadas", value: stats.aprobadas },
    { label: "Participantes", value: stats.participantes },
    { label: "Panorama más solicitado", value: stats.panorama_mas_solicitado },
    { label: "Ingresos estimados", value: formatCLP(stats.ingresos_estimados) },
  ];

  return (
    <div className="p-6 sm:p-8 space-y-8">
      <div>
        <h1 className="text-2xl font-display font-semibold text-deep-800">Panel general</h1>
        <p className="text-sm text-stone">Resumen de la actividad de Travesías AnSup.</p>
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((c) => (
          <div key={c.label} className="card p-5">
            <p className="text-xs text-stone uppercase tracking-wide">{c.label}</p>
            <p className="text-2xl font-display font-semibold text-deep-800 mt-1">{c.value}</p>
          </div>
        ))}
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-semibold text-deep-800">Reservas recientes</h2>
          <Link href="/admin/reservas" className="text-sm font-semibold text-teal-700">Ver todas →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-stone border-b border-sand-200">
                <th className="py-2 pr-4">Código</th>
                <th className="py-2 pr-4">Cliente</th>
                <th className="py-2 pr-4">Personas</th>
                <th className="py-2 pr-4">Estado</th>
              </tr>
            </thead>
            <tbody>
              {recientes.map((b) => (
                <tr key={b.id} className="border-b border-sand-100">
                  <td className="py-2 pr-4 font-medium text-deep-800">{b.codigo_reserva}</td>
                  <td className="py-2 pr-4">{b.nombre_cliente}</td>
                  <td className="py-2 pr-4">{b.total_personas}</td>
                  <td className="py-2 pr-4"><StatusBadge estado={b.estado} /></td>
                </tr>
              ))}
              {recientes.length === 0 && (
                <tr><td colSpan={4} className="py-6 text-center text-stone">Aún no hay reservas.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
