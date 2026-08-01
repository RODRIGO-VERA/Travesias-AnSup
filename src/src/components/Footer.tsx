import Link from "next/link";
import { whatsappLink } from "@/lib/utils";
import { getSiteSettings } from "@/lib/db";

export default async function Footer() {
  const settings = await getSiteSettings();
  return (
    <footer className="mt-16 bg-deep-800" style={{ color: "#D9D3C5" }}>
      <div className="section py-12 grid gap-10 sm:grid-cols-3">
        <div>
          <h3 className="font-display text-xl font-semibold mb-2" style={{ color: "#F5F1E8" }}>
            Travesías AnSup
          </h3>
          <p className="text-sm" style={{ color: "#B8B3A5" }}>
            Navega, descubre y conecta con la naturaleza de Chiloé. Recorridos guiados sobre tablas SUP
            en ríos, esteros y sectores naturales de Ancud.
          </p>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-teal-300 mb-3">Explora</h4>
          <ul className="space-y-2 text-sm">
            <li><Link href="/panoramas" className="hover:text-teal-300 transition">Panoramas</Link></li>
            <li><Link href="/nuestra-historia" className="hover:text-teal-300 transition">Nuestra historia</Link></li>
            <li><Link href="/preguntas-frecuentes" className="hover:text-teal-300 transition">Preguntas frecuentes</Link></li>
            <li><Link href="/mi-reserva" className="hover:text-teal-300 transition">Revisar mi reserva</Link></li>
            <li><Link href="/privacidad" className="hover:text-teal-300 transition">Política de privacidad</Link></li>
            <li><Link href="/terminos" className="hover:text-teal-300 transition">Términos y condiciones</Link></li>
          </ul>
        </div>
        <div>
          <h4 className="text-sm font-semibold uppercase tracking-wide text-teal-300 mb-3">Contacto</h4>
          <ul className="space-y-2 text-sm">
            <li>
              <a href={whatsappLink("Hola, quiero consultar por Travesías AnSup.", settings.whatsapp_number)} target="_blank" rel="noreferrer" className="hover:text-teal-300 transition">
                WhatsApp
              </a>
            </li>
            <li>
              <a href={settings.instagram_url} target="_blank" rel="noreferrer" className="hover:text-teal-300 transition">
                Instagram @travesiasansup
              </a>
            </li>
            <li>Ancud, Chiloé, Chile</li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10 py-4 text-center text-xs" style={{ color: "#8A8578" }}>
        © {new Date().getFullYear()} Travesías AnSup — Todos los derechos reservados.
      </div>
    </footer>
  );
}
