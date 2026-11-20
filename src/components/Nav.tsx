import {brand, media, views, type View} from '../content';

/** Pestañas: cada una abre su propia vista (#inicio, #tratamientos…), no un scroll infinito. */
export function Nav({view}: {view: View}) {
  const home = view === 'inicio';
  return (
    <header
      className={`inset-x-0 top-0 z-30 px-5 pt-5 md:px-7 ${home ? 'relative bg-paper pb-3 lg:absolute lg:bg-transparent lg:pb-0' : 'border-b border-line bg-paper/85 pb-4 backdrop-blur-md'}`}
    >
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 xl:grid-cols-[1fr_auto_1fr]">
        <a href="#inicio" className="glass flex items-center gap-2 justify-self-start rounded-full py-2.5 pr-4 pl-4 xl:col-start-2 xl:row-start-1 xl:justify-self-center">
          <img src={media('wordmark-olive.webp')} alt={brand.name} className="h-5 w-auto sm:h-6 md:h-7" />
          <span className="hidden border-l border-ink/15 pl-2 text-[0.72rem] leading-tight text-ink/60 sm:block">{brand.by}</span>
        </a>

        <div className="col-start-2 flex items-center gap-5 justify-self-end xl:col-start-3">
          <a href="#agenda" className="rounded-full bg-ink px-4 py-2 text-small font-medium text-paper transition-colors hover:bg-coral">
            {brand.app}
          </a>
        </div>

        <nav
          aria-label="Secciones"
          className="tabs-scroll col-span-2 -mx-1 flex items-center gap-6 overflow-x-auto px-1 text-small font-medium xl:col-span-1 xl:col-start-1 xl:row-start-1 xl:mx-0 xl:px-0"
        >
          {views.map((v) => (
            <a
              key={v.id}
              href={`#${v.id}`}
              aria-current={view === v.id ? 'page' : undefined}
              className={`shrink-0 border-b py-1.5 transition-colors hover:text-coral ${view === v.id ? 'border-coral text-ink' : 'border-transparent text-ink/65'}`}
            >
              {v.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
