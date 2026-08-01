import { getGalleryImages } from "@/lib/db";
import GaleriaAdmin from "@/components/admin/GaleriaAdmin";

export default async function AdminGaleriaPage() {
  const images = await getGalleryImages();
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-display font-semibold text-deep-800 mb-1">Galería</h1>
      <p className="text-sm text-stone mb-6">
        Sube fotos generales que no pertenecen a un panorama específico. Se muestran en la página
        pública "Galería" junto con las fotos de cada panorama.
      </p>
      <GaleriaAdmin imagenesIniciales={images} />
    </div>
  );
}
