import { getFaq } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Preguntas frecuentes — Travesías AnSup" };

export default async function FaqPage() {
  const all = await getFaq();
  const faq = all.filter((f) => f.activo);
  return (
    <div className="section py-12 max-w-3xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Travesías AnSup</p>
      <h1 className="text-3xl font-display font-semibold text-deep-800 mb-8">Preguntas frecuentes</h1>
      <div className="divide-y divide-sand-200 card">
        {faq.map((f) => (
          <details key={f.id} className="group p-5">
            <summary className="flex cursor-pointer list-none items-center justify-between font-medium text-deep-800">
              {f.pregunta}
              <span className="text-teal-600 group-open:rotate-45 transition">+</span>
            </summary>
            <p className="mt-2 text-sm text-deep-600">{f.respuesta}</p>
          </details>
        ))}
      </div>
    </div>
  );
}
