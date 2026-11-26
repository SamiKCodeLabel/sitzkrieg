// WebGL-Effekte: Mündungsfeuer, Leuchtspur, Explosion, Rauch, Flammen, Funken, fliegende Steinchen, Lichtblitz
import { THREE, plastic } from './modelle.js';

function canvasTex(s, draw) { const c = document.createElement('canvas'); c.width = c.height = s; draw(c.getContext('2d'), s); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; }
const GLOW = canvasTex(128, (x, s) => { const g = x.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2); g.addColorStop(0, 'rgba(255,255,255,1)'); g.addColorStop(.25, 'rgba(255,255,255,.8)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.fillRect(0, 0, s, s); });
const SMOKE = canvasTex(128, (x, s) => { for (let i = 0; i < 14; i++) { const px = s * (.3 + Math.random() * .4), py = s * (.3 + Math.random() * .4), r = s * (.14 + Math.random() * .16); const g = x.createRadialGradient(px, py, 0, px, py, r); g.addColorStop(0, 'rgba(255,255,255,.55)'); g.addColorStop(1, 'rgba(255,255,255,0)'); x.fillStyle = g; x.beginPath(); x.arc(px, py, r, 0, 7); x.fill(); } });
const PLUS = canvasTex(64, (x, s) => { x.fillStyle = '#fff'; x.fillRect(s * .38, s * .12, s * .24, s * .76); x.fillRect(s * .12, s * .38, s * .76, s * .24); });
const STAR = canvasTex(64, (x, s) => { x.fillStyle = '#fff'; x.beginPath(); for (let i = 0; i < 10; i++) { const r = i % 2 ? s * .2 : s * .48, a = -Math.PI / 2 + i * Math.PI / 5; x[i ? 'lineTo' : 'moveTo'](s / 2 + Math.cos(a) * r, s / 2 + Math.sin(a) * r); } x.fill(); });
const TEX = { glow: GLOW, smoke: SMOKE, plus: PLUS, star: STAR };

export class Fx {
  constructor(scene, camera) {
    this.scene = scene; this.camera = camera; this.parts = []; this.debris = []; this.events = []; this.t = 0; this.shakeT = 0; this.shakeA = 0;
    this.light = new THREE.PointLight(0xffb060, 0, 8, 1.6); scene.add(this.light); this.lightI = 0;
    this.pool = Array.from({ length: 220 }, () => { const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: GLOW, transparent: true, depthWrite: false })); s.visible = false; scene.add(s); return s; });
    this.tracers = Array.from({ length: 24 }, () => { const m = new THREE.Mesh(new THREE.CylinderGeometry(.012, .012, 1, 6), new THREE.MeshBasicMaterial({ color: 0xffe08a, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false })); m.visible = false; scene.add(m); return { m, on: false }; });
    this.rings = Array.from({ length: 4 }, () => { const m = new THREE.Mesh(new THREE.RingGeometry(.8, 1, 40), new THREE.MeshBasicMaterial({ color: 0xfff0c0, transparent: true, depthWrite: false, side: THREE.DoubleSide })); m.rotation.x = -Math.PI / 2; m.visible = false; scene.add(m); return { m, on: false }; });
    this.bricks = Array.from({ length: 36 }, () => { const m = new THREE.Mesh(new THREE.BoxGeometry(.08, .05, .08), plastic(0x777777)); m.visible = false; scene.add(m); return { m, on: false, v: new THREE.Vector3(), w: new THREE.Vector3() }; });
  }
  at(t, f) { this.events.push({ t: this.t + t, f }); }
  clear() { this.events = []; for (const p of this.parts) p.s.visible = false; this.parts = []; for (const a of [...this.tracers, ...this.rings, ...this.bricks]) { a.on = false; a.m.visible = false; } this.lightI = 0; }
  // Einzelnes Teilchen
  spawn(o) {
    const s = this.pool.find(p => !p.visible); if (!s) return;
    const m = s.material; m.map = TEX[o.tex || 'glow']; m.blending = o.add === false ? THREE.NormalBlending : THREE.AdditiveBlending; m.needsUpdate = true;
    s.visible = true; s.position.copy(o.p); s.material.rotation = Math.random() * 6;
    this.parts.push({ s, v: o.v ? o.v.clone() : new THREE.Vector3(), age: 0, life: o.life || .3, s0: o.s0 ?? .2, s1: o.s1 ?? .4, c0: new THREE.Color(o.c0 ?? 0xffffff), c1: new THREE.Color(o.c1 ?? o.c0 ?? 0xffffff), a0: o.a0 ?? 1, g: o.g ?? 0, drag: o.drag ?? 0, spin: (Math.random() - .5) * (o.spin ?? 1) });
  }
  flash(p, i = 3) { this.light.position.copy(p); this.lightI = Math.max(this.lightI, i); }
  shake(a = .05, t = .3) { this.shakeA = Math.max(this.shakeA, a); this.shakeT = Math.max(this.shakeT, t); }
  // ---- Bausteine ----
  muzzle(p, dir, k = 1) {
    this.spawn({ p, life: .07, s0: .35 * k, s1: .5 * k, c0: 0xffffff, c1: 0xffc040 });
    this.spawn({ p: p.clone().addScaledVector(dir, .12 * k), life: .09, s0: .3 * k, s1: .1, c0: 0xffd060, c1: 0xff6020 });
    for (let i = 0; i < 4; i++) this.spawn({ p, v: dir.clone().multiplyScalar(2 + Math.random() * 2).add(rnd(.8)), life: .12, s0: .05, s1: .02, c0: 0xffe080 });
    this.spawn({ p, v: dir.clone().multiplyScalar(.4).add(new THREE.Vector3(0, .3, 0)), life: .8, s0: .12 * k, s1: .45 * k, c0: 0x9a958a, c1: 0x5a5650, a0: .5, tex: 'smoke', add: false, drag: 1.5 });
    this.flash(p, 2.5 * k);
  }
  tracer(p, dir, len = 3, speed = 18) {
    const t = this.tracers.find(x => !x.on); if (!t) return;
    t.on = true; t.m.visible = true; t.p = p.clone(); t.dir = dir.clone().normalize(); t.d = 0; t.len = len; t.speed = speed;
    t.m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), t.dir); t.m.scale.set(1, .5, 1);
  }
  casing(p) { const b = this.bricks.find(x => !x.on); if (!b) return; b.on = true; b.m.visible = true; b.m.material = plastic(0xd8a63a); b.m.scale.set(.35, .6, .35); b.m.position.copy(p); b.v.set(.6 + Math.random(), 1.6, (Math.random() - .5)); b.w.set(rr(15), rr(15), rr(15)); b.life = 1.2; }
  explosion(p, k = 1, colors = [0x6b7062, 0x3e4044, 0x8c6f3a]) {
    for (let i = 0; i < 10; i++) this.spawn({ p: p.clone().add(rnd(.15 * k)), v: rnd(1.5 * k).add(new THREE.Vector3(0, 1.4 * k, 0)), life: .45 + Math.random() * .25, s0: .3 * k, s1: (.8 + Math.random() * .5) * k, c0: 0xfff2b0, c1: 0xd03010, drag: 3 });
    for (let i = 0; i < 18; i++) this.spawn({ p, v: rnd(5 * k).add(new THREE.Vector3(0, 3 * k, 0)), life: .5 + Math.random() * .4, s0: .07, s1: .02, c0: 0xffe090, c1: 0xff6020, g: -9 });
    for (let i = 0; i < 8; i++) this.at(.12 + i * .03, () => this.spawn({ p: p.clone().add(rnd(.3 * k)).setY(p.y + .2 * k), v: new THREE.Vector3(rr(.4), .5 + Math.random() * .6, rr(.4)).multiplyScalar(k), life: 1.4 + Math.random() * .8, s0: .4 * k, s1: 1.4 * k, c0: 0x4a4640, c1: 0x8f8a80, a0: .75, tex: 'smoke', add: false, drag: 1 }));
    const r = this.rings.find(x => !x.on); if (r) { r.on = true; r.m.visible = true; r.m.position.set(p.x, .02, p.z); r.age = 0; r.k = k; }
    for (let i = 0; i < 10; i++) { const b = this.bricks.find(x => !x.on); if (!b) break; b.on = true; b.m.visible = true; b.m.material = plastic(colors[i % colors.length]); b.m.scale.setScalar(.8 + Math.random() * .8); b.m.position.copy(p); b.v.copy(rnd(3 * k)).add(new THREE.Vector3(0, 3.5 * k, 0)); b.w.set(rr(12), rr(12), rr(12)); b.life = 1.6; }
    this.flash(p, 7 * k); this.shake(.06 * k, .4);
  }
  smoke(p, k = 1, n = 4, c = 0x7a756c) { for (let i = 0; i < n; i++) this.at(i * .06, () => this.spawn({ p: p.clone().add(rnd(.15 * k)), v: new THREE.Vector3(rr(.2), .4 + Math.random() * .4, rr(.2)), life: 1.2 + Math.random() * .6, s0: .2 * k, s1: .9 * k, c0: c, c1: 0xa8a398, a0: .6, tex: 'smoke', add: false, drag: 1 })); }
  dust(p, k = 1) { for (let i = 0; i < 5; i++) this.spawn({ p: p.clone().add(rnd(.2 * k)).setY(.05), v: new THREE.Vector3(rr(.8), .3 + Math.random() * .3, rr(.8)), life: .9, s0: .2 * k, s1: .7 * k, c0: 0xa08a60, c1: 0xc2ad84, a0: .55, tex: 'smoke', add: false, drag: 2 }); }
  fire(p, dir, k = 1) { this.spawn({ p, v: dir.clone().multiplyScalar(3.2 + Math.random()).add(rnd(.4)), life: .45, s0: .12 * k, s1: .7 * k, c0: 0xfff0a0, c1: 0xe0300a, drag: 1.2, g: 1.2 }); }
  sparkle(p, tex = 'plus', c = 0x7cff8a, n = 8) { for (let i = 0; i < n; i++) this.at(i * .07, () => this.spawn({ p: p.clone().add(rnd(.35)), v: new THREE.Vector3(rr(.2), .8 + Math.random() * .5, rr(.2)), life: 1.0, s0: .16, s1: .05, c0: c, tex })); }
  // ---- Schleife ----
  update(dt) {
    this.t += dt;
    const due = this.events.filter(e => e.t <= this.t); this.events = this.events.filter(e => e.t > this.t); due.forEach(e => e.f());
    for (const p of this.parts) {
      p.age += dt; const t = p.age / p.life;
      if (t >= 1) { p.s.visible = false; continue; }
      p.v.y += p.g * dt; p.v.multiplyScalar(Math.max(0, 1 - p.drag * dt)); p.s.position.addScaledVector(p.v, dt);
      p.s.scale.setScalar(p.s0 + (p.s1 - p.s0) * t); p.s.material.color.copy(p.c0).lerp(p.c1, t); p.s.material.opacity = p.a0 * (1 - t * t); p.s.material.rotation += p.spin * dt;
    }
    this.parts = this.parts.filter(p => p.s.visible);
    for (const t of this.tracers) if (t.on) { t.d += t.speed * dt; const vis = Math.min(t.len, .9); t.m.position.copy(t.p).addScaledVector(t.dir, t.d - vis / 2); t.m.scale.y = vis; if (t.d > t.len + vis) { t.on = false; t.m.visible = false; } }
    for (const r of this.rings) if (r.on) { r.age += dt; const s = .2 + r.age * 4 * r.k; r.m.scale.setScalar(s); r.m.material.opacity = Math.max(0, .7 - r.age * 1.6); if (r.age > .45) { r.on = false; r.m.visible = false; } }
    for (const b of this.bricks) if (b.on) { b.life -= dt; b.v.y -= 9 * dt; b.m.position.addScaledVector(b.v, dt); if (b.m.position.y < .03) { b.m.position.y = .03; b.v.y *= -.35; b.v.x *= .6; b.v.z *= .6; b.w.multiplyScalar(.6); } b.m.rotation.x += b.w.x * dt; b.m.rotation.y += b.w.y * dt; b.m.rotation.z += b.w.z * dt; if (b.life <= 0) { b.on = false; b.m.visible = false; } }
    this.lightI *= Math.pow(.0005, dt); this.light.intensity = this.lightI;
    if (this.shakeT > 0) { this.shakeT -= dt; } else this.shakeA = 0;
    return this.shakeA * Math.max(0, this.shakeT) * 3;
  }
  get busy() { return this.parts.length || this.events.length || this.tracers.some(t => t.on) || this.bricks.some(b => b.on) || this.lightI > .05; }
}
const rr = a => (Math.random() - .5) * 2 * a;
const rnd = a => new THREE.Vector3(rr(a), rr(a), rr(a));
