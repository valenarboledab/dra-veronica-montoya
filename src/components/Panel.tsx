import {useMemo, useState} from 'react';
import {media, treatments} from '../content';
import {comboDesc, cop, loadQuotes, quoteUrl, resetQuotes, saveQuotes, subtotal, total, type Quote} from '../lib/quotes';
import {Banner, ESTADOS, fecha} from './Quotes';

// SIMULACIÓN: usuarios de prueba. La versión real usa un login con servidor y contraseñas cifradas.
const USERS: Record<string, {pass: string; name: string}> = {
  'vero@exora.co': {pass: 'exora2026', name: 'Dra. Verónica'},
  'susana@exora.co': {pass: 'exora2026', name: 'Dra. Susana'},
};
const SKEY = 'exora-panel-user';

const waTo = (cel: string, msg: string) => {
  const tel = cel.replace(/\D/g, '');
  window.open(`https://wa.me/${tel ? '57' + tel.slice(-10) : ''}?text=${encodeURIComponent(msg)}`, '_blank', 'noopener');
};
const first = (n: string) => n.trim().split(' ')[0];
const vencida = (q: Quote) => q.estado !== 'pagada' && new Date(q.vence).getTime() < Date.now();

function Login({onIn}: {onIn: (name: string) => void}) {
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
          const user = USERS[u.trim().toLowerCase()];
          if (user && user.pass === p) {
            sessionStorage.setItem(SKEY, user.name);
            onIn(user.name);
          } else setErr(true);
        }}
      >
        <img src={media('wordmark-olive.webp')} alt="EXORA" className="mx-auto h-7 w-auto" />
        <p className="text-center font-display text-[1.6rem]">Panel de las doctoras</p>
        <input className={field} placeholder="Correo" value={u} onChange={(e) => setU(e.target.value)} autoComplete="username" inputMode="email" />
        <input className={field} placeholder="Contraseña" type="password" value={p} onChange={(e) => setP(e.target.value)} autoComplete="current-password" />
        {err && <p className="text-small text-[#a87350]">Correo o contraseña incorrectos.</p>}
        <button className="min-h-12 cursor-pointer rounded-full bg-ink text-small font-medium text-paper">Entrar</button>
        <p className="text-center text-[0.72rem] leading-relaxed text-mute">
          Simulación · <b>vero@exora.co</b> o <b>susana@exora.co</b>
          <br />
          contraseña <b>exora2026</b>
        </p>
      </form>
    </div>
  );
}

export function Panel() {
  const [who, setWho] = useState(() => sessionStorage.getItem(SKEY) ?? '');
  if (!who) return <Login onIn={setWho} />;
  return (
    <PanelBody
      who={who}
      onOut={() => {
        sessionStorage.removeItem(SKEY);
        setWho('');
      }}
    />
  );
}

