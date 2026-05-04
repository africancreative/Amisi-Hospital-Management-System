'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisimedos/chat';
import { getResolvedTenantId, getTenantSyncSecret } from '@/lib/tenant';
import { recordEvent } from '@amisimedos/sync';
import { postInventoryJournalEntry } from './accounting-bridge';

// ---------------------------------------------------------------------------
// INVENTORY ACTIONS
// ---------------------------------------------------------------------------

export async function getInventoryItems(category?: string): Promise<any> {
    const db = await getTenantDb();
    return db.inventoryItem.findMany({
        where: category ? { category } : undefined,
        orderBy: { name: 'asc' }
    });
}

export async function updateInventoryStock(itemId: string, quantityChange: number): Promise<any> {
    await ensureRole(['PHARMACIST', 'ADMIN']);
    const db = await getTenantDb();

    const item = await db.inventoryItem.update({
        where: { id: itemId },
        data: { quantity: { increment: quantityChange } }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) {
        realtimeHub.broadcast(tenantId, 'INVENTORY_ALERT', 'InventoryItem', item.id);
        const secret = await getTenantSyncSecret(tenantId);
        if (secret) await recordEvent(db, 'InventoryItem', item.id, 'UPDATE', item, secret, 'OUTGOING');
    }

    revalidatePath('/inventory');
    return item;
}

// ---------------------------------------------------------------------------
// PRESCRIPTION ACTIONS
// ---------------------------------------------------------------------------

export async function createPrescription(
    patientId: string,
    encounterId: string | null,
    orderedBy: string,
    items: { drugName: string; dosage: string; frequency: string; duration: string; quantity: number }[]
): Promise<any> {
    await ensureRole(['DOCTOR', 'ADMIN']);
    const db = await getTenantDb();

    // Joint Commission Safety: Check patient allergies before prescribing
    const allergies = await db.allergy.findMany({ where: { patientId } });
    const allergySubstances = allergies.map((a: any) => a.substance.toLowerCase());

    const conflicts = items.filter((i: any) =>
        allergySubstances.some((a: any) => i.drugName.toLowerCase().includes(a))
    );

    if (conflicts.length > 0) {
        const names = conflicts.map((c: any) => c.drugName).join(', ');
        throw new Error(`ALLERGY_CONFLICT: Patient has known allergy to: ${names}. Override requires attending physician approval.`);
    }

    const prescription = await db.prescription.create({
        data: {
            patientId, encounterId, orderedBy,
            status: 'pending',
            items: { create: items }
        }
    });

    await logAudit({ action: 'CREATE', resource: 'Prescription', resourceId: prescription.id, details: { patientId, orderedBy } });
    revalidatePath(`/patients/${patientId}`);
    revalidatePath('/pharmacy');
    return prescription;
}

export async function getPendingPrescriptions(): Promise<any> {
    const db = await getTenantDb();
    return db.prescription.findMany({
        where: { status: 'pending' },
        include: { patient: { include: { allergies: true } }, items: true },
        orderBy: { createdAt: 'desc' }
    });
}

// ---------------------------------------------------------------------------
// DISPENSING — BATCH-AWARE WITH COGS JOURNAL ENTRY
// ---------------------------------------------------------------------------

export async function dispensePrescription(
    prescriptionId: string,
    dispensedBy: string,
    itemDispensations: { itemId: string; quantity: number; batchId?: string }[]
): Promise<any> {
    await ensureRole(['PHARMACIST', 'ADMIN']);
    const db = await getTenantDb();

    const updatedPrescription = await db.$transaction(async (tx: any) => {
        let totalCOGS = 0;

        for (const disp of itemDispensations) {
            // 1. Create dispensing record
            await tx.dispensingRecord.create({
                data: {
                    prescriptionId,
                    itemId: disp.itemId,
                    quantityDispensed: disp.quantity,
                    dispensedBy
                }
            });

            // 2. Decrement main inventory
            const item = await tx.inventoryItem.update({
                where: { id: disp.itemId },
                data: { quantity: { decrement: disp.quantity } }
            });
            totalCOGS += Number(item.price) * disp.quantity;

            // 3. If batch-controlled, decrement the specific batch
            if (disp.batchId) {
                await tx.inventoryBatch.update({
                    where: { id: disp.batchId },
                    data: { quantity: { decrement: disp.quantity } }
                });
            }
        }

        const updated = await tx.prescription.update({
            where: { id: prescriptionId },
            data: { status: 'dispensed' }
        });

        return { prescription: updated, totalCOGS };
    });

    // 4. Post COGS double-entry (IAS 2 / ASC 330)
    if (updatedPrescription.totalCOGS > 0) {
        await postInventoryJournalEntry({
            type: 'PHARMACY_DISPENSE',
            sourceId: prescriptionId,
            amount: updatedPrescription.totalCOGS,
            description: `COGS: Prescription ${prescriptionId}`,
            fiscalPeriod: new Date().toISOString().slice(0, 7)
        });
    }

    await logAudit({
        action: 'UPDATE', resource: 'Prescription', resourceId: prescriptionId,
        details: { action: 'DISPENSED', dispensedBy, totalCOGS: updatedPrescription.totalCOGS }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) {
        realtimeHub.broadcast(tenantId, 'MEDICATION_DISPENSED', 'Prescription', prescriptionId);
        const secret = await getTenantSyncSecret(tenantId);
        if (secret) {
            await recordEvent(
                db, 'Prescription', prescriptionId, 'UPDATE',
                updatedPrescription.prescription, secret, 'OUTGOING'
            );
        }
    }

    revalidatePath('/pharmacy');
    revalidatePath('/inventory');
    return updatedPrescription.prescription;
}
