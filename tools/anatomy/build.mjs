// Figuras isométricas de cada procedimiento de EXORA (kit "anatomy").
// Un banco de laboratorio: placa base con patas, rieles, un pórtico (como un plotter)
// que baja el instrumento sobre un bloque de tejido escalonado en capas
// (epidermis, dermis, tejido graso, músculo). Cada procedimiento llega a su capa.
// Uso: node tools/anatomy/build.mjs  → escribe src/anatomy/figures.json
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";
import { tubePieces, tubeSvg } from "./kit/tube.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT_DIR = join(HERE, "../../public/anatomy");
const W = 640, H = 440;

// ── Mundo ────────────────────────────────────────────────────────────────
const PLATE = { x: -118, y: -84, w: 236, d: 166, r: 9 };
const PLATE_TOP = -6, PLATE_H = 9, FOOT_H = 6;
const BLOCK = { x: -70, w: 140 };
const BACK = -58;
// capas: [nombre, z0, z1, frente y]
const LAYERS = [
  { id: "musculo", name: "músculo", z0: 0, z1: 22, front: 56 },
  { id: "grasa", name: "tejido graso (subcutáneo)", z0: 22, z1: 44, front: 30 },
  { id: "dermis", name: "dermis", z0: 44, z1: 60, front: 4 },
  { id: "epidermis", name: "epidermis", z0: 60, z1: 64, front: -24 },
];
const L = Object.fromEntries(LAYERS.map((l, i) => [l.id, l]));
// la banda visible de cada capa: de su frente hasta el frente de la siguiente capa de arriba
const band = (id) => {
  const i = LAYERS.findIndex((l) => l.id === id);
  const l = LAYERS[i];
  const next = LAYERS[i + 1];
  const y0 = next ? next.front : BACK;
  return { y0, y1: l.front, z: l.z1, mid: (y0 + l.front) / 2 };
};
const RAIL_X = 100;
const BRIDGE_Z = 150;

const fit = (extra = []) =>
  k.fitProjection(
    [...k.boxCorners(PLATE, PLATE_TOP - PLATE_H - FOOT_H, PLATE_TOP), [-RAIL_X - 8, -20, BRIDGE_Z + 14], [RAIL_X + 8, 40, BRIDGE_Z + 14], ...extra],
    W,
    H,
    { pad: 26, azimuth: 40 },
  );

// ── Ayudantes de dibujo ─────────────────────────────────────────────────
function scene(P) {
  const at = (p) => k.iso(p, P);
  const S = (paths, style) => k.solidSvg(paths, style);
  const Ln = (d, style) => k.lineSvg(d, style);
  const D = (pts, style) => k.dotsSvg(pts, style);
  const byDepth = (pts) => [...pts].sort((a, b) => k.depthOf([a[0], a[1], 0], P) - k.depthOf([b[0], b[1], 0], P));
  return { at, S, Ln, D, byDepth };
}

function bench(P) {
  const { at, S, Ln, D, byDepth } = scene(P);
  const out = [`<path class="iso-halo" d="${k.haloOf(PLATE, PLATE_TOP - PLATE_H - FOOT_H, PLATE_H, P)}"/>`];
  for (const [x, y] of byDepth(k.corners(PLATE, 20))) {
    out.push(S(k.cylinder(x, y, 8, PLATE_TOP - PLATE_H - FOOT_H, 1.6, P, 28), { tone: "lo" }));
    out.push(S(k.cylinder(x, y, 6, PLATE_TOP - PLATE_H - FOOT_H + 1.6, FOOT_H - 1.6, P, 28), { tone: "mid" }));
  }
  out.push(S(k.slabOf(PLATE, PLATE_TOP - PLATE_H, PLATE_H, P, 8, 1.4), { tone: "mid" }));
  out.push(Ln(k.planOutline(k.insetPlan(PLATE, 5), PLATE_TOP, P), { tone: "faint" }));
  const screws = k.corners(PLATE, 10);
  out.push(Ln(screws.map(([x, y]) => k.ring(x, y, 2.4, PLATE_TOP, P, 16)).join(""), { tone: "lo" }));
  out.push(D(screws.map(([x, y]) => at([x, y, PLATE_TOP])), { size: 0.5 }));
  // regla frontal
  const strip = { x: -96, y: PLATE.y + PLATE.d - 15, w: 150, d: 7, r: 1 };
  out.push(S(k.slabOf(strip, PLATE_TOP, 0.6, P, 3), { tone: "lo", crease: "none" }));
  const ticks = k.topTicks(strip.x + 4, strip.x + strip.w - 4, 4, 5, strip.y + 0.8, PLATE_TOP + 0.6, [2, 3.8], P);
  out.push(Ln(ticks.minor, { tone: "lo" }), Ln(ticks.major, { tone: "mid" }));
  out.push(D([at([strip.x + 2, strip.y + 3.5, PLATE_TOP + 0.6]), at([strip.x + strip.w - 2, strip.y + 3.5, PLATE_TOP + 0.6])], { size: 0.45 }));
  // placa de marca
  const label = { x: 62, y: PLATE.y + PLATE.d - 24, w: 40, d: 16, r: 1.5 };
  out.push(S(k.slabOf(label, PLATE_TOP, 1, P, 3, 0.3), { tone: "mid" }));
  out.push(k.faceTextSvg(k.topMatrix([label.x + label.w / 2, label.y + 7], PLATE_TOP + 1, P, "x"), "EXORA", { size: 4.2, tone: "hi", anchor: "middle" }));
  out.push(Ln([11, 13.4].map((dy) => k.lineOnTop([label.x + 6, label.y + dy], [label.x + label.w - 6, label.y + dy], PLATE_TOP + 1, P)).join(""), { tone: "faint", free: true }));
  out.push(D(k.corners(label, 2.2).map(([x, y]) => at([x, y, PLATE_TOP + 1])), { size: 0.4 }));
  return out.join("");
}

