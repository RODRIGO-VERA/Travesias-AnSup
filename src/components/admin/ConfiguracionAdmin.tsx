"use client";
import { useState } from "react";
import type { SiteSettings } from "@/types";

export default function ConfiguracionAdmin({ settingsIniciales }: { settingsIniciales: SiteSettings }) {
  const [whatsapp, setWhatsapp] = useState(settingsIniciales.whatsapp_number);
  const [instagram, setInstagram] = useState(settingsIniciales.instagram_url);
  const [loading, setLoading] = useState(false);
  const [mensaje, setMensaje] = useState("");
  const [error, setError] = useState("");

  async function guardar(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setMensaje("");
    setLoading(true);
    try {
      const res = await fetch("/api/settings", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ whatsapp_number: whatsapp, instagram_url: instagram }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setMensaje("Configuración guardada. Ya está activa en todo el sitio.");
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "No se pudo guardar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={guardar} className="card p-6 space-y-4">
      <label className="block">
        <span className="text-sm font-medium text-deep-700">Número de WhatsApp de contacto</span>
        <input
          value={whatsapp}
          onChange={(e) => setWhatsapp(e.target.value)}
          placeholder="56912345678"
          className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5"
        />
        <span className="text-xs text-stone">Formato: código de país + número, sin espacios ni "+". Ej: 56912345678</span>
      </label>
      <label className="block">
        <span className="text-sm font-medium text-deep-700">Link de Instagram</span>
        <input
          value={instagram}
          onChange={(e) => setInstagram(e.target.value)}
          placeholder="https://instagram.com/travesiasansup"
          className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5"
        />
      </label>
      {error && <p className="text-sm text-red-500">{error}</p>}
      {mensaje && <p className="text-sm text-teal-400">{mensaje}</p>}
      <button disabled={loading} className="btn-primary w-full">{loading ? "Guardando…" : "Guardar configuración"}</button>
    </form>
  );
}
