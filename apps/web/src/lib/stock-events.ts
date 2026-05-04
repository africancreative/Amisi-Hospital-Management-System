import { realtimeHub } from '@amisimedos/chat';

export interface StockUpdateEvent {
  itemId: string;
  itemName: string;
  previousQty: number;
  newQty: number;
  changeQty: number;
  prescriptionId?: string;
  patientName?: string;
  dispensedBy?: string;
  batchAllocations?: { batchId: string; batchNumber: string; qty: number }[];
}

export function broadcastStockUpdate(tenantId: string, event: StockUpdateEvent) {
  realtimeHub.broadcast(
    tenantId,
    'INVENTORY_DISPENSED',
    'inventoryItem',
    event.itemId,
    {
      itemName: event.itemName,
      previousQty: event.previousQty,
      newQty: event.newQty,
      changeQty: event.changeQty,
      prescriptionId: event.prescriptionId,
      patientName: event.patientName,
      dispensedBy: event.dispensedBy,
      batchAllocations: event.batchAllocations,
      timestamp: new Date().toISOString(),
    }
  );
}

export function broadcastInventoryAlert(
  tenantId: string,
  itemId: string,
  itemName: string,
  currentQty: number,
  minLevel: number,
  alertType: 'LOW_STOCK' | 'OUT_OF_STOCK' | 'EXPIRING_SOON'
) {
  realtimeHub.broadcast(
    tenantId,
    'INVENTORY_ALERT',
    'inventoryItem',
    itemId,
    {
      itemName,
      currentQty,
      minLevel,
      alertType,
      message: `${itemName} is ${alertType === 'OUT_OF_STOCK' ? 'out of stock' : alertType === 'LOW_STOCK' ? 'below minimum level' : 'expiring soon'}`,
      timestamp: new Date().toISOString(),
    }
  );
}