function rail(P, x) {
  const { at, S, Ln, D } = scene(P);
  const out = [];
  const plan = { x: x - 4, y: -76, w: 8, d: 142, r: 1.5 };
  out.push(S(k.slabOf(plan, PLATE_TOP, 4, P, 3, 0.4), { tone: "mid" }));
  out.push(Ln(k.lineOnTop([x, plan.y + 2], [x, plan.y + plan.d - 2], PLATE_TOP + 4, P), { tone: "faint" }));
  for (const y of [plan.y - 5, plan.y + plan.d]) {
    out.push(S(k.slabOf({ x: x - 6, y, w: 12, d: 5, r: 1 }, PLATE_TOP, 9, P, 3, 0.4), { tone: "mid" }));
    out.push(D([at([x, y + 2.5, PLATE_TOP + 9])], { size: 0.45 }));
  }
  return out.join("");
}

// pórtico: postes sobre los rieles a la altura y del objetivo, travesaño y carro
function post(P, x, y) {
  const { at, S, Ln, D } = scene(P);
  const out = [];
  out.push(S(k.slabOf({ x: x - 8, y: y - 9, w: 16, d: 18, r: 2 }, PLATE_TOP + 4, 7, P, 4, 0.5), { tone: "mid" }));
  out.push(D(k.corners({ x: x - 8, y: y - 9, w: 16, d: 18 }, 3).map(([a, b]) => at([a, b, PLATE_TOP + 11])), { size: 0.45 }));
  out.push(S(k.cylinder(x, y, 4.2, PLATE_TOP + 11, BRIDGE_Z - PLATE_TOP - 11, P, 28), { tone: "mid", crease: "none" }));
  out.push(Ln([40, 90].map((z) => k.sideArc(x, y, 4.2, z, P, 16)).join(""), { tone: "faint" }));
  // perilla de bloqueo
  out.push(S(k.cylinder(x, y + 11, 3, PLATE_TOP + 5, 5, P, 18), { tone: "mid" }));
  out.push(Ln(k.knurl(x, y + 11, 3, PLATE_TOP + 5, PLATE_TOP + 10, 16, P), { tone: "lo" }));
  return out.join("");
}

function bridge(P, y, x) {
  const { at, S, Ln, D } = scene(P);
  const out = [];
  const bar = { x: -RAIL_X - 7, y: y - 6, w: 2 * RAIL_X + 14, d: 12, r: 2 };
  out.push(S(k.slabOf(bar, BRIDGE_Z, 9, P, 4, 0.6), { tone: "mid" }));
  out.push(Ln(k.lineOnTop([bar.x + 10, y], [bar.x + bar.w - 10, y], BRIDGE_Z + 9, P), { tone: "faint" }));
  const t = k.topTicks(bar.x + 14, bar.x + bar.w - 14, 6, 5, y + 2, BRIDGE_Z + 9, [1.6, 3], P);
  out.push(Ln(t.minor, { tone: "faint" }), Ln(t.major, { tone: "lo" }));
  out.push(D([at([bar.x + 4, y, BRIDGE_Z + 9]), at([bar.x + bar.w - 4, y, BRIDGE_Z + 9])], { size: 0.5 }));
  // carro
  const car = { x: x - 11, y: y - 9, w: 22, d: 18, r: 2.5 };
  out.push(S(k.slabOf(car, BRIDGE_Z - 3, 15, P, 4, 0.6), { tone: "hi", crease: "lo" }));
  out.push(D(k.corners(car, 3).map(([a, b]) => at([a, b, BRIDGE_Z + 12])), { size: 0.45 }));
  out.push(S(k.cylinder(x + 6, y + 3, 2.6, BRIDGE_Z + 12, 3, P, 18), { tone: "mid" }));
  out.push(Ln(k.knurl(x + 6, y + 3, 2.6, BRIDGE_Z + 12, BRIDGE_Z + 15, 14, P), { tone: "lo" }));
  // columna Z
  const col = { x: x - 6, y: y - 13, w: 12, d: 6, r: 1.2 };
  out.push(S(k.slabOf(col, 92, BRIDGE_Z - 3 - 92, P, 3, 0.4), { tone: "mid" }));
  out.push(Ln(k.segment([x, y - 7, 94], [x, y - 7, BRIDGE_Z - 5], P), { tone: "faint" }));
  out.push(D([at([x - 3.5, y - 7, 96]), at([x + 3.5, y - 7, 96])], { size: 0.4 }));
  return out.join("");
}

