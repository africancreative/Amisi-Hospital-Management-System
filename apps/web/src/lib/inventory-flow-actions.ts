'use server';

import { getTenantDb } from '@/lib/db';
import { ensureRole, getServerUser } from '@/lib/auth-utils';
import { headers } from 'next/headers';
import { eventBus } from '@/lib/event-system';

async function getCurrentTenantId(): Promise<string> {
  const headerList = await headers();
  let tenantId = headerList.get('x-resolved-tenant-id');

  if (!tenantId && process.env.NODE_ENV === 'development') {
    try {
      const controlDb = (await import('@amisimedos/db/client')).getControlDb();
      const firstTenant = await controlDb.tenant.findFirst();
      if (firstTenant) {
        tenantId = firstTenant.id;
      }
    } catch {
      // Ignore in dev
    }
  }

  if (!tenantId) {
    throw new Error('No tenant context found');
  }

  return tenantId;
}

// ─── Stock Availability Checker ─────────────────────────────────────────

export interface StockCheckResult {
  inventoryItemId: string;
  itemName: string;
  requestedQty: number;
  availableQty: number;
  isAvailable: boolean;
  shortageQty: number;
  allocatedBatches: { batchId: string; batchNumber: string; expiryDate: Date | null; qty: number; costPrice: number }[];
  totalCost: number;
}

export interface StockCheckReport {
  items: StockCheckResult[];
  allAvailable: boolean;
  unavailableItems: string[];
  totalDrugCost: number;
}

/**
 * Check stock availability for prescription items using FEFO (First Expiry First Out).
 * Returns allocated batches and total cost if available.
 */
export async function checkStockForPrescription(items: { drugName: string; quantity: number; inventoryItemId?: string }[]): Promise<StockCheckReport> {
  const db = await getTenantDb();

  const results: StockCheckResult[] = [];
  let allAvailable = true;
  const unavailableItems: string[] = [];
  let totalDrugCost = 0;

  for (const item of items) {
    const inventoryItem = item.inventoryItemId
      ? await db.inventoryItem.findUnique({ where: { id: item.inventoryItemId } })
      : await db.inventoryItem.findFirst({ where: { name: { contains: item.drugName, mode: 'insensitive' } } });

    if (!inventoryItem) {
      results.push({
        inventoryItemId: '',
        itemName: item.drugName,
        requestedQty: item.quantity,
        availableQty: 0,
        isAvailable: false,
        shortageQty: item.quantity,
        allocatedBatches: [],
        totalCost: 0,
      });
      allAvailable = false;
      unavailableItems.push(item.drugName);
      continue;
    }

    const availableQty = inventoryItem.quantity;

    if (availableQty < item.quantity) {
      results.push({
        inventoryItemId: inventoryItem.id,
        itemName: inventoryItem.name,
        requestedQty: item.quantity,
        availableQty,
        isAvailable: false,
        shortageQty: item.quantity - availableQty,
        allocatedBatches: [],
        totalCost: 0,
      });
      allAvailable = false;
      unavailableItems.push(inventoryItem.name);
      continue;
    }

    // FEFO allocation: allocate from batches with earliest expiry first
    const allocatedBatches: StockCheckResult['allocatedBatches'] = [];
    let remaining = item.quantity;
    let itemCost = 0;

    if (inventoryItem.batchEnabled) {
      const batches = await db.inventoryBatch.findMany({
        where: {
          itemId: inventoryItem.id,
          quantity: { gt: 0 },
        },
        orderBy: { expiryDate: 'asc' },
      });

      for (const batch of batches) {
        if (remaining <= 0) break;

        const allocQty = Math.min(batch.quantity, remaining);
        const costPrice = batch.costPrice ? Number(batch.costPrice) : inventoryItem.price * 0.6;

        allocatedBatches.push({
          batchId: batch.id,
          batchNumber: batch.batchNumber,
          expiryDate: batch.expiryDate,
          qty: allocQty,
          costPrice,
        });

        itemCost += allocQty * costPrice;
        remaining -= allocQty;
      }
    } else {
      const costPrice = inventoryItem.price * 0.6;
      allocatedBatches.push({
        batchId: '',
        batchNumber: '',
        expiryDate: inventoryItem.expiryDate,
        qty: item.quantity,
        costPrice,
      });
      itemCost = item.quantity * costPrice;
    }

    totalDrugCost += itemCost;

    results.push({
      inventoryItemId: inventoryItem.id,
      itemName: inventoryItem.name,
      requestedQty: item.quantity,
      availableQty,
      isAvailable: true,
      shortageQty: 0,
      allocatedBatches,
      totalCost: itemCost,
    });
  }

  return { items: results, allAvailable, unavailableItems, totalDrugCost };
}

