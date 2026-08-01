"use client";
import { useState } from "react";
import type { AdminUser, RolAdmin } from "@/types";
import { formatFecha } from "@/lib/utils";

export default function AdministradoresAdmin({ adminsIniciales, miId }: { adminsIniciales: AdminUser[]; miId: string }) {
  const [admins, setAdmins] = useState(adminsIniciales);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [password, setPassword] = useState("");
  const [rol, setRol] = useState<RolAdmin>("Administrador");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function crear(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password, rol }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setAdmins((prev) => [...prev, data.admin]);
      setNombre(""); setCorreo(""); setPassword(""); setRol("Administrador");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo crear el administrador.");
    } finally {
      setLoading(false);
    }
  }

  async function cambiarEstado(id: string, estado: "Activo" | "Inactivo") {
    await fetch("/api/admin/users", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, estado }),
    });
    setAdmins((prev) => prev.map((a) => (a.id === id ? { ...a, estado } : a)));
  }

  return (
    <div className="grid lg:grid-cols-3 gap-6">
      <form onSubmit={crear} className="card p-6 space-y-3 h-fit">
        <h2 className="font-semibold text-deep-800">Nuevo administrador</h2>
        <input required placeholder="Nombre completo" value={nombre} onChange={(e) => setNombre(e.target.value)} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <input required type="email" placeholder="Correo" value={correo} onChange={(e) => setCorreo(e.target.value)} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <input required type="password" placeholder="Contraseña inicial" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm" />
        <select value={rol} onChange={(e) => setRol(e.target.value as RolAdmin)} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm">
          <option value="Administrador">Administrador</option>
          <option value="Superadministrador">Superadministrador</option>
        </select>
        {error && <p className="text-sm text-red-500">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">{loading ? "Creando…" : "Crear administrador"}</button>
      </form>

      <div className="lg:col-span-2 card divide-y divide-sand-100">
        {admins.map((a) => (
          <div key={a.id} className="p-4 flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold text-deep-800 text-sm">
                {a.nombre} {a.id === miId && <span className="text-xs text-teal-400">(tú)</span>}
              </p>
              <p className="text-xs text-stone">{a.correo} · {a.rol}{a.ultimo_acceso ? ` · último acceso ${formatFecha(a.ultimo_acceso.slice(0, 10))}` : ""}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <span className={`badge ${a.estado === "Activo" ? "bg-emerald-100 text-emerald-800" : "bg-stone-200 text-stone-700"}`}>{a.estado}</span>
              {a.id !== miId && (
                <button
                  onClick={() => cambiarEstado(a.id, a.estado === "Activo" ? "Inactivo" : "Activo")}
                  className="text-xs font-medium text-teal-400"
                >
                  {a.estado === "Activo" ? "Desactivar" : "Activar"}
                </button>
              )}
            </div>
          </div>
        ))}
        {admins.length === 0 && <p className="p-6 text-center text-sm text-stone">Aún no hay otros administradores.</p>}
      </div>
    </div>
  );
}
