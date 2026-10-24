// ===== Pre$u · service worker =====
// Guarda la app en el móvil para que abra sin internet.
// - La página (index.html): primero intenta la versión nueva de internet; si no hay conexión, usa la guardada.
// - Iconos y manifest: se usan los guardados.
// Cuando subas una versión nueva a GitHub, cambia VERSION (ej: 'presu-v2') para renovar lo guardado.
const VERSION = 'presu-v24';
const ARCHIVOS = ['./', 'index.html', 'manifest.webmanifest',
  'iconos/apple-touch-icon.png', 'iconos/icon-192.png', 'iconos/icon-512.png', 'iconos/icon-maskable-512.png',
  'img/ejemplo-automatizacion.jpg'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ARCHIVOS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(claves => Promise.all(claves.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  if (req.mode === 'navigate') {
    e.respondWith(fetch(req)
      .then(r => { const copia = r.clone(); caches.open(VERSION).then(c => c.put('index.html', copia)); return r; })
      .catch(() => caches.match('index.html').then(r => r || caches.match('./'))));
    return;
  }
  e.respondWith(caches.match(req).then(r => r || fetch(req)));
});
