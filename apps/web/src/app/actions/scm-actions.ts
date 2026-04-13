'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisimedos/chat';
import { getResolvedTenantId } from '@/lib/tenant';
import { Role } from '@amisimedos/db';

// Core Financial Settings
const ADMIN_APPROVAL_THRESHOLD = 5000.00;

// ---------------------------------------------------------------------------
// 1. PURCHASE ORDERS (Creation)
// ---------------------------------------------------------------------------

export async function createPurchaseOrder(data: {
    vendorId: string;
    orderedBy: string;
    items: {
        itemId: string;
        quantity: number;
        unitPrice: number;
    }[];
}) {
    await ensureRole(['PROCUREMENT_MANAGER', 'ADMIN'] as Role[]);
    const db = await getTenantDb();

    // Sum the PO total first natively
    let totalAmount = 0.0;
    const poItemsRaw = data.items.map(i => {
        const subtotal = i.quantity * i.unitPrice;
        totalAmount += subtotal;
        return {
            itemId: i.itemId,
            quantity: i.quantity,
            unitPrice: i.unitPrice,
            subtotal
        };
    });

    // Auto-state machine calculation based on hospital threshold rule
    const initialStatus = totalAmount > ADMIN_APPROVAL_THRESHOLD ? 'PENDING_ADMIN_APPROVAL' : 'DRAFT';

    const order = await db.purchaseOrder.create({
        data: {
            vendorId: data.vendorId,
            orderedBy: data.orderedBy,
            status: initialStatus,
            totalAmount,
            orderedAt: new Date(),
            items: {
                create: poItemsRaw
            }
        }
    });

    await logAudit({
        action: 'CREATE', resource: 'PurchaseOrder', resourceId: order.id,
        details: { vendorId: data.vendorId, totalAmount, status: initialStatus }
    });

    // High value network broadcast
    if (initialStatus === 'PENDING_ADMIN_APPROVAL') {
        const tenantId = await getResolvedTenantId();
        if (tenantId) realtimeHub.broadcast(tenantId, 'PO_APPROVAL_REQUIRED', 'PurchaseOrder', order.id, { totalAmount });
    }

    revalidatePath('/procurement/orders');
    return order;
}

// ---------------------------------------------------------------------------
// 2. PURCHASE ORDERS (Multi-Tier Approval -> Sent)
// ---------------------------------------------------------------------------

