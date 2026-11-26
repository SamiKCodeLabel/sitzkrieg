// Sitzkrieg 3D – Figuren und Fahrzeuge im Klemmbaustein-Stil (wie die physische Version des Spiels)
// Glänzender Kunststoff, abgerundete Steine mit Noppen, Minifiguren mit aufgedrucktem Gesicht. Alles aus Grundformen.
import * as THREE from '../vendor/three.module.min.js';
import { RoundedBoxGeometry } from '../vendor/RoundedBoxGeometry.js';
import { GF, SCALE as GS } from './glbfig.js';
export { THREE };

// ---------- Kunststoff ----------
const MATS = new Map();
export function plastic(c, o = {}) {
  const k = c + JSON.stringify(o);
  if (!MATS.has(k)) MATS.set(k, new THREE.MeshStandardMaterial({ color: c, roughness: .3, metalness: 0, envMapIntensity: .55, ...o }));
  return MATS.get(k);
}
const GEO = new Map();
const cached = (k, f) => { if (!GEO.has(k)) GEO.set(k, f()); return GEO.get(k); };
const RB = (w, h, d, r = .025) => cached(`rb${w},${h},${d},${r}`, () => new RoundedBoxGeometry(w, h, d, 3, Math.min(r, w / 2.2, h / 2.2, d / 2.2)));
const CY = (rt, rb, h, s = 24, ...a) => cached(`cy${rt},${rb},${h},${s},${a}`, () => new THREE.CylinderGeometry(rt, rb, h, s, 1, ...a));
const SP = (r, ...a) => cached(`sp${r},${a}`, () => new THREE.SphereGeometry(r, 24, 16, ...a));
const TO = (r, t, arc = Math.PI * 2) => cached(`to${r},${t},${arc}`, () => new THREE.TorusGeometry(r, t, 10, 24, arc));
const HALF = Math.PI / 2;
const G = () => new THREE.Group();
function P(parent, geo, mat, x = 0, y = 0, z = 0, rx = 0, ry = 0, rz = 0) {
  const m = new THREE.Mesh(geo, typeof mat === 'number' ? plastic(mat) : mat);
  m.position.set(x, y, z); m.rotation.set(rx, ry, rz); m.castShadow = true; parent.add(m); return m;
}

// ---------- Farben (typische Steinfarben) ----------
const COL = {
  mod: { uni: 0xa99b6e, uni2: 0x8d7f55, helm: 0xc4a574, veh: 0xc4a574, veh2: 0x8c6f3a, cam: 0x5d6b3a, legs: 0xa99b6e },
  de: { uni: 0x6b7062, uni2: 0x4f5449, helm: 0x5a5e55, veh: 0xc9a35a, veh2: 0x8c6f3a, cam: 0x5d6b3a, legs: 0x5b5f53 },
  al: { uni: 0x8f8455, uni2: 0x6e6640, helm: 0x6b6a3c, veh: 0x5f6b3a, veh2: 0x434c27, cam: 0x7d6a45, legs: 0x7a7048 },
};
const YEL = 0xf0c39c, GLOVE = 0x5f6366, BLK = 0x1b1b1b, DGR = 0x3e4044, LGR = 0xa3a8ab, BRN = 0x6b3f22, WHT = 0xf4f4f0, RED = 0xc91a1a, TAN = 0xd9c08a, GOLD = 0xd8a63a;

// ---------- Drucke (Canvas-Texturen) ----------
function tex(w, h, draw) { const c = document.createElement('canvas'); c.width = w; c.height = h; const x = c.getContext('2d'); draw(x, w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }
const hex = n => '#' + n.toString(16).padStart(6, '0');
const FACES = {};
function faceTex(kind) {
  const k = kind === 'general' ? 'gen' : kind === 'medic' ? 'med' : 'std';
  if (FACES[k]) return FACES[k];
  return FACES[k] = tex(2048, 1024, (x, W, H) => {
    x.fillStyle = hex(YEL); x.fillRect(0, 0, W, H);
    const cx = W / 2, S = H / 256;          // Gesicht in Pixeln eines 512er-Rasters gedacht, hochskaliert
    x.save(); x.translate(cx, 140 * S); x.scale(S * 1.6, S * 1.14); x.translate(0, -140); x.lineCap = 'round'; x.lineJoin = 'round';
    const ink = '#141210';
    const ey = 117;
    // Augen: schlichte schwarze Ovale mit Glanzpunkt (Druckstil)
    for (const s of [-1, 1]) { x.fillStyle = ink; x.beginPath(); x.ellipse(s * 22, ey + 2, 6.5, 8, 0, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); x.arc(s * 22 - 2, ey - 1.5, 2.2, 0, 7); x.fill(); }
    // Augenbrauen: dick und böse
    x.fillStyle = ink;
    for (const s of [-1, 1]) { x.beginPath(); x.moveTo(s * 7, ey - 9); x.lineTo(s * 36, ey - 21); x.lineTo(s * 37, ey - 14); x.lineTo(s * 9, ey - 3); x.closePath(); x.fill(); }
    if (k === 'gen') {
      x.fillStyle = '#3e2818'; x.beginPath(); x.moveTo(0, 160); x.quadraticCurveTo(-18, 155, -30, 166); x.quadraticCurveTo(-16, 165, 0, 168); x.quadraticCurveTo(16, 165, 30, 166); x.quadraticCurveTo(18, 155, 0, 160); x.fill();
      x.strokeStyle = ink; x.lineWidth = 3; x.beginPath(); x.moveTo(-13, 176); x.quadraticCurveTo(0, 173, 13, 176); x.stroke();
    } else if (k === 'med') {
      x.strokeStyle = ink; x.lineWidth = 3; x.beginPath(); x.moveTo(-15, 166); x.quadraticCurveTo(0, 177, 15, 166); x.stroke();
    } else {
      x.fillStyle = ink; x.beginPath(); x.roundRect(-21, 160, 42, 19, 6); x.fill();
      x.fillStyle = '#fff'; x.beginPath(); x.roundRect(-17.5, 163, 35, 13, 3); x.fill();
      x.fillStyle = ink; x.fillRect(-17.5, 168.8, 35, 1.6); for (const tx of [-9, 0, 9]) x.fillRect(tx - .8, 163, 1.6, 13);
    }
    x.restore();
  });
}
const TORSO = {};
function torsoTex(side, kind) {
  const k = side + kind; if (TORSO[k]) return TORSO[k];
  const c = COL[side];
  return TORSO[k] = tex(256, 256, (x, W, H) => {
    if (kind === 'general') { x.fillStyle = hex(c.uni2); x.fillRect(0, 0, W, H); } else x.drawImage(camoTex(side).image, 0, 0, W, H);
    x.strokeStyle = 'rgba(0,0,0,.55)'; x.lineWidth = 5; x.lineJoin = 'round';
    x.beginPath(); x.moveTo(W * .3, 0); x.lineTo(W * .5, H * .22); x.lineTo(W * .7, 0); x.stroke();            // Kragen
    x.beginPath(); x.moveTo(W * .5, H * .22); x.lineTo(W * .5, H * .78); x.stroke();
    x.fillStyle = hex(GOLD); for (let i = 0; i < 4; i++) { x.beginPath(); x.arc(W * .55, H * (.3 + i * .12), 6, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(0,0,0,.45)'; x.lineWidth = 4;
    for (const px of [.18, .62]) { x.strokeRect(W * px, H * .34, W * .2, H * .16); x.beginPath(); x.moveTo(W * px, H * .38); x.lineTo(W * (px + .2), H * .38); x.stroke(); }
    if (kind !== 'general') { x.fillStyle = '#3b2a1a'; x.save(); x.translate(W * .25, 0); x.rotate(-.42); x.fillRect(0, 0, 18, H * 1.1); x.restore(); }   // Riemen
    x.fillStyle = '#3b2a1a'; x.fillRect(0, H * .8, W, H * .13); x.fillStyle = hex(GOLD); x.fillRect(W * .44, H * .8, W * .12, H * .13); // Koppel
    if (kind === 'general') { const m = [RED, GOLD, WHT]; m.forEach((cc, i) => { x.fillStyle = hex(cc); x.fillRect(W * (.16 + i * .07), H * .22, W * .055, H * .07); }); x.fillStyle = '#111'; x.beginPath(); x.moveTo(W * .25, H * .34); x.lineTo(W * .3, H * .42); x.lineTo(W * .25, H * .5); x.lineTo(W * .2, H * .42); x.fill(); }
    if (kind === 'medic') { x.fillStyle = '#fff'; x.beginPath(); x.arc(W * .3, H * .6, 26, 0, 7); x.fill(); x.fillStyle = hex(RED); x.fillRect(W * .3 - 18, H * .6 - 6, 36, 12); x.fillRect(W * .3 - 6, H * .6 - 18, 12, 36); }
    if (side === 'de') { x.fillStyle = '#ddd'; x.fillRect(W * .64, H * .18, 34, 8); x.fillStyle = '#222'; x.fillRect(W * .64, H * .2, 34, 3); }    // Brustadler, vereinfacht
    if (side === 'mod') { x.drawImage(camoTex('mod').image, 0, 0, W, H); x.fillStyle = '#3b2a1a'; x.fillRect(0, H * .85, W, H * .15); }
  });
}
const CAMO = {};
function camoTex(side) {
  if (CAMO[side]) return CAMO[side];
  const t = tex(256, 256, (x, W) => {
    if (side === 'de') {           // Splittertarn: kantige Flächen + Regenstriche
      x.fillStyle = '#86815f'; x.fillRect(0, 0, W, W);
      for (const [c, n] of [['#4f5a2c', 16], ['#5e4128', 12]]) for (let i = 0; i < n; i++) { x.fillStyle = c; x.beginPath(); const cx = Math.random() * W, cy = Math.random() * W; for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28 + Math.random(), r = 14 + Math.random() * 30; x[k ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r, cy + Math.sin(a) * r * .7); } x.fill(); }
      x.strokeStyle = 'rgba(40,50,25,.8)'; x.lineWidth = 2; for (let i = 0; i < 140; i++) { const px = Math.random() * W, py = Math.random() * W; x.beginPath(); x.moveTo(px, py); x.lineTo(px + 1, py + 8); x.stroke(); }
    } else if (side === 'mod') {   // Multicam (Vorlage)
      x.fillStyle = '#958758'; x.fillRect(0, 0, W, W);
      for (const [c, n, r0] of [['#7d8a4e', 26, 12], ['#5d6b34', 22, 10], ['#8a6a44', 20, 9], ['#d4c9a0', 18, 7], ['#3f4a26', 14, 5]]) for (let i = 0; i < n; i++) { x.fillStyle = c; x.beginPath(); const cx = Math.random() * W, cy = Math.random() * W; for (let k = 0; k < 7; k++) { const a = k / 7 * 6.28, r = r0 * (.6 + Math.random() * .9); x[k ? 'lineTo' : 'moveTo'](cx + Math.cos(a) * r * 1.4, cy + Math.sin(a) * r); } x.fill(); }
    } else {                       // Fleckentarn der Alliierten
      x.fillStyle = '#665e36'; x.fillRect(0, 0, W, W);
      for (const [c, n, r0] of [['#9b8c58', 26, 10], ['#4f5530', 30, 9], ['#4a3a26', 18, 6]]) for (let i = 0; i < n; i++) { x.fillStyle = c; x.beginPath(); x.ellipse(Math.random() * W, Math.random() * W, r0 + Math.random() * 12, r0 + Math.random() * 9, Math.random() * 3, 0, 7); x.fill(); }
    }
  });
  t.wrapS = t.wrapT = THREE.RepeatWrapping; return CAMO[side] = t;
}
let NET = null;
function netTex() { return NET || (NET = tex(128, 128, (x, W) => { x.fillStyle = hex(COL.al.helm); x.fillRect(0, 0, W, W); x.strokeStyle = 'rgba(30,30,15,.75)'; x.lineWidth = 2; for (let i = -W; i < W * 2; i += 12) { x.beginPath(); x.moveTo(i, 0); x.lineTo(i + W, W); x.moveTo(i, W); x.lineTo(i + W, 0); x.stroke(); } })); }
const CAMOM = {};
const camo = (side, rep = 1) => CAMOM[side + rep] || (CAMOM[side + rep] = new THREE.MeshStandardMaterial({ map: (() => { const t = camoTex(side).clone(); t.repeat.set(rep, rep); t.needsUpdate = true; return t; })(), roughness: .32 }));
const INS = {};
function insigniaTex(side) {
  if (INS[side]) return INS[side];
  return INS[side] = tex(128, 128, (x, W) => {
    x.clearRect(0, 0, W, W);
    if (side === 'de') { x.fillStyle = '#fff'; x.fillRect(W * .42, W * .08, W * .16, W * .84); x.fillRect(W * .08, W * .42, W * .84, W * .16); x.fillRect(W * .3, W * .2, W * .4, W * .6); x.fillRect(W * .2, W * .3, W * .6, W * .4); x.fillStyle = '#111'; x.fillRect(W * .38, W * .14, W * .24, W * .72); x.fillRect(W * .14, W * .38, W * .72, W * .24); }
    else { x.fillStyle = '#fff'; x.beginPath(); x.arc(W / 2, W / 2, W * .46, 0, 7); x.fill(); x.fillStyle = hex(COL.al.veh); x.beginPath(); x.arc(W / 2, W / 2, W * .4, 0, 7); x.fill(); x.fillStyle = '#fff'; x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? W * .15 : W * .38, a = -HALF + i * Math.PI / 5; x[i ? 'lineTo' : 'moveTo'](W / 2 + Math.cos(a) * r, W / 2 + Math.sin(a) * r); } x.fill(); }
  });
}
// bedruckte Fliese (flach) mit Abzeichen
function insignia(parent, side, s, x, y, z, ry = 0, rx = 0) {
  const m = new THREE.Mesh(cached('pl', () => new THREE.PlaneGeometry(1, 1)), new THREE.MeshStandardMaterial({ map: insigniaTex(side), transparent: true, roughness: .35, polygonOffset: true, polygonOffsetFactor: -2 }));
  m.scale.setScalar(s); m.position.set(x, y, z); m.rotation.set(rx, ry, 0); parent.add(m); return m;
}

// ---------- Steine mit Noppen ----------
const STUD = .2;   // Rastermaß
function brick(parent, w, h, d, color, x = 0, y = 0, z = 0, o = {}) {
  const g = G(); g.position.set(x, y, z); if (o.rot) g.rotation.set(...o.rot); parent.add(g);
  P(g, RB(w, h, d, o.r ?? .03), color);
  if (o.studs !== false) {
    const nx = Math.max(1, Math.round(w / STUD)), nz = Math.max(1, Math.round(d / STUD));
    const im = new THREE.InstancedMesh(CY(.06, .06, .05, 16), plastic(color), nx * nz), mm = new THREE.Matrix4();
    let i = 0; for (let a = 0; a < nx; a++) for (let b = 0; b < nz; b++) { mm.makeTranslation(-w / 2 + w / nx * (a + .5), h / 2 + .025, -d / 2 + d / nz * (b + .5)); im.setMatrixAt(i++, mm); }
    im.castShadow = true; g.add(im);
  }
  return g;
}
// Schräger Stein (Dachstein)
function slope(parent, w, h, d, color, x, y, z, ry = 0) {
  const s = new THREE.Shape(); s.moveTo(-w / 2, -h / 2); s.lineTo(w / 2, -h / 2); s.lineTo(w / 2, -h / 2 + h * .25); s.lineTo(-w / 2 + w * .25, h / 2); s.lineTo(-w / 2, h / 2); s.closePath();
  const geo = cached(`sl${w},${h},${d}`, () => { const e = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: true, bevelThickness: .015, bevelSize: .015, bevelSegments: 2 }); e.translate(0, 0, -d / 2); return e; });
  return P(parent, geo, color, x, y, z, 0, ry, 0);
}

