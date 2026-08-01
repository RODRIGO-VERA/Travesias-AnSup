"use client";
import { useMemo, useState } from "react";
import type { Booking, Panorama, Schedule, ApprovalTemplate, Equipment, EstadoReserva } from "@/types";
import StatusBadge from "@/components/StatusBadge";
import { formatCLP, formatFecha } from "@/lib/utils";
import ApprovalPreview from "@/components/admin/ApprovalPreview";

const FILTROS: (EstadoReserva | "Todas")[] = [
  "Todas",
  "Pendiente de aprobación",
  "Aprobada",
  "Confirmada",
  "Rechazada",
  "Cancelada por el cliente",
  "Actividad completada",
];

export default function ReservasAdmin({
  bookingsIniciales,
  panoramas,
  schedules,
  templates,
  equipment,
}: {
  bookingsIniciales: Booking[];
  panoramas: Panorama[];
  schedules: Schedule[];
  templates: ApprovalTemplate[];
  equipment: Equipment[];
}) {
  const [bookings, setBookings] = useState(bookingsIniciales);
  const [filtro, setFiltro] = useState<(typeof FILTROS)[number]>("Todas");
  const [seleccionada, setSeleccionada] = useState<Booking | null>(null);
  const [templateId, setTemplateId] = useState<string>(templates.find((t) => t.predeterminada)?.id || templates[0]?.id);
  const [mostrarImagen, setMostrarImagen] = useState(true);
  const [imagenUrl, setImagenUrl] = useState("");
  const [motivoRechazo, setMotivoRechazo] = useState("");
  const [loading, setLoading] = useState(false);

  const filtradas = useMemo(
    () => (filtro === "Todas" ? bookings : bookings.filter((b) => b.estado === filtro)),
    [bookings, filtro]
  );

  const template = templates.find((t) => t.id === templateId);
  const panorama = seleccionada && panoramas.find((p) => p.id === seleccionada.panorama_id);
  const schedule = seleccionada && schedules.find((s) => s.id === seleccionada.schedule_id);

  function abrir(b: Booking) {
    setSeleccionada(b);
    const def = templates.find((t) => t.predeterminada) || templates[0];
    setTemplateId(def?.id);
    setMostrarImagen(def?.mostrar_imagen ?? true);
    setImagenUrl(def?.imagen_url || "");
    setMotivoRechazo("");
  }

  async function cambiarEstado(nuevoEstado: EstadoReserva, mensajeCliente?: string) {
    if (!seleccionada) return;
    setLoading(true);
    try {
      const res = await fetch("/api/bookings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookingId: seleccionada.id,
          nuevoEstado,
          mensajeCliente,
          motivoRechazo: nuevoEstado === "Rechazada" ? motivoRechazo : undefined,
          observacionInterna: "",
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setBookings((prev) => prev.map((b) => (b.id === data.booking.id ? data.booking : b)));
      setSeleccionada(data.booking);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid lg:grid-cols-5 gap-6">
      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-wrap gap-2">
          {FILTROS.map((f) => (
            <button
              key={f}
              onClick={() => setFiltro(f)}
              className={`rounded-full px-3 py-1.5 text-xs font-medium border ${
                filtro === f ? "bg-deep-600 text-white border-deep-600" : "border-sand-300 text-deep-700"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
        <div className="card divide-y divide-sand-100 max-h-[70vh] overflow-y-auto">
          {filtradas.map((b) => (
            <button
              key={b.id}
              onClick={() => abrir(b)}
              className={`w-full text-left p-4 hover:bg-sand-50 transition ${seleccionada?.id === b.id ? "bg-teal-50" : ""}`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="font-semibold text-deep-800 text-sm">{b.codigo_reserva}</span>
                <StatusBadge estado={b.estado} />
              </div>
              <p className="text-sm text-deep-600">{b.nombre_cliente} · {b.total_personas} personas</p>
              <p className="text-xs text-stone">{panoramas.find((p) => p.id === b.panorama_id)?.nombre}</p>
            </button>
          ))}
          {filtradas.length === 0 && <p className="p-6 text-center text-sm text-stone">No hay reservas en este filtro.</p>}
        </div>
      </div>

      <div className="lg:col-span-3">
        {!seleccionada ? (
          <div className="card p-10 text-center text-stone">Selecciona una reserva para revisarla.</div>
        ) : (
          <div className="space-y-6">
            <div className="card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-semibold text-deep-800">{seleccionada.codigo_reserva}</h2>
                <StatusBadge estado={seleccionada.estado} />
              </div>
              <dl className="grid sm:grid-cols-2 gap-y-1.5 text-sm text-deep-600">
                <div><dt className="text-stone inline">Cliente: </dt><dd className="inline font-medium text-deep-800">{seleccionada.nombre_cliente}</dd></div>
                <div><dt className="text-stone inline">Teléfono: </dt><dd className="inline">{seleccionada.telefono}</dd></div>
                <div><dt className="text-stone inline">Correo: </dt><dd className="inline">{seleccionada.correo}</dd></div>
                <div><dt className="text-stone inline">Panorama: </dt><dd className="inline">{panorama?.nombre}</dd></div>
                <div><dt className="text-stone inline">Fecha: </dt><dd className="inline">{schedule && formatFecha(schedule.fecha)}</dd></div>
                <div><dt className="text-stone inline">Horario: </dt><dd className="inline">{schedule?.hora_inicio} – {schedule?.hora_termino}</dd></div>
                <div><dt className="text-stone inline">Participantes: </dt><dd className="inline">{seleccionada.adultos} adultos, {seleccionada.ninos} niños</dd></div>
                <div><dt className="text-stone inline">Valor: </dt><dd className="inline font-semibold">{formatCLP(seleccionada.valor_total)}</dd></div>
              </dl>
              {seleccionada.equipamiento.length > 0 && (
                <p className="text-sm text-deep-600">
                  <strong>Equipamiento: </strong>
                  {seleccionada.equipamiento.map((e) => equipment.find((eq) => eq.id === e.equipment_id)?.nombre).join(", ")}
                </p>
              )}
              {seleccionada.observaciones && <p className="text-sm text-deep-600"><strong>Observaciones: </strong>{seleccionada.observaciones}</p>}
            </div>

            {seleccionada.estado === "Pendiente de aprobación" || seleccionada.estado === "En revisión" ? (
              <>
                <div className="card p-6 space-y-4">
                  <h3 className="font-semibold text-deep-800">Plantilla de aprobación</h3>
                  <select value={templateId} onChange={(e) => {
                    setTemplateId(e.target.value);
                    const t = templates.find((x) => x.id === e.target.value);
                    setMostrarImagen(t?.mostrar_imagen ?? true);
                    setImagenUrl(t?.imagen_url || "");
                  }} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm">
                    {templates.map((t) => <option key={t.id} value={t.id}>{t.nombre}</option>)}
                  </select>

                  <label className="flex items-center gap-2">
                    <input type="checkbox" checked={mostrarImagen} onChange={(e) => setMostrarImagen(e.target.checked)} />
                    <span className="text-sm text-deep-700">Mostrar imagen en la aprobación</span>
                  </label>
                  {mostrarImagen && (
                    <input value={imagenUrl} onChange={(e) => setImagenUrl(e.target.value)} placeholder="/images/martin-pescador.jpg"
                      className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
                  )}

                  {template && panorama && schedule && (
                    <ApprovalPreview
                      template={{ ...template, mostrar_imagen: mostrarImagen, imagen_url: imagenUrl }}
                      booking={seleccionada}
                      panorama={panorama}
                      schedule={schedule}
                    />
                  )}
                </div>

                <div className="flex flex-wrap gap-3">
                  <button disabled={loading} onClick={() => cambiarEstado("Aprobada", template?.mensaje_inspirador)} className="btn-primary">
                    Aprobar y enviar confirmación
                  </button>
                  <button disabled={loading} onClick={() => cambiarEstado("Pendiente de información", "Necesitamos información adicional para tu reserva.")} className="btn-secondary">
                    Solicitar información
                  </button>
                </div>

                <div className="card p-6 space-y-3">
                  <h3 className="font-semibold text-deep-800">Rechazar solicitud</h3>
                  <textarea value={motivoRechazo} onChange={(e) => setMotivoRechazo(e.target.value)} rows={2}
                    placeholder="Motivo del rechazo (se mostrará al cliente)" className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
                  <button disabled={loading || !motivoRechazo} onClick={() => cambiarEstado("Rechazada")} className="text-sm font-semibold text-red-600 disabled:opacity-40">
                    Rechazar reserva
                  </button>
                </div>
              </>
            ) : (
              <div className="card p-6">
                <h3 className="font-semibold text-deep-800 mb-3">Cambiar estado</h3>
                <div className="flex flex-wrap gap-2">
                  {(["Confirmada", "Pagada", "Actividad completada", "Cancelada por el administrador", "No asistió"] as EstadoReserva[]).map((e) => (
                    <button key={e} disabled={loading} onClick={() => cambiarEstado(e)} className="btn-secondary text-xs !px-4 !py-2">
                      {e}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
