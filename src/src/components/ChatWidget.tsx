"use client";
import { useEffect, useState } from "react";
import { whatsappLink } from "@/lib/utils";

export default function ChatWidget() {
  const [open, setOpen] = useState(false);
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ nombre: "", telefono: "", panorama: "", mensaje: "" });
  const [loading, setLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setWhatsappNumber(d.settings?.whatsapp_number))
      .catch(() => {});
  }, []);

  async function enviar(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      await fetch("/api/consultas", { method: "POST", body: JSON.stringify(form), headers: { "Content-Type": "application/json" } });
      setSent(true);
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="fixed bottom-5 right-5 z-30 flex items-center gap-2 rounded-full bg-forest-600 px-5 py-3.5 text-white shadow-soft hover:bg-forest-800 transition"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
          <path d="M21 11.5a8.5 8.5 0 01-12.4 7.55L3 21l1.95-5.6A8.5 8.5 0 1121 11.5z" stroke="currentColor" strokeWidth="1.8" />
        </svg>
        <span className="text-sm font-semibold hidden sm:inline">¿Tienes dudas? Conversemos</span>
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-deep-900/40 p-4" onClick={() => setOpen(false)}>
          <div className="w-full max-w-sm rounded-xl2 bg-white p-6 shadow-soft" onClick={(e) => e.stopPropagation()}>
            {!sent ? (
              <>
                <h3 className="text-lg font-semibold text-deep-800 mb-4">¿Tienes dudas? Conversemos</h3>
                <form onSubmit={enviar} className="space-y-3">
                  <input required placeholder="Tu nombre" className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm"
                    value={form.nombre} onChange={(e) => setForm({ ...form, nombre: e.target.value })} />
                  <input required placeholder="Tu teléfono" className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm"
                    value={form.telefono} onChange={(e) => setForm({ ...form, telefono: e.target.value })} />
                  <input placeholder="Panorama de interés (opcional)" className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm"
                    value={form.panorama} onChange={(e) => setForm({ ...form, panorama: e.target.value })} />
                  <textarea required placeholder="Escribe tu consulta" rows={3} className="w-full rounded-lg border border-sand-300 px-3 py-2.5 text-sm"
                    value={form.mensaje} onChange={(e) => setForm({ ...form, mensaje: e.target.value })} />
                  <button disabled={loading} className="btn-primary w-full">{loading ? "Enviando…" : "Enviar consulta"}</button>
                </form>
                <a href={whatsappLink("Hola, quiero consultar por una travesía de Travesías AnSup.", whatsappNumber)} target="_blank" rel="noreferrer"
                  className="btn-whatsapp w-full mt-3">
                  Escribir por WhatsApp
                </a>
              </>
            ) : (
              <div className="text-center py-4">
                <p className="text-deep-700 font-medium mb-4">¡Gracias! Recibimos tu consulta y te contactaremos a la brevedad.</p>
                <button onClick={() => { setOpen(false); setSent(false); }} className="btn-secondary">Cerrar</button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}
