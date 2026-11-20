import {useEffect, useRef, type CSSProperties} from 'react';
import {hero, media, scans, wa, WA_SHOW} from '../content';
import {useReveals} from '../hooks/useReveals';
import {lerp, range, smoothstep} from '../lib/math';
import {onFrame} from '../lib/scroll';
import track from '../track.json';
import {BlurText} from './BlurText';

type Pt = number[]; // [x %, y %, scale]
const TRACK = track as unknown as {fps: number; intro: Pt[][]; idle: Pt[][]};

/** Marker positions at film time `t`, linearly between tracked frames. */
function sample(frames: Pt[][], t: number): Pt[] {
  const f = Math.min(frames.length - 1, Math.max(0, t * TRACK.fps));
  const a = Math.floor(f);
  const b = Math.min(frames.length - 1, a + 1);
  const k = f - a;
  return frames[a].map((p, i) => p.map((v, j) => lerp(v, frames[b][i][j], k)));
}

/**
 * The eye-contact hook: a locked-off portrait film plays once (glance aside →
 * eyes close → open straight into the lens), then hands over to a 2 s
 * back-and-forth of its last second so she keeps holding your gaze.
 * While it plays a band of light reads down her face, the reading card fills,
 * and focus rings ride on her features through the head turn.
 */