// ─── Stock Reservation ──────────────────────────────────────────────────

/**
 * Reserve stock for a prescription. This prevents other prescriptions
 * from consuming the same stock until dispensing or cancellation.
 */
export async function reservePrescriptionStock(prescriptionId: string): Promise<{ success: boolean; message: string; reservationId?: string }> {
  const db = await getTenantDb();

  const prescription = await db.prescription.findUnique({
    where: { id: prescriptionId },
    include: { items: true, patient: { select: { firstName: true, lastName: true } } },
  });

  if (!prescription) {
    return { success: false, message: 'Prescription not found' };
  }

  if (prescription.status !== 'pending') {
    return { success: false, message: `Prescription is ${prescription.status}, cannot reserve stock` };
  }

  // Check and reserve each item
  const reservedBatches: { prescriptionItemId: string; inventoryItemId: string; batchId: string; quantity: number }[] = [];

  for (const pItem of prescription.items) {
    const inventoryItem = pItem.inventoryItemId
      ? await db.inventoryItem.findUnique({ where: { id: pItem.inventoryItemId } })
      : await db.inventoryItem.findFirst({ where: { name: { contains: pItem.drugName, mode: 'insensitive' } } });

    if (!inventoryItem) {
      return { success: false, message: `Drug "${pItem.drugName}" not found in inventory` };
    }

    if (inventoryItem.quantity < pItem.quantity) {
      return { success: false, message: `Insufficient stock for "${inventoryItem.name}": ${inventoryItem.quantity} available, ${pItem.quantity} required` };
    }

    // FEFO allocation
    let remaining = pItem.quantity;

    if (inventoryItem.batchEnabled) {
      const batches = await db.inventoryBatch.findMany({
        where: { itemId: inventoryItem.id, quantity: { gt: 0 } },
        orderBy: { expiryDate: 'asc' },
      });

      for (const batch of batches) {
        if (remaining <= 0) break;
        const allocQty = Math.min(batch.quantity, remaining);

        await db.inventoryBatch.update({
          where: { id: batch.id },
          data: { quantity: { decrement: allocQty } },
        });

        reservedBatches.push({
          prescriptionItemId: pItem.id,
          inventoryItemId: inventoryItem.id,
          batchId: batch.id,
          quantity: allocQty,
        });

        remaining -= allocQty;
      }
    } else {
      reservedBatches.push({
        prescriptionItemId: pItem.id,
        inventoryItemId: inventoryItem.id,
        batchId: '',
        quantity: pItem.quantity,
      });
    }

    // Decrement main inventory
    await db.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { quantity: { decrement: pItem.quantity } },
    });

    // Check for low stock alert
    await checkAndCreateStockAlert(db, inventoryItem.id);

    // Update prescription item with stock info
    await db.prescriptionItem.update({
      where: { id: pItem.id },
      data: {
        inventoryItemId: inventoryItem.id,
        stockCheckedAt: new Date(),
        stockAvailable: true,
        reservedBatchId: reservedBatches.find((r: any) => r.prescriptionItemId === pItem.id)?.batchId,
      },
    });
  }

  return { success: true, message: 'Stock reserved successfully' };
}

/**
 * Release reserved stock (when prescription is cancelled or modified).
 */
export async function releasePrescriptionStock(prescriptionId: string): Promise<{ success: boolean; message: string }> {
  const db = await getTenantDb();

  const prescription = await db.prescription.findUnique({
    where: { id: prescriptionId },
    include: { items: { include: { inventoryItem: true } } },
  });

  if (!prescription) {
    return { success: false, message: 'Prescription not found' };
  }

  for (const pItem of prescription.items) {
    if (!pItem.inventoryItemId) continue;

    // Restore inventory
    await db.inventoryItem.update({
      where: { id: pItem.inventoryItemId },
      data: { quantity: { increment: pItem.quantity } },
    });

    // Restore batch if reserved
    if (pItem.reservedBatchId) {
      await db.inventoryBatch.update({
        where: { id: pItem.reservedBatchId },
        data: { quantity: { increment: pItem.quantity } },
      });
    }
  }

  return { success: true, message: 'Stock released successfully' };
}

