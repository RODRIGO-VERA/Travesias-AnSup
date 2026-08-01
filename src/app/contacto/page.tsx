import { whatsappLink } from "@/lib/utils";

export const metadata = { title: "Contacto — Travesías AnSup" };

export default function ContactoPage() {
  const instagram = process.env.NEXT_PUBLIC_INSTAGRAM || "https://instagram.com/travesiasansup";
  return (
    <div className="section py-16 max-w-lg text-center">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Travesías AnSup</p>
      <h1 className="text-3xl font-display font-semibold text-deep-800 mb-4">Contacto</h1>
      <p className="text-deep-600 mb-8">Ancud, Chiloé, Chile. Escríbenos por WhatsApp o síguenos en Instagram.</p>
      <div className="flex flex-col gap-3">
        <a href={whatsappLink("Hola, quiero consultar por Travesías AnSup.")} target="_blank" rel="noreferrer" className="btn-whatsapp w-full">
          Escribir por WhatsApp
        </a>
        <a href={instagram} target="_blank" rel="noreferrer" className="btn-secondary w-full">
          Instagram @travesiasansup
        </a>
      </div>
    </div>
  );
}
