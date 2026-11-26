// Bindet die 3D-Klemmbaustein-Modelle in die App ein:
//  1. Armee-Tab, Popups, Mini-Symbole: Standbilder der Modelle statt der SVG-Zeichnungen
//  2. Spielkarte: lebende 3D-Szene mit Aktion + WebGL-Effekten (Mündungsfeuer, Explosion, Steinchen …)
import { cachedURL } from './bildspeicher.js';
// Die 3D-Bibliothek (groß) wird erst nachgeladen: gespeicherte Bilder erscheinen vorher
let THREE, buildUnit, brick, plastic, photo, lights, frame, Fx, heavyP = null;
const heavy = () => heavyP || (heavyP = Promise.all([import('./modelle.js'), import('./foto.js'), import('./effekte.js'), import('./glbfig.js')])
  .then(async ([m, f, e, gl]) => { await gl.GFREADY; ({ THREE, buildUnit, brick, plastic } = m); ({ photo, lights, frame } = f); ({ Fx } = e); }));   // erst wenn das Soldaten-Modell da ist
const getPhoto = async (k, side, h) => (await cachedURL(k, side, h)) || (await heavy(), await photo(k, side, h));

const KEYS = ['pzf', 'general', 'sniper', 'shotgun', 'mg', 'flame', 'grenade', 'mortar', 'mine', 'mech', 'medic', 'schwer', 'leicht', 'trans', 'art', 'krad', 'flieger'];
const still = matchMedia('(prefers-reduced-motion:reduce)').matches;

// ---------- 1. Standbilder ----------
const GENP = {};   // Standbilder der Generäle je Fähigkeit (werden bei Bedarf erzeugt)
const genPhoto = (side, abil) => GENP[side + abil] || (GENP[side + abil] = getPhoto('general:' + abil, side, 300).then(u => { URLKEY.set(u, ['general:' + abil, side]); return u; }));
// Generäle bekommen das Bild mit der Ausrüstung ihrer Fähigkeit
function veteranFix(root = document) {
  root.querySelectorAll('.slot-art').forEach(a => {
    const crest = a.querySelector('.slot-crest[title]'); if (!crest) return;
    const side = a.closest('.army')?.classList.contains('al') ? 'al' : 'de', gsrc = (ART_FACTION[side].general.match(/src="([^"]+)"/) || [])[1], abil = crest.getAttribute('title');
    a.querySelectorAll('img.fig').forEach(i => { if (gsrc && i.getAttribute('src') === gsrc) genPhoto(side, abil).then(u => { i.src = u; }); });
  });
}
for (const id of ['army-de', 'army-al']) { const el = document.getElementById(id); if (el) new MutationObserver(() => veteranFix(el)).observe(el, { childList: true }); }
async function swapArt() {
  const VEH = ['schwer', 'leicht', 'trans', 'art', 'krad', 'flieger'];
  const put = (side, k, u) => { URLKEY.set(u, [k, side]);
    if (k === 'rif') RIFLEMAN_FACTION[side] = `<img class="fig f3d" src="${u}" alt="" draggable="false">`;
    else { ART_FACTION[side][k] = `<img class="fig f3d${VEH.includes(k) ? ' veh' : ''}" src="${u}" alt="" draggable="false">`; if (side === 'de') ART[k] = ART_FACTION.de[k]; } };
  // Zuerst nur die Einheiten der aktuellen Armeen (die sieht man sofort), der Rest danach im Hintergrund
  const need = { de: new Set(['rif']), al: new Set(['rif']) };
  try { for (const side of ['de', 'al']) for (const sl of armies[side] || []) { if (sl.veh) need[side].add(sl.key); for (const u of sl.units || []) need[side].add(u.key); } } catch (e) { }
  await Promise.all(['de', 'al'].flatMap(side => [...need[side]].filter(k => k === 'rif' || KEYS.includes(k)).map(k => getPhoto(k, side, VEH.includes(k) ? 260 : 300).then(u => put(side, k, u)))));
  setTimeout(async () => { for (const side of ['de', 'al']) for (const k of KEYS) if (!need[side].has(k)) put(side, k, await getPhoto(k, side, VEH.includes(k) ? 260 : 300));
    try { renderArmy('de'); renderArmy('al'); } catch (e) { } }, 300);   // danach neu zeichnen (falls inzwischen neu gewürfelt wurde)
  document.documentElement.classList.add('lego3d'); document.documentElement.classList.remove('lego3d-wait'); try { performance.mark('figuren-da'); } catch (e) { } veteranFix();
  try { renderArmy('de'); renderArmy('al'); } catch (e) { }
  try { window.renderSpiel && renderSpiel(); } catch (e) { }
}

// ---------- 2. Lebende Spielkarte ----------
let R = null, view = null;
function liveRenderer() {
  if (R) return R;
  R = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  R.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); R.outputColorSpace = THREE.SRGBColorSpace;
  R.toneMapping = THREE.NeutralToneMapping; R.toneMappingExposure = .9;
  R.domElement.className = 'live3d';
  return R;
}
const kindOf = c => !c ? '' : c.kind === 'rif' ? 'rif' : c.kind === 'veh' ? c.key : (c.unit ? (c.unit.key === 'general' && c.unit.abil ? 'general:' + c.unit.abil.name : c.unit.key) : '');

