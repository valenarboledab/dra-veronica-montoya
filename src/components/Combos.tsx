import type {CSSProperties} from 'react';
import {media} from '../content';
import {BlurText} from './BlurText';
import {WaLink} from './Consent';
import {Pay} from './Pay';

/**
 * Tres combos con psicología de ventas:
 * - Ancla y efecto señuelo: tres opciones, la del medio destacada como "La más elegida".
 * - Encuadre de ahorro en %, sin precios (se cotiza en la valoración).
 * - Nombres de resultado (lo que la paciente quiere sentir), no de procedimiento.
 * - Prueba de autoridad (valoración médica incluida en el plan) y reducción de riesgo (pago en cuotas).
 * - Urgencia honesta: vigencia real de la promoción, sin cupos inventados.
 * Los combos y porcentajes deben ser aprobados por las doctoras.
 */
const VIGENCIA = '31 de diciembre de 2026';
const COMBOS = [
  {
    id: 'descansado',
    name: 'Rostro Descansado',
    promise: 'Para cuando te ves cansada aunque hayas dormido.',
    items: ['Bótox', 'Skinbooster'],
    save: 10,
    img: 'proc-botox-celulas.webp',
    plus: ['Expresión suave, sin congelar', 'Hidratación profunda', 'Control a los 15 días'],
  },
  {
    id: 'piel-nueva',
    name: 'Piel Nueva',
    promise: 'Textura, poros y marcas: tu piel, renovada desde adentro.',
    items: ['Dermapen', 'Exosomas', 'Peeling'],
    save: 15,
    img: 'exora-exosomas.webp',
    plus: ['Renovación en 3 frentes', 'Luminosidad visible', 'Plan de sesiones a tu medida'],
    star: true,
  },
  {
    id: 'colageno',
    name: 'Colágeno Total',
    promise: 'Firmeza que se construye con tu propio colágeno.',
    items: ['Bioestimuladores de colágeno', 'Skinbooster', 'Exosomas'],
    save: 20,
    img: 'exora-regenerativa.webp',
    plus: ['Resultado progresivo y natural', 'Efecto de larga duración', 'Seguimiento médico completo'],
  },
];

export function Combos() {
  return (
    <div>
      <div className="max-w-[40rem]">
        <p className="text-micro font-medium tracking-[0.14em] text-coral uppercase">Combos</p>
        <BlurText lines={['Más resultado,', '*menos inversión*']} className="mt-3 font-display text-title font-medium" delay={100} />
        <p className="mt-4 text-copy text-ink/70" data-reveal>
          Los tratamientos funcionan mejor juntos. Por eso armamos tres planes que se potencian entre sí, con un ahorro sobre el valor por separado. El valor exacto lo definimos en tu valoración.
        </p>
      </div>

      <div className="mt-8 grid items-stretch gap-4 md:grid-cols-3">
        {COMBOS.map((c, i) => (
          <article
            key={c.id}
            data-reveal
            style={{'--d': `${150 + i * 120}ms`} as CSSProperties}
            className={`relative flex flex-col overflow-hidden rounded-[1.8rem] ${c.star ? 'bg-coral text-paper shadow-[0_30px_70px_-30px_rgb(59_56_35/0.7)] md:-translate-y-3 md:scale-[1.03]' : 'glass'}`}
          >
            {c.star && <span className="absolute top-3 right-3 z-10 rounded-full bg-paper px-3 py-1 text-[0.7rem] font-semibold tracking-wide text-coral uppercase">★ La más elegida</span>}
            <img src={media(c.img)} alt="" loading="lazy" className="aspect-[16/10] w-full object-cover" />
            <div className="flex flex-1 flex-col p-5">
              <span className={`self-start rounded-full px-3 py-1 text-[0.75rem] font-semibold ${c.star ? 'bg-paper/20' : 'bg-coral/12 text-coral'}`}>Ahorras {c.save}%</span>
              <b className="mt-3 font-display text-[1.7rem] leading-tight font-medium">{c.name}</b>
              <p className={`mt-1 text-small ${c.star ? 'text-paper/85' : 'text-mute'}`}>{c.promise}</p>
              <p className="mt-4 text-[0.8rem] font-semibold tracking-wide uppercase opacity-70">Incluye</p>
              <ul className="mt-1 grid gap-1 text-[0.95rem]">
                {c.items.map((it) => (
                  <li key={it}>✓ {it}</li>
                ))}
              </ul>
              <ul className={`mt-3 grid gap-1 text-small ${c.star ? 'text-paper/80' : 'text-mute'}`}>
                {c.plus.map((p) => (
                  <li key={p}>· {p}</li>
                ))}
              </ul>
              <span className="flex-1" />
              <WaLink
                text={`Hola EXORA, me interesa el combo ${c.name} (${c.items.join(' + ')}). ¿Me ayudan con la valoración?`}
                className={`mt-5 flex min-h-12 items-center justify-center rounded-full text-small font-semibold ${c.star ? 'bg-paper text-coral' : 'bg-ink text-paper hover:bg-coral'}`}
              >
                Quiero este combo
              </WaLink>
              <span className={`mt-2 text-center text-[0.72rem] ${c.star ? 'text-paper/70' : 'text-mute'}`}>Puedes pagarlo a cuotas</span>
            </div>
          </article>
        ))}
      </div>

      <div className="mt-6 grid gap-2 rounded-2xl bg-[#ebe6d6] p-4 text-small md:grid-cols-3">
        <span>
          <b>¿Quieres armar el tuyo?</b> 2 tratamientos: −10% · 3 o más: −15%.
        </span>
        <span>Siempre con valoración médica previa: si un combo no es para ti, te lo decimos.</span>
        <span className="text-mute">Promoción válida hasta el {VIGENCIA}. No acumulable con otras promociones. Los resultados varían en cada paciente.</span>
      </div>

      <div className="mt-14 border-t border-line pt-10">
        <Pay />
      </div>
    </div>
  );
}
