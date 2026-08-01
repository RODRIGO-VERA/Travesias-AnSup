"use client";
import { useState } from "react";
import type { ReservationCode, Panorama } from "@/types";
import { formatFecha } from "@/lib/utils";

export default function CodigosAdmin({ codigosIniciales, panoramas }: { codigosIniciales: ReservationCode[]; panoramas: Panorama[] }) {
  const [codigos, setCodigos] = useState(codigosIniciales);
  const [codigo, setCodigo] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [panoramaId, setPanoramaId] = useState("");
  const [vencimiento, setVencimiento] = useState("");
  const [error, setError] = useState("");
  const [busqueda, setBusqueda] = useState("");
  const [filtroEstado, setFiltroEstado] = useState("Todos");

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/codes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ codigo, descripcion_interna: descripcion, panorama_id: panoramaId || undefined, fecha_vencimiento: vencimiento || undefined }),
    });
    const data = await res.json();
    if (!res.ok) { setError(data.error); return; }
    setCodigos((prev) => [data.code, ...prev]);
    setCodigo(""); setDescripcion(""); setPanoramaId(""); setVencimiento("");
  }

  async function anular(id: string) {
    const motivo = prompt("Motivo de anulación:") || "Anulado por el administrador.";
    await fetch("/api/codes", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, motivo }),
    });
    setCodigos((prev) => prev.map((c) => (c.id === id ? { ...c, estado: "Anulado", motivo_anulacion: motivo } : c)));
  }

  const filtrados = codigos.filter((c) => {
    const matchBusqueda = c.codigo.toLowerCase().includes(busqueda.toLowerCase());
    const matchEstado = filtroEstado === "Todos" || c.estado === filtroEstado;
    return matchBusqueda && matchEstado;
  });

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <form onSubmit={crear} className="card p-6 space-y-3 h-fit">
        <h2 className="font-semibold text-deep-800">Crear código</h2>
        <input required value={codigo} onChange={(e) => setCodigo(e.target.value.toUpperCase())} placeholder="ANSUP-GRUPO-2026"
          className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <input value={descripcion} onChange={(e) => setDescripcion(e.target.value)} placeholder="Observación interna"
          className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <select value={panoramaId} onChange={(e) => setPanoramaId(e.target.value)} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm">
          <option value="">Cualquier panorama</option>
          {panoramas.map((p) => <option key={p.id} value={p.id}>{p.nombre}</option>)}
        </select>
        <input type="date" value={vencimiento} onChange={(e) => setVencimiento(e.target.value)} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button className="btn-primary w-full">Crear código</button>
      </form>

      <div className="lg:col-span-2 space-y-4">
        <div className="flex flex-wrap gap-3">
          <input value={busqueda} onChange={(e) => setBusqueda(e.target.value)} placeholder="Buscar código…"
            className="flex-1 min-w-[160px] rounded-lg border border-sand-300 px-3 py-2 text-sm" />
          <select value={filtroEstado} onChange={(e) => setFiltroEstado(e.target.value)} className="rounded-lg border border-sand-300 px-3 py-2 text-sm">
            {["Todos", "Disponible", "Reservado", "Asignado", "Utilizado", "Vencido", "Anulado"].map((s) => <option key={s}>{s}</option>)}
          </select>
        </div>
        <div className="card divide-y divide-sand-100">
          {filtrados.map((c) => (
            <div key={c.id} className="p-4 flex items-center justify-between gap-3">
              <div>
                <p className="font-mono font-semibold text-deep-800">{c.codigo}</p>
                <p className="text-xs text-stone">
                  {c.descripcion_interna || "Sin descripción"} · Creado {formatFecha(c.fecha_creacion.slice(0, 10))}
                  {c.fecha_vencimiento && ` · Vence ${formatFecha(c.fecha_vencimiento)}`}
                </p>
              </div>
              <div className="flex items-center gap-2 shrink-0">
                <span className="badge bg-sand-100 text-deep-700">{c.estado}</span>
                {c.estado !== "Anulado" && c.estado !== "Utilizado" && (
                  <button onClick={() => anular(c.id)} className="text-xs text-red-600 font-medium">Anular</button>
                )}
              </div>
            </div>
          ))}
          {filtrados.length === 0 && <p className="p-6 text-center text-sm text-stone">Sin resultados.</p>}
        </div>
      </div>
    </div>
  );
}
