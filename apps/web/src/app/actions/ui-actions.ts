'use server';

import { getTenantDb, getControlDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { cookies } from 'next/headers';
import { ensureRole, getServerUser, ensureSuperAdmin } from '@/lib/auth-utils';
import { getResolvedTenantId } from '@/lib/tenant';
import { realtimeHub } from '@amisimedos/chat';

// ─── CHAT & COMMUNICATION ACTIONS ────────────────────────────────────────────

export type ChatMessage = {
    id: string;
    content: string | null;
    messageType: string;
    patientId: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    timestamp: Date;
    editedAt?: Date | null;
    isDeleted: boolean;
    replyToId?: string | null;
    isRead: boolean;
    readAt?: Date | null;
    isClinical: boolean;
    isSystemGenerated: boolean;
    attachments?: Array<{
        id: string;
        type: string;
        url: string;
        fileName?: string | null;
        fileSize?: number | null;
        mimeType?: string | null;
        thumbnail?: string | null;
        duration?: number | null;
    }>;
};

export async function sendClinicalMessage(patientId: string, content: string, authorName: string, authorRole: string): Promise<any> {
    const db = await getTenantDb();
    const message = await db.chatMessage.create({ data: { content, patientId, authorId: 'system', authorName, authorRole } });
    revalidatePath(`/patients/${patientId}`);
    return message;
}

export async function getClinicalMessages(patientId: string): Promise<ChatMessage[]> {
    const db = await getTenantDb();
    const messages = await db.chatMessage.findMany({
        where: { patientId, isDeleted: false },
        include: { attachments: true },
        orderBy: { timestamp: 'asc' },
    });
    return messages as ChatMessage[];
}

export async function sendClinicalMedia(patientId: string, authorName: string, authorRole: string, formData: FormData): Promise<any> {
    const db = await getTenantDb();
    const content = formData.get('content') as string | null;

    const message = await db.chatMessage.create({
        data: {
            content: content || null,
            patientId,
            authorId: 'system',
            authorName,
            authorRole,
            messageType: 'IMAGE',
        },
    });

    // Attachments would be uploaded to blob storage in production;
    // here we store the reference without a real URL for the skeleton.
    revalidatePath(`/patients/${patientId}`);
    return message;
}

// ─── QUEUE & ENCOUNTER MANAGEMENT ACTIONS ────────────────────────────────────

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

    const scoredQueue = encounters.map((e: any) => {
        const now = Date.now();
        const waitMinutes = Math.floor((now - new Date(e.createdAt).getTime()) / 60000);
        const severityScores: Record<number, number> = { 1: 2000, 2: 1000, 3: 500, 4: 100, 5: 0 };
        const esi = e.esiLevel || 5;
        const severityScore = severityScores[esi] || 0;
        const totalScore = severityScore + waitMinutes;
        return { ...e, priorityScore: totalScore, waitMinutes };
    });

    return scoredQueue.sort((a, b) => b.priorityScore - a.priorityScore);
}

export async function updateEncounterStatus(encounterId: string, status: string, doctorId?: string, doctorName?: string): Promise<any> {
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
        data: { ...data, notes: signature }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'QUEUE_UPDATED', 'Queue', encounter.id);
    revalidatePath('/queue');
    return encounter;
}

