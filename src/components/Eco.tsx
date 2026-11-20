import {useState} from 'react';
import {media} from '../content';
import {WaLink} from './Consent';
import {BlurText} from './BlurText';
import {REELS, Viewer, type Reel} from './Reels';

const ASK = 'Hola EXORA, quiero agendar una ecografía con la Dra. Susana.';

const SELLOS = ['Sin dolor', 'Sin radiación', 'Te explicamos lo que vemos', 'Con cita previa'];

const ESTUDIOS: [string, string][] = [
  ['Abdomen', 'Hígado, vesícula, páncreas, riñones y bazo.'],
  ['Tiroides y cuello', 'Nódulos, ganglios y glándulas.'],
  ['Mama', 'Control y seguimiento de nódulos.'],
  ['Pelvis', 'Útero, ovarios, vejiga y próstata.'],
  ['Músculos y articulaciones', 'Hombro, rodilla, tendones y desgarros.'],
  ['Tejidos blandos', 'Bultos, quistes y masas bajo la piel.'],
  ['Piel', 'Lesiones y cambios en las capas de la piel.'],
  ['Rostro', 'Mapeo facial, rellenos y biopolímeros.'],
];

const DOLORES = [
  '¿Te hiciste un relleno y sientes bultos, dureza o dolor?',
  '¿Te aplicaron algo hace años y no sabes qué es?',
  '¿Vas a hacerte un procedimiento y quieres hacerlo con más seguridad?',
];

const PASOS: [string, string][] = [
  ['Agenda por WhatsApp', 'Te decimos si tu estudio necesita alguna preparación.'],
  ['Llega al consultorio', 'Un espacio tranquilo, sin filas y con cita a tu hora.'],
  ['Hacemos la ecografía', 'Gel, una sonda suave y listo. No duele.'],
  ['Te explicamos todo', 'Sales entendiendo lo que vimos y cuál es el siguiente paso.'],
];

