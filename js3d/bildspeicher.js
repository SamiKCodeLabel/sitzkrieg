// Gespeicherte Figurenbilder (Cache Storage) – bewusst ohne 3D-Bibliothek, damit sie beim Neuladen sofort da sind
import { FIG_V } from './version.js';
const STORE = 'fig-' + FIG_V;
let store = null;
export function openStore() {
  if (!store) store = (async () => {
    if (!('caches' in self)) return null;
    try { for (const k of await caches.keys()) if (k.startsWith('fig-') && k !== STORE) caches.delete(k); return await caches.open(STORE); } catch (e) { return null; }
  })();
  return store;
}
export const figReq = (key, side, h) => new Request(new URL(`__fig/${side}/${encodeURIComponent(key)}/${h}.png`, location.href).href);
export async function cachedURL(key, side, h) {
  const c = await openStore(); if (!c) return null;
  try { const hit = await c.match(figReq(key, side, h)); return hit ? URL.createObjectURL(await hit.blob()) : null; } catch (e) { return null; }
}
export async function saveFig(key, side, h, blob) { const c = await openStore(); if (c) c.put(figReq(key, side, h), new Response(blob, { headers: { 'Content-Type': 'image/png' } })).catch(() => {}); }