/** Cotización rápida: pensada para hacerla en el celular frente a la paciente. */
function Quick({who, onDone}: {who: string; onDone: (q: Quote) => void}) {
  const [name, setName] = useState('');
  const [cel, setCel] = useState('');
  const [picked, setPicked] = useState<{n: string; v: string}[]>([]);
  const [cuotas, setCuotas] = useState(1);
  const [cat, setCat] = useState(treatments[0].id);
  const items = picked.map((p) => ({n: p.n, v: Number(p.v.replace(/\D/g, ''))})).filter((p) => p.v > 0);
  const desc = comboDesc(items.length);
  const ready = name.trim().length > 1 && cel.replace(/\D/g, '').length >= 10 && items.length === picked.length && items.length > 0;
  const field = 'min-h-12 w-full min-w-0 rounded-xl border border-line bg-paper px-3.5 text-[1.05rem] focus:border-coral focus:outline-none';
  const toggle = (n: string) => setPicked((ps) => (ps.some((p) => p.n === n) ? ps.filter((p) => p.n !== n) : [...ps, {n, v: ''}]));
  const group = treatments.find((g) => g.id === cat)!;
  return (
    <div className="glass mt-4 grid gap-4 rounded-3xl p-4 md:p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className={field} placeholder="Nombre de la paciente" value={name} onChange={(e) => setName(e.target.value)} autoComplete="off" />
        <input className={field} placeholder="Celular (WhatsApp)" inputMode="tel" value={cel} onChange={(e) => setCel(e.target.value)} />
      </div>
      <div>
        <p className="text-small font-medium">Toca los tratamientos</p>
        <div className="mt-2 flex flex-wrap gap-1.5">
          {treatments.map((g) => (
            <button key={g.id} type="button" onClick={() => setCat(g.id)} className={`min-h-9 cursor-pointer rounded-full px-3 text-[0.8rem] ${cat === g.id ? 'bg-ink text-paper' : 'bg-ink/6 text-ink/70'}`}>
              {g.short}
            </button>
          ))}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          {group.items.map((it) => {
            const on = picked.some((p) => p.n === it.n);
            return (
              <button key={it.n} type="button" onClick={() => toggle(it.n)} className={`min-h-11 cursor-pointer rounded-xl border px-3 text-[0.9rem] ${on ? 'border-coral bg-coral text-paper' : 'border-line bg-paper'}`}>
                {on ? '✓ ' : '+ '}
                {it.n}
              </button>
            );
          })}
        </div>
      </div>
      {picked.length > 0 && (
        <ul className="grid gap-2">
          {picked.map((p, i) => (
            <li key={p.n} className="grid grid-cols-[1fr_8.5rem] items-center gap-2">
              <span className="text-[0.95rem]">{p.n}</span>
              <input
                className={field}
                placeholder="$ valor"
                inputMode="numeric"
                value={p.v ? cop(Number(p.v.replace(/\D/g, ''))) : ''}
                onChange={(e) => setPicked(picked.map((x, j) => (j === i ? {...x, v: e.target.value.replace(/\D/g, '')} : x)))}
              />
            </li>
          ))}
        </ul>
      )}
      <div>
        <p className="text-small font-medium">Forma de pago</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {[1, 3, 6, 12].map((c) => (
            <button key={c} type="button" onClick={() => setCuotas(c)} className={`min-h-10 cursor-pointer rounded-full px-4 text-[0.85rem] ${cuotas === c ? 'bg-ink text-paper' : 'bg-ink/6'}`}>
              {c === 1 ? 'Un pago' : `${c} cuotas`}
            </button>
          ))}
        </div>
      </div>
      {items.length > 0 && (
        <div className="flex items-end justify-between rounded-2xl bg-[#ebe6d6] px-4 py-3">
          <span className="text-small">
            {desc > 0 ? (
              <>
                <s className="text-mute">{cop(subtotal({items}))}</s> <b className="text-coral">combo −{desc}%</b>
              </>
            ) : (
              'Total'
            )}
          </span>
          <b className="font-display text-[1.8rem] leading-none">{cop(total({items, desc}))}</b>
        </div>
      )}
      <button
        type="button"
        disabled={!ready}
        onClick={() => {
          const all = loadQuotes();
          const q: Quote = {id: `EX-${1001 + all.length}`, paciente: name.trim(), celular: cel.trim(), items, cuotas, desc, nota: '', creada: new Date().toISOString(), vence: new Date(Date.now() + 15 * 86400000).toISOString(), estado: 'enviada', por: who};
          waTo(q.celular, `Hola ${first(q.paciente)} 😊 Te comparto tu cotización de EXORA (${q.id}) por ${cop(total(q))}${q.cuotas > 1 ? `, que puedes pagar hasta en ${q.cuotas} cuotas` : ''}. Aquí la ves y la pagas de forma segura: ${quoteUrl(q)}\n${who}`);
          onDone(q);
        }}
        className="min-h-14 cursor-pointer rounded-full bg-[#25d366] text-[1rem] font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
      >
        Enviar por WhatsApp
      </button>
    </div>
  );
}

