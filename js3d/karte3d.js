// 3D-Spieltisch: die generierte Karte als Klemmbaustein-Diorama
// Jedes Feld = Bauplatte mit Gelände-Modell; Missionsziele als Fahnen, Startkanten als farbige Streifen.
// Antippen eines Feldes öffnet dieselbe Info wie in der 2D-Karte. Gerendert wird nur bei Bewegung (spart Akku).
import { THREE, brick, slope, plastic, insignia } from './modelle.js';
import { OrbitControls } from '../vendor/OrbitControls.js';
import { lights, envFor } from './foto.js';

const CELL = 1.6, GAP = .06;
const TERRAIN = { wald: 0x4f7a34, flach: 0x86a84a, zug: 0x8a8a5a, farm: 0x9cae5a, turm: 0x7f9a46, bunker: 0x7d8a5a, strand: 0xd9c591, wohn: 0x8fa357, graben: 0x6e5a3e, hafen: 0x3f6f8f, see: 0x4a86a8, strasse: 0x8b8a84, ruine: 0x7a6e62, kirche: 0x8d8478 };
const R = Math.random;

// ---------- Gelände-Modelle (Mittelpunkt 0,0; Fläche w x d) ----------
function tree(g, x, z, s = 1) {
  brick(g, .14 * s, .42 * s, .14 * s, 0x6b4a2a, x, .21 * s, z, { studs: false });
  const pine = R() < .5, c1 = pine ? 0x2c5a26 : 0x3f7a2e, c2 = pine ? 0x24481f : 0x4f8a36;
  if (pine) for (let i = 0; i < 4; i++) { const w = (.66 - i * .14) * s; brick(g, w, .16 * s, w, i % 2 ? c1 : c2, x, (.48 + i * .16) * s, z); }
  else { const m = new THREE.Mesh(new THREE.SphereGeometry(.34 * s, 18, 12), plastic(c1)); m.position.set(x, .72 * s, z); m.scale.y = .9; g.add(m); brick(g, .12, .06, .12, c2, x, 1.03 * s, z); }
}
function bush(g, x, z) { brick(g, .3, .16, .3, 0x3f6b2a, x, .08, z); }
function house(g, x, z, wall = 0xeee6d2, roof = 0xa8432c, ruined = false) {
  const H = ruined ? .5 : .75;
  brick(g, .95, H, .8, wall, x, H / 2, z, { studs: ruined });
  if (!ruined) { slope(g, .48, .42, .9, roof, x - .24, H + .21, z, 0); slope(g, .48, .42, .9, roof, x + .24, H + .21, z, Math.PI); brick(g, .12, .3, .12, 0x7a3a2a, x + .25, H + .45, z - .2, { studs: true }); }
  for (const dx of [-.22, .22]) brick(g, .16, .18, .02, 0x2f4a5e, x + dx, H * .62, z + .41, { studs: false });
  brick(g, .16, .3, .02, 0x5a3a22, x, .15, z + .41, { studs: false });
}
function ruin(g) {
  const walls = [[-.15, -.5, 1.0, 0], [-.55, -.05, .8, HALF], [.45, .3, .6, HALF]];
  for (const [x, z, len, ry] of walls) {
    const w = G(); w.position.set(x, 0, z); w.rotation.y = ry; g.add(w);
    const n = Math.round(len / .2);
    for (let i = 0; i < n; i++) { const h = .12 + Math.floor(R() * 5) * .1; brick(w, .2, h, .14, R() < .25 ? 0x8a3a2a : 0x9e968a, -len / 2 + .1 + i * .2, h / 2, 0, { studs: true }); }
    brick(w, .16, .12, .02, 0x1b1b1b, -len / 4, .3, .08, { studs: false });
  }
  for (let i = 0; i < 12; i++) brick(g, .08 + R() * .12, .06, .08 + R() * .12, [0x9e968a, 0x6e6a64, 0x8a3a2a][i % 3], (R() - .5) * 1.1, .03, (R() - .5) * 1.1, { rot: [0, R() * 3, 0], studs: R() < .5 });
  const c = new THREE.Mesh(new THREE.CylinderGeometry(.22, .16, .03, 18), plastic(0x2e2620)); c.position.set(.2, .02, -.05); g.add(c);
  // Stacheldraht gibt es nur bei Ruinen
  for (let i = 0; i < 4; i++) brick(g, .04, .2, .04, 0x5a4a3a, -.6 + i * .3, .1, .64, { studs: false });
  for (let i = 0; i < 3; i++) { const w = new THREE.Mesh(new THREE.TorusGeometry(.1, .008, 4, 18), plastic(0x6a6a6a)); w.rotation.y = HALF; w.scale.set(1, 1, 1.6); w.position.set(-.45 + i * .3, .12, .64); g.add(w); }
}
const HALF = Math.PI / 2;
function church(g, w, d) {
  const along = w > d, L = Math.max(w, d) * .62, n = G(); if (!along) n.rotation.y = HALF; g.add(n);
  const W2 = .9, H = .75;
  brick(n, L, H, W2, 0xe0d8c4, .15, H / 2, 0, { studs: false });
  for (const sz of [-1, 1]) { const r = slope(n, W2 / 2 + .06, .45, L + .1, 0x5e4a3e, .15, H + .225, sz * (W2 / 4 + .03), sz > 0 ? -HALF : HALF); }
  const tx = .15 - L / 2 - .2;
  brick(n, .6, 1.7, .6, 0xe0d8c4, tx, .85, 0, { studs: false });
  brick(n, .66, .1, .66, 0x9e968a, tx, 1.72, 0, { studs: false });
  const sp = new THREE.Mesh(new THREE.ConeGeometry(.4, .95, 4), plastic(0x3e5a6a)); sp.position.set(tx, 2.25, 0); sp.rotation.y = Math.PI / 4; n.add(sp);
  brick(n, .05, .3, .05, 0xd8a63a, tx, 2.85, 0, { studs: false }); brick(n, .2, .05, .05, 0xd8a63a, tx, 2.9, 0, { studs: false });
  const clk = new THREE.Mesh(new THREE.CylinderGeometry(.12, .12, .02, 20), plastic(0xf4f0e0)); clk.rotation.x = HALF; clk.position.set(tx, 1.35, .31); n.add(clk);
  brick(n, .2, .36, .02, 0x5a3a22, tx, .18, .31, { studs: false });
  for (let i = 0; i < 4; i++) for (const sz of [-1, 1]) brick(n, .14, .32, .02, 0x3a6a9a, .15 - L / 2 + .3 + i * (L - .5) / 3, .42, sz * (W2 / 2 + .005), { studs: false });
}
function G() { return new THREE.Group(); }
function train(g, w, d) {
  const along = w > d, n = G(); if (!along) n.rotation.y = HALF; g.add(n); const L = Math.max(w, d);
  for (const z of [-.18, .18]) brick(n, L * .95, .05, .06, 0x6e6a64, 0, .03, z, { studs: false });
  for (let i = 0; i < 12; i++) brick(n, .1, .03, .5, 0x6b4a2a, -L * .45 + i * L * .9 / 11, .015, 0, { studs: false });
  brick(n, 1.2, .5, .5, 0x2a2a2a, -.3, .35, 0); brick(n, .5, .4, .55, 0x2a2a2a, .45, .55, 0); P2(n, new THREE.CylinderGeometry(.08, .1, .3, 12), 0x2a2a2a, -.7, .75, 0);
  brick(n, 1.0, .4, .5, 0x7a3a2a, 1.1, .35, 0);
  for (const x of [-.7, -.3, .1, .45, .8, 1.4]) for (const z of [-.27, .27]) { const wh = new THREE.Mesh(new THREE.CylinderGeometry(.11, .11, .05, 16), plastic(0xb01e1e)); wh.rotation.x = HALF; wh.position.set(x, .12, z); n.add(wh); }
}
function P2(g, geo, c, x, y, z) { const m = new THREE.Mesh(geo, plastic(c)); m.position.set(x, y, z); g.add(m); return m; }
function water(g, w, d, c = 0x3d86b8) { const m = new THREE.Mesh(new THREE.BoxGeometry(w * .92, .06, d * .92), new THREE.MeshPhysicalMaterial({ color: c, roughness: .08, transmission: .3, transparent: true, opacity: .85, clearcoat: 1 })); m.position.y = .05; g.add(m); return m; }
function tower(g) {
  for (const [x, z] of [[-.25, -.25], [.25, -.25], [-.25, .25], [.25, .25]]) brick(g, .08, 1.3, .08, 0x6b4a2a, x, .65, z, { studs: false });
  brick(g, .75, .08, .75, 0x8a5a32, 0, 1.3, 0); for (const s of [-1, 1]) { brick(g, .75, .2, .04, 0x8a5a32, 0, 1.44, s * .36, { studs: false }); brick(g, .04, .2, .75, 0x8a5a32, s * .36, 1.44, 0, { studs: false }); }
  slope(g, .42, .3, .85, 0x5a3a22, -.21, 1.75, 0, 0); slope(g, .42, .3, .85, 0x5a3a22, .21, 1.75, 0, Math.PI);
  const l = new THREE.Mesh(new THREE.CylinderGeometry(.07, .1, .14, 12), plastic(0xf2e07a, { emissive: 0xffd060, emissiveIntensity: .6 })); l.position.set(.3, 1.6, .3); l.rotation.z = -1; g.add(l);
}
function bunker(g) {
  const m = new THREE.Mesh(new THREE.SphereGeometry(.62, 24, 12, 0, Math.PI * 2, 0, HALF), plastic(0x9a9890)); m.scale.set(1, .6, .9); g.add(m);
  brick(g, .6, .07, .03, 0x1a1a1a, 0, .22, .54, { studs: false });
  for (let i = 0; i < 6; i++) sandbag(g, -.75 + i * .3, .06, .7);
}
function sandbag(g, x, y, z, ry = 0) { const m = new THREE.Mesh(new THREE.CapsuleGeometry(.07, .16, 4, 8), plastic(0xc9b07a)); m.rotation.set(0, ry, HALF); m.position.set(x, y, z); g.add(m); }
function farm(g) {
  house(g, -.25, -.15, 0xb0301e, 0x4a3a2a);
  for (let i = 0; i < 5; i++) brick(g, .05, .2, .05, 0x8a5a32, -.7 + i * .35, .1, .6, { studs: false });
  brick(g, 1.4, .04, .03, 0x8a5a32, 0, .16, .6, { studs: false });
  const hay = new THREE.Mesh(new THREE.CylinderGeometry(.16, .16, .22, 16), plastic(0xd9b85a)); hay.rotation.z = HALF; hay.position.set(.5, .16, .1); g.add(hay);
}
function trench(g, w, d) {
  const along = w > d, L = Math.max(w, d), n = G(); if (!along) n.rotation.y = HALF; g.add(n);
  brick(n, L * .9, .04, .45, 0x3a2e22, 0, .02, 0, { studs: false });
  for (let i = 0; i < Math.floor(L / .3); i++) { sandbag(n, -L * .45 + i * .3, .07, .3); sandbag(n, -L * .45 + i * .3 + .15, .07, -.3); }
  for (let i = 0; i < 5; i++) brick(n, .04, .3, .04, 0x6b4a2a, -L * .4 + i * L * .2, .15, -.42, { studs: false });
}
function beach(g, w, d) { water(g, w * .45, d, 0x3d86b8).position.x = -w * .27; for (let i = 0; i < 3; i++) hedgehog(g, .1 + i * .25, -.3 + i * .3); }
function hedgehog(g, x, z) { for (let i = 0; i < 3; i++) { const b = new THREE.Mesh(new THREE.BoxGeometry(.04, .32, .04), plastic(0x3a3a3a)); b.position.set(x, .12, z); b.rotation.set(i === 0 ? .9 : 0, i === 1 ? 0 : 0, i === 2 ? .9 : (i === 1 ? -.9 : 0)); g.add(b); } }
function ship(g, x, z, ry) {
  const sh = G(); sh.position.set(x, .06, z); sh.rotation.y = ry; g.add(sh);
  brick(sh, 1.6, .26, .6, 0x3e4a56, 0, .13, 0, { studs: false });                 // Rumpf
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(.3, .3, .26, 3), plastic(0x3e4a56)); bow.rotation.y = Math.PI / 6 + Math.PI; bow.scale.set(1.25, 1, 1); bow.position.set(.92, .13, 0); sh.add(bow);
  brick(sh, 1.6, .05, .6, 0xa8322a, 0, .02, 0, { studs: false });                 // roter Unterwasserstreifen
  brick(sh, 1.5, .06, .52, 0x9a7a52, 0, .29, 0);                                  // Deck
  brick(sh, .55, .32, .42, 0xe8e4da, -.25, .48, 0);                                // Aufbau
  for (let i = 0; i < 3; i++) brick(sh, .1, .08, .02, 0x2f4a5e, -.44 + i * .17, .52, .215, { studs: false });
  brick(sh, .4, .16, .36, 0xe8e4da, -.25, .72, 0);
  const fn = new THREE.Mesh(new THREE.CylinderGeometry(.09, .1, .32, 16), plastic(0xd8a63a)); fn.position.set(.15, .62, 0); sh.add(fn);
  brick(sh, .2, .05, .2, 0x1b1b1b, .15, .8, 0, { studs: false });
  brick(sh, .04, .8, .04, 0x6b4a2a, .55, .7, 0, { studs: false }); brick(sh, .3, .03, .03, 0x6b4a2a, .55, .95, 0, { studs: false });
  for (const sx of [-.6, .4]) { const b = new THREE.Mesh(new THREE.TorusGeometry(.06, .02, 6, 14), plastic(0xf2f2f2)); b.position.set(sx, .2, .31); sh.add(b); }
  return sh;
}
function harbor(g, w, d) { water(g, w, d, 0x2f6f9a); const along = w > d; brick(g, along ? w * .5 : .4, .1, along ? .4 : d * .5, 0x8a5a32, along ? w * .2 : 0, .14, along ? .45 : d * .2); brick(g, .12, 1.2, .12, 0xd8a63a, -w * .3, .6, -d * .3, { studs: false }); brick(g, .9, .1, .1, 0xd8a63a, -w * .3 + .4, 1.2, -d * .3, { studs: false }); brick(g, .4, .3, .3, 0x7a3a2a, w * .3, .3, -d * .3); ship(g, along ? -.2 : -.1, along ? -.15 : 0, along ? 0 : Math.PI / 2); }
function road(g, w, d) { brick(g, w * .96, .03, .6, 0x3e3e3e, 0, .015, 0, { studs: false }); for (let i = -2; i <= 2; i++) brick(g, .2, .01, .05, 0xf2f2e8, i * .32, .035, 0, { studs: false }); }
function field(g) { for (let i = 0; i < 4; i++) bush(g, (R() - .5) * 1.1, (R() - .5) * 1.1); for (let i = 0; i < 6; i++) brick(g, .08, .05, .08, [0xf2d23a, 0xd23a2a, 0xf4f4f0][i % 3], (R() - .5) * 1.2, .03, (R() - .5) * 1.2, { studs: false }); const c = new THREE.Mesh(new THREE.CylinderGeometry(.3, .22, .04, 20), plastic(0x4a3a2a)); c.position.set((R() - .5) * .6, .02, (R() - .5) * .6); g.add(c); }

