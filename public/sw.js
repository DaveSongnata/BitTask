/**
 * BitTask Service Worker
 * Handles caching, offline functionality, and future sync operations
 *
 * Cache Strategy:
 * - App Shell: Cache-first (HTML, CSS, JS)
 * - Static Assets: Cache-first (images, fonts)
 * - API Calls: Network-first with cache fallback (placeholder for sync)
 * - Attachments: Stored in IndexedDB (not cached by SW)
 */

const CACHE_VERSION = 'v1';
const CACHE_NAME = `bittask-${CACHE_VERSION}`;

// Assets to precache
const PRECACHE_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/icons/favicon.png',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
];

// ============================================
// Install Event - Precache static assets
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...');

  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Precaching app shell');
        return cache.addAll(PRECACHE_ASSETS);
      })
      .then(() => {
        console.log('[SW] Skip waiting on install');
        return self.skipWaiting();
      })
  );
});

// ============================================
// Activate Event - Clean up old caches
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...');

  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames
            .filter((name) => name.startsWith('bittask-') && name !== CACHE_NAME)
            .map((name) => {
              console.log('[SW] Deleting old cache:', name);
              return caches.delete(name);
            })
        );
      })
      .then(() => {
        console.log('[SW] Claiming clients');
        return self.clients.claim();
      })
  );
});

// ============================================
// Fetch Event - Handle requests
// ============================================
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return;
  }

  // Skip chrome-extension and other non-http(s) requests
  if (!url.protocol.startsWith('http')) {
    return;
  }

  // API requests - Network first (placeholder for future sync)
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(networkFirst(request));
    return;
  }

  // Static assets and app shell - Cache first
  event.respondWith(cacheFirst(request));
});

// ============================================
// Cache Strategies
// ============================================

/**
 * Cache-first strategy
 * Try cache, fall back to network, cache the response
 */
async function cacheFirst(request) {
  const cachedResponse = await caches.match(request);

  if (cachedResponse) {
    // Return cached response, but update cache in background
    updateCache(request);
    return cachedResponse;
  }

  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    // Return offline fallback for navigation requests
    if (request.mode === 'navigate') {
      return caches.match('/') || createOfflineResponse();
    }

    throw error;
  }
}

/**
 * Network-first strategy
 * Try network, fall back to cache
 */
async function networkFirst(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, networkResponse.clone());
    }

    return networkResponse;
  } catch (error) {
    const cachedResponse = await caches.match(request);

    if (cachedResponse) {
      return cachedResponse;
    }

    // Return error response for API calls
    return new Response(
      JSON.stringify({
        error: 'Offline',
        message: 'This action requires an internet connection.',
      }),
      {
        status: 503,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}

/**
 * Update cache in background (stale-while-revalidate pattern)
 */
async function updateCache(request) {
  try {
    const networkResponse = await fetch(request);

    if (networkResponse.ok) {
      const cache = await caches.open(CACHE_NAME);
      await cache.put(request, networkResponse);
    }
  } catch (error) {
    // Silently fail - we already have cached version
  }
}

/**
 * Create offline fallback response
 */
function createOfflineResponse() {
  const html = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>BitTask - Offline</title>
      <style>
        body {
          font-family: 'Press Start 2P', monospace;
          background-color: #ffecd6;
          color: #0d2b45;
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          margin: 0;
          padding: 16px;
          text-align: center;
        }
        .container {
          border: 4px solid #544e68;
          padding: 32px;
          background: white;
          box-shadow: 4px 4px 0 #544e68;
        }
        h1 { font-size: 16px; margin-bottom: 16px; }
        p { font-size: 10px; line-height: 1.8; }
        button {
          margin-top: 24px;
          padding: 12px 24px;
          font-family: inherit;
          font-size: 10px;
          background: #ffaa5e;
          border: 4px solid #544e68;
          cursor: pointer;
          box-shadow: 4px 4px 0 #544e68;
        }
        button:active {
          transform: translate(2px, 2px);
          box-shadow: 2px 2px 0 #544e68;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>You're Offline</h1>
        <p>BitTask needs to download some files first.<br>Please connect to the internet.</p>
        <button onclick="location.reload()">Try Again</button>
      </div>
    </body>
    </html>
  `;

  return new Response(html, {
    headers: { 'Content-Type': 'text/html' },
  });
}

// ============================================
// Message Handler
// ============================================
self.addEventListener('message', (event) => {
  const { type, payload } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      console.log('[SW] Skip waiting requested');
      self.skipWaiting();
      break;

    case 'CLAIM_CLIENTS':
      console.log('[SW] Claim clients requested');
      self.clients.claim();
      break;

    case 'CLEAR_CACHE':
      console.log('[SW] Clear cache requested');
      caches.delete(CACHE_NAME);
      break;

    // Placeholder for future sync operations
    case 'SYNC_REQUEST':
      console.log('[SW] Sync requested (not implemented)', payload);
      // Future: Handle background sync
      // This would be called when online to push offline operations
      break;

    default:
      console.log('[SW] Unknown message type:', type);
  }
});

// ============================================
// Background Sync (Future Implementation)
// ============================================
// When Background Sync API is used, this handler will process queued operations
self.addEventListener('sync', (event) => {
  console.log('[SW] Sync event:', event.tag);

  if (event.tag === 'sync-tasks') {
    // Future: Sync offline operations with server
    // event.waitUntil(syncTasks());
  }
});

// Placeholder for future sync implementation
// async function syncTasks() {
//   // 1. Open IndexedDB and get offline operations queue
//   // 2. Send each operation to the server
//   // 3. Handle conflicts using reconcileConflict strategy
//   // 4. Mark operations as synced
//   // 5. Notify clients of sync completion
// }

// ============================================
// Push Notifications (Future Implementation)
// ============================================
self.addEventListener('push', (event) => {
  console.log('[SW] Push event received');

  // Future: Handle push notifications for task reminders
  // const data = event.data?.json();
  // self.registration.showNotification(data.title, {
  //   body: data.body,
  //   icon: '/icons/icon-192x192.png',
  //   badge: '/icons/badge-72x72.png',
  // });
});
