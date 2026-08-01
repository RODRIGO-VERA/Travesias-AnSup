"use client";
import { useState } from "react";
import type { ApprovalTemplate } from "@/types";
import ApprovalPreview from "@/components/admin/ApprovalPreview";
import type { Booking, Panorama, Schedule } from "@/types";

const EJEMPLO_BOOKING: Booking = {
  id: "demo", codigo_reserva: "ANSUP-2026-0001", panorama_id: "demo", schedule_id: "demo",
  nombre_cliente: "María González", telefono: "+56 9 1234 5678", correo: "maria@correo.cl",
  adultos: 2, ninos: 0, total_personas: 2, experiencia_previa: false, equipamiento: [],
  acepta_terminos: true, autoriza_contacto: true, valor_total: 40000, estado: "Pendiente de aprobación",
  estado_pago: "Pendiente", fecha_creacion: new Date().toISOString(),
};
const EJEMPLO_PANORAMA: Panorama = {
  id: "demo", nombre: "Estero Coipomo", slug: "demo", descripcion: "", historia_entorno: {
    historia: "", caracteristicas: "", cultural: "", comunidad: "", flora: "", fauna: "", datos_interesantes: "", recomendaciones_ambientales: "",
  }, ubicacion: "Ancud, Chiloé", punto_encuentro: "", duracion: "2 horas", dificultad: "Familiar", edad_minima: 8,
  capacidad_maxima: 10, precio: 20000, precio_equipamiento: 8000, recomendaciones: [], que_llevar: [], incluye: [],
  estado: "Disponible", orden: 1, images: [], videos: [], fecha_creacion: new Date().toISOString(),
};
const EJEMPLO_SCHEDULE: Schedule = {
  id: "demo", panorama_id: "demo", fecha: new Date().toISOString().slice(0, 10), hora_inicio: "10:00", hora_termino: "12:00",
  cupos_totales: 10, cupos_reservados: 2, precio: 20000, estado: "Disponible",
};

const VACIA: Omit<ApprovalTemplate, "id" | "fecha_creacion" | "fecha_actualizacion"> = {
  nombre: "Nueva plantilla",
  titulo: "¡Tu travesía ha sido aprobada!",
  mensaje_inspirador: "Cada río guarda una historia y cada travesía comienza con el valor de descubrirla.",
  texto_cierre: "Nos vemos en el agua. La aventura ya comenzó.",
  mostrar_imagen: false,
  imagen_url: "",
  color_principal: "#0E3A4C",
  color_secundario: "#189AA6",
  activa: true,
  predeterminada: false,
};

export default function PlantillasAdmin({ plantillasIniciales }: { plantillasIniciales: ApprovalTemplate[] }) {
  const [plantillas, setPlantillas] = useState(plantillasIniciales);
  const [editando, setEditando] = useState<ApprovalTemplate | null>(plantillasIniciales[0] || null);
  const [form, setForm] = useState(editando ? { ...editando } : { id: "", ...VACIA, fecha_creacion: "", fecha_actualizacion: "" });

  function seleccionar(t: ApprovalTemplate) {
    setEditando(t);
    setForm({ ...t });
  }

  function nueva() {
    setEditando(null);
    setForm({ id: "", ...VACIA, fecha_creacion: "", fecha_actualizacion: "" });
  }

  async function guardar() {
    const res = await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    const data = await res.json();
    setPlantillas((prev) => {
      const idx = prev.findIndex((t) => t.id === data.template.id);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = data.template; return copy; }
      return [...prev, data.template];
    });
    setEditando(data.template);
    setForm(data.template);
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar esta plantilla?")) return;
    await fetch("/api/templates", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setPlantillas((prev) => prev.filter((t) => t.id !== id));
    if (editando?.id === id) nueva();
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="space-y-3">
        <button onClick={nueva} className="btn-secondary w-full">+ Nueva plantilla</button>
        <div className="card divide-y divide-sand-100">
          {plantillas.map((t) => (
            <button key={t.id} onClick={() => seleccionar(t)} className={`w-full text-left p-4 hover:bg-sand-50 ${editando?.id === t.id ? "bg-teal-50" : ""}`}>
              <p className="font-medium text-deep-800 text-sm">{t.nombre}</p>
              <p className="text-xs text-stone">{t.predeterminada ? "Predeterminada" : t.activa ? "Activa" : "Inactiva"}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="card p-6 space-y-3">
        <input placeholder="Nombre de la plantilla" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm font-medium" />
        <input placeholder="Título" value={form.titulo} onChange={(e) => setForm({ ...form, titulo: e.target.value })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <textarea placeholder="Mensaje inspirador" rows={3} value={form.mensaje_inspirador} onChange={(e) => setForm({ ...form, mensaje_inspirador: e.target.value })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <input placeholder="Texto de cierre" value={form.texto_cierre} onChange={(e) => setForm({ ...form, texto_cierre: e.target.value })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <div className="grid grid-cols-2 gap-3">
          <label className="text-xs text-stone">Color principal
            <input type="color" value={form.color_principal} onChange={(e) => setForm({ ...form, color_principal: e.target.value })} className="w-full h-9 rounded border border-sand-300" />
          </label>
          <label className="text-xs text-stone">Color secundario
            <input type="color" value={form.color_secundario} onChange={(e) => setForm({ ...form, color_secundario: e.target.value })} className="w-full h-9 rounded border border-sand-300" />
          </label>
        </div>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.mostrar_imagen} onChange={(e) => setForm({ ...form, mostrar_imagen: e.target.checked })} />
          <span className="text-sm text-deep-700">Mostrar imagen</span>
        </label>
        {form.mostrar_imagen && (
          <input placeholder="/images/martin-pescador.jpg" value={form.imagen_url} onChange={(e) => setForm({ ...form, imagen_url: e.target.value })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        )}
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={form.predeterminada} onChange={(e) => setForm({ ...form, predeterminada: e.target.checked })} />
          <span className="text-sm text-deep-700">Usar como plantilla predeterminada</span>
        </label>
        <div className="flex gap-2 pt-2">
          <button onClick={guardar} className="btn-primary flex-1">Guardar plantilla</button>
          {editando && <button onClick={() => eliminar(editando.id)} className="text-sm font-medium text-red-600 px-3">Eliminar</button>}
        </div>
      </div>

      <div>
        <p className="text-xs text-stone mb-2">Vista previa (celular y computador se ven igual, es responsive)</p>
        <ApprovalPreview
          template={{ ...form, id: form.id || "preview", fecha_creacion: "", fecha_actualizacion: "" }}
          booking={EJEMPLO_BOOKING}
          panorama={EJEMPLO_PANORAMA}
          schedule={EJEMPLO_SCHEDULE}
        />
      </div>
    </div>
  );
}