// bloque de tejido escalonado
function tissue(P, kind) {
  const { at, S, Ln, D } = scene(P);
  const out = [];
  out.push(`<path class="iso-halo" d="${k.haloOf({ x: BLOCK.x, y: BACK, w: BLOCK.w, d: L.musculo.front - BACK, r: 3 }, 0, 0.1, P)}"/>`);
  // bandeja
  const tray = { x: BLOCK.x - 6, y: BACK - 6, w: BLOCK.w + 12, d: L.musculo.front - BACK + 12, r: 3 };
  out.push(S(k.slabOf(tray, PLATE_TOP, -PLATE_TOP, P, 4, 0.6), { tone: "lo" }));
  out.push(D(k.corners(tray, 2.6).map(([a, b]) => at([a, b, 0])), { size: 0.4 }));
  const tones = { musculo: "lo", grasa: "mid", dermis: "mid", epidermis: "hi" };
  for (const l of LAYERS) {
    const plan = { x: BLOCK.x, y: BACK, w: BLOCK.w, d: l.front - BACK, r: 1.2 };
    out.push(`<g class="ly ly-${l.id}">${S(k.slabOf(plan, l.z0, l.z1 - l.z0, P, 3, 0.4), { tone: tones[l.id] })}${texture(P, l.id, kind)}</g>`);
  }
  return out.join("");
}

function texture(P, id, kind) {
  const { at, Ln, D, S } = scene(P);
  const b = band(id);
  const out = [];
  const x0 = BLOCK.x + 3, x1 = BLOCK.x + BLOCK.w - 3;
  if (id === "musculo") {
    // fibras musculares: líneas paralelas a x que terminan en los bordes
    const rows = [];
    for (let y = b.y0 + 3; y < b.y1 - 1.5; y += 3.2) rows.push(k.lineOnTop([BLOCK.x, y], [BLOCK.x + BLOCK.w, y], b.z, P));
    out.push(Ln(rows.join(""), { tone: "faint" }));
    // fascia: estrías finas en la cara frontal
    out.push(Ln([6, 11, 16].map((z) => k.segment([BLOCK.x, L.musculo.front, z], [BLOCK.x + BLOCK.w, L.musculo.front, z], P)).join(""), { tone: "faint" }));
  }
  if (id === "grasa") {
    // lóbulos de grasa: anillos y puntos
    const rings = [], dots = [];
    let j = 0;
    for (let y = b.y0 + 5; y < b.y1 - 3; y += 7.5) {
      for (let x = x0 + 5 + (j % 2) * 4; x < x1 - 4; x += 9) {
        rings.push(k.ring(x, y, 3.2, b.z, P, 14));
        dots.push(at([x, y, b.z]));
      }
      j++;
    }
    out.push(Ln(rings.join(""), { tone: "faint" }));
    out.push(D(dots, { size: 0.35, tone: "faint" }));
  }
  if (id === "dermis") {
    // colágeno: líneas onduladas de borde a borde
    const waves = [];
    for (let y = b.y0 + 3.5; y < b.y1 - 1.5; y += 4) {
      const pts = [];
      for (let x = BLOCK.x; x <= BLOCK.x + BLOCK.w + 0.01; x += 2.5) pts.push([x, y + Math.sin(x / 5 + y) * 0.9]);
      waves.push(k.onTop(pts, b.z, P));
    }
    out.push(Ln(waves.join(""), { tone: "faint" }));
    if (kind === "scalp") {
      // bulbos pilosos
      for (const x of [-48, -28, -8, 12, 32, 52]) out.push(S(G.sphereOf([x, b.mid, b.z + 1.6], 1.8, P), { tone: "mid" }));
    }
  }
  if (id === "epidermis") {
    // poros y textura
    out.push(D(dotsOn(b, 9, 6).map((p) => at(p)), { size: 0.4, tone: "lo" }));
    out.push(Ln(k.planOutline(k.insetPlan({ x: BLOCK.x, y: BACK, w: BLOCK.w, d: L.epidermis.front - BACK, r: 1.2 }, 3), b.z, P, 3), { tone: "faint" }));
    if (kind === "scalp") {
      // cabellos: suben desde la epidermis y terminan libres
      const hairs = [];
      for (let x = -60; x <= 60; x += 6) {
        for (const y of [-50, -42, -34]) {
          const bend = Math.sin(x * 0.7 + y) * 2.2;
          hairs.push(k.segment([x, y, b.z], [x + bend, y + 1.5, b.z + 13], P));
        }
      }
      out.push(`<path class="iso-line" data-tone="mid" data-free="end" d="${hairs.join("")}"/>`);
    }
  }
  return out.join("");
}

const dotsOn = (b, sx, sy) => {
  const pts = [];
  let j = 0;
  for (let y = b.y0 + 4; y < b.y1 - 2; y += sy) {
    for (let x = BLOCK.x + 6 + (j % 2) * (sx / 2); x < BLOCK.x + BLOCK.w - 4; x += sx) pts.push([x, y, b.z]);
    j++;
  }
  return pts;
};

// ── Instrumentos (local: punta en z=0, eje vertical) ───────────────────
function stack(P, x, y, z, parts) {
  const { S, Ln } = scene(P);
  return parts
    .map((p) => {
      if (p.cyl) {
        const [r, z0, z1, tone, extra = {}] = p.cyl;
        let s = S(k.cylinder(x, y, r, z + z0, z1 - z0, P, r > 3 ? 32 : 18, extra.bevel || 0), { tone, lit: !!extra.lit, crease: extra.crease || "faint" });
        if (extra.knurl) s += Ln(k.knurl(x, y, r, z + extra.knurl[0], z + extra.knurl[1], extra.knurl[2] || 24, P), { tone: "lo" });
        if (extra.arcs) s += Ln(extra.arcs.map((h) => k.sideArc(x, y, r, z + h, P, 20)).join(""), { tone: extra.arcTone || "faint" });
        return s;
      }
      if (p.slab) {
        const [plan, z0, z1, tone, extra = {}] = p.slab;
        return S(k.slabOf({ ...plan, x: x + plan.x, y: y + plan.y }, z + z0, z1 - z0, P, 3, extra.bevel || 0.3), { tone, lit: !!extra.lit });
      }
      return p.raw || "";
    })
    .join("");
}

