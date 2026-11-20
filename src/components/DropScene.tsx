import {useEffect, useRef} from 'react';
import * as THREE from 'three';
import {RoomEnvironment} from 'three/examples/jsm/environments/RoomEnvironment.js';
import {clamp} from '../lib/math';
import {onFrame} from '../lib/scroll';

/**
 * Hero al estilo Colibrí: un vial flota de frente, como un colibrí sosteniendo
 * su lugar, sobre bokeh verde y durazno. La palabra gigante vive dentro de la
 * escena 3D, detrás del vial, así que se ve refractada a través del vidrio.
 */

const FONT = "600 380px Satoshi, 'Plus Jakarta Sans', Inter, sans-serif";

function bokehTexture() {
  const c = document.createElement('canvas');
  c.width = 1600;
  c.height = 1000;
  const g = c.getContext('2d')!;
  const bg = g.createLinearGradient(0, 0, c.width, c.height);
  bg.addColorStop(0, '#fbe5da');
  bg.addColorStop(0.55, '#fdf1eb');
  bg.addColorStop(1, '#eef3ea');
  g.fillStyle = bg;
  g.fillRect(0, 0, c.width, c.height);
  // degradados radiales en vez de ctx.filter: Safari (iPhone) ignora el blur del canvas
  const blobs: [number, number, number, string][] = [
    [0.12, 0.22, 230, 'rgba(159,191,152,0.55)'],
    [0.86, 0.18, 190, 'rgba(246,205,185,0.9)'],
    [0.78, 0.8, 260, 'rgba(159,191,152,0.45)'],
    [0.2, 0.84, 210, 'rgba(246,205,185,0.85)'],
    [0.5, 0.5, 300, 'rgba(255,255,255,0.7)'],
    [0.64, 0.36, 90, 'rgba(231,134,108,0.28)'],
    [0.34, 0.3, 70, 'rgba(255,255,255,0.9)'],
  ];
  for (const [x, y, r, col] of blobs) {
    const rg = g.createRadialGradient(x * c.width, y * c.height, 0, x * c.width, y * c.height, r * 1.6);
    rg.addColorStop(0, col);
    rg.addColorStop(1, col.replace(/[\d.]+\)$/, '0)'));
    g.fillStyle = rg;
    g.fillRect(0, 0, c.width, c.height);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

function wordTexture(word: string) {
  const c = document.createElement('canvas');
  c.width = 2400;
  c.height = 640;
  const g = c.getContext('2d')!;
  g.fillStyle = '#1e1816';
  g.font = FONT;
  // encoge la letra si la palabra es larga, para que quepa siempre
  const fit = Math.min(1, 2200 / g.measureText(word).width);
  if (fit < 1) g.font = FONT.replace('380px', `${Math.floor(380 * fit)}px`);
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  // tracking cerrado como el resto de títulos
  (g as CanvasRenderingContext2D & {letterSpacing: string}).letterSpacing = '-18px';
  g.fillText(word, c.width / 2, c.height / 2 + 20);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

function labelTexture() {
  const c = document.createElement('canvas');
  c.width = 1024;
  c.height = 256;
  const g = c.getContext('2d')!;
  g.fillStyle = '#fbf7f4';
  g.fillRect(0, 0, c.width, c.height);
  g.fillStyle = '#e7866c';
  g.fillRect(0, 40, c.width, 6);
  g.fillRect(0, c.height - 46, c.width, 6);
  g.fillStyle = '#cbc3bf';
  for (let i = 0; i < 4; i++) g.fillRect(380, 96 + i * 18, 260 - i * 50, 4);
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  return t;
}

/** Vial de vidrio con la toxina liofilizada al fondo, etiqueta y tapa coral. */
function buildVial() {
  const vial = new THREE.Group();
  const pts = [
    [0, 0], [0.46, 0], [0.5, 0.04], [0.5, 1.42], [0.47, 1.56], [0.36, 1.66], [0.31, 1.7],
    [0.31, 1.86], [0.36, 1.88], [0.36, 1.98], [0.0, 1.98],
  ].map(([x, y]) => new THREE.Vector2(x, y));
  vial.add(
    new THREE.Mesh(
      new THREE.LatheGeometry(pts, 96),
      new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        transmission: 1,
        thickness: 0.12,
        roughness: 0,
        ior: 1.5,
        clearcoat: 1,
        clearcoatRoughness: 0.05,
        attenuationColor: new THREE.Color('#f3efe9'),
        attenuationDistance: 8,
      }),
    ),
  );
  const cake = new THREE.Mesh(new THREE.CylinderGeometry(0.43, 0.43, 0.16, 64), new THREE.MeshStandardMaterial({color: 0xffffff, roughness: 0.95}));
  cake.position.y = 0.12;
  const label = new THREE.Mesh(
    new THREE.CylinderGeometry(0.506, 0.506, 0.62, 96, 1, true),
    new THREE.MeshStandardMaterial({map: labelTexture(), roughness: 0.6}),
  );
  label.position.y = 0.78;
  label.rotation.y = Math.PI;
  const crimp = new THREE.Mesh(new THREE.CylinderGeometry(0.385, 0.385, 0.3, 64), new THREE.MeshStandardMaterial({color: 0xd8d4d0, metalness: 1, roughness: 0.28}));
  crimp.position.y = 1.88;
  const flip = new THREE.Mesh(new THREE.CylinderGeometry(0.36, 0.37, 0.1, 64), new THREE.MeshPhysicalMaterial({color: 0xe7866c, roughness: 0.35, clearcoat: 0.6}));
  flip.position.y = 2.08;
  vial.add(cake, label, crimp, flip);
  vial.position.y = -1.08;
  const holder = new THREE.Group();
  holder.add(vial);
  return holder;
}

