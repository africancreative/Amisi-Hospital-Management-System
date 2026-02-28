'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function createLabOrder(patientId: string, encounterId: string | null, testName: string, priority: string, orderedBy: string) {
    const db = await getTenantDb();

    const order = await db.labOrder.create({
        data: {
            patientId,
            encounterId,
            testName,
            priority,
            status: 'pending',
            orderedBy,
        }
    });

    revalidatePath(`/patients/${patientId}`);
    revalidatePath('/lab');
    return order;
}

export async function getLabOrderWithResults(orderId: string) {
    const db = await getTenantDb();
    return db.labOrder.findUnique({
        where: { id: orderId },
        include: {
            patient: true,
            results: true,
        }
    });
}

export async function getPendingLabOrders() {
    const db = await getTenantDb();
    return db.labOrder.findMany({
        where: {
            status: { in: ['pending', 'collected', 'in_progress'] }
        },
        include: {
            patient: true,
            results: true,
        },
        orderBy: { createdAt: 'desc' }
    });
}

export async function updateLabOrderStatus(orderId: string, status: string) {
    const db = await getTenantDb();
    const order = await db.labOrder.update({
        where: { id: orderId },
        data: { status }
    });

    revalidatePath('/lab');
    return order;
}

export async function recordLabResult(orderId: string, results: { parameter: string, value: string, unit?: string, range?: string, flag?: string }[], technicianName: string) {
    const db = await getTenantDb();

    // Create results
    await db.labResult.createMany({
        data: results.map(r => ({
            labOrderId: orderId,
            parameter: r.parameter,
            value: r.value,
            unit: r.unit,
            referenceRange: r.range,
            flag: r.flag,
            performedBy: technicianName,
        }))
    });

    // Mark order as completed
    const order = await db.labOrder.update({
        where: { id: orderId },
        data: { status: 'completed' }
    });

    revalidatePath(`/patients/${order.patientId}`);
    revalidatePath('/lab');
    return order;
}
