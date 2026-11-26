// 3D-Spieltisch: die generierte Karte als Klemmbaustein-Diorama
// Jedes Feld = Bauplatte mit Gelände-Modell; Missionsziele als Fahnen, Startkanten als farbige Streifen.
// Antippen eines Feldes öffnet dieselbe Info wie in der 2D-Karte. Gerendert wird nur bei Bewegung (spart Akku).
import { THREE, brick, slope, plastic, insignia } from './modelle.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { lights, envFor } from './foto.js';
import { TERRAIN, terrain, G, HALF, sandbag, R } from './gelaende.js';

const CELL = 1.6, GAP = .06;
function flag(g, y = 0) {
  const f = G(); f.position.set(.55, y, -.55); g.add(f);
  brick(f, .05, 1.4, .05, 0xd8d0bc, 0, .7, 0, { studs: false });
  const cloth = new THREE.Mesh(new THREE.PlaneGeometry(.5, .32, 8, 1), new THREE.MeshStandardMaterial({ color: 0xc91a1a, side: THREE.DoubleSide, roughness: .5 })); cloth.position.set(.26, 1.24, 0); f.add(cloth);
  f.userData.cloth = cloth; return f;
}
function extProp(g, name) {
  const e = G(); e.position.set(-.5, 0, .5); g.add(e);
  if (/Stachel/.test(name)) { for (let i = 0; i < 3; i++) brick(e, .04, .2, .04, 0x5a4a3a, i * .25, .1, 0, { studs: false }); }
  else if (/Auto|Jeep/.test(name)) { brick(e, .6, .2, .32, /Jeep/.test(name) ? 0x5f6b3a : 0x2a3a5a, 0, .2, 0); brick(e, .3, .14, .3, 0x9fd2ea, -.05, .37, 0, { studs: false }); for (const x of [-.2, .2]) for (const z of [-.17, .17]) { const w = new THREE.Mesh(new THREE.CylinderGeometry(.08, .08, .05, 14), plastic(0x1b1b1b)); w.rotation.x = HALF; w.position.set(x, .08, z); e.add(w); } }
  else if (/Flugzeug/.test(name)) { brick(e, .7, .18, .2, 0x7a7a72, 0, .1, 0, { rot: [0, .3, .15] }); brick(e, .2, .05, .7, 0x6a6a62, .05, .1, 0, { rot: [0, .3, -.2] }); }
  else if (/Kutsche/.test(name)) { brick(e, .5, .25, .32, 0x6b4a2a, 0, .2, 0); for (const x of [-.2, .2]) { const w = new THREE.Mesh(new THREE.TorusGeometry(.1, .02, 6, 14), plastic(0x3a2a1a)); w.position.set(x, .1, .17); e.add(w); } }
  else { for (let i = 0; i < 4; i++) sandbag(e, i * .17, .07, 0); }
  return e;
}

