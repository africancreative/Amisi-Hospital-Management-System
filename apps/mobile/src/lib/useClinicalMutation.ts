import { useConnectivity } from '../trpc/ConnectivityProvider';
import { offlineStore } from './offline-store';
import { api } from '../trpc/client';
import { useState } from 'react';

/**
 * useClinicalMutation
 * 
 * A resilient wrapper for clinical documentation.
 * Switches between live tRPC and local SQLite SyncQueue based on connectivity.
 */
export function useClinicalMutation(
  mutationKey: string, 
  trpcMutation: any
) {
  const { state } = useConnectivity();
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastStatus, setLastStatus] = useState<'IDLE' | 'LIVE' | 'QUEUED' | 'ERROR'>('IDLE');

  const mutate = async (payload: any, visitId?: string) => {
    if (state === 'OFFLINE') {
      // Queue offline
      offlineStore.queueMutation(mutationKey, payload, visitId);
      setLastStatus('QUEUED');
      return { status: 'QUEUED' };
    }

    // Live Sync
    setIsSyncing(true);
    try {
      await trpcMutation.mutateAsync(payload);
      setLastStatus('LIVE');
      return { status: 'LIVE' };
    } catch (err) {
      // Fallback to queue if mutation fails due to network jitter
      offlineStore.queueMutation(mutationKey, payload, visitId);
      setLastStatus('QUEUED');
      return { status: 'QUEUED' };
    } finally {
      setIsSyncing(false);
    }
  };

  return {
    mutate,
    isSyncing,
    lastStatus,
    isOffline: state === 'OFFLINE',
  };
}
