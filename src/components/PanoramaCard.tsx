import Image from "next/image";
import Link from "next/link";
import type { Panorama } from "@/types";
import { formatCLP } from "@/lib/utils";

export default function PanoramaCard({ panorama }: { panorama: Panorama }) {
  const principal = panorama.images.find((i) => i.imagen_principal) || panorama.images[0];
  return (
    <Link href={`/panoramas/${panorama.slug}`} className="card group block">
      <div className="relative aspect-[4/3] w-full overflow-hidden">
        {principal && (
          <Image
            src={principal.url}
            alt={panorama.nombre}
            fill
            className="object-cover object-[center_25%] transition duration-500 group-hover:scale-105"
            sizes="(min-width: 1024px) 33vw, 100vw"
          />
        )}
        <span className="absolute top-3 left-3 badge bg-white/90 text-deep-700">{panorama.dificultad}</span>
        <span className="absolute top-3 right-3 badge bg-deep-800/80 text-white">{panorama.estado}</span>
      </div>
      <div className="p-5">
        <h3 className="font-display text-xl font-semibold text-deep-800 mb-1">{panorama.nombre}</h3>
        <p className="text-sm text-deep-600 line-clamp-2 mb-3">{panorama.descripcion}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="text-stone">{panorama.duracion}</span>
          <span className="font-semibold text-teal-700">{formatCLP(panorama.precio)} / persona</span>
        </div>
      </div>
    </Link>
  );
}
