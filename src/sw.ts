/// <reference lib="webworker" />
import { cleanupOutdatedCaches, precacheAndRoute } from 'workbox-precaching';
import { clientsClaim } from 'workbox-core';
import { registerRoute } from 'workbox-routing';
import { CacheFirst, NetworkFirst } from 'workbox-strategies';
import { ExpirationPlugin } from 'workbox-expiration';

declare let self: ServiceWorkerGlobalScope;

// Self claim immediately
self.skipWaiting();
clientsClaim();

// Clean up old caches
cleanupOutdatedCaches();

// Precache all assets built by Vite
precacheAndRoute(self.__WB_MANIFEST);

// Cache-first for static images
registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|webp|ico)$/,
  new CacheFirst({
    cacheName: 'images-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 100,
        maxAgeSeconds: 60 * 60 * 24 * 30, // 30 days
      }),
    ],
  })
);

// Cache-first for fonts
registerRoute(
  /\.(?:woff|woff2|ttf|otf)$/,
  new CacheFirst({
    cacheName: 'fonts-cache',
    plugins: [
      new ExpirationPlugin({
        maxEntries: 20,
        maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
      }),
    ],
  })
);

// Network-first for API calls
registerRoute(
  /\/api\/.*/,
  new NetworkFirst({
    cacheName: 'api-cache',
    networkTimeoutSeconds: 10,
    plugins: [
      new ExpirationPlugin({
        maxEntries: 50,
        maxAgeSeconds: 60 * 60, // 1 hour
      }),
    ],
  })
);

// ============================================
// Share Target Handler
// ============================================

const SHARE_TARGET_CACHE = 'share-target-cache';
const SHARE_TARGET_URL = '/share-target';

// Handle Share Target POST requests
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // Only handle POST requests to /share-target
  if (url.pathname === SHARE_TARGET_URL && event.request.method === 'POST') {
    event.respondWith(handleShareTarget(event.request));
  }
});

async function handleShareTarget(request: Request): Promise<Response> {
  try {
    // Parse the shared data from FormData
    const formData = await request.formData();
    const title = formData.get('title') as string | null;
    const text = formData.get('text') as string | null;
    const url = formData.get('url') as string | null;
    const files = formData.getAll('media') as File[];

    // Store shared data in cache for the client to retrieve
    const shareData = {
      title: title ?? '',
      text: text ?? '',
      url: url ?? '',
      files: await Promise.all(
        files.map(async (file) => ({
          name: file.name,
          type: file.type,
          size: file.size,
          data: await fileToBase64(file),
        }))
      ),
      timestamp: Date.now(),
    };

    // Store in cache
    const cache = await caches.open(SHARE_TARGET_CACHE);
    await cache.put(
      new Request('/share-target-data'),
      new Response(JSON.stringify(shareData), {
        headers: { 'Content-Type': 'application/json' },
      })
    );

    // Redirect to the share target page
    return Response.redirect('/share-target?pending=true', 303);
  } catch (error) {
    console.error('[SW] Share target error:', error);
    return Response.redirect('/share-target?error=true', 303);
  }
}

async function fileToBase64(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const bytes = new Uint8Array(arrayBuffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    const byte = bytes[i];
    if (byte !== undefined) {
      binary += String.fromCharCode(byte);
    }
  }
  return btoa(binary);
}

// ============================================
// Message Handler
// ============================================

self.addEventListener('message', (event) => {
  const { type } = event.data || {};

  switch (type) {
    case 'SKIP_WAITING':
      self.skipWaiting();
      break;

    case 'GET_SHARE_DATA':
      // Client is requesting the shared data
      event.waitUntil(
        (async () => {
          const cache = await caches.open(SHARE_TARGET_CACHE);
          const response = await cache.match('/share-target-data');
          if (response && event.source) {
            const data = await response.json();
            (event.source as Client).postMessage({
              type: 'SHARE_DATA',
              data,
            });
            // Clear the data after sending
            await cache.delete('/share-target-data');
          }
        })()
      );
      break;

    case 'CLEAR_SHARE_DATA':
      event.waitUntil(
        (async () => {
          const cache = await caches.open(SHARE_TARGET_CACHE);
          await cache.delete('/share-target-data');
        })()
      );
      break;
  }
});
