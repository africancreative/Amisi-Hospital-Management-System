'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisimedos/chat';
import { getResolvedTenantId } from '@/lib/tenant';

// ---------------------------------------------------------------------------
// CREATE TREATMENT PLAN (Assign Protocol to Patient)
// ---------------------------------------------------------------------------

export async function createOncologyTreatment(data: {
    patientId: string;
    oncologistId: string;
    protocolName: string;
    cancerType: string;
    stage?: string;
    intent?: string;
    totalCycles: number;
    cycleIntervalDays?: number;
    startDate?: string; // ISO date
}): Promise<any> {
    await ensureRole(['DOCTOR', 'ADMIN']);
    const db = await getTenantDb();

    const startDate = data.startDate ? new Date(data.startDate) : new Date();

    const treatment = await db.oncologyTreatment.create({
        data: {
            patientId: data.patientId,
            oncologistId: data.oncologistId,
            protocolName: data.protocolName,
            cancerType: data.cancerType,
            stage: data.stage,
            intent: data.intent ?? 'CURATIVE',
            totalCycles: data.totalCycles,
            cycleIntervalDays: data.cycleIntervalDays ?? 21,
            startDate,
            status: 'ACTIVE',
        }
    });

    // Auto-generate all chemo session schedule entries
    const sessions = [];
    for (let cycle = 1; cycle <= data.totalCycles; cycle++) {
        const sessionDate = new Date(startDate);
        sessionDate.setDate(sessionDate.getDate() + (cycle - 1) * (data.cycleIntervalDays ?? 21));
        sessions.push({
            treatmentId: treatment.id,
            patientId: data.patientId,
            cycleNumber: cycle,
            sessionNumber: 1,
            scheduledDate: sessionDate,
            status: 'SCHEDULED',
        });
    }

    await db.chemoSession.createMany({ data: sessions });

    await logAudit({
        action: 'CREATE', resource: 'OncologyTreatment', resourceId: treatment.id,
        details: { patientId: data.patientId, protocol: data.protocolName, totalCycles: data.totalCycles }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'TREATMENT_CREATED', 'Patient', data.patientId);

    revalidatePath(`/oncology/patients/${data.patientId}`);
    return treatment;
}

// ---------------------------------------------------------------------------
// PRE-CHEMO ASSESSMENT GATE (must pass before session can start)
// ---------------------------------------------------------------------------

export async function submitPreChemoAssessment(sessionId: string, data: {
    anc: number;       // Absolute Neutrophil Count (10³/µL)
    platelets: number; // Platelet count
    weightKg: number;
    bsa: number;       // Body Surface Area m²
}): Promise<any> {
    await ensureRole(['NURSE', 'DOCTOR', 'ADMIN']);
    const db = await getTenantDb();

    // Clinical clearance rules (standard oncology thresholds)
    const ancOk = data.anc >= 1.5;
    const plateletsOk = data.platelets >= 100;
    const preChemoCleared = ancOk && plateletsOk;

    const session = await db.chemoSession.update({
        where: { id: sessionId },
        data: {
            anc: data.anc,
            platelets: data.platelets,
            weightKg: data.weightKg,
            bsa: data.bsa,
            preChemoCleared,
            // Put session on hold if clearance fails
            status: preChemoCleared ? 'SCHEDULED' : 'HELD',
        }
    });

    if (!preChemoCleared) {
        const tenantId = await getResolvedTenantId();
        if (tenantId) {
            realtimeHub.broadcast(tenantId, 'CHEMO_HELD', 'ChemoSession', sessionId, {
                reason: !ancOk ? `ANC too low: ${data.anc}` : `Platelets too low: ${data.platelets}`,
            });
        }
    }

    await logAudit({
        action: 'UPDATE', resource: 'ChemoSession', resourceId: sessionId,
        details: { action: 'PRE_CHEMO_ASSESSMENT', ancOk, plateletsOk, preChemoCleared }
    });

    return { session, preChemoCleared, ancOk, plateletsOk };
}

// ---------------------------------------------------------------------------
// START INFUSION SESSION
// ---------------------------------------------------------------------------

export async function startChemoSession(sessionId: string, nurseId: string, drugs: {
    name: string;
    dose_mg_m2: number;
    calculated_dose: number;
    rate: string;
    duration_hr: number;
}[]): Promise<any> {
    await ensureRole(['NURSE', 'ADMIN']);
    const db = await getTenantDb();

    const session = await db.chemoSession.findUnique({ where: { id: sessionId } });
    if (!session?.preChemoCleared) {
        throw new Error('PRE_CHEMO_NOT_CLEARED: Pre-chemotherapy assessment must be passed before starting infusion.');
    }

    const updated = await db.chemoSession.update({
        where: { id: sessionId },
        data: {
            status: 'IN_PROGRESS' as any, // Will be 'COMPLETED' after completion
            actualDate: new Date(),
            infusionStart: new Date(),
            nurseId,
            drugs,
        }
    });

    await logAudit({
        action: 'UPDATE', resource: 'ChemoSession', resourceId: sessionId,
        details: { action: 'INFUSION_STARTED', nurseId, drugCount: drugs.length }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'CHEMO_STARTED', 'ChemoSession', sessionId);

    return updated;
}

// ---------------------------------------------------------------------------
// COMPLETE SESSION + CTCAE TOXICITY LOGGING
// ---------------------------------------------------------------------------

export async function completeChemoSession(sessionId: string, data: {
    toxicities?: { drug: string; ctcae_grade: number; type: string; description: string }[];
    sessionNotes?: string;
    adverseEvent?: boolean;
    doseReduced?: boolean;
    doseReductionReason?: string;
}): Promise<any> {
    await ensureRole(['NURSE', 'DOCTOR', 'ADMIN']);
    const db = await getTenantDb();

    const session = await db.chemoSession.update({
        where: { id: sessionId },
        data: {
            status: 'COMPLETED',
            infusionEnd: new Date(),
            toxicities: data.toxicities ?? [],
            sessionNotes: data.sessionNotes,
            adverseEvent: data.adverseEvent ?? false,
            doseReduced: data.doseReduced ?? false,
            doseReductionReason: data.doseReductionReason,
        },
        include: { treatment: true }
    });

    // Advance the current cycle counter on the treatment
    await db.oncologyTreatment.update({
        where: { id: session.treatmentId },
        data: { currentCycle: session.cycleNumber }
    });

    // Alert for Grade 4/5 toxicity (CTCAE)
    const criticalToxicities = (data.toxicities ?? []).filter((t: any) => t.ctcae_grade >= 4);
    if (criticalToxicities.length > 0) {
        const tenantId = await getResolvedTenantId();
        if (tenantId) {
            realtimeHub.broadcast(tenantId, 'ONCOLOGY_EMERGENCY', 'ChemoSession', sessionId, {
                reason: 'SEVERE_TOXICITY',
                grades: criticalToxicities.map((t: any) => `${t.drug}: Grade ${t.ctcae_grade}`)
            });
        }
    }

    await logAudit({
        action: 'UPDATE', resource: 'ChemoSession', resourceId: sessionId,
        details: {
            action: 'SESSION_COMPLETED',
            adverseEvent: data.adverseEvent,
            criticalToxicityCount: criticalToxicities.length
        }
    });

    revalidatePath(`/oncology/patients/${session.patientId}`);
    return session;
}

// ---------------------------------------------------------------------------
// RECORD TREATMENT RESPONSE (after N cycles)
// ---------------------------------------------------------------------------

export async function recordTreatmentResponse(treatmentId: string, response: 'CR' | 'PR' | 'SD' | 'PD', notes?: string): Promise<any> {
    await ensureRole(['DOCTOR', 'ADMIN']);
    const db = await getTenantDb();

    const treatment = await db.oncologyTreatment.update({
        where: { id: treatmentId },
        data: {
            response,
            status: response === 'CR' ? 'COMPLETED' : 'ACTIVE',
            discontinuationReason: notes,
        }
    });

    await logAudit({
        action: 'UPDATE', resource: 'OncologyTreatment', resourceId: treatmentId,
        details: { action: 'RESPONSE_RECORDED', response }
    });

    revalidatePath(`/oncology/patients/${treatment.patientId}`);
    return treatment;
}

// ---------------------------------------------------------------------------
// GET ONCOLOGY DASHBOARD DATA
// ---------------------------------------------------------------------------

export async function getOncologySchedule(): Promise<any> {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    const db = await getTenantDb();

    const today = new Date();
    const in7Days = new Date();
    in7Days.setDate(today.getDate() + 7);

    return db.chemoSession.findMany({
        where: {
            scheduledDate: { gte: today, lte: in7Days },
            status: { in: ['SCHEDULED', 'HELD'] }
        },
        include: {
            patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
            treatment: { select: { protocolName: true, cancerType: true, currentCycle: true, totalCycles: true } }
        },
        orderBy: { scheduledDate: 'asc' }
    });
}