const TOOLS = {
  syringe: { len: 72, gauge: "aguja 30G", parts: (n = 18) => [
    { cyl: [0.45, 0, n, "hi", { lit: true, crease: "none" }] },
    { cyl: [1.5, n, n + 3, "mid"] },
    { cyl: [2.4, n + 3, n + 6, "mid", { knurl: [n + 3, n + 6, 12] }] },
    { cyl: [4.2, n + 6, n + 38, "hi", { arcs: [n + 10, n + 14, n + 18, n + 22, n + 26, n + 30, n + 34], arcTone: "lo" }] },
    { slab: [{ x: -8, y: -3, w: 16, d: 6, r: 1.5 }, n + 38, n + 40, "mid"] },
    { cyl: [1.4, n + 40, n + 52, "mid", { crease: "none" }] },
    { cyl: [4, n + 52, n + 54, "mid"] },
  ] },
  cannula: { len: 84, gauge: "cánula roma 25G", parts: () => [
    { cyl: [0.7, 0, 30, "hi", { lit: true, crease: "none" }] },
    { cyl: [1.6, 30, 33, "mid"] },
    { cyl: [2.4, 33, 36, "mid", { knurl: [33, 36, 12] }] },
    { cyl: [4.2, 36, 68, "hi", { arcs: [40, 44, 48, 52, 56, 60, 64], arcTone: "lo" }] },
    { slab: [{ x: -8, y: -3, w: 16, d: 6, r: 1.5 }, 68, 70, "mid"] },
    { cyl: [1.4, 70, 82, "mid", { crease: "none" }] },
    { cyl: [4, 82, 84, "mid"] },
  ] },
  pen: { len: 66, gauge: "cartucho de 12 microagujas", parts: () => [
    { raw: "" },
    { cyl: [4.4, 2, 10, "hi", { lit: true, bevel: 0.3 }] },
    { cyl: [5, 10, 12, "mid"] },
    { cyl: [5.6, 12, 62, "hi", { arcs: [24, 50], knurl: [38, 46, 26] }] },
    { cyl: [5, 62, 66, "mid"] },
  ] },
  brush: { len: 58, gauge: "pincel aplicador", parts: () => [
    { cyl: [3.4, 0, 7, "mid", { knurl: [0.4, 6.6, 22] }] },
    { cyl: [3.7, 7, 12, "hi", { lit: true, arcs: [9.5] }] },
    { cyl: [2.2, 12, 56, "mid", { crease: "none", arcs: [30] }] },
    { cyl: [2.6, 56, 58, "mid"] },
  ] },
  probe: { len: 48, gauge: "transductor lineal", parts: () => [
    { slab: [{ x: -11, y: -4.5, w: 22, d: 9, r: 3 }, 0, 6, "hi", { lit: true }] },
    { slab: [{ x: -9, y: -4, w: 18, d: 8, r: 3.5 }, 6, 34, "mid", { bevel: 0.5 }] },
    { cyl: [3, 34, 40, "mid"] },
    { cyl: [2, 40, 48, "mid", { arcs: [42, 44, 46] }] },
  ] },
};

// microagujas del dermapen: pequeños trazos que salen del cartucho
function penNeedles(P, x, y, z) {
  const pts = [];
  for (const [dx, dy] of [[-2, -2], [0, -2], [2, -2], [-2, 0], [0, 0], [2, 0], [-2, 2], [0, 2], [2, 2], [-1, 1], [1, -1], [1, 1]]) {
    pts.push(k.segment([x + dx, y + dy, z], [x + dx, y + dy, z + 2], P));
  }
  return `<path class="iso-line" data-tone="lit" d="${pts.join("")}" style="stroke-width:.9"/>`;
}

// extensión desde la parte alta del instrumento hasta la grapa que corre en la columna Z
function extension(P, x, y, zTop) {
  const { S, D, at } = scene(P);
  const clampZ = 96;
  const out = [];
  if (clampZ - 2 > zTop) out.push(S(k.cylinder(x, y, 1.3, zTop, clampZ - zTop, P, 16), { tone: "mid", crease: "none" }));
  out.push(S(k.slabOf({ x: x - 5, y: y - 6.5, w: 10, d: 9, r: 1.5 }, Math.max(clampZ, zTop), 8, P, 3, 0.4), { tone: "mid" }));
  out.push(D([at([x - 2.5, y + 2.5, Math.max(clampZ, zTop) + 8]), at([x + 2.5, y + 2.5, Math.max(clampZ, zTop) + 8])], { size: 0.4 }));
  return out.join("");
}