function mount(art, c) {
  const kind = kindOf(c); if (!kind) return;
  const r = liveRenderer(), scene = new THREE.Scene(); lights(scene, r);
  const stage = new THREE.Group(); scene.add(stage);
  const root = new THREE.Group(); stage.add(root);
  const units = [];
  if (kind === 'rif') { for (let i = 0; i < 5; i++) { const u = buildUnit('rif', c.side); u.position.set((i - 2) * .78, 0, (i % 2) * -.45); u.rotation.y = .9; root.add(u); units.push(u); } }
  else { const u = buildUnit(kind, c.side); u.rotation.y = u.userData.type === 'inf' ? .85 : -.35; root.add(u); units.push(u); }
  // Grundplatte aus Steinen, wie auf dem Spieltisch
  const box = new THREE.Box3().setFromObject(root), sz = box.getSize(new THREE.Vector3());
  const tKind = targetKind(kind), zc0 = (box.min.z + box.max.z) / 2;
  const tx = box.max.x + (tKind === 'tank' ? 1.9 : 1.1), tz = zc0 + .1;
  const x0 = box.min.x - .3, x1 = tKind ? tx + (tKind === 'tank' ? 1.5 : .7) : box.max.x + 1.4, zc = zc0;
  const pw = Math.ceil((x1 - x0) / .2) * .2, pd = Math.ceil((Math.max(sz.z, 1.0) + .5) / .2) * .2;
  brick(stage, pw, .08, pd, c.side === 'de' ? 0x9a9d9b : 0x6f8a46, (x0 + x1) / 2, -.04, zc);
  const hit = tKind ? new THREE.Vector3(tx, .05, tz + .2) : new THREE.Vector3(box.max.x + .85, .05, zc + .15);   // Einschlagstelle: bei den Gegnern
  art.classList.add('has3d');
  const w = Math.max(120, art.clientWidth), h = Math.max(80, art.clientHeight);   // Layoutgröße: unabhängig von der Umdreh-Animation
  // Kamera gerade von vorn, leicht erhöht, enger Bildwinkel: Platte liegt flach und parallel zur Kartenkante, immer ganz im Bild
  const cam = new THREE.PerspectiveCamera(16, w / h);
  frame(cam, stage, w / h, 1.02, new THREE.Vector3(0, .42, 1));
  r.setSize(w, h, false);
  art.appendChild(r.domElement);
  const fx = new Fx(scene, cam);
  view = { pbox: [x0 + .1, x1 - .1, zc - pd / 2 + .1, zc + pd / 2 - .1], stage, hit, tKind, tpos: new THREE.Vector3(tx, 0, tz), targets: [], debris: [], art, scene, cam, root, units, fx, kind, side: c.side, t0: performance.now(), last: performance.now(), base: cam.position.clone(), id: Math.random() };
  spawnTargets(view); frame(cam, stage, w / h, 1.02, new THREE.Vector3(0, .42, 1)); view.base = cam.position.clone();
  loop(); requestAnimationFrame(refit);
  return view;
}

// ---------- Gegner auf der Platte: werden getroffen und fallen im Klemmbaustein-Stil auseinander ----------
const NO_TARGET = new Set(['mech', 'medic', 'flak']);
const AT = new Set(['schwer', 'leicht', 'pzf', 'art']);
function targetKind(kind) { if (NO_TARGET.has(kind)) return null; return AT.has(kind) ? 'tank' : 'inf'; }
function spawnTargets(v) {
  if (v.wreck) { v.scene.remove(v.wreck.g); v.wreck = null; }
  for (const t of v.targets) v.stage.remove(t); for (const d of v.debris) v.scene.remove(d.m); for (const m of v.mineMeshes || []) v.stage.remove(m); v.targets = []; v.debris = []; v.mineMeshes = [];
  if (!v.tKind) return;
  const foe = v.side === 'de' ? 'al' : 'de';
  if (v.tKind === 'tank') { const t = buildUnit('leicht', foe); t.rotation.y = Math.PI + .25; t.position.copy(v.tpos); v.stage.add(t); v.targets.push(t); }
  else for (let i = 0; i < (v.kind === 'rif' ? 3 : 2); i++) { const t = buildUnit('rif', foe); t.position.set(v.tpos.x + (i % 2) * .5, 0, v.tpos.z - .35 + i * .42); t.rotation.y = -HALF * .85; v.stage.add(t); v.targets.push(t); }
}
const HALF = Math.PI / 2;
function breakApart(v, power = 1, only = null) {
  for (const t of (only || v.targets)) {
    if (t.userData.broken) continue; t.userData.broken = true;
    if (t.userData.shadow) t.userData.shadow.visible = false;
    t.updateMatrixWorld(true);
    // Bruchstücke: ganze Steine (mit Noppen) und einzelne Teile außerhalb von Steinen
    const chunks = [], tur = t.userData.turret;
    (function walk(o) { for (const c of [...o.children]) { if (c === t.userData.shadow) continue; if (c.userData.brick || (c.isMesh && !c.children.some(k => k.isMesh)) || c === tur) chunks.push(c); else walk(c); } })(t);
    const center = new THREE.Box3().setFromObject(t).getCenter(new THREE.Vector3());
    if (t.userData.type === 'veh') setTimeout(() => wreckSmoke(v, center.clone().setY(0)), 450);
    for (const m of chunks) {
      const isTur = m === tur;
      v.scene.attach(m);
      const bb = new THREE.Box3().setFromObject(m), size = bb.getSize(new THREE.Vector3()).length(), p = bb.getCenter(new THREE.Vector3());
      const heavy = Math.max(1, size * 2.2), away = p.clone().sub(center).setY(0); if (away.lengthSq() < 1e-4) away.set(1, 0, 0); away.normalize();
      const vel = isTur ? V(.6, 3.6 * power, -.4) : away.multiplyScalar((.5 + Math.random() * .9) * power / heavy).add(V((Math.random() - .3) * .6 / heavy, (1.2 + Math.random() * 1.8) * power / Math.sqrt(heavy), 0));
      vel.z = -Math.abs(vel.z) * .6 - (isTur ? 0 : Math.random() * .3);   // nie Richtung Kamera
      const sp = (isTur ? 5 : 9) / heavy;
      v.debris.push({ m, vel, spin: V((Math.random() - .5) * sp, (Math.random() - .5) * sp, (Math.random() - .5) * sp), r: Math.max(.04, Math.min(size * .22, .3)) });
    }
  }
}
// Qualmendes Wrack: Rauch aus runden grauen 1x1-Steinen + kleines Lego-Flämmchen
function wreckSmoke(v, pos) {
  if (view !== v) return;
  const g = new THREE.Group(); g.position.copy(pos); v.scene.add(g);
  const puffGeo = new THREE.CylinderGeometry(.11, .11, .1, 16), studGeo = new THREE.CylinderGeometry(.06, .06, .05, 12), puffs = [];
  for (let i = 0; i < 14; i++) { const c = [0x5b6066, 0x3e4044, 0x8a8f94, 0x2a2c2e][i % 4], m = new THREE.Group(); const a = new THREE.Mesh(puffGeo, plastic(c)), b = new THREE.Mesh(studGeo, plastic(c)); b.position.y = .075; m.add(a, b); g.add(m); puffs.push({ m, t: i * .2, x: (Math.random() - .5) * .3, z: (Math.random() - .5) * .3, w: Math.random() * 6 }); }
  const fm = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .9, toneMapped: false });
  const fl = new THREE.Group(); fl.position.set(.05, .1, .1); g.add(fl);
  const o = new THREE.Mesh(new THREE.ConeGeometry(.13, .4, 6), fm(0xff4a00)); o.position.y = .2; fl.add(o);
  const i2 = new THREE.Mesh(new THREE.ConeGeometry(.07, .24, 6), fm(0xffc400)); i2.position.y = .13; fl.add(i2);
  v.wreck = { g, puffs, fl, t: 0 };
}
function stepWreck(v, dt) {
  const w = v.wreck; w.t += dt;
  for (const p of w.puffs) { p.t += dt; const k = (p.t % 2.8) / 2.8; p.m.position.set(p.x + Math.sin(w.t * 1.2 + p.w) * .1 * k - k * .3, .25 + k * 1.8, p.z - k * .2); p.m.scale.setScalar(.5 + k * 1.1); p.m.visible = k > .03 && k < .96; }
  const s = 1 + Math.sin(w.t * 14) * .14 + Math.sin(w.t * 8.3) * .08; w.fl.scale.set(1, s, 1);
}
function stepDebris(v, dt) {
  for (const d of v.debris) {
    if (d.rest) continue;
    d.vel.y -= 9.5 * dt; d.m.position.addScaledVector(d.vel, dt);
    d.m.rotation.x += d.spin.x * dt; d.m.rotation.y += d.spin.y * dt; d.m.rotation.z += d.spin.z * dt;
    if (v.pbox) { const b = v.pbox; if (d.m.position.x < b[0] || d.m.position.x > b[1]) { d.vel.x *= -.4; d.m.position.x = Math.min(b[1], Math.max(b[0], d.m.position.x)); } if (d.m.position.z < b[2] || d.m.position.z > b[3]) { d.vel.z *= -.4; d.m.position.z = Math.min(b[3], Math.max(b[2], d.m.position.z)); } }
    if (d.m.position.y < d.r) { d.m.position.y = d.r; d.vel.y *= -.32; d.vel.x *= .55; d.vel.z *= .55; d.spin.multiplyScalar(.5); if (Math.abs(d.vel.y) < .25 && d.vel.length() < .3) d.rest = true; }
  }
}
// Zeitpunkt des Treffers je Einheit (Sekunden nach Start der Aktion)
const HIT_T = { rif: .55, sniper: .72, shotgun: .45, mg: .55, general: .45, flame: .85, pzf: .68, grenade: 1.08, mortar: 1.5, schwer: .9, leicht: .9, art: .55, trans: 1.35, krad: 1.15, flieger: 1.65 };

