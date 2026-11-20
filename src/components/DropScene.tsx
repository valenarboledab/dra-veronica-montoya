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
  bg.addColorStop(1, '#fbe5da');
  g.fillStyle = bg;
  g.fillRect(0, 0, c.width, c.height);
  g.filter = 'blur(46px)';
  const blobs: [number, number, number, string][] = [
    [0.12, 0.22, 230, 'rgba(229,154,161,0.42)'],
    [0.86, 0.18, 190, 'rgba(246,205,185,0.9)'],
    [0.78, 0.8, 260, 'rgba(231,134,108,0.32)'],
    [0.2, 0.84, 210, 'rgba(246,205,185,0.85)'],
    [0.5, 0.5, 300, 'rgba(255,255,255,0.7)'],
    [0.64, 0.36, 90, 'rgba(231,134,108,0.28)'],
    [0.34, 0.3, 70, 'rgba(255,255,255,0.9)'],
  ];
  for (const [x, y, r, col] of blobs) {
    g.fillStyle = col;
    g.beginPath();
    g.arc(x * c.width, y * c.height, r, 0, Math.PI * 2);
    g.fill();
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

/**
 * La gota: una esfera de líquido que tiembla como agua, con una red molecular
 * en oro rosa flotando adentro (la toxina, estilizada). Colores de la marca.
 */
function buildDrop() {
  const group = new THREE.Group();

  const geo = new THREE.IcosahedronGeometry(1, 28);
  const base = Float32Array.from(geo.attributes.position.array as Float32Array);
  const liquid = new THREE.Mesh(
    geo,
    new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transmission: 1,
      thickness: 1.1,
      roughness: 0,
      ior: 1.33,
      clearcoat: 1,
      clearcoatRoughness: 0,
      iridescence: 0.55,
      iridescenceIOR: 1.3,
      iridescenceThicknessRange: [180, 520],
      attenuationColor: new THREE.Color('#eea488'),
      attenuationDistance: 1.5,
      specularIntensity: 1,
      envMapIntensity: 1.3,
    }),
  );
  group.add(liquid);

  // red molecular: vértices de un icosaedro subdividido, unidos a sus vecinos más cercanos
  const nodes: THREE.Vector3[] = [];
  const ico = new THREE.IcosahedronGeometry(0.58, 1);
  const pos = ico.attributes.position;
  const seen = new Set<string>();
  for (let i = 0; i < pos.count; i++) {
    const v = new THREE.Vector3().fromBufferAttribute(pos, i);
    const k = v.toArray().map((n) => n.toFixed(3)).join(',');
    if (seen.has(k)) continue;
    seen.add(k);
    v.multiplyScalar(0.92 + Math.random() * 0.16);
    nodes.push(v);
  }
  const metal = new THREE.MeshPhysicalMaterial({color: 0xe8a98f, metalness: 1, roughness: 0.22, clearcoat: 0.5});
  const balls = new THREE.InstancedMesh(new THREE.SphereGeometry(0.068, 24, 16), metal, nodes.length);
  const m = new THREE.Matrix4();
  nodes.forEach((v, i) => balls.setMatrixAt(i, m.makeTranslation(v.x, v.y, v.z)));
  const edges: [number, number][] = [];
  nodes.forEach((v, i) => {
    nodes
      .map((w, j) => [j, v.distanceTo(w)] as [number, number])
      .filter(([j]) => j > i)
      .sort((x, y) => x[1] - y[1])
      .slice(0, 2)
      .forEach(([j, d]) => d < 0.42 && edges.push([i, j]));
  });
  const sticks = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.02, 0.02, 1, 10), metal, edges.length);
  const up = new THREE.Vector3(0, 1, 0);
  edges.forEach(([i, j], n) => {
    const a = nodes[i];
    const b = nodes[j];
    const mid = a.clone().add(b).multiplyScalar(0.5);
    const dir = b.clone().sub(a);
    const q = new THREE.Quaternion().setFromUnitVectors(up, dir.clone().normalize());
    sticks.setMatrixAt(n, m.compose(mid, q, new THREE.Vector3(1, dir.length(), 1)));
  });
  const molecule = new THREE.Group();
  molecule.add(balls, sticks);
  group.add(molecule);

  // burbujitas suspendidas dentro del líquido
  const bub = new THREE.InstancedMesh(
    new THREE.SphereGeometry(1, 12, 8),
    new THREE.MeshPhysicalMaterial({color: 0xffffff, transmission: 1, roughness: 0, thickness: 0.05, ior: 1.1}),
    26,
  );
  for (let i = 0; i < 26; i++) {
    const v = new THREE.Vector3().randomDirection().multiplyScalar(0.2 + Math.random() * 0.7);
    const r = 0.008 + Math.random() * 0.018;
    bub.setMatrixAt(i, m.compose(v, new THREE.Quaternion(), new THREE.Vector3(r, r, r)));
  }
  group.add(bub);

  /** Tiembla como líquido: ondas suaves sobre la superficie. */
  const wobble = (t: number, amp: number) => {
    const arr = geo.attributes.position.array as Float32Array;
    for (let i = 0; i < arr.length; i += 3) {
      const x = base[i];
      const y = base[i + 1];
      const z = base[i + 2];
      const w =
        Math.sin(x * 3.1 + t * 1.3) * 0.5 +
        Math.sin(y * 2.7 - t * 1.1) * 0.35 +
        Math.sin(z * 3.6 + t * 0.9 + y * 1.5) * 0.25;
      const k = 1 + w * amp;
      arr[i] = x * k;
      arr[i + 1] = y * k * 1.02;
      arr[i + 2] = z * k;
    }
    geo.attributes.position.needsUpdate = true;
    geo.computeVertexNormals();
  };

  return {group, molecule, wobble};
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

    const drop = buildDrop();
    const vial = drop.group;
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
      word.position.y = 0.62;
      const s = camera.aspect < 0.9 ? 0.6 : 0.74;
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
      vial.position.y = -0.32 + (reduced ? 0 : Math.sin(t * 1.7) * 0.05 + Math.sin(t * 0.6) * 0.03);
      vial.rotation.y = reduced ? 0.4 : Math.sin(t * 0.45) * 0.3 + (p - 0.5) * 1.6;
      vial.rotation.z = reduced ? 0 : Math.sin(t * 0.8) * 0.05;
      vial.rotation.x = reduced ? 0.2 : 0.25 + Math.sin(t * 0.35) * 0.08;
      drop.molecule.rotation.y = reduced ? 0.6 : t * 0.18;
      drop.molecule.rotation.x = reduced ? 0.3 : Math.sin(t * 0.25) * 0.4;
      drop.wobble(reduced ? 0 : t, reduced ? 0 : 0.018);
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