// ---------- Zubehör (zeigt nach +Z, Mündung = userData.muzzle) ----------
function rifle(len = 1, scope = false) {
  const g = G(), K = 0x1d1d1d, K2 = 0x2c2c2c;
  P(g, RB(.065, .13, .24, .02), K, 0, -.05, -.17);
  P(g, RB(.06, .08, .48 * len, .02), K, 0, 0, .17 * len);
  P(g, RB(.07, .05, .2, .012), K2, 0, .055, .05);
  P(g, CY(.02, .02, .14, 8), K2, .05, .07, .0, 0, 0, HALF);   // Kammerstängel
  P(g, SP(.025), K2, .11, .07, 0);
  P(g, RB(.05, .1, .06, .01), K, 0, -.08, .07);                // Abzugsbügel
  P(g, CY(.022, .022, .4 * len, 12), K2, 0, .03, .54 * len, HALF);
  P(g, RB(.02, .05, .02, .005), K, 0, .07, .7 * len);          // Korn
  P(g, cached('sling', () => new THREE.TorusGeometry(.28, .01, 6, 24, Math.PI)), 0x4a3424, -.035, -.06, .14, 0, HALF, Math.PI);
  if (scope) { P(g, CY(.04, .04, .26, 14), K, 0, .13, .12, HALF); for (const z of [.02, .22]) P(g, CY(.05, .05, .03, 14), K2, 0, .13, z, HALF); }
  g.userData.muzzle = new THREE.Vector3(0, .03, .74 * len); return g;
}
function shotgun() { const g = G(); P(g, RB(.07, .12, .24, .02), BRN, 0, -.04, -.14); P(g, RB(.06, .07, .22, .02), BRN, 0, 0, .1); for (const s of [-1, 1]) P(g, CY(.025, .025, .42, 12), DGR, s * .022, .03, .34, HALF); g.userData.muzzle = new THREE.Vector3(0, .03, .56); return g; }
function mgun() {
  const g = G();
  P(g, RB(.08, .12, .28, .02), BLK, 0, -.02, -.2); P(g, RB(.1, .13, .42, .02), DGR, 0, 0, .13);
  P(g, CY(.045, .045, .42, 14), 0x4a4c4f, 0, .02, .52, HALF); P(g, CY(.018, .018, .2, 10), BLK, 0, .02, .82, HALF);
  for (const s of [-1, 1]) P(g, CY(.014, .014, .3, 8), BLK, s * .05, -.12, .66, .5, 0, s * .3);
  for (let i = 0; i < 6; i++) P(g, RB(.03, .05, .035, .008), GOLD, .09, -.06 - i * .045, .1 - i * .02);
  g.userData.muzzle = new THREE.Vector3(0, .02, .93); return g;
}
function panzerfaust() { const g = G(); P(g, CY(.04, .04, .88, 14), 0x6a6a45, 0, 0, 0, HALF); P(g, SP(.1), 0x4b4b35, 0, 0, .48); P(g, cached('pzc', () => new THREE.ConeGeometry(.1, .16, 16)), 0x4b4b35, 0, 0, .62, HALF); g.userData.muzzle = new THREE.Vector3(0, 0, .72); g.userData.back = new THREE.Vector3(0, 0, -.46); return g; }
function pistol() { const g = G(); g.userData.grip = new THREE.Vector3(0, -.06, 0); P(g, RB(.045, .11, .055, .012), BLK, 0, -.05, 0, -.2); P(g, RB(.045, .055, .18, .012), DGR, 0, .02, .06); g.userData.muzzle = new THREE.Vector3(0, .02, .16); return g; }