// ---------- Aktionen je Einheit ----------
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function muzzleOf(obj) {
  const m = obj.userData.muzzle || V(0, 0, .5); obj.updateWorldMatrix(true, false);
  const p = obj.localToWorld(m.clone()), q = obj.localToWorld(m.clone().multiplyScalar(.5));
  return { p, dir: p.clone().sub(q).normalize() };
}
function recoil(obj, axis = 'z', amt = .06, t = .12) { if (!obj || !window.gsap) return; const o = obj.position[axis]; gsap.fromTo(obj.position, { [axis]: o - amt }, { [axis]: o, duration: t, ease: 'power2.out' }); }
// Sounds zu den Aktionen (Waffen-Sounds aus js/sounds.js; Flammenwerfer wird als Rauschen erzeugt)
const snd = (n, rate = 1) => { try { if (typeof Sounds !== 'undefined') Sounds.play(n, rate); } catch (e) { } };
let FCTX = null;
function flameSound(dur = 1.1) {
  try {
    const vol = typeof MASTER_VOL !== 'undefined' ? MASTER_VOL : .8; if (vol <= 0) return;
    FCTX = FCTX || new (window.AudioContext || window.webkitAudioContext)(); const c = FCTX; if (c.state === 'suspended') c.resume();
    const len = c.sampleRate * dur, b = c.createBuffer(1, len, c.sampleRate), d = b.getChannelData(0); for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = c.createBufferSource(); src.buffer = b; const f = c.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 900; const g = c.createGain(), t = c.currentTime;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(.5 * vol, t + .08); g.gain.setValueAtTime(.45 * vol, t + dur - .3); g.gain.linearRampToValueAtTime(0, t + dur);
    f.frequency.setValueAtTime(600, t); f.frequency.linearRampToValueAtTime(1400, t + .2);
    src.connect(f).connect(g).connect(c.destination); src.start();
  } catch (e) { }
}
function act(v) {
  const { fx, units, kind, hit } = v; fx.clear(); spawnTargets(v);
  if (v.tKind) { const ht = kind.startsWith('general:') ? (kind === 'general:Veteran' ? .55 : .45) : HIT_T[kind]; if (ht) fx.at(ht, () => breakApart(v, v.tKind === 'tank' ? 1.3 : 1)); }
  const aim = v.tKind ? hit.clone().setY(v.tKind === 'tank' ? .45 : .75) : null;
  const u = units[0], d = u.userData, gs = window.gsap;
  const shots = (obj, n, gap, o = {}) => { for (let i = 0; i < n; i++) fx.at((o.d || .25) + i * gap, () => { if (o.snd !== false) { if (o.burst) { if (i === 0) snd('mg', .95 + Math.random() * .1); } else snd(o.snd || 'gewehr', .9 + Math.random() * .2); } const m0 = muzzleOf(obj), p = m0.p, dir = aim ? aim.clone().add(V(0, (Math.random() - .5) * .3, (Math.random() - .5) * .3)).sub(p).normalize() : m0.dir; fx.muzzle(p, dir, o.k || 1); fx.tracer(p, dir, aim ? p.distanceTo(aim) + .3 : (o.len || 4), o.speed || 20); if (o.cas) fx.casing(p.clone().addScaledVector(dir, -.4)); recoil(obj, o.axis || 'z', o.rec || .05); if (o.hit) fx.at(.18, () => { fx.explosion(hit.clone(), .35); snd('explosion', 1.3); }); }); };
  const ground = (obj, dist) => { const { p, dir } = muzzleOf(obj); return p.clone().addScaledVector(dir.setY(0).normalize(), dist).setY(.05); };
  if (kind.startsWith('general:')) {
    const ab = kind.slice(8), head = V(0, 1.9, 0);
    if (ab === 'Veteran') shots(d.weapon, 9, .09, { cas: true, rec: .03, burst: true }); else shots(d.weapon, 2, .35, { d: .3, snd: 'pistole' });
    const fxa = { Besetzen: () => fx.sparkle(head, 'star', 0xffd34a, 8), Schussbefehl: () => { fx.at(.4, () => { const p = d.armL.userData.hand.getWorldPosition(new THREE.Vector3()); for (let i = 0; i < 14; i++) fx.at(i * .05, () => fx.spawn({ p: p.clone().add(V(0, i * .18, 0)), life: .5, s0: .25, s1: .05, c0: 0xff4020, c1: 0xffa040 })); fx.at(.75, () => { fx.spawn({ p: p.clone().add(V(0, 2.6, 0)), life: 1.2, s0: .9, s1: 1.4, c0: 0xff3010, c1: 0xff9040 }); fx.flash(p.clone().add(V(0, 2.4, 0)), 5); }); }); },
      Blitz: () => { fx.at(.2, () => { fx.flash(head, 8); fx.sparkle(head, 'star', 0xfff07a, 12); fx.shake(.05, .3); }); }, Unsterblich: () => fx.sparkle(V(0, 1.2, .3), 'plus', 0x6dff7a, 12), Blutrausch: () => fx.sparkle(V(0, 1.2, .3), 'glow', 0xff2020, 14),
      Rage: () => { for (let i = 0; i < 16; i++) fx.at(i * .05, () => fx.fire(V((Math.random() - .5) * .6, .1, (Math.random() - .5) * .4), V(0, .4, 0), .6)); }, Verschanzen: () => { fx.dust(V(0, .05, .5), 1); fx.dust(V(.4, .05, .5), .8); },
      Monster: () => { fx.at(.3, () => { fx.dust(V(.3, .05, .4), 1.3); fx.shake(.08, .4); }); }, Anführer: () => fx.sparkle(head, 'star', 0xffd34a, 14), Veteran: () => fx.sparkle(head, 'star', 0xffd34a, 8) };
    (fxa[ab] || (() => fx.sparkle(head, 'star', 0xffd34a, 10)))();
    return;
  }
  switch (kind) {
    case 'rif': units.forEach((s, i) => shots(s.userData.weapon, 2, .32, { d: .2 + i * .07, cas: true })); break;
    case 'sniper': shots(d.weapon, 1, 0, { d: .5, k: 1.4, len: 8, speed: 40, hit: 3.5, snd: 'scharf' }); break;
    case 'shotgun': fx.at(.3, () => { snd('schrot'); const { p, dir } = muzzleOf(d.weapon); fx.muzzle(p, dir, 1.6); for (let i = 0; i < 6; i++) fx.tracer(p, dir.clone().add(V((Math.random() - .5) * .3, (Math.random() - .5) * .15, (Math.random() - .5) * .3)), 2.5, 16); recoil(d.weapon, 'z', .1); fx.casing(p.clone().addScaledVector(dir, -.4)); }); break;
    case 'mg': shots(d.weapon, 9, .09, { cas: true, rec: .03, burst: true }); break;
    case 'general-veteran': shots(d.weapon, 9, .09, { cas: true, rec: .03 }); fx.at(.2, () => fx.sparkle(V(0, 1.9, 0), 'star', 0xffd34a, 10)); break;
    case 'general': shots(d.weapon, 2, .35, { d: .3, snd: 'pistole' }); fx.at(.2, () => fx.sparkle(V(0, 1.9, 0), 'star', 0xffd34a, 10)); break;
    case 'flame': fx.at(.25, () => flameSound(1.1)); for (let i = 0; i < 26; i++) fx.at(.25 + i * .035, () => { const { p, dir } = muzzleOf(d.weapon); fx.fire(p, dir, 1); if (i % 5 === 0) fx.flash(p, 3); }); fx.at(1.2, () => fx.smoke(ground(d.weapon, 1.6).setY(.4), 1, 4, 0x3a3630)); break;
    case 'pzf': fx.at(.35, () => { snd('abschuss', .8); const { p, dir } = muzzleOf(d.weapon); fx.muzzle(p, dir, 1.4); const back = d.weapon.localToWorld(d.weapon.userData.back.clone()); fx.smoke(back, 1.2, 6, 0xb0aaa0); fx.tracer(p, dir, 3.5, 12); fx.at(.3, () => { fx.explosion(hit.clone(), .8); snd('explosion'); }); }); break;
    case 'grenade': if (gs) { gs.fromTo(d.armR.rotation, { x: d.armR.rotation.x - .4 }, { x: d.armR.rotation.x + 1.6, duration: .25, delay: .2, ease: 'power3.in', yoyo: true, repeat: 1 }); }
      fx.at(.45, () => { const g = d.grenade; const p0 = g.getWorldPosition(new THREE.Vector3()); g.visible = false; const t = { k: 0 }; const end = hit.clone(); const ghost = g.clone(); ghost.visible = true; v.scene.add(ghost);
        gs ? gs.to(t, { k: 1, duration: .6, ease: 'none', onUpdate: () => { ghost.position.lerpVectors(p0, end, t.k); ghost.position.y += Math.sin(t.k * Math.PI) * 1.2; ghost.rotation.z -= .3; }, onComplete: () => { v.scene.remove(ghost); fx.explosion(end, 1); snd('explosion'); setTimeout(() => g.visible = true, 900); } }) : fx.explosion(end, 1); }); break;
    case 'mortar': fx.at(.3, () => { d.shell.visible = false; }); fx.at(.55, () => { snd('abschuss', .7); const { p, dir } = muzzleOf(d.mortar); fx.muzzle(p, dir, 1.5); fx.smoke(p, 1, 4); fx.tracer(p, dir, 3, 14); }); fx.at(1.5, () => { fx.explosion(hit.clone(), .9); snd('explosion', .95); }); fx.at(2.4, () => d.shell.visible = true); break;
    case 'mine': {   // bücken, drei Minen legen, Gegner laufen los und treten drauf
      const body = d.body, ax = new THREE.Box3().setFromObject(v.root).max.x, mx = (ax + v.tpos.x) / 2 - .1;
      if (gs) { gs.to(body.rotation, { x: .55, duration: .35, ease: 'power2.out' }); gs.to(body.position, { y: -.12, duration: .35 }); gs.to(body.rotation, { x: 0, duration: .35, delay: 1.5 }); gs.to(body.position, { y: 0, duration: .35, delay: 1.5 }); }
      const mines = v.targets.map((t, i) => ({ t, x: mx + (i % 2) * .15, z: t.position.z }));
      v.mineMeshes = [];
      mines.forEach((mn, i) => fx.at(.45 + i * .4, () => {
        const g = new THREE.Group(); g.position.set(mn.x, .025, mn.z); v.stage.add(g); v.mineMeshes.push(g);
        g.add(new THREE.Mesh(new THREE.CylinderGeometry(.13, .14, .05, 20), plastic(0x3e4a2a))); const st = new THREE.Mesh(new THREE.CylinderGeometry(.05, .05, .04, 14), plastic(0x2a2c2e)); st.position.y = .04; g.add(st);
        if (gs) gs.from(g.scale, { x: .1, y: .1, z: .1, duration: .2, ease: 'back.out(2)' }); snd('button', .7);
        if (gs) gs.fromTo(d.armR.rotation, { x: d.armR.rotation.x - .5 }, { x: d.armR.rotation.x, duration: .25 });
      }));
      mines.forEach((mn, i) => fx.at(1.9 + i * .25, () => {
        const t = mn.t, st = { k: 0 }, x0 = t.position.x;
        if (gs) gs.to(st, { k: 1, duration: 1.1, ease: 'none', onUpdate: () => { t.position.x = x0 + (mn.x + .05 - x0) * st.k; t.position.y = Math.abs(Math.sin(st.k * 14)) * .04; t.rotation.z = Math.sin(st.k * 14) * .06; },
          onComplete: () => { const m = v.mineMeshes[i]; if (m) v.stage.remove(m); fx.explosion(V(mn.x, .05, mn.z), .9); snd('explosion', 1 + i * .1); breakApart(v, 1.1, [t]); } });
      }));
      break;
    }
    case 'mech': if (gs) gs.fromTo(d.armR.rotation, { x: d.armR.rotation.x }, { x: d.armR.rotation.x + .9, duration: .14, yoyo: true, repeat: 5, ease: 'power2.in' }); for (let i = 0; i < 3; i++) fx.at(.14 + i * .28, () => { const p = d.tool.getWorldPosition(new THREE.Vector3()); for (let k = 0; k < 8; k++) fx.spawn({ p, v: V((Math.random() - .5) * 3, Math.random() * 3, (Math.random() - .5) * 3), life: .4, s0: .06, s1: .02, c0: 0xffe090, c1: 0xff7020, g: -9 }); fx.flash(p, 1.5); }); break;
    case 'medic': {   // verwundeten Kameraden heilen: der steht auf, springt zweimal und rennt rechts raus
      if (v.patient) v.stage.remove(v.patient);
      const ax = new THREE.Box3().setFromObject(v.root).max.x, pt = buildUnit('rif', v.side); v.patient = pt; v.stage.add(pt);
      if (pt.userData.shadow) pt.userData.shadow.visible = false;
      const px = ax + .55, pz = .15; pt.position.set(px, .16, pz); pt.rotation.set(-HALF, 0, HALF * .9);   // liegt am Boden
      const body = d.body;
      if (gs) { gs.to(body.rotation, { x: .45, duration: .35, ease: 'power2.out' }); gs.to(body.rotation, { x: 0, duration: .35, delay: 1.45 });
        gs.fromTo(d.armR.rotation, { x: d.armR.rotation.x }, { x: d.armR.rotation.x + .5, duration: .3, yoyo: true, repeat: 3, delay: .3 }); }
      fx.at(.35, () => { fx.sparkle(V(px, .45, pz), 'plus', 0x6dff7a, 14); fx.flash(V(px, .8, pz + .3), 2); snd('button', 1.3); });
      fx.at(.9, () => fx.sparkle(V(px, .45, pz), 'plus', 0x6dff7a, 10));
      fx.at(1.5, () => { if (!gs) return;
        const tl = gs.timeline();
        tl.to(pt.rotation, { x: 0, z: 0, y: HALF, duration: .4, ease: 'back.out(1.6)' }, 0).to(pt.position, { y: 0, duration: .4 }, 0)
          .to(pt.position, { y: .38, duration: .18, ease: 'power2.out' }, .5).to(pt.position, { y: 0, duration: .18, ease: 'power2.in' })
          .to(pt.position, { y: .38, duration: .18, ease: 'power2.out' }).to(pt.position, { y: 0, duration: .18, ease: 'power2.in' })
          .to(pt.position, { x: px + 4.5, duration: 1.1, ease: 'power1.in', onUpdate() { pt.position.y = Math.abs(Math.sin(pt.position.x * 9)) * .06; pt.rotation.z = Math.sin(pt.position.x * 9) * .08; } })
          .call(() => { pt.visible = false; });
      });
      break;
    }
    case 'schwer': case 'leicht': {
      const heavy = kind === 'schwer';
      if (gs) gs.fromTo(d.turret.rotation, { y: -.35 }, { y: 0, duration: .5, ease: 'power2.inOut' });
      fx.at(.6, () => { snd('kanone', heavy ? .9 : 1.1); const { p, dir } = muzzleOf(d.barrel); fx.muzzle(p, dir, heavy ? 2.6 : 1.8); fx.smoke(p, heavy ? 1.6 : 1.1, 6); fx.tracer(p, dir, 6, 26); recoil(d.barrel, 'x', heavy ? .35 : .22, .3); if (gs) gs.fromTo(d.body.rotation, { z: heavy ? .06 : .045 }, { z: 0, duration: .5, ease: 'elastic.out(1,.4)' }); fx.dust(V(-1, .05, .9)); fx.dust(V(.8, .05, -.9)); fx.shake(heavy ? .1 : .06, .4); });
      fx.at(.9, () => { fx.explosion(hit.clone(), 1.1); snd('explosion', .9); }); break;
    }
    case 'trans': if (gs) gs.fromTo(u.position, { x: -1.2 }, { x: 0, duration: 1.1, ease: 'power2.out' }); for (let i = 0; i < 8; i++) fx.at(i * .12, () => { fx.dust(u.localToWorld(V(-.6, 0, .8)), .8); fx.smoke(u.localToWorld(d.exhaust.clone()), .5, 1, 0x3a3836); }); shots(d.weapon, 6, .1, { d: 1.2, rec: .03, burst: true }); break;
    case 'krad': if (gs) { gs.fromTo(u.position, { x: -1.5 }, { x: 0, duration: .9, ease: 'power3.out' }); gs.fromTo(d.body.rotation, { z: .18 }, { z: 0, duration: .8, delay: .4, ease: 'bounce.out' }); } for (let i = 0; i < 6; i++) fx.at(i * .1, () => fx.dust(u.localToWorld(V(-.8, 0, 0)), .7)); shots(d.weapon, 7, .09, { d: 1.0, rec: .03, burst: true }); break;
    case 'art': fx.at(.5, () => { if (v.tKind) { fx.explosion(hit.clone(), 1.1); snd('explosion', .9); } }); fx.at(.4, () => { snd('kanone', .8); const { p, dir } = muzzleOf(d.muzzles[0]); fx.muzzle(p, dir, 3); fx.smoke(p, 2, 8, 0x8a857c); fx.tracer(p, dir, 7, 26); recoil(d.muzzles[0], 'x', .4, .35); fx.dust(V(-.3, .05, .8), 1.4); fx.dust(V(-.3, .05, -.8), 1.4); fx.shake(.12, .5); }); break;
    case 'flak': for (let i = 0; i < 8; i++) fx.at(.3 + i * .13, () => { snd('abschuss', 1.15 + Math.random() * .1); const br = d.muzzles[i % 2]; const { p, dir } = muzzleOf(br); fx.muzzle(p, dir, 1.1); fx.tracer(p, dir, 6, 22); recoil(br, 'x', .12, .1); if (i % 2) fx.at(.35, () => fx.smoke(p.clone().addScaledVector(dir, 4.5), .7, 2, 0x2a2826)); }); break;
    case 'flieger': {
      snd('plane');
      if (gs) { gs.fromTo(u.position, { x: -4, y: .6 }, { x: 0, y: 0, duration: 1.0, ease: 'power2.out' }); gs.fromTo(d.body.rotation, { x: .5 }, { x: 0, duration: 1.2, ease: 'sine.out' }); }
      d.bombs.forEach((bm, i) => fx.at(1.1 + i * .18, () => { const p0 = bm.getWorldPosition(new THREE.Vector3()); bm.visible = false; const ghost = bm.clone(); ghost.visible = true; v.scene.add(ghost); const t = { y: p0.y }, tgt = v.tKind ? hit.clone().add(V((i - .5) * .5, 0, 0)) : null; gs ? gs.to(t, { y: .1, duration: .45, ease: 'power2.in', onUpdate: () => { const k = 1 - (t.y - .1) / (p0.y - .1); ghost.position.set(tgt ? p0.x + (tgt.x - p0.x) * k : p0.x + (p0.y - t.y) * .5, t.y, tgt ? p0.z + (tgt.z - p0.z) * k : p0.z); }, onComplete: () => { v.scene.remove(ghost); fx.explosion(ghost.position.clone(), 1.1); snd('explosion', .9 + Math.random() * .2); setTimeout(() => bm.visible = true, 1600); } }) : null; })); break;
    }
  }
}

