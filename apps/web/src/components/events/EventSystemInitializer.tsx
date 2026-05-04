'use client';

import { useEffect, useRef } from 'react';
import { useRealtime } from '@/hooks/use-realtime';

interface EventSystemInitializerProps {
  tenantId: string;
  enabled?: boolean;
}

export function EventSystemInitializer({ tenantId, enabled = true }: EventSystemInitializerProps) {
  const eventCountRef = useRef(0);

  const handleEvent = (event: any) => {
    eventCountRef.current++;
    const { type, payload } = event;

    console.log(`[EventSystem] ${type} #${eventCountRef.current}`, {
      id: event.id,
      tenantId: event.tenantId,
      payload,
    });

    if (type === 'LOW_STOCK_ALERT' || type === 'OUT_OF_STOCK_ALERT') {
      console.warn(`[EventSystem] STOCK ALERT: ${payload?.itemName} (${payload?.currentQty ?? payload?.newQty} remaining)`);
    }

    if (type === 'DRUG_INTERACTION_ALERT' || type === 'CRITICAL_LAB_ALERT' || type === 'CRITICAL_LAB_VALUE') {
      console.error(`[EventSystem] CRITICAL: ${payload?.message ?? type}`);
    }
  };

  const { isConnected } = useRealtime(tenantId, enabled ? handleEvent : () => {});

  useEffect(() => {
    if (isConnected) {
      console.log('[EventSystem] Real-time event system active');
    }
  }, [isConnected]);

  return null;
}
