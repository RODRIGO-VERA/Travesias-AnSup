import { getPanoramas } from "@/lib/db";
import CarruselAdmin from "@/components/admin/CarruselAdmin";

export const dynamic = "force-dynamic";

export default async function AdminInicioPage() {
  const panoramas = await getPanoramas();
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-display font-semibold text-deep-800 mb-1">Fotos del carrusel de inicio</h1>
      <p className="text-sm text-stone mb-6">
        El carrusel de la página de inicio muestra automáticamente una foto por cada panorama: la que
        esté marcada como principal. Cámbiala aquí directamente, sin entrar a editar todo el panorama.
      </p>
      <CarruselAdmin panoramasIniciales={panoramas} />
    </div>
  );
}