function loop() {
  const v = view; if (!v) return;
  if (!v.art.isConnected) { view = null; return; }
  requestAnimationFrame(loop);
  if (document.hidden) return;
  const now = performance.now(), dt = Math.min(.05, (now - v.last) / 1000); v.last = now;
  const t = (now - v.t0) / 1000;
  for (const u of v.units) { const d = u.userData; if (d.prop) d.prop.rotation.x += dt * 40; if (d.type === 'inf' && d.body) d.body.position.y = Math.abs(Math.sin(t * 2.2 + u.position.x)) * .012; if (d.type === 'air') d.body.position.y = 1.25 + Math.sin(t * 1.6) * .06; }
  if (v.debris.length) stepDebris(v, dt);
  if (v.wreck) stepWreck(v, dt);
  const sh = v.fx.update(dt);
  v.cam.position.copy(v.base).add(V((Math.random() - .5) * sh, (Math.random() - .5) * sh, 0));
  R.render(v.scene, v.cam);
}

// Nach jedem Neuzeichnen des Spiel-Tabs die Szene wieder einhängen
function attach(play) {
  if (!THREE) { heavy().then(() => attach(play)); return; }
  const art = document.querySelector('#tab-spiel .gcard .gc-art'); const c = window.spielGet && spielGet().cur, s = window.spielGet && spielGet();
  if (!art || !c || (s && s.end !== null)) { view = null; return; }
  if (view && view.art === art) { if (play) act(view); return; }
  const v = mount(art, c); if (v && (play || !still)) act(v);
}
// Rundenende: Missionsziel-Felder als 3D-Modell, Flakgeschütz in 3D
function roundEnd() {
  const ic = document.querySelector('#tab-spiel .gcard.rend .re-ic'); if (!ic || ic.dataset.d3) return; ic.dataset.d3 = '1';
  const name = (ic.parentElement.querySelector('.gc-name')?.textContent || '').replace('⚑', '').trim();
  const emo = ic.querySelector('.re-emo'), flak = ic.querySelector('.re-art.flak');
  const p = typeof PIECES !== 'undefined' ? PIECES.find(x => x.name === name) : null;
  const put = (el, key) => getPhoto(key, 'de', 260).then(u => { if (el.isConnected) el.innerHTML = `<img class="fig f3d veh" src="${u}" alt="" draggable="false">`; });
  if (emo && p) put(emo, 'feld:' + p.key);
  if (flak) put(flak, 'flak');
}
new MutationObserver(roundEnd).observe(document.getElementById('tab-spiel'), { childList: true });

