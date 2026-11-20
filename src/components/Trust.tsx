import {media} from '../content';
/** Sellos de confianza: productos con registro INVIMA y pagos seguros. Sin logos de terceros (solo texto). */
const Shield = () => (
  <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />
    <path d="m8.8 12.2 2.2 2.2 4.4-4.6" />
  </svg>
);
const Lock = () => (
  <svg viewBox="0 0 24 24" className="size-5 shrink-0" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
    <rect x="5" y="10.5" width="14" height="10" rx="2.5" />
    <path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" />
  </svg>
);

/** Logos oficiales de medios de pago: poner los archivos que entregue cada marca en public/media/logos/ (mercadopago.svg, visa.svg, mastercard.svg, pse.svg).
 *  Mientras la cuenta no esté activa se muestran con marca de agua DEMO. */
export const PAY_BRANDS: [string, string][] = [
  ['Mercado Pago', 'mercadopago.svg'],
  ['Visa', 'visa.svg'],
  ['Mastercard', 'mastercard.svg'],
  ['PSE', 'pse.svg'],
];
const DEMO = true;

function Logo({name, file}: {name: string; file: string}) {
  return (
    <span className="relative inline-flex h-8 min-w-[3.6rem] items-center justify-center overflow-hidden rounded-md border border-line bg-white px-2">
      <img
        src={media('logos/' + file)}
        alt={name}
        className="h-5 w-auto"
        onError={(e) => {
          const el = e.currentTarget;
          el.replaceWith(Object.assign(document.createElement('span'), {textContent: name, className: 'text-[0.72rem] font-semibold tracking-wide text-ink/75'}));
        }}
      />
      {DEMO && <span className="pointer-events-none absolute inset-0 grid place-items-center text-[0.55rem] font-bold tracking-[0.2em] text-[#a87350]/70 [transform:rotate(-14deg)]">DEMO</span>}
    </span>
  );
}

export function PayBadges({className = ''}: {className?: string}) {
  return (
    <div className={`flex flex-wrap items-center gap-1.5 ${className}`}>
      <span className="flex items-center gap-1.5 text-[0.72rem] text-mute">
        <Lock /> Pago seguro con
      </span>
      {PAY_BRANDS.map(([n, f]) => (
        <Logo key={n} name={n} file={f} />
      ))}
    </div>
  );
}

export function Trust({compact = false}: {compact?: boolean}) {
  const items = [
    {icon: <Shield />, title: 'Registro sanitario INVIMA', text: 'Usamos solo productos y medicamentos con registro sanitario INVIMA vigente. Pregúntanos el registro de tu producto.'},
    {icon: <Lock />, title: 'Pagos seguros', text: 'Tarjeta de crédito o débito, cuotas y PSE a través de Mercado Pago. EXORA nunca ve los datos de tu tarjeta.'},
  ];
  return (
    <div className={`grid gap-3 ${compact ? '' : 'md:grid-cols-2'}`}>
      {items.map((i) => (
        <div key={i.title} className="glass flex gap-3 rounded-2xl p-4 text-coral" data-reveal>
          {i.icon}
          <span className="text-ink">
            <b className="block font-display text-[1.15rem] font-medium">{i.title}</b>
            <span className="text-small text-mute">{i.text}</span>
          </span>
        </div>
      ))}
    </div>
  );
}

/** Franja para Inicio. */
export function TrustStrip() {
  return (
    <section className="px-5 pt-14 md:px-[7vw] md:pt-20">
      <Trust />
      <PayBadges className="mt-3 justify-center md:justify-start" />
    </section>
  );
}
