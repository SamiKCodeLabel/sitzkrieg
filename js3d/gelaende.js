// Gelände-Modelle der Kartenfelder (Klemmbaustein-Stil) – genutzt vom 3D-Spieltisch und von den Rundenende-Bildern
import { THREE, brick, slope, plastic } from './modelle.js';
const TERRAIN = { wald: 0x4f7a34, flach: 0x86a84a, zug: 0x8a8a5a, farm: 0x9cae5a, turm: 0x7f9a46, bunker: 0x7d8a5a, strand: 0xd9c591, wohn: 0x8fa357, graben: 0x17765e, hafen: 0x1f5fb0, see: 0x4caa52, strasse: 0x8b8a84, ruine: 0x7f8488, kirche: 0xa3a7a8 };
const R = Math.random;

// ---------- Gelände-Modelle (Mittelpunkt 0,0; Fläche w x d) ----------
function tree(g, x, z, s = 1) {
  brick(g, .14 * s, .42 * s, .14 * s, 0x6b4a2a, x, .21 * s, z, { studs: false });
  R(); const pine = true, c1 = pine ? 0x2c5a26 : 0x3f7a2e, c2 = pine ? 0x24481f : 0x4f8a36;
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
    case 'farm': farm3(g); break;
    case 'turm': tower3(g); break;
    case 'bunker': bunker2(g); break;
    case 'strand': beach(g, w, d); break;
    case 'wohn': house3(g); break;
    case 'graben': trench3(g, w, d); break;
    case 'hafen': harbor2(g, w, d); break;
    case 'see': see3(g, w, d); break;
    case 'strasse': road(g, w, d); break;
    case 'ruine': ruin3(g, w, d); break;
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
  // Kai hinten: breite Plattform zum Laufen, Pflaster, Bänke, Laternen, Kisten
  const QD = .74, qz = -D / 2 + QD / 2 + .02, qf = qz + QD / 2;
  brick(n, L * .96, .18, QD, LG, 0, .09, qz);
  for (let i = 0; i < 16; i++) box(n, .26 + Math.random() * .2, .012, .14 + Math.random() * .12, [0x8f9498, 0xb4b8bb, 0x9aa0a4][i % 3], (Math.random() - .5) * L * .85, .19, qz + (Math.random() - .5) * QD * .8);
  for (let i = 0; i < 6; i++) { const a = new THREE.Mesh(new THREE.CylinderGeometry(.09, .09, .02, 16, 1, false, 0, Math.PI), plastic(0x2a2c2e)); a.rotation.set(HALF, 0, HALF); a.position.set(-L * .4 + i * L * .16, .06, qf + .005); n.add(a); }
  for (let i = 0; i < 7; i++) { const x = -L * .05 + i * .22; cyl(n, .025, .14, 0x1b1b1b, x, .26, qf - .05); cyl(n, .035, .03, 0x1b1b1b, x, .34, qf - .05); if (i < 6) { const ch = new THREE.Mesh(new THREE.TorusGeometry(.11, .008, 4, 16, Math.PI), plastic(0x1b1b1b)); ch.rotation.set(0, 0, Math.PI); ch.position.set(x + .11, .31, qf - .05); ch.scale.y = .35; n.add(ch); } }
  for (const bx2 of [L * .12, L * .34]) { box(n, .3, .03, .1, 0x7a4a26, bx2, .29, qz - .18); box(n, .3, .1, .02, 0x7a4a26, bx2, .34, qz - .23); for (const sx of [-.12, .12]) box(n, .03, .1, .08, 0x1b1b1b, bx2 + sx, .23, qz - .18); }   // Bänke
  for (const lx of [L * .02, L * .44]) { cyl(n, .02, .7, 0x1b1b1b, lx, .53, qz - .26); box(n, .12, .03, .03, 0x1b1b1b, lx + .05, .88, qz - .26); cyl(n, .035, .06, 0xfff2b0, lx + .1, .84, qz - .26); }   // Laternen
  for (const [x, y] of [[L * .26, .26], [L * .3, .26], [L * .28, .4]]) brick(n, .14, .14, .14, 0x8a5a32, x, y, qz + .12, { studs: true });   // Kisten
  for (let i = 0; i < 3; i++) cyl(n, .06, .13, OLIVE, -L * .02 + i * .13, .25, qz + .18, 0, 0, 14);
  // Roter Portalkran auf dem Kai, Ausleger rot-weiß über das Wasser
  const cx = -L * .3;
  for (const sx of [-.32, .32]) { box(n, .14, 1.35, .14, 0xc4201c, cx + sx, .85, qz); box(n, .2, .1, .3, 0xc4201c, cx + sx, .22, qz); }
  box(n, .78, .14, .16, 0xc4201c, cx, 1.55, qz);
  for (let i = 0; i < 9; i++) box(n, .16, .14, .14, i % 2 ? WHT2 : 0xc4201c, cx, 1.68, qz - .2 + i * .14);
  for (const sx of [-.07, .07]) { const l = cyl(n, .035, .03, 0xf2a01e, cx + sx, 1.77, qz - .2 + 8 * .14); }
  cyl(n, .012, .45, 0x1b1b1b, cx, 1.38, qf + .1);
  const ct = G(); ct.position.set(cx, .82, qf + .1); n.add(ct);                     // Container (Rahmen) mit Geschütz
  box(ct, .56, .05, .42, 0xd8892a, 0, .3, 0); box(ct, .56, .05, .42, 0xd8892a, 0, -.04, 0);
  for (const sx of [-.26, .26]) for (const sz of [-.19, .19]) box(ct, .04, .32, .04, 0xd8892a, sx, .13, sz);
  cargoGun(ct, 0, -.01, 0, 0, .8);
  // Frachter
  const sh = G(); sh.position.set(.05, .04, D / 2 - .36); sh.scale.set(.92, .9, .78); n.add(sh); const SL = L * .82;
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
function gable(g, L, W, H, x, y, z, ry = 0, rc = SLATE, wc = TANW) {   // Satteldach aus zwei Dachsteinen + Giebeldreiecke
  const n = G(); n.position.set(x, y, z); n.rotation.y = ry; g.add(n);
  for (const sz of [-1, 1]) slope(n, W / 2 + .05, H, L + .06, rc, 0, H / 2, sz * (W / 4 + .02), sz > 0 ? -HALF : HALF);
  for (const sx of [-1, 1]) { const sh = new THREE.Shape(); sh.moveTo(-W / 2, 0); sh.lineTo(W / 2, 0); sh.lineTo(0, H); sh.closePath(); const m = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: .04, bevelEnabled: false }), plastic(wc)); m.rotation.y = HALF; m.position.set(sx * L / 2 - (sx > 0 ? .04 : 0), 0, 0); n.add(m); }
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

