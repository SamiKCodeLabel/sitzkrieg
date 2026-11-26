// Bindet die 3D-Klemmbaustein-Modelle in die App ein:
//  1. Armee-Tab, Popups, Mini-Symbole: Standbilder der Modelle statt der SVG-Zeichnungen
//  2. Spielkarte: lebende 3D-Szene mit Aktion + WebGL-Effekten (Mündungsfeuer, Explosion, Steinchen …)
import { cachedURL } from './bildspeicher.js';
// Die 3D-Bibliothek (groß) wird erst nachgeladen: gespeicherte Bilder erscheinen vorher
let THREE, buildUnit, brick, photo, lights, frame, Fx, heavyP = null;
const heavy = () => heavyP || (heavyP = Promise.all([import('./modelle.js'), import('./foto.js'), import('./effekte.js'), import('./glbfig.js')])
  .then(async ([m, f, e, gl]) => { await gl.GFREADY; ({ THREE, buildUnit, brick } = m); ({ photo, lights, frame } = f); ({ Fx } = e); }));   // erst wenn das Soldaten-Modell da ist
const getPhoto = async (k, side, h) => (await cachedURL(k, side, h)) || (await heavy(), await photo(k, side, h));

const KEYS = ['pzf', 'general', 'sniper', 'shotgun', 'mg', 'flame', 'grenade', 'mortar', 'mine', 'mech', 'medic', 'schwer', 'leicht', 'trans', 'art', 'krad', 'flieger'];
const still = matchMedia('(prefers-reduced-motion:reduce)').matches;

// ---------- 1. Standbilder ----------
const GENP = {};   // Standbilder der Generäle je Fähigkeit (werden bei Bedarf erzeugt)
const genPhoto = (side, abil) => GENP[side + abil] || (GENP[side + abil] = getPhoto('general:' + abil, side, 300));
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
  for (const side of ['de', 'al']) {
    const urls = await Promise.all([...KEYS, 'rif'].map(k => getPhoto(k, side, VEH.includes(k) ? 260 : 300)));
    KEYS.forEach((k, i) => { ART_FACTION[side][k] = `<img class="fig f3d${VEH.includes(k) ? ' veh' : ''}" src="${urls[i]}" alt="" draggable="false">`; if (side === 'de') ART[k] = ART_FACTION.de[k]; });
    RIFLEMAN_FACTION[side] = `<img class="fig f3d" src="${urls[KEYS.length]}" alt="" draggable="false">`;
  }
  document.documentElement.classList.add('lego3d'); document.documentElement.classList.remove('lego3d-wait'); veteranFix();
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
  const x0 = box.min.x - .3, x1 = box.max.x + 1.4, zc = (box.min.z + box.max.z) / 2;
  const pw = Math.ceil((x1 - x0) / .2) * .2, pd = Math.ceil((Math.max(sz.z, 1.0) + .5) / .2) * .2;
  brick(stage, pw, .08, pd, c.side === 'de' ? 0x7f8c4a : 0x6f8a46, (x0 + x1) / 2, -.04, zc);
  const hit = new THREE.Vector3(box.max.x + .85, .05, zc + .15);   // Einschlagstelle rechts auf der Platte
  art.classList.add('has3d');
  const w = Math.max(120, art.clientWidth), h = Math.max(80, art.clientHeight);   // Layoutgröße: unabhängig von der Umdreh-Animation
  // Kamera gerade von vorn, leicht erhöht, enger Bildwinkel: Platte liegt flach und parallel zur Kartenkante, immer ganz im Bild
  const cam = new THREE.PerspectiveCamera(16, w / h);
  frame(cam, stage, w / h, 1.02, new THREE.Vector3(0, .42, 1));
  r.setSize(w, h, false);
  art.appendChild(r.domElement);
  const fx = new Fx(scene, cam);
  view = { stage, hit, art, scene, cam, root, units, fx, kind, side: c.side, t0: performance.now(), last: performance.now(), base: cam.position.clone(), id: Math.random() };
  loop(); requestAnimationFrame(refit);
  return view;
}

