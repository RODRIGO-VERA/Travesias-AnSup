import Link from "next/link";
import { notFound } from "next/navigation";
import { getBookingByCodigo, getPanoramaById, getScheduleById } from "@/lib/db";
import StatusBadge from "@/components/StatusBadge";
import { formatCLP, formatFecha, whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function ConfirmacionPage({ params }: { params: { codigo: string } }) {
  const booking = await getBookingByCodigo(params.codigo);
  if (!booking) notFound();
  const [panorama, schedule] = await Promise.all([
    getPanoramaById(booking.panorama_id),
    getScheduleById(booking.schedule_id),
  ]);

  return (
    <div className="section py-16 max-w-xl">
      <div className="card p-8 text-center">
        <div className="mx-auto mb-4 grid h-14 w-14 place-items-center rounded-full bg-teal-100 text-teal-700">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none"><path d="M5 13l4 4L19 7" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
        </div>
        <h1 className="text-2xl font-display font-semibold text-deep-800 mb-1">¡Solicitud recibida!</h1>
        <p className="text-deep-600 mb-6">
          Tu código de reserva es <strong className="text-deep-800">{booking.codigo_reserva}</strong>. Guárdalo para
          consultar el estado de tu travesía.
        </p>

        <div className="text-left bg-sand-50 rounded-xl p-5 space-y-2 text-sm mb-6">
          <div className="flex justify-between"><span className="text-stone">Panorama</span><span className="font-medium text-deep-800">{panorama?.nombre}</span></div>
          <div className="flex justify-between"><span className="text-stone">Fecha</span><span>{schedule && formatFecha(schedule.fecha)}</span></div>
          <div className="flex justify-between"><span className="text-stone">Horario</span><span>{schedule?.hora_inicio} – {schedule?.hora_termino}</span></div>
          <div className="flex justify-between"><span className="text-stone">Participantes</span><span>{booking.total_personas}</span></div>
          <div className="flex justify-between"><span className="text-stone">Valor estimado</span><span className="font-semibold">{formatCLP(booking.valor_total)}</span></div>
          <div className="flex justify-between items-center"><span className="text-stone">Estado</span><StatusBadge estado={booking.estado} /></div>
        </div>

        <div className="flex flex-col gap-3">
          <Link href={`/mi-reserva?codigo=${booking.codigo_reserva}`} className="btn-primary w-full">Revisar mi reserva</Link>
          <a href={whatsappLink(`Hola, acabo de reservar el código ${booking.codigo_reserva} en Travesías AnSup.`)} target="_blank" rel="noreferrer" className="btn-whatsapp w-full">
            Escribir por WhatsApp
          </a>
          <Link href="/panoramas" className="text-sm text-deep-600 underline underline-offset-2">Ver otros panoramas</Link>
        </div>
      </div>
    </div>
  );
}
