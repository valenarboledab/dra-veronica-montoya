import {useEffect, useRef, useState, type CSSProperties} from 'react';
import {doctor, susana, faq, media, treatments, visit, wa, WA_SHOW, type View, ADDRESS} from '../content';
import {useReveals} from '../hooks/useReveals';
import {BlurText} from './BlurText';
import {DropScene} from './DropScene';
import {Results} from './BeforeAfter';
import {Privacy} from './Privacy';
import {Pay} from './Pay';
import {Combos} from './Combos';
import {QuoteView} from './Quotes';
import {Panel} from './Panel';
import {ConsentText, consentLine, WaLink} from './Consent';
import {newConsentId, saveConsent} from '../lib/consents';
import {AnatomyDialog} from './Anatomy';
import {REELS, Viewer, type Reel} from './Reels';
import {BotoxDialog} from './BotoxDemo';
import {Eco} from './Eco';
import {useReducedMotion} from '../hooks/useReducedMotion';

const Eyebrow = ({children}: {children: string}) => (
  <p className="flex items-center gap-2 text-micro font-medium text-mute uppercase" data-reveal>
    <span className="size-1.5 rounded-full bg-coral" />
    {children}
  </p>
);

const dropWord: Record<string, string> = {facial: 'Facial', intimo: 'Íntimo', regen: 'Regenerativa'};

function Facts({it}: {it: (typeof treatments)[number]['items'][number]}) {
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 text-small">
      <div className="col-span-2">
        <dt className="text-micro text-mute uppercase">Ideal para</dt>
        <dd>{it.p}</dd>
      </div>
      <div>
        <dt className="text-micro text-mute uppercase">Sesión</dt>
        <dd className="whitespace-nowrap">{it.s}</dd>
      </div>
      <div>
        <dt className="text-micro text-mute uppercase">Resultado</dt>
        <dd>{it.e}</dd>
      </div>
    </dl>
  );
}

/** Las figuras 3D por tratamiento quedan ocultas hasta aprobar el nuevo estilo (ver /demo/botox.html). */
const SHOW_3D = false;

function TreatmentCard({it, i}: {it: (typeof treatments)[number]['items'][number]; i: number}) {
  const [open, setOpen] = useState(false);
  const [fig, setFig] = useState(false);
  const [vid, setVid] = useState<Reel | null>(null);
  const [ba, setBa] = useState(false);
  return (
    <article
      className="card-in glass flex flex-col gap-2 rounded-2xl p-4 md:gap-3 md:rounded-3xl md:p-6"
      style={{'--d': `${i * 50}ms`} as CSSProperties}
    >
      <h3 className="font-display text-[1.15rem] font-medium tracking-[-0.03em] md:text-[1.35rem]">{it.n}</h3>
      <p className={`text-small text-mute md:line-clamp-none ${open ? '' : 'line-clamp-2'}`}>{it.d}</p>
      {it.f === 'facial-botox' && (
        <button type="button" onClick={() => setBa(true)} className="group relative mt-1 cursor-pointer overflow-hidden rounded-xl text-left">
          <span className="grid grid-cols-2 gap-px">
            <img src={media('ba-antes.webp')} alt="" className="aspect-[4/3] w-full object-cover object-[50%_35%]" loading="lazy" />
            <img src={media('ba-despues.webp')} alt="" className="aspect-[4/3] w-full object-cover object-[50%_35%]" loading="lazy" />
          </span>
          <span className="absolute inset-x-2 bottom-2 flex items-center justify-between rounded-full bg-paper/90 px-3 py-1.5 text-[0.8rem] font-semibold backdrop-blur-sm">
            Ver antes y después <span aria-hidden>→</span>
          </span>
        </button>
      )}
      <div className={`mt-1 border-t border-line pt-3 md:block md:pt-4 ${open ? 'block' : 'hidden'}`}>
        <Facts it={it} />
      </div>
      <div className="flex items-center justify-between gap-3 md:mt-auto md:pt-2">
        <span className="flex items-center gap-4">
          <WaLink text={`Hola EXORA, quiero información sobre ${it.n.toLowerCase()}.`} className="text-small font-semibold text-coral hover:underline">
            Preguntar →
          </WaLink>
          {it.f && REELS.some((r) => r.fig === it.f) && (
            <button type="button" onClick={() => setVid(REELS.find((r) => r.fig === it.f) ?? null)} className="min-h-9 cursor-pointer text-small font-semibold text-ink/75 underline-offset-2 hover:underline">
              ▶ Ver video
            </button>
          )}
          {SHOW_3D && it.f && (
            <button type="button" onClick={() => setFig(true)} className="min-h-9 cursor-pointer text-small font-semibold text-ink/70 underline-offset-2 hover:underline">
              Ver en 3D
            </button>
          )}
        </span>
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="min-h-9 cursor-pointer text-small text-mute md:hidden"
        >
          {open ? 'Ocultar' : 'Ver detalles'}
        </button>
      </div>
      {vid && <Viewer r={vid} onClose={() => setVid(null)} />}
      {ba && <BotoxDialog onClose={() => setBa(false)} />}
      {fig && it.f && <AnatomyDialog id={it.f} n={i + 1} onClose={() => setFig(false)} />}
    </article>
  );
}

