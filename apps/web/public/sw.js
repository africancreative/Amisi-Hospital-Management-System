/**
 * AmisiMedOS Service Worker
 * 
 * Provides offline resilience for clinical dashboards and critical assets.
 */

const CACHE_NAME = 'amisi-medos-v4';
const OFFLINE_URLS = [
  '/',
  '/favicon.ico',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(OFFLINE_URLS);
    })
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

/**
 * Fetch Strategy: Stale-While-Revalidate
 * Prioritizes speed but fetches fresh content in the background.
 */
self.addEventListener('fetch', (event) => {
  // We only cache GET requests
  if (event.request.method !== 'GET') return;

  // We don't cache tRPC / API calls in the Service Worker (they are handled by the Sync Engine/Buffer)
  if (event.request.url.includes('/api/')) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        // If successful, update the cache
        if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
                cache.put(event.request, responseToCache);
            });
        }
        return networkResponse;
      }).catch(() => {
          // Fallback if network fails and no cache exists
          return cachedResponse;
      });

      return cachedResponse || fetchPromise;
    })
  );
});
