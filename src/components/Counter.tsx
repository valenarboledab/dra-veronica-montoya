import {useEffect, useRef} from 'react';
import {easeOutCubic} from '../lib/math';

type Props = {
  from?: number;
  to: number;
  delay?: number;
  duration?: number;
  /** After arriving, keep ticking up by one every few seconds (live user count). */
  live?: boolean;
  reduced: boolean;
  className?: string;
};

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

/** Counts up once on mount; writes text directly so it never re-renders. */
export function Counter({from = 0, to, delay = 0, duration = 1800, live = false, reduced, className}: Props) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (reduced) {
      el.textContent = fmt(to);
      return;
    }
    let raf = 0;
    let timer = 0;
    let value = to;
    const t0 = performance.now() + delay;
    const step = (now: number) => {
      const t = Math.min(1, Math.max(0, (now - t0) / duration));
      el.textContent = fmt(from + (to - from) * easeOutCubic(t));
      if (t < 1) raf = requestAnimationFrame(step);
      else if (live) bump();
    };
    const bump = () => {
      timer = window.setTimeout(() => {
        value += 1;
        el.textContent = fmt(value);
        bump();
      }, 2200 + Math.random() * 3600);
    };
    el.textContent = fmt(from);
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(timer);
    };
  }, [from, to, delay, duration, live, reduced]);

  return <span ref={ref} className={className} />;
}