function Treatments() {
  const [tab, setTab] = useState(treatments[0].id);
  const reduced = useReducedMotion();
  const group = treatments.find((t) => t.id === tab)!;
  return (
    <>
      <div className="grid items-center gap-4 md:grid-cols-[1fr_auto] md:gap-[4vw] [&>*]:min-w-0">
        <div>
          <Eyebrow>Tratamientos</Eyebrow>
          <h1 className="mt-2 font-display text-[2rem] leading-none font-medium tracking-[-0.035em] md:text-title">
            Pensados para <span className="accent">ti</span>
          </h1>
          <p className="mt-3 hidden max-w-[34rem] text-copy text-ink/70 md:block">{group.intro}</p>
          {/* pestañas con cuántos tratamientos hay en cada una */}
          <div role="tablist" className="mt-4 flex max-w-full flex-wrap gap-2 md:glass md:mt-5 md:inline-flex md:flex-nowrap md:gap-1 md:rounded-full md:p-1">
            {treatments.map((t) => (
              <button
                key={t.id}
                role="tab"
                aria-selected={tab === t.id}
                onClick={() => setTab(t.id)}
                className={`flex min-h-11 shrink-0 cursor-pointer items-center gap-2 rounded-full px-4 text-small font-medium transition-colors md:px-5 ${tab === t.id ? 'bg-ink text-paper' : 'glass text-ink/70 hover:text-ink md:bg-transparent md:backdrop-blur-none'}`}
              >
                {t.short}
                <span className={`grid size-5 place-items-center rounded-full text-[0.68rem] ${tab === t.id ? 'bg-paper/20' : 'bg-ink/8'}`}>{t.items.length}</span>
              </button>
            ))}
          </div>
          <p className="mt-3 text-small text-ink/65 md:hidden">{group.intro}</p>
        </div>
        {/* la gota: solo en pantallas grandes; la palabra cambia con la pestaña */}
        <div className="hidden md:block md:h-56 md:w-[22rem] lg:w-[26rem]" aria-hidden>
          <DropScene word={dropWord[tab]} reduced={reduced} />
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2.5 rounded-2xl bg-coral/10 px-4 py-3 text-small text-ink/80">
        <svg viewBox="0 0 24 24" className="mt-0.5 size-5 shrink-0 text-coral" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
          <path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.2 7.5 9.5 4.3-1.3 7.5-4.9 7.5-9.5V6L12 3Z" />
          <path d="m8.8 12.2 2.2 2.2 4.4-4.6" />
        </svg>
        <span>
          <b className="font-semibold text-ink">Productos con registro sanitario INVIMA.</b> Todos los productos y medicamentos que aplicamos tienen registro INVIMA vigente; pídenos el número de registro de tu tratamiento.
        </span>
      </div>
      <div key={tab} className="mt-5 grid gap-3 sm:grid-cols-2 md:mt-6 md:gap-4 lg:grid-cols-3">
        {group.items.map((it, i) => (
          <TreatmentCard key={it.n} it={it} i={i} />
        ))}
      </div>
      <p className="mt-6 text-[0.75rem] text-mute">
        Los tiempos son aproximados y varían en cada paciente. Los resultados no se pueden garantizar: tu plan se define en consulta.
      </p>
    </>
  );
}

