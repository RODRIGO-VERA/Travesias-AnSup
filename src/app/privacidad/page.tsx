export const metadata = { title: "Política de privacidad — Travesías AnSup" };

export default function PrivacidadPage() {
  return (
    <div className="section py-12 max-w-2xl prose prose-sm text-deep-600">
      <h1 className="text-3xl font-display font-semibold text-deep-800 mb-4">Política de privacidad</h1>
      <p>
        Travesías AnSup recopila los datos de contacto (nombre, teléfono y correo electrónico) que entregas
        voluntariamente al realizar una solicitud de reserva, con el único fin de gestionar dicha reserva,
        contactarte y enviarte confirmaciones relacionadas con tu travesía.
      </p>
      <p>
        Tus datos no serán compartidos con terceros salvo que sea necesario para prestar el servicio (por
        ejemplo, coordinación con el guía asignado). Puedes solicitar la eliminación de tus datos escribiendo
        por WhatsApp o correo electrónico.
      </p>
      <p className="text-xs text-stone mt-8">
        Este texto es un contenido inicial de referencia. El administrador puede editarlo desde el panel
        administrativo → Configuración general.
      </p>
    </div>
  );
}
