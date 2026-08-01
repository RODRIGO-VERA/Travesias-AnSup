"use client";
import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import StatusBadge from "@/components/StatusBadge";
import { formatCLP, formatFecha, whatsappLink } from "@/lib/utils";
import type { Booking, Panorama, Schedule, BookingStatusHistory } from "@/types";

export default function MiReservaPage() {
  return (
    <Suspense fallback={null}>
      <MiReservaContent />
    </Suspense>
  );
}

function MiReservaContent() {
  const params = useSearchParams();
  const [codigo, setCodigo] = useState(params.get("codigo") || "");
  const [contacto, setContacto] = useState("");
  const [resultado, setResultado] = useState<{ booking: Booking; panorama: Panorama; schedule: Schedule; historial: BookingStatusHistory[] } | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [whatsappNumber, setWhatsappNumber] = useState<string | undefined>(undefined);

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((d) => setWhatsappNumber(d.settings?.whatsapp_number))
      .catch(() => {});
  }, []);

  async function buscar(e?: React.FormEvent) {
    e?.preventDefault();
    setLoading(true);
    setError("");
    setResultado(null);
    try {
      const res = await fetch("/api/bookings/lookup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ codigo, contacto }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      setResultado(data);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "No se pudo consultar la reserva.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    // Si llega con ?codigo= desde la confirmación, solo precarga el campo (el contacto lo debe ingresar el cliente).
  }, []);

  return (
    <div className="section py-12 max-w-2xl">
      <p className="text-sm font-semibold uppercase tracking-wide text-teal-600">Travesías AnSup</p>
      <h1 className="text-3xl font-display font-semibold text-deep-800 mb-6">Revisar mi reserva</h1>

      <form onSubmit={buscar} className="card p-6 space-y-4 mb-8">
        <label className="block">
          <span className="text-sm font-medium text-deep-700">Código de reserva</span>
          <input required value={codigo} onChange={(e) => setCodigo(e.target.value)} placeholder="ANSUP-2026-0001"
            className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5" />
        </label>
        <label className="block">
          <span className="text-sm font-medium text-deep-700">Teléfono o correo usado al reservar</span>
          <input required value={contacto} onChange={(e) => setContacto(e.target.value)}
            className="mt-1 w-full rounded-lg border border-sand-300 px-3 py-2.5" />
        </label>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button disabled={loading} className="btn-primary w-full">{loading ? "Buscando…" : "Buscar reserva"}</button>
      </form>

      {resultado && (
        <div className="card p-6 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-display font-semibold text-deep-800">{resultado.panorama.nombre}</h2>
            <StatusBadge estado={resultado.booking.estado} />
          </div>
          <dl className="grid sm:grid-cols-2 gap-y-2 text-sm text-deep-600">
            <div><dt className="text-stone">Código</dt><dd className="font-medium text-deep-800">{resultado.booking.codigo_reserva}</dd></div>
            <div><dt className="text-stone">Fecha</dt><dd>{formatFecha(resultado.schedule.fecha)}</dd></div>
            <div><dt className="text-stone">Horario</dt><dd>{resultado.schedule.hora_inicio} – {resultado.schedule.hora_termino}</dd></div>
            <div><dt className="text-stone">Participantes</dt><dd>{resultado.booking.total_personas}</dd></div>
            <div><dt className="text-stone">Precio</dt><dd>{formatCLP(resultado.booking.valor_total)}</dd></div>
            <div><dt className="text-stone">Estado de pago</dt><dd>{resultado.booking.estado_pago}</dd></div>
            <div><dt className="text-stone">Punto de encuentro</dt><dd>{resultado.schedule.punto_encuentro || resultado.panorama.punto_encuentro}</dd></div>
          </dl>

          {resultado.booking.motivo_rechazo && (
            <p className="text-sm bg-red-50 text-red-700 rounded-lg p-3">{resultado.booking.motivo_rechazo}</p>
          )}

          <div>
            <h3 className="font-semibold text-deep-800 mb-3">Historial</h3>
            <ol className="space-y-3">
              {resultado.historial.map((h) => (
                <li key={h.id} className="flex gap-3 text-sm">
                  <div className="mt-1 h-2 w-2 rounded-full bg-teal-600 shrink-0" />
                  <div>
                    <p className="font-medium text-deep-800">{h.estado_nuevo}</p>
                    {h.mensaje_cliente && <p className="text-deep-600">{h.mensaje_cliente}</p>}
                    <p className="text-xs text-stone">{new Date(h.fecha_hora).toLocaleString("es-CL")}</p>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <a href={whatsappLink(`Hola, tengo una consulta sobre mi reserva ${resultado.booking.codigo_reserva}.`, whatsappNumber)} target="_blank" rel="noreferrer" className="btn-whatsapp w-full">
            Consultar por WhatsApp
          </a>
        </div>
      )}
    </div>
  );
}
