export const metadata = { title: "Términos y condiciones — Travesías AnSup" };

export default function TerminosPage() {
  return (
    <div className="section py-12 max-w-2xl prose prose-sm text-deep-600">
      <h1 className="text-3xl font-display font-semibold text-deep-800 mb-4">Términos y condiciones</h1>
      <ul className="list-disc list-inside space-y-2">
        <li>Toda solicitud de reserva queda sujeta a aprobación por parte de Travesías AnSup.</li>
        <li>El uso de chaleco salvavidas es obligatorio durante toda la actividad.</li>
        <li>La decisión de suspender una travesía por condiciones climáticas corresponde al administrador.</li>
        <li>Los menores de edad deben participar acompañados de un adulto responsable, según la edad mínima indicada en cada panorama.</li>
        <li>Las políticas de cancelación y devolución serán informadas al momento de aprobar tu reserva.</li>
      </ul>
      <p className="text-xs text-stone mt-8">
        Este texto es un contenido inicial de referencia. El administrador puede editarlo desde el panel
        administrativo → Configuración general.
      </p>
    </div>
  );
}
