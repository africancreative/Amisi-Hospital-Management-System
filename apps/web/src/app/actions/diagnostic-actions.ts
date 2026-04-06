'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisi/realtime';
import { getResolvedTenantId, getTenantSyncSecret } from '@/lib/tenant';
import { recordEvent } from '@amisi/sync-engine';

export async function orderDiagnostic(formData: FormData) {
    await ensureRole(['DOCTOR', 'ADMIN']);
    const patientId = formData.get('patientId') as string;
    const encounterId = formData.get('encounterId') as string || undefined;
    const testName = formData.get('testName') as string;
    const category = formData.get('category') as string || 'LAB'; // 'LAB' or 'RADIOLOGY'
    const priority = formData.get('priority') as string || 'routine';

    const db = await getTenantDb();
    const order = await db.diagnosticOrder.create({
        data: {
            patientId,
            encounterId,
            testName,
            category,
            priority,
            status: 'pending',
            orderedBy: 'SYSTEM_DOCTOR', // Placeholder for actual session user
        }
    });

    await logAudit({
        action: 'CREATE',
        resource: 'DiagnosticOrder',
        resourceId: order.id,
        details: { testName, category, priority }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) {
        realtimeHub.broadcast(tenantId, 'DIAGNOSTIC_ORDERED', 'Patient', patientId);
        
        const secret = await getTenantSyncSecret(tenantId);
        if (secret) {
            await recordEvent(db, 'DiagnosticOrder', order.id, 'CREATE', order, secret, 'OUTGOING');
        }
    }

    revalidatePath(`/patients/${patientId}`);
    return order;
}

export async function collectSpecimen(orderId: string, specimenId: string) {
    await ensureRole(['NURSE', 'LAB_TECH', 'ADMIN']);
    const db = await getTenantDb();
    
    const order = await db.diagnosticOrder.update({
        where: { id: orderId },
        data: {
            status: 'collected',
            specimenId,
            collectionTime: new Date(),
        }
    });

    await logAudit({
        action: 'UPDATE',
        resource: 'DiagnosticOrder',
        resourceId: orderId,
        details: { status: 'collected', specimenId }
    });

    revalidatePath(`/patients/${order.patientId}`);
    return order;
}

export async function validateDiagnostic(orderId: string) {
    await ensureRole(['DOCTOR', 'ADMIN']); // Usually a Pathologist or Radiologist
    const db = await getTenantDb();
    
    const order = await db.diagnosticOrder.update({
        where: { id: orderId },
        data: {
            status: 'validated',
            validatedAt: new Date(),
            validatedBy: 'SYSTEM_SPECIALIST',
        },
        include: { results: true }
    });

    // Handle Critical Result Real-time Alarm
    const isCritical = order.isCritical || order.results.some(r => r.flag === 'Critical');
    if (isCritical) {
        const tenantId = await getResolvedTenantId();
        if (tenantId) {
            realtimeHub.broadcast(tenantId, 'CRITICAL_RESULT_ALARM', 'Patient', order.patientId);
        }
    }

    await logAudit({
        action: 'UPDATE',
        resource: 'DiagnosticOrder',
        resourceId: orderId,
        details: { action: 'VALIDATED', isCritical }
    });

    revalidatePath(`/patients/${order.patientId}`);
    return order;
}
