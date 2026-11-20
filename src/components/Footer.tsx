import {brand, footer, media} from '../content';

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper px-5 pt-8 pb-24 md:px-7 md:pb-8">
      <div className="flex flex-col gap-4 text-[0.72rem] text-mute md:flex-row md:items-center md:justify-between">
        <span className="flex items-center gap-2 text-ink">
          <img src={media('wordmark-olive.webp')} alt={brand.name} className="h-4 w-auto" />
          <span className="text-mute">· {brand.by}</span>
          <span className="text-mute">© {new Date().getFullYear()}</span>
        </span>
        <p className="max-w-[28rem]">{footer.note}</p>
        <span className="flex gap-5">
          {footer.links.map((l) => (
            <a key={l.label} href={l.href} className="transition-colors hover:text-coral">
              {l.label}
            </a>
          ))}
        </span>
      </div>
    </footer>
  );
}
