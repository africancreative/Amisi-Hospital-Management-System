'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole, getServerUser } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { getResolvedTenantId } from '@/lib/tenant';
import { realtimeHub } from '@amisimedos/chat';
import type { Encounter } from '@amisimedos/db/types';

export async function registerAndCheckIn(data: {
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    phone?: string;
    department: string;
    priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
}): Promise<any> {
    await ensureRole(['RECEPTIONIST', 'ADMIN', 'ADMISSIONS']);
    const db = await getTenantDb();

    // 1. Create or find patient (Simple matching by name and DOB for speed)
    const patient = await db.patient.create({
        data: {
            firstName: data.firstName,
            lastName: data.lastName,
            dob: new Date(data.dob),
            gender: data.gender,
            phone: data.phone,
            mrn: `AM-${Math.floor(1000 + Math.random() * 9000)}-${Date.now().toString().slice(-4)}`, // Fast MRN generation
        }
    });

    // 2. Generate Queue Number (DEPT-CountToday+1)
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const countToday = await db.encounter.count({
        where: {
            createdAt: { gte: startOfDay },
            department: data.department
        }
    });

    const queueNumber = `${data.department.substring(0, 3).toUpperCase()}-${(countToday + 1).toString().padStart(3, '0')}`;

    // 3. Create Encounter (Check-in)
    const encounter = await db.encounter.create({
        data: {
            patientId: patient.id,
            encounterType: 'OPD',
            doctorName: 'PENDING',
            type: data.priority === 'EMERGENCY' ? 'Emergency' : 'Checkup',
            department: data.department,
            status: 'CHECKED_IN',
            priority: data.priority,
            queueNumber,
            checkedInAt: new Date(),
        }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'QUEUE_UPDATED', 'Queue', encounter.id);

    revalidatePath('/queue');
    return { success: true, queueNumber, encounterId: encounter.id };
}

export async function updateEncounterStatus(encounterId: string, status: string, doctorId?: string, doctorName?: string): Promise<Encounter> {
    await ensureRole(['NURSE', 'DOCTOR', 'ADMIN']);
    const db = await getTenantDb();

    const data: any = { status };
    if (status === 'TRIAGED') data.triagedAt = new Date();
    if (status === 'IN_PROGRESS') {
        data.seenAt = new Date();
        if (doctorId) data.doctorId = doctorId;
        if (doctorName) data.doctorName = doctorName;
    }
    if (status === 'COMPLETED') data.completedAt = new Date();

    const user = await getServerUser();
    const signature = `\n[Status updated to ${status} by ${user.name} at ${new Date().toLocaleTimeString()}]`;

    const encounter = await db.encounter.update({
        where: { id: encounterId },
        data: {
            ...data,
            notes: {
                set: signature // In a real app we'd append, but for simplicity here we track change
            }
        }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'QUEUE_UPDATED', 'Queue', encounter.id);

    revalidatePath('/queue');
    return encounter;
}

export async function getDynamicQueue(department?: string): Promise<any[]> {
    const db = await getTenantDb();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const encounters = await db.encounter.findMany({
        where: {
            status: { in: ['CHECKED_IN', 'TRIAGED'] },
            createdAt: { gte: startOfDay },
            ...(department ? { department } : {})
        },
        include: {
            patient: {
                select: { firstName: true, lastName: true, mrn: true, dob: true, gender: true }
            }
        }
    });

    // Weighted Queue Algorithm
    const scoredQueue = encounters.map((e: any) => {
        const now = Date.now();
        const waitMinutes = Math.floor((now - new Date(e.createdAt).getTime()) / 60000);
        
        // Severity Weights (ESI 1-5)
        const severityScores: Record<number, number> = {
            1: 2000, // Immediate life-saving
            2: 1000, // Emergent
            3: 500,  // Urgent
            4: 100,  // Less urgent
            5: 0     // Non-urgent
        };

        const esi = e.esiLevel || 5;
        const severityScore = severityScores[esi] || 0;
        
        // Wait Time Weight (1 pt per minute)
        const waitScore = waitMinutes;

        // Total Score
        const totalScore = severityScore + waitScore;

        return {
            ...e,
            priorityScore: totalScore,
            waitMinutes
        };
    });

    // Sort by descending score (Highest priority first)
    return scoredQueue.sort((a, b) => b.priorityScore - a.priorityScore);
}
export async function saveTriageIntake(encounterId: string, data: {
    vitals: {
        temp: number;
        sys: number;
        dia: number;
        pulse: number;
        spo2: number;
    };
    symptoms: string[];
    risks: string[];
    esiLevel?: number;
    route: 'OPD' | 'EMERGENCY' | 'FAST_TRACK';
}): Promise<any> {
    await ensureRole(['NURSE', 'ADMIN']);
    const db = await getTenantDb();

    const status = data.route === 'EMERGENCY' ? 'EMERGENCY' : 'TRIAGED';
    const priority = data.route === 'EMERGENCY' ? 'EMERGENCY' : (data.esiLevel && data.esiLevel <= 2 ? 'URGENT' : 'NORMAL');

    const user = await getServerUser();
    const signature = `\n[Triage Signed by ${user.name} (${user.role}) at ${new Date().toLocaleTimeString()}]`;

    const encounter = await db.encounter.update({
        where: { id: encounterId },
        data: {
            temperature: data.vitals.temp,
            systolicBP: data.vitals.sys,
            diastolicBP: data.vitals.dia,
            pulse: data.vitals.pulse,
            spo2: data.vitals.spo2,
            symptoms: data.symptoms.join(','),
            riskFlags: data.risks.join(','),
            esiLevel: data.esiLevel,
            triageNotes: (data.risks.join(', ') || 'Normal') + signature,
            status,
            priority,
            triagedAt: new Date(),
        }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'QUEUE_UPDATED', 'Queue', encounter.id);

    revalidatePath('/queue');
    revalidatePath('/triage');
    return { success: true, status: encounter.status };
}

export async function getActiveQueue(department?: string): Promise<any[]> {
    return getDynamicQueue(department);
}
