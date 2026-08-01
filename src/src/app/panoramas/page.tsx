import PanoramaCard from "@/components/PanoramaCard";
import { getPanoramas } from "@/lib/db";

export const dynamic = "force-dynamic";

export const metadata = { title: "Panoramas — Travesías AnSup" };

export default async function PanoramasPage() {
  const all = await getPanoramas();
  const panoramas = all.filter((p) => p.estado !== "No disponible");
  return (
    <div className="section py-12">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Travesías AnSup</p>
      <h1 className="text-3xl sm:text-4xl font-display font-semibold text-deep-800 mb-8">Nuestros panoramas</h1>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {panoramas.map((p) => (
          <PanoramaCard key={p.id} panorama={p} />
        ))}
      </div>
    </div>
  );
}
