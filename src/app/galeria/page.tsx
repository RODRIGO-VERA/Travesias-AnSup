import Image from "next/image";
import { getPanoramas, getGalleryImages } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Galería — Travesías AnSup" };

export default async function GaleriaPage() {
  const [panoramas, extra] = await Promise.all([getPanoramas(), getGalleryImages()]);
  const dePanoramas = panoramas.flatMap((p) => p.images.map((img) => ({ ...img, etiqueta: p.nombre })));
  const independientes = extra.map((img) => ({ ...img, etiqueta: img.titulo || "Travesías AnSup" }));
  const imagenes = [...dePanoramas, ...independientes];

  return (
    <div className="section py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Travesías AnSup</p>
      <h1 className="text-3xl font-display font-semibold text-deep-800 mb-8">Galería</h1>
      <div className="columns-2 sm:columns-3 gap-4 [&>*]:mb-4">
        {imagenes.map((img, i) => (
          <div key={`${img.id}-${i}`} className="relative rounded-xl overflow-hidden break-inside-avoid">
            <Image src={img.url} alt={img.etiqueta} width={500} height={500} className="w-full h-auto object-cover" />
            <span className="absolute bottom-2 left-2 badge bg-deep-900/70 text-white">{img.etiqueta}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
