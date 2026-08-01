"use client";
import { useState } from "react";
import Image from "next/image";
import ImageUploader from "./ImageUploader";
import type { FotoUnificada } from "@/lib/db";

export default function GaleriaAdmin({ fotosIniciales }: { fotosIniciales: FotoUnificada[] }) {
  const [fotos, setFotos] = useState(fotosIniciales);
  const [tituloNueva, setTituloNueva] = useState("");
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [tituloEditado, setTituloEditado] = useState("");

  async function agregar(url: string) {
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, titulo: tituloNueva || undefined }),
    });
    const data = await res.json();
    setFotos((prev) => [...prev, { id: data.image.id, url: data.image.url, titulo: data.image.titulo || "", origen: "independiente" }]);
    setTituloNueva("");
  }

  function empezarEdicion(foto: FotoUnificada) {
    setEditandoId(foto.id);
    setTituloEditado(foto.titulo);
  }

  async function guardarTitulo(foto: FotoUnificada) {
    const ruta = foto.origen === "panorama" ? "/api/panoramas/images" : "/api/gallery";
    await fetch(ruta, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: foto.id, titulo: tituloEditado }),
    });
    setFotos((prev) => prev.map((f) => (f.id === foto.id ? { ...f, titulo: tituloEditado } : f)));
    setEditandoId(null);
  }

  async function eliminar(foto: FotoUnificada) {
    if (!confirm("¿Eliminar esta foto? Esta acción no se puede deshacer.")) return;
    const ruta = foto.origen === "panorama" ? "/api/panoramas/images" : "/api/gallery";
    await fetch(ruta, { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id: foto.id }) });
    setFotos((prev) => prev.filter((f) => f.id !== foto.id));
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 space-y-3 max-w-md">
        <h2 className="font-semibold text-deep-800">Agregar foto suelta</h2>
        <p className="text-xs text-stone">
          Para agregar fotos a un panorama específico, hazlo desde <strong>Panoramas</strong>. Aquí solo
          se agregan fotos generales que no pertenecen a ningún panorama en particular.
        </p>
        <input
          placeholder="Título o descripción (opcional)"
          value={tituloNueva}
          onChange={(e) => setTituloNueva(e.target.value)}
          className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm"
        />
        <ImageUploader label="Elegir foto y subir" onUploaded={agregar} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {fotos.map((foto) => (
          <div key={`${foto.origen}-${foto.id}`} className="card overflow-hidden">
            <div className="relative h-36">
              <Image src={foto.url} alt={foto.titulo || ""} fill className="object-cover" />
              <button
                onClick={() => eliminar(foto)}
                className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-full bg-deep-900/80 text-white text-xs"
                title="Eliminar"
              >
                ✕
              </button>
              {foto.origen === "panorama" && (
                <span className="absolute bottom-2 left-2 badge bg-deep-900/70 text-white text-[10px]">{foto.panorama_nombre}</span>
              )}
            </div>
            <div className="p-3">
              {editandoId === foto.id ? (
                <div className="flex gap-1">
                  <input
                    autoFocus
                    value={tituloEditado}
                    onChange={(e) => setTituloEditado(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && guardarTitulo(foto)}
                    className="flex-1 rounded border border-sand-300 px-2 py-1 text-xs"
                  />
                  <button onClick={() => guardarTitulo(foto)} className="text-xs text-teal-400 font-medium">Guardar</button>
                </div>
              ) : (
                <button onClick={() => empezarEdicion(foto)} className="text-xs text-deep-600 hover:text-teal-400 text-left w-full truncate">
                  {foto.titulo || "Sin título — click para agregar"}
                </button>
              )}
            </div>
          </div>
        ))}
        {fotos.length === 0 && <p className="text-sm text-stone col-span-full">Aún no hay fotos.</p>}
      </div>
    </div>
  );
}
