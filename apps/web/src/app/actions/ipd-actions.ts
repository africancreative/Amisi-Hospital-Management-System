'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisi/realtime';
import { getResolvedTenantId, getTenantSyncSecret } from '@/lib/tenant';
import { recordEvent } from '@amisi/sync-engine';

/**
 * Admits a patient to a specific bed.
 * Atomically updates bed status and creates admission record.
 */
export async function admitPatient(encounterId: string, bedId: string) {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    const db = await getTenantDb();
    
    const admission = await db.$transaction(async (tx: any) => {
        // 1. Mark bed as occupied
        await tx.bed.update({
            where: { id: bedId },
            data: { status: 'OCCUPIED' }
        });

        // 2. Create admission record
        const adm = await tx.admission.create({
            data: {
                encounterId,
                bedId,
                admittedAt: new Date(),
            }
        });

        // 3. Update encounter type
        await tx.encounter.update({
            where: { id: encounterId },
            data: { type: 'INPATIENT' }
        });

        return adm;
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) {
        realtimeHub.broadcast(tenantId, 'BED_STATUS_CHANGED', 'Bed', bedId);
    }

    await logAudit({
        action: 'UPDATE',
        resource: 'Encounter',
        resourceId: encounterId,
        details: { action: 'ADMISSION', bedId }
    });

    revalidatePath(`/ipd/wards`);
    return admission;
}

/**
 * Records a medication administration (MAR).
 */
export async function recordMedication(data: {
    encounterId: string;
    medicationName: string;
    dosage: string;
    route: string;
    status: string;
    reasonForSkip?: string;
}) {
    await ensureRole(['NURSE', 'ADMIN']);
    const db = await getTenantDb();
    
    const mar = await db.medicationAdministration.create({
        data: {
            ...data,
            administeredBy: 'SYSTEM_NURSE', // Placeholder
        }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) {
        realtimeHub.broadcast(tenantId, 'MAR_UPDATED', 'Encounter', data.encounterId);
    }

    await logAudit({
        action: 'CREATE',
        resource: 'MedicationAdministration',
        resourceId: mar.id,
        details: { medicationName: data.medicationName, status: data.status }
    });

    revalidatePath(`/patients/encounter/${data.encounterId}`);
    return mar;
}

/**
 * Discharges a patient and frees the bed.
 */
export async function dischargePatient(encounterId: string, dischargeSummary: string) {
    await ensureRole(['DOCTOR', 'ADMIN']);
    const db = await getTenantDb();
    
    const encounter = await db.encounter.findUnique({
        where: { id: encounterId },
        include: { admission: true }
    });

    if (!encounter || !encounter.admission) {
        throw new Error("Patient is not currently admitted.");
    }

    const { bedId } = encounter.admission;

    await db.$transaction(async (tx: any) => {
        // 1. Update encounter with discharge info
        await tx.encounter.update({
            where: { id: encounterId },
            data: {
                dischargeSummary,
                dischargedAt: new Date(),
            }
        });

        // 2. Free the bed (mark as cleaning)
        await tx.bed.update({
            where: { id: bedId },
            data: { status: 'CLEANING' }
        });

        // 3. Close admission
        await tx.admission.update({
            where: { encounterId },
            data: { dischargedAt: new Date() }
        });
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) {
        realtimeHub.broadcast(tenantId, 'PATIENT_DISCHARGED', 'Encounter', encounterId);
        realtimeHub.broadcast(tenantId, 'BED_STATUS_CHANGED', 'Bed', bedId);
    }

    await logAudit({
        action: 'UPDATE',
        resource: 'Encounter',
        resourceId: encounterId,
        details: { action: 'DISCHARGE' }
    });

    revalidatePath(`/ipd/wards`);
}
