import {useEffect, useRef, useState, type ReactNode} from 'react';
import {POLICY_VERSION, wa} from '../content';

/** Texto de la autorización obligatoria (el mismo en el formulario y en cada botón de WhatsApp). */
export function ConsentText() {
  return (
    <>
      <b className="font-semibold text-ink">Obligatorio.</b> Autorizo de manera previa, expresa e informada a EXORA (Dra. Verónica Montoya y Dra. Susana Zárate) para recolectar, almacenar y usar mi nombre, celular y la información que comparta, con el fin de agendar, confirmar y gestionar mi cita y comunicarme con ellas, conforme a la Ley 1581 de 2012 y la{' '}
      <a href="#privacidad" target="_blank" rel="noopener" className="underline hover:text-coral">
        Política de Tratamiento de Datos
      </a>
      . Sé que puedo conocer, actualizar, rectificar o pedir la supresión de mis datos y revocar esta autorización.
    </>
  );
}

export const consentLine = (promo: boolean) =>
  `✔ Autorizo el tratamiento de mis datos personales (nombre, celular y la información de esta conversación) para agendar y gestionar mi cita, según la Política de Tratamiento de Datos de EXORA, versión ${POLICY_VERSION}.` +
  (promo ? '\n✔ Acepto recibir información de tratamientos y promociones por WhatsApp.' : '');

const EVENT = 'exora-wa';
/** Pide la autorización antes de abrir WhatsApp con este mensaje. */
export const askWhatsApp = (text: string) => window.dispatchEvent(new CustomEvent(EVENT, {detail: text}));

/** Enlace a WhatsApp que siempre pasa por la autorización de datos. */
export function WaLink({text, className, children, label}: {text: string; className?: string; children: ReactNode; label?: string}) {
  return (
    <a
      href={wa(text)}
      aria-label={label}
      className={className}
      onClick={(e) => {
        e.preventDefault();
        askWhatsApp(text);
      }}
    >
      {children}
    </a>
  );
}

/** Ventana de autorización; se monta una sola vez en la app. */
export function ConsentDialog() {
  const ref = useRef<HTMLDialogElement>(null);
  const [text, setText] = useState('');
  const [ok, setOk] = useState(false);
  const [promo, setPromo] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    const open = (e: Event) => {
      setText((e as CustomEvent<string>).detail);
      setOk(false);
      setPromo(false);
      setTried(false);
      ref.current?.showModal();
    };
    window.addEventListener(EVENT, open);
    return () => window.removeEventListener(EVENT, open);
  }, []);

  const go = () => {
    if (!ok) {
      setTried(true);
      return;
    }
    window.open(wa(`${text}\n\n${consentLine(promo)}`), '_blank', 'noopener');
    ref.current?.close();
  };

  const box = 'mt-0.5 size-5 shrink-0 accent-[#7f7a52]';
  return (
    <dialog
      ref={ref}
      aria-labelledby="consent-title"
      className="m-auto w-[min(30rem,92vw)] rounded-3xl border-0 bg-paper p-6 text-ink shadow-2xl backdrop:bg-[#3b3823]/45 backdrop:backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <p id="consent-title" className="font-display text-[1.5rem] leading-tight">
        Antes de escribirnos
      </p>
      <p className="mt-1 text-small text-mute">Para atenderte por WhatsApp necesitamos tu autorización de datos.</p>
      <label className={`mt-4 flex gap-3 rounded-xl border p-3 text-[0.78rem] leading-snug text-ink/80 ${tried && !ok ? 'border-[#a87350]' : 'border-line'}`}>
        <input type="checkbox" className={box} checked={ok} onChange={(e) => setOk(e.target.checked)} />
        <span>
          <ConsentText />
        </span>
      </label>
      <label className="mt-3 flex gap-3 px-3 text-[0.78rem] leading-snug text-ink/70">
        <input type="checkbox" className={box} checked={promo} onChange={(e) => setPromo(e.target.checked)} />
        <span>Opcional. Acepto recibir por WhatsApp información de tratamientos, recordatorios y promociones de EXORA.</span>
      </label>
      <p className="mt-3 min-h-4 text-[0.72rem] text-[#a87350]" aria-live="polite">
        {tried && !ok ? 'Debes aceptar la autorización para continuar.' : ''}
      </p>
      <div className="mt-2 flex flex-wrap justify-end gap-3">
        <button type="button" onClick={() => ref.current?.close()} className="min-h-11 cursor-pointer rounded-full px-5 text-small text-mute hover:text-ink">
          Cancelar
        </button>
        <button
          type="button"
          onClick={go}
          aria-disabled={!ok}
          className={`min-h-11 rounded-full px-6 text-small font-medium text-paper transition-colors ${ok ? 'cursor-pointer bg-[#25d366] hover:bg-[#1ebe5a]' : 'cursor-not-allowed bg-ink/25'}`}
        >
          Continuar en WhatsApp
        </button>
      </div>
    </dialog>
  );
}
