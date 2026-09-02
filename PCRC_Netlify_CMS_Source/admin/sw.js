const VERSION = 'pcrc-admin-pwa-v1';
const STATIC_CACHE = `${VERSION}-static`;
const STATIC_ASSETS = [
  '/admin/offline.html',
  '/admin/install.html',
  '/admin/manifest.webmanifest',
  '/admin/icons/icon-192.png',
  '/admin/icons/icon-512.png',
  '/admin/icons/icon-maskable-512.png',
  '/admin/icons/apple-touch-icon.png'
];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(STATIC_CACHE).then(cache => cache.addAll(STATIC_ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k !== STATIC_CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;
  const url = new URL(request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith('/admin/')) return;

  // Cache only static PWA artwork. CMS, config, login and content always come from the network.
  if (url.pathname.startsWith('/admin/icons/') || url.pathname === '/admin/manifest.webmanifest') {
    event.respondWith(caches.match(request).then(hit => hit || fetch(request).then(resp => {
      const copy = resp.clone();
      caches.open(STATIC_CACHE).then(cache => cache.put(request, copy));
      return resp;
    })));
    return;
  }

  if (request.mode === 'navigate') {
    event.respondWith(fetch(request).catch(() => caches.match('/admin/offline.html')));
  }
});