/** Video de la doctora: la toma una vez y luego el loop de su mirada a cámara. */
function DoctorFilm() {
  const intro = useRef<HTMLVideoElement>(null);
  const idle = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = intro.current;
    const w = idle.current;
    if (!v || !w) return;
    const show = () => {
      w.style.opacity = '1';
      v.style.opacity = '0';
    };
    if (matchMedia('(prefers-reduced-motion: reduce)').matches) return show();
    const toIdle = () => w.play().then(show).catch(show);
    v.addEventListener('ended', toIdle);
    // si el celular bloquea el autoplay, arranca al primer toque o scroll
    const kick = () => {
      if (v.paused && !v.ended && v.style.opacity !== '0') v.play().catch(() => {});
      else if (v.ended && w.paused) w.play().catch(() => {});
    };
    const gestures = ['touchend', 'click', 'touchstart', 'scroll'] as const;
    gestures.forEach((g) => window.addEventListener(g, kick, {passive: true}));
    v.play().catch(() => {});
    return () => {
      v.removeEventListener('ended', toIdle);
      gestures.forEach((g) => window.removeEventListener(g, kick));
    };
  }, []);
  const cls = 'absolute inset-0 size-full object-cover object-[50%_20%] transition-opacity duration-200';
  return (
    <>
      <video ref={idle} src={media('vero-idle.mp4')} poster={media('vero-end.webp')} className={`${cls} opacity-0`} muted loop playsInline preload="auto" aria-hidden />
      <video
        ref={intro}
        src={media('vero-intro.mp4')}
        autoPlay
        poster={media('vero-end.webp')}
        className={cls}
        muted
        playsInline
        preload="auto"
        aria-label="La Dra. Verónica Montoya mira a un lado, cierra los ojos y luego mira de frente a la cámara"
      />
    </>
  );
}

function Doctor() {
  return (
    <div className="grid items-start gap-8 md:grid-cols-[0.85fr_1.15fr] md:gap-[5vw]">
      <div className="relative mx-auto aspect-[3/4] w-[50%] max-w-[12rem] md:aspect-[2/3] md:w-[min(100%,22rem,calc((100svh-13rem)*0.6667))] md:max-w-none md:self-start md:sticky md:top-36" data-reveal>
        <div className="arch absolute inset-0 translate-x-2.5 -translate-y-2.5 border border-coral/35 md:translate-x-4 md:-translate-y-4" />
        <div className="arch relative size-full bg-white">
          <DoctorFilm />
        </div>
      </div>
      <div>
        <Eyebrow>Las doctoras de EXORA</Eyebrow>
        <BlurText lines={doctor.title} className="mt-3 font-display text-title font-medium" delay={100} />
        <p className="mt-5 max-w-[34rem] text-copy text-ink/75" data-reveal style={{'--d': '400ms'} as CSSProperties}>
          {doctor.body}
        </p>
        <ul className="mt-8 divide-y divide-line border-y border-line" data-reveal style={{'--d': '550ms'} as CSSProperties}>
          {doctor.facts.map(([k, v]) => (
            <li key={k} className="flex flex-col gap-0.5 py-3.5 sm:flex-row sm:gap-6">
              <span className="w-32 shrink-0 text-small font-semibold">{k}</span>
              <span className="text-small text-mute">{v}</span>
            </li>
          ))}
        </ul>
        <div className="glass mt-6 flex items-center gap-4 rounded-3xl p-5" data-reveal style={{'--d': '700ms'} as CSSProperties}>
          <span className="grid size-12 shrink-0 place-items-center rounded-full bg-coral font-display text-lg text-paper">SZ</span>
          <span>
            <b className="block font-display text-[1.2rem] font-medium">{susana.name}</b>
            <span className="block text-micro font-medium text-coral uppercase">{susana.role}</span>
            <span className="mt-1 block text-small text-mute">{susana.body}</span>
          </span>
        </div>
      </div>
    </div>
  );
}