// Schwebendes Schild (zeigt immer zur Kamera, liegt über allem)
function tag(text, bg, fg = '#fff') {
  const c = document.createElement('canvas'), x = c.getContext('2d'), f = '700 44px "Stardos Stencil","Black Ops One",Impact,sans-serif';
  x.font = f; const tw = Math.ceil(x.measureText(text).width); c.width = tw + 56; c.height = 76;
  x.font = f; x.fillStyle = 'rgba(0,0,0,.45)'; x.beginPath(); x.roundRect(4, 8, c.width - 8, 64, 14); x.fill();
  x.fillStyle = bg; x.beginPath(); x.roundRect(2, 2, c.width - 8, 64, 14); x.fill(); x.strokeStyle = 'rgba(0,0,0,.6)'; x.lineWidth = 4; x.stroke();
  x.fillStyle = fg; x.textBaseline = 'middle'; x.fillText(text, 26, 36);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4;
  const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: t, depthTest: false, transparent: true })); sp.renderOrder = 10;
  const h = .42; sp.scale.set(h * c.width / c.height, h, 1); return sp;
}
// ---------- Szene ----------
let S3 = null;
function setup(box) {
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true, logarithmicDepthBuffer: true });   // Bild bleibt stehen, auch wenn nur bei Bewegung gezeichnet wird
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = .95;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  box.appendChild(r.domElement);
  const scene = new THREE.Scene(); lights(scene, r);
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.6); sun.position.set(-6, 12, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40 }); sun.shadow.bias = -.0008; scene.add(sun);
  const cam = new THREE.PerspectiveCamera(35, 1, 1, 120);   // größeres near = genauere Tiefe (weniger Flackern am Handy)
  const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.maxPolarAngle = 1.35; ctl.minDistance = 4; ctl.maxDistance = 40; ctl.enablePan = true;
  ctl.addEventListener('change', () => S3 && (S3.dirty = true));
  S3 = { r, scene, cam, ctl, box, board: null, dirty: true, flags: [] };
  // Antippen = Feld-Info (nur wenn nicht gezogen wurde)
  let down = null;
  // Erst beim echten Klick öffnen: bei 'pointerup' würde am Handy der nachfolgende Klick das Fenster gleich wieder schließen
  let moved = 0, multi = false;
  r.domElement.addEventListener('pointerdown', e => { if (e.isPrimary) { down = [e.clientX, e.clientY]; moved = 0; multi = false; } else multi = true; });
  r.domElement.addEventListener('pointermove', e => { if (down && e.isPrimary) moved = Math.max(moved, Math.hypot(e.clientX - down[0], e.clientY - down[1])); });
  r.domElement.addEventListener('click', e => {
    if (!down || multi || Math.max(moved, Math.hypot(e.clientX - down[0], e.clientY - down[1])) > (e.pointerType === 'mouse' ? 6 : 14)) return;
    down = null;
    const rc = new THREE.Raycaster(), b = r.domElement.getBoundingClientRect();
    rc.setFromCamera(new THREE.Vector2((e.clientX - b.left) / b.width * 2 - 1, -(e.clientY - b.top) / b.height * 2 + 1), cam);
    const hit = rc.intersectObjects(S3.board ? [S3.board] : [], true)[0]; if (!hit) return;
    let o = hit.object; while (o && o.userData.pi == null) o = o.parent;
    if (o && o.userData.tap) { const el = document.querySelector(`#map .cell[data-pi="${o.userData.pi}"]`); if (el) el.click(); }
  });
  new ResizeObserver(resize).observe(box); resize();
  (function loop() { requestAnimationFrame(loop); if (!S3 || box.offsetParent === null || document.hidden) return; const t = performance.now() / 1000; ctl.update();
    for (const f of S3.flags) { const p = f.userData.cloth.geometry.attributes.position; for (let i = 0; i < p.count; i++) { const x = p.getX(i) + .25; p.setZ(i, Math.sin(t * 5 + x * 9) * .05 * x * 2); } p.needsUpdate = true; S3.dirty = true; }
    if (S3.dirty) { r.render(scene, cam); S3.dirty = false; } })();
}
function resize() { if (!S3) return; const w = S3.box.clientWidth, h = S3.box.clientHeight; if (!w || !h) return; S3.r.setSize(w, h, false); S3.cam.aspect = w / h; S3.cam.updateProjectionMatrix(); S3.dirty = true; }

