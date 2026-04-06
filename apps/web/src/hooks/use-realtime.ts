'use client';

import { useEffect, useState } from 'react';
import { RealtimeEvent } from '@amisi/realtime';

export function useRealtime(tenantId: string, onUpdate: (event: RealtimeEvent) => void) {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!tenantId) return;

    console.log(`[Realtime Hook] Connecting to ${tenantId} stream...`);
    const eventSource = new EventSource(`/api/realtime?tenantId=${tenantId}`);

    eventSource.onopen = () => {
      console.log(`[Realtime Hook] Connected to ${tenantId} stream`);
      setIsConnected(true);
    };

    eventSource.onmessage = (event) => {
      try {
        const data: RealtimeEvent = JSON.parse(event.data);
        if (data.type) {
            console.log(`[Realtime Hook] Received ${data.type} for ${data.resource}:${data.id}`);
            onUpdate(data);
        }
      } catch (err) {
        // Heartbeats or malformed data
      }
    };

    eventSource.onerror = () => {
      console.error(`[Realtime Hook] Connection error for ${tenantId}`);
      setIsConnected(false);
      eventSource.close();
    };

    return () => {
      console.log(`[Realtime Hook] Disconnecting from ${tenantId} stream`);
      eventSource.close();
    };
  }, [tenantId, onUpdate]);

  return { isConnected };
}
