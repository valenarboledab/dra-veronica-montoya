import {useRef, useState, type CSSProperties} from 'react';
import {beforeAfter, media, wa} from '../content';
import {Mark} from './icons';

type Case = (typeof beforeAfter)[number];

/** Una foto partida: al pasar el mouse (o arrastrar el dedo) se descubre el después. */
function Compare({item}: {item?: Case}) {
  const box = useRef<HTMLDivElement>(null);
  const [x, setX] = useState(50);
  const move = (clientX: number) => {
    const r = box.current?.getBoundingClientRect();
    if (r) setX(Math.min(100, Math.max(0, ((clientX - r.left) / r.width) * 100)));
  };
  const placeholder = (label: string) => (
    <div className="absolute inset-0 grid place-items-center pb-32 bg-linear-to-br from-blush to-[#f5f2ea]">
      <div className="flex flex-col items-center gap-2 text-center text-small text-mute">
        <Mark className="size-9 opacity-70" />
        {label}
      </div>
    </div>
  );
  return (
    <figure className="glass overflow-hidden rounded-3xl">
      <div
        ref={box}
        className="relative aspect-[4/5] cursor-ew-resize touch-pan-y select-none"
        onPointerMove={(e) => move(e.clientX)}
        onPointerDown={(e) => move(e.clientX)}
        role="slider"
        aria-label="Comparar antes y después"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={Math.round(x)}
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'ArrowLeft') setX((v) => Math.max(0, v - 5));
          if (e.key === 'ArrowRight') setX((v) => Math.min(100, v + 5));
        }}
      >
        {/* después debajo, antes encima recortado */}
        {item ? (
          <img src={media(item.after)} alt={`Después: ${item.title}`} className="absolute inset-0 size-full object-cover" draggable={false} />
        ) : (
          placeholder('Foto real del después')
        )}
        <div className="absolute inset-0" style={{clipPath: `inset(0 ${100 - x}% 0 0)`} as CSSProperties}>
          {item ? (
            <img src={media(item.before)} alt={`Antes: ${item.title}`} className="absolute inset-0 size-full object-cover" draggable={false} />
          ) : (
            <div className="absolute inset-0 grid place-items-center pb-32 bg-linear-to-br from-[#ece7d9] to-[#ded8c6]">
              <div className="flex flex-col items-center gap-2 text-center text-small text-mute">
                <Mark className="size-9 opacity-70" />
                Foto real del antes
              </div>
            </div>
          )}
        </div>
        <div className="pointer-events-none absolute inset-y-0 w-px bg-white shadow-[0_0_12px_rgb(0_0_0/0.25)]" style={{left: `${x}%`}}>
          <span className="glass absolute top-1/2 left-1/2 grid size-10 -translate-1/2 place-items-center rounded-full text-ink">
            <svg viewBox="0 0 16 16" className="size-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
              <path d="M6 4 2 8l4 4M10 4l4 4-4 4" />
            </svg>
          </span>
        </div>
        <span className="glass absolute top-3 left-3 rounded-full px-2.5 py-1 text-micro font-medium uppercase">Antes</span>
        <span className="glass absolute top-3 right-3 rounded-full px-2.5 py-1 text-micro font-medium uppercase">Después</span>
      </div>
      <figcaption className="flex items-baseline justify-between gap-3 px-5 py-4 text-small">
        <span className="font-medium">{item?.title ?? 'Próximamente'}</span>
        <span className="text-mute">{item?.note ?? 'Paciente real, con su autorización'}</span>
      </figcaption>
    </figure>
  );
}

/** Resultados: solo fotos reales de pacientes que firmaron su autorización. */
export function Results() {
  const items = beforeAfter as readonly Case[];
  const list: (Case | undefined)[] = items.length ? [...items] : [undefined, undefined, undefined];
  return (
    <>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {list.map((it, i) => (
          <Compare key={i} item={it} />
        ))}
      </div>
      <p className="mt-6 max-w-[46rem] text-[0.75rem] text-mute">
        Fotos de pacientes reales de la Dra. Verónica Montoya, publicadas con su consentimiento informado y firmado. Sin
        retoques. Los resultados varían en cada persona y no se pueden garantizar.
      </p>
      <a href={wa('Hola Dra. Verónica, vi los resultados y quiero una valoración.')} className="mt-6 inline-flex rounded-full bg-ink px-6 py-3 text-small font-medium text-paper hover:bg-coral">
        Quiero mi valoración
      </a>
    </>
  );
}
