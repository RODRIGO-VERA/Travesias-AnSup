export function formatCLP(valor: number): string {
  return new Intl.NumberFormat("es-CL", { style: "currency", currency: "CLP", maximumFractionDigits: 0 }).format(valor);
}

export function formatFecha(fecha: string): string {
  const [y, m, d] = fecha.split("-");
  return `${d}/${m}/${y}`;
}

export function whatsappLink(mensaje: string, numero?: string): string {
  const n = numero || process.env.NEXT_PUBLIC_WHATSAPP_NUMBER || "56900000000";
  return `https://wa.me/${n}?text=${encodeURIComponent(mensaje)}`;
}

export const ESTADO_COLORES: Record<string, string> = {
  "Solicitud recibida": "bg-stone-100 text-stone-700",
  "Pendiente de aprobación": "bg-amber-100 text-amber-800",
  "En revisión": "bg-amber-100 text-amber-800",
  "Pendiente de información": "bg-amber-100 text-amber-800",
  Aprobada: "bg-emerald-100 text-emerald-800",
  Confirmada: "bg-emerald-100 text-emerald-800",
  "Pendiente de pago": "bg-orange-100 text-orange-800",
  Pagada: "bg-emerald-100 text-emerald-800",
  "Cancelada por el cliente": "bg-red-100 text-red-800",
  "Cancelada por el administrador": "bg-red-100 text-red-800",
  "Suspendida por clima": "bg-sky-100 text-sky-800",
  Reprogramada: "bg-sky-100 text-sky-800",
  Rechazada: "bg-red-100 text-red-800",
  "Actividad completada": "bg-teal-100 text-teal-800",
  "No asistió": "bg-stone-200 text-stone-700",
};
