// PDF de la cotización (se genera en el teléfono, no se sube a ningún servidor).
import {jsPDF} from 'jspdf';
import {ADDRESS, WA_SHOW} from '../content';
import {cop, quoteUrl, subtotal, total, type Quote} from './quotes';

const OLIVE: [number, number, number] = [127, 122, 82];
const INK: [number, number, number] = [59, 56, 35];
const MUTE: [number, number, number] = [142, 138, 108];
const CREAM: [number, number, number] = [240, 238, 233];

let logo: Promise<string> | null = null;
const loadLogo = () =>
  (logo ??= fetch(`${import.meta.env.BASE_URL}media/wordmark-olive.png`)
    .then((r) => r.blob())
    .then((b) => new Promise<string>((res) => {
      const fr = new FileReader();
      fr.onload = () => res(fr.result as string);
      fr.readAsDataURL(b);
    })));

export async function quotePdf(q: Quote, opts: {demo?: boolean} = {}): Promise<Blob> {
  const doc = new jsPDF({unit: 'mm', format: 'a4'});
  const W = 210;
  const fmt = (s: string) => new Date(s).toLocaleDateString('es-CO', {day: 'numeric', month: 'long', year: 'numeric'});

  // cabecera
  doc.setFillColor(...CREAM);
  doc.rect(0, 0, W, 46, 'F');
  try {
    doc.addImage(await loadLogo(), 'PNG', 18, 16, 52, 10.3);
  } catch {}
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTE);
  doc.text('Dra. Verónica Montoya · Dra. Susana Zárate', 18, 33);
  doc.text('Medicina regenerativa y ecografías · Armenia, Quindío', 18, 38);
  doc.setTextColor(...INK);
  doc.setFontSize(9);
  doc.text('COTIZACIÓN', W - 18, 20, {align: 'right'});
  doc.setFontSize(18);
  doc.text(q.id, W - 18, 29, {align: 'right'});
  doc.setFontSize(8.5);
  doc.setTextColor(...MUTE);
  doc.text(`Fecha: ${fmt(q.creada)}`, W - 18, 35, {align: 'right'});
  doc.text(`Válida hasta: ${fmt(q.vence)}`, W - 18, 40, {align: 'right'});

  // paciente
  let y = 60;
  doc.setFontSize(9);
  doc.text('PARA', 18, y);
  doc.setTextColor(...INK);
  doc.setFontSize(16);
  doc.text(q.paciente, 18, y + 8);
  doc.setFontSize(9);
  doc.setTextColor(...MUTE);
  doc.text(`Celular: ${q.celular}${q.por ? `   ·   Atendida por: ${q.por}` : ''}`, 18, y + 14);

  // tabla
  y += 26;
  doc.setDrawColor(220, 214, 196);
  doc.setFillColor(...OLIVE);
  doc.rect(18, y, W - 36, 9, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(9);
  doc.text('TRATAMIENTO', 22, y + 6);
  doc.text('VALOR', W - 22, y + 6, {align: 'right'});
  y += 9;
  doc.setTextColor(...INK);
  doc.setFontSize(11);
  q.items.forEach((it) => {
    y += 10;
    doc.text(it.n, 22, y);
    doc.text(it.v ? cop(it.v) : 'Incluido', W - 22, y, {align: 'right'});
    doc.line(18, y + 4, W - 18, y + 4);
  });

  // totales
  y += 14;
  doc.setFontSize(10);
  if (q.desc) {
    doc.setTextColor(...MUTE);
    doc.text('Subtotal', W - 95, y);
    doc.text(cop(subtotal(q)), W - 22, y, {align: 'right'});
    y += 7;
    doc.setTextColor(168, 115, 80);
    doc.text(`Descuento combo (${q.desc}%)`, W - 95, y);
    doc.text('- ' + cop(subtotal(q) - total(q)), W - 22, y, {align: 'right'});
    y += 9;
  }
  doc.setFillColor(...CREAM);
  doc.roundedRect(W - 92, y - 6, 74, 16, 3, 3, 'F');
  doc.setTextColor(...INK);
  doc.setFontSize(10);
  doc.text('TOTAL', W - 86, y + 4);
  doc.setFontSize(17);
  doc.text(cop(total(q)), W - 22, y + 4.5, {align: 'right'});
  y += 18;
  if (q.cuotas > 1) {
    doc.setFontSize(9.5);
    doc.setTextColor(...OLIVE);
    doc.text(`Puedes pagar hasta en ${q.cuotas} cuotas de ${cop(total(q) / q.cuotas)} con tarjeta de crédito.`, W - 18, y, {align: 'right'});
    y += 6;
  }
  if (q.nota) {
    y += 6;
    doc.setFontSize(9.5);
    doc.setTextColor(...INK);
    doc.text(doc.splitTextToSize(`Nota: ${q.nota}`, W - 36), 18, y);
    y += 10;
  }

  // cómo pagar
  y += 8;
  doc.setDrawColor(...OLIVE);
  doc.roundedRect(18, y, W - 36, 40, 3, 3, 'S');
  doc.setTextColor(...INK);
  doc.setFontSize(11);
  doc.text('Cómo pagar de forma segura', 24, y + 9);
  doc.setFontSize(9);
  doc.setTextColor(...MUTE);
  doc.text(
    doc.splitTextToSize(
      'Abre el enlace de abajo. El pago se hace en Mercado Pago o en la página o app de tu banco (tarjeta de crédito o débito, PSE, Nequi, Daviplata, Bancolombia). EXORA nunca te pedirá claves ni datos de tu tarjeta por WhatsApp.',
      W - 48,
    ),
    24,
    y + 16,
  );
  doc.setTextColor(...OLIVE);
  doc.setFontSize(8.5);
  const url = quoteUrl(q);
  doc.textWithLink(url.length > 95 ? url.slice(0, 92) + '…' : url, 24, y + 33, {url});

  // pie
  y = 262;
  doc.setDrawColor(220, 214, 196);
  doc.line(18, y, W - 18, y);
  doc.setFontSize(8);
  doc.setTextColor(...MUTE);
  doc.text(doc.splitTextToSize('Productos con registro sanitario INVIMA vigente. Todo procedimiento requiere valoración médica previa y consentimiento informado; los resultados varían en cada paciente. Tus datos se tratan según la Ley 1581 de 2012 y nuestra Política de Tratamiento de Datos.', W - 36), 18, y + 6);
  doc.text(`${ADDRESS} · WhatsApp ${WA_SHOW} · @exora.regeneracion`, 18, y + 20);

  if (opts.demo) {
    doc.setTextColor(168, 115, 80);
    doc.setFontSize(54);
    doc.saveGraphicsState();
    doc.setGState(new (doc as unknown as {GState: new (o: object) => unknown}).GState({opacity: 0.12}));
    doc.text('SIMULACIÓN', W / 2, 170, {align: 'center', angle: 30});
    doc.restoreGraphicsState();
  }
  return doc.output('blob');
}

/** Comparte el PDF (en el celular abre WhatsApp con el archivo adjunto) o lo descarga. */
export async function sharePdf(q: Quote, text: string, demo = true) {
  const blob = await quotePdf(q, {demo});
  const file = new File([blob], `Cotizacion-EXORA-${q.id}.pdf`, {type: 'application/pdf'});
  const nav = navigator as Navigator & {canShare?: (d: object) => boolean};
  if (nav.canShare?.({files: [file]})) {
    try {
      await nav.share({files: [file], text});
      return 'shared';
    } catch {
      return 'cancel';
    }
  }
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = file.name;
  a.click();
  return 'downloaded';
}
