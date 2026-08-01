"use client";
import { useMemo, useState } from "react";
import type { Panorama, Schedule, EstadoHorario } from "@/types";
import { formatCLP, formatFecha } from "@/lib/utils";

const ESTADOS: EstadoHorario[] = ["Disponible", "Cupos limitados", "Completo", "Cerrado", "Suspendido", "Reprogramado", "Finalizado"];

function vacio(panoramaId: string, precioBase: number): Omit<Schedule, "id"> {
  return {
    panorama_id: panoramaId,
    fecha: new Date().toISOString().slice(0, 10),
    hora_inicio: "10:00",
    hora_termino: "12:00",
    cupos_totales: 10,
    cupos_reservados: 0,
    precio: precioBase,
    estado: "Disponible",
    observaciones: "",
    punto_encuentro: "",
    guia: "",
    estado_climatico: "",
  };
}

export default function DisponibilidadAdmin({ panoramas, schedulesIniciales }: { panoramas: Panorama[]; schedulesIniciales: Schedule[] }) {
  const [schedules, setSchedules] = useState(schedulesIniciales);
  const [panoramaId, setPanoramaId] = useState(panoramas[0]?.id || "");
  const panorama = panoramas.find((p) => p.id === panoramaId);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Schedule, "id">>(vacio(panoramaId, panorama?.precio || 20000));
  const [loading, setLoading] = useState(false);

  const delPanorama = useMemo(
    () => schedules.filter((s) => s.panorama_id === panoramaId).sort((a, b) => (a.fecha + a.hora_inicio).localeCompare(b.fecha + b.hora_inicio)),
    [schedules, panoramaId]
  );

  function elegirPanorama(id: string) {
    setPanoramaId(id);
    setEditId(null);
    const p = panoramas.find((x) => x.id === id);
    setForm(vacio(id, p?.precio || 20000));
  }

  function editar(s: Schedule) {
    setEditId(s.id);
    const { id, ...rest } = s;
    void id;
    setForm(rest);
  }

  function nuevo() {
    setEditId(null);
    setForm(vacio(panoramaId, panorama?.precio || 20000));
  }

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/schedules", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editId ? { id: editId, ...form } : form),
      });
      const data = await res.json();
      setSchedules((prev) => {
        const idx = prev.findIndex((s) => s.id === data.schedule.id);
        if (idx >= 0) { const copy = [...prev]; copy[idx] = data.schedule; return copy; }
        return [...prev, data.schedule];
      });
      nuevo();
    } finally {
      setLoading(false);
    }
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este horario? Esta acción no se puede deshacer.")) return;
    await fetch("/api/schedules", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setSchedules((prev) => prev.filter((s) => s.id !== id));
    if (editId === id) nuevo();
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap gap-2">
        {panoramas.map((p) => (
          <button
            key={p.id}
            onClick={() => elegirPanorama(p.id)}
            className={`rounded-full px-4 py-2 text-sm font-medium border transition ${
              panoramaId === p.id ? "bg-deep-600 text-white border-deep-600" : "border-sand-300 text-deep-700"
            }`}
          >
            {p.nombre}
          </button>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <form onSubmit={guardar} className="card p-6 space-y-3 h-fit">
          <h2 className="font-semibold text-deep-800">{editId ? "Editar horario" : "Nuevo horario"}</h2>
          <label className="block">
            <span className="text-xs text-stone">Fecha</span>
            <input required type="date" value={form.fecha} onChange={(e) => setForm({ ...form, fecha: e.target.value })} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
          </label>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-stone">Hora inicio</span>
              <input required type="time" value={form.hora_inicio} onChange={(e) => setForm({ ...form, hora_inicio: e.target.value })} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs text-stone">Hora término</span>
              <input required type="time" value={form.hora_termino} onChange={(e) => setForm({ ...form, hora_termino: e.target.value })} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
            </label>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <label className="block">
              <span className="text-xs text-stone">Cupos totales</span>
              <input required type="number" min={1} value={form.cupos_totales} onChange={(e) => setForm({ ...form, cupos_totales: +e.target.value })} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
            </label>
            <label className="block">
              <span className="text-xs text-stone">Precio (CLP)</span>
              <input required type="number" min={0} value={form.precio} onChange={(e) => setForm({ ...form, precio: +e.target.value })} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
            </label>
          </div>
          {editId && (
            <label className="block">
              <span className="text-xs text-stone">Cupos ya reservados</span>
              <input type="number" min={0} value={form.cupos_reservados} onChange={(e) => setForm({ ...form, cupos_reservados: +e.target.value })} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
            </label>
          )}
          <label className="block">
            <span className="text-xs text-stone">Estado</span>
            <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoHorario })} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm">
              {ESTADOS.map((s) => <option key={s}>{s}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="text-xs text-stone">Guía asignado</span>
            <input value={form.guia} onChange={(e) => setForm({ ...form, guia: e.target.value })} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs text-stone">Punto de encuentro (opcional, si es distinto al general del panorama)</span>
            <input value={form.punto_encuentro} onChange={(e) => setForm({ ...form, punto_encuentro: e.target.value })} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
          </label>
          <label className="block">
            <span className="text-xs text-stone">Observaciones</span>
            <textarea value={form.observaciones} onChange={(e) => setForm({ ...form, observaciones: e.target.value })} rows={2} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
          </label>
          <div className="flex gap-2 pt-2">
            <button disabled={loading} className="btn-primary flex-1">{loading ? "Guardando…" : editId ? "Guardar cambios" : "Crear horario"}</button>
            {editId && <button type="button" onClick={nuevo} className="btn-secondary">Cancelar</button>}
          </div>
        </form>

        <div className="lg:col-span-2 card divide-y divide-sand-100">
          {delPanorama.map((s) => (
            <div key={s.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-semibold text-deep-800 text-sm">
                  {formatFecha(s.fecha)} · {s.hora_inicio} – {s.hora_termino}
                </p>
                <p className="text-xs text-stone">
                  {s.cupos_reservados}/{s.cupos_totales} cupos ocupados · {formatCLP(s.precio)} · {s.estado}
                  {s.guia && ` · Guía: ${s.guia}`}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button onClick={() => editar(s)} className="text-xs font-medium text-teal-400">Editar</button>
                <button onClick={() => eliminar(s.id)} className="text-xs font-medium text-red-500">Eliminar</button>
              </div>
            </div>
          ))}
          {delPanorama.length === 0 && (
            <p className="p-6 text-center text-sm text-stone">
              {panorama?.nombre} todavía no tiene fechas ni horarios cargados.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
