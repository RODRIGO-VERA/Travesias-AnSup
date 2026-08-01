import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPanoramaBySlug, getSiteSettings } from "@/lib/db";
import { formatCLP, whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function PanoramaDetailPage({ params }: { params: { slug: string } }) {
  const [panorama, settings] = await Promise.all([getPanoramaBySlug(params.slug), getSiteSettings()]);
  if (!panorama) notFound();

  const principal = panorama.images.find((i) => i.imagen_principal) || panorama.images[0];
  const resto = panorama.images.filter((i) => i.id !== principal?.id);

  return (
    <div>
      <div className="relative aspect-[16/9] max-h-[420px] w-full">
        {principal && <Image src={principal.url} alt={panorama.nombre} fill priority className="object-cover object-top" />}
        <div className="absolute inset-0 bg-gradient-to-t from-deep-900/70 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 section pb-6 text-white">
          <span className="badge bg-teal-500 text-white mb-2">{panorama.dificultad}</span>
          <h1 className="text-3xl sm:text-4xl font-display font-semibold">{panorama.nombre}</h1>
          <p style={{ color: "#E4DFD3" }}>{panorama.ubicacion}</p>
        </div>
      </div>

      <div className="section py-10 grid lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 space-y-10">
          <div>
            <h2 className="text-xl font-display font-semibold text-deep-800 mb-3">Descripción</h2>
            <p className="text-deep-600">{panorama.descripcion}</p>
          </div>

          {resto.length > 0 && (
            <div>
              <h2 className="text-xl font-display font-semibold text-deep-800 mb-3">Galería</h2>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {resto.map((img) => (
                  <div key={img.id} className="relative aspect-[4/3] rounded-xl overflow-hidden">
                    <Image src={img.url} alt={img.titulo || panorama.nombre} fill className="object-cover object-top" />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div>
            <h2 className="text-xl font-display font-semibold text-deep-800 mb-3">Historia y entorno</h2>
            <div className="grid sm:grid-cols-2 gap-4 text-sm text-deep-600">
              <p><strong className="text-deep-800">Historia del sector: </strong>{panorama.historia_entorno.historia}</p>
              <p><strong className="text-deep-800">Flora: </strong>{panorama.historia_entorno.flora}</p>
              <p><strong className="text-deep-800">Fauna: </strong>{panorama.historia_entorno.fauna}</p>
              <p><strong className="text-deep-800">Datos interesantes: </strong>{panorama.historia_entorno.datos_interesantes}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold text-deep-800 mb-2">Recomendaciones</h3>
              <ul className="text-sm text-deep-600 space-y-1 list-disc list-inside">
                {panorama.recomendaciones.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-deep-800 mb-2">Qué debes llevar</h3>
              <ul className="text-sm text-deep-600 space-y-1 list-disc list-inside">
                {panorama.que_llevar.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-deep-800 mb-2">Qué incluye</h3>
              <ul className="text-sm text-deep-600 space-y-1 list-disc list-inside">
                {panorama.incluye.map((r) => <li key={r}>{r}</li>)}
              </ul>
            </div>
          </div>
        </div>

        {/* Panel de reserva */}
        <aside className="lg:col-span-1">
          <div className="card p-6 sticky top-24 space-y-4">
            <div className="flex items-baseline justify-between">
              <span className="text-sm text-stone">Precio por persona</span>
              <span className="text-2xl font-display font-semibold text-deep-800">{formatCLP(panorama.precio)}</span>
            </div>
            <dl className="text-sm text-deep-600 space-y-1.5 border-t border-sand-200 pt-4">
              <div className="flex justify-between"><dt>Duración</dt><dd>{panorama.duracion}</dd></div>
              <div className="flex justify-between"><dt>Edad mínima</dt><dd>{panorama.edad_minima} años</dd></div>
              <div className="flex justify-between"><dt>Cupo máximo</dt><dd>{panorama.capacidad_maxima} personas</dd></div>
              <div className="flex justify-between"><dt>Arriendo equipo</dt><dd>{formatCLP(panorama.precio_equipamiento)}</dd></div>
            </dl>
            <Link href={`/reserva/${panorama.slug}`} className="btn-primary w-full">
              Reservar esta travesía
            </Link>
            <a
              href={whatsappLink(`Hola, quiero consultar por un recorrido de Travesías AnSup en ${panorama.nombre}.`, settings.whatsapp_number)}
              target="_blank" rel="noreferrer" className="btn-whatsapp w-full"
            >
              Consultar por WhatsApp
            </a>
          </div>
        </aside>
      </div>
    </div>
  );
}