// Bild antippen: Aktion der 3D-Szene erneut abspielen
document.addEventListener('click', e => { const a = e.target.closest('#tab-spiel .gcard .gc-art'); if (a && view && view.art === a) act(view); });
const tab = document.getElementById('tab-spiel');
new MutationObserver(() => attach(false)).observe(tab, { childList: true });
function refit() { const v = view; if (!v) return; const r = { width: v.art.clientWidth, height: v.art.clientHeight }; if (r.width < 10 || r.height < 10) return; R.setSize(r.width, r.height, false); frame(v.cam, v.stage, r.width / r.height, 1.02, new THREE.Vector3(0, .42, 1)); v.base = v.cam.position.clone(); }
new ResizeObserver(refit).observe(tab);

const swapReady = swapArt().then(() => attach(false), e => { console.warn(e); document.documentElement.classList.remove('lego3d-wait'); });

// ======== Regelwerk in 3D: Bilder der Einheiten, Fahrzeuge und Felder ========
const URLKEY = new Map();   // Bild-URL -> [Schlüssel, Seite] (für die Drehbühne im Popup)
const keyPhoto = async (k, side, h) => { const u = await getPhoto(k, side, h); URLKEY.set(u, [k, side]); return u; };
const RW = {
  infanterie: [['rif', 'de'], ['rif', 'al']], general: [['general', 'de'], ['general', 'al']], minenleger: [['mine', 'de'], ['mine', 'al']],
  flammenwerfer: [['flame', 'de'], ['flame', 'al']], medikit: [['medic', 'de'], ['medic', 'al']], mechaniker: [['mech', 'de'], ['mech', 'al']],
  spezialeinheiten: ['sniper', 'shotgun', 'mg', 'grenade', 'mortar', 'pzf'].map(k => [k, 'de']),
  'schwerer-panzer': [['schwer', 'de'], ['schwer', 'al']], 'leichter-panzer': [['leicht', 'de'], ['leicht', 'al']], kraftrad: [['krad', 'de'], ['krad', 'al']],
  'kampfflieger-werte': [['flieger', 'de'], ['flieger', 'al']], fahrzeuge: [['trans', 'de'], ['art', 'de'], ['flak', 'de']],
};
const VEHK = ['schwer', 'leicht', 'trans', 'art', 'krad', 'flieger', 'flak'];
let rwDone = false;
async function regelwerk3d() {
  if (rwDone) return; rwDone = true;
  for (const [id, list] of Object.entries(RW)) {
    const card = document.getElementById(id), h = card && card.querySelector('h2'); if (!h) continue;
    const box = document.createElement('div'); box.className = 'rw3d' + (list.length > 2 ? ' many' : ''); h.after(box);
    const urls = await Promise.all(list.map(([k, s]) => keyPhoto(k, s, VEHK.includes(k) ? 260 : 300)));
    box.innerHTML = urls.map((u, i) => `<img class="fig f3d${VEHK.includes(list[i][0]) ? ' veh' : ''}" src="${u}" alt="" draggable="false">`).join('');
  }
  // Kartenfelder als Galerie
  const g = document.getElementById('gelaende');
  if (g && typeof PIECES !== 'undefined') {
    const box = document.createElement('div'); box.className = 'rw3d felder'; box.innerHTML = '<h3>Die Felder der Karte</h3><div class="rw-grid"></div>'; g.appendChild(box);
    const grid = box.querySelector('.rw-grid');
    for (const p of PIECES) { const u = await getPhoto('feld:' + p.key, 'de', 220); grid.insertAdjacentHTML('beforeend', `<figure><img class="fig f3d veh" src="${u}" alt="" draggable="false"><figcaption>${p.name}</figcaption></figure>`); }
  }
}
const rwTab = document.getElementById('tab-regeln');
if (rwTab) { const go = () => { if (!rwTab.hidden) swapReady.then(regelwerk3d); }; new MutationObserver(go).observe(rwTab, { attributes: true, attributeFilter: ['hidden'] }); go(); }

