"use client";
import { useState } from "react";
import type { Panorama, EstadoPanorama, NivelDificultad } from "@/types";
import { formatCLP } from "@/lib/utils";
import Image from "next/image";
import ImageUploader from "./ImageUploader";

const ESTADOS: EstadoPanorama[] = ["Disponible", "Próximamente", "Cupos limitados", "Completo", "Suspendido", "No disponible", "Actividad privada"];
const NIVELES: NivelDificultad[] = ["Principiante", "Familiar", "Intermedio", "Avanzado"];

function vacio(): Panorama {
  return {
    id: "", nombre: "", slug: "", descripcion: "",
    historia_entorno: { historia: "", caracteristicas: "", cultural: "", comunidad: "", flora: "", fauna: "", datos_interesantes: "", recomendaciones_ambientales: "" },
    ubicacion: "", punto_encuentro: "", duracion: "", dificultad: "Familiar", edad_minima: 8, capacidad_maxima: 10,
    precio: 20000, precio_equipamiento: 8000, recomendaciones: [], que_llevar: [], incluye: [],
    estado: "Disponible", orden: 99, images: [], videos: [], fecha_creacion: "",
  };
}

export default function PanoramasAdmin({ panoramasIniciales }: { panoramasIniciales: Panorama[] }) {
  const [lista, setLista] = useState(panoramasIniciales);
  const [editando, setEditando] = useState<Panorama | null>(null);
  const [form, setForm] = useState<Panorama>(vacio());
  const [nuevaImagenUrl, setNuevaImagenUrl] = useState("");

  function editar(p: Panorama) {
    setEditando(p);
    setForm(p);
  }
  function nuevo() {
    setEditando(null);
    setForm(vacio());
  }

  function slugify(s: string) {
    return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  }

  async function guardar() {
    const body = { ...form, slug: form.slug || slugify(form.nombre) };
    const res = await fetch("/api/panoramas", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) });
    const data = await res.json();
    setLista((prev) => {
      const idx = prev.findIndex((p) => p.id === data.panorama.id);
      if (idx >= 0) { const copy = [...prev]; copy[idx] = data.panorama; return copy; }
      return [...prev, data.panorama];
    });
    setEditando(data.panorama);
    setForm(data.panorama);
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar este panorama?")) return;
    await fetch("/api/panoramas", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setLista((prev) => prev.filter((p) => p.id !== id));
    if (editando?.id === id) nuevo();
  }

  function agregarImagen() {
    if (!nuevaImagenUrl) return;
    setForm({
      ...form,
      images: [...form.images, { id: `img_${Date.now()}`, url: nuevaImagenUrl, imagen_principal: form.images.length === 0, orden: form.images.length + 1 }],
    });
    setNuevaImagenUrl("");
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <div className="space-y-3">
        <button onClick={nuevo} className="btn-secondary w-full">+ Nuevo panorama</button>
        <div className="card divide-y divide-sand-100">
          {lista.map((p) => (
            <button key={p.id} onClick={() => editar(p)} className={`w-full text-left p-4 hover:bg-sand-50 ${editando?.id === p.id ? "bg-teal-50" : ""}`}>
              <p className="font-medium text-deep-800 text-sm">{p.nombre}</p>
              <p className="text-xs text-stone">{p.estado} · {formatCLP(p.precio)}</p>
            </button>
          ))}
        </div>
      </div>

      <div className="lg:col-span-2 card p-6 space-y-4">
        <div className="grid sm:grid-cols-2 gap-3">
          <input placeholder="Nombre" value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} className="rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
          <input placeholder="Slug (URL)" value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} className="rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        </div>
        <textarea placeholder="Descripción" rows={2} value={form.descripcion} onChange={(e) => setForm({ ...form, descripcion: e.target.value })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <div className="grid sm:grid-cols-3 gap-3">
          <input placeholder="Ubicación" value={form.ubicacion} onChange={(e) => setForm({ ...form, ubicacion: e.target.value })} className="rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
          <input placeholder="Punto de encuentro" value={form.punto_encuentro} onChange={(e) => setForm({ ...form, punto_encuentro: e.target.value })} className="rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
          <input placeholder="Duración" value={form.duracion} onChange={(e) => setForm({ ...form, duracion: e.target.value })} className="rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        </div>
        <div className="grid sm:grid-cols-4 gap-3">
          <select value={form.dificultad} onChange={(e) => setForm({ ...form, dificultad: e.target.value as NivelDificultad })} className="rounded-lg border border-sand-300 px-3 py-2.5 text-sm">
            {NIVELES.map((n) => <option key={n}>{n}</option>)}
          </select>
          <input type="number" placeholder="Edad mínima" value={form.edad_minima} onChange={(e) => setForm({ ...form, edad_minima: +e.target.value })} className="rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
          <input type="number" placeholder="Precio" value={form.precio} onChange={(e) => setForm({ ...form, precio: +e.target.value })} className="rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
          <input type="number" placeholder="Cupo máximo" value={form.capacidad_maxima} onChange={(e) => setForm({ ...form, capacidad_maxima: +e.target.value })} className="rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        </div>
        <select value={form.estado} onChange={(e) => setForm({ ...form, estado: e.target.value as EstadoPanorama })} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm">
          {ESTADOS.map((s) => <option key={s}>{s}</option>)}
        </select>

        <div>
          <h3 className="text-sm font-semibold text-deep-800 mb-2">Historia y entorno</h3>
          <div className="grid sm:grid-cols-2 gap-3">
            {(["historia", "flora", "fauna", "datos_interesantes"] as const).map((campo) => (
              <textarea key={campo} placeholder={campo} rows={2} value={form.historia_entorno[campo]}
                onChange={(e) => setForm({ ...form, historia_entorno: { ...form.historia_entorno, [campo]: e.target.value } })}
                className="rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
            ))}
          </div>
        </div>

        <div>
          <h3 className="text-sm font-semibold text-deep-800 mb-1">Fotografías</h3>
          <p className="text-xs text-stone mb-3">
            La foto marcada con ⭐ es la que se usa en el carrusel de inicio, la tarjeta del panorama y la
            foto grande de la ficha. Pasa el mouse sobre una foto para elegirla como principal o quitarla.
          </p>
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <input placeholder="/images/nombre-de-archivo.jpg" value={nuevaImagenUrl} onChange={(e) => setNuevaImagenUrl(e.target.value)} className="flex-1 min-w-[180px] rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
            <button type="button" onClick={agregarImagen} className="btn-secondary">Agregar por URL</button>
            <ImageUploader
              onUploaded={(url) =>
                setForm((prev) => ({
                  ...prev,
                  images: [...prev.images, { id: `img_${Date.now()}`, url, imagen_principal: prev.images.length === 0, orden: prev.images.length + 1 }],
                }))
              }
            />
          </div>
          <div className="flex flex-wrap gap-3">
            {form.images.map((img) => (
              <div key={img.id} className={`relative h-24 w-24 rounded-lg overflow-hidden group border-2 ${img.imagen_principal ? "border-teal-400" : "border-transparent"}`}>
                <Image src={img.url} alt="" fill className="object-cover" />
                {img.imagen_principal && (
                  <span className="absolute top-1 left-1 text-base drop-shadow" title="Foto principal">⭐</span>
                )}
                <div className="absolute inset-0 bg-deep-900/70 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center gap-1">
                  {!img.imagen_principal && (
                    <button
                      type="button"
                      onClick={() =>
                        setForm({
                          ...form,
                          images: form.images.map((i) => ({ ...i, imagen_principal: i.id === img.id })),
                        })
                      }
                      className="text-white text-xs font-semibold underline"
                    >
                      Usar como principal
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={async () => {
                      if (!confirm("¿Eliminar esta foto? Esta acción no se puede deshacer.")) return;
                      if (!img.id.startsWith("img_")) {
                        // Ya existe guardada en la base de datos: eliminar de inmediato.
                        await fetch("/api/panoramas/images", {
                          method: "DELETE",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ id: img.id }),
                        });
                      }
                      setForm({ ...form, images: form.images.filter((i) => i.id !== img.id) });
                    }}
                    className="text-white text-xs"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            ))}
            {form.images.length === 0 && <p className="text-sm text-stone">Aún no hay fotos agregadas a este panorama.</p>}
          </div>
        </div>

        <div className="flex gap-2 pt-2">
          <button onClick={guardar} className="btn-primary flex-1">Guardar panorama</button>
          {editando && <button onClick={() => eliminar(editando.id)} className="text-sm font-medium text-red-600 px-3">Eliminar</button>}
        </div>
      </div>
    </div>
  );
}
