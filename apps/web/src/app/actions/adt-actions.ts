'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisi/realtime';
import { getResolvedTenantId } from '@/lib/tenant';

// ---------------------------------------------------------------------------
// ADT^A01: ADMIT PATIENT
// ---------------------------------------------------------------------------

export async function admitPatient(data: {
    encounterId: string;
    bedId: string;
    attendingPhysicianId?: string;
    admissionReason?: string;
}) {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN', 'ADMISSIONS']);
    const db = await getTenantDb();

    // 1. Verify destination bed belongs to an active ward and is available
    const bed = await db.bed.findUnique({ where: { id: data.bedId } });
    if (!bed) throw new Error('BED_NOT_FOUND');
    if (bed.status !== 'AVAILABLE') throw new Error(`BED_UNAVAILABLE: Bed is currently marked as ${bed.status}`);

    const existingAdmission = await db.admission.findUnique({ where: { encounterId: data.encounterId } });
    if (existingAdmission) throw new Error('MULTIPLE_ADMISSIONS: Encounter is already admitted.');

    const admission = await db.$transaction(async (tx: any) => {
        // Create the active admission record
        const adm = await tx.admission.create({
            data: {
                encounterId: data.encounterId,
                bedId: data.bedId,
                attendingPhysicianId: data.attendingPhysicianId,
                admissionReason: data.admissionReason,
                status: 'ADMITTED',
            }
        });

        // Occupy the bed
        await tx.bed.update({
            where: { id: data.bedId },
            data: { status: 'OCCUPIED' }
        });

        // Transition Encounter to Inpatient if needed? (Depending on proxy logic)
        return adm;
    });

    await logAudit({
        action: 'CREATE', resource: 'Admission', resourceId: admission.id,
        details: { encounterId: data.encounterId, bedId: data.bedId }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'PATIENT_ADMITTED', 'Admission', admission.id);

    revalidatePath('/ward/admissions');
    return admission;
}

// ---------------------------------------------------------------------------
// ADT^A02: TRANSFER PATIENT
// ---------------------------------------------------------------------------

export async function transferPatient(admissionId: string, toBedId: string, transferredByRole: string, reasonForTransfer?: string) {
    await ensureRole(['DOCTOR', 'NURSE_MANAGER', 'ADMIN', 'ADMISSIONS']);
    const db = await getTenantDb();

    const admission = await db.admission.findUnique({ where: { id: admissionId }, include: { bed: true } });
    if (!admission || admission.status !== 'ADMITTED') {
        throw new Error('TRANSFER_FAILED: Patient is not currently admitted.');
    }

    if (admission.bedId === toBedId) {
        throw new Error('TRANSFER_FAILED: Patient is already in the requested bed.');
    }

    const newBed = await db.bed.findUnique({ where: { id: toBedId } });
    if (!newBed || newBed.status !== 'AVAILABLE') {
        throw new Error(`BED_UNAVAILABLE: Destination bed is currently ${newBed?.status}`);
    }

    const transferEvent = await db.$transaction(async (tx: any) => {
        // Log the ledger event
        const evt = await tx.adtTransferEvent.create({
            data: {
                admissionId,
                fromBedId: admission.bedId,
                toBedId,
                reasonForTransfer,
                transferredByRole,
            }
        });

        // Update Admission mapping
        await tx.admission.update({
            where: { id: admissionId },
            data: { bedId: toBedId }
        });

        // State Machine: Based on hospital rules, previous bed instantly reverts to AVAILABLE
        await tx.bed.update({
            where: { id: admission.bedId },
            data: { status: 'AVAILABLE' } 
        });

        // Occupy new bed
        await tx.bed.update({
            where: { id: toBedId },
            data: { status: 'OCCUPIED' }
        });

        return evt;
    });

    await logAudit({
        action: 'UPDATE', resource: 'Admission', resourceId: admissionId,
        details: { transferEventId: transferEvent.id, from: admission.bedId, to: toBedId }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'PATIENT_TRANSFERRED', 'Admission', admissionId);

    revalidatePath('/ward/transfer');
    return transferEvent;
}

// ---------------------------------------------------------------------------
// ADT^A03: DISCHARGE PATIENT
// ---------------------------------------------------------------------------

export async function dischargePatient(admissionId: string) {
    await ensureRole(['DOCTOR', 'ADMIN', 'ADMISSIONS']);
    const db = await getTenantDb();

    const admission = await db.admission.findUnique({ where: { id: admissionId } });
    if (!admission || admission.status !== 'ADMITTED') {
        throw new Error('DISCHARGE_FAILED: Cannot discharge an inactive or non-existent admission.');
    }

    await db.$transaction(async (tx: any) => {
        await tx.admission.update({
            where: { id: admissionId },
            data: {
                status: 'DISCHARGED',
                dischargedAt: new Date()
            }
        });

        // State Machine: Based on hospital rules, previous bed instantly reverts to AVAILABLE
        await tx.bed.update({
            where: { id: admission.bedId },
            data: { status: 'AVAILABLE' } 
        });
    });

    // NOTE: Generating the final clinical bill is assumed to be hooked higher up the chain for the overall Encounter
    // using the proxy bridge. 

    await logAudit({
        action: 'UPDATE', resource: 'Admission', resourceId: admissionId,
        details: { action: 'DISCHARGE' }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'PATIENT_DISCHARGED', 'Admission', admissionId);

    revalidatePath('/ward/admissions');
    return { success: true, admissionId };
}
