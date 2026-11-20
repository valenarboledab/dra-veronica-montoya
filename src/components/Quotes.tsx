import {useEffect, useMemo, useState} from 'react';
import {media, treatments} from '../content';
import {comboDesc, cop, decodeQuote, loadQuotes, quoteUrl, resetQuotes, saveQuotes, subtotal, total, type Quote} from '../lib/quotes';
import {ConsentText} from './Consent';
import {PayBadges} from './Trust';

const fecha = (s: string) => new Date(s).toLocaleDateString('es-CO', {day: 'numeric', month: 'short'});
const ESTADOS: Record<Quote['estado'], [string, string]> = {
  enviada: ['Enviada', 'bg-[#e6e1cf] text-ink'],
  vista: ['Vista', 'bg-[#dfd1a7] text-ink'],
  pagada: ['Pagada', 'bg-[#7f7a52] text-paper'],
  vencida: ['Vencida', 'bg-ink/10 text-mute'],
};

function Banner() {
  return <div className="mb-5 rounded-2xl bg-[#a87350] px-4 py-2.5 text-center text-small text-paper">MODO SIMULACIÓN · datos inventados · no se cobra dinero real</div>;
}

/** Panel privado de la doctora: crear cotizaciones, enviarlas por WhatsApp y ver los pagos. */
const DEMO_USER = 'vero@exora.co';
const DEMO_PASS = 'exora2026';

function Login({onIn}: {onIn: () => void}) {
  const [u, setU] = useState('');
  const [p, setP] = useState('');
  const [err, setErr] = useState(false);
  const field = 'min-h-12 w-full rounded-xl border border-line bg-paper px-3.5 text-[1rem] focus:border-coral focus:outline-none';
  return (
    <div className="mx-auto max-w-[24rem]">
      <Banner />
      <form
        className="glass grid gap-3 rounded-3xl p-6"
        onSubmit={(e) => {
          e.preventDefault();
          if (u.trim().toLowerCase() === DEMO_USER && p === DEMO_PASS) {
            sessionStorage.setItem('exora-panel', '1');
            onIn();
          } else setErr(true);
        }}
      >
        <img src={media('wordmark-olive.webp')} alt="EXORA" className="mx-auto h-7 w-auto" />
        <p className="text-center font-display text-[1.6rem]">Panel de la doctora</p>
        <input className={field} placeholder="Correo" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" />
        <input className={field} placeholder="Contraseña" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" />
        {err && <p className="text-small text-[#a87350]">Correo o contraseña incorrectos.</p>}
        <button className="min-h-12 cursor-pointer rounded-full bg-ink text-small font-medium text-paper">Entrar</button>
        <p className="text-center text-[0.72rem] text-mute">
          Simulación: correo <b>{DEMO_USER}</b> · contraseña <b>{DEMO_PASS}</b>
        </p>
      </form>
    </div>
  );
}

export function Panel() {
  const [inside, setInside] = useState(() => sessionStorage.getItem('exora-panel') === '1');
  if (!inside) return <Login onIn={() => setInside(true)} />;
  return <PanelBody onOut={() => (sessionStorage.removeItem('exora-panel'), setInside(false))} />;
}