export function Hero({reduced}: {reduced: boolean}) {
  const root = useReveals<HTMLElement>();
  const intro = useRef<HTMLVideoElement>(null);
  const idle = useRef<HTMLVideoElement>(null);
  const rings = useRef<(HTMLDivElement | null)[]>([]);
  const sweep = useRef<HTMLDivElement>(null);
  const bar = useRef<HTMLDivElement>(null);
  const pct = useRef<HTMLSpanElement>(null);
  const status = useRef<HTMLSpanElement>(null);
  const dot = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const v = intro.current;
    const w = idle.current;
    const section = root.current;
    if (!v || !w || !section) return;

    // Rings ride the tracked skin points of whichever film is showing.
    const place = (pts: Pt[]) =>
      rings.current.forEach((el, i) => {
        if (!el) return;
        const [x, y, sc] = pts[i];
        el.style.left = `${x}%`;
        el.style.top = `${y}%`;
        el.style.width = `${4.4 * sc}%`;
      });

    let shown = -1;
    const read = (k: number) => {
      const n = Math.round(k * 100);
      if (n === shown) return;
      shown = n;
      if (bar.current) bar.current.style.transform = `scaleX(${k})`;
      if (pct.current) pct.current.textContent = `${n}%`;
      if (n === 100) {
        if (status.current) status.current.textContent = hero.card.done;
        dot.current?.classList.replace('bg-coral', 'bg-sage');
      }
    };

    const showIdle = () => {
      w.style.opacity = '1';
      v.style.opacity = '0';
    };

    if (reduced) {
      showIdle();
      place(TRACK.idle[0]);
      read(1);
      rings.current.forEach((el) => el?.classList.add('is-on'));
      return;
    }

    let phase: 'intro' | 'idle' = 'intro';
    let visible = true;
    const toIdle = () => {
      w.currentTime = 0;
      w.play().catch(showIdle);
    };
    // Both films multiply onto the blush aura, so only one may show at a time.
    const onIdlePlaying = () => {
      phase = 'idle';
      showIdle();
    };
    v.addEventListener('ended', toIdle);
    w.addEventListener('playing', onIdlePlaying, {once: true});
    // Autoplay refused: skip straight to her looking at you (idle poster is that frame).
    let refused = false;
    v.play().catch(() => {
      refused = true;
      phase = 'idle';
      showIdle();
      toIdle();
    });

    // Celulares con ahorro de batería bloquean el autoplay: al primer toque o
    // scroll del usuario se arranca el video desde el principio.
    const kick = () => {
      if (!refused && !v.paused) return;
      if (refused) {
        refused = false;
        phase = 'intro';
        v.style.opacity = '1';
        w.style.opacity = '0';
        v.currentTime = 0;
        v.play().catch(() => {
          phase = 'idle';
          showIdle();
        });
      } else if (phase === 'idle' && w.paused) w.play().catch(() => {});
    };
    const gestures = ['touchstart', 'pointerdown', 'scroll', 'keydown'] as const;
    gestures.forEach((g) => window.addEventListener(g, kick, {passive: true}));

    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (phase !== 'idle') return;
      if (visible) w.play().catch(() => {});
      else w.pause();
    });
    io.observe(section);

    const off = onFrame(() => {
      if (!visible) return;
      const t = phase === 'intro' ? v.currentTime : 99;
      place(phase === 'intro' ? sample(TRACK.intro, v.currentTime) : sample(TRACK.idle, w.currentTime));
      rings.current.forEach((el, i) => {
        if (el && t > 0.5 + i * 0.35) el.classList.add('is-on');
      });
      const r = range(t, 0.15, 1.6);
      if (sweep.current) {
        sweep.current.style.top = `${lerp(10, 70, smoothstep(r))}%`;
        sweep.current.style.opacity = `${Math.sin(Math.PI * r)}`;
      }
      read(smoothstep(range(t, 0.15, 2.8)));
    });

    return () => {
      off();
      io.disconnect();
      v.removeEventListener('ended', toIdle);
      w.removeEventListener('playing', onIdlePlaying);
      gestures.forEach((g) => window.removeEventListener(g, kick));
    };
  }, [reduced, root]);

  return (
    <section ref={root} id="top" className="relative bg-paper md:h-svh md:min-h-[640px]">
      <h1 className="sr-only">
        {hero.lead} {hero.accent} {hero.tail}
      </h1>

      <div className="hero-frame">
        <div className="hero-stage">
          <video
            ref={idle}
            className="absolute inset-0 size-full opacity-0"
            src={media('hero-idle.mp4')}
            poster={media('hero-end.webp')}
            muted
            loop
            playsInline
            preload="auto"
            aria-hidden
          />
          <video
            ref={intro}
            className="absolute inset-0 size-full"
            src={media('hero-intro.mp4')}
            poster={media('hero-poster.webp')}
            muted
            playsInline
            preload="auto"
            aria-label="Una mujer de piel luminosa mira a un lado, cierra los ojos y luego mira de frente a la cámara"
          />
          <div ref={sweep} className="sweep" aria-hidden />
          {scans.map((s, i) => (
            <div
              key={s.name}
              ref={(el) => {
                rings.current[i] = el;
              }}
              className="focus"
              style={{left: `${TRACK.intro[0][i][0]}%`, top: `${TRACK.intro[0][i][1]}%`, '--d': `${i * 120}ms`} as CSSProperties}
              aria-hidden
            >
              <svg viewBox="0 0 40 40" className="ring-orbit">
                <circle cx="20" cy="20" r="19" fill="none" stroke="#fff" strokeWidth="0.8" strokeDasharray="1.5 3.2" opacity="0.9" />
              </svg>
              <span className="focus-frame" />
              <span className="ring-core" />
              <span className="absolute top-1/2 left-1/2 size-[3px] -translate-1/2 rounded-full bg-white" />
              <span className="leader" data-side={s.side} />
              <span
                className="ring-label glass flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[clamp(0.55rem,0.6vw,0.72rem)] font-medium text-ink"
                data-side={s.side}
              >
                <span className="size-1.5 rounded-full bg-coral" />
                {s.name}
                <span className="text-mute">{s.value}</span>
              </span>
            </div>
          ))}
        </div>
        {/* shoulders melt into the page */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[30%] bg-linear-to-b from-paper/0 via-paper/70 to-paper" />
      </div>

      {/* "Your skin, finally" — top left */}
      <div aria-hidden className="relative z-10 px-5 pt-3 md:absolute md:top-[20%] md:left-7 md:p-0">
        <p
          className="glass mb-5 inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-micro font-medium text-ink/80 uppercase"
          data-reveal
          style={{'--d': '200ms'} as CSSProperties}
        >
          <span className="relative flex size-1.5">
            <span className="absolute inset-0 animate-ping rounded-full bg-coral/70" />
            <span className="size-1.5 rounded-full bg-coral" />
          </span>
          {hero.eyebrow}
        </p>
        <BlurText as="p" lines={[hero.lead]} delay={250} className="font-display text-hero font-medium" />
        <BlurText as="p" lines={[hero.accent]} delay={650} className="accent pl-[0.8em] text-[clamp(3.2rem,6.3vw,7rem)] leading-[0.9] text-ink" />
      </div>

      {/* "understood." — bottom right, over her shoulder */}
      <div aria-hidden className="relative z-10 px-5 md:absolute md:right-7 md:bottom-[10%] md:p-0 md:text-right">
        <BlurText as="p" lines={[hero.tail]} delay={1050} className="font-display text-hero font-medium" />
      </div>

      {/* sub, CTA, trusted — bottom left */}
      <div className="relative z-10 px-5 pt-6 pb-8 md:absolute md:bottom-[9%] md:left-7 md:p-0">
        <p className="max-w-[18rem] text-copy text-ink/75" data-reveal style={{'--d': '1300ms'} as CSSProperties}>
          {hero.sub}
        </p>
        <div className="mt-6 flex flex-wrap items-center gap-5" data-reveal style={{'--d': '1450ms'} as CSSProperties}>
          <a
            href="#agenda"
            className="group flex items-center gap-3 rounded-full bg-ink py-1.5 pr-1.5 pl-5 text-small font-medium text-paper transition-colors hover:bg-coral"
          >
            {hero.cta}
            <span className="grid size-8 place-items-center rounded-full bg-blush text-ink transition-transform group-hover:translate-x-0.5">
              <svg viewBox="0 0 16 16" className="size-3.5" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8h10M9 4l4 4-4 4" />
              </svg>
            </span>
          </a>
          <span className="flex items-center gap-2.5">
            <a href={wa('Hola Dra. Verónica, quiero agendar una valoración.')} className="flex items-center gap-2.5">
              <span className="grid size-9 place-items-center rounded-full bg-[#25d366] text-white">
                <svg viewBox="0 0 24 24" className="size-[1.05rem]" fill="currentColor" aria-hidden><path d="M12 2a9.9 9.9 0 0 0-8.5 15l-1.4 5 5.1-1.3A9.9 9.9 0 1 0 12 2Zm4.5 12.1c-.2-.1-1.5-.7-1.7-.8-.2-.1-.4-.1-.6.1l-.8 1c-.1.2-.3.2-.5.1a6.6 6.6 0 0 1-3.3-2.9c-.2-.4.2-.4.7-1.3.1-.2 0-.3 0-.4l-.8-1.8c-.2-.5-.4-.4-.6-.4h-.5c-.2 0-.5.1-.7.3-.2.3-.9.9-.9 2.2s1 2.6 1.1 2.8c.1.2 1.9 2.9 4.6 4 1.7.7 2.4.8 3.2.6.5-.1 1.5-.6 1.7-1.2.2-.6.2-1.1.1-1.2l-.5-.3Z" /></svg>
              </span>
              <span className="text-[0.72rem] leading-tight text-mute">
                <b className="block font-display text-[0.95rem] font-semibold tracking-[-0.02em] text-ink">{WA_SHOW}</b>
                Solo con cita previa
              </span>
            </a>
          </span>
        </div>
      </div>

      {/* live reading card — top right */}
      <div className="relative z-10 px-5 pb-14 md:absolute md:top-[19%] md:right-7 md:w-[15.5rem] md:p-0">
        <div className="glass rounded-2xl p-4" data-reveal style={{'--d': '700ms'} as CSSProperties}>
          <div className="flex items-center justify-between text-micro font-medium uppercase">
            <span className="flex items-center gap-2">
              <span ref={dot} className="size-1.5 rounded-full bg-coral transition-colors duration-700" />
              <span ref={status}>{hero.card.title}</span>
            </span>
            <span ref={pct} className="text-mute tabular-nums">
              0%
            </span>
          </div>
          <div className="mt-3 h-[3px] overflow-hidden rounded-full bg-line">
            <div ref={bar} className="h-full origin-left rounded-full bg-linear-to-r from-peach to-coral [transform:scaleX(0)]" />
          </div>
          <ul className="mt-2 divide-y divide-line">
            {hero.card.rows.map((r, i) => (
              <li key={r.label} className="flex items-baseline justify-between py-2.5">
                <span className="text-small text-mute">{r.label}</span>
                <span className="font-display text-[1.05rem] font-medium tracking-[-0.02em]" style={{'--d': `${1200 + i * 260}ms`} as CSSProperties} data-reveal>
                  {r.value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
