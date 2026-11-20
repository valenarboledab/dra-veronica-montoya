import {useEffect, useState} from 'react';
import {media} from '../content';
import {cop, decodeQuote, loadQuotes, saveQuotes, subtotal, total, type Quote} from '../lib/quotes';
import {ConsentText} from './Consent';
import {PayBadges} from './Trust';

export const fecha = (s: string) => new Date(s).toLocaleDateString('es-CO', {day: 'numeric', month: 'short'});
export const ESTADOS: Record<Quote['estado'], [string, string]> = {
  enviada: ['Enviada', 'bg-[#e6e1cf] text-ink'],
  vista: ['Vista', 'bg-[#dfd1a7] text-ink'],
  pagada: ['Pagada', 'bg-[#7f7a52] text-paper'],
  vencida: ['Vencida', 'bg-ink/10 text-mute'],
};

export function Banner() {
  return <div className="mb-5 rounded-2xl bg-[#a87350] px-4 py-2.5 text-center text-small text-paper">MODO SIMULACIÓN · datos inventados · no se cobra dinero real</div>;
}

/** Panel privado de la doctora: crear cotizaciones, enviarlas por WhatsApp y ver los pagos. */
/** Lo que ve la paciente al abrir el enlace de su cotización. */
export function QuoteView() {
  const q = decodeQuote(new URLSearchParams(location.hash.split('?')[1] ?? '').get('q') ?? '');
  const [ok, setOk] = useState(false);
  const [paid, setPaid] = useState(false);
  useEffect(() => {
    if (!q) return;
    const qs = loadQuotes();
    const i = qs.findIndex((x) => x.id === q.id);
    if (i >= 0 && qs[i].estado === 'enviada') {
      qs[i] = {...qs[i], estado: 'vista'};
      saveQuotes(qs);
    }
  }, [q?.id]);
  if (!q) return <p className="text-copy">Este enlace de cotización no es válido. Escríbenos por WhatsApp.</p>;
  const t = total(q);
  const [step, setStep] = useState<'quote' | 'methods' | 'redirect'>('quote');
  const [method, setMethod] = useState('');
  const METHODS = [
    ['Tarjeta de crédito', 'Visa, Mastercard, Amex · puedes diferir a cuotas'],
    ['Tarjeta débito', 'Débito de cualquier banco'],
    ['PSE', 'Débito directo desde tu banco (Bancolombia, Davivienda, BBVA, Bogotá…)'],
    ['Nequi', 'Aprueba el pago en tu app Nequi'],
    ['Daviplata', 'Aprueba el pago en tu app Daviplata'],
    ['Botón Bancolombia', 'Paga desde tu Sucursal Virtual Bancolombia'],
    ['Llave Bre-B', 'Transferencia inmediata con llave (celular, cédula o correo)'],
  ];
  const pagar = (m: string) => {
    setMethod(m);
    setStep('redirect');
    setTimeout(() => {
      const qs = loadQuotes();
      const i = qs.findIndex((x) => x.id === q.id);
      if (i >= 0) {
        qs[i] = {...qs[i], estado: 'pagada', pago: {fecha: new Date().toISOString(), medio: m === 'Tarjeta de crédito' && q.cuotas > 1 ? `Tarjeta de crédito · ${q.cuotas} cuotas` : m, ref: 'MP-SIM-' + Math.floor(10000 + Math.random() * 89999), valor: t}};
        saveQuotes(qs);
      }
      setPaid(true);
    }, 3800);
  };
  return (
    <div className="mx-auto max-w-[34rem]">
      <Banner />
      <div className="overflow-hidden rounded-[1.8rem] bg-[#f7f5ef] shadow-[0_30px_70px_-40px_rgb(59_56_35/0.6)]">
        <div className="flex items-center justify-between bg-coral px-6 py-5 text-paper">
          <img src={media('wordmark-white.webp')} alt="EXORA" className="h-6 w-auto" />
          <span className="text-micro tracking-[0.14em] uppercase">Cotización {q.id}</span>
        </div>
        <div className="p-6">
          <p className="text-small text-mute">Para</p>
          <p className="font-display text-[1.8rem] leading-tight">{q.paciente}</p>
          <ul className="mt-5 divide-y divide-line border-y border-line">
            {q.items.map((i) => (
              <li key={i.n} className="flex justify-between gap-4 py-3 text-copy">
                <span>{i.n}</span>
                <b className="font-medium">{i.v ? cop(i.v) : 'Incluido'}</b>
              </li>
            ))}
          </ul>
          {q.desc ? (
            <div className="mt-3 flex justify-between text-small">
              <span className="text-mute">
                Subtotal <s>{cop(subtotal(q))}</s>
              </span>
              <b className="text-coral">Combo −{q.desc}%</b>
            </div>
          ) : null}
          <div className="mt-4 flex items-end justify-between">
            <span className="text-small text-mute">Total</span>
            <b className="font-display text-[2.2rem] leading-none font-medium">{cop(t)}</b>
          </div>
          {q.cuotas > 1 && <p className="mt-1 text-right text-small text-coral">Hasta {q.cuotas} cuotas de {cop(t / q.cuotas)} con tarjeta de crédito</p>}
          {q.nota && <p className="mt-4 rounded-xl bg-[#ebe6d6] px-4 py-3 text-small">{q.nota}</p>}
          <p className="mt-3 text-[0.72rem] text-mute">Válida hasta el {new Date(q.vence).toLocaleDateString('es-CO', {day: 'numeric', month: 'long', year: 'numeric'})}.</p>

          {paid ? (
            <div className="mt-6 rounded-2xl bg-[#7f7a52] p-5 text-center text-paper">
              <b className="block font-display text-[1.6rem]">¡Pago aprobado!</b>
              <span className="text-small">{method} · te escribimos por WhatsApp para confirmar tu cita.</span>
            </div>
          ) : step === 'redirect' ? (
            <div className="mt-6 rounded-2xl border border-line p-5 text-center">
              <span className="mx-auto block size-8 animate-spin rounded-full border-2 border-line border-t-coral" />
              <b className="mt-3 block font-display text-[1.3rem]">Te llevamos a pagar de forma segura…</b>
              <span className="mt-1 block text-small text-mute">
                En la versión real aquí se abre <b>mercadopago.com.co</b> (candado 🔒 en la barra) y, si eliges {method}, la página o la app de tu banco. Tú apruebas el pago allá; EXORA nunca ve tus claves ni tu tarjeta.
              </span>
              <span className="mt-2 block text-[0.7rem] text-[#a87350]">Simulación: no se abre ninguna página real ni se cobra dinero.</span>
            </div>
          ) : step === 'methods' ? (
            <div className="mt-6">
              <p className="text-small font-medium">¿Cómo quieres pagar?</p>
              <ul className="mt-2 grid gap-2">
                {METHODS.map(([m, d]) => (
                  <li key={m}>
                    <button type="button" onClick={() => pagar(m)} className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-xl border border-line bg-paper px-4 py-3 text-left hover:border-coral">
                      <span>
                        <b className="block text-[0.95rem] font-medium">{m}</b>
                        <span className="text-[0.75rem] text-mute">{d}</span>
                      </span>
                      <span aria-hidden>→</span>
                    </button>
                  </li>
                ))}
              </ul>
              <button type="button" onClick={() => setStep('quote')} className="mt-3 cursor-pointer text-small text-mute underline">
                Volver
              </button>
            </div>
          ) : (
            <>
              <label className="mt-6 flex gap-3 rounded-xl border border-line p-3 text-[0.75rem] leading-snug text-ink/80">
                <input type="checkbox" className="mt-0.5 size-5 shrink-0 accent-[#7f7a52]" checked={ok} onChange={(e) => setOk(e.target.checked)} />
                <span>
                  <ConsentText />
                </span>
              </label>
              <button type="button" onClick={() => ok && setStep('methods')} aria-disabled={!ok} className={`mt-4 flex min-h-12 w-full items-center justify-center rounded-full text-small font-medium ${ok ? 'cursor-pointer bg-ink text-paper hover:bg-coral' : 'cursor-not-allowed bg-ink/20 text-paper'}`}>
                Pagar {cop(t)}
              </button>
              <PayBadges className="mt-3 justify-center" />
              <p className="mt-3 text-center text-[0.7rem] text-mute">Productos con registro sanitario INVIMA vigente.</p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
