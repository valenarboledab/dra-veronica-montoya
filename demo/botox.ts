// Animación simple para pacientes: tres gotitas y la arruga se borra.
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {RoundedBoxGeometry} from 'three/examples/jsm/geometries/RoundedBoxGeometry.js';

const C = {skin: 0xf6ece2, fat: 0xeedcae, muscle: 0xc98f74, olive: 0x7f7a52, steel: 0xd9d6cc, drop: 0xb07a52, plate: 0xf3efe5};
const canvas = document.getElementById('c') as HTMLCanvasElement;
const say = document.getElementById('say')!;
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

const renderer = new THREE.WebGLRenderer({canvas, antialias: true, alpha: true});
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(32, 4 / 3, 0.1, 100);
camera.position.set(6.2, 5.0, 7.6);
const controls = new OrbitControls(camera, canvas);
controls.target.set(0, 1.15, 0);
controls.enableDamping = true;
controls.enablePan = false;
controls.minDistance = 6;
controls.maxDistance = 15;
controls.maxPolarAngle = Math.PI * 0.46;
controls.autoRotate = !still;
controls.autoRotateSpeed = 0.5;

scene.add(new THREE.HemisphereLight(0xfffaf0, 0xb8ae8a, 1.5));
const sun = new THREE.DirectionalLight(0xffffff, 2.1);
sun.position.set(4, 8, 5);
sun.castShadow = true;
sun.shadow.mapSize.set(1024, 1024);
sun.shadow.camera.left = -5;
sun.shadow.camera.right = 5;
sun.shadow.camera.top = 5;
sun.shadow.camera.bottom = -5;
sun.shadow.radius = 6;
scene.add(sun);

const mat = (color: number, rough = 0.75) => new THREE.MeshStandardMaterial({color, roughness: rough, metalness: 0});

// plato
const plate = new THREE.Mesh(new THREE.CylinderGeometry(3.4, 3.2, 0.18, 96), mat(C.plate, 0.6));
plate.position.y = -0.09;
plate.receiveShadow = true;
scene.add(plate);

// el "pastel" de piel: músculo, grasita y piel
const W = 3.6, D = 2.4;
const muscle = new THREE.Mesh(new RoundedBoxGeometry(W, 0.55, D, 4, 0.08), mat(C.muscle, 0.8));
muscle.position.y = 0.28;
const fat = new THREE.Mesh(new RoundedBoxGeometry(W, 0.45, D, 4, 0.08), mat(C.fat, 0.85));
fat.position.y = 0.78;
for (const m of [muscle, fat]) {
  m.castShadow = m.receiveShadow = true;
  scene.add(m);
}

// piel: caja con muchos segmentos para poder hundir la arruga
const skinGeo = new THREE.BoxGeometry(W, 0.32, D, 120, 4, 40);
const base = skinGeo.attributes.position.array.slice() as Float32Array;
const skin = new THREE.Mesh(skinGeo, mat(C.skin, 0.55));
skin.position.y = 1.16;
skin.castShadow = skin.receiveShadow = true;
scene.add(skin);

// la arruga: una V suave a lo largo de z en x = 0
function wrinkle(depth: number) {
  const pos = skinGeo.attributes.position as THREE.BufferAttribute;
  for (let i = 0; i < pos.count; i++) {
    const x = base[i * 3], y = base[i * 3 + 1];
    const t = (y + 0.16) / 0.32; // 0 abajo, 1 arriba
    const dip = depth * Math.exp(-((x / 0.18) ** 2)) * t;
    pos.setY(i, y - dip);
  }
  pos.needsUpdate = true;
  skinGeo.computeVertexNormals();
}

// jeringa
const syringe = new THREE.Group();
const needle = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.55, 8), new THREE.MeshStandardMaterial({color: 0xbfbfbf, metalness: 0.9, roughness: 0.25}));
needle.position.y = 0.275;
const hub = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.07, 0.12, 24), mat(C.olive, 0.5));
hub.position.y = 0.61;
const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.13, 0.13, 0.9, 32), new THREE.MeshPhysicalMaterial({color: 0xffffff, roughness: 0.1, transmission: 0.6, thickness: 0.2, transparent: true, opacity: 0.85}));
barrel.position.y = 1.12;
const liquid = new THREE.Mesh(new THREE.CylinderGeometry(0.105, 0.105, 0.5, 32), mat(C.drop, 0.4));
liquid.position.y = 0.94;
const flange = new THREE.Mesh(new RoundedBoxGeometry(0.5, 0.05, 0.18, 2, 0.02), mat(C.steel, 0.5));
flange.position.y = 1.58;
const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.4, 12), mat(C.steel, 0.5));
rod.position.y = 1.8;
const thumb = new THREE.Mesh(new THREE.CylinderGeometry(0.14, 0.14, 0.04, 32), mat(C.steel, 0.5));
thumb.position.y = 2.0;
syringe.add(needle, hub, barrel, liquid, flange, rod, thumb);
syringe.traverse((o) => ((o as THREE.Mesh).castShadow = true));
syringe.rotation.z = 0.12;
scene.add(syringe);