function build() {
  if (typeof current === 'undefined' || !current || current.error) return;
  const box = document.getElementById('map3d'); if (!box) return;
  if (!S3) setup(box);
  if (S3.board) { S3.scene.remove(S3.board); S3.board.traverse(o => { if (o.geometry && !o.geometry.parameters?.cached) o.geometry.dispose?.(); }); }
  S3.flags = [];
  const board = G(); S3.board = board; S3.scene.add(board);
  const port = typeof isPortrait === 'function' ? isPortrait() : box.clientHeight > box.clientWidth;   // gleiche Drehung wie die 2D-Karte
  box.classList.toggle('quer', !port); resize();
  // Rastermaße; hochkant wird das Brett gedreht (lange Seite nach hinten)
  const W = COLS * CELL, D = ROWS * CELL;
  const toXZ = (r, c) => [(c + .5) * CELL - W / 2, (r + .5) * CELL - D / 2];
  // Tischplatte
  brick(board, W + 1.2, .2, D + 1.2, 0x3a2e22, 0, -.14, 0, { studs: false }).children[0].receiveShadow = true;
  for (const sz of [-1, 1]) { brick(board, W + 1.2, .22, .2, 0x5a4030, 0, .0, sz * (D / 2 + .5)); brick(board, .2, .22, D + .8, 0x5a4030, sz * (W / 2 + .5), .0, 0); }
  const ms = typeof missionSetup === 'function' ? missionSetup() : null;
  current.pieces.forEach((x, pi) => {
    const rs = x.cells.map(i => Math.floor(i / COLS)), cs = x.cells.map(i => i % COLS);
    const r0 = Math.min(...rs), r1 = Math.max(...rs), c0 = Math.min(...cs), c1 = Math.max(...cs);
    const w = (c1 - c0 + 1) * CELL - GAP, d = (r1 - r0 + 1) * CELL - GAP;
    const [x0, z0] = toXZ(r0, c0), [x1, z1] = toXZ(r1, c1);
    const g = G(); g.position.set((x0 + x1) / 2, 0, (z0 + z1) / 2); board.add(g);
    const plate = brick(g, w, .08, d, TERRAIN[x.p.key] || 0x86a84a, 0, -.04, 0); plate.traverse(o => o.receiveShadow = true);
    const t = G(); t.position.y = .025; g.add(t); terrain(x.p.key, t, w, d);
    if (x.p.key === 'strand' && g.position.x < 0) t.rotation.y = Math.PI;   // Wasser zum Kartenrand
    if (x.p.key === 'zug') { const p = w > d ? g.position.z : g.position.x; if (p > .01) t.rotation.y = Math.PI; }   // Gleis zum Kartenrand
    if (x.p.key === 'kirche') { const p = w > d ? g.position.z : g.position.x; if (p > .01) t.rotation.y = Math.PI; }   // Kirchenportal zur Kartenmitte drehen
    t.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
    const oi = ms ? ms.objectives.indexOf(x) : -1, ex = ms && ms.exts ? ms.exts.find(e => e.p === x) : null;
    if (oi >= 0) { const f = flag(g, .02); f.scale.setScalar(1.35); S3.flags.push(f); const o = ms.objInfo[oi];
      const tg = tag('⚑ ' + (o.flex ? o.name : 'Ziel'), '#b3261a'); tg.position.set(0, 2.3, 0); g.add(tg); }
    if (ex) { extProp(g, ex.name); const tg = tag(ex.name, '#e2b33a', '#1b1b14'); tg.position.set(0, oi >= 0 ? 1.8 : 1.6, .2); g.add(tg); }
    const rule = typeof RULES !== 'undefined' && RULES.felder && RULES.felder[x.p.key] && RULES.felder[x.p.key].regel;
    g.userData.pi = pi; g.userData.tap = true;
  });
  // Startkanten: farbige Streifen am Brettrand
  if (ms) for (const side of ['de', 'al']) ms.edges[side].forEach((e, k) => {
    const col = side === 'de' ? 0x7d93ad : 0x9aae4a, long = e.e === 'top' || e.e === 'bottom', len = long ? (e.part === 'all' ? W : W / 2) : D;
    const off = long && e.part !== 'all' ? (e.part === 'start' ? -W / 4 : W / 4) : 0;
    const x = e.e === 'left' ? -W / 2 - .3 : e.e === 'right' ? W / 2 + .3 : off, z = e.e === 'top' ? -D / 2 - .3 : e.e === 'bottom' ? D / 2 + .3 : 0;
    brick(board, long ? len - .1 : .4, .12, long ? .4 : len - .1, col, x, .08, z);
    const inward = e.e === 'left' ? 0 : e.e === 'right' ? Math.PI : e.e === 'top' ? -HALF : HALF;   // Pfeile zeigen ins Feld
    const n = Math.max(2, Math.round(len / 1.6));
    for (let i = 0; i < n; i++) { const a = new THREE.Mesh(new THREE.ConeGeometry(.11, .22, 3), plastic(0xf4f0e0)); a.rotation.set(0, inward, -HALF); a.rotation.order = 'YXZ';
      const t = -len / 2 + (i + .5) * len / n; a.position.set(long ? x + t : x, .22, long ? z : z + t); board.add(a); }
    if (k === 0) { const ins = insignia(board, side, .36, x, .21, z, 0, -HALF); ins.position.set(long ? x + len * .5 / n : x, .22, long ? z : z + len * .5 / n); }
  });
  // Kamera: Anflug von schräg oben
  const asp = box.clientWidth / Math.max(1, box.clientHeight), target = new THREE.Vector3(0, 0, 0), dist = Math.max(W, D) * (port ? 1.95 : 1.05 * Math.max(1, 1.8 / asp));   // Abstand passt sich dem Fenster an (auch gedreht)
  const endPos = port ? new THREE.Vector3(0, dist * .66, dist * .56) : new THREE.Vector3(0, dist * .62, dist * .62);
  if (port) board.rotation.y = HALF;
  S3.ctl.target.copy(target);
  if (window.gsap && !matchMedia('(prefers-reduced-motion:reduce)').matches) { S3.cam.position.set(endPos.x - dist * .6, endPos.y * 1.6, endPos.z + dist * .4); gsap.to(S3.cam.position, { x: endPos.x, y: endPos.y, z: endPos.z, duration: 1.1, ease: 'power3.out', onUpdate: () => { S3.cam.lookAt(target); S3.dirty = true; } }); }
  else S3.cam.position.copy(endPos);
  S3.cam.lookAt(target); S3.dirty = true;
}

