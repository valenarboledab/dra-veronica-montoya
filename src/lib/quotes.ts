// Cotizaciones de EXORA (SIMULACIÓN). Todo se guarda en este navegador; los datos de ejemplo son inventados.
export type Quote = {
  id: string;
  paciente: string;
  celular: string;
  items: {n: string; v: number}[];
  cuotas: number;
  desc?: number; // % de descuento por combo
  nota: string;
  creada: string; // ISO
  vence: string; // ISO
  estado: 'enviada' | 'vista' | 'pagada' | 'vencida';
  por?: string; // doctora que la creó
  recordada?: string; // ISO del último recordatorio
  pago?: {fecha: string; medio: string; ref: string; valor: number};
};

const KEY = 'exora-cotizaciones-demo-v3';
export const cop = (n: number) => '$' + Math.round(n).toLocaleString('es-CO');
export const subtotal = (q: Pick<Quote, 'items'>) => q.items.reduce((a, b) => a + b.v, 0);
export const total = (q: Pick<Quote, 'items' | 'desc'>) => Math.round(subtotal(q) * (1 - (q.desc ?? 0) / 100));
/** Descuento por cantidad de tratamientos: 2 → 10%, 3 o más → 15%. */
export const comboDesc = (n: number) => (n >= 3 ? 15 : n === 2 ? 10 : 0);
const day = 86400000;
const iso = (offsetDays: number) => new Date(Date.now() + offsetDays * day).toISOString();

const seed = (): Quote[] => [
  {id: 'EX-1001', paciente: 'Paciente Ejemplo Uno', celular: '300 000 0001', items: [{n: 'Bótox (tercio superior)', v: 950000}], cuotas: 1, nota: 'Incluye control a los 15 días.', creada: iso(-12), vence: iso(3), estado: 'pagada', por: 'Dra. Verónica', pago: {fecha: iso(-10), medio: 'Tarjeta de crédito · 3 cuotas', ref: 'MP-SIM-48213', valor: 950000}},
  {id: 'EX-1002', paciente: 'Paciente Ejemplo Dos', celular: '300 000 0002', items: [{n: 'Bótox', v: 950000}, {n: 'Skinbooster', v: 700000}], cuotas: 3, desc: 10, nota: 'Sesiones cada 4 semanas.', creada: iso(-6), vence: iso(9), estado: 'pagada', por: 'Dra. Verónica', pago: {fecha: iso(-4), medio: 'PSE · Bancolombia', ref: 'MP-SIM-48377', valor: 1485000}},
  {id: 'EX-1003', paciente: 'Paciente Ejemplo Tres', celular: '300 000 0003', items: [{n: 'Ácido hialurónico (1 ml)', v: 1200000}], cuotas: 6, nota: '', creada: iso(-3), vence: iso(12), estado: 'vista', por: 'Dra. Verónica'},
  {id: 'EX-1004', paciente: 'Paciente Ejemplo Cuatro', celular: '300 000 0004', items: [{n: 'Ecografías y ultrasonidos', v: 180000}], cuotas: 1, nota: 'Traer orden médica si la tienes.', creada: iso(-1), vence: iso(14), estado: 'enviada', por: 'Dra. Susana'},
  {id: 'EX-1005', paciente: 'Paciente Ejemplo Cinco', celular: '300 000 0005', items: [{n: 'Dermapen', v: 380000}, {n: 'Exosomas', v: 450000}, {n: 'Peeling', v: 250000}], cuotas: 1, desc: 15, nota: '', creada: iso(-25), vence: iso(-10), estado: 'vencida', por: 'Dra. Verónica'},
];

export function loadQuotes(): Quote[] {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  const s = seed();
  saveQuotes(s);
  return s;
}
export function saveQuotes(q: Quote[]) {
  try {
    localStorage.setItem(KEY, JSON.stringify(q));
  } catch {}
}
export const resetQuotes = () => {
  const s = seed();
  saveQuotes(s);
  return s;
};

// El enlace que recibe la paciente lleva la cotización dentro (no hay servidor en la simulación).
export const encodeQuote = (q: Quote) => btoa(unescape(encodeURIComponent(JSON.stringify({id: q.id, p: q.paciente, i: q.items, c: q.cuotas, d: q.desc ?? 0, n: q.nota, v: q.vence}))));
export const decodeQuote = (s: string) => {
  try {
    const o = JSON.parse(decodeURIComponent(escape(atob(s))));
    return {id: o.id as string, paciente: o.p as string, items: o.i as Quote['items'], cuotas: o.c as number, desc: (o.d ?? 0) as number, nota: o.n as string, vence: o.v as string};
  } catch {
    return null;
  }
};
export const quoteUrl = (q: Quote) => `${location.origin}${location.pathname}#cotizacion?q=${encodeQuote(q)}`;
