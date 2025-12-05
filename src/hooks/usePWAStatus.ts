import { useState, useEffect, useCallback } from 'react';
import { isStandalone, isOnline, onNetworkChange, onSWUpdate, promptUpdate } from '@/pwa/sw-register';
import type { PWAStatus, PWAInstallPromptEvent } from '@/types';

/**
 * usePWAStatus
 * Tracks PWA installation status, update availability, and network state
 */
export function usePWAStatus(): PWAStatus & {
  installApp: () => Promise<boolean>;
  updateApp: () => void;
} {
  const [isInstalled, setIsInstalled] = useState(isStandalone);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isOffline, setIsOffline] = useState(!isOnline());
  const [hasUpdate, setHasUpdate] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [installPrompt, setInstallPrompt] = useState<PWAInstallPromptEvent | null>(null);

  // Listen for install prompt
  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent default browser prompt
      e.preventDefault();
      // Store the event for later use
      setInstallPrompt(e as PWAInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setInstallPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  // Listen for service worker updates
  useEffect(() => {
    onSWUpdate((event) => {
      setHasUpdate(event.isUpdate);
      setRegistration(event.registration);
    });
  }, []);

  // Listen for network changes
  useEffect(() => {
    return onNetworkChange((online) => {
      setIsOffline(!online);
    });
  }, []);

  // Check if running in standalone mode changes
  useEffect(() => {
    const checkStandalone = () => {
      setIsInstalled(isStandalone());
    };

    // Check on visibility change (user might have installed)
    document.addEventListener('visibilitychange', checkStandalone);
    return () => document.removeEventListener('visibilitychange', checkStandalone);
  }, []);

  /**
   * Trigger app installation
   */
  const installApp = useCallback(async (): Promise<boolean> => {
    if (!installPrompt) {
      console.log('[PWA] No install prompt available');
      return false;
    }

    try {
      await installPrompt.prompt();
      const result = await installPrompt.userChoice;

      if (result.outcome === 'accepted') {
        console.log('[PWA] App installed');
        setInstallPrompt(null);
        setIsInstallable(false);
        return true;
      } else {
        console.log('[PWA] Install dismissed');
        return false;
      }
    } catch (error) {
      console.error('[PWA] Install failed:', error);
      return false;
    }
  }, [installPrompt]);

  /**
   * Apply pending update
   */
  const updateApp = useCallback(() => {
    if (registration) {
      promptUpdate(registration);
    }
  }, [registration]);

  return {
    isInstalled,
    isInstallable,
    isOffline,
    hasUpdate,
    registration,
    installApp,
    updateApp,
  };
}
