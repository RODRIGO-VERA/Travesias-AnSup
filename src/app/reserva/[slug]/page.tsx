import { notFound } from "next/navigation";
import { getPanoramaBySlug, getSchedulesByPanorama, getEquipment } from "@/lib/db";
import BookingFlow from "@/components/BookingFlow";

export const dynamic = "force-dynamic";

export default async function ReservaPage({ params }: { params: { slug: string } }) {
  const panorama = await getPanoramaBySlug(params.slug);
  if (!panorama) notFound();
  const [allSchedules, equipment] = await Promise.all([
    getSchedulesByPanorama(panorama.id),
    getEquipment(),
  ]);
  const schedules = allSchedules.filter((s) => s.fecha >= new Date().toISOString().slice(0, 10));

  return (
    <div className="section py-10">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Reservar travesía</p>
      <h1 className="text-3xl font-display font-semibold text-deep-800 mb-8">{panorama.nombre}</h1>
      <BookingFlow panorama={panorama} schedules={schedules} equipment={equipment} />
    </div>
  );
}
