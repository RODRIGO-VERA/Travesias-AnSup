import { getCodes, getPanoramas } from "@/lib/db";
import CodigosAdmin from "@/components/admin/CodigosAdmin";

export const dynamic = "force-dynamic";

export default async function AdminCodigosPage() {
  const [codigos, panoramas] = await Promise.all([getCodes(), getPanoramas()]);
  return (
    <div className="p-6 sm:p-8">
      <h1 className="text-2xl font-display font-semibold text-deep-800 mb-1">Códigos de reserva</h1>
      <p className="text-sm text-stone mb-6">Crea códigos automáticos o personalizados para grupos, empresas o invitados.</p>
      <CodigosAdmin codigosIniciales={codigos} panoramas={panoramas} />
    </div>
  );
}