function terrain(key, g, w, d) {
  switch (key) {
    case 'wald': for (let i = 0; i < 4; i++) tree(g, (i % 2 - .5) * .7 + (R() - .5) * .15, (Math.floor(i / 2) - .5) * .7 + (R() - .5) * .15, .9 + R() * .3); break;
    case 'flach': field(g); break;
    case 'zug': train(g, w, d); break;
    case 'farm': farm(g); break;
    case 'turm': tower(g); break;
    case 'bunker': bunker(g); break;
    case 'strand': beach(g, w, d); break;
    case 'wohn': house(g, 0, -.1); tree(g, .55, .5, .7); break;
    case 'graben': trench(g, w, d); break;
    case 'hafen': harbor(g, w, d); break;
    case 'see': water(g, w, d); for (let i = 0; i < 5; i++) brick(g, .04, .3, .04, 0x5a7a2a, -.6 + R() * .2, .15, -.6 + i * .3, { studs: false }); break;
    case 'strasse': road(g, w, d); break;
    case 'ruine': ruin(g); break;
    case 'kirche': church(g, w, d); break;
  }
}
// Missionsziel-Fahne und Felderweiterung
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
  const r = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });   // Bild bleibt stehen, auch wenn nur bei Bewegung gezeichnet wird
  r.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); r.outputColorSpace = THREE.SRGBColorSpace; r.toneMapping = THREE.NeutralToneMapping; r.toneMappingExposure = .95;
  r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
  box.appendChild(r.domElement);
  const scene = new THREE.Scene(); lights(scene, r);
  const sun = new THREE.DirectionalLight(0xfff0d8, 1.6); sun.position.set(-6, 12, 8); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
  Object.assign(sun.shadow.camera, { left: -12, right: 12, top: 12, bottom: -12, near: 1, far: 40 }); sun.shadow.bias = -.0008; scene.add(sun);
  const cam = new THREE.PerspectiveCamera(35, 1, .1, 200);
  const ctl = new OrbitControls(cam, r.domElement); ctl.enableDamping = true; ctl.maxPolarAngle = 1.35; ctl.minDistance = 4; ctl.maxDistance = 40; ctl.enablePan = true;
  ctl.addEventListener('change', () => S3 && (S3.dirty = true));
  S3 = { r, scene, cam, ctl, box, board: null, dirty: true, flags: [] };
  // Antippen = Feld-Info (nur wenn nicht gezogen wurde)
  let down = null;
  r.domElement.addEventListener('pointerdown', e => down = [e.clientX, e.clientY]);
  r.domElement.addEventListener('pointerup', e => {
    if (!down || Math.hypot(e.clientX - down[0], e.clientY - down[1]) > 6) return;
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
  const port = box.clientHeight > box.clientWidth;
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
    t.traverse(o => { if (o.isMesh) o.castShadow = o.receiveShadow = true; });
    const oi = ms ? ms.objectives.indexOf(x) : -1, ex = ms && ms.exts ? ms.exts.find(e => e.p === x) : null;
    if (oi >= 0) { const f = flag(g, .02); f.scale.setScalar(1.35); S3.flags.push(f); const o = ms.objInfo[oi];
      const tg = tag('⚑ ' + (o.flex ? o.name : 'Ziel'), '#b3261a'); tg.position.set(0, 2.3, 0); g.add(tg); }
    if (ex) { extProp(g, ex.name); const tg = tag(ex.name, '#e2b33a', '#1b1b14'); tg.position.set(0, oi >= 0 ? 1.8 : 1.6, .2); g.add(tg); }
    const rule = typeof RULES !== 'undefined' && RULES.felder && RULES.felder[x.p.key] && RULES.felder[x.p.key].regel;
    g.userData.pi = pi; g.userData.tap = oi >= 0 || !!ex || !!rule;
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
  const target = new THREE.Vector3(0, 0, 0), dist = Math.max(W, D) * (port ? 1.95 : 1.05);
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
const box = document.createElement('div'); box.id = 'map3d'; map.after(box);
const mk = (txt, title) => { const b = document.createElement('button'); b.type = 'button'; b.className = 'v3d-sw'; b.textContent = txt; b.title = title; b.onclick = e => { e.stopPropagation(); on = !on; try { localStorage.setItem(KEY, on ? '1' : '0'); } catch (er) { } apply(); }; return b; };
const b3 = mk('3D', 'Als 3D-Spieltisch anzeigen'), b2 = mk('2D', 'Zurück zur 2D-Karte');
box.appendChild(b2);
function ensureBtn() { if (!map.contains(b3) && map.children.length) map.appendChild(b3); }
function apply() { document.body.classList.toggle('map3d-on', on); ensureBtn(); if (on) requestAnimationFrame(build); else if (typeof render === 'function') requestAnimationFrame(() => render()); }   // 2D neu vermessen
let t = null; new MutationObserver(() => { ensureBtn(); if (!on) return; clearTimeout(t); t = setTimeout(build, 30); }).observe(map, { childList: true });
apply();
