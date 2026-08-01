import Carousel from "@/components/Carousel";
import PanoramaCard from "@/components/PanoramaCard";
import Image from "next/image";
import Link from "next/link";
import { getPanoramas, getActiveNotices, getFaq, getSiteSettings } from "@/lib/db";
import { whatsappLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [allPanoramas, avisos, allFaq, settings] = await Promise.all([getPanoramas(), getActiveNotices(), getFaq(), getSiteSettings()]);
  const panoramas = allPanoramas.filter((p) => p.estado !== "No disponible");
  const faq = allFaq.slice(0, 4);

  const slides = panoramas.map((p) => {
    const img = p.images.find((i) => i.imagen_principal) || p.images[0];
    return { url: img?.url || "/images/hero-proa-tabla.jpg", titulo: p.nombre, descripcion: p.descripcion, href: `/panoramas/${p.slug}` };
  });

  return (
    <div>
      {avisos.length > 0 && (
        <div className="bg-teal-600 text-white text-sm">
          <div className="section py-2 flex flex-wrap gap-x-6 gap-y-1">
            {avisos.map((a) => (
              <span key={a.id}>
                <strong>{a.titulo}:</strong> {a.mensaje}
              </span>
            ))}
          </div>
        </div>
      )}

      <section className="pt-4">
        <div className="section">
          <Carousel slides={slides} />
        </div>
      </section>

      {/* Video promocional / hero secundario — sección 9 */}
      <section className="section mt-14">
        <div className="relative overflow-hidden rounded-xl2 shadow-soft">
          <div className="relative h-[420px] w-full">
            <Image src="/images/accion-remando-lago.jpg" alt="Vive Chiloé desde el agua" fill className="object-cover" />
            <div className="absolute inset-0 bg-deep-900/50" />
          </div>
          <div className="absolute inset-0 flex flex-col items-start justify-center gap-4 p-8 sm:p-14 text-white max-w-2xl">
            <h1 className="font-display text-3xl sm:text-4xl font-semibold">Vive Chiloé desde el agua</h1>
            <p style={{ color: "#E4DFD3" }}>
              Descubre ríos, esteros y paisajes únicos de Ancud mientras navegas sobre una tabla SUP.
            </p>
            <div className="flex flex-wrap gap-3 mt-2">
              <Link href="/panoramas" className="btn-primary">Ver panoramas</Link>
              <Link href="/panoramas" className="btn-secondary !text-white !border-white hover:!bg-white/10">Revisar disponibilidad</Link>
              <a href={whatsappLink("Hola, quiero consultar por Travesías AnSup.", settings.whatsapp_number)} target="_blank" rel="noreferrer" className="btn-whatsapp">
                Consultar por WhatsApp
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Panoramas */}
      <section className="section mt-16">
        <div className="flex items-end justify-between mb-6">
          <div>
            <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Nuestros panoramas</p>
            <h2 className="text-2xl sm:text-3xl font-display font-semibold text-deep-800">Descubre Chiloé navegando sobre sus aguas</h2>
          </div>
          <Link href="/panoramas" className="hidden sm:inline text-sm font-semibold text-teal-700">Ver todos →</Link>
        </div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {panoramas.map((p) => (
            <PanoramaCard key={p.id} panorama={p} />
          ))}
        </div>
      </section>

      {/* Frase promocional */}
      <section className="section mt-20">
        <div className="rounded-xl2 bg-forest-600 text-white p-10 sm:p-14 text-center">
          <h2 className="font-display text-2xl sm:text-3xl font-semibold mb-3">
            Vive una experiencia diferente recorriendo ríos, esteros y paisajes naturales de Ancud sobre una tabla SUP.
          </h2>
          <p className="text-forest-50/90">Navega, descubre y conecta con la naturaleza de Chiloé.</p>
        </div>
      </section>

      {/* Fauna / entorno — usando fotos reales de aves de la zona */}
      <section className="section mt-20">
        <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Naturaleza de Chiloé</p>
        <h2 className="text-2xl sm:text-3xl font-display font-semibold text-deep-800 mb-8">
          La fauna que te acompaña en el agua
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { src: "/images/martin-pescador.jpg", alt: "Martín pescador" },
            { src: "/images/cisnes-cuello-negro.jpg", alt: "Cisnes de cuello negro" },
            { src: "/images/flamencos.jpg", alt: "Flamencos" },
          ].map((f) => (
            <div key={f.src} className="relative h-64 rounded-xl2 overflow-hidden shadow-soft">
              <Image src={f.src} alt={f.alt} fill className="object-cover" />
            </div>
          ))}
        </div>
      </section>

      {/* FAQ preview */}
      <section className="section mt-20 mb-20">
        <h2 className="text-2xl sm:text-3xl font-display font-semibold text-deep-800 mb-6">Preguntas frecuentes</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {faq.map((f) => (
            <div key={f.id} className="card p-5">
              <h3 className="font-semibold text-deep-800 mb-1">{f.pregunta}</h3>
              <p className="text-sm text-deep-600">{f.respuesta}</p>
            </div>
          ))}
        </div>
        <Link href="/preguntas-frecuentes" className="inline-block mt-6 text-sm font-semibold text-teal-700">
          Ver todas las preguntas →
        </Link>
      </section>
    </div>
  );
}
