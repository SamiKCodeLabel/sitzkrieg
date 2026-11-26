// Gelände-Modelle der Kartenfelder (Klemmbaustein-Stil) – genutzt vom 3D-Spieltisch und von den Rundenende-Bildern
import { THREE, brick, slope, plastic } from './modelle.js';
const TERRAIN = { wald: 0x4f7a34, flach: 0x86a84a, zug: 0x8a8a5a, farm: 0x9cae5a, turm: 0x7f9a46, bunker: 0x7d8a5a, strand: 0xd9c591, wohn: 0x8fa357, graben: 0x6e5a3e, hafen: 0x1f5fb0, see: 0x4a86a8, strasse: 0x8b8a84, ruine: 0x7a6e62, kirche: 0xa3a7a8 };
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
    case 'bunker': bunker2(g); break;
    case 'strand': beach(g, w, d); break;
    case 'wohn': house(g, 0, -.1); tree(g, .55, .5, .7); break;
    case 'graben': trench(g, w, d); break;
    case 'hafen': harbor2(g, w, d); break;
    case 'see': water(g, w, d); for (let i = 0; i < 5; i++) brick(g, .04, .3, .04, 0x5a7a2a, -.6 + R() * .2, .15, -.6 + i * .3, { studs: false }); break;
    case 'strasse': road(g, w, d); break;
    case 'ruine': ruin(g); break;
    case 'kirche': church2(g, w, d); break;
  }
}
// Missionsziel-Fahne und Felderweiterung
// ======== Nach Fotos der echten Klemmbaustein-Felder ========
const LG = 0xa0a5a9, DGY = 0x5b6066, WHT2 = 0xf2f2ee, TANW = 0xd9c08a, TANW2 = 0xc8ab78, SLATE = 0x4e5458, OLIVE = 0x4d5530;
function box(g, w, h, d, c, x, y, z, rx = 0, ry = 0, rz = 0) { return brick(g, w, h, d, c, x, y, z, { studs: false, rot: [rx, ry, rz] }); }
function cyl(g, r, h, c, x, y, z, rx = 0, rz = 0, seg = 18) { const m = new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), plastic(c)); m.position.set(x, y, z); m.rotation.set(rx, 0, rz); g.add(m); return m; }
// Feldgeschütz als Ladung (schwarz)
function cargoGun(g, x, y, z, ry = 0, s = 1) { const k = G(); k.position.set(x, y, z); k.rotation.y = ry; k.scale.setScalar(s); g.add(k); for (const sz of [-1, 1]) cyl(k, .09, .03, 0x1b1b1b, 0, .09, sz * .12, HALF); box(k, .32, .05, .05, 0x1b1b1b, -.12, .05, 0, 0, 0, .3); cyl(k, .03, .4, 0x1b1b1b, .12, .16, 0, 0, HALF - .25); box(k, .06, .14, .2, 0x1b1b1b, .02, .14, 0); }
// ---- Hafen: Frachter, Kai mit Kettenzaun, roter Portalkran mit Container ----
function harbor2(g, w, d) {
  const along = w > d, n = G(); if (!along) n.rotation.y = HALF; g.add(n); const L = Math.max(w, d), D = Math.min(w, d);
  // Kai hinten
  const qz = -D / 2 + .26;
  brick(n, L * .96, .18, .5, LG, 0, .09, qz);
  for (let i = 0; i < 6; i++) { const a = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .02, 16, 1, false, 0, Math.PI), plastic(0x2a2c2e)); a.rotation.set(HALF, 0, HALF); a.position.set(-L * .4 + i * L * .16, .06, qz + .255); n.add(a); }
  for (let i = 0; i < 6; i++) { cyl(n, .025, .14, 0x1b1b1b, -L * .1 + i * .24, .25, qz + .2); cyl(n, .035, .03, 0x1b1b1b, -L * .1 + i * .24, .33, qz + .2); if (i < 5) { const ch = new THREE.Mesh(new THREE.TorusGeometry(.12, .008, 4, 16, Math.PI), plastic(0x1b1b1b)); ch.rotation.set(0, 0, Math.PI); ch.position.set(-L * .1 + i * .24 + .12, .3, qz + .2); ch.scale.y = .35; n.add(ch); } }
  // Roter Portalkran auf dem Kai, Ausleger rot-weiß über das Wasser
  const cx = -L * .3;
  for (const sx of [-.32, .32]) { box(n, .14, 1.35, .14, 0xc4201c, cx + sx, .85, qz); box(n, .2, .1, .3, 0xc4201c, cx + sx, .22, qz); }
  box(n, .78, .14, .16, 0xc4201c, cx, 1.55, qz);
  for (let i = 0; i < 9; i++) box(n, .16, .14, .14, i % 2 ? WHT2 : 0xc4201c, cx, 1.68, qz - .1 + i * .14 - .4 + .5);
  for (const sx of [-.07, .07]) { const l = cyl(n, .035, .03, 0xf2a01e, cx + sx, 1.77, qz + .1 + 8 * .14 - .4 + .5 - .05); }
  cyl(n, .012, .45, 0x1b1b1b, cx, 1.38, qz + .45);
  const ct = G(); ct.position.set(cx, .82, qz + .45); n.add(ct);                     // Container (Rahmen) mit Geschütz
  box(ct, .56, .05, .42, 0xd8892a, 0, .3, 0); box(ct, .56, .05, .42, 0xd8892a, 0, -.04, 0);
  for (const sx of [-.26, .26]) for (const sz of [-.19, .19]) box(ct, .04, .32, .04, 0xd8892a, sx, .13, sz);
  cargoGun(ct, 0, -.01, 0, 0, .8);
  // Frachter
  const sh = G(); sh.position.set(.05, .04, D / 2 - .5); n.add(sh); const SL = L * .82;
  box(sh, SL, .22, .62, 0x1f3d2c, 0, .13, 0);                                    // dunkelgrüner Rumpf
  box(sh, SL, .05, .63, 0xe0601c, 0, .03, 0);                                    // orange Wasserlinie
  box(sh, SL, .12, .64, WHT2, 0, .3, 0);                                         // weißes Schanzkleid
  const bow = new THREE.Mesh(new THREE.CylinderGeometry(.33, .33, .34, 3), plastic(WHT2)); bow.rotation.y = Math.PI / 6 + Math.PI; bow.scale.set(1.5, 1, 1); bow.position.set(SL / 2 + .16, .2, 0); sh.add(bow);
  const rail = new THREE.Mesh(new THREE.TorusGeometry(.3, .018, 6, 20, Math.PI), plastic(LG)); rail.rotation.set(-HALF, 0, -HALF); rail.position.set(SL / 2 + .02, .44, 0); rail.scale.set(1, 1.05, 1); sh.add(rail);
  cyl(sh, .02, .55, LG, SL / 2 + .05, .62, 0); cyl(sh, .03, .04, 0xe8f4ff, SL / 2 + .05, .91, 0);
  for (let i = 0; i < 9; i++) cyl(sh, .065, .13, OLIVE, SL / 2 - .2 - (i % 3) * .14, .43, -.15 + Math.floor(i / 3) * .15, 0, 0, 16);   // Fässer am Bug
  box(sh, SL * .45, .03, .5, 0xe0601c, -.05, .37, 0);                           // Laderaum (orange)
  box(sh, .06, .12, .58, WHT2, -.05, .42, 0);                                    // Trennbalken
  cargoGun(sh, -.35, .39, -.05, .3, .7); cargoGun(sh, .25, .39, .08, -.4, .7);
  for (const x of [-SL * .3, SL * .1]) for (const sz of [-1, 1]) box(sh, .1, .04, .06, LG, x, .38, sz * .3);   // Poller
  // Aufbau hinten mit Brücke
  const bx = -SL / 2 + .3;
  brick(sh, .55, .4, .62, WHT2, bx, .56, 0, { studs: false });
  box(sh, .56, .05, .63, 0x1f3d2c, bx, .5, 0); box(sh, .56, .03, .63, 0xe0601c, bx, .46, 0);
  brick(sh, .5, .26, .58, WHT2, bx + .02, .89, 0);
  for (let i = 0; i < 4; i++) box(sh, .02, .12, .1, 0x7fc4e0, bx + .27, .92, -.2 + i * .13);
  for (let i = 0; i < 3; i++) cyl(sh, .04, .04, 0xe8f4ff, bx - .1 + i * .12, 1.04, .2);
  cyl(sh, .03, .4, WHT2, bx - .1, 1.22, -.1); cyl(sh, .06, .06, WHT2, bx - .1, 1.44, -.03, HALF); cyl(sh, .06, .06, WHT2, bx - .1, 1.44, -.17, HALF);
  box(sh, .12, .14, .1, 0x1b1b1b, bx - .12, 1.08, -.22);
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.07, .022, 8, 18), plastic(0xf2a01e)); ring.position.set(bx + .1, .58, .32); sh.add(ring);
}
// ---- Bunker: grauer Beton, schräge Seiten, Risse, Schießscharte, Tarngrün, rostige Eisen ----
function leaf(g, x, y, z, s = 1, ry = 0) { const sh = new THREE.Shape(); for (let i = 0; i < 14; i++) { const a = i / 14 * Math.PI * 2, r = (i % 2 ? .07 : .16) * s; sh[i ? 'lineTo' : 'moveTo'](Math.cos(a) * r * 1.3, Math.sin(a) * r); } const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .015, bevelEnabled: false }), plastic(0x2c5a34)); m.rotation.set(-HALF, 0, ry); m.position.set(x, y, z); g.add(m); return m; }
function bunker2(g) {
  const C1 = 0xa6abaf, C2 = 0x969ba0;
  box(g, 1.0, .5, .95, C1, 0, .25, -.05);
  slope(g, .28, .5, .95, C2, .64, .25, -.05, 0); slope(g, .28, .5, .95, C2, -.64, .25, -.05, Math.PI);   // schräge Seiten
  box(g, 1.04, .08, .12, 0xb3b7ba, 0, .52, .46);                                   // Dachkante vorn
  box(g, .56, .12, .03, 0x1e2022, 0, .34, .435);                                    // Schießscharte
  box(g, .64, .04, .06, 0x8a8f94, 0, .42, .45); box(g, .64, .04, .06, 0x8a8f94, 0, .26, .45);
  for (const sx of [-.3, .3]) box(g, .04, .2, .06, 0x8a8f94, sx, .34, .45);
  // Eingang hinten: Türöffnung mit Rahmen, kleine Mauer seitlich, Treppe hinunter
  box(g, .3, .3, .03, 0x1e2022, .15, .15, -.535); box(g, .38, .05, .06, 0x8a8f94, .15, .32, -.54);
  for (const sx of [-.02, .32]) box(g, .05, .32, .06, 0x8a8f94, sx, .16, -.54);
  box(g, .06, .3, .24, 0x969ba0, -.06, .15, -.65); box(g, .06, .3, .24, 0x969ba0, .36, .15, -.65);
  for (let i = 0; i < 3; i++) box(g, .32, .05, .07, 0xa6abaf, .15, .025 + i * .05, -.73 + i * .07);
  // Dachplatten mit Rissen
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) box(g, .32, .06, .3, (i + j) % 2 ? C1 : 0xb3b7ba, -.33 + i * .33, .53, -.37 + j * .31);
  for (const [x, z, r] of [[-.1, -.2, .6], [.2, .1, -.4], [-.3, .15, .2]]) box(g, .3, .005, .012, 0x3a3d40, x, .565, z, 0, r, 0);
  leaf(g, .05, .57, -.05, 1.3, .4); leaf(g, -.38, .57, -.35, .7, 1.2); leaf(g, .4, .57, .25, .6, 2.1); leaf(g, .6, .3, -.4, .55, .7);
  for (let i = 0; i < 3; i++) { const b = cyl(g, .018, .5, 0xa8521e, .38 + i * .05, .22, .5, .3, -.1, 8); }   // rostige Eisen
  for (let i = 0; i < 4; i++) sandbag(g, -.2 + i * .17, .07, .72);
}
// ---- Kirche: Sandstein/Grau gemischt, Schieferdächer, Querschiff, Turm mit Uhr ----
function mottled(g, w, h, d, x, y, z) {   // Mauer aus gemischten Steinen (sand, hellgrau)
  brick(g, w, h, d, TANW, x, y, z, { studs: false });
  const n = Math.round(w * h * 26 + d * h * 26);
  for (let i = 0; i < n; i++) {
    const onX = Math.random() < w / (w + d), sgn = Math.random() < .5 ? -1 : 1, c = [0xd2d5d6, 0xe4dcc4, TANW2, 0xbfc3c5][i % 4];
    const ww = .1 + Math.random() * .12, hh = .06 + Math.random() * .04, yy = y - h / 2 + hh / 2 + Math.random() * (h - hh);
    if (onX) box(g, ww, hh, .012, c, x + (Math.random() - .5) * (w - ww), yy, z + sgn * (d / 2 + .005));
    else box(g, .012, hh, ww, c, x + sgn * (w / 2 + .005), yy, z + (Math.random() - .5) * (d - ww));
  }
}
function gable(g, L, W, H, x, y, z, ry = 0) {   // Satteldach aus zwei Dachsteinen + Giebeldreiecke
  const n = G(); n.position.set(x, y, z); n.rotation.y = ry; g.add(n);
  for (const sz of [-1, 1]) slope(n, W / 2 + .05, H, L + .06, SLATE, 0, H / 2, sz * (W / 4 + .02), sz > 0 ? -HALF : HALF);
  for (const sx of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(0, H); sh.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .04, bevelEnabled: false }), plastic(TANW)); m.rotation.y = HALF; m.position.set(sx * L / 2 - (sx > 0 ? .04 : 0), 0, 0); n.add(m); }
  box(n, L + .1, .04, .06, 0x3a3f42, 0, H + .01, 0);
}
function archWin(g, x, y, z, ry, h = .3) { const n = G(); n.position.set(x, y, z); n.rotation.y = ry; g.add(n); box(n, .14, h, .015, 0x2a2c30, 0, 0, 0); const t = new THREE.Mesh(new THREE.CylinderGeometry(.07, .07, .015, 16, 1, false, 0, Math.PI), plastic(0x2a2c30)); t.rotation.set(HALF, 0, HALF); t.position.y = h / 2; n.add(t); }
function church2(g, w, d) {
  const along = w > d, n = G(); if (!along) n.rotation.y = HALF; g.add(n); const L = Math.max(w, d) * .78;
  for (let i = 0; i < 14; i++) box(n, .14 + Math.random() * .2, .01, .08 + Math.random() * .1, [0x7e8488, 0xb8bcbf][i % 2], (Math.random() - .5) * w * .9, .005, (Math.random() - .5) * 1.3);
  const H = .7, W = .78;
  mottled(n, L, H, W, 0, H / 2, -.1);                                             // Langhaus
  gable(n, L, W, .48, 0, H, -.1);
  mottled(n, .6, H, 1.35, .25, H / 2, .05);                                       // Querschiff
  gable(n, 1.35, .6, .44, .25, H, .05, HALF);
  mottled(n, .5, .55, .35, .25, .275, .72); gable(n, .35, .5, .32, .25, .55, .72, HALF);   // Vorbau mit Giebel
  archWin(n, .25, .2, .9, 0, .3);
  for (let i = 0; i < 4; i++) { archWin(n, -L / 2 + .2 + i * .25, .38, -.1 + W / 2 + .012, 0, .28); archWin(n, -L / 2 + .2 + i * .25, .38, -.1 - W / 2 - .012, Math.PI, .28); }
  for (let i = 0; i < 4; i++) box(n, .07, .5, .07, TANW2, -L / 2 + .08 + i * .3, .25, -.1 + W / 2 + .03);       // Strebepfeiler
  // Turm über der Vierung
  const tx = -.05, tz = -.1;
  mottled(n, .5, 1.7, .5, tx, .85, tz);
  for (const ry of [0, HALF, Math.PI, -HALF]) { const v = new THREE.Vector3(0, 0, .262).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry); for (const o of [-.12, 0, .12]) { const p = new THREE.Vector3(o, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), ry); archWin(n, tx + v.x + p.x, 1.4, tz + v.z + p.z, ry, .26); } }
  const clk = cyl(n, .1, .02, 0xf6f4ee, tx, 1.12, tz + .262, HALF, 0, 24); box(n, .012, .07, .005, 0x1b1b1b, tx, 1.14, tz + .275); box(n, .05, .01, .005, 0x1b1b1b, tx + .02, 1.12, tz + .275);
  box(n, .56, .06, .56, 0xc8ccce, tx, 1.72, tz);
  const sp = new THREE.Mesh(new THREE.ConeGeometry(.38, .9, 4), plastic(SLATE)); sp.position.set(tx, 2.2, tz); sp.rotation.y = Math.PI / 4; n.add(sp);
  for (const sx of [-.24, .24]) for (const sz of [-.24, .24]) { const pn = new THREE.Mesh(new THREE.ConeGeometry(.05, .22, 4), plastic(0xc8ccce)); pn.position.set(tx + sx, 1.86, tz + sz); n.add(pn); }
  for (const lx of [-L * .55, L * .45]) { cyl(n, .02, .75, 0x1b1b1b, lx, .38, .62); box(n, .14, .03, .03, 0x1b1b1b, lx + .06, .76, .62); cyl(n, .035, .06, 0xfff2b0, lx + .12, .72, .62); }
}

// Ein einzelnes Feld als Modell (Bauplatte + Gelände), z. B. für das Bild am Rundenende
const BIG = { zug: 1, graben: 1, hafen: 1, kirche: 1 };
export function fieldModel(key) {
  const g = G(), w = BIG[key] ? 3.2 - .06 : 1.6 - .06, d = 1.6 - .06;
  brick(g, w, .08, d, TERRAIN[key] || 0x86a84a, 0, .04, 0);
  const t = G(); t.position.y = .105; g.add(t); terrain(key, t, w, d);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  g.userData.type = 'veh'; g.userData.field = true;
  return g;
}
export { TERRAIN, terrain, G, HALF, sandbag, water, R };