// ---------- Minifigur ----------
function trapezoid(w0, w1, h, d) {      // Rumpf: oben schmaler
  return cached(`tz${w0},${w1},${h},${d}`, () => { const g = new THREE.BoxGeometry(w0, h, d); const p = g.attributes.position; for (let i = 0; i < p.count; i++) if (p.getY(i) > 0) p.setX(i, p.getX(i) * w1 / w0); g.computeVertexNormals(); return g; });
}
function headGeo() {
  return cached('head', () => {
    const R = .2, H = .17, rc = .07, pts = [new THREE.Vector2(0, -H)];
    for (let i = 0; i <= 5; i++) { const a = -HALF + i / 5 * HALF; pts.push(new THREE.Vector2(R - rc + Math.cos(a) * rc, -H + rc + Math.sin(a) * rc)); }
    for (let i = 1; i < 10; i++) { const y = -H + rc + i / 10 * (2 * H - 2 * rc); pts.push(new THREE.Vector2(R + .012 * Math.cos(y / H * HALF), y)); }
    for (let i = 0; i <= 5; i++) { const a = i / 5 * HALF; pts.push(new THREE.Vector2(R - rc + Math.cos(a) * rc, H - rc + Math.sin(a) * rc)); }
    pts.push(new THREE.Vector2(0, H));
    return new THREE.LatheGeometry(pts, 48, Math.PI);
  });
}
function hand(parent, col = GLOVE) {
  const h = G(); parent.add(h);
  P(h, CY(.038, .038, .07, 14), col, 0, -.02, 0);
  P(h, TO(.062, .03, Math.PI * 1.5), col, 0, -.1, 0, 0, HALF, -Math.PI * .25);
  return h;
}
const ARMGEO = {};
function armGeo(sx) {                 // ein glatt gebogenes Rohr: Schulter -> Ellbogen -> Handgelenk (wie ein Minifigur-Arm)
  if (ARMGEO[sx]) return ARMGEO[sx];
  const c = new THREE.CatmullRomCurve3([new THREE.Vector3(sx * -.03, .03, 0), new THREE.Vector3(sx * .02, -.08, 0), new THREE.Vector3(sx * .045, -.19, .02), new THREE.Vector3(sx * .05, -.24, .1), new THREE.Vector3(sx * .05, -.255, .16)]);
  const g = new THREE.TubeGeometry(c, 40, .088, 20, false);
  return ARMGEO[sx] = g;
}
function arm(parent, sx, col, rx, rz = 0) {
  if (parent.userData.glb) {
    const geo = sx > 0 ? GF.armR : GF.armL, sh = sx > 0 ? GF.shR : GF.shL, hc = sx > 0 ? GF.hR : GF.hL;
    let ax = rx + .75; if (sx < 0 && ax < 0 && ax > -1) ax *= .45;   // freie Hand hängt locker, nur leicht nach vorn
    const p = G(); p.position.set(sh.x * GS, GS + sh.y * GS, sh.z * GS); p.rotation.set(ax, 0, rz * .25); parent.add(p);
    const m = new THREE.Mesh(geo, parent.userData.glbArm || parent.userData.glb); m.scale.setScalar(GS); m.castShadow = true; p.add(m);
    const hd = G(); hd.position.copy(hc).multiplyScalar(GS); hd.userData.clip = new THREE.Vector3(); p.add(hd); p.userData.hand = hd;
    return p;
  }
  const p = G(); p.position.set(sx * .325, 1.0, 0); p.rotation.set(rx + .55, 0, rz * .5); parent.add(p);
  P(p, armGeo(sx), col);
  P(p, SP(.088), col, sx * -.03, .03, 0);                              // runder Abschluss oben
  P(p, CY(.088, .088, .02, 20), col, sx * .05, -.255, .16, 1.35, 0, 0); // Abschluss am Handgelenk
  const hd = G(); hd.position.set(sx * .05, -.27, .2); hd.rotation.x = 1.25; p.add(hd); hand(hd, parent.userData.bare ? YEL : GLOVE); p.userData.hand = hd;
  return p;
}
function headwear(h, side, kind) {
  const c = COL[side];
  if (kind === 'medic-only') kind = 'medic';
  else if (kind === 'general') {
    P(h, CY(.2, .2, .08, 28), c.uni2, 0, .2, 0); P(h, CY(.26, .21, .11, 28), c.uni, 0, .27, -.01);
    P(h, RB(.3, .025, .13, .01), BLK, 0, .17, .17, -.25); P(h, RB(.08, .05, .02, .008), GOLD, 0, .27, .25);
  } else if (h.parent && h.parent.userData.glb) {
  } else if (side === 'de') {
    P(h, SP(.235, 0, Math.PI * 2, 0, HALF), c.helm, 0, .14, -.01);
    P(h, CY(.24, .29, .12, 28), c.helm, 0, .11, -.035);
    for (const sx of [-1, 1]) P(h, RB(.02, .26, .03, .006), 0x1e1c19, sx * .2, -.06, .02, 0, 0, sx * .12);
  } else {
    P(h, SP(.2, 0, Math.PI * 2, 0, HALF), new THREE.MeshStandardMaterial({ map: netTex(), roughness: .5 }), 0, .12, 0);
    P(h, CY(.33, .33, .03, 32), c.helm, 0, .13, 0);
  }
  if (kind === 'medic') { const m = new THREE.Mesh(cached('pl', () => new THREE.PlaneGeometry(1, 1)), new THREE.MeshStandardMaterial({ map: tex(64, 64, (x) => { x.fillStyle = '#fff'; x.beginPath(); x.arc(32, 32, 30, 0, 7); x.fill(); x.fillStyle = hex(RED); x.fillRect(12, 25, 40, 14); x.fillRect(25, 12, 14, 40); }), transparent: true, roughness: .3 })); m.scale.setScalar(.13); const deg = side === 'de' && h.parent && h.parent.userData.glb; m.position.set(0, deg ? .2 : .22, deg ? .275 : .2); m.rotation.x = -.6; h.add(m); }
  if (kind === 'mine') { P(h, TO(.215, .022, Math.PI), BLK, 0, .06, 0); for (const s of [-1, 1]) P(h, CY(.065, .065, .05, 16), BLK, s * .21, 0, 0, 0, 0, HALF); }
}
function soldier(side, kind = 'rif', opt = {}) {
  const g = G(), c = COL[side], body = G(); g.add(body); g.userData.body = body;
  const gen = kind === 'general', LEG = gen ? c.legs : camo(side, .5), ARM = gen ? c.uni2 : camo(side, .35); body.userData.bare = gen;
  let h;
  if (GF.ok && side !== 'mod') {
    const mat = GF.mats[side]; body.userData.glb = mat; body.userData.glbArm = GF.armMats[side];
    const bm = new THREE.Mesh(GF.body, mat); bm.scale.setScalar(GS); bm.position.y = GS; bm.castShadow = true; body.add(bm);
    h = G(); h.position.y = GS + .66 * GS; body.add(h); g.userData.head = h;
    if (side === 'de' && !gen) { P(h, SP(.27, 0, Math.PI * 2, 0, HALF), c.helm, 0, .1, -.01).scale.set(1, .95, 1.02); P(h, CY(.27, .32, .12, 32), c.helm, 0, .07, -.04); }
    else if (gen) headwear(h, side, kind);
    if (kind === 'medic' || kind === 'mine') headwear(h, side, kind === 'medic' ? 'medic-only' : kind);
  } else {
  // Beine
  P(body, RB(.6, .1, .3, .02), LEG, 0, .45, 0);
  for (const s of [-1, 1]) { P(body, RB(.295, .34, .3, .025), LEG, s * .1525, .27, 0); P(body, RB(.3, side === 'de' || gen ? .2 : .13, .31, .02), side === 'de' || gen ? 0x22201c : 0xb39b6a, s * .1525, side === 'de' || gen ? .14 : .17, 0); P(body, RB(.295, .1, .36, .025), side === 'de' || gen ? 0x22201c : 0x5a3a22, s * .1525, .05, .03); }
  // Rumpf mit Aufdruck
  const tg = trapezoid(.6, .44, .58, .3);
  const side_m = gen ? plastic(c.uni2) : camo(side, .5), front = new THREE.MeshStandardMaterial({ map: torsoTex(side, kind), roughness: .28 });
  const torso = new THREE.Mesh(tg, [side_m, side_m, side_m, side_m, front, side_m]); torso.position.y = .79; torso.castShadow = true; body.add(torso);
  if (kind === 'general') { for (const s of [-1, 1]) P(body, RB(.14, .035, .18, .01), GOLD, s * .22, 1.08, 0); P(body, RB(.62, .32, .34, .04), c.uni2, 0, .32, 0); }
  // Kopf
  P(body, CY(.1, .1, .06, 20), YEL, 0, 1.11, 0);
  h = G(); h.position.y = 1.32; body.add(h); g.userData.head = h;
  const hm = new THREE.Mesh(headGeo(), new THREE.MeshStandardMaterial({ map: faceTex(kind), roughness: .3 })); hm.castShadow = true; h.add(hm);
  P(h, CY(.105, .105, .08, 24), YEL, 0, .2, 0); P(h, CY(.09, .105, .015, 24), YEL, 0, .245, 0);
  headwear(h, side, kind);
  if (!gen) {
    if (kind !== 'flame') P(body, RB(.4, .38, .16, .05), side === 'de' ? 0x5b4a33 : 0x8a7a4e, 0, .8, -.24);   // Tornister
    if (side === 'de') {           // schwarze Patronentaschen am Koppel, Brotbeutel
      for (const sx of [-1, 1]) for (let i = 0; i < 3; i++) P(body, RB(.07, .1, .07, .015), 0x1e1c19, sx * (.1 + i * .075), .58, .17);
      P(body, RB(.16, .16, .08, .03), 0x6a6448, .3, .5, .02);
    } else {                       // Gurtweste mit Magazintaschen
      P(body, RB(.44, .34, .05, .03), 0xb39b6a, 0, .8, .165);
      for (let i = 0; i < 3; i++) P(body, RB(.11, .15, .07, .02), 0xa58e5e, -.13 + i * .13, .7, .2);
      for (const sx of [-1, 1]) P(body, RB(.07, .3, .04, .01), 0xb39b6a, sx * .16, .95, .16, 0, 0, sx * -.12);
    }
  }
  }
  const u = g.userData;
  const hold = (w, x, y, z, rx = 0) => { w.position.set(x, y, z); w.rotation.x = rx; body.add(w); u.weapon = w; return w; };
  switch (kind) {
    case 'flame': {
      for (const s of [-1, 1]) P(body, CY(.1, .1, .5, 18), 0x4b4b35, s * .12, .85, -.26);
      const w = G(); P(w, CY(.03, .03, .52, 12), DGR, 0, 0, .24, HALF); P(w, CY(.05, .04, .12, 14), BLK, 0, 0, .52, HALF); P(w, RB(.04, .12, .05, .01), BRN, 0, -.07, .04);
      w.userData.muzzle = new THREE.Vector3(0, 0, .6); hold(w, .1, .82, .3, -.1);
      u.armL = arm(body, -1, ARM, -1.15, .2); u.armR = arm(body, 1, ARM, -.8); break;
    }
    case 'mg': hold(mgun(), .04, .8, .24, -.05); u.armL = arm(body, -1, ARM, -1.2, .2); u.armR = arm(body, 1, ARM, -.75); break;
    case 'shotgun': hold(shotgun(), .1, .98, .22, -.06); u.armL = arm(body, -1, ARM, -1.4, .25); u.armR = arm(body, 1, ARM, -1.0); break;
    case 'sniper': hold(rifle(1.15, true), .12, 1.14, .2, 0); u.armL = arm(body, -1, ARM, -1.55, .25); u.armR = arm(body, 1, ARM, -1.25); break;
    case 'pzf': hold(panzerfaust(), .3, 1.2, .06, -.04); u.armL = arm(body, -1, ARM, -1.5, .3); u.armR = arm(body, 1, ARM, -1.35); break;
    case 'grenade': {
      const r = rifle(); r.position.set(0, .82, -.3); r.rotation.set(-1.2, 0, .6); body.add(r);
      u.armR = arm(body, 1, ARM, -2.7); u.armL = arm(body, -1, ARM, -1.0, .2);
      const gr = G(); if (side === 'de') { P(gr, CY(.025, .025, .26, 10), BRN, 0, .1, 0); P(gr, CY(.06, .06, .11, 16), 0x5d6a4a, 0, .27, 0); } else { P(gr, SP(.075), 0x55603a, 0, .08, 0).scale.set(1, 1.25, 1); P(gr, CY(.022, .022, .05, 10), DGR, 0, .19, 0); }
      u.armR.userData.hand.add(gr); u.grenade = gr; break;
    }
    case 'mortar': {
      const m = G(); m.position.set(.6, 0, .4); body.add(m);
      P(m, RB(.42, .04, .42, .01), DGR, 0, .02, 0); P(m, CY(.075, .075, .74, 18), 0x4d5240, 0, .4, .06, -.55); P(m, CY(.015, .015, .5, 8), DGR, 0, .22, .3, .5);
      u.mortar = m; m.userData.muzzle = new THREE.Vector3(0, .74, .38);
      u.armR = arm(body, 1, ARM, -1.8); u.armL = arm(body, -1, ARM, -.4);
      const sh = G(); P(sh, CY(.055, .055, .2, 14), 0x5b5b3e); P(sh, cached('shc', () => new THREE.ConeGeometry(.055, .1, 14)), 0x5b5b3e, 0, .15, 0); u.armR.userData.hand.add(sh); u.shell = sh; break;
    }
    case 'mine': {
      const d = G(); P(d, CY(.018, .018, 1.0, 8), DGR); P(d, CY(.16, .16, .03, 24), 0x4d5240, 0, -.5, .05, .25); d.position.set(.28, .7, .5); d.rotation.x = .75; body.add(d); u.detector = d;
      u.armR = arm(body, 1, ARM, -.9); u.armL = arm(body, -1, ARM, -.5); break;
    }
    case 'mech': {
      u.armR = arm(body, 1, ARM, -2.4); u.armL = arm(body, -1, ARM, -.3);
      const w = G(); P(w, RB(.04, .34, .03, .01), LGR, 0, .15, 0); P(w, TO(.06, .02, Math.PI * 1.5), LGR, 0, .34, 0, 0, 0, .8); u.armR.userData.hand.add(w); u.tool = w;
      brick(body, .4, .24, .2, RED, -.5, .12, .3); break;
    }
    case 'medic': {
      u.armR = arm(body, 1, ARM, -1.9); u.armL = arm(body, -1, ARM, -.25);
      const bag = brick(body, .2, .24, .2, WHT, -.42, .55, .12, { studs: false });
      const s = G(); P(s, CY(.03, .03, .16, 12), 0xdfe9ee); P(s, CY(.006, .006, .08, 6), DGR, 0, .12, 0); u.armR.userData.hand.add(s); break;
    }
    case 'general': {
      if (opt.veteran) { hold(mgun(), .04, .8, .24, -.05); u.armL = arm(body, -1, ARM, -1.2, .2); u.armR = arm(body, 1, ARM, -.75); break; }
      hold(pistol(), 0, 0, 0, 0); u.armR = arm(body, 1, ARM, -2.05); u.armL = arm(body, -1, ARM, -.6); break;
    }
    default: hold(rifle(), .1, .96, .22, -.08); u.armL = arm(body, -1, ARM, -1.35, .25); u.armR = arm(body, 1, ARM, -.95);
  }
  gripWeapon(g, u, kind);
  if (kind === 'general' && opt.abil) generalGear(g, u, body, side, opt.abil);
  shadow(g, .42); u.type = 'inf';
  return g;
}
const GRIP = new THREE.Vector3(0, -.08, -.08);
function gripWeapon(g, u, kind) {           // Waffe so verschieben, dass der Griff genau in der rechten C-Hand liegt
  const w = u.weapon; if (!w || !u.armR || w.parent !== u.body || kind === 'pzf' || kind === 'flame') return;
  g.updateMatrixWorld(true);
  const clip = u.armR.userData.hand.localToWorld((u.armR.userData.hand.userData.clip || new THREE.Vector3(0, -.1, 0)).clone()); u.body.worldToLocal(clip);
  w.position.copy(clip).sub((w.userData.grip || GRIP).clone().applyEuler(w.rotation));
  g.updateMatrixWorld(true); u.armR.userData.hand.attach(w);
}

