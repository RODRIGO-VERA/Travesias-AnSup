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

  async function eliminarFoto(panoramaId: string, imageId: string, eraPrincipal: boolean) {
    if (!confirm("¿Eliminar esta foto? Esta acción no se puede deshacer.")) return;
    await fetch("/api/panoramas/images", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: imageId }),
    });

    setPanoramas((prev) =>
      prev.map((p) => {
        if (p.id !== panoramaId) return p;
        const restantes = p.images.filter((i) => i.id !== imageId);
        // Si la que se borró era la principal, promovemos la primera que quede.
        if (eraPrincipal && restantes.length > 0 && !restantes.some((i) => i.imagen_principal)) {
          restantes[0] = { ...restantes[0], imagen_principal: true };
        }
        return { ...p, images: restantes };
      })
    );

    if (eraPrincipal) {
      const p = panoramas.find((x) => x.id === panoramaId);
      const restante = p?.images.find((i) => i.id !== imageId);
      if (restante) {
        fetch("/api/panoramas/images", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accion: "principal", panorama_id: panoramaId, id: restante.id }),
        }).catch(() => {});
      }
    }
  }

  return (
    <div className="grid sm:grid-cols-2 gap-6">
      {panoramas.map((p) => {
        const principal = p.images.find((i) => i.imagen_principal) || p.images[0];
        return (
          <div key={p.id} className="card p-5 space-y-4">
            <h2 className="font-semibold text-deep-800">{p.nombre}</h2>

            {principal ? (
              <div className="relative aspect-[4/3] rounded-xl overflow-hidden group">
                <Image src={principal.url} alt={p.nombre} fill className="object-cover object-top" />
                <span className="absolute top-2 left-2 badge bg-deep-900/80 text-white text-[10px]">Foto actual del carrusel</span>
                <button
                  onClick={() => eliminarFoto(p.id, principal.id, true)}
                  className="absolute top-2 right-2 h-7 w-7 grid place-items-center rounded-full bg-deep-900/80 text-white text-xs opacity-0 group-hover:opacity-100 transition"
                  title="Eliminar esta foto"
                >
                  ✕
                </button>
              </div>
            ) : (
              <div className="aspect-[4/3] rounded-xl bg-sand-100 grid place-items-center text-sm text-stone">Sin fotos aún</div>
            )}

            {p.images.length > 1 && (
              <div>
                <p className="text-xs text-stone mb-2">Elegir otra de las fotos ya cargadas:</p>
                <div className="flex flex-wrap gap-2">
                  {p.images
                    .filter((i) => !i.imagen_principal)
                    .map((img) => (
                      <div key={img.id} className="relative h-14 w-14 rounded-lg overflow-hidden ring-1 ring-sand-300 group">
                        <button onClick={() => elegirComoPrincipal(p.id, img.id)} className="absolute inset-0">
                          <Image src={img.url} alt="" fill className="object-cover" />
                        </button>
                        <button
                          onClick={() => eliminarFoto(p.id, img.id, false)}
                          className="absolute inset-0 bg-deep-900/70 text-white text-[10px] opacity-0 group-hover:opacity-100 transition"
                          title="Eliminar esta foto"
                        >
                          ✕
                        </button>
                      </div>
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