// ======== Armee-Tab: lebende Drehbühne im Popup ========
let PR = null, pop3 = null;
function popRenderer() { if (PR) return PR; PR = new THREE.WebGLRenderer({ antialias: true, alpha: true }); PR.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); PR.outputColorSpace = THREE.SRGBColorSpace; PR.toneMapping = THREE.NeutralToneMapping; PR.toneMappingExposure = .9; PR.domElement.className = 'turn3d'; return PR; }
const SOUND_OF = { rif: 'gewehr', sniper: 'scharf', shotgun: 'schrot', mg: 'mg', general: 'pistole', pzf: 'abschuss', mortar: 'abschuss', grenade: 'explosion', schwer: 'kanone', leicht: 'kanone', art: 'kanone', flak: 'abschuss', trans: 'mg', krad: 'mg', flieger: 'plane' };
let lastSlot = null;   // zuletzt angetippter Armee-Eintrag (für das Fahrzeug-Popup)
document.addEventListener('click', e => { const s = e.target.closest('.slot[data-veh]'); if (s) lastSlot = { key: s.dataset.veh, side: s.closest('.army')?.classList.contains('al') ? 'al' : 'de', t: performance.now() }; }, true);
async function popupTurntable() {
  const popEl = document.getElementById('pop'); if (!popEl || popEl.hidden) { pop3 = null; return; }
  let img = [...popEl.querySelectorAll('img.f3d')].find(i => URLKEY.has(i.getAttribute('src'))), key, side, host;
  if (img) { [key, side] = URLKEY.get(img.getAttribute('src')); host = img;
    if ((img.clientHeight || 0) < 90) {   // kleines Symbol im Popup: Bühne groß oben drüber
      const body = popEl.querySelector('.pop-card'), first = body && body.querySelector('.pu-unit, #pop-body'); if (!first) return;
      host = body.querySelector('.turn-host'); if (!host) { host = document.createElement('div'); host.className = 'turn-host'; first.before(host); } } }
  else if (lastSlot && performance.now() - lastSlot.t < 1500) {   // Fahrzeug: Bühne oben ins Popup setzen
    const body = document.getElementById('pop-body'); if (!body || body.querySelector('.turn-host')) return;
    host = document.createElement('div'); host.className = 'turn-host'; body.prepend(host); key = lastSlot.key; side = lastSlot.side;
  } else return;
  if (pop3 && pop3.host === host) return;
  if (!THREE) await heavy();
  const r = popRenderer(), scene = new THREE.Scene(); lights(scene, r);
  const g = buildUnit(key, side); scene.add(g);
  const veh = g.userData.type !== 'inf', w = host.tagName === 'IMG' ? Math.max(120, host.clientWidth || 160) : Math.min(320, host.clientWidth || 300), h = host.tagName === 'IMG' ? Math.max(100, host.clientHeight || 130) : (veh ? 150 : 170), a = w / h;
  const box = new THREE.Box3().setFromObject(g), c = box.getCenter(new THREE.Vector3()); g.position.sub(new THREE.Vector3(c.x, 0, c.z));
  const cam = new THREE.PerspectiveCamera(26, a); frame(cam, g, a, 1.06, new THREE.Vector3(.2, .3, 1.2));
  r.setSize(w, h, false); r.domElement.style.width = w + 'px'; r.domElement.style.height = h + 'px';
  if (host.tagName === 'IMG') { host.style.display = 'none'; host.after(r.domElement); } else host.appendChild(r.domElement);
  const me = pop3 = { host, scene, cam, g, t0: performance.now() };
  snd(SOUND_OF[key] || 'button');
  (function spin() { if (pop3 !== me || !host.isConnected || popEl.hidden) { if (pop3 === me) pop3 = null; return; } requestAnimationFrame(spin);
    const t = (performance.now() - me.t0) / 1000; g.rotation.y = -.4 + t * .7; if (g.userData.prop) g.userData.prop.rotation.x += .5; r.render(scene, cam); })();
}
const popEl = document.getElementById('pop');
if (popEl) new MutationObserver(() => setTimeout(popupTurntable, 30)).observe(popEl, { attributes: true, attributeFilter: ['hidden'], childList: true, subtree: true });