function PanelBody({who, onOut}: {who: string; onOut: () => void}) {
  const [qs, setQs] = useState<Quote[]>(() => loadQuotes().map((q) => (vencida(q) ? {...q, estado: 'vencida' as const} : q)));
  const [show, setShow] = useState(false);
  const [filter, setFilter] = useState<'todas' | Quote['estado']>('todas');
  const [doc, setDoc] = useState<'todas' | string>('todas');
  const update = (n: Quote[]) => {
    setQs(n);
    saveQuotes(n);
  };
  const stats = useMemo(() => {
    const pag = qs.filter((q) => q.estado === 'pagada');
    const pend = qs.filter((q) => q.estado !== 'pagada');
    return {cobrado: pag.reduce((a, q) => a + (q.pago?.valor ?? 0), 0), pendiente: pend.reduce((a, q) => a + total(q), 0), nPend: pend.length, nPag: pag.length};
  }, [qs]);
  const recordar = (q: Quote) => {
    const msg =
      q.estado === 'vencida'
        ? `Hola ${first(q.paciente)}, ¿cómo estás? 🌿 Te escribo de EXORA. Tu cotización ${q.id} (${q.items.map((i) => i.n).join(' + ')}) por ${cop(total(q))} venció el ${new Date(q.vence).toLocaleDateString('es-CO', {day: 'numeric', month: 'long'})}. Si todavía te interesa, con gusto te la actualizamos y te ayudamos a agendar. Aquí puedes verla: ${quoteUrl(q)}\n${q.por ?? who}`
        : `Hola ${first(q.paciente)}, ¿cómo estás? 🌿 Te escribo de EXORA para recordarte tu cotización ${q.id} por ${cop(total(q))}. Cuando quieras, puedes pagarla aquí de forma segura y te confirmamos tu cita: ${quoteUrl(q)}\nCualquier duda, me escribes. ${q.por ?? who}`;
    waTo(q.celular, msg);
    update(qs.map((x) => (x.id === q.id ? {...x, recordada: new Date().toISOString()} : x)));
  };
  const exportar = () => {
    const rows = [['Cotización', 'Doctora', 'Paciente', 'Celular', 'Tratamientos', 'Descuento %', 'Total', 'Cuotas', 'Creada', 'Vence', 'Estado', 'Fecha pago', 'Medio', 'Referencia']];
    qs.forEach((q) => rows.push([q.id, q.por ?? '', q.paciente, q.celular, q.items.map((i) => i.n).join(' + '), String(q.desc ?? 0), String(total(q)), String(q.cuotas), q.creada.slice(0, 10), q.vence.slice(0, 10), q.estado, q.pago?.fecha.slice(0, 10) ?? '', q.pago?.medio ?? '', q.pago?.ref ?? '']));
    const csv = rows.map((r) => r.map((c) => `"${c.replace(/"/g, '""')}"`).join(',')).join('\n');
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob(['﻿' + csv], {type: 'text/csv'}));
    a.download = 'exora-cotizaciones.csv';
    a.click();
  };
  const list = qs.filter((q) => (filter === 'todas' || q.estado === filter) && (doc === 'todas' || q.por === doc));

  return (
    <div className="mx-auto max-w-[60rem]">
      <Banner />
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-micro font-medium tracking-[0.14em] text-coral uppercase">Hola, {who}</p>
          <h1 className="mt-1 font-display text-[2rem] leading-none md:text-[2.4rem]">Cotizaciones y pagos</h1>
        </div>
        <button type="button" onClick={onOut} className="min-h-10 cursor-pointer rounded-full px-3 text-small text-mute hover:text-ink">
          Salir
        </button>
      </div>

      <button type="button" onClick={() => setShow((s) => !s)} className="mt-4 flex min-h-14 w-full cursor-pointer items-center justify-center gap-2 rounded-full bg-ink text-[1rem] font-medium text-paper hover:bg-coral">
        {show ? 'Cerrar' : '⚡ Cotización rápida'}
      </button>
      {show && (
        <Quick
          who={who}
          onDone={(q) => {
            update([q, ...qs]);
            setShow(false);
          }}
        />
      )}

      <div className="mt-5 grid grid-cols-2 gap-2 md:grid-cols-4 md:gap-3">
        {[
          ['Cobrado', cop(stats.cobrado)],
          ['Por cobrar', cop(stats.pendiente)],
          ['Pagadas', String(stats.nPag)],
          ['Pendientes', String(stats.nPend)],
        ].map(([k, v]) => (
          <div key={k} className="glass rounded-2xl p-3 md:p-4">
            <span className="text-micro text-mute uppercase">{k}</span>
            <b className="mt-1 block font-display text-[1.35rem] font-medium md:text-[1.6rem]">{v}</b>
          </div>
        ))}
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {(['todas', 'enviada', 'vista', 'pagada', 'vencida'] as const).map((e) => (
          <button key={e} type="button" onClick={() => setFilter(e)} className={`min-h-9 cursor-pointer rounded-full px-3.5 text-small ${filter === e ? 'bg-ink text-paper' : 'glass text-ink/70'}`}>
            {e === 'todas' ? 'Todas' : ESTADOS[e][0]}
          </button>
        ))}
        <select value={doc} onChange={(e) => setDoc(e.target.value)} className="min-h-9 rounded-full border border-line bg-paper px-3 text-small">
          <option value="todas">Ambas doctoras</option>
          <option>Dra. Verónica</option>
          <option>Dra. Susana</option>
        </select>
        <span className="flex-1" />
        <button type="button" onClick={exportar} className="min-h-9 cursor-pointer text-small text-coral underline-offset-2 hover:underline">
          Descargar Excel
        </button>
      </div>

      <ul className="mt-3 grid gap-2">
        {list.map((q) => (
          <li key={q.id} className="glass grid gap-2 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <span className="min-w-0">
                <span className="text-micro text-mute">
                  {q.id} · {fecha(q.creada)} · {q.por}
                </span>
                <b className="block font-display text-[1.2rem] font-medium">{q.paciente}</b>
                <span className="text-small text-mute">
                  {q.items.map((i) => i.n).join(' + ')}
                  {q.desc ? ` · combo −${q.desc}%` : ''} · {q.cuotas > 1 ? `${q.cuotas} cuotas` : 'un pago'}
                </span>
              </span>
              <span className="shrink-0 text-right">
                <b className="block font-display text-[1.25rem] font-medium">{cop(total(q))}</b>
                <span className={`mt-1 inline-block rounded-full px-2.5 py-0.5 text-[0.7rem] ${ESTADOS[q.estado][1]}`}>{ESTADOS[q.estado][0]}</span>
              </span>
            </div>
            {q.pago && (
              <span className="text-[0.75rem] text-coral">
                Pagó {fecha(q.pago.fecha)} · {q.pago.medio} · ref. {q.pago.ref}
              </span>
            )}
            {q.estado !== 'pagada' && (
              <div className="flex flex-wrap items-center gap-2">
                <button type="button" onClick={() => recordar(q)} className="flex min-h-10 cursor-pointer items-center gap-1.5 rounded-full bg-[#25d366] px-4 text-small font-medium text-white">
                  🔔 Recordar por WhatsApp
                </button>
                <a href={quoteUrl(q).slice(location.origin.length + location.pathname.length)} className="min-h-10 rounded-full border border-line px-4 py-2 text-small">
                  Ver
                </a>
                {q.recordada && <span className="text-[0.72rem] text-mute">Recordada {fecha(q.recordada)}</span>}
              </div>
            )}
          </li>
        ))}
      </ul>
      <button type="button" onClick={() => setQs(resetQuotes())} className="mt-6 cursor-pointer text-[0.72rem] text-mute underline">
        Reiniciar la simulación
      </button>
    </div>
  );
}
