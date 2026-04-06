'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisi/realtime';
import { getResolvedTenantId } from '@/lib/tenant';

// ---------------------------------------------------------------------------
// SURGERY REQUEST (CPOE)
// ---------------------------------------------------------------------------

export async function requestSurgery(data: {
    patientId: string;
    encounterId?: string;
    requestedById: string;
    diagnosis: string;
    procedureCode: string;
    priority?: string;
    medicalClearanceUrl?: string;
    requestedDate?: string;
}) {
    await ensureRole(['DOCTOR', 'SURGEON', 'ADMIN']);
    const db = await getTenantDb();

    const request = await db.surgeryRequest.create({
        data: {
            patientId: data.patientId,
            encounterId: data.encounterId,
            requestedById: data.requestedById,
            diagnosis: data.diagnosis,
            procedureCode: data.procedureCode,
            priority: data.priority ?? 'ELECTIVE',
            requestedDate: data.requestedDate ? new Date(data.requestedDate) : new Date(),
            medicalClearanceUrl: data.medicalClearanceUrl,
            status: 'PENDING',
        }
    });

    await logAudit({
        action: 'CREATE', resource: 'SurgeryRequest', resourceId: request.id,
        details: { patientId: data.patientId, procedure: data.procedureCode }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'SURGERY_REQUESTED', 'SurgeryRequest', request.id);

    revalidatePath('/surgery/requests');
    return request;
}

// ---------------------------------------------------------------------------
// OT SCHEDULING (Assigning date, time, room, and team)
// ---------------------------------------------------------------------------

export async function scheduleSurgery(data: {
    requestId: string;
    theatreRoomId: string;
    scheduledStartTime: string;
    scheduledEndTime: string;
    primarySurgeonId: string;
    anesthesiologistId: string;
    scrubNurseId?: string;
    circulatingNurseId?: string;
}) {
    await ensureRole(['SURGEON', 'OT_MANAGER', 'ADMIN']);
    const db = await getTenantDb();

    // Check for scheduling conflicts in the same theatre
    const start = new Date(data.scheduledStartTime);
    const end = new Date(data.scheduledEndTime);

    const conflict = await db.oTSchedule.findFirst({
        where: {
            theatreRoomId: data.theatreRoomId,
            status: { in: ['BOOKED', 'PRE_OP', 'IN_PROGRESS'] },
            OR: [
                { scheduledStartTime: { lte: start }, scheduledEndTime: { gt: start } },
                { scheduledStartTime: { lt: end }, scheduledEndTime: { gte: end } }
            ]
        }
    });

    if (conflict) {
        throw new Error('OT_CONFLICT: The selected theatre is already booked during this time.');
    }

    const schedule = await db.$transaction(async (tx: any) => {
        const sched = await tx.oTSchedule.create({
            data: {
                requestId: data.requestId,
                theatreRoomId: data.theatreRoomId,
                scheduledStartTime: start,
                scheduledEndTime: end,
                primarySurgeonId: data.primarySurgeonId,
                anesthesiologistId: data.anesthesiologistId,
                scrubNurseId: data.scrubNurseId,
                circulatingNurseId: data.circulatingNurseId,
                status: 'BOOKED',
            }
        });

        // Initialize the WHO Pre-Op Checklist explicitly blocked
        await tx.surgeryPreOp.create({
            data: { otScheduleId: sched.id }
        });

        await tx.surgeryRequest.update({
            where: { id: data.requestId },
            data: { status: 'SCHEDULED' }
        });

        return sched;
    });

    await logAudit({
        action: 'CREATE', resource: 'OTSchedule', resourceId: schedule.id,
        details: { theatre: data.theatreRoomId, surgeon: data.primarySurgeonId }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'SURGERY_SCHEDULED', 'OTSchedule', schedule.id);

    revalidatePath('/surgery/schedule');
    return schedule;
}

// ---------------------------------------------------------------------------
// PRE-OP GATE: WHO SURGICAL SAFETY CHECKLIST
// ---------------------------------------------------------------------------

export async function submitPreOpChecklist(otScheduleId: string, nurseId: string, data: {
    consentSigned: boolean;
    fastingConfirmed: boolean;
    surgicalSiteMarked: boolean;
    anesthesiaCleared: boolean;
    bloodReservedUnits?: number;
    crossmatchStatus?: string;
    consentDocumentUrl?: string;
}) {
    await ensureRole(['NURSE', 'ANESTHESIOLOGIST', 'SURGEON', 'ADMIN']);
    const db = await getTenantDb();

    // Master Clearance Rule: WHO minimum
    const clearedForSurgery = data.consentSigned && data.fastingConfirmed && data.surgicalSiteMarked && data.anesthesiaCleared;

    const preOp = await db.surgeryPreOp.update({
        where: { otScheduleId },
        data: {
            ...data,
            clearedForSurgery,
            clearedByNurseId: clearedForSurgery ? nurseId : null,
        }
    });

    if (clearedForSurgery) {
        await db.oTSchedule.update({
            where: { id: otScheduleId },
            data: { status: 'PRE_OP' }
        });
    }

    await logAudit({
        action: 'UPDATE', resource: 'SurgeryPreOp', resourceId: preOp.id,
        details: { clearedForSurgery, by: nurseId }
    });

    return preOp;
}

// ---------------------------------------------------------------------------
// INTRA-OP RECORD (With PharmOS Inventory Integration)
// ---------------------------------------------------------------------------

export async function submitIntraOpRecord(otScheduleId: string, data: {
    timeOutCompleted: boolean;
    incisionTime?: string;
    closureTime?: string;
    anesthesiaLog?: object;
    estimatedBloodLossMl?: number;
    complications?: string;
    surgeonNotes?: string;
    specimensSentToLab?: boolean;
    // PharmOS Hook data:
    drugsUsed?: { inventoryId: string; quantity: number }[];
    implantsUsed?: { serialNumber: string; manufacturer: string }[];
}) {
    await ensureRole(['SURGEON', 'ANESTHESIOLOGIST', 'NURSE', 'ADMIN']);
    const db = await getTenantDb();

    // Verify Pre-Op Gate
    const preOp = await db.surgeryPreOp.findUnique({ where: { otScheduleId } });
    if (!preOp?.clearedForSurgery) {
        throw new Error('PRE_OP_BLOCKED: Patient is not cleared for surgery. Ensure consent and anesthesia checks are complete.');
    }

    const intraOp = await db.$transaction(async (tx: any) => {
        // Native integration: deduct drugs/implants from PharmOS PharmacyInventory
        if (data.drugsUsed && data.drugsUsed.length > 0) {
            for (const item of data.drugsUsed) {
                // Ensure sufficient stock
                const inv = await tx.pharmacyInventory.findUnique({ where: { id: item.inventoryId } });
                if (!inv || inv.quantityAvailable < item.quantity) {
                    throw new Error(`INVENTORY_ERROR: Insufficient stock for inventory ID ${item.inventoryId}`);
                }

                await tx.pharmacyInventory.update({
                    where: { id: item.inventoryId },
                    data: { quantityAvailable: { decrement: item.quantity } }
                });
            }
        }

        const log = await tx.surgeryIntraOp.upsert({
            where: { otScheduleId },
            create: {
                otScheduleId,
                timeOutCompleted: data.timeOutCompleted,
                incisionTime: data.incisionTime ? new Date(data.incisionTime) : undefined,
                closureTime: data.closureTime ? new Date(data.closureTime) : undefined,
                anesthesiaLog: data.anesthesiaLog,
                estimatedBloodLossMl: data.estimatedBloodLossMl,
                complications: data.complications,
                surgeonNotes: data.surgeonNotes,
                specimensSentToLab: data.specimensSentToLab ?? false,
                drugsUsed: data.drugsUsed,
                implantsUsed: data.implantsUsed,
            },
            update: {
                timeOutCompleted: data.timeOutCompleted,
                incisionTime: data.incisionTime ? new Date(data.incisionTime) : undefined,
                closureTime: data.closureTime ? new Date(data.closureTime) : undefined,
                anesthesiaLog: data.anesthesiaLog,
                estimatedBloodLossMl: data.estimatedBloodLossMl,
                complications: data.complications,
                surgeonNotes: data.surgeonNotes,
                specimensSentToLab: data.specimensSentToLab,
                drugsUsed: data.drugsUsed,
                implantsUsed: data.implantsUsed,
            }
        });

        if (data.closureTime) {
            await tx.oTSchedule.update({
                where: { id: otScheduleId },
                data: { status: 'POST_OP' }
            });
        } else {
            await tx.oTSchedule.update({
                where: { id: otScheduleId },
                data: { status: 'IN_PROGRESS' }
            });
        }

        return log;
    });

    await logAudit({
        action: 'UPDATE', resource: 'SurgeryIntraOp', resourceId: intraOp.id,
        details: { closureRecorded: !!data.closureTime, bloodLoss: data.estimatedBloodLossMl }
    });

    // Broadcast emergency if severe blood loss
    const tenantId = await getResolvedTenantId();
    if (tenantId && data.estimatedBloodLossMl && data.estimatedBloodLossMl > 1000) {
        realtimeHub.broadcast(tenantId, 'MASSIVE_TRANSFUSION_ALERT', 'OTSchedule', otScheduleId, {
            bloodLoss: data.estimatedBloodLossMl
        });
    }

    revalidatePath('/surgery/active');
    return intraOp;
}

// ---------------------------------------------------------------------------
// POST-OP (PACU) & ALDRETE DISCHARGE
// ---------------------------------------------------------------------------

export async function logPostOpPACU(otScheduleId: string, data: {
    arrivalAldreteScore?: number;
    dischargeAldreteScore?: number;
    vitalsLog?: object;
    postOpInstructions?: string;
    dischargeDestination?: string;
    dischargedByMD?: string;
    isDischarging?: boolean;
}) {
    await ensureRole(['NURSE', 'ANESTHESIOLOGIST', 'SURGEON', 'ADMIN']);
    const db = await getTenantDb();

    // Enforce safe Aldrete discharge criteria
    if (data.isDischarging) {
        if (!data.dischargeAldreteScore) throw new Error('ALDRETE_REQUIRED: Discharge score required to leave PACU.');
        if (data.dischargeAldreteScore < 9 && !data.dischargedByMD) {
            throw new Error('MD_OVERRIDE_REQUIRED: Aldrete score is < 9. An MD must override to authorize discharge.');
        }
    }

    const postOp = await db.$transaction(async (tx: any) => {
        const rec = await tx.surgeryPostOp.upsert({
            where: { otScheduleId },
            create: {
                otScheduleId,
                arrivalAldreteScore: data.arrivalAldreteScore,
                dischargeAldreteScore: data.dischargeAldreteScore,
                vitalsLog: data.vitalsLog,
                postOpInstructions: data.postOpInstructions,
                dischargeDestination: data.dischargeDestination,
                dischargedByMD: data.dischargedByMD,
                pacuDischargeTime: data.isDischarging ? new Date() : undefined,
            },
            update: {
                arrivalAldreteScore: data.arrivalAldreteScore,
                dischargeAldreteScore: data.dischargeAldreteScore,
                vitalsLog: data.vitalsLog,
                postOpInstructions: data.postOpInstructions,
                dischargeDestination: data.dischargeDestination,
                dischargedByMD: data.dischargedByMD,
                pacuDischargeTime: data.isDischarging ? new Date() : undefined,
            }
        });

        if (data.isDischarging) {
            await tx.oTSchedule.update({
                where: { id: otScheduleId },
                data: { status: 'COMPLETED' }
            });
            
            const sched = await tx.oTSchedule.findUnique({ where: { id: otScheduleId } });
            await tx.surgeryRequest.update({
                where: { id: sched.requestId },
                data: { status: 'COMPLETED' }
            });
        }

        return rec;
    });

    await logAudit({
        action: 'UPDATE', resource: 'SurgeryPostOp', resourceId: postOp.id,
        details: { discharged: data.isDischarging, score: data.dischargeAldreteScore }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId && data.isDischarging && data.dischargeDestination === 'ICU') {
        realtimeHub.broadcast(tenantId, 'ICU_ADMISSION_PENDING', 'OTSchedule', otScheduleId);
    }

    revalidatePath('/surgery/pacu');
    return postOp;
}
