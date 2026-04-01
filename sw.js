const CACHE = 'epr-v2';
const ASSETS = [
  '/epr-salesman/',
  '/epr-salesman/index.html',
  '/epr-salesman/manifest.json',
  '/epr-salesman/config.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)));
  self.skipWaiting();
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys =>
    Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
  ));
});

self.addEventListener('fetch', e => {
  if (e.request.url.includes('/api/')) {
    // Network first untuk API
    e.respondWith(
      fetch(e.request).catch(() =>
        new Response(JSON.stringify({ success: false, message: 'Offline' }),
          { headers: { 'Content-Type': 'application/json' } })
      )
    );
  } else {
    // Cache first untuk asset statis
    e.respondWith(
      caches.match(e.request).then(r => r || fetch(e.request))
    );
  }
});
