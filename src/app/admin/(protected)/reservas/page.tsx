import { getBookings, getPanoramas, getSchedules, getTemplates, getEquipment } from "@/lib/db";
import ReservasAdmin from "@/components/admin/ReservasAdmin";

export const dynamic = "force-dynamic";

export default async function AdminReservasPage() {
  const [bookings, panoramas, schedules, templates, equipment] = await Promise.all([
    getBookings(),
    getPanoramas(),
    getSchedules(),
    getTemplates(),
    getEquipment(),
  ]);

  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-display font-semibold text-deep-800 mb-1">Reservas</h1>
      <p className="text-sm text-stone mb-6">Revisa, aprueba o rechaza las solicitudes recibidas.</p>
      <ReservasAdmin
        bookingsIniciales={bookings}
        panoramas={panoramas}
        schedules={schedules}
        templates={templates}
        equipment={equipment}
      />
    </div>
  );
}