// ─── Stock Alert System ─────────────────────────────────────────────────

/**
 * Check stock levels and create alerts if below thresholds.
 */
export async function checkAndCreateStockAlert(db: any, itemId: string): Promise<any> {
  const item = await db.inventoryItem.findUnique({
    where: { id: itemId },
  });

  if (!item) return;

  const currentQty = item.quantity;

  // Out of stock
  if (currentQty <= 0) {
    const existing = await db.stockAlert.findFirst({
      where: { itemId, alertType: 'OUT_OF_STOCK', isResolved: false },
    });

    if (!existing) {
      await db.stockAlert.create({
        data: {
          itemId,
          alertType: 'OUT_OF_STOCK',
          message: `${item.name} is OUT OF STOCK. Reorder ${item.reorderQty} ${item.unit}(s) immediately.`,
        },
      });
    }
    return;
  }

  // Low stock (below minLevel)
  if (currentQty <= item.minLevel) {
    const existing = await db.stockAlert.findFirst({
      where: { itemId, alertType: 'LOW_STOCK', isResolved: false },
    });

    if (!existing) {
      await db.stockAlert.create({
        data: {
          itemId,
          alertType: 'LOW_STOCK',
          message: `${item.name} is below minimum level (${currentQty} remaining, min: ${item.minLevel}).`,
        },
      });
    }
  } else if (currentQty <= item.reorderLevel) {
    const existing = await db.stockAlert.findFirst({
      where: { itemId, alertType: 'REORDER_NEEDED', isResolved: false },
    });

    if (!existing) {
      await db.stockAlert.create({
        data: {
          itemId,
          alertType: 'REORDER_NEEDED',
          message: `${item.name} is below reorder level (${currentQty} remaining, reorder at: ${item.reorderLevel}). Suggested order: ${item.reorderQty} ${item.unit}(s).`,
        },
      });
    }
  } else {
    // Above thresholds, resolve any existing alerts
    await db.stockAlert.updateMany({
      where: { itemId, alertType: { in: ['LOW_STOCK', 'OUT_OF_STOCK', 'REORDER_NEEDED'] }, isResolved: false },
      data: { isResolved: true, resolvedAt: new Date() },
    });
  }
}

export async function getActiveStockAlerts(): Promise<any> {
  const db = await getTenantDb();

  return db.stockAlert.findMany({
    where: { isResolved: false },
    include: { item: { select: { id: true, name: true, category: true, quantity: true, minLevel: true, reorderLevel: true } } },
    orderBy: [
      { createdAt: 'desc' },
    ],
  });
}

export async function resolveStockAlert(alertId: string): Promise<any> {
  await ensureRole(['PHARMACIST', 'ADMIN']);
  const db = await getTenantDb();

  return db.stockAlert.update({
    where: { id: alertId },
    data: { isResolved: true, resolvedAt: new Date() },
  });
}

// ─── Expiry Monitoring ──────────────────────────────────────────────────

export async function getExpiringBatches(daysAhead = 30): Promise<any> {
  const db = await getTenantDb();
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() + daysAhead);

  return db.inventoryBatch.findMany({
    where: {
      expiryDate: { lte: cutoff, gte: new Date() },
      quantity: { gt: 0 },
    },
    include: { inventoryItem: { select: { id: true, name: true, category: true } } },
    orderBy: { expiryDate: 'asc' },
  });
}

export async function getExpiredBatches(): Promise<any> {
  const db = await getTenantDb();

  return db.inventoryBatch.findMany({
    where: {
      expiryDate: { lt: new Date() },
      quantity: { gt: 0 },
    },
    include: { inventoryItem: { select: { id: true, name: true, category: true } } },
    orderBy: { expiryDate: 'asc' },
  });
}

// ─── Drug Usage Tracking ────────────────────────────────────────────────

export interface DrugUsageEntry {
  drugName: string;
  itemId: string;
  totalDispensed: number;
  totalPatients: number;
  prescriptions: { patientName: string; quantity: number; date: Date }[];
}

