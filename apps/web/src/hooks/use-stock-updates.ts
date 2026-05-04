'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { useRealtime } from '@/hooks/use-realtime';

export interface StockUpdate {
  itemId: string;
  itemName: string;
  previousQty: number;
  newQty: number;
  changeQty: number;
  prescriptionId?: string;
  patientName?: string;
  dispensedBy?: string;
  batchAllocations?: { batchId: string; batchNumber: string; qty: number }[];
  timestamp: string;
}

export interface StockAlertEvent {
  itemId: string;
  itemName: string;
  currentQty: number;
  minLevel: number;
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING_SOON';
  message: string;
  timestamp: string;
}

interface UseStockUpdatesOptions {
  tenantId: string;
  enabled?: boolean;
  onStockUpdate?: (update: StockUpdate) => void;
  onAlert?: (alert: StockAlertEvent) => void;
}

export function useStockUpdates({ tenantId, enabled = true, onStockUpdate, onAlert }: UseStockUpdatesOptions) {
  const [recentUpdates, setRecentUpdates] = useState<StockUpdate[]>([]);
  const [recentAlerts, setRecentAlerts] = useState<StockAlertEvent[]>([]);
  const onStockUpdateRef = useRef(onStockUpdate);
  const onAlertRef = useRef(onAlert);

  onStockUpdateRef.current = onStockUpdate;
  onAlertRef.current = onAlert;

  const handleEvent = useCallback((event: any) => {
    if (event.type === 'INVENTORY_DISPENSED' && event.payload) {
      const update: StockUpdate = {
        itemId: event.id,
        itemName: event.payload.itemName,
        previousQty: event.payload.previousQty,
        newQty: event.payload.newQty,
        changeQty: event.payload.changeQty,
        prescriptionId: event.payload.prescriptionId,
        patientName: event.payload.patientName,
        dispensedBy: event.payload.dispensedBy,
        batchAllocations: event.payload.batchAllocations,
        timestamp: event.payload.timestamp,
      };

      setRecentUpdates(prev => [update, ...prev].slice(0, 50));
      onStockUpdateRef.current?.(update);
    }

    if (event.type === 'INVENTORY_ALERT' && event.payload) {
      const alert: StockAlertEvent = {
        itemId: event.id,
        itemName: event.payload.itemName,
        currentQty: event.payload.currentQty,
        minLevel: event.payload.minLevel,
        alertType: event.payload.alertType,
        message: event.payload.message,
        timestamp: event.payload.timestamp,
      };

      setRecentAlerts(prev => [alert, ...prev].slice(0, 50));
      onAlertRef.current?.(alert);
    }
  }, []);

  const { isConnected } = useRealtime(tenantId, enabled ? handleEvent : () => {});

  return {
    isConnected,
    recentUpdates,
    recentAlerts,
    clearUpdates: () => setRecentUpdates([]),
    clearAlerts: () => setRecentAlerts([]),
  };
}
