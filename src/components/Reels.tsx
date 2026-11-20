import {useEffect, useRef, useState} from 'react';
import {media} from '../content';
import {WaLink} from './Consent';

export type Reel = {id: string; video: string; poster: string; tag: string; title: string; text: string; ask: string; pos?: string; link?: string; voz?: string; fig?: string};

/** Videos cortos al estilo "reels". Para sumar uno nuevo, se agrega aquí. */
export const REELS: Reel[] = [
  {
    id: 'botox-celulas',
    video: 'proc-botox-celulas.mp4',
    poster: 'proc-botox-celulas.webp',
    tag: 'Bótox',
    title: 'Gotitas que calman el músculo',
    text: 'Con una aguja muy finita, unas gotitas llegan al músculo que está debajo de la arruga. El músculo descansa y la piel queda lisita. Dura unos 15 minutos.',
    ask: 'Hola EXORA, vi el video del bótox y quiero una valoración.',
    pos: '50% 50%',
    voz: 'voz-botox.mp3',
  },
  {
    id: 'vero',
    video: 'vero-idle.mp4',
    poster: 'vero-end.webp',
    tag: 'Las doctoras',
    title: 'Conoce a la Dra. Verónica',
    text: 'Médica general con enfoque en medicina regenerativa. Escucha primero, te explica cada opción con calma y diseña un plan a tu medida.',
    ask: 'Hola EXORA, quiero una cita con la Dra. Verónica.',
    link: '#doctora',
    pos: '50% 30%',
  },
  {
    id: 'botox-real',
    video: 'proc-botox.mp4',
    poster: 'proc-botox.webp',
    tag: 'Bótox',
    title: 'Así se ve por dentro',
    text: 'La gotita llega al músculo, la aguja sale y la arruga de arriba se alisa. Sin cortes ni vendas: vuelves a tu día.',
    ask: 'Hola EXORA, quiero información sobre bótox.',
    pos: '55% 50%',
    voz: 'voz-botox.mp3',
    fig: 'facial-botox',
  },
  {
    id: 'hialuronico',
    video: 'proc-hialuronico.mp4',
    poster: 'proc-hialuronico.webp',
    tag: 'Ácido hialurónico',
    title: 'Volumen que se ve natural',
    text: 'Un poquito de gel justo donde la piel perdió volumen. El ácido hialurónico atrae agua y rellena con suavidad: te ves descansada, no diferente.',
    ask: 'Hola EXORA, quiero información sobre ácido hialurónico.',
    pos: '40% 50%',
    voz: 'voz-hialuronico.mp3',
    fig: 'facial-hialuronico',
  },
  {
    id: 'skinbooster',
    video: 'proc-skinbooster.mp4',
    poster: 'proc-skinbooster.webp',
    tag: 'Skinbooster',
    title: 'Gotitas de hidratación',
    text: 'Muchas microgotas de hidratación, una junto a otra, justo debajo de la piel. Tu piel se llena de agua por dentro y se ve luminosa y elástica.',
    ask: 'Hola EXORA, quiero información sobre skinbooster.',
    pos: '45% 50%',
    voz: 'voz-skinbooster.mp3',
    fig: 'facial-skinbooster',
  },
  {
    id: 'dermapen',
    video: 'proc-dermapen.mp4',
    poster: 'proc-dermapen.webp',
    tag: 'Dermapen',
    title: 'Tu piel fabrica colágeno nuevo',
    text: 'Miles de canalitos microscópicos que tu piel repara creando colágeno nuevo. Poco a poco queda más lisa, firme y pareja.',
    ask: 'Hola EXORA, quiero información sobre dermapen.',
    pos: '50% 50%',
    voz: 'voz-dermapen.mp3',
    fig: 'facial-dermapen',
  },
  {
    id: 'valoracion',
    video: 'hero-idle.mp4',
    poster: 'hero-end.webp',
    tag: 'Tu primera cita',
    title: 'Empezamos por mirarte con calma',
    text: 'En la valoración revisamos tu piel, tus antecedentes y lo que quieres lograr. Solo después te proponemos un plan.',
    ask: 'Hola EXORA, quiero agendar una valoración.',
    link: '#cita',
    pos: '50% 25%',
  },
];

