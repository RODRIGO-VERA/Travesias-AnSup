import { getSiteSettings } from "@/lib/db";
import ConfiguracionAdmin from "@/components/admin/ConfiguracionAdmin";

export default async function AdminConfiguracionPage() {
  const settings = await getSiteSettings();

  return (
    <div className="p-6 sm:p-8 max-w-lg">
      <h1 className="text-2xl font-display font-semibold text-deep-800 mb-1">Configuración general</h1>
      <p className="text-sm text-stone mb-6">
        Cambios aquí se aplican de inmediato en todo el sitio (botones de WhatsApp, Instagram) sin
        necesidad de tocar código ni volver a desplegar.
      </p>
      <ConfiguracionAdmin settingsIniciales={settings} />
    </div>
  );
}
