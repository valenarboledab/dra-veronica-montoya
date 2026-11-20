import {useState, type CSSProperties} from 'react';
import {PAY} from '../content';
import {BlurText} from './BlurText';
import {WaLink} from './Consent';

/** Pagos en línea. Funciona con enlaces de pago (Bold, Mercado Pago, Wompi, Addi…): basta con pegarlos en PAY en content.ts. */
export function Pay() {
  const [ok, setOk] = useState(false);
  const options = [
    {id: 'tarjeta', title: 'Tarjeta, PSE o Nequi', text: 'Crédito o débito (puedes diferir a cuotas con tu tarjeta), PSE desde tu banco o billeteras.', href: PAY.tarjeta, badge: 'Visa · Mastercard · PSE'},
    {id: 'cuotas', title: 'A cuotas sin tarjeta', text: 'Paga en cuotas con una app de financiación: la aprobación es en minutos desde tu celular.', href: PAY.cuotas, badge: PAY.cuotasProveedor},
  ];
  return (
    <div className="mx-auto max-w-[46rem]">
      <p className="text-micro font-medium tracking-[0.14em] text-coral uppercase">Pagos</p>
      <BlurText lines={['Paga tu', '*tratamiento*']} className="mt-3 font-display text-title font-medium" delay={100} />
      <p className="mt-5 max-w-[32rem] text-copy text-ink/70" data-reveal style={{'--d': '300ms'} as CSSProperties}>
        Primero confirma con la doctora el valor de tu tratamiento por WhatsApp. Luego paga aquí de forma segura: tú escribes el valor y eliges cómo pagar.
      </p>
      <label className="mt-6 flex gap-3 rounded-xl border border-line p-3 text-[0.78rem] leading-snug text-ink/80" data-reveal>
        <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[#7f7a52]" checked={ok} onChange={(e) => setOk(e.target.checked)} />
        <span>
          Ya confirmé el valor con EXORA y acepto la{' '}
          <a href="#privacidad" target="_blank" rel="noopener" className="underline">
            Política de Tratamiento de Datos
          </a>
          . El pago lo procesa una plataforma de pagos certificada; EXORA no ve ni guarda los datos de mi tarjeta.
        </span>
      </label>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {options.map((o, i) => {
          const live = !!o.href && ok;
          return (
            <div key={o.id} className="glass flex flex-col rounded-3xl p-5" data-reveal style={{'--d': `${200 + i * 120}ms`} as CSSProperties}>
              <span className="self-start rounded-full bg-ink/6 px-2.5 py-1 text-[0.68rem] text-mute">{o.badge}</span>
              <b className="mt-3 font-display text-[1.45rem] leading-tight font-medium">{o.title}</b>
              <span className="mt-1 flex-1 text-small text-mute">{o.text}</span>
              {o.href ? (
                <a
                  href={live ? o.href : undefined}
                  target="_blank"
                  rel="noopener"
                  aria-disabled={!live}
                  className={`mt-4 flex min-h-12 items-center justify-center rounded-full text-small font-medium ${live ? 'bg-ink text-paper hover:bg-coral' : 'cursor-not-allowed bg-ink/20 text-paper'}`}
                >
                  Pagar
                </a>
              ) : (
                <WaLink text={`Hola EXORA, quiero pagar mi tratamiento (${o.title.toLowerCase()}).`} className="mt-4 flex min-h-12 items-center justify-center rounded-full border border-ink/20 text-small font-medium">
                  Pedir enlace de pago por WhatsApp
                </WaLink>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-5 text-[0.72rem] text-mute">Si necesitas factura o tienes dudas con tu pago, escríbenos por WhatsApp.</p>
    </div>
  );
}
