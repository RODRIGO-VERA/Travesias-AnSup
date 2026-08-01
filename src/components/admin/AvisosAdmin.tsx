"use client";
import { useState } from "react";
import type { Notice } from "@/types";

const VACIO = { titulo: "", mensaje: "", tipo: "info" as Notice["tipo"], fecha_inicio: new Date().toISOString().slice(0, 10), fecha_termino: "", activo: true };

export default function AvisosAdmin({ avisosIniciales }: { avisosIniciales: Notice[] }) {
  const [avisos, setAvisos] = useState(avisosIniciales);
  const [form, setForm] = useState(VACIO);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/notices", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
    const data = await res.json();
    setAvisos((prev) => [...prev, data.notice]);
    setForm(VACIO);
  }

  async function eliminar(id: string) {
    await fetch("/api/notices", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setAvisos((prev) => prev.filter((n) => n.id !== id));
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <form onSubmit={crear} className="card p-6 space-y-3 h-fit">
        <h2 className="font-semibold text-deep-800">Nuevo aviso</h2>
        <input required placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <textarea required placeholder="Mensaje" value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} rows={3} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <select value={form.tipo} onChange={(e) => setForm({ ...form, tipo: e.target.value as Notice["tipo"] })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm">
          <option value="info">Información</option>
          <option value="alerta">Alerta</option>
          <option value="promocion">Promoción</option>
          <option value="clima">Clima</option>
        </select>
        <div className="grid grid-cols-2 gap-3">
          <input type="date" value={form.fecha_inicio} onChange={(e) => setForm({ ...form, fecha_inicio: e.target.value })} className="rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
          <input type="date" value={form.fecha_termino} onChange={(e) => setForm({ ...form, fecha_termino: e.target.value })} className="rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        </div>
        <button className="btn-primary w-full">Publicar aviso</button>
      </form>
      <div className="lg:col-span-2 card divide-y divide-sand-100">
        {avisos.map((a) => (
          <div key={a.id} className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-deep-800 text-sm">{a.titulo}</p>
              <p className="text-xs text-stone">{a.mensaje}</p>
            </div>
            <button onClick={() => eliminar(a.id)} className="text-xs font-medium text-red-600 shrink-0">Eliminar</button>
          </div>
        ))}
        {avisos.length === 0 && <p className="p-6 text-center text-sm text-stone">Sin avisos publicados.</p>}
      </div>
    </div>
  );
}