// ---------- Einbau in den Karte-Tab: 2D ist Standard, kleiner Umschalter oben rechts ----------
const KEY = 'sitzkrieg-3d';
let on = false; try { on = localStorage.getItem(KEY) === '1'; } catch (e) { }
const map = document.getElementById('map');
const box = document.createElement('div'); box.id = 'map3d';
// Karte + 3D-Tisch in einer gemeinsamen Hülle; Knöpfe (Drehen + 2D/3D) sitzen oben rechts auf der Ecke, in beiden Ansichten an derselben Stelle
const wrap = document.createElement('div'); wrap.id = 'map-wrap'; map.before(wrap); wrap.append(map, box);
const tools = document.createElement('div'); tools.id = 'map-tools'; wrap.appendChild(tools);
const rot = document.getElementById('rot'); if (rot) { rot.textContent = '↻'; rot.title = 'Karte drehen'; rot.setAttribute('aria-label', 'Karte drehen'); tools.appendChild(rot); }
const sw = document.createElement('button'); sw.type = 'button'; sw.className = 'sec v3d-sw'; tools.appendChild(sw);
sw.onclick = e => { e.stopPropagation(); on = !on; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (er) { } apply(); };
function apply() { document.body.classList.toggle('map3d-on', on); sw.textContent = on ? '2D' : '3D'; sw.title = on ? 'Zurück zur 2D-Karte' : 'Als 3D-Spieltisch anzeigen'; if (on) requestAnimationFrame(build); else if (typeof render === 'function') requestAnimationFrame(() => render()); }   // 2D neu vermessen
let t = null; new MutationObserver(() => { if (!on) return; clearTimeout(t); t = setTimeout(build, 30); }).observe(map, { childList: true });
apply();