function buildMotes() {
  const n = 70;
  const pos = new Float32Array(n * 3);
  const seed = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const a = Math.random() * Math.PI * 2;
    const r = 0.9 + Math.random() * 1.6;
    pos[i * 3] = Math.cos(a) * r;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 3;
    pos[i * 3 + 2] = Math.sin(a) * r * 0.6;
    seed[i] = Math.random();
  }
  const geo = new THREE.BufferGeometry();
  geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const dot = document.createElement('canvas');
  dot.width = dot.height = 64;
  const g = dot.getContext('2d')!;
  const rg = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  rg.addColorStop(0, 'rgba(255,255,255,1)');
  rg.addColorStop(0.4, 'rgba(255,236,226,0.6)');
  rg.addColorStop(1, 'rgba(255,236,226,0)');
  g.fillStyle = rg;
  g.fillRect(0, 0, 64, 64);
  const mat = new THREE.PointsMaterial({
    size: 0.07,
    map: new THREE.CanvasTexture(dot),
    transparent: true,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
  });
  return {points: new THREE.Points(geo, mat), seed};
}

/** Gota 3D con una palabra detrás que cambia (se usa en Tratamientos). */
export function DropScene({word, reduced}: {word: string; reduced: boolean}) {
  const root = useRef<HTMLDivElement>(null);
  const mount = useRef<HTMLDivElement>(null);
  const wordRef = useRef(word);
  const repaint = useRef<() => void>(() => {});
  useEffect(() => {
    wordRef.current = word;
    repaint.current();
  }, [word]);

  useEffect(() => {
    const el = mount.current;
    const section = root.current;
    if (!el || !section) return;

    // La escena 3D se monta solo cuando la sección se acerca, para no frenar la carga del video.
    let teardown: (() => void) | null = null;
    const near = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting && !teardown) {
          teardown = init(el, section);
          near.disconnect();
        }
      },
      {rootMargin: '600px 0px'},
    );
    near.observe(section);
    return () => {
      near.disconnect();
      teardown?.();
    };
  }, [reduced]);

  function init(el: HTMLDivElement, section: HTMLElement) {
    let disposed = false;
    const renderer = new THREE.WebGLRenderer({antialias: true, powerPreference: 'high-performance'});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.05;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    el.appendChild(renderer.domElement);
    renderer.domElement.setAttribute('aria-hidden', 'true');

    const scene = new THREE.Scene();
    scene.background = bokehTexture();
    const pmrem = new THREE.PMREMGenerator(renderer);
    scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

    const camera = new THREE.PerspectiveCamera(30, 1, 0.1, 50);
    camera.position.set(0, 0.05, 5.6);

    const key = new THREE.DirectionalLight(0xfff4ec, 1.6);
    key.position.set(3, 4, 5);
    scene.add(key, new THREE.AmbientLight(0xffffff, 0.35));

    // la palabra, detrás del vial (opaca con alphaTest para que el vidrio la refracte)
    const wordMat = new THREE.MeshBasicMaterial({transparent: false, alphaTest: 0.5, toneMapped: false});
    const word = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), wordMat);
    word.position.z = -1.6;
    scene.add(word);
    const paintWord = () => {
      wordMat.map?.dispose();
      wordMat.map = wordTexture(wordRef.current);
      wordMat.needsUpdate = true;
    };
    paintWord();
    repaint.current = () => {
      paintWord();
      if (reduced) requestAnimationFrame(() => draw(0));
    };
    document.fonts?.ready.then(() => !disposed && paintWord());

    const vial = buildVial();
    scene.add(vial);
    const motes = buildMotes();
    scene.add(motes.points);
    const base = Float32Array.from(motes.points.geometry.attributes.position.array as Float32Array);

    const resize = () => {
      const w = el.clientWidth;
      const h = el.clientHeight;
      if (!w || !h) return;
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      // la palabra ocupa casi todo el ancho visible a su profundidad
      const dist = camera.position.z - word.position.z;
      const visH = 2 * Math.tan((camera.fov * Math.PI) / 360) * dist;
      const visW = visH * camera.aspect;
      const ww = Math.min(visW * 0.96, visH * 3.2);
      word.scale.set(ww, ww * (640 / 2400), 1);
      word.position.y = 0.05;
      const s = camera.aspect < 0.9 ? 0.95 : 1.15;
      vial.scale.setScalar(s);
    };
    const ro = new ResizeObserver(resize);
    ro.observe(el);
    resize();

    let visible = false;
    const io = new IntersectionObserver(([e]) => (visible = e.isIntersecting), {rootMargin: '100px'});
    io.observe(section);

    const draw = (time: number) => {
      const t = time / 1000;
      const rect = section.getBoundingClientRect();
      const p = clamp((window.innerHeight - rect.top) / (window.innerHeight + rect.height));
      // sostiene su lugar como un colibrí: oscilación corta y un giro lento con el scroll
      vial.position.y = 0.05 + (reduced ? 0 : Math.sin(t * 1.7) * 0.05 + Math.sin(t * 0.6) * 0.03);
      vial.rotation.y = reduced ? 0.4 : Math.sin(t * 0.45) * 0.3 + (p - 0.5) * 1.6;
      vial.rotation.z = reduced ? 0 : Math.sin(t * 0.8) * 0.05;
      vial.rotation.x = 0;
      if (!reduced) {
        const arr = motes.points.geometry.attributes.position.array as Float32Array;
        for (let i = 0; i < motes.seed.length; i++) {
          const s = motes.seed[i];
          arr[i * 3 + 1] = ((base[i * 3 + 1] + t * (0.05 + s * 0.08) + 1.5) % 3) - 1.5;
          arr[i * 3] = base[i * 3] + Math.sin(t * 0.7 + s * 9) * 0.05;
        }
        motes.points.geometry.attributes.position.needsUpdate = true;
      }
      renderer.render(scene, camera);
    };

    let off = () => {};
    if (reduced) {
      requestAnimationFrame(() => draw(0));
      document.fonts?.ready.then(() => !disposed && requestAnimationFrame(() => draw(0)));
    } else {
      off = onFrame((time) => visible && draw(time));
    }

    return () => {
      disposed = true;
      off();
      ro.disconnect();
      io.disconnect();
      pmrem.dispose();
      renderer.dispose();
      renderer.domElement.remove();
    };
  }

  return (
    <div ref={root} className="relative size-full overflow-hidden rounded-[2rem]">
      <div ref={mount} className="absolute inset-0 [&>canvas]:block [&>canvas]:size-full" />
    </div>
  );
}
