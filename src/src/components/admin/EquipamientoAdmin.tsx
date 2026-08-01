"use client";
import { useState } from "react";
import type { Equipment, EstadoEquipo } from "@/types";
import { formatCLP } from "@/lib/utils";

const ESTADOS: EstadoEquipo[] = ["Disponible", "Reservado", "En uso", "En mantención", "Fuera de servicio", "Dañado"];

const VACIO: Omit<Equipment, "id"> = {
  nombre: "", categoria: "", descripcion: "", cantidad_total: 1, cantidad_disponible: 1,
  talla: "", estado: "Disponible", precio_arriendo: 0, imagen: "", codigo_interno: "",
};

export default function EquipamientoAdmin({ equipoInicial }: { equipoInicial: Equipment[] }) {
  const [equipo, setEquipo] = useState(equipoInicial);
  const [form, setForm] = useState<Omit<Equipment, "id">>(VACIO);
  const [editId, setEditId] = useState<string | null>(null);

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/equipment", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(editId ? { id: editId, ...form } : form),
    });
    const data = await res.json();
    setEquipo((prev) => {
      const idx = prev.findIndex((e) => e.id === data.equipment.id);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = data.equipment; return copy; }
      return [...prev, data.equipment];
    });
    setForm(VACIO); setEditId(null);
  }

  function editar(eq: Equipment) {
    setEditId(eq.id);
    const { id, ...rest } = eq;
    void id;
    setForm(rest);
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este equipo del inventario?")) return;
    await fetch("/api/equipment", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setEquipo((prev) => prev.filter((e) => e.id !== id));
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <form onSubmit={guardar} className="card p-6 space-y-3 h-fit">
        <h2 className="font-semibold text-deep-800">{editId ? "Editar equipo" : "Nuevo equipo"}</h2>
        <input required placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <input placeholder="Categoría" value={form.categoria} onChange={(e) => setForm({ ...form, categoria: e.target.value })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <input type="number" min={0} placeholder="Cantidad total" value={form.cantidad_total} onChange={(e) => setForm({ ...form, cantidad_total: +e.target.value })} className="rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
          <input type="number" min={0} placeholder="Disponible" value={form.cantidad_disponible} onChange={(e) => setForm({ ...form, cantidad_disponible: +e.target.value })} className="rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        </div>
        <input placeholder="Talla" value={form.talla} onChange={(e) => setForm({ ...form, talla: e.target.value })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <input type="number" min={0} placeholder="Precio arriendo (CLP)" value={form.precio_arriendo} onChange={(e) => setForm({ ...form, precio_arriendo: +e.target.value })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <input placeholder="Código interno" value={form.codigo_interno} onChange={(e) => setForm({ ...form, codigo_interno: e.target.value })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoEquipo })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm">
          {ESTADOS.map((s) => <option key={s}>{s}</option>)}
        </select>
        <div className="flex gap-2">
          <button className="btn-primary flex-1">{editId ? "Guardar cambios" : "Agregar equipo"}</button>
          {editId && <button type="button" onClick={() => { setEditId(null); setForm(VACIO); }} className="btn-secondary">Cancelar</button>}
        </div>
      </form>

      <div className="lg:col-span-2 card divide-y divide-sand-100">
        {equipo.map((eq) => (
          <div key={eq.id} className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-deep-800">{eq.nombre} <span className="text-xs text-stone font-normal">{eq.codigo_interno}</span></p>
              <p className="text-xs text-stone">{eq.categoria} · {eq.cantidad_disponible}/{eq.cantidad_total} disponibles · {eq.precio_arriendo > 0 ? formatCLP(eq.precio_arriendo) : "Incluido"}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className="badge bg-sand-100 text-deep-700">{eq.estado}</span>
              <button onClick={() => editar(eq)} className="text-xs font-medium text-teal-700">Editar</button>
              <button onClick={() => eliminar(eq.id)} className="text-xs font-medium text-red-600">Eliminar</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