// ── Depósitos (lo que deja el procedimiento) ───────────────────────────
function deposit(P, cfg, x, y, z) {
  const { at, S, Ln, D } = scene(P);
  const out = [];
  switch (cfg.mark) {
    case "bolus":
      out.push(S(G.sphereOf([x, y, z + 3.4], cfg.size || 3.6, P), { tone: "hi", lit: true }));
      break;
    case "spread":
      for (const [dx, dy, r] of [[0, 0, 2.6], [-6, 2, 1.8], [6, -2, 1.8], [2, 6, 1.5]]) out.push(S(G.sphereOf([x + dx, y + dy, z + r * 0.8], r, P), { tone: "hi", lit: dx === 0 }));
      break;
    case "papules":
      for (const dx of [-24, -12, 0, 12, 24]) out.push(S(G.sphereOf([x + dx, y, z + 1.3], 1.7, P), { tone: "hi", lit: dx === 0 }));
      break;
    case "points":
      for (const dx of [-26, 0, 26]) {
        out.push(S(G.sphereOf([x + dx, y, z + 1.6], 2, P), { tone: "hi", lit: dx === 0 }));
        out.push(Ln(k.ring(x + dx, y, 4.6, z, P, 18), { tone: "lo" }));
      }
      break;
    case "channels": {
      const pts = [];
      for (let i = -4; i <= 4; i++) for (let j = -2; j <= 2; j++) pts.push(at([x + i * 3.2, y + j * 3.2, z]));
      out.push(D(pts, { size: 0.55, tone: "hi" }));
      out.push(Ln(k.planOutline({ x: x - 16, y: y - 9.5, w: 32, d: 19, r: 2 }, z, P, 3), { tone: "lo" }));
      if (cfg.drops) for (const [dx, dy] of [[-10, -4], [4, 5], [12, -3]]) out.push(S(G.sphereOf([x + dx, y + dy, z + 1], 1.2, P), { tone: "hi", lit: true }));
      break;
    }
    case "coat": {
      const plan = { x: x - 34, y: y - 10, w: 68, d: 20, r: 6 };
      out.push(S(k.slabOf(plan, z, 0.7, P, 6), { tone: "hi", lit: true, flat: true }));
      const lines = [];
      for (let yy = plan.y + 3; yy < plan.y + plan.d - 2; yy += 3.5) lines.push(k.lineOnTop([plan.x + 6, yy], [plan.x + plan.w - 6, yy], z + 0.7, P));
      out.push(fade(P, lines));
      break;
    }
    case "fan":
      for (const ang of [-0.5, -0.17, 0.17, 0.5]) {
        const ex = x + Math.sin(ang) * 46, ey = y - Math.cos(ang) * 10;
        out.push(Ln(k.lineOnTop([x, y], [ex, ey], z + 0.3, P), { tone: "lit" }));
        out.push(D([at([ex, ey, z + 0.3])], { size: 0.7, tone: "hi" }));
      }
      break;
    case "thread": {
      const pts = [];
      for (let t = 0; t <= 1.0001; t += 0.04) pts.push([x - t * 52, y + Math.sin(t * 18) * 1.6]);
      out.push(Ln(k.onTop(pts, z + 0.4, P), { tone: "lit" }));
      out.push(D([at([pts[pts.length - 1][0], pts[pts.length - 1][1], z + 0.4]), at([x, y, z + 0.4])], { size: 0.8, tone: "hi" }));
      break;
    }
    case "waves": {
      const arcs = [];
      for (const lid of ["dermis", "grasa", "musculo"]) {
        const b = band(lid);
        for (const r of [10, 18, 26]) arcs.push(k.onTop(arcPts(x, y, r, b), b.z, P));
      }
      out.push(`<path class="iso-line" data-tone="lit" data-dashed="" d="${arcs.join("")}" style="stroke-width:.8"/>`);
      break;
    }
  }
  return out.join("");
}

const arcPts = (x, y, r, b) => {
  const pts = [];
  for (let a = -Math.PI; a <= 0.0001; a += Math.PI / 24) {
    const px = x + Math.cos(a) * r, py = b.mid + Math.sin(a) * Math.min(r, (b.y1 - b.y0) / 2 - 1);
    pts.push([Math.max(BLOCK.x + 1, Math.min(BLOCK.x + BLOCK.w - 1, px)), py]);
  }
  return pts;
};

const fade = (P, lines) => lines.map((d, i) => `<path class="iso-line" data-tone="faint" data-free="" d="${d}" opacity="${(0.4 + 0.6 * Math.sin((i + 1) / (lines.length + 1) * Math.PI)).toFixed(2)}"/>`).join("");

// ── Rodilla ─────────────────────────────────────────────────────────────
function knee(P) {
  const { at, S, Ln, D } = scene(P);
  const out = [];
  const Y = 10, Z = 34;
  // bloques en V
  for (const x of [-52, 52]) {
    const plan = { x: x - 12, y: Y - 18, w: 24, d: 36, r: 2 };
    out.push(`<path class="iso-halo" d="${k.haloOf(plan, PLATE_TOP, 0.1, P)}"/>`);
    out.push(S(k.slabOf(plan, PLATE_TOP, 18 - PLATE_TOP, P, 3, 0.5), { tone: "mid" }));
    out.push(Ln(k.lineOnTop([plan.x, Y], [plan.x + plan.w, Y], 18, P), { tone: "lo" }));
    out.push(D(k.corners(plan, 3).map(([a, b]) => at([a, b, 18])), { size: 0.45 }));
  }
  const FX = G.frameAlong([0, Y, Z], [-1, 0, 0]);
  const TX = G.frameAlong([0, Y, Z], [1, 0, 0]);
  // fémur (hacia -x) con cóndilo redondeado
  out.push(S(G.solidOf([[2.5, 0], [2.5, 13, 1], [4, 16, 1], [9, 17, 1], [16, 14.5, 1], [26, 12.5, 1], [78, 11.5]], FX, P), { tone: "hi" }));
  // tibia (hacia +x) con meseta
  out.push(S(G.solidOf([[2.5, 0], [2.5, 15], [6, 15, 1], [12, 13, 1], [22, 11.5, 1], [78, 10.5]], TX, P), { tone: "hi" }));
  // cartílagos
  out.push(S(G.disc(1.2, 2.5, 14, FX, P), { tone: "mid" }));
  out.push(S(G.disc(1.2, 2.5, 14.6, TX, P), { tone: "mid" }));
  // espacio articular con gel
  out.push(S(G.disc(-1.2, 1.2, 13.4, TX, P), { tone: "hi", lit: true }));
  // menisco
  out.push(S(G.ringBand(-1.4, 1.4, 13.2, 16.2, TX, P), { tone: "lo" }));
  return { svg: out.join(""), target: [0, Y, Z + 16.2] };
}

