import {media} from '../content';

/**
 * Antes y después del bótox.
 * DEMO: hoy usa una imagen ilustrativa (no es una paciente real). Antes de publicar,
 * reemplazar ba-*.webp por fotos reales con autorización firmada y poner DEMO = false.
 */
const DEMO = true;

const ZONAS: [string, string][] = [
  ['ba-frente.webp', 'Frente'],
  ['ba-entrecejo.webp', 'Entrecejo'],
  ['ba-patas.webp', 'Patas de gallo'],
];

const DATOS: [string, string, string][] = [
  ['M7 3h10M7 21h10M8 3c0 5 8 5 8 9s-8 4-8 9M16 3c0 5-8 5-8 9', '15 min', 'dura el procedimiento'],
  ['M5 19c8 0 14-6 14-14C11 5 5 11 5 19Zm0 0 9-9', 'Sin cirugía', 'y mínimamente invasivo'],
  ['M3 8c3-2 6 2 9 0s6-2 9 0M3 12c3-2 6 2 9 0s6-2 9 0M3 16c3-2 6 2 9 0s6-2 9 0', 'Resultados naturales', 'y frescos'],
  ['M4 6h16v14H4zM4 10h16M8 3v4M16 3v4M8 14h.01M12 14h.01M16 14h.01M8 17h.01M12 17h.01', '3–4 meses', 'de duración'],
];

const Pill = ({t, s}: {t: string; s?: string}) => (
  <span className="absolute bottom-[6%] left-1/2 -translate-x-1/2 rounded-2xl bg-paper/85 px-5 py-1.5 text-center shadow-sm backdrop-blur-sm md:px-7 md:py-2">
    <b className="block font-display text-[1.15rem] font-medium leading-tight md:text-[1.8rem]">{t}</b>
    {s && <span className="block text-[0.72rem] text-ink/70 md:text-small">{s}</span>}
  </span>
);

export function BotoxDemo() {
  return (
    <section className="relative mt-6 overflow-hidden rounded-[1.6rem] bg-[#f3f0ea]">
      {DEMO && (
        <span className="absolute top-3 left-3 z-10 rounded-full bg-ink/80 px-3 py-1 text-[0.68rem] font-medium tracking-wide text-paper uppercase">
          Demo · imagen ilustrativa
        </span>
      )}
      <div className="grid grid-cols-2 gap-px bg-paper">
        <figure className="relative">
          <img src={media('ba-antes.webp')} alt="Antes del bótox" className="aspect-[598/680] w-full object-cover" loading="lazy" />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#f3f0ea] to-transparent" />
          <Pill t="Antes" />
        </figure>
        <figure className="relative">
          <img src={media('ba-despues.webp')} alt="Después del bótox" className="aspect-[598/680] w-full object-cover" loading="lazy" />
          <span className="pointer-events-none absolute inset-x-0 bottom-0 h-1/4 bg-gradient-to-t from-[#f3f0ea] to-transparent" />
          <Pill t="Después" s="Bótox" />
        </figure>
      </div>

      <div className="grid grid-cols-3 gap-2 px-3 pt-3 md:gap-5 md:px-12 md:pt-2">
        {ZONAS.map(([f, n]) => (
          <figure key={n} className="text-center">
            <img src={media(f)} alt={`${n}: antes y después`} className="aspect-[336/152] w-full rounded-xl object-cover md:rounded-2xl" loading="lazy" />
            <figcaption className="mt-1.5 text-[0.75rem] md:mt-2 md:text-copy">{n}</figcaption>
          </figure>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-y-4 px-4 py-5 md:grid-cols-4 md:px-12 md:py-8 md:[&>*+*]:border-l md:[&>*+*]:border-line">
        {DATOS.map(([d, t, s]) => (
          <div key={t} className="flex items-start gap-2.5 md:gap-3 md:px-5 md:first:pl-0">
            <span className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-paper text-coral md:size-12">
              <svg viewBox="0 0 24 24" className="size-5 md:size-6" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                <path d={d} />
              </svg>
            </span>
            <span>
              <b className="block font-display text-[1.1rem] font-medium leading-tight md:text-[1.5rem]">{t}</b>
              <span className="text-[0.78rem] text-ink/65 md:text-small">{s}</span>
            </span>
          </div>
        ))}
      </div>
      <p className="px-4 pb-4 text-[0.72rem] text-mute md:px-12">
        {DEMO ? 'Imagen ilustrativa de demostración: no corresponde a una paciente real. ' : 'Paciente real de EXORA, publicada con su autorización. '}
        Los resultados varían en cada persona y se definen en la valoración.
      </p>
    </section>
  );
}
