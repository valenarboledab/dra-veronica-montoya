import type {CSSProperties, ElementType, Ref} from 'react';

type Props = {
  lines: readonly string[];
  as?: ElementType;
  className?: string;
  /** Delay before the first letter, ms. */
  delay?: number;
  /** Adds `data-reveal` so the section's observer starts it; otherwise the parent toggles `.is-in`. */
  reveal?: boolean;
  ref?: Ref<HTMLElement>;
};

/** Letters sharpen out of a blur one by one, left to right, line after line. */
export function BlurText({lines, as: Tag = 'h2', className = '', delay = 0, reveal = true, ref}: Props) {
  let i = 0;
  return (
    <Tag
      ref={ref}
      className={`blur-text ${className}`}
      style={{'--d': `${delay}ms`} as CSSProperties}
      aria-label={lines.join(' ').replace(/\*/g, '')}
      {...(reveal ? {'data-reveal': ''} : {})}
    >
      {lines.map((line, li) => (
        <span key={li} className="block" aria-hidden>
          {line.split(' ').map((raw, wi, words) => {
            // *word* renders in the italic serif accent
            const accent = raw.length > 2 && raw.startsWith('*') && raw.endsWith('*');
            const word = accent ? raw.slice(1, -1) : raw;
            return (
            <span key={wi} className={`inline-block whitespace-nowrap ${accent ? 'accent text-[1.12em] leading-[0.9]' : ''}`}>
              {[...word].map((ch) => (
                <span key={i} className="ch" style={{'--i': i++} as CSSProperties}>
                  {ch}
                </span>
              ))}
              {wi < words.length - 1 && <span className="ch" style={{'--i': i++} as CSSProperties}>&nbsp;</span>}
            </span>
            );
          })}
        </span>
      ))}
    </Tag>
  );
}
