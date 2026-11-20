import {useState} from 'react';
import {media} from '../content';
import {WaLink} from './Consent';
import {BlurText} from './BlurText';
import {REELS, Viewer, type Reel} from './Reels';

const PASOS: [string, string, string][] = [
  ['01', 'Valoración con la Dra. Verónica', 'Escucha tu caso: un relleno que quedó con bultos, dolor o cambios después de un procedimiento hecho en otro lugar.'],
  ['02', 'Ecografía con la Dra. Susana', 'En el mismo consultorio, la ecografía muestra qué hay bajo la piel: dónde está el material, si es ácido hialurónico o biopolímero y si hay una obstrucción.'],
  ['03', 'Tratamiento guiado por la imagen', 'Con esa imagen, la Dra. Verónica sabe exactamente dónde y cómo actuar, en lugar de trabajar a ciegas.'],
  ['04', 'Control con ecografía', 'Una nueva ecografía permite revisar cómo respondió el tejido y ajustar el plan.'],
];

const CASOS: [string, string][] = [
  ['Antes de un procedimiento', 'Mapeo facial: capas de la piel, músculos y vasos, para planear rellenos y bioestimuladores con más seguridad.'],
  ['Rellenos que salieron mal', 'Bultos, asimetrías, dolor o zonas duras después de un relleno: la ecografía ayuda a ubicar el material y ver qué pasa.'],
  ['Biopolímeros', 'Ubica biopolímeros u otras sustancias aplicadas hace años, para decidir el manejo con información real.'],
  ['Seguimiento', 'Revisar cómo responde la piel a un tratamiento sin tener que adivinar.'],
];

const CUERPO = ['Abdomen', 'Tiroides y cuello', 'Tejidos blandos', 'Piel y lesiones', 'Músculos y articulaciones', 'Y otras zonas del cuerpo'];

export function Eco() {
  const [vid, setVid] = useState<Reel | null>(null);
  const reel = REELS.find((r) => r.id === 'eco-combo');
  return (
    <>
      <div className="grid items-center gap-8 md:grid-cols-[1.05fr_1fr] md:gap-[5vw] [&>*]:min-w-0">
        <div>
          <p className="text-micro font-medium tracking-[0.14em] text-coral uppercase">Ecografías · Dra. Susana Zárate</p>
          <BlurText lines={['Ver por dentro', 'antes de *tratar*']} className="mt-3 font-display text-title font-medium" delay={100} />
          <p className="mt-5 max-w-[32rem] text-copy text-ink/75">
            En EXORA la medicina regenerativa y la ecografía trabajan juntas, en el mismo consultorio. Si llegas con un relleno que salió mal o con una duda sobre un procedimiento anterior, primero vemos qué hay bajo tu piel y después tratamos. Un servicio poco común en el Eje Cafetero.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <WaLink text="Hola EXORA, quiero información sobre la ecografía facial y de rellenos." className="flex min-h-12 items-center rounded-full bg-[#25d366] px-6 text-small font-medium text-white">
              Preguntar por WhatsApp
            </WaLink>
            <a href="#agenda" className="flex min-h-12 items-center rounded-full border border-line px-6 text-small font-medium hover:border-coral">
              Agendar
            </a>
          </div>
        </div>
        {reel && (
          <button type="button" onClick={() => setVid(reel)} className="group relative cursor-pointer overflow-hidden rounded-[1.6rem] text-left shadow-lg">
            <video src={media(reel.video)} poster={media(reel.poster)} autoPlay muted loop playsInline className="aspect-[4/3] w-full object-cover" />
            <span className="absolute bottom-3 left-3 rounded-full bg-[#3b3823]/65 px-4 py-2 text-small text-paper backdrop-blur-sm">▶ Ver con voz</span>
          </button>
        )}
      </div>

      <section className="mt-14">
        <h2 className="font-display text-[1.8rem] leading-tight font-medium md:text-[2.4rem]">
          ¿Por qué juntas es <span className="accent">mejor</span>?
        </h2>
        <p className="mt-2 max-w-[40rem] text-copy text-ink/70">En la mayoría de lugares el procedimiento y la ecografía están en sitios distintos. Aquí el camino es uno solo:</p>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map(([n, t, d]) => (
            <li key={n} className="glass rounded-3xl p-5">
              <span className="font-display text-[2rem] leading-none text-coral">{n}</span>
              <b className="mt-3 block font-display text-[1.25rem] leading-tight font-medium">{t}</b>
              <p className="mt-2 text-small text-ink/70">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-14 grid gap-8 md:grid-cols-[1.3fr_1fr] md:gap-[5vw]">
        <div>
          <h2 className="font-display text-[1.6rem] leading-tight font-medium md:text-[2rem]">Ecografía de rostro y piel</h2>
          <ul className="mt-5 grid gap-3">
            {CASOS.map(([t, d]) => (
              <li key={t} className="border-b border-line pb-3">
                <b className="text-[1.02rem] font-medium">{t}</b>
                <p className="mt-1 text-small text-ink/70">{d}</p>
              </li>
            ))}
          </ul>
        </div>
        <div className="rounded-3xl bg-coral p-6 text-paper">
          <h2 className="font-display text-[1.6rem] leading-tight font-medium">Ecografías de todo el cuerpo</h2>
          <p className="mt-2 text-small text-paper/80">La Dra. Susana también realiza ecografías en todas las partes del cuerpo, sin radiación y sin dolor.</p>
          <ul className="mt-4 flex flex-wrap gap-2">
            {CUERPO.map((c) => (
              <li key={c} className="rounded-full bg-paper/15 px-3 py-1.5 text-small">
                {c}
              </li>
            ))}
          </ul>
          <WaLink text="Hola EXORA, quiero agendar una ecografía." className="mt-5 flex min-h-11 items-center justify-center rounded-full bg-paper px-5 text-small font-medium text-coral">
            Agendar una ecografía
          </WaLink>
        </div>
      </section>

      <p className="mt-10 text-[0.75rem] text-mute">
        La ecografía apoya el diagnóstico y el plan; cada caso se define en la valoración médica.
      </p>
      {vid && <Viewer r={vid} onClose={() => setVid(null)} />}
    </>
  );
}
