// Sitzkrieg – Build vor dem Hochladen:  node tools/build.mjs
//  1. prüft jede JS-Datei auf Syntaxfehler (fängt z. B. verrutschte Klammern ab)
//  2. prüft, ob jede verlinkte Datei (CSS, JS, Schriften, Sounds, Symbole) existiert
//  3. hängt an CSS/JS einen Inhalts-Fingerabdruck (?v=…), damit Handys nie alte Teile mischen
//  4. setzt die Cache-Version im Service Worker und die Liste der Offline-Dateien
// Keine Abhängigkeiten nötig, nur Node.
import { readFileSync, writeFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const rel = p => join(ROOT, p);
const hash = buf => createHash('sha256').update(buf).digest('hex').slice(0, 10);
const list = dir => readdirSync(rel(dir)).filter(f => statSync(rel(join(dir, f))).isFile()).map(f => `${dir}/${f}`);
let errors = 0;
const fail = msg => { console.error('✗ ' + msg); errors++; };

// 1. Syntax
for (const f of list('js')) {
  try { execFileSync(process.execPath, ['--check', rel(f)], { stdio: 'pipe' }); }
  catch (e) { fail(`${f}: ${String(e.stderr).split('\n').slice(0, 4).join(' ')}`); }
}

// 2. Verweise
const pages = ['index.html', 'digital.html'];
const refs = new Set();
for (const p of pages) {
  const html = readFileSync(rel(p), 'utf8');
  for (const m of html.matchAll(/(?:src|href)="((?:css|js|assets)\/[^"?#]+)/g)) refs.add(m[1]);
}
for (const f of [...list('css'), ...list('js')]) {
  const txt = readFileSync(rel(f), 'utf8');
  for (const m of txt.matchAll(/(?:\.\.\/)?(assets\/[A-Za-z0-9_\-./]+\.(?:woff2|mp3|svg|png))/g)) refs.add(m[1]);
}
for (const r of refs) if (!existsSync(rel(r))) fail(`fehlt: ${r}`);

if (errors) { console.error(`\nBuild abgebrochen (${errors} Fehler).`); process.exit(1); }

// 3. Fingerabdrücke in die Seiten schreiben
const fp = {};
for (const f of [...list('css'), ...list('js')]) fp[f] = hash(readFileSync(rel(f)));
for (const p of pages) {
  const html = readFileSync(rel(p), 'utf8');
  const out = html.replace(/((?:src|href)=")((?:css|js)\/[^"?#]+)(?:\?v=[0-9a-f]+)?"/g, (_, a, f) => fp[f] ? `${a}${f}?v=${fp[f]}"` : `${a}${f}"`);
  if (out !== html) writeFileSync(rel(p), out);
}

// 4. Service Worker
const offline = ['./', './index.html', './manifest.webmanifest', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './reroll.mp4',
  ...Object.keys(fp).map(f => `./${f}?v=${fp[f]}`), ...list('assets/fonts'), ...list('assets/sounds'), ...list('assets/symbole')]
  .map(f => f.startsWith('./') ? f : './' + f);
const version = hash(readFileSync(rel('index.html')) + JSON.stringify(fp) + offline.join());
let sw = readFileSync(rel('sw.js'), 'utf8');
sw = sw.replace(/const CACHE = '[^']*';/, `const CACHE = 'sitzkrieg-${version}';`)
       .replace(/const FILES = \[[\s\S]*?\];/, `const FILES = ${JSON.stringify(offline, null, 0)};`);
writeFileSync(rel('sw.js'), sw);

console.log(`✓ ${list('js').length} JS-Dateien ohne Syntaxfehler`);
console.log(`✓ ${refs.size} Verweise gefunden, alle vorhanden`);
console.log(`✓ Cache-Version sitzkrieg-${version}, ${offline.length} Dateien offline verfügbar`);