export async function getDrugUsageByPatient(patientId: string): Promise<any> {
  const db = await getTenantDb();

  const dispensingRecords = await db.dispensingRecord.findMany({
    where: { prescription: { patientId } },
    include: {
      inventoryItem: { select: { id: true, name: true, category: true } },
      prescription: { select: { id: true, createdAt: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return dispensingRecords.map((record: any) => ({
    drugName: record.inventoryItem.name,
    itemId: record.inventoryItem.id,
    quantity: record.quantityDispensed,
    dispensedAt: record.createdAt,
    prescriptionId: record.prescriptionId,
  }));
}

export async function getDrugUsageReport(period: 'daily' | 'weekly' | 'monthly' = 'daily'): Promise<any> {
  const db = await getTenantDb();

  const now = new Date();
  let periodStart: Date;

  switch (period) {
    case 'daily':
      periodStart = new Date(now);
      periodStart.setHours(0, 0, 0, 0);
      break;
    case 'weekly':
      periodStart = new Date(now);
      periodStart.setDate(periodStart.getDate() - 7);
      break;
    case 'monthly':
      periodStart = new Date(now);
      periodStart.setMonth(periodStart.getMonth() - 1);
      break;
  }

  const dispensingRecords = await db.dispensingRecord.findMany({
    where: { createdAt: { gte: periodStart } },
    include: { inventoryItem: { select: { id: true, name: true } } },
  });

  const usageMap = new Map<string, { name: string; total: number; patients: Set<string>; entries: { patientName: string; qty: number; date: Date }[] }>();

  for (const record of dispensingRecords) {
    const itemId = record.inventoryItem.id;
    if (!usageMap.has(itemId)) {
      usageMap.set(itemId, { name: record.inventoryItem.name, total: 0, patients: new Set(), entries: [] });
    }

    const data = usageMap.get(itemId)!;
    data.total += record.quantityDispensed;

    if (record.prescriptionId) {
      const prescription = await db.prescription.findUnique({
        where: { id: record.prescriptionId },
        include: { patient: { select: { id: true, firstName: true, lastName: true } } },
      });

      if (prescription) {
        const patientName = `${prescription.patient.firstName} ${prescription.patient.lastName}`;
        data.patients.add(prescription.patient.id);
        data.entries.push({ patientName, qty: record.quantityDispensed, date: record.createdAt });
      }
    }
  }

  return Array.from(usageMap.entries()).map(([itemId, data]) => ({
    drugName: data.name,
    itemId,
    totalDispensed: data.total,
    totalPatients: data.patients.size,
    prescriptions: data.entries,
  }));
}

// ─── Dispense with Full Inventory Integration ───────────────────────────

export interface DispenseWithInventoryResult {
  success: boolean;
  message: string;
  prescriptionId: string;
  totalCOGS: number;
  dispensingRecords: { itemId: string; itemName: string; quantity: number; batchNumber?: string }[];
  alerts: string[];
}

export async function dispenseWithInventoryTracking(
  prescriptionId: string,
  dispensedBy: string
): Promise<DispenseWithInventoryResult> {
  const db = await getTenantDb();
  const tenantId = await getCurrentTenantId();
  const alerts: string[] = [];

  const prescription = await db.prescription.findUnique({
    where: { id: prescriptionId },
    include: { items: { include: { inventoryItem: true } }, patient: { select: { id: true, firstName: true, lastName: true } } },
  });

  if (!prescription) {
    return { success: false, message: 'Prescription not found', prescriptionId, totalCOGS: 0, dispensingRecords: [], alerts };
  }

  if (prescription.status === 'dispensed') {
    return { success: false, message: 'Prescription already dispensed', prescriptionId, totalCOGS: 0, dispensingRecords: [], alerts };
  }

  let totalCOGS = 0;
  const dispensingRecords: DispenseWithInventoryResult['dispensingRecords'] = [];
  const stockUpdates: { itemId: string; itemName: string; previousQty: number; newQty: number; changeQty: number; batchAllocations?: { batchId: string; batchNumber: string; qty: number }[] }[] = [];

  for (const pItem of prescription.items) {
    const inventoryItem = pItem.inventoryItem;

    if (!inventoryItem) {
      return { success: false, message: `Drug "${pItem.drugName}" not linked to inventory`, prescriptionId, totalCOGS: 0, dispensingRecords: [], alerts };
    }

    // Check stock availability
    if (inventoryItem.quantity < pItem.quantity) {
      return {
        success: false,
        message: `Insufficient stock for "${inventoryItem.name}": ${inventoryItem.quantity} available, ${pItem.quantity} required`,
        prescriptionId,
        totalCOGS: 0,
        dispensingRecords: [],
        alerts,
      };
    }

    const previousQty = inventoryItem.quantity;
    const batchAllocations: { batchId: string; batchNumber: string; qty: number }[] = [];

    // Determine COGS using batch cost price (FEFO)
    let itemCOGS = 0;

    if (inventoryItem.batchEnabled && pItem.reservedBatchId) {
      const batch = await db.inventoryBatch.findUnique({ where: { id: pItem.reservedBatchId } });
      if (batch) {
        const costPrice = batch.costPrice ? Number(batch.costPrice) : inventoryItem.price * 0.6;
        itemCOGS = pItem.quantity * costPrice;

        // Decrement batch
        await db.inventoryBatch.update({
          where: { id: batch.id },
          data: { quantity: { decrement: pItem.quantity } },
        });

        batchAllocations.push({ batchId: batch.id, batchNumber: batch.batchNumber, qty: pItem.quantity });
      }
    } else if (inventoryItem.batchEnabled) {
      // FEFO: use earliest expiring batch
      const batch = await db.inventoryBatch.findFirst({
        where: { itemId: inventoryItem.id, quantity: { gt: 0 } },
        orderBy: { expiryDate: 'asc' },
      });

      if (batch) {
        const costPrice = batch.costPrice ? Number(batch.costPrice) : inventoryItem.price * 0.6;
        itemCOGS = pItem.quantity * costPrice;

        await db.inventoryBatch.update({
          where: { id: batch.id },
          data: { quantity: { decrement: pItem.quantity } },
        });

        batchAllocations.push({ batchId: batch.id, batchNumber: batch.batchNumber, qty: pItem.quantity });

        dispensingRecords.push({
          itemId: inventoryItem.id,
          itemName: inventoryItem.name,
          quantity: pItem.quantity,
          batchNumber: batch.batchNumber,
        });
      }
    } else {
      const costPrice = inventoryItem.price * 0.6;
      itemCOGS = pItem.quantity * costPrice;
    }

    totalCOGS += itemCOGS;

    // Decrement main inventory
    const newQty = previousQty - pItem.quantity;
    await db.inventoryItem.update({
      where: { id: inventoryItem.id },
      data: { quantity: { decrement: pItem.quantity } },
    });

    stockUpdates.push({
      itemId: inventoryItem.id,
      itemName: inventoryItem.name,
      previousQty,
      newQty,
      changeQty: -pItem.quantity,
      batchAllocations: batchAllocations.length > 0 ? batchAllocations : undefined,
    });

    // Create dispensing record
    await db.dispensingRecord.create({
      data: {
        prescriptionId,
        itemId: inventoryItem.id,
        quantityDispensed: pItem.quantity,
        dispensedBy,
      },
    });

    // Check for stock alerts
    await checkAndCreateStockAlert(db, inventoryItem.id);

    if (!dispensingRecords.find((r: any) => r.itemId === inventoryItem.id)) {
      dispensingRecords.push({
        itemId: inventoryItem.id,
        itemName: inventoryItem.name,
        quantity: pItem.quantity,
      });
    }
  }

  // Update prescription status
  await db.prescription.update({
    where: { id: prescriptionId },
    data: { status: 'dispensed', isPaid: true },
  });

  // Publish real-time stock events via EventBus
  const patientName = `${prescription.patient.firstName} ${prescription.patient.lastName}`;
  for (const update of stockUpdates) {
    await eventBus.publishStockDispensed({
      tenantId,
      id: `stock-dispensed-${Date.now()}-${update.itemId}`,
      actorId: dispensedBy,
      actorName: dispensedBy,
      payload: {
        itemId: update.itemId,
        itemName: update.itemName,
        quantity: update.changeQty * -1,
        previousQty: update.previousQty,
        newQty: update.newQty,
        prescriptionId,
        patientId: prescription.patient.id,
        patientName,
        dispensedBy,
        batchAllocations: update.batchAllocations,
      },
    });

    // Publish alert if stock is low or out
    if (update.newQty <= 0) {
      await eventBus.publishLowStockAlert({
        tenantId,
        id: `out-of-stock-${Date.now()}-${update.itemId}`,
        actorId: dispensedBy,
        actorName: dispensedBy,
        payload: {
          itemId: update.itemId,
          itemName: update.itemName,
          currentQty: update.newQty,
          minLevel: 0,
          reorderLevel: 0,
          suggestedOrderQty: Math.abs(update.changeQty) * 2,
        },
      });
    } else {
      const item = await db.inventoryItem.findUnique({ where: { id: update.itemId }, select: { minLevel: true, reorderQty: true } });
      if (item && update.newQty <= item.minLevel) {
        await eventBus.publishLowStockAlert({
          tenantId,
          id: `low-stock-${Date.now()}-${update.itemId}`,
          actorId: dispensedBy,
          actorName: dispensedBy,
          payload: {
            itemId: update.itemId,
            itemName: update.itemName,
            currentQty: update.newQty,
            minLevel: item.minLevel,
            reorderLevel: item.minLevel,
            suggestedOrderQty: item.reorderQty,
          },
        });
      }
    }
  }

  return {
    success: true,
    message: `Dispensed ${prescription.items.length} item(s) to ${prescription.patient.firstName} ${prescription.patient.lastName}`,
    prescriptionId,
    totalCOGS,
    dispensingRecords,
    alerts,
  };
}

// ─── Inventory Summary ──────────────────────────────────────────────────

export interface InventorySummary {
  totalItems: number;
  lowStockCount: number;
  outOfStockCount: number;
  totalValue: number;
  activeAlertCount: number;
  lowStockItems: Array<{ id: string; name: string; quantity: number; minLevel: number; unit: string }>;
  outOfStockItems: Array<{ id: string; name: string; quantity: number; reorderQty: number; unit: string }>;
}

export async function getInventorySummary(): Promise<InventorySummary> {
  const db = await getTenantDb();

  const items = await db.inventoryItem.findMany({
    where: { category: 'Drug' },
    include: { batches: { where: { quantity: { gt: 0 } } } },
  });

  const totalItems = items.length;
  const lowStockItems = items.filter((i: any) => i.quantity > 0 && i.quantity <= i.minLevel);
  const outOfStockItems = items.filter((i: any) => i.quantity <= 0);
  const totalValue = items.reduce((sum: any, i: any) => sum + i.quantity * i.price, 0);

  const activeAlerts = await db.stockAlert.count({
    where: { isResolved: false },
  });

  return {
    totalItems,
    lowStockCount: lowStockItems.length,
    outOfStockCount: outOfStockItems.length,
    totalValue,
    activeAlertCount: activeAlerts,
    lowStockItems: lowStockItems.map((i: any) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      minLevel: i.minLevel,
      unit: i.unit,
    })),
    outOfStockItems: outOfStockItems.map((i: any) => ({
      id: i.id,
      name: i.name,
      quantity: i.quantity,
      reorderQty: i.reorderQty,
      unit: i.unit,
    })),
  };
}

// ─── Batch Availability ─────────────────────────────────────────────────

export interface InventoryBatchInfo {
  id: string;
  batchNumber: string;
  quantity: number;
  costPrice: number;
  expiryDate: Date | null;
  isExpired: boolean;
  daysUntilExpiry: number | null;
}

export async function getAvailableBatches(inventoryItemId: string): Promise<InventoryBatchInfo[]> {
  const db = await getTenantDb();
  const now = new Date();

  const batches = await db.inventoryBatch.findMany({
    where: {
      itemId: inventoryItemId,
      quantity: { gt: 0 },
    },
    orderBy: [{ expiryDate: 'asc' }],
  });

  return batches.map((batch: any) => {
    const daysUntilExpiry = batch.expiryDate
      ? Math.floor((batch.expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
      : null;
    return {
      id: batch.id,
      batchNumber: batch.batchNumber,
      quantity: batch.quantity,
      costPrice: Number(batch.costPrice ?? 0),
      expiryDate: batch.expiryDate,
      isExpired: batch.expiryDate ? batch.expiryDate < now : false,
      daysUntilExpiry,
    };
  });
}
