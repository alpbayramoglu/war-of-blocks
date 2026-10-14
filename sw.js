// Çevrimdışı oynamak için önbellek.
// Önce önbellekten ver (zayıf internette de hemen açılsın), arka planda internetten tazele.
// Tazelenen sürüm bir sonraki açılışta görünür. Dosya listesi değişirse CACHE adını artır.
const CACHE = 'war-of-blocks-v2';
const ASSETS = [
  './',
  './index.html',
  './game.js',
  './manifest.webmanifest',
  './icons/icon-180.png',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './fonts/pixelify-sans-700-latin.woff2',
  './fonts/pixelify-sans-700-latin-ext.woff2',
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async cache => {
    const hit = await cache.match(req, { ignoreSearch: true });
    const fresh = fetch(req).then(res => {
      if (res.ok) cache.put(req, res.clone());
      return res;
    });
    if (hit) { e.waitUntil(fresh.catch(() => {})); return hit; }
    return fresh;
  }));
});
