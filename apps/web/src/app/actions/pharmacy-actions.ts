'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';

// Inventory Actions
export async function getInventoryItems() {
    const db = await getTenantDb();
    return db.inventoryItem.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function updateInventoryStock(itemId: string, quantityChange: number, description?: string) {
    await ensureRole(['PHARMACIST', 'ADMIN']);
    const db = await getTenantDb();

    const item = await db.inventoryItem.update({
        where: { id: itemId },
        data: {
            quantity: { increment: quantityChange },
            version: { increment: 1 }
        }
    });

    revalidatePath('/inventory');
    return item;
}

// Prescription Actions
export async function createPrescription(patientId: string, encounterId: string | null, orderedBy: string, items: { drugName: string, dosage: string, frequency: string, duration: string, quantity: number }[]) {
    await ensureRole(['DOCTOR', 'ADMIN']);
    const db = await getTenantDb();

    const prescription = await db.prescription.create({
        data: {
            patientId,
            encounterId,
            orderedBy,
            status: 'pending',
            items: {
                create: items.map(item => ({
                    drugName: item.drugName,
                    dosage: item.dosage,
                    frequency: item.frequency,
                    duration: item.duration,
                    quantity: item.quantity
                }))
            }
        }
    });

    revalidatePath(`/patients/${patientId}`);
    revalidatePath('/pharmacy');
    return prescription;
}

export async function getPendingPrescriptions() {
    const db = await getTenantDb();
    return db.prescription.findMany({
        where: { status: 'pending' },
        include: {
            patient: true,
            items: true
        },
        orderBy: { createdAt: 'desc' }
    });
}

// Dispensing Actions
export async function dispensePrescription(prescriptionId: string, dispensedBy: string, itemDispensations: { itemId: string, quantity: number }[]) {
    await ensureRole(['PHARMACIST', 'ADMIN']);
    const db = await getTenantDb();

    // Transactional dispensing
    return db.$transaction(async (tx) => {
        // 1. Create dispensing records
        for (const disp of itemDispensations) {
            await tx.dispensingRecord.create({
                data: {
                    prescriptionId,
                    itemId: disp.itemId,
                    quantityDispensed: disp.quantity,
                    dispensedBy
                }
            });

            // 2. Decrement inventory
            await tx.inventoryItem.update({
                where: { id: disp.itemId },
                data: {
                    quantity: { decrement: disp.quantity },
                    version: { increment: 1 }
                }
            });
        }

        // 3. Mark prescription as dispensed
        const updatedPrescription = await tx.prescription.update({
            where: { id: prescriptionId },
            data: { status: 'dispensed' }
        });

        revalidatePath('/pharmacy');
        revalidatePath('/inventory');
        return updatedPrescription;
    });
}