// ── Monitor de ecografía ───────────────────────────────────────────────
function monitor(P) {
  const { at, S, Ln, D } = scene(P);
  const out = [];
  const base = { x: 78, y: -70, w: 30, d: 22, r: 3 };
  out.push(S(k.slabOf(base, PLATE_TOP, 5, P, 4, 0.5), { tone: "mid" }));
  out.push(S(k.cylinder(93, -59, 2.6, PLATE_TOP + 5, 30, P, 18), { tone: "mid", crease: "none" }));
  const scr = { x: 79, y: -64, w: 28, d: 4, r: 1 };
  out.push(S(k.slabOf(scr, 30, 26, P, 3, 0.4), { tone: "hi" }));
  // sector de la imagen sobre la cara frontal (y = -60)
  const cx = 93, cz = 53, face = scr.y + scr.d;
  const arcs = [];
  for (const r of [6, 10, 14, 18]) {
    const pts = [];
    for (let a = -0.55; a <= 0.551; a += 0.05) pts.push(k.iso([cx + Math.sin(a) * r, face, cz - Math.cos(a) * r], P));
    arcs.push(k.pathOf(pts));
  }
  out.push(`<path class="iso-line" data-tone="lo" d="${arcs.join("")}"/>`);
  out.push(Ln(k.segment([cx, face, cz], [cx - Math.sin(0.55) * 18, face, cz - Math.cos(0.55) * 18], P) + k.segment([cx, face, cz], [cx + Math.sin(0.55) * 18, face, cz - Math.cos(0.55) * 18], P), { tone: "lo" }));
  out.push(D([at([cx + 4, face, cz - 12])], { size: 0.9, tone: "hi" }));
  out.push(D([at([102, face, 33]), at([99, face, 33])], { size: 0.5, tone: "mid" }));
  return out.join("");
}

// ── Bolsa de suero ──────────────────────────────────────────────────────
function ivKit(P, x, y, catheter) {
  const { at, S, Ln, D } = scene(P);
  const out = [];
  // gancho bajo el carro
  out.push(S(k.cylinder(x, y, 0.9, 132, BRIDGE_Z - 3 - 132, P, 12), { tone: "mid", crease: "none" }));
  const bag = { x: x - 11, y: y - 3.5, w: 22, d: 7, r: 3.5 };
  out.push(S(k.slabOf(bag, 96, 36, P, 6, 0.5), { tone: "hi" }));
  out.push(Ln([104, 110, 116, 122].map((z) => k.sideSeam(bag, z, P, 6)).join(""), { tone: "faint" }));
  out.push(S(k.cylinder(x, y, 1.6, 90, 6, P, 14), { tone: "mid" }));
  out.push(S(k.cylinder(x, y, 2.8, 76, 14, P, 20), { tone: "hi", lit: true }));
  out.push(Ln(k.sideArc(x, y, 2.8, 82, P, 16), { tone: "lo" }));
  // tubo hasta el catéter en la vena
  const route = G.fillet([[x, y, 76], [x, y, 70], [x + 6, catheter[1], 70], [catheter[0] - 10, catheter[1], catheter[2] + 10], [catheter[0], catheter[1], catheter[2] + 2]], 8, 7, { P, tube: 0.9 });
  for (const piece of tubePieces(route, 0.9, P, { maxLength: 18 })) out.push(tubeSvg(piece, { tone: "mid" }));
  out.push(S(k.cylinder(catheter[0], catheter[1], 1.8, catheter[2], 2.4, P, 16), { tone: "mid" }));
  out.push(D([at(catheter)], { size: 0.8, tone: "hi" }));
  return out.join("");
}

// vena sobre la banda del tejido graso
function vein(P) {
  const { S } = scene(P);
  const b = band("grasa");
  const F = G.frameAlong([BLOCK.x, b.mid, b.z + 2.6], [1, 0, 0]);
  return S(G.solidOf([[0, 2.6], [BLOCK.w, 2.6]], F, P, { rims: "none" }), { tone: "hi" });
}

