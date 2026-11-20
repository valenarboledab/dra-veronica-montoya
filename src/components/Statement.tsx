import {useEffect, useRef, type CSSProperties} from 'react';
import {media, statement} from '../content';
import {useReveals} from '../hooks/useReveals';
import {clamp, pinProgress, range, smoothstep} from '../lib/math';
import {onFrame} from '../lib/scroll';
import {ChipIcon} from './icons';

const FAINT = [216, 210, 207];
const CORAL = [231, 134, 108];
const INK = [30, 24, 22];
const blend = (a: number[], b: number[], t: number) => `rgb(${a.map((c, i) => Math.round(c + (b[i] - c) * t)).join(',')})`;
// faint → coral at the front of the light → settles to ink
const tone = (t: number) => (t < 0.5 ? blend(FAINT, CORAL, t * 2) : blend(CORAL, INK, (t - 0.5) * 2));

const tokens = statement.tokens;
const isAccent = (w: string) => w.length > 2 && w.startsWith('*') && w.endsWith('*');

/**
 * Pinned statement: the paragraph sharpens in, then a coral front of light
 * travels through it word by word. Photo pills inside the sentence bloom as
 * they are reached, and each feeling-chip pops when its word lights.
 */
export function Statement({reduced}: {reduced: boolean}) {
  const root = useReveals<HTMLElement>();
  const para = useRef<HTMLParagraphElement>(null);
  const items = useRef<(HTMLSpanElement | null)[]>([]);
  const chips = useRef<(HTMLDivElement | null)[]>([]);
  const drift = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    const chipAt = statement.chips.map((c) => tokens.indexOf(c.at));
    if (reduced) {
      items.current.forEach((w) => {
        if (!w) return;
        w.style.color = tone(1);
        w.classList.add('is-in');
      });
      chips.current.forEach((c) => c?.classList.add('is-in'));
      return;
    }
    const lit = new Array(tokens.length).fill(-1);
    const touch = window.matchMedia('(hover: none)').matches;
    return onFrame(() => {
      const {p, rect, vh} = pinProgress(el);
      if (rect.bottom < 0 || rect.top > vh) return;
      const arrive = smoothstep(range(vh - rect.top, vh * 0.15, vh));
      if (para.current) {
        para.current.style.opacity = `${arrive}`;
        para.current.style.filter = !touch && arrive < 1 ? `blur(${(1 - arrive) * 10}px)` : 'none';
      }
      const front = range(p, 0.06, 0.8) * (tokens.length + 3);
      items.current.forEach((w, i) => {
        if (!w) return;
        const t = Math.round(clamp((front - i) / 3) * 24) / 24;
        if (t === lit[i]) return;
        lit[i] = t;
        if (typeof tokens[i] === 'string') w.style.color = tone(t);
        else w.classList.toggle('is-in', t > 0.2);
      });
      chips.current.forEach((c, i) => {
        if (!c) return;
        c.classList.toggle('is-in', lit[chipAt[i]] > 0.5);
        const d = drift.current[i];
        if (d) d.style.transform = `translate3d(0, ${(0.5 - p) * 110 * (0.6 + (i % 3) * 0.45)}px, 0)`;
      });
    });
  }, [reduced, root]);

  return (
    <section ref={root} className="relative h-[190vh] bg-paper md:h-[260vh]">
      <div className="sticky top-0 flex h-svh items-center overflow-hidden px-5 md:px-[7vw]">
        <div className="relative z-10 max-w-[64rem]">
          <p className="mb-6 flex items-center gap-2 text-micro font-medium text-mute uppercase md:mb-8" data-reveal>
            <span className="size-1.5 rounded-full bg-coral" />
            {statement.eyebrow}
          </p>
          <p ref={para} className="font-display text-statement font-medium" style={{color: tone(0)}}>
            {tokens.map((tk, i) => {
              const ref = (n: HTMLSpanElement | null) => {
                items.current[i] = n;
              };
              if (typeof tk !== 'string')
                return (
                  <span key={i}>
                    <span ref={ref} className="inline-pill">
                      <img src={media(`pill-${tk.img}.webp`)} alt="" className="size-full object-cover" loading="lazy" />
                    </span>{' '}
                  </span>
                );
              const accent = isAccent(tk);
              return (
                <span key={i}>
                  <span ref={ref} className={accent ? 'accent text-[1.1em] leading-[0.9]' : undefined}>
                    {accent ? tk.slice(1, -1) : tk}
                  </span>
                  {i < tokens.length - 1 ? ' ' : ''}
                </span>
              );
            })}
          </p>
        </div>

        {statement.chips.map((c, i) => (
          <div
            key={c.label}
            className="absolute z-20 hidden sm:block"
            style={{left: `${c.x}%`, top: `${c.y}%`} as CSSProperties}
          >
            <div
              ref={(n) => {
                drift.current[i] = n;
              }}
            >
              <div className="chip-float" style={{'--bd': `${-i * 1.3}s`} as CSSProperties}>
                <div
                  ref={(n) => {
                    chips.current[i] = n;
                  }}
                  className="chip glass flex items-center gap-2 rounded-full px-3.5 py-2 text-[0.85rem] font-medium text-ink md:px-4 md:py-2.5 md:text-[0.95rem]"
                  style={{'--r': `${c.r}deg`} as CSSProperties}
                >
                  <ChipIcon name={c.icon} />
                  {c.label}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
