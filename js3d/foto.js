// Standbilder der 3D-Modelle (für Armee-Liste, Popups, Mini-Symbole)
import { THREE, buildUnit } from './modelle.js';
import { GFREADY } from './glbfig.js';
import { cachedURL, saveFig } from './bildspeicher.js';
import { fieldModel } from './gelaende.js';
import { RoomEnvironment } from '../vendor/RoomEnvironment.js';
const ENVS = new WeakMap();
export function envFor(r) { if (!ENVS.has(r)) { const pm = new THREE.PMREMGenerator(r); ENVS.set(r, pm.fromScene(new RoomEnvironment(), .04).texture); } return ENVS.get(r); }

let R = null;
export function renderer() {
  if (R) return R;
  R = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
  R.setPixelRatio(1); R.outputColorSpace = THREE.SRGBColorSpace; R.toneMapping = THREE.NeutralToneMapping; R.toneMappingExposure = .9;
  return R;
}
export function lights(scene, r) {
  if (r) scene.environment = envFor(r);
  scene.add(new THREE.HemisphereLight(0xfff4dc, 0x3a3428, .35));
  const d = new THREE.DirectionalLight(0xfff0d8, 2.4); d.position.set(-2.5, 5, 6); scene.add(d);
  const fill = new THREE.DirectionalLight(0xd8e4ff, .7); fill.position.set(5, 2, 3); scene.add(fill);
  const rim = new THREE.DirectionalLight(0xffffff, 2.2); rim.position.set(2, 4, -6); scene.add(rim);
  return d;
}
// Kamera so setzen, dass das Modell das Bild füllt
export function frame(cam, obj, aspect, pad = 1.08, dir = new THREE.Vector3(.9, .55, 1.25)) {
  const box = new THREE.Box3().setFromObject(obj, true), c = box.getCenter(new THREE.Vector3()), s = box.getSize(new THREE.Vector3());
  cam.aspect = aspect;
  let dist = Math.max(s.x, s.y, s.z) * 2.2, tgt = c.clone();
  const pts = []; for (let i = 0; i < 8; i++) pts.push(new THREE.Vector3(i & 1 ? box.max.x : box.min.x, i & 2 ? box.max.y : box.min.y, i & 4 ? box.max.z : box.min.z));
  const nd = dir.clone().normalize();
  for (let it = 0; it < 6; it++) {           // Abstand und Mitte anpassen, bis das Modell genau ins Bild passt
    cam.position.copy(tgt).add(nd.clone().multiplyScalar(dist)); cam.lookAt(tgt); cam.near = dist / 30; cam.far = dist * 8; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9;
    for (const p of pts) { const q = p.clone().project(cam); x0 = Math.min(x0, q.x); x1 = Math.max(x1, q.x); y0 = Math.min(y0, q.y); y1 = Math.max(y1, q.y); }
    const k = Math.max((x1 - x0) / 2, (y1 - y0) / 2) * pad;
    const right = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(cam.matrixWorld, 1);
    const h = dist * Math.tan(THREE.MathUtils.degToRad(cam.fov / 2));
    tgt.add(right.multiplyScalar((x0 + x1) / 2 * h * aspect)).add(up.multiplyScalar((y0 + y1) / 2 * h));
    dist *= k;
  }
  cam.position.copy(tgt).add(nd.multiplyScalar(dist)); cam.lookAt(tgt); cam.updateProjectionMatrix();
}
export const ASPECT = { inf: 121 / 145, veh: 222 / 126, air: 222 / 126 };
// Ein Modell als Bild (Blob-URL)
// Fertige Bilder werden auf dem Gerät gespeichert (siehe bildspeicher.js): beim nächsten Laden sofort da.
export async function photo(key, side, h = 300) {
  const hit = await cachedURL(key, side, h); if (hit) return hit;
  const blob = await render(key, side, h); saveFig(key, side, h, blob);
  return URL.createObjectURL(blob);
}
async function render(key, side, h) {
  await GFREADY;
  const field = key.startsWith('feld:'), g = field ? fieldModel(key.slice(5)) : buildUnit(key, side), type = g.userData.type, a = ASPECT[type];
  if (type === 'inf') g.rotation.y = .55; else g.rotation.y = field ? -.3 : type === 'air' ? -.35 : -.25;
  const r = renderer(); const scene = new THREE.Scene(); lights(scene, r); scene.add(g);
  const cam = new THREE.PerspectiveCamera(26, a);
  frame(cam, g, a, type === 'inf' ? 1.1 : 1.0, type === 'inf' ? new THREE.Vector3(.15, .3, 1.3) : field ? new THREE.Vector3(.2, .75, 1.1) : new THREE.Vector3(.25, .5, 1.25));
  const w = Math.round(h * a);
  r.setPixelRatio(2); r.setSize(w, h, false); r.setClearColor(0, 0); r.render(scene, cam);
  return await new Promise(res => r.domElement.toBlob(res, 'image/png'));
}
