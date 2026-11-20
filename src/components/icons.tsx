// Hand-drawn line icons for the stat tiles and filled pastel glyphs for the chips.

const stroke = {fill: 'none', stroke: 'currentColor', strokeWidth: 1.1, strokeLinejoin: 'round' as const, strokeLinecap: 'round' as const};

export function StatIcon({name}: {name: 'drop' | 'layers' | 'jar'}) {
  if (name === 'drop')
    return (
      <svg viewBox="0 0 32 32" className="size-full" {...stroke}>
        <path d="M16 4c4.6 6 8 10.2 8 14.4a8 8 0 0 1-16 0C8 14.2 11.4 10 16 4Z" />
        <path d="M12.2 19.4a4 4 0 0 0 3.6 3.4" opacity="0.6" />
        <ellipse cx="16" cy="18.6" rx="8" ry="2.3" opacity="0.45" />
      </svg>
    );
  if (name === 'layers')
    return (
      <svg viewBox="0 0 32 32" className="size-full" {...stroke}>
        <path d="M16 6 27 11.5 16 17 5 11.5Z" />
        <path d="M5 16 16 21.5 27 16" opacity="0.7" />
        <path d="M5 20.5 16 26 27 20.5" opacity="0.45" />
      </svg>
    );
  return (
    <svg viewBox="0 0 32 32" className="size-full" {...stroke}>
      <ellipse cx="16" cy="9.5" rx="9" ry="3" />
      <path d="M7 9.5v4.2c0 1.7 4 3 9 3s9-1.3 9-3V9.5" />
      <path d="M8 16.5v6c0 1.9 3.6 3.3 8 3.3s8-1.4 8-3.3v-6" opacity="0.6" />
    </svg>
  );
}

export function ChipIcon({name}: {name: 'sun' | 'heart' | 'leaf' | 'dew' | 'star'}) {
  const cls = 'size-[1.05em] shrink-0';
  switch (name) {
    case 'sun':
      return (
        <svg viewBox="0 0 20 20" className={cls}>
          <g fill="var(--color-coral)">
            {Array.from({length: 8}, (_, k) => (
              <ellipse key={k} cx="10" cy="3.2" rx="1.6" ry="2.4" transform={`rotate(${k * 45} 10 10)`} opacity="0.75" />
            ))}
            <circle cx="10" cy="10" r="3.6" />
          </g>
        </svg>
      );
    case 'heart':
      return (
        <svg viewBox="0 0 20 20" className={cls}>
          <path fill="var(--color-rose)" d="M10 17.2S2.6 12.6 2.6 7.4A3.9 3.9 0 0 1 10 5.6a3.9 3.9 0 0 1 7.4 1.8c0 5.2-7.4 9.8-7.4 9.8Z" />
        </svg>
      );
    case 'leaf':
      return (
        <svg viewBox="0 0 20 20" className={cls}>
          <path fill="var(--color-sage)" d="M16.8 3.2C9 3 3.6 7.4 4 14.6c0 .7.6 1.3 1.3 1.3 7.4.6 11.6-5 11.5-12.7Z" />
          <path d="M4.6 15.4 12 8" stroke="#fff" strokeWidth="1" strokeLinecap="round" opacity="0.8" />
        </svg>
      );
    case 'dew':
      return (
        <svg viewBox="0 0 20 20" className={cls}>
          <path fill="var(--color-dew)" d="M10 2.4c3.2 4.2 5.6 7.1 5.6 10a5.6 5.6 0 0 1-11.2 0c0-2.9 2.4-5.8 5.6-10Z" />
          <path d="M7.4 12.6a2.7 2.7 0 0 0 2.4 2.4" stroke="#fff" strokeWidth="1.1" fill="none" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg viewBox="0 0 20 20" className={cls}>
          <path fill="var(--color-butter)" d="m10 2.2 2.3 5 5.4.5-4.1 3.6 1.2 5.3L10 13.9l-4.8 2.7 1.2-5.3-4.1-3.6 5.4-.5Z" />
        </svg>
      );
  }
}

/** Isotipo EXORA (la "O" con el punto), tomado del logo oficial. */
export function Mark({className = '', light = false}: {className?: string; light?: boolean}) {
  return <img src={`${import.meta.env.BASE_URL}media/${light ? 'iso-white' : 'iso-olive'}.png`} alt="" aria-hidden className={`object-contain ${className}`} />;
}
