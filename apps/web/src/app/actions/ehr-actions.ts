'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisi/realtime';
import { getResolvedTenantId, getTenantSyncSecret } from '@/lib/tenant';
import { recordEvent } from '@amisi/sync-engine/journal';

import { generateMRN } from '@/lib/mrn';

// Patient Actions
export async function getPatients(query?: string) {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    const db = await getTenantDb();
    return await db.patient.findMany({
        where: query ? {
            OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
                { mrn: { contains: query, mode: 'insensitive' } },
            ]
        } : {},
        orderBy: { createdAt: 'desc' },
    });
}

// ... existing getPatientById ...

export async function createPatient(formData: FormData) {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    
    // 1. Capture Demographics
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const dob = new Date(formData.get('dob') as string);
    const gender = formData.get('gender') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const address = formData.get('address') as string;
    const insuranceProvider = formData.get('insuranceProvider') as string;
    const insuranceId = formData.get('insuranceId') as string;

    const db = await getTenantDb();

    // 2. Generate Unique Patient ID (MRN)
    const mrn = await generateMRN(db, "AM");

    // 3. Create EMR Record (In Transaction)
    const patient = await db.$transaction(async (tx: any) => {
        const p = await tx.patient.create({
            data: {
                mrn,
                firstName,
                lastName,
                dob,
                gender,
                phone,
                email,
                address,
                insuranceProvider,
                insuranceId,
            }
        });

        // 4. Initialize EMR Entry (Intake Encounter)
        await tx.encounter.create({
            data: {
                patientId: p.id,
                type: 'INTAKE',
                doctorName: 'ADMIN_SYSTEM',
                notes: 'Automated initial intake encounter created during registration.',
            }
        });

        return p;
    });

    // 5. Ensure Data Privacy & Compliance (Audit Logging)
    await logAudit({
        action: 'CREATE',
        resource: 'Patient',
        resourceId: patient.id,
        details: { mrn, firstName, lastName, insuranceVerified: !!insuranceProvider }
    });

    // 6. Distribution & Real-time
    const tenantId = await getResolvedTenantId();
    if (tenantId) {
        realtimeHub.broadcast(tenantId, 'PATIENT_MUTATED', 'Patient', patient.id);
        
        // SYNC: Record to Cloud Journal for Edge Pull
        const secret = await getTenantSyncSecret(tenantId);
        if (secret) {
            await recordEvent(db, 'Patient', patient.id, 'CREATE', patient, secret, 'OUTGOING');
        }
    }

    revalidatePath('/patients');
    return patient;
}

// Encounter Actions
export async function createEncounter(patientId: string, formData: FormData) {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    const doctorName = formData.get('doctorName') as string;
    const type = formData.get('type') as string;
    const notes = formData.get('notes') as string;
    const plan = formData.get('plan') as string;

    const db = await getTenantDb();
    const encounter = await db.encounter.create({
        data: {
            patientId,
            doctorName,
            type,
            notes,
            plan,
        }
    });

    // HIPAA Audit Log: Creating clinical encounter
    await logAudit({
        action: 'CREATE',
        resource: 'Encounter',
        resourceId: encounter.id,
        details: { patientId, type, doctorName }
    });

    // Extract Vitals if provided
    const bp = formData.get('bloodPressure') as string;
    if (bp) {
        await db.vitals.create({
            data: {
                patientId,
                encounterId: encounter.id,
                bloodPressure: bp,
                heartRate: parseInt(formData.get('heartRate') as string) || undefined,
                temperature: formData.get('temperature') ? parseFloat(formData.get('temperature') as string) : undefined,
                weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined,
            }
        });
    }

    // Real-time Update: Notify hospital staff of new encounter/vitals
    const tenantId = await getResolvedTenantId();
    if (tenantId) {
        realtimeHub.broadcast(tenantId, 'VITALS_UPDATED', 'Patient', patientId);

        // SYNC: Record to Cloud Journal for Edge Pull
        const secret = await getTenantSyncSecret(tenantId);
        if (secret) {
            await recordEvent(db, 'Encounter', encounter.id, 'CREATE', encounter, secret, 'OUTGOING');
        }
    }
    
    revalidatePath(`/patients/${patientId}`);
    return encounter;
}

// Triage & ED Actions
export async function triagePatient(encounterId: string, formData: FormData) {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    const esiLevel = parseInt(formData.get('esiLevel') as string);
    const triageNotes = formData.get('triageNotes') as string;

    const db = await getTenantDb();
    const encounter = await db.encounter.update({
        where: { id: encounterId },
        data: {
            esiLevel,
            triageNotes,
            type: 'EMERGENCY', // Mark as emergency if triaged
        }
    });

    // 1. HIPAA Audit: Triage assessment
    await logAudit({
        action: 'UPDATE',
        resource: 'Encounter',
        resourceId: encounterId,
        details: { esiLevel, triageNotes, action: 'TRIAGE' }
    });

    // 2. Real-time Trauma Alarm: Notify critical care teams
    const tenantId = await getResolvedTenantId();
    if (tenantId && esiLevel <= 2) {
        realtimeHub.broadcast(tenantId, 'TRAUMA_ALARM', 'Encounter', encounterId);
    }

    // 3. Sync: Record mutation
    if (tenantId) {
        const secret = await getTenantSyncSecret(tenantId);
        if (secret) {
            await recordEvent(db, 'Encounter', encounterId, 'UPDATE', encounter, secret, 'OUTGOING');
        }
    }

    revalidatePath(`/patients/${encounter.patientId}`);
    return encounter;
}

export async function completeMSE(encounterId: string) {
    await ensureRole(['DOCTOR', 'ADMIN']); // MSC usually requires a physician
    const db = await getTenantDb();
    
    const encounter = await db.encounter.update({
        where: { id: encounterId },
        data: {
            mseCompletedAt: new Date(),
        }
    });

    // HIPAA Audit: MSE completion for EMTALA compliance
    await logAudit({
        action: 'UPDATE',
        resource: 'Encounter',
        resourceId: encounterId,
        details: { action: 'MSE_COMPLETED' }
    });

    revalidatePath(`/patients/${encounter.patientId}`);
    return encounter;
}

export async function getPatientById(id: string) {
    const db = await getTenantDb();
    return db.patient.findUnique({
        where: { id },
        include: {
            vitals: { orderBy: { createdAt: 'desc' }, take: 5 },
            diagnosticOrders: { orderBy: { createdAt: 'desc' } },
            labOrders: { orderBy: { createdAt: 'desc' } },
            prescriptions: { orderBy: { createdAt: 'desc' } },
            encounters: { orderBy: { createdAt: 'desc' }, include: { vitals: true } },
            chats: { orderBy: { timestamp: 'desc' } },
            allergies: true,
            financialRecords: { orderBy: { createdAt: 'desc' } },
        }
    });
}