function Card({r, onOpen}: {r: Reel; onOpen: () => void}) {
  const v = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const el = v.current;
    if (!el) return;
    const io = new IntersectionObserver(([e]) => (e.isIntersecting ? el.play().catch(() => {}) : el.pause()), {threshold: 0.4});
    io.observe(el);
    return () => io.disconnect();
  }, []);
  return (
    <button type="button" onClick={onOpen} className="group relative aspect-[9/16] w-[62vw] max-w-[15rem] shrink-0 cursor-pointer snap-start overflow-hidden rounded-[1.6rem] bg-line text-left md:w-[15rem]">
      <video ref={v} src={media(r.video)} poster={media(r.poster)} muted loop playsInline preload="metadata" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" style={{objectPosition: r.pos}} />
      <span className="absolute inset-0 bg-gradient-to-t from-[#3b3823]/85 via-[#3b3823]/10 to-transparent" />
      <span className="absolute top-3 left-3 rounded-full bg-paper/90 px-2.5 py-1 text-[0.68rem] font-medium tracking-wide text-ink uppercase">{r.tag}</span>
      <span className="absolute top-3 right-3 grid size-8 place-items-center rounded-full bg-paper/25 text-paper backdrop-blur-sm" aria-hidden>
        ▶
      </span>
      <span className="absolute inset-x-3 bottom-3 font-display text-[1.25rem] leading-tight text-paper">{r.title}</span>
    </button>
  );
}

export function Viewer({r, onClose}: {r: Reel; onClose: () => void}) {
  const ref = useRef<HTMLDialogElement>(null);
  const voice = useRef<HTMLAudioElement>(null);
  const [sound, setSound] = useState(true);
  const closeRef = useRef(onClose);
  closeRef.current = onClose;
  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (!d.open) d.showModal();
    voice.current?.play().catch(() => setSound(false));
    const close = () => closeRef.current();
    d.addEventListener('close', close);
    return () => {
      voice.current?.pause();
      d.removeEventListener('close', close);
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className="m-auto max-h-[94svh] w-[min(24rem,94vw)] overflow-hidden rounded-[1.8rem] border-0 bg-[#3b3823] p-0 text-paper shadow-2xl backdrop:bg-[#3b3823]/60 backdrop:backdrop-blur-sm"
      onClick={(e) => e.target === ref.current && ref.current?.close()}
    >
      <div className="relative aspect-[9/16] max-h-[70svh] w-full">
        <video src={media(r.video)} poster={media(r.poster)} autoPlay muted loop playsInline className="absolute inset-0 size-full object-cover" style={{objectPosition: r.pos}} />
        <button type="button" onClick={() => ref.current?.close()} className="absolute top-3 right-3 grid size-9 cursor-pointer place-items-center rounded-full bg-[#3b3823]/50 text-paper" aria-label="Cerrar">
          ✕
        </button>
        <span className="absolute top-3 left-3 rounded-full bg-paper/90 px-2.5 py-1 text-[0.68rem] font-medium tracking-wide text-ink uppercase">{r.tag}</span>
        {r.voz && (
          <>
            <audio ref={voice} src={media(r.voz)} preload="auto" />
            <button
              type="button"
              onClick={() => {
                const a = voice.current;
                if (!a) return;
                if (sound) {
                  a.pause();
                  setSound(false);
                } else {
                  a.currentTime = 0;
                  a.play();
                  setSound(true);
                }
              }}
              className="absolute bottom-3 left-3 flex min-h-10 cursor-pointer items-center gap-2 rounded-full bg-[#3b3823]/60 px-4 text-small text-paper backdrop-blur-sm"
            >
              {sound ? '🔊 Escuchando' : '🔈 Escuchar explicación'}
            </button>
          </>
        )}
      </div>
      <div className="p-5">
        <p className="font-display text-[1.6rem] leading-tight">{r.title}</p>
        <p className="mt-2 text-small leading-relaxed text-paper/80">{r.text}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <WaLink text={r.ask} className="flex min-h-11 flex-1 items-center justify-center rounded-full bg-[#25d366] px-4 text-small font-medium text-white">
            Preguntar por WhatsApp
          </WaLink>
          {r.link && (
            <a href={r.link} onClick={() => ref.current?.close()} className="flex min-h-11 items-center justify-center rounded-full border border-paper/30 px-4 text-small">
              Ver más
            </a>
          )}
        </div>
      </div>
    </dialog>
  );
}

