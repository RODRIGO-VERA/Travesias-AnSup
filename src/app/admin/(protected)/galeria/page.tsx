import { getTodasLasFotos } from "@/lib/db";
import GaleriaAdmin from "@/components/admin/GaleriaAdmin";

export default async function AdminGaleriaPage() {
  const todas = await getTodasLasFotos();
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-display font-semibold text-deep-800 mb-1">Galería</h1>
      <p className="text-sm text-stone mb-6">
        Todas las fotos del sitio: las de cada panorama y las sueltas que agregues aquí. Puedes
        renombrarlas o eliminarlas.
      </p>
      <GaleriaAdmin fotosIniciales={todas} />
    </div>
  );
}
