import {useEffect, useRef, useState, type CSSProperties} from 'react';
import {doctor, faq, media, treatments, visit, wa, WA_SHOW, type View} from '../content';
import {useReveals} from '../hooks/useReveals';
import {BlurText} from './BlurText';

const Eyebrow = ({children}: {children: string}) => (
  <p className="flex items-center gap-2 text-micro font-medium text-mute uppercase" data-reveal>
    <span className="size-1.5 rounded-full bg-coral" />
    {children}
  </p>
);

function Treatments() {
  const [tab, setTab] = useState(treatments[0].id);
  const group = treatments.find((t) => t.id === tab)!;
  return (
    <>
      <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
        <div>
          <Eyebrow>Tratamientos</Eyebrow>
          <BlurText lines={['Pensados', 'para *ti*']} className="mt-3 font-display text-title font-medium" delay={100} />
        </div>
        <div role="tablist" className="glass tabs-scroll flex gap-1 overflow-x-auto rounded-full p-1" data-reveal style={{'--d': '300ms'} as CSSProperties}>
          {treatments.map((t) => (
            <button
              key={t.id}
              role="tab"
              aria-selected={tab === t.id}
              onClick={() => setTab(t.id)}
              className={`min-h-11 shrink-0 cursor-pointer rounded-full px-5 text-small font-medium transition-colors ${tab === t.id ? 'bg-ink text-paper' : 'text-ink/70 hover:text-ink'}`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <p className="mt-6 max-w-[40rem] text-copy text-ink/70">{group.intro}</p>
      <div key={tab} className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {group.items.map((it, i) => (
          <article
            key={it.n}
            className="card-in glass flex flex-col gap-3 rounded-3xl p-6"
            style={{'--d': `${i * 60}ms`} as CSSProperties}
          >
            <h3 className="font-display text-[1.35rem] font-medium tracking-[-0.03em]">{it.n}</h3>
            <p className="text-small text-mute">{it.d}</p>
            <dl className="mt-1 grid grid-cols-2 gap-x-4 gap-y-3 border-t border-line pt-4 text-small">
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
            <a
              href={wa(`Hola Dra. Verónica, quiero información sobre ${it.n.toLowerCase()}.`)}
              className="mt-auto pt-2 text-small font-semibold text-coral hover:underline"
            >
              Preguntar por este tratamiento →
            </a>
          </article>
        ))}
      </div>
      <p className="mt-8 text-[0.75rem] text-mute">
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
    v.play().catch(show);
    return () => v.removeEventListener('ended', toIdle);
  }, []);
  const cls = 'absolute inset-0 size-full object-cover object-[50%_20%] transition-opacity duration-200';
  return (
    <>
      <img src={media('doctora.webp')} alt="" className={cls} aria-hidden />
      <video ref={idle} src={media('vero-idle.mp4')} poster={media('vero-end.webp')} className={`${cls} opacity-0`} muted loop playsInline preload="auto" aria-hidden />
      <video
        ref={intro}
        src={media('vero-intro.mp4')}
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
    <div className="grid items-center gap-10 md:grid-cols-[0.85fr_1.15fr] md:gap-[5vw]">
      <div className="relative mx-auto aspect-[2/3] w-full max-w-[22rem]" data-reveal>
        <div className="arch absolute inset-0 translate-x-4 -translate-y-4 border border-coral/35" />
        <div className="arch relative size-full bg-blush">
          <DoctorFilm />
        </div>
      </div>
      <div>
        <Eyebrow>La doctora</Eyebrow>
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
      </div>
    </div>
  );
}

function Visit() {
  return (
    <>
      <Eyebrow>Tu primera cita</Eyebrow>
      <BlurText lines={['Así es tu', '*primera* *cita*']} className="mt-3 font-display text-title font-medium" delay={100} />
      <ol className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {visit.map(([t, d], i) => (
          <li key={t} className="glass relative rounded-3xl p-6" data-reveal style={{'--d': `${300 + i * 120}ms`} as CSSProperties}>
            <span className="node mb-5 block size-[11px] rounded-full bg-coral shadow-[0_0_0_5px_rgb(231_134_108/0.16)]" />
            <h3 className="font-display text-[1.3rem] font-medium tracking-[-0.03em]">{t}</h3>
            <p className="mt-2 text-small text-mute">{d}</p>
          </li>
        ))}
      </ol>
      <div className="mt-10 flex flex-wrap gap-3" data-reveal style={{'--d': '800ms'} as CSSProperties}>
        <a href="#agenda" className="rounded-full bg-ink px-6 py-3 text-small font-medium text-paper transition-colors hover:bg-coral">
          Agenda tu valoración
        </a>
        <a href="#preguntas" className="rounded-full px-6 py-3 text-small font-medium shadow-[inset_0_0_0_1px_var(--color-line)] hover:text-coral">
          Preguntas frecuentes
        </a>
      </div>
    </>
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
        {faq.map(([q, a]) => (
          <details key={q} className="group border-b border-line">
            <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between gap-4 py-5 text-[1.02rem] font-medium [&::-webkit-details-marker]:hidden">
              {q}
              <span className="accent text-[1.6rem] leading-none text-coral transition-transform group-open:rotate-45">+</span>
            </summary>
            <p className="max-w-[38rem] pb-5 text-copy text-mute">{a}</p>
          </details>
        ))}
      </div>
    </div>
  );
}

function Agenda() {
  const [name, setName] = useState('');
  const [what, setWhat] = useState('Una valoración general');
  const [when, setWhen] = useState('Lo antes posible');
  const [part, setPart] = useState('Mañana');
  const [warn, setWarn] = useState(false);
  const link = wa(`Hola Dra. Verónica, soy ${name.trim()}. Me interesa: ${what}. Para: ${when.toLowerCase()}, en la ${part.toLowerCase()}.`);
  const field = 'min-h-12 rounded-xl border border-line bg-paper px-3.5 text-[1rem] text-ink focus:border-coral focus:outline-none';
  return (
    <div className="grid items-start gap-10 md:grid-cols-2 md:gap-[5vw]">
      <div>
        <Eyebrow>Agenda</Eyebrow>
        <BlurText lines={['Agenda tu', '*valoración*']} className="mt-3 font-display text-title font-medium" delay={100} />
        <p className="mt-5 max-w-[26rem] text-copy text-ink/70" data-reveal style={{'--d': '400ms'} as CSSProperties}>
          Déjanos tus datos y continúa en WhatsApp para confirmar el día y la hora.
        </p>
        <ul className="mt-8 grid gap-5" data-reveal style={{'--d': '550ms'} as CSSProperties}>
          {[
            ['Consultorio', 'Mall Privilegio, Armenia, Quindío'],
            ['Horario', '8:00 a. m. – 4:00 p. m. · solo con cita previa'],
            ['WhatsApp', WA_SHOW],
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
      <form className="glass grid gap-4 rounded-3xl p-6 md:p-8" onSubmit={(e) => e.preventDefault()} data-reveal style={{'--d': '300ms'} as CSSProperties}>
        <label className="grid gap-1.5 text-small font-medium">
          Tu nombre
          <input className={field} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Ej. Laura Gómez" />
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
            Horario
            <select className={field} value={part} onChange={(e) => setPart(e.target.value)}>
              <option>Mañana</option>
              <option>Tarde</option>
            </select>
          </label>
        </div>
        <a
          href={link}
          onClick={(e) => {
            if (!name.trim()) {
              e.preventDefault();
              setWarn(true);
            }
          }}
          className="mt-2 flex min-h-12 items-center justify-center rounded-full bg-ink text-small font-medium text-paper transition-colors hover:bg-coral"
        >
          Continuar en WhatsApp
        </a>
        <p className="text-[0.72rem] text-mute" aria-live="polite">
          {warn && !name.trim()
            ? 'Escribe tu nombre para continuar.'
            : 'Al continuar aceptas el tratamiento de tus datos para agendar tu cita (Ley 1581 de 2012).'}
        </p>
      </form>
    </div>
  );
}

/** Las vistas de las pestañas que no son Inicio. */
export function Page({view}: {view: Exclude<View, 'inicio'>}) {
  const root = useReveals<HTMLElement>();
  const Body = {tratamientos: Treatments, doctora: Doctor, cita: Visit, preguntas: Faq, agenda: Agenda}[view];
  return (
    <section
      ref={root}
      className="min-h-[calc(100svh-8rem)] bg-linear-to-br from-blush via-[#fdf1eb] to-paper px-5 py-12 md:px-[6vw] md:py-20"
    >
      <div className="mx-auto max-w-[78rem]">
        <Body />
      </div>
    </section>
  );
}
