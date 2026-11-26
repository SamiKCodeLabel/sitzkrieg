// Offline-Speicher für die Sitzkrieg-App.
// Online: immer die neueste Version laden und speichern. Offline: gespeicherte Version nutzen.
const CACHE = 'sitzkrieg-642dc65739';
const FILES = ["./","./index.html","./manifest.webmanifest","./icon-192.png","./icon-512.png","./icon-maskable-512.png","./reroll.mp4","./css/app.css?v=e0df306a2c","./css/basis.css?v=da717d893f","./css/schriften.css?v=d0f53fa5cb","./css/spiel.css?v=54f043cfed","./js/armee.js?v=7503413c49","./js/extras.js?v=eb44499047","./js/figuren.js?v=303edc6c4a","./js/karte.js?v=e441e9d413","./js/lobby.js?v=32eb3923dd","./js/missionskarte.js?v=1323f126eb","./js/musik.js?v=d2920e7e08","./js/neuwurf.js?v=4cd701aea8","./js/regeln.js?v=fc6c3894ce","./js/sounds.js?v=91eb7b6314","./js/spiel.js?v=2fe7dbf13b","./js/symbole.js?v=90023643d3","./js/wuerfel.js?v=c6fea4303f","./assets/fonts/courier-prime-400-font2.woff2","./assets/fonts/courier-prime-400-font3.woff2","./assets/fonts/courier-prime-400-font4.woff2","./assets/fonts/courier-prime-400.woff2","./assets/fonts/courier-prime-700-font6.woff2","./assets/fonts/courier-prime-700.woff2","./assets/fonts/special-elite-400-font8.woff2","./assets/fonts/special-elite-400.woff2","./assets/fonts/stardos-stencil-400.woff2","./assets/fonts/stardos-stencil-700.woff2","./assets/sounds/button.mp3","./assets/sounds/chair.mp3","./assets/sounds/dice.mp3","./assets/sounds/flash.mp3","./assets/sounds/menu.mp3","./assets/sounds/plane.mp3","./assets/symbole/symbol-01.svg","./assets/symbole/symbol-02.svg","./assets/symbole/symbol-03.svg","./assets/symbole/symbol-04.svg","./assets/symbole/symbol-05.svg","./assets/symbole/symbol-06.svg","./assets/symbole/symbol-07.svg","./assets/symbole/symbol-08.svg","./assets/symbole/symbol-09.svg","./assets/symbole/symbol-10.svg","./assets/symbole/symbol-11.svg","./assets/symbole/symbol-12.svg","./assets/symbole/symbol-13.svg","./assets/symbole/symbol-14.svg","./assets/symbole/symbol-15.svg","./assets/symbole/symbol-16.svg","./assets/symbole/symbol-17.svg","./assets/symbole/symbol-18.svg","./assets/symbole/symbol-19.svg","./assets/symbole/symbol-20.svg","./assets/symbole/symbol-21.svg","./assets/symbole/symbol-22.svg","./assets/symbole/symbol-23.svg","./assets/symbole/symbol-24.svg","./assets/symbole/symbol-25.svg"];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  if (new URL(e.request.url).origin !== self.location.origin) return;   // fremde Seiten (YouTube, PeerJS) nicht anfassen
  e.respondWith(
    fetch(e.request).then(res => {
      if (res.status === 200) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copy)).catch(() => {}); }   // Teilantworten (Video) nicht speichern
      return res;
    }).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html')))
  );
});
