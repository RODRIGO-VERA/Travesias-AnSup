"use client";
import { useEffect, useState } from "react";

// Sección 3-5 de la pauta: instalación como primera opción, nunca obligatoria.
type BIPEvent = Event & { prompt: () => Promise<void>; userChoice: Promise<{ outcome: string }> };

function isStandalone() {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia("(display-mode: standalone)").matches ||
    // @ts-expect-error iOS Safari
    window.navigator.standalone === true
  );
}

function isIOS() {
  if (typeof navigator === "undefined") return false;
  const ua = /iphone|ipad|ipod/i.test(navigator.userAgent) && !("MSStream" in window);
  // iPadOS 13+ en modo "Solicitar sitio de escritorio" se identifica como
  // Mac normal, pero sigue siendo táctil — lo detectamos igual.
  const iPadEscritorio = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return ua || iPadEscritorio;
}

const DISMISS_KEY = "ansup_install_dismissed_at";

export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null);
  const [show, setShow] = useState(false);
  const [iosInstructions, setIosInstructions] = useState(false);
  const [manualInstructions, setManualInstructions] = useState(false);
  const [justInstalled, setJustInstalled] = useState(false);

  useEffect(() => {
    if (isStandalone()) return; // Regla 7: nunca mostrar en modo instalado.

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferred(e as BIPEvent);
      maybeShow();
    };
    window.addEventListener("beforeinstallprompt", handler);

    window.addEventListener("appinstalled", () => {
      setShow(false);
      setJustInstalled(true);
      setTimeout(() => setJustInstalled(false), 6000);
    });

    // En iOS no existe beforeinstallprompt: mostramos igual la invitación,
    // con instrucciones manuales (sección 5).
    if (isIOS()) maybeShow();

    // Botón "Instalar aplicación" del menú (Header) reabre la ventana.
    const trigger = () => {
      if (isIOS()) setIosInstructions(true);
      else setShow(true);
    };
    document.querySelectorAll("[data-ansup-install]").forEach((el) => el.addEventListener("click", trigger));

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      document.querySelectorAll("[data-ansup-install]").forEach((el) => el.removeEventListener("click", trigger));
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function maybeShow() {
    const dismissed = sessionStorage.getItem(DISMISS_KEY);
    if (!dismissed) setShow(true);
  }

  function continuarWeb() {
    sessionStorage.setItem(DISMISS_KEY, "1");
    setShow(false);
  }

  async function instalar() {
    if (isIOS()) {
      setIosInstructions(true);
      return;
    }
    if (!deferred) {
      // El navegador no ofreció el instalador automático (pasa en Firefox,
      // Safari de escritorio, o si Chrome aún no detectó suficiente
      // interacción). En vez de no hacer nada, mostramos instrucciones
      // manuales para que la persona pueda instalarla igual.
      setShow(false);
      setManualInstructions(true);
      return;
    }
    await deferred.prompt();
    await deferred.userChoice;
    setDeferred(null);
    setShow(false);
  }

  return (
    <>
      {show && !iosInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-deep-900/50 p-4">
          <div className="w-full max-w-md rounded-xl2 bg-white p-6 shadow-soft">
            <div className="flex items-center gap-3 mb-4">
              <div className="grid h-11 w-11 place-items-center rounded-xl bg-deep-600 text-white shrink-0">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                  <path d="M2 18c2 1.2 4 1.2 6 0s4-1.2 6 0 4 1.2 6 0" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M12 3v11M8 6l4-3 4 3" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <h2 className="text-xl font-semibold text-deep-800">Instala Travesías AnSup</h2>
            </div>
            <p className="text-sm text-deep-600 mb-4">
              Accede más rápido a nuestros panoramas, revisa fechas disponibles y realiza tus reservas
              directamente desde tu celular.
            </p>
            <ul className="text-sm text-deep-600 space-y-1.5 mb-6">
              <li>• Acceso rápido desde la pantalla de inicio</li>
              <li>• Consulta inmediata de panoramas y cupos</li>
              <li>• Reservas más rápidas y acceso directo a WhatsApp</li>
            </ul>
            <div className="flex flex-col gap-3">
              <button onClick={instalar} className="btn-primary w-full text-base py-3.5">
                Instalar aplicación
              </button>
              <button onClick={continuarWeb} className="text-sm font-medium text-deep-600 underline underline-offset-2">
                Continuar en la versión web
              </button>
            </div>
          </div>
        </div>
      )}

      {iosInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-deep-900/50 p-4">
          <div className="w-full max-w-md rounded-xl2 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-deep-800 mb-4">Instala Travesías AnSup en tu iPhone o iPad</h2>
            <ol className="space-y-4 text-sm text-deep-700">
              <li className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700 font-semibold">1</span>
                Abre esta página utilizando <strong>Safari</strong> (no funciona desde Chrome en iPhone/iPad).
              </li>
              <li className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700 font-semibold">2</span>
                Presiona el botón <strong>Compartir</strong>&nbsp;
                <svg className="inline" width="16" height="16" viewBox="0 0 24 24" fill="none"><path d="M12 3v12M8 7l4-4 4 4M5 13v6a2 2 0 002 2h10a2 2 0 002-2v-6" stroke="#0E3A4C" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                &nbsp;(la barra de abajo o de arriba, según el modelo).
              </li>
              <li className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700 font-semibold">3</span>
                Desliza y selecciona <strong>"Agregar a pantalla de inicio"</strong>.
              </li>
              <li className="flex gap-3">
                <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-teal-100 text-teal-700 font-semibold">4</span>
                Confirma presionando <strong>"Agregar"</strong>.
              </li>
            </ol>
            <div className="flex flex-col gap-3 mt-6">
              <button onClick={() => setIosInstructions(false)} className="btn-primary w-full">
                Entendido
              </button>
              <button onClick={() => { setIosInstructions(false); continuarWeb(); }} className="text-sm font-medium text-deep-600 underline underline-offset-2">
                Continuar en la versión web
              </button>
            </div>
          </div>
        </div>
      )}

      {manualInstructions && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-deep-900/50 p-4">
          <div className="w-full max-w-md rounded-xl2 bg-white p-6 shadow-soft">
            <h2 className="text-xl font-semibold text-deep-800 mb-4">Instala Travesías AnSup</h2>
            <p className="text-sm text-deep-600 mb-4">
              Tu navegador no ofreció la instalación automática. Puedes instalarla manualmente:
            </p>
            <div className="space-y-4 text-sm text-deep-700">
              <div>
                <p className="font-semibold mb-1">En computador — Chrome o Edge</p>
                <p>Busca el ícono de instalación ⊕ o 💻 en la barra de direcciones (a la derecha, junto a la URL) y haz clic ahí.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">En celular Android — Chrome</p>
                <p>Abre el menú ⋮ (tres puntos, arriba a la derecha) → busca <strong>"Instalar aplicación"</strong> o <strong>"Agregar a pantalla de inicio"</strong>.</p>
              </div>
              <div>
                <p className="font-semibold mb-1">Firefox o Safari de escritorio</p>
                <p>Estos navegadores no soportan instalar aplicaciones web todavía. Puedes seguir usando el sitio normalmente, o abrirlo desde Chrome/Edge para instalarlo.</p>
              </div>
            </div>
            <div className="flex flex-col gap-3 mt-6">
              <button onClick={() => { setManualInstructions(false); continuarWeb(); }} className="btn-primary w-full">
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {justInstalled && (
        <div className="fixed bottom-4 left-1/2 z-50 -translate-x-1/2 rounded-full bg-forest-600 px-5 py-3 text-sm font-medium text-white shadow-soft">
          ¡Travesías AnSup fue instalada correctamente! Ahora puedes acceder desde la pantalla de inicio.
        </div>
      )}
    </>
  );
}
