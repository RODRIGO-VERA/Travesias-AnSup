"use client";
import { useState } from "react";
import Image from "next/image";
import ImageUploader from "./ImageUploader";
import type { Panorama } from "@/types";

export default function CarruselAdmin({ panoramasIniciales }: { panoramasIniciales: Panorama[] }) {
  const [panoramas, setPanoramas] = useState(panoramasIniciales);

  async function elegirComoPrincipal(panoramaId: string, imageId: string) {
    await fetch("/api/panoramas/images", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ accion: "principal", panorama_id: panoramaId, id: imageId }),
    });
    setPanoramas((prev) =>
      prev.map((p) =>
        p.id !== panoramaId ? p : { ...p, images: p.images.map((i) => ({ ...i, imagen_principal: i.id === imageId })) }
      )
    );
  }

  async function subirNuevaPrincipal(panoramaId: string, url: string) {
    const res = await fetch("/api/panoramas/images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ panorama_id: panoramaId, url, imagen_principal: true }),
    });
    const data = await res.json();
    setPanoramas((prev) =>
      prev.map((p) =>
        p.id !== panoramaId
          ? p
          : { ...p, images: [...p.images.map((i) => ({ ...i, imagen_principal: false })), data.image] }
      )
    );
  }

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {panoramas.map((p) => {
        const principal = p.images.find((i) => i.imagen_principal) || p.images[0];
        return (
          <div key={p.id} className="card p-5 space-y-4">
            <h2 className="font-semibold text-deep-800">{p.nombre}</h2>

            {principal ? (
              <div className="relative h-44 rounded-xl overflow-hidden">
                <Image src={principal.url} alt={p.nombre} fill className="object-cover" />
                <span className="absolute top-2 left-2 badge bg-deep-900/80 text-white text-[10px]">Foto actual del carrusel</span>
              </div>
            ) : (
              <div className="h-44 rounded-xl bg-sand-100 grid place-items-center text-sm text-stone">Sin fotos aún</div>
            )}

            {p.images.length > 1 && (
              <div>
                <p className="text-xs text-stone mb-2">Elegir otra de las fotos ya cargadas:</p>
                <div className="flex flex-wrap gap-2">
                  {p.images
                    .filter((i) => !i.imagen_principal)
                    .map((img) => (
                      <button key={img.id} onClick={() => elegirComoPrincipal(p.id, img.id)} className="relative h-14 w-14 rounded-lg overflow-hidden ring-1 ring-sand-300">
                        <Image src={img.url} alt="" fill className="object-cover" />
                      </button>
                    ))}
                </div>
              </div>
            )}

            <ImageUploader label="Subir una foto nueva como principal" onUploaded={(url) => subirNuevaPrincipal(p.id, url)} />
          </div>
        );
      })}
    </div>
  );
}