/** Reels publicados en el Instagram de EXORA: se abren en Instagram. */
const IG_REELS = [
  {url: 'https://www.instagram.com/reel/DKKfwtPt7Qr/', img: 'exora-regenerativa.webp', title: 'Míralo en nuestro Instagram'},
  {url: 'https://www.instagram.com/reel/DJWzISQJXtO/', img: 'exora-exosomas.webp', title: 'Otro reel de EXORA'},
];

function IgCard({r}: {r: (typeof IG_REELS)[number]}) {
  return (
    <a href={r.url} target="_blank" rel="noopener" className="group relative aspect-[9/16] w-[62vw] max-w-[15rem] shrink-0 snap-start overflow-hidden rounded-[1.6rem] bg-line md:w-[15rem]">
      <img src={media(r.img)} alt="" loading="lazy" className="absolute inset-0 size-full object-cover transition-transform duration-700 group-hover:scale-105" />
      <span className="absolute inset-0 bg-gradient-to-t from-[#3b3823]/85 via-[#3b3823]/15 to-transparent" />
      <span className="absolute top-3 left-3 rounded-full bg-paper/90 px-2.5 py-1 text-[0.68rem] font-medium tracking-wide text-ink uppercase">Instagram</span>
      <span className="absolute inset-0 m-auto grid size-14 place-items-center rounded-full bg-paper/30 text-xl text-paper backdrop-blur-sm" aria-hidden>
        ▶
      </span>
      <span className="absolute inset-x-3 bottom-3 text-paper">
        <span className="block font-display text-[1.25rem] leading-tight">{r.title}</span>
        <span className="mt-1 block text-[0.75rem] text-paper/80">Ver el reel en Instagram →</span>
      </span>
    </a>
  );
}

/** Franja de videos tipo reels al final de Inicio. */
export function Reels() {
  const [open, setOpen] = useState<Reel | null>(null);
  return (
    <section className="py-14 md:py-20" aria-labelledby="reels-title">
      <div className="flex items-end justify-between gap-4 px-5 md:px-[7vw]">
        <div>
          <p className="text-micro font-medium tracking-[0.14em] text-coral uppercase">EXORA en video</p>
          <h2 id="reels-title" className="mt-2 font-display text-[2rem] leading-none md:text-[2.8rem]">
            Mira cómo <span className="accent">lo hacemos</span>
          </h2>
        </div>
        <a href="https://www.instagram.com/exora.regeneracion/" target="_blank" rel="noopener" className="hidden shrink-0 text-small font-medium text-coral hover:underline sm:block">
          @exora.regeneracion →
        </a>
      </div>
      <div className="tabs-scroll mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-px-5 px-5 pb-2 md:scroll-px-[7vw] md:px-[7vw]">
        {IG_REELS.map((r) => (
          <IgCard key={r.url} r={r} />
        ))}
        {REELS.map((r) => (
          <Card key={r.id} r={r} onOpen={() => setOpen(r)} />
        ))}
        <a
          href="https://www.instagram.com/exora.regeneracion/"
          target="_blank"
          rel="noopener"
          className="relative grid aspect-[9/16] w-[62vw] max-w-[15rem] shrink-0 snap-start place-items-center overflow-hidden rounded-[1.6rem] bg-coral p-6 text-center text-paper md:w-[15rem]"
        >
          <span>
            <img src={media('iso-white.png')} alt="" className="mx-auto h-14 w-auto" />
            <span className="mt-4 block font-display text-[1.5rem] leading-tight">Más videos en Instagram</span>
            <span className="mt-2 block text-small text-paper/80">@exora.regeneracion</span>
          </span>
        </a>
      </div>
      {open && <Viewer r={open} onClose={() => setOpen(null)} />}
    </section>
  );
}
