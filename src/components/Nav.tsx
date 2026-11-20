import type {CSSProperties} from 'react';
import {brand, views, type View} from '../content';
import {Mark} from './icons';

/** Pestañas: cada una abre su propia vista (#inicio, #tratamientos…), no un scroll infinito. */
export function Nav({view}: {view: View}) {
  const home = view === 'inicio';
  return (
    <header
      className={`inset-x-0 top-0 z-30 px-5 pt-5 md:px-7 ${home ? 'absolute bg-paper/80 pb-3 backdrop-blur-md lg:bg-transparent lg:pb-0 lg:backdrop-blur-none' : 'border-b border-line bg-paper/85 pb-4 backdrop-blur-md'}`}
    >
      <div className="grid grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-[1fr_auto_1fr]">
        <a href="#inicio" className={`flex items-center gap-2 lg:col-start-2 lg:row-start-1 ${home ? 'lg:glass lg:rounded-full lg:py-1.5 lg:pr-4 lg:pl-2' : ''}`} data-reveal style={{'--d': '150ms'} as CSSProperties}>
          <Mark className="size-7" />
          <span className="font-display text-[1.2rem] font-semibold tracking-[-0.035em] md:text-[1.35rem]">{brand.name}</span>
        </a>

        <div className="col-start-2 flex items-center gap-5 justify-self-end lg:col-start-3" data-reveal style={{'--d': '450ms'} as CSSProperties}>
          <a href="#agenda" className="rounded-full bg-ink px-4 py-2 text-small font-medium text-paper transition-colors hover:bg-coral">
            {brand.app}
          </a>
        </div>

        <nav
          aria-label="Secciones"
          className="tabs-scroll col-span-2 -mx-1 flex items-center gap-6 overflow-x-auto px-1 text-small font-medium lg:col-span-1 lg:col-start-1 lg:row-start-1 lg:mx-0 lg:px-0"
          data-reveal
          style={{'--d': '300ms'} as CSSProperties}
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
