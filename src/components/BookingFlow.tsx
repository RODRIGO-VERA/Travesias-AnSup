"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import type { Panorama, Schedule, Equipment } from "@/types";
import { formatCLP, formatFecha } from "@/lib/utils";

const STEPS = ["Fecha y horario", "Participantes", "Equipamiento", "Tus datos"];

export default function BookingFlow({
  panorama,
  schedules,
  equipment,
}: {
  panorama: Panorama;
  schedules: Schedule[];
  equipment: Equipment[];
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [scheduleId, setScheduleId] = useState<string>("");
  const [adultos, setAdultos] = useState(1);
  const [ninos, setNinos] = useState(0);
  const [edadNinos, setEdadNinos] = useState("");
  const [experiencia, setExperiencia] = useState(false);
  const [equipoSeleccionado, setEquipoSeleccionado] = useState<Record<string, boolean>>({});
  const [nombre, setNombre] = useState("");
  const [telefono, setTelefono] = useState("");
  const [correo, setCorreo] = useState("");
  const [observaciones, setObservaciones] = useState("");
  const [aceptaTerminos, setAceptaTerminos] = useState(false);
  const [autorizaContacto, setAutorizaContacto] = useState(false);
  const [codigoManual, setCodigoManual] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const schedule = schedules.find((s) => s.id === scheduleId);
  const totalPersonas = adultos + ninos;

  const fechasDisponibles = useMemo(() => {
    const set = new Map<string, Schedule[]>();
    for (const s of schedules) {
      if (!set.has(s.fecha)) set.set(s.fecha, []);
      set.get(s.fecha)!.push(s);
    }
    return Array.from(set.entries()).sort((a, b) => a[0].localeCompare(b[0]));
  }, [schedules]);

  const [fechaSeleccionada, setFechaSeleccionada] = useState<string>("");
  const horariosDelDia = fechasDisponibles.find(([f]) => f === fechaSeleccionada)?.[1] || [];

  const valorEstimado = useMemo(() => {
    if (!schedule) return 0;
    let total = totalPersonas * schedule.precio;
    for (const eq of equipment) {
      if (equipoSeleccionado[eq.id]) total += eq.precio_arriendo * totalPersonas;
    }
    return total;
  }, [schedule, totalPersonas, equipoSeleccionado, equipment]);

  async function enviarSolicitud() {
    setLoading(true);
    setError("");
    try {
      const equipamiento = Object.entries(equipoSeleccionado)
        .filter(([, v]) => v)
        .map(([equipment_id]) => ({ equipment_id, cantidad: totalPersonas }));

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          panorama_id: panorama.id,
          schedule_id: scheduleId,
          nombre_cliente: nombre,
          telefono,
          correo,
          adultos,
          ninos,
          edad_ninos: edadNinos,
          experiencia_previa: experiencia,
          equipamiento,
          observaciones,
          acepta_terminos: aceptaTerminos,
          autoriza_contacto: autorizaContacto,
          codigo_manual: codigoManual || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "No se pudo enviar la solicitud.");
      router.push(`/confirmacion/${data.booking.codigo_reserva}`);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Ocurrió un error inesperado.");
    } finally {
      setLoading(false);
    }
  }

  const puedeAvanzar = [
    !!scheduleId,
    totalPersonas > 0 && (!schedule || totalPersonas <= schedule.cupos_totales - schedule.cupos_reservados),
    true,
    !!(nombre && telefono && correo && aceptaTerminos),
  ];

  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2">
        <div className="flex items-center gap-2 mb-8 overflow-x-auto">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 shrink-0">
              <div
                className={`grid h-8 w-8 place-items-center rounded-full text-sm font-semibold ${
                  i <= step ? "bg-teal-600 text-white" : "bg-sand-200 text-stone"
                }`}
              >
                {i + 1}
              </div>
              <span className={`text-sm ${i === step ? "text-deep-800 font-semibold" : "text-stone"}`}>{s}</span>
              {i < STEPS.length - 1 && <div className="w-6 h-px bg-sand-300" />}
            </div>
          ))}
        </div>

        {step === 0 && (
          <div className="card p-6 space-y-6">
            <div>
              <h3 className="font-semibold text-deep-800 mb-3">Selecciona una fecha</h3>
              {fechasDisponibles.length === 0 && (
                <p className="text-sm text-stone">Por el momento no hay fechas disponibles para este panorama.</p>
              )}
              <div className="flex flex-wrap gap-2">
                {fechasDisponibles.map(([fecha]) => (
                  <button
                    key={fecha}
                    onClick={() => { setFechaSeleccionada(fecha); setScheduleId(""); }}
                    className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
                      fechaSeleccionada === fecha ? "bg-deep-600 text-white border-deep-600" : "border-sand-300 text-deep-700 hover:border-teal-500"
                    }`}
                  >
                    {formatFecha(fecha)}
                  </button>
                ))}
              </div>
            </div>

            {fechaSeleccionada && (
              <div>
                <h3 className="font-semibold text-deep-800 mb-3">Selecciona un horario</h3>
                <div className="grid sm:grid-cols-2 gap-3">
                  {horariosDelDia.map((h) => {
                    const cuposLibres = h.cupos_totales - h.cupos_reservados;
                    const completo = h.estado === "Completo" || h.estado === "Cerrado" || h.estado === "Suspendido";
                    return (
                      <button
                        key={h.id}
                        disabled={completo}
                        onClick={() => setScheduleId(h.id)}
                        className={`text-left rounded-xl border p-4 transition ${
                          completo
                            ? "opacity-50 cursor-not-allowed border-sand-200"
                            : scheduleId === h.id
                            ? "border-teal-600 bg-teal-50"
                            : "border-sand-300 hover:border-teal-400"
                        }`}
                      >
                        <p className="font-semibold text-deep-800">{h.hora_inicio} – {h.hora_termino}</p>
                        <p className="text-xs text-stone mt-1">{formatCLP(h.precio)} / persona</p>
                        <p className="text-xs mt-1 font-medium">
                          {completo ? "Sin cupos disponibles" : cuposLibres <= 3 ? `Últimos cupos (${cuposLibres})` : `${cuposLibres} cupos disponibles`}
                        </p>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {step === 1 && (
          <div className="card p-6 space-y-5">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-deep-700">Adultos</span>
                <input type="number" min={1} value={adultos} onChange={(e) => setAdultos(Math.max(1, +e.target.value))}
                  className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-deep-700">Niños</span>
                <input type="number" min={0} value={ninos} onChange={(e) => setNinos(Math.max(0, +e.target.value))}
                  className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5" />
              </label>
            </div>
            {ninos > 0 && (
              <label className="block">
                <span className="text-sm font-medium text-deep-700">Edad de los menores</span>
                <input value={edadNinos} onChange={(e) => setEdadNinos(e.target.value)} placeholder="Ej: 8 y 10 años"
                  className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5" />
              </label>
            )}
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={experiencia} onChange={(e) => setExperiencia(e.target.checked)} />
              <span className="text-sm text-deep-700">Tengo experiencia previa en SUP</span>
            </label>
            {schedule && totalPersonas > schedule.cupos_totales - schedule.cupos_reservados && (
              <p className="text-sm text-red-600">
                Solo quedan {schedule.cupos_totales - schedule.cupos_reservados} cupos disponibles en este horario.
              </p>
            )}
          </div>
        )}

        {step === 2 && (
          <div className="card p-6 space-y-4">
            <h3 className="font-semibold text-deep-800">¿Necesitas arrendar equipamiento para realizar la travesía?</h3>
            <div className="grid sm:grid-cols-2 gap-3">
              {equipment.map((eq) => (
                <label key={eq.id} className={`flex items-center justify-between rounded-xl border p-4 cursor-pointer ${equipoSeleccionado[eq.id] ? "border-teal-600 bg-teal-50" : "border-sand-300"}`}>
                  <div>
                    <p className="font-medium text-deep-800">{eq.nombre}</p>
                    <p className="text-xs text-stone">{eq.precio_arriendo > 0 ? `${formatCLP(eq.precio_arriendo)} / persona` : "Incluido"}</p>
                  </div>
                  <input type="checkbox" checked={!!equipoSeleccionado[eq.id]}
                    onChange={(e) => setEquipoSeleccionado((prev) => ({ ...prev, [eq.id]: e.target.checked }))} />
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2 pt-2">
              <input type="checkbox" onChange={() => setEquipoSeleccionado({})} />
              <span className="text-sm text-deep-700">Llevaré mi propio equipamiento</span>
            </label>
          </div>
        )}

        {step === 3 && (
          <div className="card p-6 space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <label className="block">
                <span className="text-sm font-medium text-deep-700">Nombre completo</span>
                <input required value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5" />
              </label>
              <label className="block">
                <span className="text-sm font-medium text-deep-700">Teléfono</span>
                <input required value={telefono} onChange={(e) => setTelefono(e.target.value)} placeholder="+56 9 ..." className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5" />
              </label>
            </div>
            <label className="block">
              <span className="text-sm font-medium text-deep-700">Correo electrónico</span>
              <input required type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-deep-700">Observaciones (opcional)</span>
              <textarea value={observaciones} onChange={(e) => setObservaciones(e.target.value)} rows={3} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5" />
            </label>
            <label className="block">
              <span className="text-sm font-medium text-deep-700">¿Tienes un código de grupo o empresa? (opcional)</span>
              <input value={codigoManual} onChange={(e) => setCodigoManual(e.target.value)} placeholder="ANSUP-GRUPO-2026" className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5" />
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" checked={aceptaTerminos} onChange={(e) => setAceptaTerminos(e.target.checked)} />
              <span className="text-sm text-deep-700">Acepto los <a href="/terminos" className="underline">términos y condiciones</a> de Travesías AnSup.</span>
            </label>
            <label className="flex items-start gap-2">
              <input type="checkbox" className="mt-1" checked={autorizaContacto} onChange={(e) => setAutorizaContacto(e.target.checked)} />
              <span className="text-sm text-deep-700">Autorizo el uso de mis datos de contacto para gestionar esta reserva.</span>
            </label>
            {error && <p className="text-sm text-red-600">{error}</p>}
          </div>
        )}

        <div className="flex justify-between mt-6">
          <button onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} className="btn-secondary disabled:opacity-40">
            Atrás
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={() => setStep((s) => s + 1)} disabled={!puedeAvanzar[step]} className="btn-primary disabled:opacity-40">
              Continuar
            </button>
          ) : (
            <button onClick={enviarSolicitud} disabled={!puedeAvanzar[3] || loading} className="btn-primary disabled:opacity-40">
              {loading ? "Enviando…" : "Enviar solicitud"}
            </button>
          )}
        </div>
      </div>

      <aside className="card p-6 h-fit sticky top-24">
        <h3 className="font-semibold text-deep-800 mb-4">Resumen de tu reserva</h3>
        <dl className="space-y-2 text-sm text-deep-600">
          <div className="flex justify-between"><dt>Panorama</dt><dd className="font-medium text-deep-800">{panorama.nombre}</dd></div>
          <div className="flex justify-between"><dt>Fecha</dt><dd>{fechaSeleccionada ? formatFecha(fechaSeleccionada) : "—"}</dd></div>
          <div className="flex justify-between"><dt>Horario</dt><dd>{schedule ? `${schedule.hora_inicio} – ${schedule.hora_termino}` : "—"}</dd></div>
          <div className="flex justify-between"><dt>Participantes</dt><dd>{totalPersonas}</dd></div>
        </dl>
        <div className="border-t border-sand-200 mt-4 pt-4 flex justify-between items-baseline">
          <span className="text-sm text-stone">Valor estimado</span>
          <span className="text-xl font-display font-semibold text-deep-800">{formatCLP(valorEstimado)}</span>
        </div>
        <p className="text-xs text-stone mt-3">
          Tu solicitud quedará como <strong>Pendiente de aprobación</strong>. Te contactaremos para confirmar.
        </p>
      </aside>
    </div>
  );
}