// ---- Wohnhaus „Steindorf“ (Bahnhofsgebäude) mit Garten und Lattenzaun ----
const NOUG = 0x6e3520, BONE = 0xe8e4d6, TANH = 0xd8c08a, DGRN = 0x1f4a34, FIN = 0xe6d08a;
function fenceRow(g, x0, z0, x1, z1) { const n = Math.round(Math.hypot(x1 - x0, z1 - z0) / .09); for (let i = 0; i <= n; i++) { const t = i / n; box(g, .035, .14, .035, WHT2, x0 + (x1 - x0) * t, .07, z0 + (z1 - z0) * t); } box(g, Math.abs(x1 - x0) + .04, .025, Math.abs(z1 - z0) + .04, WHT2, (x0 + x1) / 2, .1, (z0 + z1) / 2); }
function flower(g, x, z, c = 0xd8322a) { cyl(g, .008, .08, 0x2a6a3a, x, .04, z); const f = new THREE.Mesh(new THREE.CylinderGeometry(.035, .035, .015, 6), plastic(c)); f.position.set(x, .085, z); g.add(f); cyl(g, .012, .018, 0xf2d23a, x, .095, z); }
function win(g, x, y, z, ry, w = .16, h = .16) { const n = G(); n.position.set(x, y, z); n.rotation.y = ry; g.add(n); box(n, w + .03, h + .03, .02, DGRN, 0, 0, 0); box(n, w, h, .022, WHT2, 0, 0, .003); for (const [dx, dy] of [[-.25, .25], [.25, .25], [-.25, -.25], [.25, -.25]]) box(n, w * .42, h * .4, .024, 0x6f8a9a, dx * w, dy * h, .005); }
function steppedGable(g, x, z, w, h, ry, col) { const n = G(); n.position.set(x, 0, z); n.rotation.y = ry; g.add(n); const st = 6; for (let i = 0; i < st; i++) { const ww = w * (1 - i / st) + .04; box(n, .05, h / st, .02, col, -ww / 2, (i + .5) * h / st, 0); box(n, .05, h / st, .02, col, ww / 2, (i + .5) * h / st, 0); } }
function house3(g) {
  const hx = -.12, hz = -.12, W = .95, D = .82;
  // Garten: Zaun, Weg, Blumen, Bank
  fenceRow(g, -.72, .7, .72, .7); fenceRow(g, .72, -.7, .72, .7);
  for (let i = 0; i < 6; i++) box(g, .12, .012, .12, 0xd9c08a, .12 + (i % 2) * .12, .006, .4 + Math.floor(i / 2) * .12 - .12);
  for (let i = 0; i < 16; i++) flower(g, (Math.random() < .5 ? .42 + Math.random() * .25 : -.6 + Math.random() * .9), .38 + Math.random() * .27, i % 3 ? 0xd8322a : 0xe86a5a);
  for (let i = 0; i < 8; i++) flower(g, .45 + Math.random() * .22, -.55 + Math.random() * .9);
  box(g, .3, .04, .08, DGRN, .55, .1, .05, 0, HALF, 0); box(g, .3, .1, .02, DGRN, .6, .15, .05, 0, HALF, 0);
  // Gebäude: unten hell, Band dunkelgrün, oben sand
  box(g, W, .3, D, BONE, hx, .15, hz); box(g, W + .01, .035, D + .01, DGRN, hx, .31, hz); box(g, W, .3, D, TANH, hx, .475, hz);
  for (const x of [-.3, .05]) win(g, hx + x, .17, hz + D / 2 + .012, 0, .14, .14);
  win(g, hx + .3, .14, hz + D / 2 + .012, 0, .12, .2);                       // Tür
  for (const x of [-.25, .15]) win(g, hx + x, .48, hz + D / 2 + .012, 0, .18, .16);
  for (const z of [-.2, .15]) { win(g, hx + W / 2 + .012, .17, hz + z, HALF, .14, .14); win(g, hx - W / 2 - .012, .48, hz + z, -HALF, .16, .16); }
  // Schild „Steindorf“
  const sg = new THREE.Mesh(new THREE.PlaneGeometry(.34, .07), new THREE.MeshStandardMaterial({ map: (() => { const c = document.createElement('canvas'); c.width = 256; c.height = 52; const x = c.getContext('2d'); x.fillStyle = '#f2f0e8'; x.fillRect(0, 0, 256, 52); x.fillStyle = '#1b1b1b'; x.font = '700 34px Arial,sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText('Steindorf', 128, 28); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t; })(), roughness: .4 }));
  sg.position.set(hx + .05, .37, hz + D / 2 + .016); g.add(sg);
  for (const x of [-.4, .42]) { cyl(g, .035, .06, 0x1b1b1b, hx + x, .36, hz + D / 2 + .05); }       // Wandlampen
  cyl(g, .045, .012, WHT2, hx + W / 2 + .03, .5, hz + D / 2 - .05, HALF, 0, 16);                     // Uhr
  // Steiles Dach (rotbraun) mit Quergiebel vorn
  const RH = .62;
  for (const sz of [-1, 1]) slope(g, D / 2 + .1, RH, W + .12, NOUG, hx, .625 + RH / 2, hz + sz * (D / 4 + .05), sz > 0 ? -HALF : HALF);
  box(g, W + .12, .04, .06, 0x6a3a22, hx, .63 + RH, hz);
  for (const sx of [-1, 1]) { steppedGable(g, hx + sx * (W / 2 + .04), hz, D + .1, RH, HALF, NOUG); cyl(g, .025, .08, FIN, hx + sx * (W / 2 + .04), .68 + RH, hz); box(g, .07, .025, .07, FIN, hx + sx * (W / 2 + .04), .73 + RH, hz); }
  // Quergiebel vorn: kleines Satteldach quer zum Hauptdach, gestufte Kante, Zierspitze
  const gx = hx + .05, gz = hz + D / 2 - .02;
  box(g, .42, .3, .3, TANH, gx, .775, gz - .05); win(g, gx, .78, gz + .102, 0, .14, .14);
  gable(g, .5, .46, .4, gx, .925, gz - .1, HALF, NOUG, TANH);
  steppedGable(g, gx, gz + .15, .46, .4, 0, NOUG); g.children[g.children.length - 1].position.y = .925;
  cyl(g, .025, .08, FIN, gx, 1.36, gz + .15); box(g, .07, .025, .07, FIN, gx, 1.41, gz + .15);
  for (const x of [-.2, .18]) { box(g, .1, .32, .1, 0x9aa0a4, hx + x, 1.05, hz - .08); box(g, .12, .04, .12, 0x7c8186, hx + x, 1.22, hz - .08); cyl(g, .03, .05, 0x7c8186, hx + x, 1.27, hz - .08); }   // Schornsteine
}
// ---- Wachturm: Holzgerüst mit Kreuzstreben, Plattform, Funk, Scheinwerfer, Antenne, Windsack ----
const WOOD2 = 0xa87a42, WOOD3 = 0x8a6234;
function beam(g, a, b, t, col) { const d = b.clone().sub(a), m = new THREE.Mesh(new THREE.BoxGeometry(t, d.length(), t), plastic(col)); m.position.copy(a).add(b).multiplyScalar(.5); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), d.normalize()); g.add(m); return m; }
function tower3(g) {
  box(g, .9, .03, .9, 0x7c8186, 0, .015, 0);                                               // Steinfundament
  for (let i = 0; i < 10; i++) box(g, .1 + Math.random() * .1, .02, .08, [0x2a6a4a, 0x8ac04a, 0xc8d84a, 0x6a4a2a][i % 4], (Math.random() - .5) * 1.3, .01, (Math.random() - .5) * 1.3);
  for (const [x, z] of [[-.6, .55], [.55, .5], [.55, -.5], [-.55, -.55], [-.2, .62]]) for (let k = 0; k < 7; k++) { const c = new THREE.Mesh(new THREE.ConeGeometry(.012, .16, 4), plastic(0xe0c888)); c.position.set(x + (Math.random() - .5) * .08, .08, z + (Math.random() - .5) * .08); c.rotation.set((Math.random() - .5) * .8, 0, (Math.random() - .5) * .8); g.add(c); }
  const B = .38, T = .3, H = 1.7, V = (x, y, z) => new THREE.Vector3(x, y, z);
  const legs = [[-1, -1], [1, -1], [1, 1], [-1, 1]];
  for (const [sx, sz] of legs) beam(g, V(sx * B, 0, sz * B), V(sx * T, H, sz * T), .06, WOOD2);
  const lvl = [0, .85, H];
  for (let k = 0; k < 2; k++) for (let i = 0; i < 4; i++) {                                 // Kreuzstreben je Seite
    const [ax, az] = legs[i], [bx, bz] = legs[(i + 1) % 4], y0 = lvl[k], y1 = lvl[k + 1], w0 = B - (B - T) * y0 / H, w1 = B - (B - T) * y1 / H;
    beam(g, V(ax * w0, y0, az * w0), V(bx * w1, y1, bz * w1), .04, WOOD3); beam(g, V(bx * w0, y0, bz * w0), V(ax * w1, y1, az * w1), .04, WOOD3);
    beam(g, V(ax * w1, y1, az * w1), V(bx * w1, y1, bz * w1), .045, WOOD2);
  }
  // Plattform mit Geländer
  brick(g, 1.0, .06, 1.0, WOOD2, 0, H + .03, 0);
  for (const [sx, sz] of legs) cyl(g, .03, .26, WOOD2, sx * .47, H + .19, sz * .47);
  for (const sz of [-1, 1]) { box(g, .98, .035, .035, WOOD2, 0, H + .29, sz * .47); box(g, .035, .035, .98, WOOD2, sz * .47, H + .29, 0); box(g, .98, .03, .03, WOOD2, 0, H + .17, sz * .47); box(g, .03, .03, .98, WOOD2, sz * .47, H + .17, 0); }
  box(g, .4, .015, .26, 0x8a3a1a, .1, H + .07, .15);                                        // Luke
  box(g, .14, .1, .12, 0xb4b8bb, -.3, H + .11, -.3); box(g, .12, .08, .1, 0x9aa0a4, .32, H + .1, -.32);   // Funkkisten
  const sl = G(); sl.position.set(-.25, H + .16, .28); g.add(sl); cyl(sl, .02, .08, 0x9aa0a4, 0, 0, 0); const lamp = cyl(sl, .06, .14, WHT2, 0, .07, .05, HALF, 0, 14); cyl(sl, .05, .01, 0xfff2b0, 0, .07, .12, HALF, 0, 14);
  cyl(g, .012, .75, 0x1b1b1b, -.4, H + .45, -.4); for (const y of [.55, .65]) cyl(g, .08, .02, 0xc8ccce, -.4, H + y, -.4, 0, 0, 18);   // Antennenmast mit Schüsseln
  cyl(g, .006, .35, 0x1b1b1b, -.3, H + .3, -.42, .15);
  cyl(g, .012, .5, 0x1b1b1b, .42, H + .3, .42); const ws = new THREE.Mesh(new THREE.ConeGeometry(.05, .22, 10, 1, true), plastic(WHT2, { side: THREE.DoubleSide })); ws.rotation.z = HALF; ws.position.set(.53, H + .52, .42); g.add(ws);   // Windsack
  // Kraftrad und Fass am Fuß
  cyl(g, .05, .1, 0x4d5530, .18, .05, -.18);
}
// ---- Farm: sandfarbener Stall, graues Dach, Bogentor, Pumpe, Blumen, Beet ----
function farm3(g) {
  const sx0 = -.2, sz0 = -.35, W = 1.0, D = .52;
  box(g, W + .12, .025, D + .12, 0x6b3f22, sx0, .0125, sz0);                                // Holzboden ringsum
  brick(g, W, .42, D, 0xc8b07a, sx0, .23, sz0, { studs: false });
  for (let i = 0; i < 22; i++) box(g, .08 + Math.random() * .08, .05, .012, [0xd9c08a, 0xb39b6a][i % 2], sx0 + (Math.random() - .5) * (W - .1), .08 + Math.random() * .3, sz0 + D / 2 + .006);
  for (const sz of [-1, 1]) slope(g, D / 2 + .1, .3, W + .14, 0x7e8388, sx0, .44 + .15, sz0 + sz * (D / 4 + .05), sz > 0 ? -HALF : HALF);
  box(g, W + .14, .035, .06, 0x8a8f94, sx0, .75, sz0);
  for (const x of [-.32, .1]) { box(g, .08, .12, .08, 0x7c8186, sx0 + x, .8, sz0); box(g, .11, .03, .11, 0x7c8186, sx0 + x, .87, sz0); }   // Schornsteine
  // Bogentor mit zwei offenen Türen
  const tx = sx0 + .05, fz = sz0 + D / 2;
  box(g, .2, .24, .02, 0x2a241c, tx, .14, fz + .004); const arc = new THREE.Mesh(new THREE.CylinderGeometry(.1, .1, .02, 16, 1, false, 0, Math.PI), plastic(0x2a241c)); arc.rotation.set(HALF, 0, HALF); arc.position.set(tx, .26, fz + .004); g.add(arc);
  for (const s of [-1, 1]) { const d = box(g, .1, .28, .02, 0xc8ccce, tx + s * .16, .16, fz + .06); d.rotation.y = s * .9; }
  win(g, sx0 + .32, .3, fz + .012, 0, .18, .1);
  for (const s of [-1, 1]) box(g, .12, .3, .02, 0xc8ccce, sx0 - W / 2 - .012, .17, sz0 + s * .065, 0, HALF, 0);   // Doppeltor an der Giebelseite
  box(g, .06, .05, .04, 0xd9c08a, tx - .3, .28, fz + .02);
  // Schwengelpumpe mit Eimer, gelbe Blumen
  cyl(g, .025, .3, 0x1b1b1b, sx0 - .32, .15, fz + .2); box(g, .14, .02, .02, 0x1b1b1b, sx0 - .27, .3, fz + .2, 0, 0, -.5); cyl(g, .045, .07, 0x8a6a3a, sx0 - .24, .035, fz + .24);
  for (const [x, z] of [[-.62, .1], [-.55, .2], [-.68, .25]]) { cyl(g, .012, .22, 0x2a6a3a, x, .11, z); cyl(g, .065, .025, 0xf2c020, x, .23, z, 0, 0, 8); cyl(g, .02, .03, 0x8a5a1a, x, .245, z); const l = new THREE.Mesh(new THREE.ConeGeometry(.07, .06, 5), plastic(0x2a7a4a)); l.position.set(x, .06, z); g.add(l); }
  // Beet: Gemüse (hellgrün) und Getreide (gelb)
  box(g, .55, .03, .42, 0x6b3f22, .38, .015, .38);
  for (let i = 0; i < 6; i++) { const c = new THREE.Mesh(new THREE.TorusGeometry(.03, .01, 6, 10, Math.PI * 1.3), plastic(0x9ad84a)); c.position.set(.2 + (i % 3) * .08, .09, .28 + Math.floor(i / 3) * .12); c.rotation.z = HALF; g.add(c); cyl(g, .01, .08, 0x9ad84a, .2 + (i % 3) * .08, .06, .28 + Math.floor(i / 3) * .12); }
  for (let i = 0; i < 8; i++) box(g, .02, .1, .12, 0xf2c020, .48 + (i % 4) * .055, .07, .32 + Math.floor(i / 4) * .17);
  for (const [x, z, c] of [[-.4, .5, 0x2a4a3a], [.1, .62, 0x8a9a8a], [-.65, .62, 0x2a6a5a], [.62, -.3, 0x2a6a5a]]) for (let k = 0; k < 5; k++) box(g, .16, .012, .03, c, x, .01, z, 0, k * Math.PI / 5, 0);
  for (const [x, z] of [[.25, .1], [.62, .05], [-.2, .45], [.65, .65]]) box(g, .07, .012, .07, 0xc8b07a, x, .01, z, 0, Math.random() * 3, 0);
}

// See nach Foto: blaue Noppenplatte, Holzsteg mit Pfosten, Fass, Schilf mit Rohrkolben, Laub auf der Wiese
const LBLUE = 0x2456b8, PLANT = 0x1f7a4a;
function reed(g, x, z, s = 1) {
  const n = G(); n.position.set(x, 0, z); n.rotation.y = R() * 6.28; n.scale.setScalar(s); g.add(n);
  for (let k = 0; k < 6; k++) { const a = k / 6 * Math.PI * 2, t = .55 + (k % 2) * .25;
    const f = box(n, .022, .3, .05, PLANT, Math.cos(a) * .08, .13, Math.sin(a) * .08); f.rotation.set(Math.sin(a) * t, 0, -Math.cos(a) * t);
    for (const e of [.35, .7]) { const b = new THREE.Mesh(new THREE.SphereGeometry(.018, 8, 6), plastic(PLANT)); b.position.set(Math.cos(a) * (.08 + e * .14), .03 + e * .22, Math.sin(a) * (.08 + e * .14)); n.add(b); } }
  for (const [dx, dz, h] of [[0, 0, .3], [.03, .02, .24]]) { cyl(n, .006, h, 0x3a5a2a, dx, h / 2, dz); cyl(n, .016, .06, 0x6b3a1e, dx, h + .02, dz, 0, 0, 8); }
}
function tanLeaf(g, x, z, c = 0xc8b48a) { const l = leaf(g, x, .012, z, .45, R() * 6.28); l.material = plastic(c); }
function see3(g, w, d) {
  const ww = w - .36, dd = d - .36, ox = -.02, oz = .04;
  brick(g, ww, .035, dd, LBLUE, ox, .0175, oz);                                              // Wasser als blaue Noppenplatte
  // Holzsteg vom oberen Ufer ins Wasser, sechs Pfosten mit hellen Köpfen
  const sx = ox - ww * .18, sl = Math.min(.6, dd * .45), sz0 = oz - dd / 2 - .05;
  box(g, .28, .04, sl, 0x6b3a1e, sx, .07, sz0 + sl / 2);
  for (let i = 0; i < 3; i++) for (const s of [-1, 1]) { const z = sz0 + .08 + i * (sl - .14) / 2; cyl(g, .035, .14, 0x5a3418, sx + s * .12, .07, z); cyl(g, .036, .012, 0xc8a878, sx + s * .12, .145, z); }
  // Fass am Ufer
  const bx = sx - .25, bz = oz - dd / 2 - .1; const fass = new THREE.Mesh(new THREE.CylinderGeometry(.065, .055, .14, 16), plastic(0x8a5a2c)); fass.position.set(bx, .07, bz); g.add(fass); for (const y of [.03, .11]) cyl(g, .067, .012, 0x5a3418, bx, y, bz);
  // Schilf rund ums Ufer
  const ex = ww / 2, ez = dd / 2;
  const rim = [[-ex, -ez * .2], [-ex - .02, ez * .45], [-ex * .55, ez + .02], [ex * .1, ez + .03], [ex * .7, ez], [ex + .02, ez * .4], [ex * .85, -ez * .5], [ex * .25, -ez - .02], [-ex * .75, -ez * .95]];
  if (w > 2) rim.push([-ex * .2, ez + .02], [ex * .45, -ez - .02]);
  for (const [x, z] of rim) reed(g, ox + x, oz + z, .75 + R() * .3);
  // Laub, kleine Steine auf der Wiese
  const hw = w / 2 - .08, hd = d / 2 - .08;
  for (const [x, z] of [[-hw, -hd * .3], [-hw * .9, hd], [hw * .2, hd], [hw, hd * .6], [hw * .6, -hd], [-hw * .3, -hd]]) tanLeaf(g, x, z);
  for (const [x, z, c] of [[hw - .02, -hd * .2, 0x8a4a2a], [-hw + .02, hd * .3, 0x9a4a22], [hw * .9, -hd * .9, 0xb8d84a], [-hw * .9, -hd * .85, 0xb8d84a]]) box(g, .12, .025, .07, c, x, .0125, z, 0, (x * 7) % 1.5, 0);
}

// Ruine nach Foto: hellgraue Platte mit Fliesen, ausgebrannte Mauerschale mit gezackter Oberkante, dunkler Schutt innen
const MSG = 0x62676c, DSG = 0x3c4044;
function ruin3(g, w, d) {
  const hw = w / 2 - .06, hd = d / 2 - .06;
  for (let i = 0; i < 22; i++) { const long = R() < .4; box(g, long ? .2 + R() * .12 : .06 + R() * .06, .012, .06 + (long ? 0 : R() * .05), R() < .55 ? 0x9a9ea2 : (R() < .6 ? MSG : DSG), (R() - .5) * 2 * hw, .006, (R() - .5) * 2 * hd, 0, R() < .5 ? 0 : HALF, 0); }
  const W = .82 + R() * .12, D = .66 + R() * .1, x0 = (R() - .5) * .15, z0 = -.12 + (R() - .5) * .1;
  box(g, W - .08, .045, D - .08, DSG, x0, .0225, z0);                                         // dunkler Boden innen
  for (let i = 0; i < 10; i++) box(g, .05 + R() * .1, .025 + R() * .04, .05 + R() * .08, [0x2a2c2e, DSG, 0x1b1b1b, MSG][i % 4], x0 + (R() - .5) * (W - .2), .03, z0 + (R() - .5) * (D - .2), R() * .4, R() * 3, R() * .4);
  // Mauern aus Einzelsteinen, Höhe springt (oben abgebrochen), vorne niedriger
  const unit = .1, sides = [[0, -D / 2, W, 0, .55], [W / 2, 0, D, HALF, .45], [0, D / 2, W, Math.PI, .25], [-W / 2, 0, D, -HALF, .5]];
  for (const [cx, cz, len, ry, hMax] of sides) {
    const wl = G(); wl.position.set(x0 + cx, 0, z0 + cz); wl.rotation.y = ry; g.add(wl);
    const n = Math.round(len / unit); let h = hMax * (.6 + R() * .4);
    for (let i = 0; i < n; i++) {
      if (i % 2 === 0) h = Math.max(.12, Math.min(hMax, h + Math.round((R() - .5) * 3) * .06));
      const rows = Math.max(1, Math.round(h / .06));
      for (let k = 0; k < rows; k++) { const c = R() < .2 ? DSG : (R() < .3 ? 0x7f8488 : MSG); box(wl, unit - .004, .058, .08, c, -len / 2 + (i + .5) * unit, .03 + k * .06, 0); }
      if (rows > 1 && R() < .5) { const st = new THREE.Mesh(new THREE.CylinderGeometry(.018, .018, .016, 10), plastic(MSG)); st.position.set(-len / 2 + (i + .5) * unit, rows * .06 + .008, 0); wl.add(st); }
      if (rows >= 3 && R() < .25) box(wl, unit * .6, .08, .085, 0x2a2c2e, -len / 2 + (i + .5) * unit, .12, 0);   // Fensterloch / Brandspur
    }
  }
  // Schutt vor der Ruine und ein paar Mauerreste
  for (let i = 0; i < 6; i++) box(g, .1, .05 + R() * .05, .08, R() < .5 ? MSG : DSG, x0 + (R() - .5) * W, .03, z0 + D / 2 + .08 + R() * .2, R() * .5, R() * 3, R() * .5);
  for (const [x, z] of [[hw * .75, hd * .7], [-hw * .7, hd * .8]]) for (let k = 0; k < 2 + Math.floor(R() * 2); k++) box(g, .1, .058, .08, MSG, x + (R() - .5) * .04, .03 + k * .06, z);
}

// Schützengraben nach Foto: Mosaik-Wiese, braune Grabensohle im Zickzack, beidseitig Sandsäcke (Kissen mit Noppen)
const SACK = 0x9c8862, DIRT = 0x6a3d1c, DIRT2 = 0x7d4c22;
function grass(g, x, z, s = 1) { const n = G(); n.position.set(x, 0, z); n.scale.setScalar(s); g.add(n); g = n; for (let k = 0; k < 16; k++) { const a = k * 2.4, t = .25 + (k % 3) * .18; const c = new THREE.Mesh(new THREE.ConeGeometry(.018, .32, 4), plastic(0x10594a)); c.position.set(Math.cos(a) * .04, .15, Math.sin(a) * .04); c.rotation.set(Math.sin(a) * t, 0, -Math.cos(a) * t); n.add(c); } return n; }
function sack(g, x, y, z, ry = 0, tilt = 0) {   // Sandsack-Kissen mit zwei Noppen
  const n = G(); n.position.set(x, y, z); n.rotation.set(tilt, ry, (R() - .5) * .12); g.add(n);
  const b = new THREE.Mesh(new THREE.SphereGeometry(.1, 20, 12), plastic(SACK)); b.scale.set(1.3, .42, .85); n.add(b);
  const e = new THREE.Mesh(new THREE.CylinderGeometry(.108, .108, .03, 20), plastic(SACK)); e.scale.set(1.2, 1, .78); e.position.y = -.01; n.add(e);
  for (const dx of [-.045, .045]) { const st = new THREE.Mesh(new THREE.CylinderGeometry(.022, .022, .02, 12), plastic(SACK)); st.position.set(dx, .042, 0); n.add(st); }
  return n;
}
function trench3(g, w, d) {
  const along = w > d, L = Math.max(w, d), S = Math.min(w, d), n = G(); if (!along) n.rotation.y = HALF; g.add(n);
  const hl = L / 2 - .02, hs = S / 2 - .02;
  // Verlauf: links breite Bucht, Mitte schmal, rechts leicht versetzt
  const cz = x => x < -L * .14 ? .02 : x < L * .12 ? -.08 : .1;
  const hw = x => x < -L * .14 ? .4 : x < L * .12 ? .27 : .29;
  const inT = (x, z) => Math.abs(x) < hl - .16 && Math.abs(z - cz(x)) < hw(x);
  const nx = Math.round(L / .19), nz = Math.round(S / .19), cx = L / nx, cw = S / nz, GH = .1;
  box(n, L - .3, .03, S * .86, DIRT, 0, .015, 0);                                              // Grabensohle
  const MOS = [0x8cc42a, 0x237a62, 0x5a8758, 0x154a38, 0x2f9a78, 0x4a7a2e, 0xb0d838, 0x1d6650];
  const edge = [];
  for (let i = 0; i < nx; i++) for (let k = 0; k < nz; k++) {
    const x = -L / 2 + (i + .5) * cx, z = -S / 2 + (k + .5) * cw;
    if (inT(x, z)) continue;
    const nb = inT(x + cx, z) || inT(x - cx, z) || inT(x, z + cw) || inT(x, z - cw);
    const c = nb ? [DIRT2, 0xb0642a, DIRT][(i + k) % 3] : MOS[Math.floor(R() * MOS.length)];
    brick(n, cx - .004, GH, cw - .004, c, x, GH / 2, z, { studs: !nb && R() < .55 });
    if (!nb && R() < .35) box(n, cx * (.4 + R() * .5), .02, cw * (.4 + R() * .5), MOS[Math.floor(R() * MOS.length)], x + (R() - .5) * .05, GH + .01, z + (R() - .5) * .05);
    if (nb) edge.push([x, z, inT(x, z + cw) ? 1 : inT(x, z - cw) ? -1 : 0]);
  }
  // Sandsäcke auf der Grabenkante, stellenweise doppelt
  for (const [x, z, dir] of edge) {
    const ry = dir === 0 ? HALF : 0, t = dir * .25;
    sack(n, x, GH + .03, z, ry + (R() - .5) * .25, t);
    if (R() < .3) sack(n, x + (R() - .5) * .06, GH + .085, z - dir * .03, ry + (R() - .5) * .4, t * .5);
  }
  // Sohle: helle, orange und dunkle Fliesen, runde Platte, Pfosten, kleine Stufen
  for (let k = 0; k < 26; k++) { const x = (R() - .5) * (L - .7), z = cz(x) + (R() - .5) * hw(x) * 1.6; box(n, .06 + R() * .12, .015, .06 + R() * .08, [0xc8b48a, 0xd98a3a, DIRT2, 0x4a2a14, 0xb0642a][k % 5], x, .037, z, 0, R() < .5 ? 0 : HALF, 0); }
  cyl(n, .12, .015, 0xb3a179, -L * .36, .04, .05, 0, 0, 22);
  for (const [x, z] of [[-L * .1, -.3], [L * .3, .32], [L * .08, -.3], [-L * .25, -.38]]) box(n, .05, .18, .05, 0x3a2414, x, .09, z);
  for (const x of [-L * .3, L * .2]) slope(n, .1, .08, .16, 0xb0642a, x, .07, cz(x) - hw(x) + .08, HALF);
  // Gras, Laub, Sprossen auf der Wiese
  for (const [x, z, sc] of [[-hl + .15, -hs + .15, 1.1], [-hl + .2, hs - .15, 1], [hl - .25, hs - .15, 1.2], [hl - .55, hs - .12, 1], [L * .05, -hs + .1, .8]]) grass(n, x, z, sc).position.y = GH;
  for (const [x, z, c] of [[L * .05, hs - .12, 0xc8b48a], [L * .28, hs - .2, 0x3fb38f], [-L * .3, hs - .12, 0xc8b48a], [L * .4, -hs + .12, 0xc8b48a], [-L * .42, -hs + .12, 0x3fb38f]]) { const l = leaf(n, x, GH + .012, z, .45, R() * 6); l.material = plastic(c); }
  for (const [x, z] of [[-L * .35, hs - .1], [L * .15, hs - .1], [L * .45, -hs + .15], [-L * .05, hs - .1]]) { const t = new THREE.Mesh(new THREE.TorusGeometry(.03, .008, 6, 12, Math.PI * 1.3), plastic(0xb8e03a)); t.position.set(x, GH + .06, z); n.add(t); cyl(n, .007, .06, 0xb8e03a, x - .03, GH + .03, z); }
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