// ---------- Aktionen je Einheit ----------
const V = (x, y, z) => new THREE.Vector3(x, y, z);
function muzzleOf(obj) {
  const m = obj.userData.muzzle || V(0, 0, .5); obj.updateWorldMatrix(true, false);
  const p = obj.localToWorld(m.clone()), q = obj.localToWorld(m.clone().multiplyScalar(.5));
  return { p, dir: p.clone().sub(q).normalize() };
}
function recoil(obj, axis = 'z', amt = .06, t = .12) { if (!obj || !window.gsap) return; const o = obj.position[axis]; gsap.fromTo(obj.position, { [axis]: o - amt }, { [axis]: o, duration: t, ease: 'power2.out' }); }
function act(v) {
  const { fx, units, kind, hit } = v; fx.clear();
  const u = units[0], d = u.userData, gs = window.gsap;
  const shots = (obj, n, gap, o = {}) => { for (let i = 0; i < n; i++) fx.at((o.d || .25) + i * gap, () => { const { p, dir } = muzzleOf(obj); fx.muzzle(p, dir, o.k || 1); fx.tracer(p, dir, o.len || 4, o.speed || 20); if (o.cas) fx.casing(p.clone().addScaledVector(dir, -.4)); recoil(obj, o.axis || 'z', o.rec || .05); if (o.hit) fx.at(.18, () => fx.explosion(hit.clone(), .35)); }); };
  const ground = (obj, dist) => { const { p, dir } = muzzleOf(obj); return p.clone().addScaledVector(dir.setY(0).normalize(), dist).setY(.05); };
  if (kind.startsWith('general:')) {
    const ab = kind.slice(8), head = V(0, 1.9, 0);
    if (ab === 'Veteran') shots(d.weapon, 9, .09, { cas: true, rec: .03 }); else shots(d.weapon, 2, .35, { d: .3 });
    const fxa = { Besetzen: () => fx.sparkle(head, 'star', 0xffd34a, 8), Schussbefehl: () => { fx.at(.4, () => { const p = d.armL.userData.hand.getWorldPosition(new THREE.Vector3()); for (let i = 0; i < 14; i++) fx.at(i * .05, () => fx.spawn({ p: p.clone().add(V(0, i * .18, 0)), life: .5, s0: .25, s1: .05, c0: 0xff4020, c1: 0xffa040 })); fx.at(.75, () => { fx.spawn({ p: p.clone().add(V(0, 2.6, 0)), life: 1.2, s0: .9, s1: 1.4, c0: 0xff3010, c1: 0xff9040 }); fx.flash(p.clone().add(V(0, 2.4, 0)), 5); }); }); },
      Blitz: () => { fx.at(.2, () => { fx.flash(head, 8); fx.sparkle(head, 'star', 0xfff07a, 12); fx.shake(.05, .3); }); }, Unsterblich: () => fx.sparkle(V(0, 1.2, .3), 'plus', 0x6dff7a, 12), Blutrausch: () => fx.sparkle(V(0, 1.2, .3), 'glow', 0xff2020, 14),
      Rage: () => { for (let i = 0; i < 16; i++) fx.at(i * .05, () => fx.fire(V((Math.random() - .5) * .6, .1, (Math.random() - .5) * .4), V(0, .4, 0), .6)); }, Verschanzen: () => { fx.dust(V(0, .05, .5), 1); fx.dust(V(.4, .05, .5), .8); },
      Monster: () => { fx.at(.3, () => { fx.dust(V(.3, .05, .4), 1.3); fx.shake(.08, .4); }); }, Anführer: () => fx.sparkle(head, 'star', 0xffd34a, 14), Veteran: () => fx.sparkle(head, 'star', 0xffd34a, 8) };
    (fxa[ab] || (() => fx.sparkle(head, 'star', 0xffd34a, 10)))();
    return;
  }
  switch (kind) {
    case 'rif': units.forEach((s, i) => shots(s.userData.weapon, 2, .32, { d: .2 + i * .07, cas: true })); break;
    case 'sniper': shots(d.weapon, 1, 0, { d: .5, k: 1.4, len: 8, speed: 40, hit: 3.5 }); break;
    case 'shotgun': fx.at(.3, () => { const { p, dir } = muzzleOf(d.weapon); fx.muzzle(p, dir, 1.6); for (let i = 0; i < 6; i++) fx.tracer(p, dir.clone().add(V((Math.random() - .5) * .3, (Math.random() - .5) * .15, (Math.random() - .5) * .3)), 2.5, 16); recoil(d.weapon, 'z', .1); fx.casing(p.clone().addScaledVector(dir, -.4)); }); break;
    case 'mg': shots(d.weapon, 9, .09, { cas: true, rec: .03 }); break;
    case 'general-veteran': shots(d.weapon, 9, .09, { cas: true, rec: .03 }); fx.at(.2, () => fx.sparkle(V(0, 1.9, 0), 'star', 0xffd34a, 10)); break;
    case 'general': shots(d.weapon, 2, .35, { d: .3 }); fx.at(.2, () => fx.sparkle(V(0, 1.9, 0), 'star', 0xffd34a, 10)); break;
    case 'flame': for (let i = 0; i < 26; i++) fx.at(.25 + i * .035, () => { const { p, dir } = muzzleOf(d.weapon); fx.fire(p, dir, 1); if (i % 5 === 0) fx.flash(p, 3); }); fx.at(1.2, () => fx.smoke(ground(d.weapon, 1.6).setY(.4), 1, 4, 0x3a3630)); break;
    case 'pzf': fx.at(.35, () => { const { p, dir } = muzzleOf(d.weapon); fx.muzzle(p, dir, 1.4); const back = d.weapon.localToWorld(d.weapon.userData.back.clone()); fx.smoke(back, 1.2, 6, 0xb0aaa0); fx.tracer(p, dir, 3.5, 12); fx.at(.3, () => fx.explosion(hit.clone(), .8)); }); break;
    case 'grenade': if (gs) { gs.fromTo(d.armR.rotation, { x: d.armR.rotation.x - .4 }, { x: d.armR.rotation.x + 1.6, duration: .25, delay: .2, ease: 'power3.in', yoyo: true, repeat: 1 }); }
      fx.at(.45, () => { const g = d.grenade; const p0 = g.getWorldPosition(new THREE.Vector3()); g.visible = false; const t = { k: 0 }; const end = hit.clone(); const ghost = g.clone(); ghost.visible = true; v.scene.add(ghost);
        gs ? gs.to(t, { k: 1, duration: .6, ease: 'none', onUpdate: () => { ghost.position.lerpVectors(p0, end, t.k); ghost.position.y += Math.sin(t.k * Math.PI) * 1.2; ghost.rotation.z -= .3; }, onComplete: () => { v.scene.remove(ghost); fx.explosion(end, 1); setTimeout(() => g.visible = true, 900); } }) : fx.explosion(end, 1); }); break;
    case 'mortar': fx.at(.3, () => { d.shell.visible = false; }); fx.at(.55, () => { const { p, dir } = muzzleOf(d.mortar); fx.muzzle(p, dir, 1.5); fx.smoke(p, 1, 4); fx.tracer(p, dir, 3, 14); }); fx.at(1.5, () => fx.explosion(hit.clone(), .9)); fx.at(2.4, () => d.shell.visible = true); break;
    case 'mine': if (gs) gs.fromTo(d.detector.rotation, { z: -.4 }, { z: .4, duration: .4, yoyo: true, repeat: 3, ease: 'sine.inOut' }); fx.at(1.4, () => { const p = d.detector.localToWorld(V(0, -.5, .05)); fx.sparkle(p, 'glow', 0xff4030, 6); fx.flash(p, 2); }); break;
    case 'mech': if (gs) gs.fromTo(d.armR.rotation, { x: d.armR.rotation.x }, { x: d.armR.rotation.x + .9, duration: .14, yoyo: true, repeat: 5, ease: 'power2.in' }); for (let i = 0; i < 3; i++) fx.at(.14 + i * .28, () => { const p = d.tool.getWorldPosition(new THREE.Vector3()); for (let k = 0; k < 8; k++) fx.spawn({ p, v: V((Math.random() - .5) * 3, Math.random() * 3, (Math.random() - .5) * 3), life: .4, s0: .06, s1: .02, c0: 0xffe090, c1: 0xff7020, g: -9 }); fx.flash(p, 1.5); }); break;
    case 'medic': fx.at(.2, () => { fx.sparkle(V(.2, 1.2, .4), 'plus', 0x6dff7a, 14); fx.flash(V(0, 1.4, .8), 1.5); }); break;
    case 'schwer': case 'leicht': {
      const heavy = kind === 'schwer';
      if (gs) gs.fromTo(d.turret.rotation, { y: -.35 }, { y: 0, duration: .5, ease: 'power2.inOut' });
      fx.at(.6, () => { const { p, dir } = muzzleOf(d.barrel); fx.muzzle(p, dir, heavy ? 2.6 : 1.8); fx.smoke(p, heavy ? 1.6 : 1.1, 6); fx.tracer(p, dir, 6, 26); recoil(d.barrel, 'x', heavy ? .35 : .22, .3); if (gs) gs.fromTo(d.body.rotation, { z: heavy ? .06 : .045 }, { z: 0, duration: .5, ease: 'elastic.out(1,.4)' }); fx.dust(V(-1, .05, .9)); fx.dust(V(.8, .05, -.9)); fx.shake(heavy ? .1 : .06, .4); });
      fx.at(.9, () => fx.explosion(hit.clone(), 1.1)); break;
    }
    case 'trans': if (gs) gs.fromTo(u.position, { x: -1.2 }, { x: 0, duration: 1.1, ease: 'power2.out' }); for (let i = 0; i < 8; i++) fx.at(i * .12, () => { fx.dust(u.localToWorld(V(-.6, 0, .8)), .8); fx.smoke(u.localToWorld(d.exhaust.clone()), .5, 1, 0x3a3836); }); shots(d.weapon, 6, .1, { d: 1.2, rec: .03 }); break;
    case 'krad': if (gs) { gs.fromTo(u.position, { x: -1.5 }, { x: 0, duration: .9, ease: 'power3.out' }); gs.fromTo(d.body.rotation, { z: .18 }, { z: 0, duration: .8, delay: .4, ease: 'bounce.out' }); } for (let i = 0; i < 6; i++) fx.at(i * .1, () => fx.dust(u.localToWorld(V(-.8, 0, 0)), .7)); shots(d.weapon, 7, .09, { d: 1.0, rec: .03 }); break;
    case 'art': fx.at(.4, () => { const { p, dir } = muzzleOf(d.muzzles[0]); fx.muzzle(p, dir, 3); fx.smoke(p, 2, 8, 0x8a857c); fx.tracer(p, dir, 7, 26); recoil(d.muzzles[0], 'x', .4, .35); fx.dust(V(-.3, .05, .8), 1.4); fx.dust(V(-.3, .05, -.8), 1.4); fx.shake(.12, .5); }); break;
    case 'flak': for (let i = 0; i < 8; i++) fx.at(.3 + i * .13, () => { const br = d.muzzles[i % 2]; const { p, dir } = muzzleOf(br); fx.muzzle(p, dir, 1.1); fx.tracer(p, dir, 6, 22); recoil(br, 'x', .12, .1); if (i % 2) fx.at(.35, () => fx.smoke(p.clone().addScaledVector(dir, 4.5), .7, 2, 0x2a2826)); }); break;
    case 'flieger': {
      if (gs) { gs.fromTo(u.position, { x: -4, y: .6 }, { x: 0, y: 0, duration: 1.0, ease: 'power2.out' }); gs.fromTo(d.body.rotation, { x: .5 }, { x: 0, duration: 1.2, ease: 'sine.out' }); }
      d.bombs.forEach((bm, i) => fx.at(1.1 + i * .18, () => { const p0 = bm.getWorldPosition(new THREE.Vector3()); bm.visible = false; const ghost = bm.clone(); ghost.visible = true; v.scene.add(ghost); const t = { y: p0.y }; gs ? gs.to(t, { y: .1, duration: .45, ease: 'power2.in', onUpdate: () => ghost.position.set(p0.x + (p0.y - t.y) * .5, t.y, p0.z), onComplete: () => { v.scene.remove(ghost); fx.explosion(ghost.position.clone(), 1.1); setTimeout(() => bm.visible = true, 1600); } }) : null; })); break;
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

swapArt().then(() => attach(false), e => { console.warn(e); document.documentElement.classList.remove('lego3d-wait'); });