/** Los pasos de la primera cita, dentro de Agenda. */
function Visit() {
  return (
    <section className="mt-14 md:mt-20">
      <Eyebrow>Tu primera cita</Eyebrow>
      <h2 className="mt-2 font-display text-[1.9rem] leading-tight font-medium md:text-[2.6rem]">
        Así es tu <span className="accent">primera</span> cita
      </h2>
      <ol className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visit.map(([t, d], i) => (
          <li key={t} className="glass relative rounded-3xl p-6" data-reveal style={{'--d': `${100 + i * 120}ms`} as CSSProperties}>
            <span className="node mb-5 block size-[11px] rounded-full bg-coral shadow-[0_0_0_5px_rgb(127_122_82/0.16)]" />
            <h3 className="font-display text-[1.3rem] font-medium tracking-[-0.03em]">{t}</h3>
            <p className="mt-2 text-small text-mute">{d}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}

function Faq() {
  return (
    <div className="grid gap-10 md:grid-cols-[0.8fr_1.2fr] md:gap-[5vw]">
      <div>
        <Eyebrow>Preguntas</Eyebrow>
        <BlurText lines={['Preguntas', '*frecuentes*']} className="mt-3 font-display text-title font-medium" delay={100} />
        <p className="mt-5 max-w-[22rem] text-copy text-ink/70" data-reveal style={{'--d': '400ms'} as CSSProperties}>
          ¿Tienes otra duda? Escríbenos por WhatsApp y te respondemos con gusto.
        </p>
      </div>
      <div data-reveal style={{'--d': '300ms'} as CSSProperties}>
        <nav className="mb-6 flex flex-wrap gap-2" aria-label="Temas">
          {faq.map((g) => (
            <a key={g.t} href={`#faq-${g.t}`} onClick={(e) => { e.preventDefault(); document.getElementById(`faq-${g.t}`)?.scrollIntoView({behavior: 'smooth', block: 'start'}); }} className="glass min-h-9 rounded-full px-3.5 py-1.5 text-[0.82rem] text-ink/75 hover:text-ink">
              {g.t}
            </a>
          ))}
        </nav>
        {faq.map((g) => (
          <section key={g.t} id={`faq-${g.t}`} className="mb-8 scroll-mt-40">
            <h2 className="font-display text-[1.6rem] leading-tight font-medium text-coral md:text-[1.9rem]">{g.t}</h2>
            {g.qs.map(([q, a]) => (
              <details key={q} className="group border-b border-line">
                <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-4 text-[1.02rem] font-medium [&::-webkit-details-marker]:hidden">
                  {q}
                  <span className="accent text-[1.6rem] leading-none text-coral transition-transform group-open:rotate-45">+</span>
                </summary>
                <p className="max-w-[38rem] pb-5 text-copy text-mute">{a}</p>
              </details>
            ))}
          </section>
        ))}
      </div>
    </div>
  );
}

function ResultsPage() {
  return (
    <>
      <Eyebrow>Resultados</Eyebrow>
      <BlurText lines={['Antes y', '*después*']} className="mt-3 font-display text-title font-medium" delay={100} />
      <p className="mt-5 mb-10 max-w-[32rem] text-copy text-ink/70">
        Pasa el mouse o desliza el dedo sobre cada foto para ver el cambio.
      </p>
      <Results />
    </>
  );
}


/** Citas cada 30 minutos de 8:00 a. m. a 3:30 p. m. (el consultorio atiende de 8 a 4). */
const SLOTS = Array.from({length: 16}, (_, i) => {
  const m = 8 * 60 + i * 30, h = Math.floor(m / 60), mm = m % 60;
  const h12 = h > 12 ? h - 12 : h;
  return `${h12}:${mm ? '30' : '00'} ${h < 12 ? 'a. m.' : 'p. m.'}`;
});

function Agenda() {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [what, setWhat] = useState('Una valoración general');
  const [when, setWhen] = useState('Lo antes posible');
  const [part, setPart] = useState(SLOTS[0]);
  const [consent, setConsent] = useState(false);
  const [promo, setPromo] = useState(false);
  const [tried, setTried] = useState(false);
  const [code] = useState(newConsentId);
  const digits = phone.replace(/\D/g, '');
  const phoneOk = digits.length >= 10 && digits.length <= 12;
  const nameOk = name.trim().length >= 3;
  const ready = nameOk && phoneOk && consent;
  const msg =
    `Hola EXORA, soy ${name.trim()} (cel. ${phone.trim()}). Me interesa: ${what}. Para: ${when.toLowerCase()}, hacia las ${part}.\n\n` +
    consentLine(promo, code);
  const link = wa(msg);
  const problems = [!nameOk && 'escribe tu nombre completo', !phoneOk && 'escribe un celular válido', !consent && 'acepta la política de tratamiento de datos'].filter(Boolean) as string[];
  const field = 'min-h-12 w-full min-w-0 rounded-xl border border-line bg-paper px-3.5 text-[1rem] text-ink focus:border-coral focus:outline-none';
  const box = 'mt-0.5 size-5 shrink-0 accent-[#7f7a52]';
  return (
    <>
    <div className="grid items-start gap-10 md:grid-cols-2 md:gap-[5vw] [&>*]:min-w-0">
      <div>
        <Eyebrow>Agenda</Eyebrow>
        <BlurText lines={['Agenda tu', '*valoración*']} className="mt-3 font-display text-title font-medium" delay={100} />
        <p className="mt-5 max-w-[26rem] text-copy text-ink/70" data-reveal style={{'--d': '400ms'} as CSSProperties}>
          Déjanos tus datos y continúa en WhatsApp para confirmar el día y la hora.
        </p>
        <ul className="mt-8 grid gap-5" data-reveal style={{'--d': '550ms'} as CSSProperties}>
          {[
            ['Consultorio', ADDRESS],
            ['Horario', '8:00 a. m. – 4:00 p. m. · solo con cita previa'],
            ['WhatsApp', WA_SHOW],
            ['Instagram', '@exora.regeneracion'],
          ].map(([k, v]) => (
            <li key={k} className="flex gap-3">
              <span className="mt-2 size-1.5 shrink-0 rounded-full bg-sage" />
              <span>
                <b className="block text-small font-semibold">{k}</b>
                <span className="text-small text-mute">{v}</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
      <form className="glass grid min-w-0 gap-4 rounded-3xl p-6 md:p-8 [&_label]:min-w-0" onSubmit={(e) => e.preventDefault()} data-reveal style={{'--d': '300ms'} as CSSProperties}>
        <label className="grid gap-1.5 text-small font-medium">
          Tu nombre completo *
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ej. Laura Gómez" required aria-invalid={tried && !nameOk} />
        </label>
        <label className="grid gap-1.5 text-small font-medium">
          Tu celular *
          <input className={field} value={phone} onChange={(e) => setPhone(e.target.value)} autoComplete="tel" inputMode="tel" placeholder="Ej. 310 000 0000" required aria-invalid={tried && !phoneOk} />
        </label>
        <label className="grid gap-1.5 text-small font-medium">
          ¿Qué te interesa?
          <select className={field} value={what} onChange={(e) => setWhat(e.target.value)}>
            <option>Una valoración general</option>
            {treatments.map((g) => (
              <optgroup key={g.id} label={g.label}>
                {g.items.map((it) => (
                  <option key={g.id + it.n}>{it.n}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-1.5 text-small font-medium">
            ¿Cuándo?
            <select className={field} value={when} onChange={(e) => setWhen(e.target.value)}>
              <option>Lo antes posible</option>
              <option>Esta semana</option>
              <option>La próxima semana</option>
            </select>
          </label>
          <label className="grid gap-1.5 text-small font-medium">
            Hora preferida
            <select className={field} value={part} onChange={(e) => setPart(e.target.value)}>
              <optgroup label="Mañana">
                {SLOTS.filter((h) => h.endsWith('a. m.')).map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </optgroup>
              <optgroup label="Tarde">
                {SLOTS.filter((h) => h.endsWith('p. m.')).map((h) => (
                  <option key={h}>{h}</option>
                ))}
              </optgroup>
            </select>
          </label>
        </div>
        <label className={`flex gap-3 rounded-xl border p-3 text-[0.78rem] leading-snug text-ink/80 ${tried && !consent ? 'border-[#a87350]' : 'border-line'}`}>
          <input type="checkbox" className={box} checked={consent} onChange={(e) => setConsent(e.target.checked)} required />
          <span>
            <ConsentText />
          </span>
        </label>
        <label className="flex gap-3 px-3 text-[0.78rem] leading-snug text-ink/70">
          <input type="checkbox" className={box} checked={promo} onChange={(e) => setPromo(e.target.checked)} />
          <span>Opcional. Acepto recibir por WhatsApp información de tratamientos, recordatorios y promociones de EXORA.</span>
        </label>
        <a
          href={ready ? link : undefined}
          target="_blank"
          rel="noopener"
          role="button"
          aria-disabled={!ready}
          onClick={(e) => {
            if (!ready) {
              e.preventDefault();
              setTried(true);
              return;
            }
            saveConsent({id: code, nombre: name.trim(), celular: phone.trim(), origen: 'Agenda', promo, detalle: what});
          }}
          className={`mt-1 flex min-h-12 items-center justify-center rounded-full text-small font-medium transition-colors ${ready ? 'cursor-pointer bg-ink text-paper hover:bg-coral' : 'cursor-not-allowed bg-ink/25 text-paper'}`}
        >
          Continuar en WhatsApp
        </a>
        <p className="text-[0.72rem] text-mute" aria-live="polite">
          {tried && problems.length ? `Para agendar, ${problems.join(', ')}.` : 'Los campos con * y la autorización de datos son necesarios para agendar.'}
        </p>
      </form>
    </div>
    <Visit />
    </>
  );
}

/** Las vistas de las pestañas que no son Inicio. */
export function Page({view}: {view: Exclude<View, 'inicio'>}) {
  const root = useReveals<HTMLElement>();
  const Body = {tratamientos: Treatments, ecografias: Eco, combos: Combos, doctora: Doctor, cita: Agenda, preguntas: Faq, agenda: Agenda, resultados: ResultsPage, privacidad: Privacy, pagar: Pay, panel: Panel, cotizacion: QuoteView}[view];
  return (
    <section
      ref={root}
      className="min-h-[calc(100svh-8rem)] bg-linear-to-br from-blush via-[#f5f2ea] to-paper px-5 py-8 md:px-[6vw] md:py-12"
    >
      <div className="mx-auto max-w-[78rem]">
        <Body />
      </div>
    </section>
  );
}