// ── Cada procedimiento ──────────────────────────────────────────────────
const P_CFG = [
  // Facial
  { id: "facial-botox", title: "Bótox", tool: "syringe", layer: "musculo", mark: "spread", x: 0, lift: 30,
    reads: "Toxina botulínica · se aplica en el músculo", caption: "La aguja fina llega al músculo y deja pequeñas dosis que lo relajan; la piel de encima se suaviza sin perder expresión. En bruxismo se aplica en el masetero; en hiperhidrosis va más superficial, en la dermis, donde están las glándulas del sudor." },
  { id: "facial-bioestimuladores", title: "Bioestimuladores de colágeno", tool: "cannula", layer: "grasa", mark: "fan", x: 18, lift: 34,
    reads: "Hidroxiapatita o ácido poliláctico · plano subdérmico", caption: "La cánula roma recorre el plano bajo la dermis y deja finas líneas de producto en abanico. Allí el bioestimulador activa a los fibroblastos, que fabrican colágeno nuevo durante semanas." },
  { id: "facial-hialuronico", title: "Ácido hialurónico", tool: "syringe", layer: "grasa", mark: "bolus", x: 0, lift: 30, size: 4.2,
    reads: "Ácido hialurónico · dermis profunda y subcutáneo", caption: "Un pequeño depósito de gel en la dermis profunda o el tejido subcutáneo devuelve volumen e hidratación donde se perdió; el gel atrae agua y se integra con el tejido." },
  { id: "facial-skinbooster", title: "Skinbooster", tool: "syringe", layer: "dermis", mark: "papules", x: 0, lift: 28,
    reads: "Microinyecciones · dermis superficial", caption: "Muchas microdosis de ácido hialurónico ligero, una junto a otra, en la dermis superficial: hidratan desde dentro y dan luminosidad y elasticidad, sin cambiar volúmenes." },
  { id: "facial-exosomas", title: "Exosomas", tool: "pen", layer: "dermis", mark: "channels", drops: true, x: 0, lift: 24,
    reads: "Exosomas + microcanales · dermis", caption: "Las microagujas abren canales diminutos hasta la dermis y los exosomas entran por ellos. Son mensajeros de las células que favorecen la reparación y la calidad de la piel." },
  { id: "facial-peeling", title: "Peeling", tool: "brush", layer: "epidermis", mark: "coat", x: 0, lift: 26,
    reads: "Ácidos controlados · epidermis", caption: "La solución se aplica sobre la superficie y actúa en la epidermis: retira las capas más externas para que la piel se renueve, con menos manchas, poros y marcas." },
  { id: "facial-dermapen", title: "Dermapen", tool: "pen", layer: "dermis", mark: "channels", x: 0, lift: 24,
    reads: "Microagujas · 0,5 a 2 mm según la zona", caption: "El cartucho de microagujas perfora en vertical a la profundidad elegida y deja una red de microcanales. La piel responde reparándolos con colágeno nuevo." },
  // Íntimo
  { id: "intimo-bioestimuladores", title: "Bioestimuladores íntimos", tool: "cannula", layer: "grasa", mark: "fan", x: 18, lift: 34,
    reads: "Bioestimulador · plano subdérmico", caption: "Igual que en el rostro, la cánula deja líneas de producto bajo la dermis para que el tejido produzca colágeno propio y gane firmeza." },
  { id: "intimo-hialuronico", title: "Ácido hialurónico en labios mayores", tool: "cannula", layer: "grasa", mark: "bolus", x: 0, lift: 34, size: 4.6,
    reads: "Ácido hialurónico · tejido subcutáneo", caption: "El gel se coloca en el tejido graso bajo la piel para devolver volumen e hidratación, con un resultado natural." },
  { id: "intimo-peeling", title: "Peeling genital", tool: "brush", layer: "epidermis", mark: "coat", x: 0, lift: 26,
    reads: "Peeling suave · epidermis", caption: "Un protocolo suave y gradual que actúa solo en la capa más externa para unificar el tono de la piel." },
  { id: "intimo-skinbooster", title: "Skinbooster íntimo", tool: "syringe", layer: "dermis", mark: "papules", x: 0, lift: 28,
    reads: "Microinyecciones · dermis", caption: "Microdosis de hidratación profunda en la dermis para mejorar el confort y la elasticidad del tejido." },
  { id: "intimo-hilos", title: "Hilos íntimos", tool: "cannula", layer: "grasa", mark: "thread", x: 26, lift: 34,
    reads: "Hilos reabsorbibles · tejido subcutáneo", caption: "La cánula deja un hilo reabsorbible en el tejido subcutáneo. Mientras el cuerpo lo absorbe, estimula colágeno y aporta firmeza." },
  // Regenerativa
  { id: "regen-biopuntura", title: "Biopuntura", tool: "syringe", layer: "musculo", mark: "points", x: 0, lift: 30,
    reads: "Medicamentos biológicos · puntos de dolor", caption: "Pequeñas aplicaciones en puntos concretos del músculo o del tejido que duele, para apoyar el manejo del dolor y la inflamación." },
  { id: "regen-bioinfusion", title: "Bioinfusión", tool: "iv", layer: "grasa", mark: "none", x: 0, lift: 0,
    reads: "Vía intravenosa · vitaminas y antioxidantes", caption: "La mezcla de vitaminas, minerales y antioxidantes pasa de la bolsa a la vena gota a gota, y la sangre la reparte por todo el cuerpo." },
  { id: "regen-exosomas", title: "Exosomas (regenerativa)", tool: "syringe", layer: "grasa", mark: "spread", x: 0, lift: 30,
    reads: "Exosomas · infiltración en el tejido", caption: "Los exosomas se infiltran cerca del tejido que se quiere reparar; llevan señales que ayudan a las células a recuperarse." },
  { id: "regen-celulas", title: "Células madre", tool: "syringe", layer: "grasa", mark: "bolus", x: 0, lift: 30, size: 3.8,
    reads: "Terapia celular · según valoración", caption: "Tras una valoración completa, las células se aplican en la zona a tratar para apoyar la regeneración del tejido." },
  { id: "regen-intraarticular", title: "Aplicaciones intraarticulares", tool: "syringe", layer: "knee", mark: "none", x: 0, lift: 30,
    reads: "Medicamento · dentro de la articulación", caption: "La aguja entra al espacio entre los huesos, donde está el líquido de la articulación, y el medicamento actúa justo donde está el dolor." },
  { id: "regen-hialuronico-rodilla", title: "Ácido hialurónico en rodillas", tool: "syringe", layer: "knee", mark: "none", x: 0, lift: 30,
    reads: "Ácido hialurónico · espacio articular", caption: "El gel se deposita en el espacio articular y actúa como lubricante entre los cartílagos del fémur y la tibia." },
  // Capilar
  { id: "capilar-tricologia", title: "Tricología", tool: "syringe", layer: "dermis", mark: "papules", x: 0, lift: 28, kind: "scalp",
    reads: "Cuero cabelludo · alrededor del folículo", caption: "En el cuero cabelludo, las microinyecciones llegan a la dermis, donde están los bulbos del cabello, para nutrir el folículo y frenar la caída." },
  // Eco
  { id: "eco-ecografia", title: "Ecografías y ultrasonidos", tool: "probe", layer: "epidermis", mark: "waves", x: -10, lift: 14,
    reads: "Ultrasonido · sin radiación", caption: "El transductor se apoya sobre la piel con gel; envía ondas de sonido que rebotan en cada capa y vuelven como imagen al monitor, en tiempo real." },
];

