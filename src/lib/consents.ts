import {CONSENT_SHEET_URL, POLICY_VERSION} from '../content';

/** Una autorización de tratamiento de datos (Ley 1581). */
export type Consent = {
  id: string; // código que también viaja en el mensaje de WhatsApp
  fecha: string; // ISO
  nombre: string;
  celular: string;
  origen: 'Agenda' | 'WhatsApp' | 'Cotización';
  version: string;
  promo: boolean;
  detalle?: string; // tratamiento o cotización relacionada
};

const KEY = 'exora-autorizaciones-demo-v1';

/** Código corto y legible, sin letras que se confundan (0/O, 1/I). */
export const newConsentId = () => {
  const abc = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const r = crypto.getRandomValues(new Uint8Array(5));
  return 'A-' + Array.from(r, (n) => abc[n % abc.length]).join('');
};

const SEED: Consent[] = [
  {id: 'A-7KQ2M', fecha: '2026-11-18T14:05:00-05:00', nombre: 'Paciente Ejemplo Uno', celular: '300 000 0001', origen: 'Agenda', version: POLICY_VERSION, promo: true, detalle: 'Bótox'},
  {id: 'A-P4X9T', fecha: '2026-11-19T09:42:00-05:00', nombre: 'Paciente Ejemplo Dos', celular: '300 000 0002', origen: 'WhatsApp', version: POLICY_VERSION, promo: false},
  {id: 'A-H8W3C', fecha: '2026-11-19T16:20:00-05:00', nombre: 'Paciente Ejemplo Tres', celular: '300 000 0003', origen: 'Cotización', version: POLICY_VERSION, promo: false, detalle: 'EX-1003'},
];

export function loadConsents(): Consent[] {
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? JSON.parse(raw) : SEED;
  } catch {
    return SEED;
  }
}

/** Guarda la autorización: en la simulación (este navegador) y, si está configurado, en Google Sheets. */
export function saveConsent(c: Omit<Consent, 'fecha' | 'version'>) {
  const rec: Consent = {...c, fecha: new Date().toISOString(), version: POLICY_VERSION};
  try {
    localStorage.setItem(KEY, JSON.stringify([rec, ...loadConsents().filter((x) => x.id !== rec.id)]));
  } catch {
    /* sin almacenamiento: igual se envía a Sheets */
  }
  if (CONSENT_SHEET_URL) {
    // text/plain evita el preflight CORS; Apps Script lee el JSON del cuerpo.
    fetch(CONSENT_SHEET_URL, {method: 'POST', mode: 'no-cors', headers: {'Content-Type': 'text/plain'}, body: JSON.stringify(rec), keepalive: true}).catch(() => {});
  }
  return rec;
}

export const consentCsv = (rows: Consent[]) =>
  [['Código', 'Fecha', 'Nombre', 'Celular', 'Origen', 'Versión política', 'Acepta promociones', 'Detalle'], ...rows.map((c) => [c.id, new Date(c.fecha).toLocaleString('es-CO'), c.nombre, c.celular, c.origen, c.version, c.promo ? 'Sí' : 'No', c.detalle ?? ''])]
    .map((r) => r.map((v) => `"${String(v).replace(/"/g, '""')}"`).join(','))
    .join('\n');
