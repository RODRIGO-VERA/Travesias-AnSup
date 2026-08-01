import Image from "next/image";
import type { ApprovalTemplate, Booking, Panorama, Schedule } from "@/types";
import { formatCLP, formatFecha } from "@/lib/utils";

export default function ApprovalPreview({
  template,
  booking,
  panorama,
  schedule,
}: {
  template: ApprovalTemplate;
  booking: Booking;
  panorama: Panorama;
  schedule: Schedule;
}) {
  return (
    <div className="rounded-xl2 overflow-hidden border border-sand-200">
      {template.mostrar_imagen && template.imagen_url && (
        <div className="relative h-40 w-full">
          <Image src={template.imagen_url} alt="" fill className="object-cover" />
        </div>
      )}
      <div className="p-5" style={{ backgroundColor: template.color_principal, color: "white" }}>
        <p className="text-xs uppercase tracking-wide opacity-80 mb-1">Travesías AnSup</p>
        <h3 className="font-display text-lg font-semibold">{template.titulo}</h3>
      </div>
      <div className="p-5 bg-white space-y-3 text-sm">
        <p className="text-deep-700 italic">“{template.mensaje_inspirador}”</p>
        <dl className="space-y-1 text-deep-600">
          <div className="flex justify-between"><dt>Código</dt><dd className="font-medium text-deep-800">{booking.codigo_reserva}</dd></div>
          <div className="flex justify-between"><dt>Panorama</dt><dd>{panorama.nombre}</dd></div>
          <div className="flex justify-between"><dt>Fecha</dt><dd>{formatFecha(schedule.fecha)}</dd></div>
          <div className="flex justify-between"><dt>Horario</dt><dd>{schedule.hora_inicio} – {schedule.hora_termino}</dd></div>
          <div className="flex justify-between"><dt>Participantes</dt><dd>{booking.total_personas}</dd></div>
          <div className="flex justify-between"><dt>Precio</dt><dd>{formatCLP(booking.valor_total)}</dd></div>
        </dl>
        <p className="font-semibold" style={{ color: template.color_secundario }}>{template.texto_cierre}</p>
        <div className="flex gap-2 pt-2">
          <span className="badge bg-sand-100 text-deep-700">Revisar mi reserva</span>
          <span className="badge bg-forest-100 text-forest-800">WhatsApp</span>
        </div>
      </div>
    </div>
  );
}