// ======== Rundenende „Rauch und Feuer“: Lego-Feuer mit Flammenteilen und Rauch aus runden Steinen ========
let FR = null, fire3 = null;
function fireScene() {
  const scene = new THREE.Scene(); lights(scene, FR);
  scene.add(new THREE.AmbientLight(0x402010, .4));
  brick(scene, 3.0, .08, 1.8, 0x4a4540, 0, -.04, 0);                                         // dunkle, verrußte Platte
  for (const [x, z, c, w, h] of [[-1.1, -.5, 0x5b6066, .4, .3], [-.9, .45, 0x7a3a2a, .3, .2], [1.0, -.4, 0x5b6066, .3, .45], [1.15, .35, 0x3e4044, .4, .2], [.7, .6, 0x7a3a2a, .2, .12], [-.6, -.7, 0x9a9590, .3, .12]]) brick(scene, w, h, .2, c, x, h / 2, z, { rot: [0, Math.random(), 0] });
  for (const [a, y] of [[.5, .07], [-.6, .07], [.1, .2]]) brick(scene, 1.3, .1, .12, 0x2a1d14, 0, y, 0, { studs: false, rot: [0, a, 0] });   // verkohlte Balken
  const glass = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: .88, toneMapped: false });   // kräftige, leuchtende Flammenteile
  const flames = [];
  for (const [x, z, s] of [[0, 0, 1.25], [-.35, .18, .85], [.38, -.12, .95], [.15, .3, .7], [-.2, -.25, .75]]) {
    const f = new THREE.Group(); f.position.set(x, .08, z); scene.add(f);
    const o = new THREE.Mesh(new THREE.ConeGeometry(.22 * s, .75 * s, 6), glass(0xff4a00)); o.position.y = .37 * s; f.add(o);
    const i = new THREE.Mesh(new THREE.ConeGeometry(.12 * s, .45 * s, 6), glass(0xffc400)); i.position.y = .24 * s; f.add(i);
    flames.push({ f, ph: Math.random() * 6, s });
  }
  const light = new THREE.PointLight(0xff8030, 6, 5, 1.6); light.position.set(0, .7, .2); scene.add(light);
  // Rauch: runde 1x1-Steine mit Noppe, steigen auf
  const puffGeo = new THREE.CylinderGeometry(.11, .11, .1, 18), studGeo = new THREE.CylinderGeometry(.06, .06, .05, 14);
  const puffs = [];
  for (let i = 0; i < 26; i++) {
    const c = [0x8a8f94, 0xa6abaf, 0x5b6066, 0xc8ccce][i % 4], m = new THREE.Group();
    const a = new THREE.Mesh(puffGeo, plastic(c)), b = new THREE.Mesh(studGeo, plastic(c)); b.position.y = .075; m.add(a, b); scene.add(m);
    puffs.push({ m, t: Math.random() * 3.2, x: (Math.random() - .5) * .5, z: (Math.random() - .5) * .35, w: Math.random() * 6 });
  }
  const embers = Array.from({ length: 10 }, () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, .03, 10), glass(0xffa020)); scene.add(m); return { m, t: Math.random() * 1.5, x: 0, z: 0, vx: 0, vz: 0 }; });
  return { scene, flames, light, puffs, embers };
}
// Kaminfeuer-Knistern als leise Endlosschleife (CC0, opengameart.org „Fireplace sound loop“)
let KAMIN = null, kaminBuf = null;
async function kaminStart() {
  try {
    const vol = typeof MASTER_VOL !== 'undefined' ? MASTER_VOL : .8; if (vol <= 0 || KAMIN) return;
    FCTX = FCTX || new (window.AudioContext || window.webkitAudioContext)(); const c = FCTX; if (c.state === 'suspended') c.resume();
    if (!kaminBuf) kaminBuf = await c.decodeAudioData(await (await fetch('assets/sounds/kamin.mp3')).arrayBuffer());
    if (!fire3 || KAMIN) return;
    const src = c.createBufferSource(), g = c.createGain(); src.buffer = kaminBuf; src.loop = true;
    g.gain.setValueAtTime(0, c.currentTime); g.gain.linearRampToValueAtTime(.55 * vol, c.currentTime + 1.2);
    src.connect(g).connect(c.destination); src.start(); KAMIN = { src, g };
  } catch (e) { }
}
function kaminStop() { if (!KAMIN) return; const { src, g } = KAMIN, c = FCTX; KAMIN = null; try { g.gain.cancelScheduledValues(c.currentTime); g.gain.setValueAtTime(g.gain.value, c.currentTime); g.gain.linearRampToValueAtTime(0, c.currentTime + .6); src.stop(c.currentTime + .7); } catch (e) { } }
function mountFire() {
  const wrap = document.querySelector('#tab-spiel .gcard.refire .fire-wrap'); if (!wrap) { fire3 = null; kaminStop(); return; }
  if (fire3 && fire3.wrap === wrap) return;
  if (!THREE) { heavy().then(mountFire); return; }
  if (!FR) { FR = new THREE.WebGLRenderer({ antialias: true, alpha: true }); FR.setPixelRatio(Math.min(devicePixelRatio || 1, 2)); FR.outputColorSpace = THREE.SRGBColorSpace; FR.toneMapping = THREE.NeutralToneMapping; FR.toneMappingExposure = 1; FR.domElement.className = 'fire3d'; }
  wrap.classList.add('has3d'); wrap.appendChild(FR.domElement);
  const w = Math.max(200, wrap.clientWidth), h = Math.max(140, wrap.clientHeight); FR.setSize(w, h, false);
  const sc = fireScene(), cam = new THREE.PerspectiveCamera(30, w / h); cam.position.set(0, 2.0, 4.6); cam.lookAt(0, .65, 0);
  const me = fire3 = { wrap, ...sc, cam, last: performance.now(), t0: performance.now() };
  kaminStart();
  (function loop() {
    if (fire3 !== me || !wrap.isConnected) { if (fire3 === me) { fire3 = null; kaminStop(); } return; } requestAnimationFrame(loop); if (document.hidden) return;
    const now = performance.now(), dt = Math.min(.05, (now - me.last) / 1000), t = (now - me.t0) / 1000; me.last = now;
    for (const f of me.flames) { const k = 1 + Math.sin(t * 13 + f.ph) * .12 + Math.sin(t * 7.3 + f.ph * 2) * .08; f.f.scale.set(1 - (k - 1) * .5, k, 1 - (k - 1) * .5); f.f.rotation.y += dt * 2; }
    me.light.intensity = 5 + Math.sin(t * 17) * 1.2 + Math.sin(t * 9) * .8;
    for (const p of me.puffs) { p.t += dt; const T = p.t % 3.2, k = T / 3.2; p.m.position.set(p.x + Math.sin(t * 1.3 + p.w) * .12 * k + k * .35, .7 + k * 2.1, p.z); p.m.scale.setScalar(.6 + k * 1.1); p.m.rotation.y += dt * .5; p.m.visible = k > .02 && k < .97; }
    for (const e of me.embers) { e.t -= dt; if (e.t <= 0) { e.t = .8 + Math.random() * .9; e.x = (Math.random() - .5) * .5; e.z = (Math.random() - .5) * .4; e.vx = (Math.random() - .5) * .6; e.vz = (Math.random() - .5) * .3; e.y0 = .3; }
      const a = 1.7 - e.t; e.m.position.set(e.x + e.vx * a, (e.y0 || .3) + a * 1.1 - a * a * .25, e.z + e.vz * a); e.m.rotation.x += dt * 6; }
    FR.render(me.scene, me.cam);
  })();
}
const spielTab = document.getElementById('tab-spiel');
if (spielTab) new MutationObserver(() => mountFire()).observe(spielTab, { childList: true });
swapReady.then(mountFire);
