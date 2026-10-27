const CACHE_NAME = 'rchetram-clinical-v6';

// Complete manifest of static assets across all 16 micro-apps
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/prices/',
  '/prices/index.html',
  '/antidepressants/',
  '/antidepressants/index.html',
  '/stimulants/',
  '/stimulants/index.html',
  '/peds-antibiotics/',
  '/peds-antibiotics/index.html',
  '/obesity/',
  '/obesity/index.html',
  '/insulin/',
  '/insulin/index.html',
  '/antibiotics/',
  '/antibiotics/index.html',
  '/preop/',
  '/preop/index.html',
  '/vaccines/',
  '/vaccines/index.html',
  '/contraceptive/',
  '/contraceptive/index.html',
  '/steroids/',
  '/steroids/index.html',
  '/thyroid/',
  '/thyroid/index.html',
  '/inhalers/',
  '/inhalers/index.html',
  '/medicaid/',
  '/medicaid/index.html',
  '/mme/',
  '/mme/index.html',
  '/phosphate/',
  '/phosphate/index.html'
];

// Install Event: Cache all micro-apps locally
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching all clinical app assets');
      return cache.addAll(ASSETS_TO_CACHE);
    }).catch((err) => console.error('[Service Worker] Cache install failed:', err))
  );
});

// Activate Event: Clean up outdated caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Deleting old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate Strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Bypass worker API calls (like Cost Plus Drugs proxy)
  if (url.hostname.includes('workers.dev') || url.hostname.includes('costplusdrugs.com')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request)
        .then((networkResponse) => {
          if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, networkResponse);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          /* Fail silently offline; served from cache */
        });

      return cachedResponse || fetchPromise;
    })
  );
});
