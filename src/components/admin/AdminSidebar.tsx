"use client";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

const LINKS = [
  { href: "/admin", label: "Panel general", icon: "📊" },
  { href: "/admin/reservas", label: "Reservas", icon: "🗓️" },
  { href: "/admin/panoramas", label: "Panoramas", icon: "🏞️" },
  { href: "/admin/galeria", label: "Galería", icon: "🖼️" },
  { href: "/admin/codigos", label: "Códigos de reserva", icon: "🔑" },
  { href: "/admin/equipamiento", label: "Equipamiento", icon: "🧰" },
  { href: "/admin/plantillas", label: "Plantillas de aprobación", icon: "✉️" },
  { href: "/admin/avisos", label: "Avisos", icon: "📢" },
  { href: "/admin/estadisticas", label: "Estadísticas", icon: "📈" },
  { href: "/admin/configuracion", label: "Configuración general", icon: "⚙️" },
  { href: "/admin/administradores", label: "Administradores", icon: "👥" },
  { href: "/admin/cuenta", label: "Mi cuenta", icon: "🔐" },
];

export default function AdminSidebar({ email }: { email: string }) {
  const pathname = usePathname();
  const router = useRouter();

  async function cerrarSesion() {
    await fetch("/api/admin/login", { method: "DELETE" });
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <aside className="w-64 shrink-0 hidden md:flex flex-col border-r border-sand-200 bg-white">
      <div className="p-5 border-b border-sand-200">
        <p className="font-display font-semibold text-deep-800">Travesías AnSup</p>
        <p className="text-xs text-stone">Panel administrativo</p>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {LINKS.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
              pathname === l.href ? "bg-teal-50 text-teal-700" : "text-deep-600 hover:bg-sand-50"
            }`}
          >
            <span>{l.icon}</span>
            {l.label}
          </Link>
        ))}
      </nav>
      <div className="p-4 border-t border-sand-200">
        <p className="text-xs text-stone truncate mb-2">{email}</p>
        <button onClick={cerrarSesion} className="text-sm font-medium text-red-600 hover:underline">
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
