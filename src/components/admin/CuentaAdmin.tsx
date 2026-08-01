"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import type { AdminUser } from "@/types";

export default function CuentaAdmin({ admin }: { admin: AdminUser }) {
  const router = useRouter();
  const [nombre, setNombre] = useState(admin.nombre);
  const [correo, setCorreo] = useState(admin.correo);
  const [password, setPassword] = useState("");
  const [password2, setPassword2] = useState("");
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");
    if (password && password !== password2) {
      setError("Las contraseñas nuevas no coinciden.");
      return;
    }
    setLoading(true);
    try {
      const res = await fetch("/api/admin/account", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nombre, correo, password: password || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMensaje("Tus datos se actualizaron correctamente.");
      setPassword("");
      setPassword2("");
      router.refresh();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={guardar} className="card p-6 space-y-4">
      <div className="text-xs badge bg-sand-100 text-deep-700">{admin.rol}</div>
      <label className="block">
        <span className="text-sm font-medium text-deep-700">Nombre</span>
        <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5" />
      </label>
      <label className="block">
        <span className="text-sm font-medium text-deep-700">Correo</span>
        <input type="email" value={correo} onChange={(e) => setCorreo(e.target.value)} className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5" />
      </label>
      <div className="border-t border-sand-200 pt-4">
        <p className="text-sm font-medium text-deep-700 mb-2">Cambiar contraseña (opcional)</p>
        <div className="grid sm:grid-cols-2 gap-3">
          <input type="password" placeholder="Nueva contraseña" value={password} onChange={(e) => setPassword(e.target.value)} className="rounded-lg border border-sand-300 px-3 py-2.5" />
          <input type="password" placeholder="Repetir contraseña" value={password2} onChange={(e) => setPassword2(e.target.value)} className="rounded-lg border border-sand-300 px-3 py-2.5" />
        </div>
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {mensaje && <p className="text-sm text-teal-400">{mensaje}</p>}
      <button disabled={loading} className="btn-primary w-full">{loading ? "Guardando…" : "Guardar cambios"}</button>
    </form>
  );
}
