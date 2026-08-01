import Image from "next/image";

export const metadata = { title: "Nuestra historia — Travesías AnSup" };

export default function NuestraHistoriaPage() {
  return (
    <div>
      <div className="relative h-72 w-full">
        <Image src="/images/grupo-tablas-cabana.jpg" alt="Equipo Travesías AnSup" fill className="object-cover" />
        <div className="absolute inset-0 bg-deep-900/50" />
        <div className="absolute inset-0 flex items-center">
          <h1 className="section text-3xl sm:text-4xl font-display font-semibold text-white">Nuestra historia</h1>
        </div>
      </div>

      <div className="section py-12 grid gap-10 lg:grid-cols-2">
        <div className="space-y-6 text-deep-600">
          <div>
            <h2 className="text-xl font-display font-semibold text-deep-800 mb-2">Cómo nació Travesías AnSup</h2>
            <p>Contenido a incorporar por el administrador desde el panel — Configuración → Nuestra historia.</p>
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-deep-800 mb-2">Misión, visión y valores</h2>
            <p>Contenido a incorporar por el administrador.</p>
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-deep-800 mb-2">Compromiso con la seguridad</h2>
            <p>Todas nuestras travesías son guiadas, incluyen chaleco salvavidas y siguen protocolos de seguridad en el agua. La decisión final de realizar o suspender una actividad por condiciones climáticas corresponde siempre al equipo de Travesías AnSup.</p>
          </div>
          <div>
            <h2 className="text-xl font-display font-semibold text-deep-800 mb-2">Turismo responsable</h2>
            <p>Contenido a incorporar por el administrador — cuidado de ríos y esteros, relación con la comunidad de Ancud.</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="relative h-48 rounded-xl overflow-hidden"><Image src="/images/grupo-celebrando-manos.jpg" alt="" fill className="object-cover" /></div>
          <div className="relative h-48 rounded-xl overflow-hidden mt-6"><Image src="/images/inspirador-remo-arriba.jpg" alt="" fill className="object-cover" /></div>
          <div className="relative h-48 rounded-xl overflow-hidden"><Image src="/images/grupo-selfie-sol.jpg" alt="" fill className="object-cover" /></div>
          <div className="relative h-48 rounded-xl overflow-hidden mt-6"><Image src="/images/accion-remando-lago.jpg" alt="" fill className="object-cover" /></div>
        </div>
      </div>
    </div>
  );
}
