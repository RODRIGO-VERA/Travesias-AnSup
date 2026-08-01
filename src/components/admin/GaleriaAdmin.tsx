"use client";
import { useState } from "react";
import Image from "next/image";
import ImageUploader from "./ImageUploader";
import type { GalleryImage } from "@/lib/db";

export default function GaleriaAdmin({ imagenesIniciales }: { imagenesIniciales: GalleryImage[] }) {
  const [imagenes, setImagenes] = useState(imagenesIniciales);
  const [titulo, setTitulo] = useState("");

  async function agregar(url: string) {
    const res = await fetch("/api/gallery", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, titulo: titulo || undefined }),
    });
    const data = await res.json();
    setImagenes((prev) => [...prev, data.image]);
    setTitulo("");
  }

  async function eliminar(id: string) {
    if (!confirm("¿Eliminar esta foto de la galería?")) return;
    await fetch("/api/gallery", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id }) });
    setImagenes((prev) => prev.filter((i) => i.id !== id));
  }

  return (
    <div className="space-y-6">
      <div className="card p-6 space-y-3 max-w-md">
        <h2 className="font-semibold text-deep-800">Agregar foto</h2>
        <input
          placeholder="Título o descripción (opcional)"
          value={titulo}
          onChange={(e) => setTitulo(e.target.value)}
          className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm"
        />
        <ImageUploader label="Elegir foto y subir" onUploaded={agregar} />
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3">
        {imagenes.map((img) => (
          <div key={img.id} className="relative h-32 rounded-lg overflow-hidden group">
            <Image src={img.url} alt={img.titulo || ""} fill className="object-cover" />
            <button
              onClick={() => eliminar(img.id)}
              className="absolute inset-0 bg-deep-900/70 text-white text-xs opacity-0 group-hover:opacity-100 transition"
            >
              Eliminar
            </button>
          </div>
        ))}
        {imagenes.length === 0 && <p className="text-sm text-stone col-span-full">Aún no hay fotos en la galería.</p>}
      </div>
    </div>
  );
}
