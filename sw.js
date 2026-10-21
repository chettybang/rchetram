/* STREAMING_CHUNK:Defining cache version and static asset manifest... /
/*

PWA Service Worker for rchetram.com

Provides offline caching for all clinical decision tools and micro-apps.
*/

const CACHE_NAME = 'rchetram-clinical-v2';

// List of all static app assets to cache for offline access
const ASSETS_TO_CACHE = [
'/',
'/index.html',
'/manifest.json',
'/obesity/',
'/obesity/index.html',
'/prices/',
'/prices/index.html',
'/prices/manifest.json',
'/stimulants/',
'/stimulants/index.html',
'/antidepressants/',
'/antidepressants/index.html',
'/medicaid/',
'/medicaid/index.html',
'/mme/',
'/mme/index.html',
'/phosphate/',
'/phosphate/index.html'
];

/* STREAMING_CHUNK:Handling service worker installation event... */
self.addEventListener('install', (event) => {
// Force the waiting service worker to become the active service worker
self.skipWaiting();

event.waitUntil(
caches.open(CACHE_NAME).then((cache) => {
console.log('[Service Worker] Caching root clinical app assets');
return cache.addAll(ASSETS_TO_CACHE);
}).catch((error) => {
console.error('[Service Worker] Pre-cache failed:', error);
})
);
});

/* STREAMING_CHUNK:Handling service worker activation and cache cleanup... */
self.addEventListener('activate', (event) => {
// Claim any clients immediately
event.waitUntil(
caches.keys().then((cacheNames) => {
return Promise.all(
cacheNames.map((cache) => {
if (cache !== CACHE_NAME) {
console.log('[Service Worker] Purging old cache:', cache);
return caches.delete(cache);
}
})
);
}).then(() => self.clients.claim())
);
});

/* STREAMING_CHUNK:Interpreting network requests and applying cache strategies... */
self.addEventListener('fetch', (event) => {
const requestUrl = new URL(event.request.url);

// Exclude third-party API proxies (like Cloudflare workers) from static cache
if (requestUrl.hostname.includes('workers.dev') || requestUrl.hostname.includes('costplusdrugs.com')) {
return; // Pass directly to network
}

// Stale-While-Revalidate caching strategy for HTML/CSS/JS assets
event.respondWith(
caches.match(event.request).then((cachedResponse) => {
const fetchPromise = fetch(event.request)
.then((networkResponse) => {
// Verify valid response before updating cache
if (networkResponse && networkResponse.status === 200 && networkResponse.type === 'basic') {
const responseToCache = networkResponse.clone();
caches.open(CACHE_NAME).then((cache) => {
cache.put(event.request, responseToCache);
});
}
return networkResponse;
})
.catch(() => {
// Silently fail fetch when offline; cached response will be served
});

  // Serve from cache first if available, otherwise wait for network fetch
  return cachedResponse || fetchPromise;
})


);
});