function build(cfg) {
  const isKnee = cfg.layer === "knee";
  const P = fit();
  const { at } = scene(P);
  let target, ty;
  let body = [];
  let kneeSvg = "";
  if (isKnee) {
    const kn = knee(P);
    kneeSvg = kn.svg;
    target = kn.target;
  } else {
    const b = band(cfg.layer);
    target = [cfg.x, b.mid, b.z];
  }
  ty = target[1];
  const [tx, , tz] = target;

  body.push(bench(P));
  body.push(rail(P, -RAIL_X));
  body.push(post(P, -RAIL_X, ty));
  if (cfg.tool === "probe") body.push(monitor(P));
  if (isKnee) body.push(kneeSvg);
  else {
    body.push(tissue(P, cfg.kind));
    if (cfg.tool === "iv") body.push(vein(P));
  }
  const dep = cfg.mark && cfg.mark !== "none" ? deposit(P, cfg, tx, ty, tz) : "";
  body.push(`<g data-part="deposit">${dep}</g>`);
  body.push(rail(P, RAIL_X));
  body.push(post(P, RAIL_X, ty));
  body.push(bridge(P, ty, tx));

  let tool = "";
  if (cfg.tool === "iv") {
    tool = ivKit(P, tx, ty, [tx + 34, ty, tz + 5.2]);
    body.push(tool);
  } else {
    const T = TOOLS[cfg.tool];
    const parts = typeof T.parts === "function" ? T.parts() : T.parts;
    let svg = "";
    if (cfg.tool === "pen") svg += penNeedles(P, tx, ty, tz);
    svg += stack(P, tx, ty, tz, parts);
    svg += extension(P, tx, ty, tz + T.len);
    if (cfg.tool === "probe") {
      // gel bajo el transductor
      body.push(`<g data-part="gel">${k.solidSvg(k.slabOf({ x: tx - 14, y: ty - 7, w: 28, d: 14, r: 6 }, tz, 0.8, P, 6), { tone: "hi", flat: true })}</g>`);
    }
    body.push(`<g data-part="tool">${svg}</g>`);
  }

  const lift = cfg.lift ? k.translateAlong(P, [0, 0, cfg.lift]) : "";
  const svgDoc = k.figureSvg({
    width: W,
    height: H,
    label: `${cfg.title}: banco de demostración con un bloque de tejido en capas y el instrumento que llega a ${isKnee ? "la articulación de la rodilla" : "la capa de " + L[cfg.layer].name}.`,
    body,
  });
  const T = TOOLS[cfg.tool];
  return {
    id: cfg.id,
    title: cfg.title,
    svg: svgDoc,
    lift,
    layer: isKnee ? "articulación de la rodilla" : L[cfg.layer].name,
    tool: cfg.tool === "iv" ? "bolsa de suero y catéter" : T.gauge,
    reads: cfg.reads,
    caption: cfg.caption,
    pulse: cfg.tool === "iv",
  };
}

const figures = P_CFG.map(build);
mkdirSync(OUT_DIR, { recursive: true });
for (const f of figures) writeFileSync(join(OUT_DIR, f.id + ".json"), JSON.stringify(f));
writeFileSync(join(HERE, "../../src/anatomy-theme.css"), readFileSync(join(HERE, "kit/iso.css"), "utf8") + readFileSync(join(HERE, "exora.css"), "utf8"));
console.log("wrote", figures.length, "figures to public/anatomy");

// página de revisión
if (process.argv.includes("--preview")) {
  const css = readFileSync(join(HERE, "kit/iso.css"), "utf8") + readFileSync(join(HERE, "exora.css"), "utf8");
  const html = `<!doctype html><meta charset="utf-8"><style>${css}body{margin:0;background:#f0eee9}.g{display:grid;grid-template-columns:repeat(4,1fr);gap:8px;padding:8px}.c{background:#f5f2ea;border-radius:12px;padding:6px;font:12px sans-serif}</style><body class="iso" data-theme="light"><div class="g">${figures.map((f) => `<div class="c">${f.title}${f.svg}</div>`).join("")}</div>`;
  writeFileSync(join(HERE, "preview.html"), html);
  console.log("preview.html");
}
