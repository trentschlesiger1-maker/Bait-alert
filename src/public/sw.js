// Safe Pets Australia — Service Worker
// Caches app shell for offline use
 
const CACHE_NAME = "safepets-v1";
const ASSETS = [
  "/",
  "/index.html",
  "/src/main.jsx",
  "/src/App.jsx",
  "/src/data/riskData.js",
  "/src/data/campsiteData.js",
  "/src/data/snakeData.js",
  "/src/data/hazardData.js",
];
 
// Install — cache all assets
self.addEventListener("install", function(e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function(cache) {
      return cache.addAll(ASSETS).catch(function(err) {
        console.log("SW cache error:", err);
      });
    })
  );
  self.skipWaiting();
});
 
// Activate — clean up old caches
self.addEventListener("activate", function(e) {
  e.waitUntil(
    caches.keys().then(function(keys) {
      return Promise.all(
        keys.filter(function(k) { return k !== CACHE_NAME; })
            .map(function(k) { return caches.delete(k); })
      );
    })
  );
  self.clients.claim();
});
 
// Fetch — serve from cache first, fall back to network
self.addEventListener("fetch", function(e) {
  // Don't cache API calls
  if (e.request.url.includes("api.anthropic.com") ||
      e.request.url.includes("overpass-api.de") ||
      e.request.url.includes("openstreetmap.org") ||
      e.request.url.includes("nominatim")) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then(function(cached) {
      if (cached) return cached;
      return fetch(e.request).then(function(response) {
        // Cache successful GET requests
        if (e.request.method === "GET" && response.status === 200) {
          var clone = response.clone();
          caches.open(CACHE_NAME).then(function(cache) {
            cache.put(e.request, clone);
          });
        }
        return response;
      }).catch(function() {
        // Offline fallback — return cached index
        return caches.match("/index.html");
      });
    })
  );
});
