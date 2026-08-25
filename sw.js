/* ==========================================================
   Cloud Move Analyzer — Service Worker
   Strategy:
   - Navigations (HTML): network-first, falling back to cache (offline support).
   - Same-origin static assets (?v= cache-busted, immutable at the edge):
     cache-first with background refresh (stale-while-revalidate).
   Bump CACHE_VERSION to invalidate everything after a breaking change.
   ========================================================== */
const CACHE_VERSION = 'cma-v1';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION).then((cache) => cache.addAll(['/'])).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_VERSION).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin) return; // never intercept third-party (e.g. analytics)

  if (request.mode === 'navigate') {
    // Network-first: fresh HTML when online, cached shell when offline.
    event.respondWith(
      fetch(request)
        .then((res) => {
          const copy = res.clone();
          caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          return res;
        })
        .catch(() => caches.match(request).then((hit) => hit || caches.match('/')))
    );
    return;
  }

  // Static assets: cache-first with background refresh.
  event.respondWith(
    caches.match(request).then((hit) => {
      const refresh = fetch(request)
        .then((res) => {
          if (res && res.ok) {
            const copy = res.clone();
            caches.open(CACHE_VERSION).then((cache) => cache.put(request, copy));
          }
          return res;
        })
        .catch(() => hit); // offline: fall back to whatever we had
      return hit || refresh;
    })
  );
});
