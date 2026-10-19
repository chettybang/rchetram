self.addEventListener("install", event => {
  event.waitUntil(
    caches.open("med-price-v1").then(cache => cache.addAll(["/"]))
  );
});

self.addEventListener("fetch", event => {
  event.respondWith(
    fetch(event.request).catch(() => caches.match(event.request))
  );
});