// tres puntos a lo largo de la arruga, y sus gotitas
const SPOTS = [-0.75, 0, 0.75].map((z) => new THREE.Vector3(0.22, 1.32, z));
const drops = SPOTS.map((p) => {
  const m = new THREE.Mesh(new THREE.SphereGeometry(0.11, 32, 16), new THREE.MeshStandardMaterial({color: C.drop, roughness: 0.25, emissive: C.drop, emissiveIntensity: 0.15}));
  m.position.copy(p).add(new THREE.Vector3(0, 0.02, 0));
  m.scale.setScalar(0.001);
  m.castShadow = true;
  scene.add(m);
  return m;
});

// brillito al final
const sparkle = new THREE.Mesh(new THREE.OctahedronGeometry(0.12), new THREE.MeshStandardMaterial({color: 0xffffff, emissive: 0xfff3d6, emissiveIntensity: 1}));
sparkle.position.set(-0.9, 1.75, 0.4);
sparkle.scale.setScalar(0.001);
scene.add(sparkle);

// línea de tiempo (segundos) de una vuelta completa
const ease = (t: number) => (t < 0 ? 0 : t > 1 ? 1 : t * t * (3 - 2 * t));
const seg = (t: number, a: number, b: number) => ease((t - a) / (b - a));
const UP = 0.5;
const LOOP = 11;
const lines: [number, string][] = [[0, 'Tres gotitas en tu piel…'], [6.2, '…y la arruga se va 🙂'], [9.6, '¡Listo! Vuelves a tu día']];

function frame(t: number) {
  // jeringa: viaja a cada punto, baja, sube
  let pos = SPOTS[0].clone().add(new THREE.Vector3(0, UP + 0.35, 0));
  let depthInto = 0;
  SPOTS.forEach((p, i) => {
    const t0 = 0.6 + i * 1.7;
    const arrive = seg(t, t0 - 0.9, t0);
    const prev = i === 0 ? SPOTS[0].clone().add(new THREE.Vector3(0, UP + 0.35, 0)) : SPOTS[i - 1].clone().add(new THREE.Vector3(0, UP, 0));
    if (t >= t0 - 0.9) pos = prev.clone().lerp(p.clone().add(new THREE.Vector3(0, UP, 0)), arrive);
    const down = seg(t, t0, t0 + 0.35) - seg(t, t0 + 0.75, t0 + 1.05);
    if (t >= t0) depthInto = down;
    drops[i].scale.setScalar(0.001 + seg(t, t0 + 0.35, t0 + 0.7) * (1 - seg(t, 9.6, 10.6)));
  });
  const leave = seg(t, 5.8, 7);
  pos.y += -depthInto * (UP + 0.1) + leave * 1.6;
  syringe.position.copy(pos);
  liquid.scale.y = 1 - 0.6 * seg(t, 0.8, 5);
  liquid.position.y = 0.69 + 0.25 * liquid.scale.y;
  // la arruga se va
  wrinkle(0.2 * (1 - seg(t, 6.2, 8.4)) + 0.2 * seg(t, 10.3, 11));
  sparkle.scale.setScalar(0.001 + (seg(t, 8.2, 8.8) - seg(t, 9.8, 10.4)));
  sparkle.rotation.y = t * 2;
  let text = lines[0][1];
  for (const [at, s] of lines) if (t >= at) text = s;
  if (say.textContent !== text) say.textContent = text;
}

function resize() {
  const {clientWidth: w, clientHeight: h} = canvas;
  if (canvas.width !== Math.round(w * renderer.getPixelRatio()) || canvas.height !== Math.round(h * renderer.getPixelRatio())) {
    renderer.setSize(w, h, false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
}

let visible = true;
new IntersectionObserver(([e]) => (visible = e.isIntersecting)).observe(canvas);
let t = 0, last = performance.now();
renderer.setAnimationLoop(() => {
  if (!visible) return;
  resize();
  const now = performance.now(), dt = Math.min((now - last) / 1000, 1 / 20);
  last = now;
  if (still) frame(9.7);
  else {
    t = (t + dt) % LOOP;
    frame(t);
  }
  controls.update();
  renderer.render(scene, camera);
});