// ---------- Generäle: Ausrüstung passend zur Fähigkeit ----------
function generalGear(g, u, body, side, abil) {
  const L = u.armL.userData.hand, h = u.head, c = COL[side], DK = 0x1d1d1d;
  const inHand = (obj, rx = 0) => { obj.rotation.x = rx; obj.scale.setScalar(2.1); L.add(obj); u.armL.rotation.x = -1.15; return obj; };
  switch (abil) {
    case 'Besetzen': { const f = G(); P(f, CY(.02, .02, 1.4, 8), 0x6b4a2a, 0, .5, 0); const cl = new THREE.Mesh(cached('pl', () => new THREE.PlaneGeometry(1, 1)), new THREE.MeshStandardMaterial({ color: side === 'de' ? 0x8a8f78 : 0x6f7841, side: THREE.DoubleSide, roughness: .6 })); cl.scale.set(.5, .34, 1); cl.position.set(0, 1.0, .26); cl.rotation.y = HALF; f.add(cl); const ins = insignia(f, side, .24, .006, 1.0, .26, HALF); inHand(f, -.6); u.flag = cl; break; }
    case 'Kartograf': { const m = new THREE.Mesh(cached('pl', () => new THREE.PlaneGeometry(1, 1)), new THREE.MeshStandardMaterial({ map: tex(128, 96, x => { x.fillStyle = '#e8dcb0'; x.fillRect(0, 0, 128, 96); x.strokeStyle = '#6a8a4a'; x.lineWidth = 3; for (let i = 0; i < 5; i++) { x.beginPath(); x.moveTo(0, 15 + i * 18); x.bezierCurveTo(40, i * 18, 80, 30 + i * 18, 128, 10 + i * 18); x.stroke(); } x.strokeStyle = '#b0302a'; x.lineWidth = 4; x.beginPath(); x.moveTo(20, 70); x.lineTo(60, 40); x.lineTo(100, 55); x.stroke(); }), side: THREE.DoubleSide, roughness: .7 })); m.scale.set(.34, .26, 1); m.position.set(0, -.05, .12); m.rotation.x = -1.0; L.add(m); break; }
    case 'Feldherr': { const sw = G(); P(sw, RB(.025, .8, .05, .008), 0xc9cdd0, 0, -.42, 0); P(sw, RB(.12, .03, .06, .01), 0xd8a63a, 0, 0, 0); P(sw, CY(.025, .025, .14, 8), 0x5a3a22, 0, .08, 0); sw.scale.setScalar(1.4); sw.position.set(-.36, .66, .08); sw.rotation.set(.15, 0, -.3); body.add(sw); break; }
    case 'Taktiker': { const bn = G(); for (const sx of [-.06, .06]) { P(bn, CY(.05, .058, .17, 16), DK, sx, 0, 0, HALF, 0, 0); P(bn, CY(.045, .045, .175, 16), 0x6fa8c8, sx, 0, 0, HALF, 0, 0); } P(bn, RB(.14, .04, .06, .01), DK, 0, 0, 0); bn.position.set(0, .07, .1); u.armL.userData.hand.add(bn); u.armL.rotation.x = -1.6; break; }
    case 'Improvisieren': { const w = G(); P(w, RB(.04, .34, .03, .01), LGR, 0, .15, 0); P(w, TO(.06, .02, Math.PI * 1.5), LGR, 0, .34, 0, 0, 0, .8); inHand(w, -1.2); break; }
    case 'Flankieren': { P(body, RB(.42, .46, .22, .04), 0x4a4a38, 0, .82, -.3); P(body, CY(.016, .016, 1.3, 6), DK, .14, 1.6, -.32); P(body, SP(.03), DK, .14, 2.26, -.32); P(body, RB(.1, .06, .02, .01), 0x8a8a7a, -.08, .9, -.375); break; }
    case 'Unsterblich': { P(h, TO(.215, .04, Math.PI * 2), WHT, 0, .16, 0, HALF, 0, 0); P(h, RB(.06, .06, .02, .01), RED, .1, .17, .2, 0, 0, 0); for (let i = 0; i < 4; i++) P(body, CY(.045, .045, .015, 14), [GOLD, LGR, GOLD, RED][i], -.16 + i * .1, .92, .23, HALF, 0, 0); break; }
    case 'Blutrausch': { const k = G(); P(k, RB(.04, .1, .05, .01), DK, 0, 0, 0); P(k, RB(.015, .26, .05, .006), 0xc9cdd0, 0, .17, 0); P(k, RB(.016, .08, .052, .006), 0x8a1010, 0, .26, 0); inHand(k, -1.3); break; }
    case 'Monster': { const sp = G(); P(sp, CY(.022, .022, .7, 8), 0x6b4a2a, 0, .25, 0); P(sp, RB(.18, .2, .02, .02), 0x6e7270, 0, .66, 0); inHand(sp, -.9); break; }
    case 'Blitz': { for (const sx of [-.08, .08]) { P(h, CY(.06, .06, .05, 16), 0x3a3a30, sx, .26, .2, HALF, 0, 0); P(h, CY(.045, .045, .052, 16), 0x9fd8f0, sx, .26, .2, HALF, 0, 0); } const bolt = new THREE.Mesh(cached('bolt', () => { const sh = new THREE.Shape(); sh.moveTo(0, .1); sh.lineTo(-.04, 0); sh.lineTo(0, 0); sh.lineTo(-.03, -.1); sh.lineTo(.05, .02); sh.lineTo(.01, .02); sh.lineTo(.04, .1); return new THREE.ShapeGeometry(sh); }), plastic(0xffd23a)); bolt.position.set(.13, .95, .215); body.add(bolt); break; }
    case 'Schussbefehl': { const fp = G(); P(fp, RB(.045, .1, .05, .01), 0xd8661a, 0, -.04, 0); P(fp, CY(.035, .035, .18, 12), 0xd8661a, 0, .03, .08, HALF, 0, 0); inHand(fp, -1.4); u.flare = fp; break; }
    case 'Erstschlag': { const r = rifle(); P(r, RB(.014, .03, .26, .004), 0xd8dcde, 0, .03, .86); r.rotation.x = -1.45; r.position.set(0, -.05, .05); L.add(r); u.armL.rotation.x = -1.25; break; }
    case 'Rage': { P(h, CY(.018, .018, .12, 8), 0x6b4a2a, .07, -.08, .26, HALF, .3, 0); P(h, SP(.022), 0xff6a2a, .1, -.08, .32); const p2 = pistol(); inHand(p2, -1.5); break; }
    case 'Verschanzen': {   // Sandsackmauer vor dem General: 3 Lagen, versetzt
      for (let row = 0; row < 3; row++) for (let i = 0; i < 5 - (row === 2 ? 1 : 0); i++) { const m = new THREE.Mesh(cached('sbag2', () => new THREE.CapsuleGeometry(.1, .2, 6, 12)), plastic(row % 2 ? 0xbfa66e : 0xc9b07a)); m.rotation.z = HALF; m.scale.set(1, 1, .8); m.position.set(-.58 + i * .29 + (row % 2) * .145, .09 + row * .17, .5); m.castShadow = true; body.add(m); }
      const sp = G(); P(sp, CY(.02, .02, .55, 8), 0x6b4a2a, 0, 0, 0); P(sp, RB(.15, .17, .02, .02), 0x6e7270, 0, -.33, 0); sp.position.set(.05, .85, -.25); sp.rotation.z = .5; body.add(sp); break; }
    case 'Anführer': { const st = new THREE.Mesh(cached('star', () => { const sh = new THREE.Shape(); for (let i = 0; i < 10; i++) { const r = i % 2 ? .03 : .075, a = HALF + i * Math.PI / 5; sh[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r, Math.sin(a) * r); } return new THREE.ShapeGeometry(sh); }), plastic(0xffd23a)); st.scale.setScalar(1.5); st.position.set(0, .3, .29); h.add(st); const bt = G(); P(bt, CY(.022, .022, .36, 10), 0x2a2a2a, 0, .12, 0); P(bt, CY(.026, .026, .04, 10), GOLD, 0, .3, 0); inHand(bt, -1.0); break; }
    case 'Unbarmherzig': { for (const sx of [-1, 1]) P(body, RB(.29, .36, .04, .02), 0x1d1d1d, sx * .15, .3, .17); P(body, RB(.6, .1, .32, .02), 0x1d1d1d, 0, .47, 0); const cr = G(); P(cr, CY(.012, .008, .5, 6), 0x3a2a1a, 0, .2, 0); inHand(cr, -1.1); break; }
  }
}

