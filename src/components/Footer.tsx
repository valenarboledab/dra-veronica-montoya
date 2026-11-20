import {brand, footer} from '../content';
import {Mark} from './icons';

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper px-5 pt-8 pb-24 md:px-7 md:pb-8">
      <div className="flex flex-col gap-4 text-[0.72rem] text-mute md:flex-row md:items-center md:justify-between">
        <span className="flex items-center gap-2 text-ink">
          <Mark className="size-5" />
          <span className="font-display text-base font-semibold tracking-[-0.03em]">{brand.name}</span>
          <span className="text-mute">© {new Date().getFullYear()}</span>
        </span>
        <p className="max-w-[28rem]">{footer.note}</p>
        <span className="flex gap-5">
          {footer.links.map((l) => (
            <a key={l} href="#" className="transition-colors hover:text-coral">
              {l}
            </a>
          ))}
        </span>
      </div>
    </footer>
  );
}
