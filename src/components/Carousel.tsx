"use client";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

export interface CarouselSlide {
  url: string;
  titulo: string;
  descripcion: string;
  href: string;
}

export default function Carousel({ slides, intervalMs = 5000 }: { slides: CarouselSlide[]; intervalMs?: number }) {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const touchStartX = useRef(0);

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), intervalMs);
    return () => clearInterval(t);
  }, [paused, slides.length, intervalMs]);

  function onTouchStart(e: React.TouchEvent) {
    touchStartX.current = e.touches[0].clientX;
  }
  function onTouchEnd(e: React.TouchEvent) {
    const diff = e.changedTouches[0].clientX - touchStartX.current;
    if (diff > 50) setIndex((i) => (i - 1 + slides.length) % slides.length);
    if (diff < -50) setIndex((i) => (i + 1) % slides.length);
  }

  const slide = slides[index];

  return (
    <div
      className="relative w-full aspect-[3/2] max-h-[480px] overflow-hidden rounded-b-xl2 sm:rounded-xl2"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={onTouchStart}
      onTouchEnd={onTouchEnd}
    >
      {slides.map((s, i) => (
        <div key={s.url} className={`absolute inset-0 transition-opacity duration-700 ${i === index ? "opacity-100" : "opacity-0"}`}>
          <Image src={s.url} alt={s.titulo} fill priority={i === 0} className="object-cover object-[center_25%]" sizes="100vw" />
          <div className="absolute inset-0 bg-gradient-to-t from-deep-900/80 via-deep-900/10 to-transparent" />
        </div>
      ))}

      <div className="absolute inset-x-0 bottom-0 p-6 sm:p-10" style={{ color: "#F5F1E8" }}>
        <p className="text-xs font-semibold uppercase tracking-wide text-teal-300 mb-1">Panorama</p>
        <h2 className="text-2xl sm:text-3xl font-display font-semibold mb-2">{slide.titulo}</h2>
        <p className="text-sm sm:text-base max-w-xl mb-4" style={{ color: "#E4DFD3" }}>{slide.descripcion}</p>
        <Link href={slide.href} className="btn-primary">
          Ver panorama
        </Link>
      </div>

      <button
        aria-label="Anterior"
        onClick={() => setIndex((i) => (i - 1 + slides.length) % slides.length)}
        className="hidden sm:grid absolute left-3 top-1/2 -translate-y-1/2 h-10 w-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30"
      >
        ‹
      </button>
      <button
        aria-label="Siguiente"
        onClick={() => setIndex((i) => (i + 1) % slides.length)}
        className="hidden sm:grid absolute right-3 top-1/2 -translate-y-1/2 h-10 w-10 place-items-center rounded-full bg-white/20 text-white backdrop-blur hover:bg-white/30"
      >
        ›
      </button>

      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-2">
        {slides.map((s, i) => (
          <button
            key={s.url}
            aria-label={`Ir a la imagen ${i + 1}`}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? "w-6 bg-teal-300" : "w-1.5 bg-white/50"}`}
          />
        ))}
      </div>
    </div>
  );
}