// ---------- Nachbau der Vorlage: moderner Soldat ----------
function flagTex() { return tex(64, 40, (x) => { x.fillStyle = '#2a2a24'; x.fillRect(0, 0, 64, 40); for (let i = 0; i < 7; i++) { x.fillStyle = i % 2 ? '#55554c' : '#8e8e80'; x.fillRect(0, 6 + i * 5, 64, 5); } x.fillStyle = '#3a3a33'; x.fillRect(0, 0, 26, 22); }); }
function carbine() {
  const g = G(), K = 0x1d1d1d, K2 = 0x2e2e2e;
  P(g, RB(.06, .1, .2, .02), K, 0, .01, -.28); P(g, RB(.05, .05, .12, .01), K, 0, .03, -.16);      // Schulterstütze
  P(g, RB(.075, .13, .3, .02), K, 0, .02, -.02);                                                 // Gehäuse
  P(g, RB(.06, .17, .08, .015), K, 0, -.13, .0, -.25);                                           // Magazin
  P(g, RB(.05, .12, .06, .015), K, 0, -.1, -.13, .35);                                           // Griff
  P(g, RB(.085, .1, .34, .02), K2, 0, .03, .27);                                                 // Handschutz
  for (let i = 0; i < 6; i++) P(g, RB(.09, .02, .025, .005), K, 0, .09, .14 + i * .05);           // Schienen
  for (let i = 0; i < 5; i++) P(g, RB(.092, .025, .02, .005), K, 0, .0, .15 + i * .055);
  P(g, CY(.02, .02, .18, 10), K, 0, .03, .52, HALF); P(g, CY(.03, .03, .07, 10), K, 0, .03, .62, HALF);
  P(g, CY(.035, .035, .15, 14), K, 0, .14, .0, HALF); P(g, RB(.05, .05, .08, .01), K2, 0, .1, .0);  // Visier
  g.userData.muzzle = new THREE.Vector3(0, .03, .67); return g;
}
function modern() {
  const side = 'mod', c = COL.mod, g = G(), body = G(); g.add(body); g.userData.body = body;
  const LEG = camo(side, .5), ARM = camo(side, .35);
  P(body, RB(.6, .1, .3, .02), LEG, 0, .45, 0);
  for (const s of [-1, 1]) { P(body, RB(.295, .34, .3, .025), LEG, s * .1525, .27, 0); P(body, RB(.3, .14, .31, .02), 0xb69a68, s * .1525, .15, 0); P(body, RB(.295, .1, .36, .025), 0x8f7650, s * .1525, .05, .03); P(body, RB(.2, .1, .02, .01), 0x7a6a50, s * .1525, .33, .155); }
  const tg = trapezoid(.6, .44, .58, .3), side_m = camo(side, .5), front = new THREE.MeshStandardMaterial({ map: torsoTex(side, 'modern'), roughness: .3 });
  const torso = new THREE.Mesh(tg, [side_m, side_m, side_m, side_m, front, side_m]); torso.position.y = .79; body.add(torso);
  // Plattenträger mit Taschen, Flaggen-Patch
  const TAN = 0xc7a873, TAN2 = 0xb39463;
  P(body, RB(.5, .46, .07, .03), TAN, 0, .8, .175); P(body, RB(.5, .46, .07, .03), TAN, 0, .8, -.175);
  for (const sx of [-1, 1]) P(body, RB(.12, .1, .36, .02), TAN, sx * .19, 1.04, 0);
  for (let i = 0; i < 3; i++) { P(body, RB(.13, .17, .08, .02), TAN2, -.14 + i * .14, .66, .225); P(body, RB(.12, .04, .085, .01), TAN, -.14 + i * .14, .755, .227); }
  const fl = new THREE.Mesh(cached('pl', () => new THREE.PlaneGeometry(1, 1)), new THREE.MeshStandardMaterial({ map: flagTex(), roughness: .5 })); fl.scale.set(.14, .09, 1); fl.position.set(-.09, .93, .212); body.add(fl);
  P(body, RB(.34, .3, .16, .05), TAN2, 0, .78, -.27);                                         // Rückentasche
  // Kopf
  P(body, CY(.1, .1, .06, 20), YEL, 0, 1.11, 0);
  const h = G(); h.position.y = 1.32; body.add(h); g.userData.head = h;
  h.add(new THREE.Mesh(headGeo(), new THREE.MeshStandardMaterial({ map: faceTex('rif'), roughness: .3 })));
  P(h, CY(.105, .105, .08, 24), YEL, 0, .2, 0);
  P(h, SP(.235, 0, Math.PI * 2, 0, HALF * .95), c.helm, 0, .1, -.015).scale.set(1, 1.05, 1.05);          // Gefechtshelm
  P(h, RB(.12, .08, .05, .015), 0x1d1d1d, 0, .24, .2, -.4);                                     // Halterung
  for (const sx of [-1, 1]) P(h, CY(.055, .06, .2, 16), 0x1d1d1d, sx * .065, .35, .16, -.25);   // Nachtsicht
  for (const sx of [-1, 1]) { P(h, CY(.09, .09, .07, 20), 0x1d1d1d, sx * .23, 0, 0, 0, 0, HALF); P(h, RB(.02, .2, .02, .006), 0x1d1d1d, sx * .2, .14, 0); }   // Headset
  P(h, CY(.012, .012, .26, 6), 0x1d1d1d, .2, -.1, .13, 0, -.6, HALF); P(h, SP(.025), 0x1d1d1d, .1, -.11, .22);           // Mikrofon
  const u = g.userData;
  u.armR = arm(body, 1, ARM, -1.1, 0); u.armL = arm(body, -1, ARM, -.6);
  const w = carbine(); w.rotation.set(-.05, -.25, 0); body.add(w); u.weapon = w; u.body = body; gripWeapon(g, u, 'modern');
  const kn = G(); P(kn, RB(.04, .1, .05, .01), 0x1d1d1d, 0, -.02, 0); P(kn, RB(.015, .24, .05, .006), 0x2a2a2a, 0, .15, .01); kn.rotation.set(-1.2, 0, 0); u.armL.userData.hand.add(kn);
  shadow(g, .42); u.type = 'inf';
  return g;
}

