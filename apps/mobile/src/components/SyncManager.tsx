import React, { useEffect } from 'react';
import { useConnectivity } from '../trpc/ConnectivityProvider';
import { offlineStore } from '../lib/offline-store';
import { api } from '../trpc/client';

/**
 * SyncManager
 * 
 * background reconciliation component.
 * Detects online status and replays queued mutations.
 */
export function SyncManager() {
  const { state } = useConnectivity();
  const utils = api.useUtils();

  // Define mutations for replay
  // In a real app, this would be a registry of supported mutation types
  const vitalsMutation = api.clinical.recordVitals.useMutation();
  const medAdminMutation = api.clinical.administerMedication.useMutation();

  useEffect(() => {
    if (state !== 'OFFLINE') {
      processSyncQueue();
    }
  }, [state]);

  const processSyncQueue = async () => {
    const pending = offlineStore.getPendingMutations();
    if (pending.length === 0) return;

    console.log(`[SyncManager] Processing ${pending.length} pending mutations...`);

    for (const item of pending) {
      try {
        const payload = JSON.parse(item.payload);
        
        switch (item.mutation_type) {
          case 'RECORD_VITALS':
            await vitalsMutation.mutateAsync(payload);
            break;
          case 'ADMINISTER_MED':
            await medAdminMutation.mutateAsync(payload);
            break;
          default:
            console.warn(`Unknown mutation type: ${item.mutation_type}`);
        }

        offlineStore.markAsSynced(item.id);
      } catch (err) {
        console.error(`[SyncManager] Failed to sync ${item.id}:`, err);
        // We stop processing if one fails to preserve order, 
        // or we could mark as ERROR and continue.
        break; 
      }
    }

    // Refresh queries after sync
    utils.invalidate();
  };

  return null; // Background component
}
