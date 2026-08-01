import Link from "next/link";
import { whatsappLink } from "@/lib/utils";

export default function Footer() {
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM || "https://instagram.com/travesiasansup";
  return (
    <footer className="mt-16 bg-deep-800 text-sand-100">
      <div className="section py-12 grid gap-10 sm:grid-cols-3">
        <div>
          <h3 className="font-display text-xl font-semibold mb-2">Travesías AnSup</h3>
          <p className="text-sm text-sand-100/80">
            Navega, descubre y conecta con la naturaleza de Chiloé. Recorridos guiados sobre tablas SUP
            en ríos, esteros y sectores naturales de Ancud.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-teal-300 mb-3">Explora</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/panoramas" className="hover:text-teal-300">Panoramas</Link></li>
            <li><Link href="/nuestra-historia" className="hover:text-teal-300">Nuestra historia</Link></li>
            <li><Link href="/preguntas-frecuentes" className="hover:text-teal-300">Preguntas frecuentes</Link></li>
            <li><Link href="/mi-reserva" className="hover:text-teal-300">Revisar mi reserva</Link></li>
            <li><Link href="/privacidad" className="hover:text-teal-300">Política de privacidad</Link></li>
            <li><Link href="/terminos" className="hover:text-teal-300">Términos y condiciones</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-teal-300 mb-3">Contacto</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={whatsappLink("Hola, quiero consultar por Travesías AnSup.")} target="_blank" rel="noreferrer" className="hover:text-teal-300">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={instagram} target="_blank" rel="noreferrer" className="hover:text-teal-300">
                Instagram @travesiasansup
              </a>
            </li>
            <li>Ancud, Chiloé, Chile</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs text-sand-100/60">
        © {new Date().getFullYear()} Travesías AnSup — Todos los derechos reservados.
      </div>
    </footer>
  );
}
