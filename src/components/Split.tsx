import {useEffect, useRef, type CSSProperties} from 'react';
import {media, split} from '../content';
import {useReveals} from '../hooks/useReveals';
import {pinProgress, range, smoothstep} from '../lib/math';
import {onFrame} from '../lib/scroll';
import {BlurText} from './BlurText';

/**
 * Pinned method section: the gel close-up rises in an arch card while a coral
 * thread draws down the ritual timeline, lighting each step as it passes and
 * arriving at "Gentle Rituals".
 */
/** Sección fija (sin scroll anclado): todo visible de una vez. */
const STATIC = true;

export function Split({reduced}: {reduced: boolean}) {
  const root = useReveals<HTMLElement>();
  const archWrap = useRef<HTMLDivElement>(null);
  const img = useRef<HTMLImageElement>(null);
  const track = useRef<HTMLDivElement>(null);
  const line = useRef<HTMLDivElement>(null);
  const steps = useRef<(HTMLDivElement | null)[]>([]);
  const pills = useRef<(HTMLDivElement | null)[]>([]);
  const title2 = useRef<HTMLElement>(null);
  const end = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (reduced || STATIC) {
      steps.current.forEach((s) => s?.classList.add('is-lit'));
      pills.current.forEach((p) => p?.classList.add('is-in'));
      title2.current?.classList.add('is-in');
      end.current?.classList.add('is-in');
      if (line.current) line.current.style.transform = 'none';
      return;
    }
    return onFrame(() => {
      const {p, rect, vh} = pinProgress(el);
      if (rect.bottom < 0 || rect.top > vh) return;
      const arrive = smoothstep(range(vh - rect.top, 0, vh));
      if (archWrap.current) archWrap.current.style.transform = `translate3d(0, ${(1 - arrive) * 9}vh, 0)`;
      if (img.current) img.current.style.transform = `scale(${1.16 - 0.1 * arrive - 0.05 * p})`;

      const k = smoothstep(range(p, 0.08, 0.8));
      if (line.current) line.current.style.transform = `scaleY(${k})`;
      const h = track.current?.offsetHeight ?? 1;
      steps.current.forEach((s) => s?.classList.toggle('is-lit', k * h >= s.offsetTop + 6));
      if (k > 0.985) {
        title2.current?.classList.add('is-in');
        end.current?.classList.add('is-in');
      }
      pills.current.forEach((pl, i) => pl?.classList.toggle('is-in', arrive > 0.9 && p > 0.05 + i * 0.2));
    });
  }, [reduced, root]);

  return (
    <section ref={root} id="ritual" className="relative">
      <div className="flex flex-col gap-8 overflow-hidden bg-linear-to-br from-blush via-[#f5f2ea] to-paper px-5 py-14 md:flex-row md:items-center md:gap-[5vw] md:px-[6vw] md:py-20">
        {/* arch photo — right on desktop, top on phones */}
        <div className="flex justify-center md:order-2 md:flex-1">
          <div ref={archWrap} className="relative aspect-square w-[72vw] max-w-[22rem] md:w-[min(34rem,40vw)] md:max-w-none">
            {/* offset outline echo */}
            <div className="blob blob-echo absolute inset-0 translate-x-3 -translate-y-3 border border-coral/35 md:translate-x-5 md:-translate-y-5" />
            <div className="blob relative size-full bg-coral">
              <img
                ref={img}
                src={media('exora-escultura.webp')}
                alt="Escultura orgánica en tonos oliva con una gota de cristal, imagen de la marca EXORA"
                className="size-full object-cover object-[50%_50%] [transform:scale(1.16)]"
                loading="lazy"
              />
            </div>
            {split.pills.map((m, i) => (
              <div
                key={m.label}
                ref={(n) => {
                  pills.current[i] = n;
                }}
                className="gate absolute"
                style={{left: `${m.x}%`, top: `${m.y}%`} as CSSProperties}
              >
                <span className="glass flex -translate-x-1/2 items-center gap-1.5 rounded-full px-2.5 py-1 text-[0.62rem] font-medium whitespace-nowrap text-ink md:px-3 md:py-1.5 md:text-[0.72rem]">
                  <span className="size-1.5 rounded-full bg-coral" />
                  {m.label}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* method copy + ritual timeline */}
        <div className="md:w-[44%] md:max-w-[34rem]">
          <p className="text-micro font-medium text-coral uppercase" data-reveal>
            {split.eyebrow}
          </p>
          <BlurText lines={split.title} className="mt-3 font-display text-title font-medium" delay={100} />
          <p className="mt-4 max-w-[27rem] text-small text-ink/70 md:text-copy" data-reveal style={{'--d': '400ms'} as CSSProperties}>
            {split.body}
          </p>

          <div ref={track} className="relative mt-6 pl-8 md:mt-9">
            <div className="absolute top-1.5 bottom-3 left-[5px] w-px bg-ink/10" />
            <div ref={line} className="absolute top-1.5 bottom-3 left-[5px] w-px origin-top bg-linear-to-b from-peach to-coral [transform:scaleY(0)]" />
            {split.steps.map((s, i) => (
              <div
                key={s.n}
                ref={(n) => {
                  steps.current[i] = n;
                }}
                className="step relative pb-3 md:pb-6"
              >
                <span className="node absolute top-[0.45rem] -left-8 size-[11px] rounded-full border border-ink/20 bg-paper" />
                <div className="flex items-baseline gap-3">
                  <span className="text-micro text-mute tabular-nums">{s.n}</span>
                  <span className="font-display text-[1.15rem] font-medium tracking-[-0.02em] md:text-[1.3rem]">{s.title}</span>
                </div>
                <p className="mt-1 max-w-[22rem] text-small text-mute">{s.text}</p>
              </div>
            ))}
            <div
              ref={(n) => {
                steps.current[split.steps.length] = n;
              }}
              className="step relative"
            >
              <span className="node absolute top-[0.9rem] -left-8 size-[11px] rounded-full border border-ink/20 bg-paper md:top-[1.2rem]" />
              <BlurText ref={title2} reveal={false} lines={split.title2} className="font-display text-title font-medium" />
              <p ref={end} className="gate mt-2 max-w-[24rem] text-copy text-ink/70" style={{'--d': '450ms'} as CSSProperties}>
                {split.body2}
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
