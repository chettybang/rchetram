const CACHE_NAME = 'rchetram-clinical-v15';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/manifest.json',
  '/about/',
  '/about/index.html',
  '/chetmed/',
  '/chetmed/index.html',
  '/reveal/',
  '/reveal/index.html',
  '/rvu/',
  '/rvu/index.html',
  '/antibiotics-guide/',
  '/antibiotics-guide/index.html',
  '/antidepressants/',
  '/antidepressants/index.html',
  '/contraceptive/',
  '/contraceptive/index.html',
  '/dilutional-hgb/',
  '/dilutional-hgb/index.html',
  '/fructosamine/',
  '/fructosamine/index.html',
  '/inhalers/',
  '/inhalers/index.html',
  '/insulin/',
  '/insulin/index.html',
  '/medicaid/',
  '/medicaid/index.html',
  '/mme/',
  '/mme/index.html',
  '/obesity/',
  '/obesity/index.html',
  '/peds-antibiotics/',
  '/peds-antibiotics/index.html',
  '/phosphate/',
  '/phosphate/index.html',
  '/preop/',
  '/preop/index.html',
  '/prices/',
  '/prices/index.html',
  '/steroids/',
  '/steroids/index.html',
  '/stimulants/',
  '/stimulants/index.html',
  '/thyroid/',
  '/thyroid/index.html',
  '/vaccines/',
  '/vaccines/index.html'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(async (cache) => {
      await Promise.allSettled(
        ASSETS_TO_CACHE.map((url) =>
          cache.add(url).catch((err) => console.warn('[SW] Skipped:', url, err))
        )
      );
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

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
        .catch(() => cachedResponse);

      return cachedResponse || fetchPromise;
    })
  );
});
