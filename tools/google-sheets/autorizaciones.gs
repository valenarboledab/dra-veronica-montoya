/**
 * EXORA · Registro de autorizaciones de datos (Ley 1581 de 2012).
 * Recibe cada autorización que se da en el sitio y la agrega como una fila.
 * Solo AGREGA filas: no lee, no cambia ni borra nada, y no devuelve datos.
 */
const HOJA = 'Autorizaciones';
const COLUMNAS = ['Recibido', 'Código', 'Fecha (navegador)', 'Nombre', 'Celular', 'Origen', 'Versión política', 'Acepta promociones', 'Detalle'];

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const c = JSON.parse(e.postData.contents);
    const limpio = (v, n) => String(v == null ? '' : v).slice(0, n).replace(/^[=+\-@]/, "'$&"); // evita fórmulas inyectadas
    if (!/^A-[A-Z0-9]{5}$/.test(c.id) || !limpio(c.nombre, 120).trim()) return ContentService.createTextOutput('no');
    hoja_().appendRow([
      new Date(),
      c.id,
      limpio(c.fecha, 40),
      limpio(c.nombre, 120),
      limpio(c.celular, 30),
      limpio(c.origen, 20),
      limpio(c.version, 20),
      c.promo ? 'Sí' : 'No',
      limpio(c.detalle, 120),
    ]);
    return ContentService.createTextOutput('ok');
  } finally {
    lock.releaseLock();
  }
}

function hoja_() {
  const libro = SpreadsheetApp.getActiveSpreadsheet();
  let h = libro.getSheetByName(HOJA);
  if (!h) {
    h = libro.insertSheet(HOJA);
    h.appendRow(COLUMNAS);
    h.setFrozenRows(1);
    h.getRange(1, 1, 1, COLUMNAS.length).setFontWeight('bold').setBackground('#7F7A52').setFontColor('#F0EEE9');
  }
  return h;
}
