/**
 * Service Worker Registration
 * Handles registration, updates, and communication with the service worker
 */

export interface SWUpdateEvent {
  isUpdate: boolean;
  registration: ServiceWorkerRegistration;
}

type SWUpdateCallback = (event: SWUpdateEvent) => void;

let updateCallback: SWUpdateCallback | null = null;

/**
 * Set callback for when a new service worker is available
 */
export function onSWUpdate(callback: SWUpdateCallback): void {
  updateCallback = callback;
}

/**
 * Unregister all service workers (for development/debugging)
 */
async function unregisterAllServiceWorkers(): Promise<void> {
  if ('serviceWorker' in navigator) {
    const registrations = await navigator.serviceWorker.getRegistrations();
    for (const registration of registrations) {
      await registration.unregister();
    }
    if (registrations.length > 0) {
      console.log('[SW] Unregistered', registrations.length, 'service worker(s)');
    }
  }
}

/**
 * Register the service worker
 * Only registers in production to avoid dev mode reload loops
 */
export function registerSW(): void {
  // In development, unregister any existing service workers to prevent reload loops
  if (import.meta.env.DEV) {
    console.log('[SW] Development mode - unregistering any existing service workers');
    void unregisterAllServiceWorkers();
    return;
  }

  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      void registerServiceWorker();
    });
  }
}

async function registerServiceWorker(): Promise<void> {
  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    });

    // Check for updates periodically (every hour)
    setInterval(
      () => {
        void registration.update();
      },
      60 * 60 * 1000
    );

    // Handle updates
    registration.addEventListener('updatefound', () => {
      const newWorker = registration.installing;
      if (!newWorker) return;

      newWorker.addEventListener('statechange', () => {
        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
          // New content available
          if (updateCallback) {
            updateCallback({
              isUpdate: true,
              registration,
            });
          }
        }
      });
    });

    // Handle controller change (when skipWaiting is called)
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing) return;
      refreshing = true;
      window.location.reload();
    });

    console.log('[SW] Service Worker registered successfully');
  } catch (error) {
    console.error('[SW] Service Worker registration failed:', error);
  }
}

/**
 * Prompt user to update and activate new service worker
 */
export function promptUpdate(registration: ServiceWorkerRegistration): void {
  const waiting = registration.waiting;
  if (!waiting) return;

  // Tell the waiting service worker to skip waiting
  waiting.postMessage({ type: 'SKIP_WAITING' });
}

/**
 * Check if app is running in standalone mode (installed PWA)
 */
export function isStandalone(): boolean {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    // iOS Safari
    ('standalone' in window.navigator && (window.navigator as { standalone?: boolean }).standalone === true)
  );
}

/**
 * Check if device is online
 */
export function isOnline(): boolean {
  return navigator.onLine;
}

/**
 * Add listener for online/offline events
 */
export function onNetworkChange(callback: (online: boolean) => void): () => void {
  const handleOnline = () => callback(true);
  const handleOffline = () => callback(false);

  window.addEventListener('online', handleOnline);
  window.addEventListener('offline', handleOffline);

  return () => {
    window.removeEventListener('online', handleOnline);
    window.removeEventListener('offline', handleOffline);
  };
}
