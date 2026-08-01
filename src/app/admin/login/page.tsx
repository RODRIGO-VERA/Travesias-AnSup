"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      router.push("/admin");
      router.refresh();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo iniciar sesión.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[70vh] grid place-items-center px-4">
      <div className="w-full max-w-sm card p-8">
        <h1 className="text-xl font-display font-semibold text-deep-800 mb-1">Travesías AnSup</h1>
        <p className="text-sm text-stone mb-6">Panel administrativo</p>
        <form onSubmit={onSubmit} className="space-y-4">
          <label className="block">
            <span className="text-sm font-medium text-deep-700">Usuario o correo</span>
            <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5" />
          </label>
          <label className="block">
            <span className="text-sm font-medium text-deep-700">Contraseña</span>
            <input required type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5" />
          </label>
          {error && <p className="text-sm text-red-600">{error}</p>}
          <button disabled={loading} className="btn-primary w-full">{loading ? "Ingresando…" : "Iniciar sesión"}</button>
        </form>
        <p className="text-xs text-stone mt-4">
          ¿Olvidaste tu contraseña? Revisa el README del proyecto para regenerarla con el script incluido.
        </p>
      </div>
    </div>
  );
}
