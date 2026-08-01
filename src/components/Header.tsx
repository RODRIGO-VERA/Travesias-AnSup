"use client";
import Link from "next/link";
import Image from "next/image";
import { useState } from "react";

const LINKS = [
  { href: "/", label: "Inicio" },
  { href: "/panoramas", label: "Panoramas" },
  { href: "/panoramas", label: "Disponibilidad" },
  { href: "/galeria", label: "Galería" },
  { href: "/nuestra-historia", label: "Nuestra historia" },
  { href: "/mi-reserva", label: "Revisar mi reserva" },
  { href: "/preguntas-frecuentes", label: "Preguntas frecuentes" },
  { href: "/contacto", label: "Contacto" },
];

export default function Header() {
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-sand-200 bg-sand-50/95 backdrop-blur">
      <div className="section flex h-16 items-center justify-between gap-6">
        <Link href="/" className="flex items-center shrink-0" aria-label="Travesías AnSup — Inicio">
          <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-2xl ring-1 ring-teal-500/40">
            <Image src="/images/logo-oficial-icono.png" alt="Travesías AnSup" fill className="object-cover" />
          </div>
        </Link>

        <nav className="hidden lg:flex items-center gap-5 flex-1 justify-center min-w-0">
          {LINKS.map((l) => (
            <Link
              key={l.label}
              href={l.href}
              className="text-sm font-medium text-deep-600 hover:text-teal-600 transition whitespace-nowrap"
            >
              {l.label}
            </Link>
          ))}
        </nav>

        <div className="hidden lg:flex items-center gap-3 shrink-0">
          <InstallMenuButton />
          <Link href="/admin/login" className="text-xs text-stone/70 hover:text-stone underline underline-offset-2 whitespace-nowrap">
            Administrador
          </Link>
        </div>

        <button
          className="lg:hidden grid h-10 w-10 shrink-0 place-items-center rounded-full border border-sand-300"
          onClick={() => setOpen((v) => !v)}
          aria-label="Abrir menú"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M4 7h16M4 12h16M4 17h16" stroke="#D9D3C5" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-sand-200 bg-sand-50">
          <nav className="section flex flex-col py-3">
            {LINKS.map((l) => (
              <Link
                key={l.label}
                href={l.href}
                onClick={() => setOpen(false)}
                className="py-3 text-base font-medium text-deep-700 border-b border-sand-100 last:border-0"
              >
                {l.label}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-3">
              <InstallMenuButton />
              <Link href="/admin/login" onClick={() => setOpen(false)} className="text-xs text-stone/70 underline">
                Administrador
              </Link>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}

function InstallMenuButton() {
  return (
    <button
      id="ansup-install-trigger"
      title="Instalar aplicación"
      className="grid h-8 w-8 place-items-center rounded-full border border-teal-500 text-teal-500 hover:bg-teal-50/10 transition shrink-0"
      data-ansup-install
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
        <path d="M12 3v12M8 11l4 4 4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 19h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
    </button>
  );
}