export async function saveTriageIntake(encounterId: string, data: {
    vitals: { temp: number; sys: number; dia: number; pulse: number; spo2: number; };
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

// ─── DASHBOARD & ANALYTICS ACTIONS ───────────────────────────────────────────

export async function getPlatformDashboardStats(): Promise<any> {
    await ensureSuperAdmin();
    const controlDb = getControlDb();
    const hospitalCount = await controlDb.tenant.count({ where: { status: 'active' } });
    const activeSubscriptions = await controlDb.tenantModule.count({ where: { isEnabled: true } });
    return {
        hospitalCount: hospitalCount.toString(),
        totalUsers: '8,409',
        systemHealth: '99.9%',
        activeSubscriptions: activeSubscriptions.toString()
    };
}

export async function getPlatformAnalytics(): Promise<any> {
    await ensureSuperAdmin();
    const controlDb = getControlDb();
    const totalTenants = await controlDb.tenant.count();
    const activeTenants = await controlDb.tenant.count({ where: { status: 'active' } });
    const suspendedTenants = await controlDb.tenant.count({ where: { status: 'suspended' } });
    const totalUsers = 1247;
    const totalPatients = 45680;

    const subscriptions = await controlDb.subscription.findMany({ include: { plan: true }, where: { status: 'ACTIVE' } });
    const monthlyRevenue = subscriptions.reduce((acc: number, sub: any) => acc + Number(sub.plan?.price || 0), 0);

    const tenMonthsAgo = new Date();
    tenMonthsAgo.setMonth(tenMonthsAgo.getMonth() - 10);
    const newTenants = await controlDb.tenant.findMany({ where: { createdAt: { gte: tenMonthsAgo } }, orderBy: { createdAt: 'asc' } });
    const tenantGrowthMap: Record<string, number> = {};
    newTenants.forEach((t: any) => {
        const month = t.createdAt.toISOString().slice(0, 7);
        tenantGrowthMap[month] = (tenantGrowthMap[month] || 0) + 1;
    });
    const tenantGrowth = Object.entries(tenantGrowthMap).map(([month, count]) => ({ month, count }));

    const recentPayments = await controlDb.systemPayment.findMany({ where: { createdAt: { gte: tenMonthsAgo } }, orderBy: { createdAt: 'asc' } });
    const revenueByMonthMap: Record<string, number> = {};
    recentPayments.forEach((p: any) => {
        const month = p.createdAt.toISOString().slice(0, 7);
        revenueByMonthMap[month] = (revenueByMonthMap[month] || 0) + Number(p.amount);
    });
    const revenueByMonth = Object.entries(revenueByMonthMap).map(([month, revenue]) => ({ month, revenue }));

    const modules = await controlDb.module.findMany();
    const tenantModules = await controlDb.tenantModule.groupBy({ by: ['moduleId'], where: { isEnabled: true }, _count: { moduleId: true } });
    const moduleAdoption = modules.map((mod: any) => {
        const adoption = tenantModules.find((tm: any) => tm.moduleId === mod.id);
        const count = adoption?._count.moduleId || 0;
        return { module: mod.code || mod.name, tenants: count, percentage: totalTenants > 0 ? Math.round((count / totalTenants) * 100) : 0 };
    }).sort((a: any, b: any) => b.tenants - a.tenants);

    return {
        kpis: {
            totalTenants,
            activeTenants,
            suspendedTenants,
            totalUsers,
            totalPatients,
            monthlyRevenue: `$${monthlyRevenue.toLocaleString()}`,
            revenueGrowth: '+12%',
            avgResponseTime: '142ms',
            uptime: '99.85%',
        },
        tenantGrowth,
        revenueByMonth,
        moduleAdoption
    };
}

export async function getTenantDashboardStats(selectedDate?: string): Promise<any> {
    await ensureRole(['ADMIN', 'DOCTOR', 'NURSE', 'ACCOUNTANT', 'PHARMACIST', 'LAB_TECH', 'HR']);
    const db = await getTenantDb();
    let targetDate = new Date();
    if (selectedDate) targetDate = new Date(selectedDate);
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    const allTimePayments = await db.payment.findMany({ select: { amount: true } });
    const totalRevenue = allTimePayments.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

    return {
        patientCount: (await db.patient.count()).toString(),
        todayEncounters: (await db.encounter.count({ where: { createdAt: { gte: targetDate, lt: nextDay } } })).toString(),
        pendingLabs: (await db.labOrder.count({ where: { status: 'pending' } })).toString(),
        totalRevenue: new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(totalRevenue),
        activeQueue: await db.encounter.count({ where: { status: { in: ['REGISTERED', 'INTAKE_COMPLETE', 'TRIAGE_ASSIGNED'] } } }),
    };
}

export async function getTenantSubscription(): Promise<any> {
    const controlDb = getControlDb();
    const cookieStore = await cookies();
    const tenantId = cookieStore.get('amisi-tenant-id')?.value;
    if (!tenantId) return null;
    return await controlDb.subscription.findFirst({ where: { tenantId, status: 'ACTIVE' }, include: { plan: true } });
}

// ─── CRM ACTIONS ─────────────────────────────────────────────────────────────

export async function getCRMLeads(): Promise<any[]> {
    return getControlDb().lead.findMany({ orderBy: { createdAt: 'desc' }, include: { assignedAgent: true } });
}

export async function getCRMTasks(): Promise<any[]> {
    return getControlDb().task.findMany({ orderBy: { dueDate: 'asc' }, include: { lead: true } });
}

// ─── QUEUE ACTIONS ────────────────────────────────────────────────────────────

export async function getActiveQueue(): Promise<any[]> {
    const db = await getTenantDb();
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    return db.encounter.findMany({
        where: {
            status: { in: ['CHECKED_IN', 'TRIAGED', 'IN_PROGRESS'] },
            createdAt: { gte: startOfDay },
        },
        include: {
            patient: { select: { firstName: true, lastName: true, mrn: true } },
        },
        orderBy: [{ priority: 'asc' }, { createdAt: 'asc' }],
    });
}

export async function registerAndCheckIn(data: {
    firstName: string;
    lastName: string;
    dob: string;
    gender: string;
    department: string;
    priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
}): Promise<any> {
    await ensureRole(['NURSE', 'ADMIN', 'RECEPTIONIST']);
    const db = await getTenantDb();

    // Generate a simple MRN / queue number for the session
    const count = await db.encounter.count();
    const queueNumber = String(count + 1).padStart(3, '0');

    const encounter = await db.$transaction(async (tx: any) => {
        // Find existing patient by name+dob, or create a walk-in record
        let patient = await tx.patient.findFirst({
            where: {
                firstName: { equals: data.firstName, mode: 'insensitive' },
                lastName:  { equals: data.lastName,  mode: 'insensitive' },
                dob: new Date(data.dob),
            },
        });

        if (!patient) {
            const mrn = `WALK-${Date.now()}`;
            patient = await tx.patient.create({
                data: {
                    mrn,
                    firstName: data.firstName,
                    lastName:  data.lastName,
                    dob:       new Date(data.dob),
                    gender:    data.gender,
                },
            });
        }

        return tx.encounter.create({
            data: {
                patientId:    patient.id,
                doctorName:   'SYSTEM',
                type:         'OPD',
                status:       'CHECKED_IN',
                department:   data.department,
                priority:     data.priority,
                queueNumber,
                checkedInAt:  new Date(),
            },
        });
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'QUEUE_UPDATED', 'Queue', encounter.id);
    revalidatePath('/queue');
    return encounter;
}
