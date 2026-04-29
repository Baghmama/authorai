const CACHE_NAME = 'author-ai-v2';
const urlsToPrecache = [
  '/',
  '/manifest.json',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/favicon.ico'
];

// Install event - precache basic assets
self.addEventListener('install', (event) => {
  self.skipWaiting(); // Force the waiting service worker to become the active service worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        return cache.addAll(urlsToPrecache);
      })
      .catch((error) => {
        console.log('Precache failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    Promise.all([
      self.clients.claim(), // Become the controller for all clients immediately
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
    ])
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  // Navigation requests (like the main page) - Network First
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // Update the cache with the newest version of the page
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseClone);
          });
          return response;
        })
        .catch(() => {
          // If network fails, try the cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Other requests - Cache First, falling back to Network
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        if (response) {
          return response;
        }
        return fetch(event.request).then((networkResponse) => {
          // Detect 404 fallbacks (server returns index.html for missing assets)
          const contentType = networkResponse.headers.get('content-type');
          if (
            (event.request.destination === 'script' || event.request.destination === 'style') &&
            contentType && contentType.includes('text/html')
          ) {
            console.warn(`[SW] Detected 404 fallback for ${event.request.url}. Asset likely missing.`);
            return new Response('Asset not found', { status: 404, statusText: 'Not Found' });
          }

          // Don't cache everything, just assets and static files
          if (
            networkResponse.ok && 
            (event.request.url.includes('/assets/') || 
             event.request.url.includes('.png') || 
             event.request.url.includes('.json'))
          ) {
            const responseClone = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseClone);
            });
          }
          return networkResponse;
        });
      })
  );
});
