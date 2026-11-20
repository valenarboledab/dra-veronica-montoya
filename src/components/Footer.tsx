import {brand, footer, media} from '../content';

export function Footer() {
  return (
    <footer className="bg-coral px-5 pt-8 pb-24 md:px-7 md:pb-8">
      <div className="flex flex-col gap-4 text-[0.72rem] text-paper/70 md:flex-row md:items-center md:justify-between">
        <span className="flex items-center gap-2 text-paper">
          <img src={media('wordmark-white.webp')} alt={brand.name} className="h-4 w-auto" />
          <span className="text-paper/70">· {brand.by}</span>
          <span className="text-paper/70">© {new Date().getFullYear()}</span>
        </span>
        <p className="max-w-[28rem]">{footer.note}</p>
        <span className="flex gap-5">
          {footer.links.map((l) => (
            <a key={l.label} href={l.href} {...(l.href.startsWith("http") ? {target: "_blank", rel: "noopener"} : {})} className="transition-colors hover:text-peach">
              {l.label}
            </a>
          ))}
        </span>
      </div>
    </footer>
  );
}
