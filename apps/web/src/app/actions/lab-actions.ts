'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';

export async function createLabOrder(patientId: string, encounterId: string | null, testName: string, priority: string, orderedBy: string): Promise<any> {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    const db = await getTenantDb();

    const order = await db.labOrder.create({
        data: {
            patientId,
            encounterId,
            testPanelId: testName,
            urgency: priority,
            status: 'pending',
            orderedById: orderedBy,
        }
    });

    revalidatePath(`/patients/${patientId}`);
    revalidatePath('/lab');
    return order;
}

export async function getLabOrderWithResults(orderId: string): Promise<any> {
    const db = await getTenantDb();
    return db.labOrder.findUnique({
        where: { id: orderId },
        include: {
            patient: true,
            results: true,
        }
    });
}

export async function getPendingLabOrders(): Promise<any> {
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

export async function updateLabOrderStatus(orderId: string, status: string): Promise<any> {
    await ensureRole(['LAB_TECH', 'ADMIN']);
    const db = await getTenantDb();
    const order = await db.labOrder.update({
        where: { id: orderId },
        data: { status }
    });

    revalidatePath('/lab');
    return order;
}

export async function recordLabResult(orderId: string, results: { parameter: string, value: string, unit?: string, range?: string, flag?: string }[], technicianName: string): Promise<any> {
    await ensureRole(['LAB_TECH', 'ADMIN']);
    const db = await getTenantDb();

    // Create results
    await db.labResult.createMany({
        data: results.map((r: any) => ({
            labOrderId: orderId,
            biomarkerName: r.parameter,
            valueResult: r.value,
            unit: r.unit,
            referenceText: r.range,
            flag: r.flag || 'NORMAL',
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