// ---------- Fahrzeuge ----------
function shadow(g, r) { const m = new THREE.Mesh(cached('sh', () => new THREE.CircleGeometry(1, 32)), new THREE.MeshBasicMaterial({ color: 0, transparent: true, opacity: .22, depthWrite: false })); m.rotation.x = -HALF; m.position.y = .004; m.scale.set(r, r * .7, 1); m.renderOrder = -1; g.add(m); g.userData.shadow = m; return m; }
function wheel(parent, r, w, x, y, z, rim = LGR) { const g = G(); g.position.set(x, y, z); g.rotation.x = HALF; parent.add(g); P(g, CY(r, r, w, 28), BLK); P(g, CY(r * .6, r * .6, w + .01, 24), rim); P(g, CY(r * .2, r * .2, w + .03, 12), DGR); return g; }
function trackUnit(parent, len, z, r, n, side) {
  const t = G(); t.position.z = z; parent.add(t);
  P(t, RB(len, r * 2.2, .36, r), BLK, 0, r * 1.1, 0);
  for (let i = 0; i < Math.round(len / .12); i++) P(t, RB(.05, .03, .37, .008), DGR, -len / 2 + .08 + i * .12, .015, 0);
  for (let i = 0; i < n; i++) wheel(t, r * .78, .04, -len / 2 + r * 1.2 + i * (len - r * 2.4) / (n - 1), r * 1.1, Math.sign(z) * .19, LGR);
  const sz = Math.sign(z) * .2;
  const sp = G(); sp.position.set(len / 2 - r * .95, r * 1.25, sz); t.add(sp);          // Antriebsrad vorn mit Zähnen
  P(sp, CY(r * .7, r * .7, .05, 20), DGR, 0, 0, 0, HALF, 0, 0); P(sp, CY(r * .25, r * .25, .07, 12), 0x2a2a2a, 0, 0, 0, HALF, 0, 0);
  for (let i = 0; i < 10; i++) { const a = i / 10 * Math.PI * 2; P(sp, RB(.05, .05, .05, .01), DGR, Math.cos(a) * r * .75, Math.sin(a) * r * .75, 0, 0, 0, a); }
  wheel(t, r * .62, .05, -len / 2 + r * .95, r * 1.3, sz, DGR);                         // Leitrad hinten
  for (let i = 0; i < 3; i++) wheel(t, r * .22, .05, -len / 4 + i * len / 4, r * 2.0, sz, DGR);   // Stützrollen
  return t;
}
function crew(parent, side, x, y, z, kind = 'rif') {   // Kommandant schaut aus der Luke
  const f = soldier(side, kind); f.remove(f.userData.shadow); f.scale.setScalar(.75); f.position.set(x, y - .55 * .75, z); f.rotation.y = HALF * .9;
  f.userData.weapon && (f.userData.weapon.visible = false); f.userData.armL.rotation.set(-.3, 0, .4); f.userData.armR.rotation.set(-.2, 0, -.4);
  parent.add(f); return f;
}
function tank(side, heavy) {
  const g = G(), c = COL[side], u = g.userData, hull = G(); g.add(hull); u.body = hull;
  const L = heavy ? 3.2 : 2.4, Wd = heavy ? 1.0 : .82, r = heavy ? .22 : .18;
  for (const s of [-1, 1]) trackUnit(hull, L, s * Wd, r, heavy ? 6 : 4, side);
  const hy = r * 2.2;
  brick(hull, L * .98, .4, Wd * 2.3, c.veh, 0, hy + .2, 0);
  if (side === 'al' && heavy) { slope(hull, .7, .5, Wd * 2.1, c.veh, L * .4, hy + .62, 0, Math.PI); brick(hull, L * .55, .4, Wd * 1.9, c.veh, -.3, hy + .62, 0); }
  else { slope(hull, .6, .36, Wd * 2.1, c.veh, L * .42, hy + .55, 0, Math.PI); brick(hull, L * .6, .3, Wd * 1.8, c.veh, -.25, hy + .55, 0, { studs: true }); }
  if (side === 'de') for (const [x, z, w] of [[-.7, 1, .5], [.4, -1, .4], [.9, 1, .3]]) P(hull, RB(w * L / 3.2, .16, .02, .006), c.cam, x * L / 3.2, hy + .2, z * Wd * 1.155);
  const tur = G(); tur.position.set(heavy ? -.15 : 0, hy + .7 + (side === 'al' && heavy ? .12 : 0), 0); hull.add(tur); u.turret = tur;
  if (side === 'al') { P(tur, SP(heavy ? .62 : .48, 0, Math.PI * 2, 0, HALF), c.veh, 0, .02, 0).scale.set(1.15, .9, 1); brick(tur, .3, .1, .3, c.veh2, -.15, heavy ? .58 : .45, 0); }
  else { brick(tur, heavy ? 1.3 : .9, heavy ? .5 : .38, heavy ? 1.3 : .9, c.veh, 0, .25, 0); brick(tur, .3, .1, .3, c.veh2, -.3, heavy ? .55 : .48, .25); }
  const bx = heavy ? .65 : .45, br = G(); br.position.set(bx, .25, 0); tur.add(br);
  const bl = heavy ? (side === 'de' ? 1.9 : 1.4) : 1.0;
  P(br, CY(heavy ? .075 : .05, heavy ? .085 : .06, bl, 18), DGR, bl / 2, 0, 0, 0, 0, HALF);
  if (heavy && side === 'de') P(br, CY(.13, .13, .24, 16), DGR, bl - .05, 0, 0, 0, 0, HALF);
  brick(br, .3, .3, .36, c.veh2, 0, 0, 0, { studs: false });
  br.userData.muzzle = new THREE.Vector3(bl + .12, 0, 0); u.barrel = br; u.muzzles = [br];
  u.crew = crew(tur, side, heavy ? -.3 : -.25, heavy ? .6 : .5, heavy ? .25 : .2);
  insignia(hull, side, heavy ? .42 : .34, -L * .2, hy + .2, Wd * 1.151 + .001);
  insignia(tur, side, heavy ? .34 : .26, 0, .25, (side === 'al' ? (heavy ? .66 : .52) : (heavy ? .652 : .452)));
  tankDetails(hull, tur, br, side, heavy, L, Wd, r, hy, c, u);
  shadow(g, L * .5); u.type = 'veh';
  return g;
}
// Klassische Panzerteile: Bug-MG, Scheinwerfer, Haken, Werkzeug, Ersatzketten, Auspuff, Gitter, Antenne, Kuppel, Koax-MG, Nebelwerfer, Staukasten, Kanister …
function tankDetails(hull, tur, br, side, heavy, L, Wd, r, hy, c, u) {
  const DK = 0x2a2a2a, MT = 0x5a5e62, sherman = side === 'al' && heavy, deckY = sherman ? hy + .82 : hy + .7, front = L * .49, sideZ = Wd * 1.15;
  // Bug-MG in Kugelblende
  P(hull, SP(.07), c.veh2, front + .01, hy + .3, Wd * .55); P(hull, CY(.022, .022, .26, 10), DK, front + .13, hy + .3, Wd * .55, 0, 0, HALF);
  // Scheinwerfer und Abschlepphaken
  for (const sz of [-1, 1]) { P(hull, CY(.06, .055, .08, 16), DK, front - .05, hy + .46, sz * Wd * .85, 0, 0, HALF); P(hull, CY(.045, .045, .02, 16), 0xfff2b0, front - .005, hy + .46, sz * Wd * .85, 0, 0, HALF);
    P(hull, TO(.05, .016, Math.PI * 2), MT, front + .02, hy + .08, sz * Wd * .6, 0, HALF, 0); }
  // Werkzeug an der rechten Seite: Spaten, Axt, Abschleppseil
  const tz = sideZ + .03, ty = hy + .28;
  P(hull, CY(.03, .03, .6, 10), 0x8a5a32, L * .12, ty + .06, tz, 0, 0, HALF); P(hull, RB(.16, .14, .025, .01), MT, L * .12 + .34, ty + .06, tz);          // Spaten
  P(hull, CY(.03, .03, .5, 10), 0x8a5a32, L * .14, ty - .07, tz, 0, 0, HALF); P(hull, RB(.08, .16, .025, .01), MT, L * .14 - .27, ty - .07, tz);           // Axt
  for (let i = 0; i < 2; i++) P(hull, TO(.11, .02, Math.PI * 2), 0x3a3a38, -L * .38 + i * .04, ty, tz + .006 * i, 0, 0, 0).scale.set(1.7, 1, 1);         // Abschleppseil
  // Ersatzkettenglieder
  const link = (par, x, y, z, ry = 0, n = 4, dx = .1) => { for (let i = 0; i < n; i++) P(par, RB(.08, .03, .3, .008), DK, x + i * dx, y, z, 0, ry, 0); };
  // Auspuff und Motorgitter hinten
  for (const sz of [-1, 1]) {
    if (side === 'de') { P(hull, CY(.06, .06, .38, 14), 0x4a3a2e, -front - .02, hy + .5, sz * Wd * .45); P(hull, CY(.075, .075, .14, 14), MT, -front - .02, hy + .62, sz * Wd * .45); }
    else P(hull, RB(.1, .14, Wd * .7, .03), MT, -front - .03, hy + .25, sz * Wd * .4);
    P(hull, RB(.5, .025, .42, .01), 0x3e4246, -L * .3, deckY + .015, sz * Wd * .42);
    for (let i = 0; i < 5; i++) P(hull, RB(.48, .015, .02, .004), 0x1b1b1b, -L * .3, deckY + .03, sz * Wd * .42 - .16 + i * .08);
  }
  // Antenne
  P(hull, CY(.008, .012, 1.4, 6), DK, -L * .36, deckY + .7, -Wd * .75); P(hull, CY(.03, .03, .06, 10), DK, -L * .36, deckY + .03, -Wd * .75);
  // Koax-MG an der Blende
  P(br, CY(.018, .018, .32, 8), DK, .3, .06, .12, 0, 0, HALF);
  if (side === 'de') {
    const w = heavy ? 1.3 : .9, h = heavy ? .5 : .38;
    // Kommandantenkuppel mit Sehschlitzen und offenem Deckel
    const cu = G(); cu.position.set(-.3, h, .25); tur.add(cu);
    P(cu, CY(.19, .21, .14, 24), c.veh, 0, .07, 0);
    for (let i = 0; i < 6; i++) { const a = i / 6 * Math.PI * 2; P(cu, RB(.06, .035, .02, .006), 0x1b1b1b, Math.cos(a) * .2, .09, Math.sin(a) * .2, 0, -a + HALF, 0); }
    const lid = P(cu, CY(.17, .17, .03, 24), c.veh, -.16, .3, 0, 0, 0, 1.3);
    // Nebelwurfbecher, Ersatzketten am Turm, Staukasten hinten
    for (const sz of [-1, 1]) for (let i = 0; i < 3; i++) P(tur, CY(.035, .035, .14, 10), DK, w / 2 - .12 - i * .07, h * .75, sz * (w / 2 + .03), .6 * sz, 0, -.35);
    link(tur, -w / 2 + .15, h * .45, w / 2 + .02, HALF, 4, .14);
    if (heavy) { brick(tur, .38, .36, w * .78, c.veh, -w / 2 - .19, .22, 0, { studs: true }); P(tur, RB(.1, .04, .05, .01), MT, -w / 2 - .39, .3, 0); }
    link(hull, front - .42, hy + .46, 0, 0, 3, .1);
  } else {
    // Sherman/Stuart: Kuppel, schweres MG auf dem Dach, Kanister und Schlafrolle hinten, Kettenglieder auf dem Bug
    const top = heavy ? .58 : .45;
    const cu = G(); cu.position.set(-.15, top, -.18); tur.add(cu);
    P(cu, CY(.17, .19, .1, 24), c.veh, 0, .05, 0); P(cu, CY(.16, .16, .03, 24), c.veh, -.12, .25, 0, 0, 0, 1.3);
    const m = mgun(); m.scale.setScalar(heavy ? .8 : .65); m.position.set(.05, top + .2, .25); m.rotation.y = HALF; tur.add(m);
    P(tur, CY(.02, .02, .2, 8), DK, .05, top + .08, .25);
    for (let i = 0; i < 3; i++) { const j = G(); j.position.set(-front - .07, hy + .3, -Wd * .6 + i * Wd * .6); hull.add(j); P(j, RB(.1, .26, .18, .02), heavy ? 0x4a5530 : 0x55603a, 0, 0, 0); P(j, RB(.11, .03, .12, .01), 0x3a4426, 0, .14, 0); }
    P(hull, cached('bedroll', () => new THREE.CapsuleGeometry(.08, Wd * 1.2, 6, 14)), 0x8a7a52, -L * .42, deckY + .09, 0, HALF, 0, 0);
    link(hull, front - .55, hy + .52, 0, 0, 4, .09);
    if (heavy) for (const sz of [-1, 1]) for (let i = 0; i < 3; i++) P(hull, RB(.32, .14, .06, .02), MT, -L * .33 + i * L * .33, r * 1.55, sz * (Wd + .22));   // Laufwerksträger (VVSS)
  }
}
function halftrack(side) {
  const g = G(), c = COL[side], u = g.userData, b = G(); g.add(b); u.body = b;
  for (const s of [-1, 1]) { trackUnit(b, 1.6, s * .78, .2, 3, side).position.x = -.55; wheel(b, .28, .18, 1.3, .28, s * .8); }
  brick(b, 3.0, .25, 1.6, c.veh, 0, .62, 0, { studs: false });
  brick(b, .9, .45, 1.2, c.veh, 1.25, .97, 0); slope(b, .5, .35, 1.15, c.veh, 1.5, 1.32, 0, Math.PI);
  P(b, RB(.06, .4, 1.4, .02), 0x2f3a40, .78, 1.38, 0, 0, 0, -.25);
  for (const s of [-1, 1]) brick(b, 2.0, .5, .1, c.veh, -.45, 1.0, s * .76, { studs: true });
  brick(b, .1, .5, 1.6, c.veh, -1.45, 1.0, 0);
  for (const s of [-1, 1]) P(b, CY(.09, .09, .04, 18), 0xfff2b0, 1.71, 1.0, s * .42, 0, 0, HALF);
  const w = mgun(); w.position.set(.55, 1.55, 0); w.rotation.y = HALF; b.add(w); u.weapon = w;
  for (let i = 0; i < 3; i++) { const f = soldier(side, 'rif'); f.remove(f.userData.shadow); f.scale.setScalar(.62); f.position.set(-1.05 + i * .5, .75, i % 2 ? -.3 : .3); f.rotation.y = HALF; f.userData.weapon.visible = false; b.add(f); }
  insignia(b, side, .4, -.45, 1.0, .811 + .001);
  shadow(g, 1.7); u.type = 'veh'; u.exhaust = new THREE.Vector3(-1.6, .8, -.6);
  return g;
}
// Kraftrad mit Beiwagen (nach Foto der echten Klemmbaustein-Version): Schutzbleche, Speichenräder, Scheinwerfer, Gepäckgitter, Ersatzrad, MG am Beiwagen
// Kraftrad im Klemmbaustein-Look (nach Foto): dicke Schutzblech-Formteile, Reifen mit Profil, Noppen, transparenter Rundstein als Scheinwerfer
function fender(parent, r, wdt, x, y, z, col, arc = 1.15) {   // dickes, abgerundetes Formteil über dem Rad
  const geo = cached(`fdk${r},${wdt},${arc}`, () => {
    const sh = new THREE.Shape(), a0 = HALF - arc * HALF, a1 = HALF + arc * HALF, t = .06;
    sh.absarc(0, 0, r + t, a0, a1, false); sh.absarc(0, 0, r, a1, a0, true); sh.closePath();
    const e = new THREE.ExtrudeGeometry(sh, { depth: wdt, bevelEnabled: true, bevelThickness: .02, bevelSize: .02, bevelSegments: 3, curveSegments: 28 }); e.translate(0, 0, -wdt / 2); return e;
  });
  const m = new THREE.Mesh(geo, plastic(col)); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m;
}
function brickTire(parent, r, w, x, y, z) {   // Reifen mit rundem Profil + Rillen, Felge mit Löchern und Achse
  const g = G(); g.position.set(x, y, z); parent.add(g);
  P(g, cached(`tire${r},${w}`, () => new THREE.TorusGeometry(r - w * .45, w * .5, 16, 36)), BLK);
  for (let i = 0; i < 18; i++) { const a = i / 18 * Math.PI * 2; P(g, RB(.03, .03, w * .9, .008), 0x111111, Math.cos(a) * (r - .005), Math.sin(a) * (r - .005), 0, 0, 0, a); }
  P(g, CY(r * .55, r * .55, w * .8, 28), 0xa3a8ab, 0, 0, 0, HALF, 0, 0);
  for (let i = 0; i < 5; i++) { const a = i / 5 * Math.PI * 2; P(g, CY(r * .1, r * .1, w * .82, 12), 0x6f7578, Math.cos(a) * r * .32, Math.sin(a) * r * .32, 0, HALF, 0, 0); }
  P(g, CY(r * .14, r * .14, w * .9, 16), 0x3e4246, 0, 0, 0, HALF, 0, 0);
  P(g, RB(r * .16, r * .05, w * .92, .004), 0x1b1b1b, 0, 0, 0); P(g, RB(r * .05, r * .16, w * .92, .004), 0x1b1b1b, 0, 0, 0);   // Achsloch (Kreuz)
  return g;
}
function krad(side) {
  const g = G(), u = g.userData, b = G(); g.add(b); u.body = b;
  const OL = side === 'de' ? 0x77741f : 0x5c6436, DG = 0x4a4e52;
  // Motorrad
  brickTire(b, .27, .16, .72, .27, 0); brickTire(b, .27, .16, -.6, .27, 0);
  fender(b, .29, .2, .72, .27, 0, OL, 1.05); fender(b, .29, .2, -.6, .27, 0, OL, 1.15).rotation.z = .25;
  brick(b, 1.0, .14, .24, OL, .06, .62, 0, { studs: false, r: .05 });               // Rahmen
  P(b, RB(.5, .26, .3, .11), OL, .2, .78, 0);                                       // Tank (rund)
  P(b, RB(.4, .24, .28, .05), DG, .08, .44, 0);                                     // Motorblock
  for (const sz of [-1, 1]) { P(b, CY(.085, .085, .12, 18), 0xc4c8ca, .1, .44, sz * .2, HALF, 0, 0); for (let i = 0; i < 3; i++) P(b, CY(.095, .095, .012, 18), 0x9aa0a3, .1, .44, sz * (.16 + i * .035), HALF, 0, 0); }
  P(b, RB(.32, .08, .22, .04), BLK, -.24, .76, 0);                                  // Sattel
  brick(b, .4, .04, .26, 0xc9cdd0, -.6, .64, 0, { studs: false });                 // Gepäckgitter (Gitterfliese)
  for (let i = 0; i < 4; i++) P(b, RB(.4, .025, .02, .005), 0xa3a8ab, -.6, .67, -.09 + i * .06);
  for (const sz of [-.08, .08]) P(b, CY(.028, .028, .74, 12), DG, .66, .66, sz, 0, 0, -.28);   // Gabel
  P(b, RB(.12, .08, .22, .03), DG, .76, 1.02, 0);                                   // Lenkerklemme
  P(b, CY(.024, .024, .6, 12), DG, .76, 1.07, 0, HALF, 0, 0);
  for (const sz of [-.3, .3]) P(b, CY(.034, .034, .1, 12), BLK, .76, 1.07, sz, HALF, 0, 0);
  P(b, CY(.1, .09, .1, 24), OL, .82, .88, 0, 0, 0, HALF);                           // Scheinwerfergehäuse
  const glass = new THREE.MeshPhysicalMaterial({ color: 0xffffff, roughness: .02, transmission: .85, thickness: .1, transparent: true, opacity: .75, ior: 1.5, clearcoat: 1 });
  P(b, CY(.085, .085, .05, 24), glass, .9, .88, 0, 0, 0, HALF); P(b, CY(.045, .045, .04, 20), glass, .945, .88, 0, 0, 0, HALF);   // transparenter 1x1-Rundstein mit Noppe
  // Beiwagen (rechts vom Fahrer)
  const sc = G(); sc.position.set(.05, 0, .74); b.add(sc);
  brickTire(sc, .24, .15, -.1, .24, .28); fender(sc, .26, .19, -.1, .24, .28, OL, 1.1);
  P(sc, cached('sct', () => new THREE.CapsuleGeometry(.27, .62, 10, 24)), OL, 0, .56, 0, 0, 0, HALF).scale.set(1, .85, 1);
  P(sc, RB(.4, .05, .34, .03), 0x2a2a28, -.14, .78, 0);                             // Sitzöffnung
  brick(sc, .4, .06, .2, OL, .3, .8, 0, { r: .02 });                                // Platte mit Noppen vorn
  brick(sc, .2, .06, .16, OL, -.18, .3, -.33, { studs: false });                    // Verbindung
  const sp = G(); sp.position.set(-.6, .62, 0); sp.rotation.y = HALF; sc.add(sp); brickTire(sp, .19, .12, 0, 0, 0);   // Ersatzrad
  P(sc, RB(.2, .2, .1, .02), BLK, .22, .48, .3); P(sc, RB(.1, .03, .04, .01), BLK, .22, .6, .3);   // Munitionskiste mit Griff
  P(sc, CY(.03, .03, .26, 12), BLK, .3, .96, 0);                                    // MG-Halterung auf der Noppe
  const w = mgun(); w.scale.setScalar(.85); w.position.set(.3, 1.1, 0); w.rotation.y = HALF; sc.add(w); u.weapon = w;
  // Besatzung (größer, wie echte Minifiguren auf dem Motorrad)
  const rider = soldier(side, 'rif'); rider.remove(rider.userData.shadow); rider.scale.setScalar(.8); rider.position.set(-.28, .4, 0); rider.rotation.y = HALF; b.add(rider);
  if (rider.userData.weapon) rider.userData.weapon.visible = false; rider.userData.armL.rotation.x = -1.4; rider.userData.armR.rotation.x = -1.4;
  const gun = soldier(side, 'rif'); gun.remove(gun.userData.shadow); gun.scale.setScalar(.8); gun.position.set(-.12, .12, 0); gun.rotation.y = HALF; sc.add(gun); u.gunner = gun;
  if (gun.userData.weapon) gun.userData.weapon.visible = false; gun.userData.armL.rotation.x = -1.2; gun.userData.armR.rotation.x = -1.2;
  insignia(sc, side, .22, -.1, .58, .256, 0);
  shadow(g, 1.15); u.type = 'veh';
  return g;
}
function fieldGun(side, flak) {
  const g = G(), c = COL[side], u = g.userData, b = G(); g.add(b); u.body = b;
  if (flak) { for (const a of [.6, -.6]) brick(b, 2.4, .1, .24, c.veh2, 0, .2, 0, { rot: [0, a, 0] }); for (const [x, z] of [[1, .65], [1, -.65], [-1, .65], [-1, -.65]]) P(b, CY(.1, .1, .3, 14), DGR, x, .1, z); P(b, CY(.55, .62, .22, 28), c.veh, 0, .36, 0); }
  else { for (const s of [-1, 1]) wheel(b, .45, .12, -.1, .45, s * .72, DGR); for (const s of [-1, 1]) brick(b, 1.8, .12, .16, c.veh2, -1.0, .24, s * .3, { rot: [0, s * .25, .12], studs: false }); }
  const cr = G(); cr.position.set(flak ? 0 : -.1, flak ? .66 : .62, 0); b.add(cr); u.turret = cr;
  brick(cr, .8, .3, .6, c.veh, 0, 0, 0);
  const sh = G(); cr.add(sh); P(sh, RB(.08, 1.0, 1.4, .02), c.veh, .45, .3, 0, 0, 0, -.12); if (flak) sh.scale.set(1, .55, .75);
  insignia(sh, side, .36, .5, .35, 0, HALF);
  const el = G(); el.position.set(.1, .15, 0); el.rotation.z = flak ? .95 : .3; cr.add(el); u.barrel = el; u.muzzles = [];
  if (flak) for (const z of [-.13, .13]) { const br = G(); br.position.z = z; el.add(br); P(br, CY(.045, .05, 1.7, 14), DGR, .85, 0, 0, 0, 0, HALF); P(br, CY(.08, .06, .22, 14), BLK, 1.62, 0, 0, 0, 0, HALF); br.userData.muzzle = new THREE.Vector3(1.8, 0, 0); u.muzzles.push(br); }
  else { const br = G(); el.add(br); P(br, CY(.08, .09, 2.1, 18), DGR, 1.05, 0, 0, 0, 0, HALF); P(br, CY(.14, .14, .28, 16), DGR, 2.0, 0, 0, 0, 0, HALF); P(br, CY(.16, .16, .7, 18), c.veh2, .1, 0, 0, 0, 0, HALF); br.userData.muzzle = new THREE.Vector3(2.2, 0, 0); u.muzzles.push(br); }
  const f = soldier(side, 'rif'); f.remove(f.userData.shadow); f.scale.setScalar(.7); f.position.set(-.75, 0, flak ? .7 : -.75); f.rotation.y = flak ? .3 : HALF * .6; f.userData.weapon.visible = false; f.userData.armR.rotation.x = -1.7; b.add(f);
  shadow(g, 1.4); u.type = 'veh';
  return g;
}
function plane(side) {
  const g = G(), c = COL[side], u = g.userData, b = G(); b.position.y = 1.25; g.add(b); u.body = b;
  const col = side === 'de' ? 0x8b98a3 : c.veh, under = side === 'de' ? 0xb9cad6 : 0xa3a77d;
  brick(b, 2.8, .5, .6, col, 0, 0, 0);
  slope(b, .5, .5, .6, col, 1.6, 0, 0, Math.PI);
  brick(b, 1.1, .12, 4.4, col, .2, -.12, 0);
  brick(b, .55, .08, 1.6, col, -1.3, .1, 0);
  brick(b, .55, .65, .08, col, -1.3, .45, 0, { studs: false });
  P(b, SP(.25, 0, Math.PI * 2, 0, HALF), new THREE.MeshPhysicalMaterial({ color: 0x9fd8f0, roughness: .05, transmission: .6, transparent: true, opacity: .75 }), .2, .27, 0).scale.set(1.7, 1, 1);
  P(b, cached('spin', () => new THREE.ConeGeometry(.17, .35, 20)), side === 'de' ? 0xf0d040 : RED, 2.0, 0, 0, 0, 0, -HALF);
  const pr = G(); pr.position.set(2.05, 0, 0); b.add(pr); u.prop = pr;
  for (let i = 0; i < 3; i++) { const bl = P(pr, RB(.04, .9, .12, .015), BLK, 0, 0, 0); const a = i * Math.PI * 2 / 3; bl.position.set(0, Math.cos(a) * .3, Math.sin(a) * .3); bl.rotation.x = a; }
  P(b, RB(.6, .03, 4.2, .01), under, .2, -.19, 0);
  for (const z of [-.6, .6]) { P(b, CY(.03, .03, .45, 8), DGR, .4, -.42, z); wheel(b, .12, .06, .4, -.62, z, DGR).rotation.set(HALF, 0, 0); }
  for (const z of [1.5, -1.5]) insignia(b, side, .55, .2, -.0, z, 0, -HALF).position.y = -.05;
  insignia(b, side, .36, -.75, 0, .301);
  u.bombs = []; for (const z of [-.9, .9]) { const bm = G(); P(bm, cached('bomb', () => new THREE.CapsuleGeometry(.09, .32, 6, 14)), 0x3a3a30, 0, 0, 0, 0, 0, HALF); bm.position.set(.25, -.36, z); b.add(bm); u.bombs.push(bm); }
  shadow(g, 1.5); u.type = 'air';
  return g;
}

// ---------- Fabrik ----------
export const VEHICLES = ['schwer', 'leicht', 'trans', 'krad', 'art', 'flak', 'flieger'];
export function buildUnit(key, side) {
  let g;
  switch (key) {
    case 'schwer': g = tank(side, true); break;
    case 'leicht': g = tank(side, false); break;
    case 'trans': g = halftrack(side); break;
    case 'krad': g = krad(side); break;
    case 'art': g = fieldGun(side, false); break;
    case 'flak': g = fieldGun(side, true); break;
    case 'flieger': g = plane(side); break;
    case 'modern': g = modern(); break;
    case 'general-veteran': g = soldier(side, 'general', { veteran: true, abil: 'Veteran' }); break;
    default: if (key.startsWith('general:')) { const ab = key.slice(8); g = soldier(side, 'general', { abil: ab, veteran: ab === 'Veteran' }); break; }
      g = soldier(side, key);
  }
  g.userData.key = key; g.userData.side = side;
  return g;
}
export { brick, slope, insignia, COL };