export function Eco() {
  const [vid, setVid] = useState<Reel | null>(null);
  const reel = REELS.find((r) => r.id === 'eco-combo');
  const btn = 'flex min-h-12 items-center justify-center rounded-full px-6 text-small font-medium';
  return (
    <>
      {/* 1. Gancho */}
      <div className="grid items-center gap-8 md:grid-cols-[1.05fr_1fr] md:gap-[5vw] [&>*]:min-w-0">
        <div>
          <p className="text-micro font-medium tracking-[0.14em] text-coral uppercase">Ecografías · Dra. Susana Zárate</p>
          <BlurText lines={['Mira lo que pasa', '*dentro* de ti']} className="mt-3 font-display text-title font-medium" delay={100} />
          <p className="mt-5 max-w-[32rem] text-copy text-ink/75">
            Ecografías de todo el cuerpo y una especialidad que casi no se encuentra en el Eje Cafetero: <b className="font-semibold text-ink">la ecografía de piel y rostro</b>. Respuestas claras, en un consultorio tranquilo de Armenia.
          </p>
          <ul className="mt-5 flex flex-wrap gap-2">
            {SELLOS.map((s) => (
              <li key={s} className="glass rounded-full px-3.5 py-1.5 text-[0.82rem]">
                ✓ {s}
              </li>
            ))}
          </ul>
          <div className="mt-6 flex flex-wrap gap-3">
            <WaLink text={ASK} className={`${btn} bg-[#25d366] text-white`}>
              Agendar mi ecografía
            </WaLink>
            <a href="#eco-estudios" className={`${btn} border border-line hover:border-coral`}>
              Ver estudios
            </a>
          </div>
        </div>
        {reel && (
          <button type="button" onClick={() => setVid(reel)} className="relative cursor-pointer overflow-hidden rounded-[1.6rem] text-left shadow-lg">
            <video src={media(reel.video)} poster={media(reel.poster)} autoPlay muted loop playsInline className="aspect-[4/3] w-full object-cover" />
            <span className="absolute bottom-3 left-3 rounded-full bg-[#3b3823]/65 px-4 py-2 text-small text-paper backdrop-blur-sm">▶ Ver con voz</span>
          </button>
        )}
      </div>

      {/* 2. Estudios */}
      <section id="eco-estudios" className="mt-16 scroll-mt-36">
        <h2 className="font-display text-[1.9rem] leading-tight font-medium md:text-[2.6rem]">
          Una ecografía para <span className="accent">cada</span> parte del cuerpo
        </h2>
        <p className="mt-2 max-w-[38rem] text-copy text-ink/70">Si tu médico te la ordenó o quieres salir de dudas, aquí la hacemos.</p>
        <ul className="mt-6 grid grid-cols-2 gap-2.5 md:grid-cols-4 md:gap-3">
          {ESTUDIOS.map(([t, d]) => (
            <li key={t} className={`rounded-2xl p-4 ${t === 'Rostro' || t === 'Piel' ? 'bg-coral text-paper' : 'glass'}`}>
              <b className="block font-display text-[1.2rem] leading-tight font-medium">{t}</b>
              <span className={`mt-1 block text-[0.8rem] ${t === 'Rostro' || t === 'Piel' ? 'text-paper/85' : 'text-ink/65'}`}>{d}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-[0.75rem] text-mute">¿No ves tu estudio? Escríbenos: hacemos ecografías en todas las partes del cuerpo.</p>
      </section>

      {/* 3. Especialidad */}
      <section className="mt-16 overflow-hidden rounded-[1.8rem] bg-[#3b3823] p-6 text-paper md:p-10">
        <p className="text-micro font-medium tracking-[0.14em] text-[#dfd1a7] uppercase">La especialidad de la Dra. Susana</p>
        <h2 className="mt-2 max-w-[36rem] font-display text-[1.9rem] leading-tight font-medium md:text-[2.6rem]">Ecografía de piel y rostro</h2>
        <ul className="mt-5 grid gap-2.5">
          {DOLORES.map((d) => (
            <li key={d} className="text-[1.05rem] text-paper/90 md:text-[1.2rem]">
              {d}
            </li>
          ))}
        </ul>
        <p className="mt-5 max-w-[40rem] text-copy text-paper/75">
          La ecografía muestra las capas de tu piel, tus músculos y tus vasos, y encuentra dónde está un relleno, un ácido hialurónico o un biopolímero. Sin adivinar y sin cortar.
        </p>
        <WaLink text="Hola EXORA, quiero una ecografía de rostro o de rellenos." className={`${btn} mt-6 inline-flex bg-paper text-ink`}>
          Quiero revisar mi caso
        </WaLink>
      </section>

      {/* 4. Diferencial */}
      <section className="mt-16 grid items-center gap-6 md:grid-cols-2 md:gap-[5vw]">
        <div>
          <h2 className="font-display text-[1.9rem] leading-tight font-medium md:text-[2.4rem]">
            El diagnóstico y la solución, en el <span className="accent">mismo</span> lugar
          </h2>
          <p className="mt-3 text-copy text-ink/75">
            Si la ecografía encuentra algo, no tienes que buscar otro consultorio. La Dra. Susana ve el problema y la Dra. Verónica lo trata, guiada por esa misma imagen. Menos vueltas, más tranquilidad.
          </p>
        </div>
        <div className="grid grid-cols-[1fr_auto_1fr] items-center gap-2 text-center">
          <div className="glass rounded-2xl p-4">
            <b className="block font-display text-[1.15rem]">Dra. Susana</b>
            <span className="text-[0.8rem] text-ink/65">Ve qué pasa</span>
          </div>
          <span className="font-display text-[2rem] text-coral">+</span>
          <div className="glass rounded-2xl p-4">
            <b className="block font-display text-[1.15rem]">Dra. Verónica</b>
            <span className="text-[0.8rem] text-ink/65">Lo trata</span>
          </div>
        </div>
      </section>

      {/* 5. Cómo es */}
      <section className="mt-16">
        <h2 className="font-display text-[1.9rem] leading-tight font-medium md:text-[2.4rem]">Así de fácil</h2>
        <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {PASOS.map(([t, d], i) => (
            <li key={t} className="glass rounded-3xl p-5">
              <span className="font-display text-[1.8rem] leading-none text-coral">{i + 1}</span>
              <b className="mt-2 block text-[1.05rem] font-medium">{t}</b>
              <p className="mt-1 text-small text-ink/70">{d}</p>
            </li>
          ))}
        </ol>
      </section>

      {/* 6. Cierre */}
      <section className="mt-16 rounded-[1.8rem] bg-coral p-6 text-center text-paper md:p-10">
        <h2 className="font-display text-[1.9rem] leading-tight font-medium md:text-[2.4rem]">Sal de dudas esta semana</h2>
        <p className="mx-auto mt-2 max-w-[30rem] text-copy text-paper/80">Escríbenos, cuéntanos qué estudio necesitas y te damos una cita.</p>
        <WaLink text={ASK} className={`${btn} mx-auto mt-5 inline-flex bg-[#25d366] text-white`}>
          Agendar por WhatsApp
        </WaLink>
      </section>

      <p className="mt-6 text-[0.72rem] text-mute">La ecografía apoya el diagnóstico; cada caso se define con la valoración médica.</p>
      {vid && <Viewer r={vid} onClose={() => setVid(null)} />}
    </>
  );
}