function PanelBody({onOut}: {onOut: () => void}) {
  const [qs, setQs] = useState<Quote[]>(loadQuotes);
  const [show, setShow] = useState(false);
  const [f, setF] = useState({paciente: '', celular: '', cuotas: '1', nota: ''});
  const [lines, setLines] = useState<{n: string; v: string}[]>([{n: '', v: ''}]);
  const [filter, setFilter] = useState<'todas' | Quote['estado']>('todas');
  const update = (n: Quote[]) => {
    setQs(n);
    saveQuotes(n);
  };
  const stats = useMemo(() => {
    const pagadas = qs.filter((q) => q.estado === 'pagada');
    const pend = qs.filter((q) => q.estado === 'enviada' || q.estado === 'vista');
    return {cobrado: pagadas.reduce((a, q) => a + (q.pago?.valor ?? 0), 0), pendiente: pend.reduce((a, q) => a + total(q), 0), nPend: pend.length, nPag: pagadas.length};
  }, [qs]);
  const all = treatments.flatMap((g) => g.items.map((i) => i.n));
  const field = 'min-h-11 w-full min-w-0 rounded-xl border border-line bg-paper px-3 text-[0.95rem] focus:border-coral focus:outline-none';

  const items = lines.map((l) => ({n: l.n, v: Number(l.v.replace(/\D/g, ''))})).filter((l) => l.n && l.v);
  const desc = comboDesc(items.length);
  const crear = () => {
    if (!f.paciente.trim() || !items.length) return;
    const id = `EX-${1001 + qs.length}`;
    const q: Quote = {id, paciente: f.paciente.trim(), celular: f.celular.trim(), items, cuotas: Number(f.cuotas), desc, nota: f.nota.trim(), creada: new Date().toISOString(), vence: new Date(Date.now() + 15 * 86400000).toISOString(), estado: 'enviada'};
    update([q, ...qs]);
    setShow(false);
    setF({paciente: '', celular: '', cuotas: '1', nota: ''});
    setLines([{n: '', v: ''}]);
    enviar(q);
  };
  const enviar = (q: Quote) => {
    const msg = `Hola ${q.paciente.split(' ')[0]}, te comparto tu cotización de EXORA (${q.id}) por ${cop(total(q))}. Puedes verla y pagarla aquí: ${quoteUrl(q)}`;
    const tel = q.celular.replace(/\D/g, '');
    window.open(`https://wa.me/${tel ? '57' + tel.slice(-10) : ''}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
  };
  const exportar = () => {
    const rows = [['Cotización', 'Paciente', 'Celular', 'Tratamiento', 'Total', 'Cuotas', 'Creada', 'Estado', 'Fecha pago', 'Medio', 'Referencia']];
    qs.forEach((q) => rows.push([q.id, q.paciente, q.celular, q.items.map((i) => i.n).join(' + '), String(total(q)), String(q.cuotas), q.creada.slice(0, 10), q.estado, q.pago?.fecha.slice(0, 10) ?? '', q.pago?.medio ?? '', q.pago?.ref ?? '']));
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], {type: 'text/csv'}));
    a.download = 'exora-cotizaciones.csv';
    a.click();
  };
  const list = qs.filter((q) => filter === 'todas' || q.estado === filter);

  return (
    <div className="mx-auto max-w-[60rem]">
      <Banner />
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-micro font-medium tracking-[0.14em] text-coral uppercase">Panel privado</p>
          <h1 className="mt-2 font-display text-[2.4rem] leading-none">Cotizaciones y pagos</h1>
        </div>
        <span className="flex gap-2">
          <button type="button" onClick={() => setShow((s) => !s)} className="min-h-11 cursor-pointer rounded-full bg-ink px-5 text-small font-medium text-paper hover:bg-coral">
            + Nueva cotización
          </button>
          <button type="button" onClick={onOut} className="min-h-11 cursor-pointer rounded-full px-4 text-small text-mute hover:text-ink">
            Salir
          </button>
        </span>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        {[
          ['Cobrado', cop(stats.cobrado)],
          ['Por cobrar', cop(stats.pendiente)],
          ['Pagadas', String(stats.nPag)],
          ['Pendientes', String(stats.nPend)],
        ].map(([k, v]) => (
          <div key={k} className="glass rounded-2xl p-4">
            <span className="text-micro text-mute uppercase">{k}</span>
            <b className="mt-1 block font-display text-[1.6rem] font-medium">{v}</b>
          </div>
        ))}
      </div>

      {show && (
        <div className="glass mt-5 grid gap-3 rounded-3xl p-5 md:grid-cols-2">
          <input className={field} placeholder="Nombre de la paciente" value={f.paciente} onChange={(e) => setF({...f, paciente: e.target.value})} />
          <input className={field} placeholder="Celular (WhatsApp)" inputMode="tel" value={f.celular} onChange={(e) => setF({...f, celular: e.target.value})} />
          {lines.map((l, i) => (
            <div key={i} className="grid grid-cols-[1fr_9rem] gap-2 md:col-span-2">
              <select className={field} value={l.n} onChange={(e) => setLines(lines.map((x, j) => (j === i ? {...x, n: e.target.value} : x)))}>
                <option value="">Tratamiento {i + 1}…</option>
                {all.map((n) => (
                  <option key={n}>{n}</option>
                ))}
              </select>
              <input className={field} placeholder="Valor $" inputMode="numeric" value={l.v} onChange={(e) => setLines(lines.map((x, j) => (j === i ? {...x, v: e.target.value} : x)))} />
            </div>
          ))}
          <div className="flex flex-wrap items-center justify-between gap-2 md:col-span-2">
            {lines.length < 4 && (
              <button type="button" onClick={() => setLines([...lines, {n: '', v: ''}])} className="cursor-pointer text-small text-coral underline-offset-2 hover:underline">
                + Agregar otro tratamiento (combo)
              </button>
            )}
            <span className="text-small">
              {items.length > 0 && (
                <>
                  Subtotal {cop(subtotal({items}))}
                  {desc > 0 && <b className="text-coral"> · combo −{desc}%</b>} · Total <b>{cop(total({items, desc}))}</b>
                </>
              )}
            </span>
          </div>
          <select className={field} value={f.cuotas} onChange={(e) => setF({...f, cuotas: e.target.value})}>
            {[1, 2, 3, 6, 12].map((c) => (
              <option key={c} value={c}>
                {c === 1 ? 'Un solo pago' : `Hasta ${c} cuotas`}
              </option>
            ))}
          </select>
          <input className={field} placeholder="Nota (opcional)" value={f.nota} onChange={(e) => setF({...f, nota: e.target.value})} />
          <button type="button" onClick={crear} className="min-h-11 cursor-pointer rounded-full bg-[#25d366] text-small font-medium text-white md:col-span-2">
            Crear y enviar por WhatsApp
          </button>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-center gap-2">
        {(['todas', 'enviada', 'vista', 'pagada', 'vencida'] as const).map((e) => (
          <button key={e} type="button" onClick={() => setFilter(e)} className={`min-h-9 cursor-pointer rounded-full px-4 text-small ${filter === e ? 'bg-ink text-paper' : 'glass text-ink/70'}`}>
            {e === 'todas' ? 'Todas' : ESTADOS[e][0]}
          </button>
        ))}
        <span className="flex-1" />
        <button type="button" onClick={exportar} className="min-h-9 cursor-pointer rounded-full px-4 text-small text-coral underline-offset-2 hover:underline">
          Descargar Excel (CSV)
        </button>
      </div>

      <ul className="mt-3 grid gap-2">
        {list.map((q) => (
          <li key={q.id} className="glass flex flex-wrap items-center gap-x-4 gap-y-2 rounded-2xl p-4">
            <span className="min-w-0 flex-1">
              <span className="text-micro text-mute">
                {q.id} · {fecha(q.creada)}
              </span>
              <b className="block font-display text-[1.2rem] font-medium">{q.paciente}</b>
              <span className="text-small text-mute">
                {q.items.map((i) => i.n).join(' + ')} · {q.cuotas > 1 ? `hasta ${q.cuotas} cuotas` : 'un pago'}
                {q.desc ? ` · combo −${q.desc}%` : ''}
              </span>
              {q.pago && (
                <span className="mt-1 block text-[0.75rem] text-coral">
                  Pagó {fecha(q.pago.fecha)} · {q.pago.medio} · ref. {q.pago.ref}
                </span>
              )}
            </span>
            <b className="font-display text-[1.3rem] font-medium">{cop(total(q))}</b>
            <span className={`rounded-full px-3 py-1 text-[0.72rem] ${ESTADOS[q.estado][1]}`}>{ESTADOS[q.estado][0]}</span>
            <span className="flex gap-2">
              <a href={quoteUrl(q).slice(location.origin.length + location.pathname.length)} className="min-h-9 rounded-full border border-line px-3 py-1.5 text-[0.75rem]">
                Ver
              </a>
              {q.estado !== 'pagada' && (
                <button type="button" onClick={() => enviar(q)} className="min-h-9 cursor-pointer rounded-full border border-line px-3 text-[0.75rem]">
                  Reenviar
                </button>
              )}
            </span>
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setQs(resetQuotes())} className="mt-6 cursor-pointer text-[0.72rem] text-mute underline">
        Reiniciar la simulación
      </button>
    </div>
  );
}

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
