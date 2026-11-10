const CACHE_NAME = 'rchetram-clinical-v9';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/dilutional-hgb/',
  '/dilutional-hgb/index.html',
  '/antibiotics-guide/',
  '/antibiotics-guide/index.html',
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

// Install Event: Safely cache assets without breaking on single 404s
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      console.log('[Service Worker] Caching clinical assets');
      await Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => console.warn(`[Service Worker] Failed to cache: ${url}`, err))
        )
      );
    })
  );
});

// Activate Event: Delete old cache versions immediately
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch Event: Stale-While-Revalidate
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

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
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          /* Fallback to cached copy offline */
        });

      return cachedResponse || fetchPromise;
    })
  );
});
