import { ESTADO_COLORES } from "@/lib/utils";

export default function StatusBadge({ estado }: { estado: string }) {
  const cls = ESTADO_COLORES[estado] || "bg-stone-100 text-stone-700";
  return <span className={`badge ${cls}`}>{estado}</span>;
}
