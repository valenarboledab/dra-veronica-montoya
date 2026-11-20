import {siInstagram} from 'simple-icons';
import {ADDRESS, brand, footer, media} from '../content';

const IG = footer.links.find((l) => l.href.includes('instagram'));
const LINKS = footer.links.filter((l) => l !== IG);

export function Footer() {
  return (
    <footer className="bg-coral px-6 pt-10 pb-28 text-paper md:pr-7 md:pb-10 md:pl-24">
      <div className="mx-auto grid max-w-[72rem] gap-8 md:grid-cols-[1.3fr_1fr_1fr] md:gap-12">
        {/* Marca */}
        <div className="grid content-start gap-3">
          <img src={media('wordmark-white.webp')} alt={brand.name} className="h-7 w-auto self-start justify-self-start" />
          <p className="text-small text-paper/80">{brand.doctors.join(' · ')}</p>
          <p className="text-small text-paper/65">{ADDRESS}</p>
        </div>

        {/* Enlaces */}
        <nav className="grid content-start gap-2.5 text-small" aria-label="Enlaces">
          <span className="text-micro tracking-[0.14em] text-paper/55 uppercase">Enlaces</span>
          {LINKS.map((l) => (
            <a key={l.label} href={l.href} className="text-paper/85 transition-colors hover:text-peach">
              {l.label}
            </a>
          ))}
        </nav>

        {/* Redes */}
        <div className="grid content-start gap-2.5 text-small">
          <span className="text-micro tracking-[0.14em] text-paper/55 uppercase">Síguenos</span>
          {IG && (
            <a href={IG.href} target="_blank" rel="noopener" className="flex items-center gap-2.5 text-paper/85 transition-colors hover:text-peach">
              <span className="grid size-9 place-items-center rounded-full bg-paper/12">
                <svg viewBox="0 0 24 24" className="size-[1.1rem] fill-current" aria-hidden>
                  <path d={siInstagram.path} />
                </svg>
              </span>
              @exora.regeneracion
            </a>
          )}
        </div>
      </div>

      <div className="mx-auto mt-8 grid max-w-[72rem] gap-3 border-t border-paper/20 pt-5 text-[0.72rem] text-paper/60 md:grid-cols-[1fr_auto] md:items-end">
        <p className="max-w-[40rem]">{footer.note}</p>
        <span className="flex items-center gap-4">
          © {new Date().getFullYear()} {brand.name}
          <a href="#panel" className="text-paper/40 hover:text-peach">
            Acceso equipo
          </a>
        </span>
      </div>
    </footer>
  );
}
