import {useEffect, useRef, useState} from 'react';
import '../anatomy-theme.css';

type Figure = {id: string; title: string; svg: string; lift: string; layer: string; tool: string; reads: string; caption: string; pulse: boolean};

const cache = new Map<string, Promise<Figure>>();
const load = (id: string) => {
  if (!cache.has(id)) cache.set(id, fetch(`${import.meta.env.BASE_URL}anatomy/${id}.json`).then((r) => r.json()));
  return cache.get(id)!;
};

const LEGEND: [string, string][] = [
  ['#faf6f0', 'Epidermis'],
  ['#efe4dc', 'Dermis'],
  ['#f1e6c2', 'Tejido graso'],
  ['#d9b49a', 'Músculo'],
];

/** Figura isométrica de un procedimiento: el instrumento baja hasta su capa y deja su marca. */
export function AnatomyFigure({id, n}: {id: string; n: number}) {
  const [fig, setFig] = useState<Figure | null>(null);
  const stage = useRef<HTMLDivElement>(null);
  const [down, setDown] = useState(false);

  useEffect(() => {
    let live = true;
    load(id).then((f) => live && setFig(f));
    return () => {
      live = false;
    };
  }, [id]);

  // ciclo: arriba → baja → se queda → sube
  useEffect(() => {
    if (!fig) return;
    const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (still) {
      setDown(true);
      return;
    }
    let t: ReturnType<typeof setTimeout>;
    const cycle = (d: boolean) => {
      setDown(d);
      t = setTimeout(() => cycle(!d), d ? 3200 : 1600);
    };
    t = setTimeout(() => cycle(true), 500);
    return () => clearTimeout(t);
  }, [fig]);

  useEffect(() => {
    const el = stage.current;
    if (!el || !fig) return;
    const tool = el.querySelector<SVGGElement>('[data-part="tool"]');
    const dep = el.querySelector<SVGGElement>('[data-part="deposit"]');
    const m = /translate\(([-\d.]+)[ ,]+([-\d.]+)\)/.exec(fig.lift);
    if (tool) {
      tool.style.transition = 'transform 1.3s cubic-bezier(.32,.72,0,1)';
      tool.style.transform = down || !m ? 'translate(0px,0px)' : `translate(${m[1]}px,${m[2]}px)`;
    }
    if (dep) {
      dep.style.transition = `opacity ${down ? '.9s .9s' : '.5s'} ease`;
      dep.style.opacity = down || fig.pulse ? '1' : '0';
    }
  }, [down, fig]);

  return (
    <figure className="iso m-0" data-theme="light">
      <div className="rounded-2xl bg-[#f5f2ea] p-3 md:p-4">
        <div className="flex items-baseline justify-between gap-3 font-mono text-[0.68rem] text-[#8e8a6c]">
          <span>Fig {n}</span>
          <span className="text-right text-[#3b3823]">{fig?.title ?? '…'}</span>
        </div>
        <div ref={stage} className="mt-1 aspect-[640/440] w-full" aria-busy={!fig} dangerouslySetInnerHTML={fig ? {__html: fig.svg} : undefined} />
        <div className="flex flex-wrap items-baseline justify-between gap-2 font-mono text-[0.68rem] text-[#8e8a6c]">
          <span>Llega a: {fig?.layer}</span>
          <span className="text-right text-[#3b3823]" aria-live="polite">
            {fig?.reads}
          </span>
        </div>
      </div>
      {fig && (
        <figcaption className="mt-3 grid gap-3">
          <ul className="flex flex-wrap gap-x-4 gap-y-1 text-[0.72rem] text-mute">
            {LEGEND.map(([c, l]) => (
              <li key={l} className="flex items-center gap-1.5">
                <span className="size-2.5 rounded-sm border border-ink/15" style={{background: c}} />
                {l}
              </li>
            ))}
            <li className="flex items-center gap-1.5">
              <span className="size-2.5 rounded-full bg-[#a87350]" />
              Instrumento y producto
            </li>
          </ul>
          <p className="text-small text-ink/75">{fig.caption}</p>
          <p className="text-[0.68rem] text-mute">Ilustración educativa y esquemática: las capas no están a escala y la técnica exacta la define la doctora en tu valoración.</p>
        </figcaption>
      )}
    </figure>
  );
}

/** Ventana que muestra la figura. */
export function AnatomyDialog({id, n, onClose}: {id: string; n: number; onClose: () => void}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    d.showModal();
    const close = () => onClose();
    d.addEventListener('close', close);
    return () => d.removeEventListener('close', close);
  }, [onClose]);
  return (
    <dialog
      ref={ref}
      className="m-auto w-[min(46rem,94vw)] max-h-[92svh] overflow-y-auto rounded-3xl border-0 bg-paper p-4 text-ink shadow-2xl backdrop:bg-[#3b3823]/45 backdrop:backdrop-blur-sm md:p-6"
      onClick={(e) => {
        if (e.target === ref.current) ref.current?.close();
      }}
    >
      <div className="mb-2 flex justify-end">
        <button type="button" onClick={() => ref.current?.close()} className="min-h-9 cursor-pointer rounded-full px-3 text-small text-mute hover:text-ink" aria-label="Cerrar">
          Cerrar ✕
        </button>
      </div>
      <AnatomyFigure id={id} n={n} />
    </dialog>
  );
}