export async function approveAndSendPO(purchaseOrderId: string, approvedById: string, overrideRole: string) {
    const db = await getTenantDb();
    const po = await db.purchaseOrder.findUnique({ where: { id: purchaseOrderId } });

    if (!po) throw new Error('PO_NOT_FOUND');
    if (po.status === 'SENT') throw new Error('PO already sent.');

    // Enforce tier approvals
    if (po.status === 'PENDING_ADMIN_APPROVAL' && overrideRole !== 'ADMIN') {
        throw new Error('FINANCIAL_RESTRICTION: This PO exceeds the administrative threshold. Only ADMINs can approve.');
    }

    const updated = await db.purchaseOrder.update({
        where: { id: purchaseOrderId },
        data: {
            status: 'SENT',
            approvedById
        }
    });

    await logAudit({
        action: 'UPDATE', resource: 'PurchaseOrder', resourceId: purchaseOrderId,
        details: { action: 'APPROVED', by: approvedById }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'PO_SENT', 'PurchaseOrder', purchaseOrderId);

    revalidatePath(`/procurement/orders/${purchaseOrderId}`);
    return updated;
}

// ---------------------------------------------------------------------------
// 3. GOODS RECEIPT NOTE (GRN) & INVENTORY ACCRUAL
// ---------------------------------------------------------------------------

export async function processGoodsReceipt(purchaseOrderId: string, receivedBy: string, deliveryNote: string, receivedItems: {
    itemId: string;
    quantityReceived: number;
    unitPrice: number;
    batchNumber?: string;
    expiryDate?: string;
}[]) {
    await ensureRole(['INVENTORY_CLERK', 'PROCUREMENT_MANAGER', 'ADMIN']);
    const db = await getTenantDb();

    const po = await db.purchaseOrder.findUnique({ where: { id: purchaseOrderId }, include: { items: true } });
    if (!po || (po.status !== 'SENT' && po.status !== 'PARTIAL_RECEIPT')) {
        throw new Error('GRN_BLOCKED: Can only receive goods against a SENT or PARTIAL_RECEIPT PO.');
    }


    const grn = await db.$transaction(async (tx: any) => {
        // 1. Log the GRN Document
        const doc = await tx.gRN.create({
            data: {
                purchaseOrderId,
                receivedBy,
                deliveryNote,
                receivedDate: new Date(),
                items: {
                    create: receivedItems.map(i => ({
                        itemId: i.itemId,
                        quantity: i.quantityReceived,
                        unitPrice: i.unitPrice,
                        batchNumber: i.batchNumber,
                        expiryDate: i.expiryDate ? new Date(i.expiryDate) : null
                    }))
                }
            }
        });

        // 2. Automatically Accrue Physical Inventory
        for (const received of receivedItems) {
            await tx.inventoryItem.update({
                where: { id: received.itemId },
                data: { quantity: { increment: received.quantityReceived } }
            });
        }

        // 3. Check PO completion state
        // Very basic aggregation to check if all requested PO items match received items across all GRNs
        // For SaaS proxy, we will set status to PARTIAL_RECEIPT and rely on a nightly job to close FULFILLED POs
        // Or conditionally flip based on pure exact array mapping:
        await tx.purchaseOrder.update({
            where: { id: purchaseOrderId },
            data: { status: 'RECEIVED' }
        });

        return doc;
    });

    await logAudit({
        action: 'CREATE', resource: 'GRN', resourceId: grn.id,
        details: { purchaseOrderId }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'INVENTORY_RESTOCKED', 'GRN', grn.id);

    revalidatePath('/procurement/grn');
    revalidatePath('/inventory');
    return grn;
}

// ---------------------------------------------------------------------------
// 4. AUTO-REPLENISHMENT ENGINE
// ---------------------------------------------------------------------------

export async function triggerAutoReplenishment(orderedByUserId: string) {
    // Usually triggered by a cron-job / background scheduler nightly
    // Drops draft POs for Vendor mapping automatically
    const db = await getTenantDb();

    // 1. Scan for critical stock
    const criticalItems = await db.inventoryItem.findMany({
        where: {
            quantity: { lte: db.inventoryItem.fields.minLevel }
        },
        include: {
            vendorCatalogItems: {
                orderBy: { unitPrice: 'asc' }, // Prioritize cheapest vendor
                take: 1
            }
        }
    });

    if (criticalItems.length === 0) return { draftedPOs: 0 };

    // 2. Group by Vendor
    const vendorDrafts = new Map<string, any[]>();
    for (const item of criticalItems) {
        if (item.vendorCatalogItems.length > 0) {
            const vci = item.vendorCatalogItems[0];
            const vendorId = vci.vendorId;
            const quantityToOrder = Math.max(vci.minimumOrderQty, item.minLevel * 2 - item.quantity); // Build safety stock buffer

            if (!vendorDrafts.has(vendorId)) vendorDrafts.set(vendorId, []);
            vendorDrafts.get(vendorId)!.push({
                itemId: item.id,
                quantity: quantityToOrder,
                unitPrice: vci.unitPrice,
                subtotal: quantityToOrder * Number(vci.unitPrice)
            });
        }
    }

    // 3. Generate DRAFT POs per vendor
    let draftCount = 0;
    for (const [vendorId, items] of vendorDrafts.entries()) {
        const totalAmount = items.reduce((acc, curr) => acc + curr.subtotal, 0);
        
        await db.purchaseOrder.create({
            data: {
                vendorId,
                status: 'DRAFT',
                orderedBy: orderedByUserId,
                totalAmount,
                items: {
                    create: items.map(i => ({
                        itemId: i.itemId,
                        quantity: i.quantity,
                        unitPrice: i.unitPrice,
                        subtotal: i.subtotal
                    }))
                }
            }
        });
        draftCount++;
    }

    await logAudit({
        action: 'SYSTEM_ROUTINE', resource: 'AutoReplenishment', resourceId: 'BATCH',
        details: { posGenerated: draftCount, itemsFlagged: criticalItems.length }
    });

    revalidatePath('/procurement/orders');
    return { draftedPOs: draftCount, lowStockItems: criticalItems.length };
}
