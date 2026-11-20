// Prototipo "para un niño de 8 años": la piel como un pastel de capas, el bótox en 3 pasos.
// node tools/anatomy/botox-demo.mjs → public/demo/botox.html
import { writeFileSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import * as k from "./kit/iso-kit.mjs";
import * as G from "./kit/lathe.mjs";

const HERE = dirname(fileURLToPath(import.meta.url));
const OUT = join(HERE, "../../public/demo/botox.html");
const W = 640, H = 420;

// el "pastel": x de -66 a 66, profundidad y de -34 a 34 (la cara del corte mira a +y)
const X0 = -66, X1 = 66, Y0 = -34, Y1 = 34;
const Z = { musc: [0, 22], grasa: [22, 40], piel: [40, 54] };
const P = k.fitProjection([...k.boxCorners({ x: X0 - 22, y: Y0 - 22, w: X1 - X0 + 44, d: Y1 - Y0 + 44 }, -10, 0), [0, 0, 120]], W, H, { pad: 20, azimuth: 32 });
const at = (p) => k.iso(p, P);
const S = (paths, style) => k.solidSvg(paths, style);
const Ln = (d, style) => k.lineSvg(d, style);
const D = (pts, style) => k.dotsSvg(pts, style);
const ALONG_Y = G.frameOf([0, Y0, 0], [0, 1, 0], [1, 0, 0], [0, 0, 1]); // u = x, v = z

// plato redondo del pastel
function plate() {
  const out = [`<path class="iso-halo" d="${k.haloOf({ x: -95, y: -70, w: 190, d: 140, r: 70 }, -10, 4, P)}"/>`];
  out.push(S(k.cylinder(0, 0, 70, -12, 3, P, 96), { tone: "lo" }));
  out.push(S(k.cylinder(0, 0, 96, -9, 6, P, 120, 1.2), { tone: "mid" }));
  out.push(Ln(k.ring(0, 0, 90, -3, P, 120), { tone: "faint" }));
  out.push(D(Array.from({ length: 24 }, (_, i) => { const a = (i / 24) * Math.PI * 2; return at([Math.cos(a) * 93, Math.sin(a) * 93, -3]); }), { size: 0.45, tone: "lo" }));
  return out.join("");
}

// capa como prisma a lo largo de y con un perfil (x, z) convexo
const layer = (poly, cls, extra = "") => `<g class="ly ${cls}">${S(G.prismOf(ALONG_Y, poly, 0, Y1 - Y0, P), { tone: "mid" })}${extra}</g>`;
const onFront = (x, z) => at([x, Y1, z]);
const frontPath = (pts) => k.pathOf(pts.map(([x, z]) => onFront(x, z)));

function muscle(tight) {
  const [z0, z1] = Z.musc;
  const out = [layer([[X0, z0], [X1, z0], [X1, z1], [X0, z1]], "ly-musculo")];
  // fibras en la cara del corte: en acordeón cuando aprieta, rectas cuando descansa
  const rows = [5, 9.5, 14, 18.5];
  const fibers = rows.map((z) => {
    const pts = [];
    for (let x = X0; x <= X1 + 0.01; x += 2) {
      const squeeze = tight ? Math.exp(-((x / 34) ** 2)) : 0;
      pts.push([x, z + Math.sin(x / 2.2) * 1.8 * squeeze]);
    }
    return frontPath(pts);
  });
  out.push(`<path class="iso-line" data-tone="${tight ? "lit" : "mid"}" d="${fibers.join("")}" style="stroke-width:${tight ? 1.1 : 0.8}"/>`);
  // fibras arriba (en la cara superior que asoma no hay: la tapa la grasa) → líneas en la cara lateral +x
  return out.join("");
}

function fat() {
  const [z0, z1] = Z.grasa;
  const bubbles = [];
  for (let x = X0 + 7, i = 0; x < X1 - 4; x += 10, i++) for (const z of [z0 + 5, z0 + 12.5]) bubbles.push(k.sideRing([x + (z > z0 + 6 ? 5 : 0), Y1, z], 3.2, "y", P, 18));
  return layer([[X0, z0], [X1, z0], [X1, z1], [X0, z1]], "ly-grasa", Ln(bubbles.join(""), { tone: "faint" }));
}

// piel: con arruga (una V en el centro) o lisa
function skin(wrinkle) {
  const [z0, z1] = Z.piel;
  const out = [];
  const pores = (x0, x1) => {
    const pts = [];
    for (let x = x0 + 5; x < x1 - 3; x += 8) for (const y of [Y0 + 8, Y0 + 20, Y0 + 32, Y0 + 44, Y0 + 56]) pts.push(at([x, y, z1]));
    return D(pts, { size: 0.45, tone: "lo" });
  };
  if (!wrinkle) {
    out.push(layer([[X0, z0], [X1, z0], [X1, z1], [X0, z1]], "ly-piel", pores(X0, X1)));
  } else {
    const d = 9, w = 9; // profundidad y medio ancho de la arruga
    out.push(layer([[X0, z0], [0, z0], [0, z1 - d], [-w, z1], [X0, z1]], "ly-piel", pores(X0, -w)));
    out.push(layer([[0, z0], [X1, z0], [X1, z1], [w, z1], [0, z1 - d]], "ly-piel", pores(w, X1)));
  }
  return out.join("");
}

// jeringa en el plano del corte (por delante de la cara), de modo que se ve la aguja llegar al músculo
function syringe() {
  const x = -22, y = Y1 + 7, tip = 12;
  const F = G.frameOf([x, y, tip], [0, 0, 1], [1, 0, 0], [0, 1, 0]);
  const out = [];
  out.push(S(G.disc(0, 44, 0.6, F, P), { tone: "hi", lit: true }));
  out.push(S(G.disc(44, 48, 1.8, F, P), { tone: "mid" }));
  out.push(S(G.solidOf([[48, 0], [48, 5.4], [86, 5.4], [86, 0]], F, P), { tone: "hi", inner: Ln([54, 60, 66, 72, 78].map((s) => G.arcOf(F, s, 5.4, P)).join(""), { tone: "lo" }) }));
  out.push(S(G.prismOf(F, [[-10, -3], [10, -3], [10, 3], [-10, 3]], 86, 88, P), { tone: "mid" }));
  out.push(S(G.disc(88, 102, 1.8, F, P), { tone: "mid" }));
  out.push(S(G.disc(102, 104.5, 5, F, P), { tone: "mid" }));
  return out.join("");
}

const drop = () => '<g class="gota">' + S(G.sphereOf([-22, Y1 + 1, 12], 4.2, P), { tone: "hi", lit: true }) + '</g>';

// sombra de "rayitas" de alivio sobre la piel lisa
const sparkle = () => {
  const c = at([20, 0, Z.piel[1] + 8]);
  const lines = [0, 1, 2, 3].map((i) => { const a = (i * Math.PI) / 4; return `M${(c[0] + Math.cos(a) * 3).toFixed(1)} ${(c[1] + Math.sin(a) * 3).toFixed(1)}L${(c[0] + Math.cos(a) * 7).toFixed(1)} ${(c[1] + Math.sin(a) * 7).toFixed(1)}M${(c[0] - Math.cos(a) * 3).toFixed(1)} ${(c[1] - Math.sin(a) * 3).toFixed(1)}L${(c[0] - Math.cos(a) * 7).toFixed(1)} ${(c[1] - Math.sin(a) * 7).toFixed(1)}`; });
  return `<path class="iso-line" data-tone="lit" data-free="" d="${lines.join("")}" style="stroke-width:1.2"/>`;
};

const state = (tight, wrinkle, extra = "") => [plate(), muscle(tight), fat(), skin(wrinkle), extra].join("");

const STEPS = [
  { svg: state(true, true), n: "1", title: "El músculo se aprieta", text: "Cuando frunces el ceño o te ríes mucho, un músculo chiquito debajo de la piel se aprieta como un acordeón. Con los años, la piel de arriba se dobla y aparece una arruga." },
  { svg: state(true, true, `<g data-part="syringe">${syringe()}</g><g data-part="drop">${drop()}</g>`), n: "2", title: "Una gotita lo calma", text: "La doctora pone una gotita de bótox, con una aguja muy finita, justo en ese músculo. La gotita le dice al músculo: «tranquilo, descansa un poquito»." },
  { svg: state(false, false, sparkle()), n: "3", title: "La piel queda lisita", text: "El músculo deja de apretar tanto, entonces la piel ya no se dobla y la arruga se suaviza. ¡Y puedes seguir sonriendo! El efecto dura unos meses." },
];

const figure = (inner) => k.figureSvg({ width: W, height: H, label: "La piel como un pastel de tres capas: piel arriba, grasita en el medio y músculo abajo.", body: [inner] });

const css = readFileSync(join(HERE, "kit/iso.css"), "utf8") + readFileSync(join(HERE, "exora.css"), "utf8");
const html = `<!doctype html><html lang="es"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Así funciona el bótox · EXORA</title>
<style>
@font-face{font-family:GrandSlang;src:url(../fonts/GrandSlang-Roman.woff2) format("woff2")}
@font-face{font-family:Bitter;src:url(../fonts/Bitter-Regular.woff2) format("woff2")}
${css}
.gota .iso-fill,.gota .iso-top{fill:#c08a63}.gota .iso-shade{fill:#a87350}.gota .iso-edge{stroke:#7a5236}
.ly-piel .iso-top{fill:#faf6f0}.ly-piel .iso-fill{fill:#f6efe6}
.ly-piel .iso-shade[data-shade="0"]{fill:#e9dccd}.ly-piel .iso-shade[data-shade="1"]{fill:#efe4d7}.ly-piel .iso-shade[data-shade="2"]{fill:#f3eadf}.ly-piel .iso-shade[data-shade="3"]{fill:#f7f0e7}
body{margin:0;background:#f0eee9;color:#3b3823;font-family:Bitter,Georgia,serif}
.wrap{max-width:760px;margin:0 auto;padding:24px 18px 48px}
h1{font-family:GrandSlang,Georgia,serif;font-weight:400;font-size:clamp(2rem,6vw,3rem);line-height:1;margin:.2em 0 .1em}
.kicker{font-size:.72rem;letter-spacing:.14em;text-transform:uppercase;color:#7f7a52}
.card{background:#f5f2ea;border-radius:24px;padding:14px;margin-top:18px;box-shadow:0 20px 50px -30px #3b382366}
.stage{position:relative;aspect-ratio:${W}/${H}}
.stage>div{position:absolute;inset:0;opacity:0;transition:opacity .9s ease}
.stage>div.on{opacity:1}
[data-part=syringe]{transition:transform 1.4s cubic-bezier(.32,.72,0,1)}
[data-part=drop]{transition:opacity .8s ease .9s}
.legend{display:flex;flex-wrap:wrap;gap:8px 16px;margin:10px 4px 0;font-size:.9rem}
.legend span{display:inline-flex;align-items:center;gap:7px}
.legend i{width:14px;height:14px;border-radius:4px;border:1px solid #3b382326;display:inline-block}
.steps{display:flex;gap:10px;margin-top:18px}
.steps button{flex:1;cursor:pointer;border:0;border-radius:999px;padding:12px 8px;font:inherit;font-size:1rem;background:#e6e1cf;color:#3b3823;transition:background .3s}
.steps button.on{background:#7f7a52;color:#f5f2ea}
.text{margin-top:16px;min-height:7.5em}
.text h2{font-family:GrandSlang,Georgia,serif;font-weight:400;font-size:1.9rem;margin:0}
.text p{font-size:1.15rem;line-height:1.55;margin:.4em 0 0}
.note{font-size:.78rem;color:#8e8a6c;margin-top:22px}
</style></head>
<body class="iso" data-theme="light"><div class="wrap">
<div class="kicker">EXORA · explicado fácil</div>
<h1>¿Cómo funciona el bótox?</h1>
<p style="font-size:1.1rem;margin:.3em 0 0">Imagina que tu piel es un pastel de tres capas.</p>
<div class="card">
  <div class="stage">${STEPS.map((s, i) => `<div data-step="${i}" class="${i === 0 ? "on" : ""}">${figure(s.svg)}</div>`).join("")}</div>
  <div class="legend"><span><i style="background:#faf6f0"></i>Piel</span><span><i style="background:#f1e6c2"></i>Grasita</span><span><i style="background:#d9b49a"></i>Músculo</span><span><i style="background:#a87350;border-radius:50%"></i>La gotita</span></div>
</div>
<div class="steps">${STEPS.map((s, i) => `<button data-go="${i}" class="${i === 0 ? "on" : ""}">${s.n}. ${s.title.split(" ").slice(0, 2).join(" ")}</button>`).join("")}</div>
<div class="text" aria-live="polite"><h2 id="t">${STEPS[0].title}</h2><p id="p">${STEPS[0].text}</p></div>
<p class="note">Dibujo educativo y simplificado: las capas no están a escala. La doctora te explica tu caso en la valoración.</p>
</div>
<script>
const STEPS=${JSON.stringify(STEPS.map(({ title, text }) => ({ title, text })))};
const LIFT=${JSON.stringify(k.translateAlong(P, [0, 0, 34]))}.match(/translate\\(([-\\d.]+)[ ,]+([-\\d.]+)\\)/);
const panes=[...document.querySelectorAll('[data-step]')],btns=[...document.querySelectorAll('[data-go]')];
const still=matchMedia('(prefers-reduced-motion: reduce)').matches;
let cur=0,timer=0;
function show(i){cur=i;panes.forEach((p,j)=>p.classList.toggle('on',j===i));btns.forEach((b,j)=>b.classList.toggle('on',j===i));
document.getElementById('t').textContent=STEPS[i].title;document.getElementById('p').textContent=STEPS[i].text;
const syr=panes[1].querySelector('[data-part=syringe]'),drop=panes[1].querySelector('[data-part=drop]');
if(i===1){syr.style.transform='translate('+LIFT[1]+'px,'+LIFT[2]+'px)';drop.style.opacity=0;requestAnimationFrame(()=>requestAnimationFrame(()=>{syr.style.transform='translate(0,0)';drop.style.opacity=1}))}}
function auto(){clearTimeout(timer);if(still)return;timer=setTimeout(()=>{show((cur+1)%3);auto()},6500)}
btns.forEach((b,i)=>b.addEventListener('click',()=>{show(i);auto()}));
show(0);auto();
</script></body></html>`;
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, html);
console.log("wrote", OUT, (html.length / 1024).toFixed(0) + "KB");
