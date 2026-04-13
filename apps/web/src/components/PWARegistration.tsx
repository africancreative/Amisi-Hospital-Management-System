'use client';

import { useEffect } from 'react';

/**
 * PWA Registration Component
 * 
 * Handles Service Worker registration and basic offline status monitoring.
 */
export default function PWARegistration() {
  useEffect(() => {
    if ('serviceWorker' in navigator && window.location.protocol === 'https:' || window.location.hostname === 'localhost') {
      window.addEventListener('load', () => {
        navigator.serviceWorker
          .register('/sw.js')
          .then((registration) => {
            console.log('[PWA] ServiceWorker registered with scope: ', registration.scope);
          })
          .catch((error) => {
            console.error('[PWA] ServiceWorker registration failed: ', error);
          });
      });
    }

    // Monitor Online/Offline status
    const handleOnline = () => {
        console.log('[PWA] Connection Restored. READY for Offline Reconciliation.');
        // Trigger generic custom event that other components can listen to
        window.dispatchEvent(new CustomEvent('amisi-sync-required'));
    };

    const handleOffline = () => {
        console.log('[PWA] Offline Mode Activated. Clinical Buffer enabled.');
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return null;
}
