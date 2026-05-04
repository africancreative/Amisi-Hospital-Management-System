'use server';

import { getControlDb, getTenantDb } from '@/lib/db';
import { ensureRole, ensureSuperAdmin } from '@/lib/auth-utils';
import { cookies } from 'next/headers';

export async function getPlatformDashboardStats(): Promise<any> {
    await ensureSuperAdmin();
    const controlDb = getControlDb();

    const hospitalCount = await controlDb.tenant.count({
        where: { status: 'active' }
    });

    const activeSubscriptions = await controlDb.tenantModule.count({
        where: { isEnabled: true }
    });

    return {
        hospitalCount: hospitalCount.toString(),
        totalUsers: '8,409', // Mocked for now or can count across system if needed
        systemHealth: '99.9%',
        activeSubscriptions: activeSubscriptions.toString()
    };
}

export async function getTenantDashboardStats(selectedDate?: string): Promise<any> {
    await ensureRole(['ADMIN', 'DOCTOR', 'NURSE', 'ACCOUNTANT', 'PHARMACIST', 'LAB_TECH', 'HR']);
    const db = await getTenantDb();

    // Parse target date
    let targetDate = new Date();
    if (selectedDate) {
        targetDate = new Date(selectedDate);
    }
    targetDate.setHours(0, 0, 0, 0);
    const nextDay = new Date(targetDate);
    nextDay.setDate(targetDate.getDate() + 1);

    // Existing stats
    const patientCount = await db.patient.count();
    const todayEncounters = await db.encounter.count({
        where: { createdAt: { gte: targetDate, lt: nextDay } }
    });
    const pendingLabs = await db.labOrder.count({
        where: { status: 'pending' }
    });

    // Revenue today - fetch from Payment model (paymentMethod is on Payment, not Invoice)
    const todayPayments = await db.payment.findMany({
        where: { createdAt: { gte: targetDate, lt: nextDay } },
        select: { amount: true, method: true }
    });
    const revenueToday = todayPayments.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);
    const revenueByMethod = todayPayments.reduce((acc: any, curr: any) => {
        const method = (curr.method || 'CASH').toUpperCase();
        acc[method] = (acc[method] || 0) + Number(curr.amount);
        return acc;
    }, {});

    // Active queue (patients in queue statuses)
    const activeQueue = await db.encounter.count({
        where: { status: { in: ['REGISTERED', 'INTAKE_COMPLETE', 'TRIAGE_ASSIGNED'] } }
    });
    const pendingPayments = await db.invoice.count({ where: { status: { in: ['OPEN', 'PARTIAL'] } } });

    // Queue breakdown by status
    const waitingCount = await db.encounter.count({ where: { status: 'REGISTERED' } });
    const consultationCount = await db.encounter.count({ where: { status: 'IN_CONSULTATION' } });
    const labCount = await db.labOrder.count({ where: { status: 'pending' } });
    const pharmacyCount = await db.prescription.count({ where: { status: 'pending' } });

    // Staff activity - use status field (not isActive)
    const activeStaff = await db.employee.count({ where: { status: 'ACTIVE' } });
    const encountersPerStaff = await db.encounter.groupBy({
        by: ['doctorId'],
        where: { 
            createdAt: { gte: targetDate, lt: nextDay },
            doctorId: { not: null }
        },
        _count: { doctorId: true }
    });
    // Average consultation time (using seenAt and completedAt)
    const completedEncounters = await db.encounter.findMany({
        where: {
            status: 'BILLING_COMPLETE',
            completedAt: { not: null, gte: targetDate, lt: nextDay },
            seenAt: { not: null }
        },
        select: { seenAt: true, completedAt: true }
    });
    let avgConsultTime = 0;
    if (completedEncounters.length > 0) {
        const totalMs = completedEncounters.reduce((acc: number, curr: any) => {
            const start = curr.seenAt ? new Date(curr.seenAt).getTime() : 0;
            const end = curr.completedAt ? new Date(curr.completedAt).getTime() : 0;
            return start && end ? acc + (end - start) : acc;
        }, 0);
        avgConsultTime = Math.round(totalMs / completedEncounters.length / 60000);
    }

    // Alerts
    const overcrowding = activeQueue > 20;
    const lowInventoryCount = await db.inventoryItem.count({
        where: { quantity: { lte: db.inventoryItem.fields.reorderLevel } }
    });
    const delayedPatients = await db.encounter.count({
        where: { 
            status: 'REGISTERED', 
            createdAt: { lte: new Date(Date.now() - 30 * 60000) } 
        }
    });

    // Total revenue (all time)
    const allTimePayments = await db.payment.findMany({
        select: { amount: true }
    });
    const totalRevenue = allTimePayments.reduce((acc: number, curr: any) => acc + Number(curr.amount), 0);

    return {
        patientCount: patientCount.toString(),
        todayEncounters: todayEncounters.toString(),
        pendingLabs: pendingLabs.toString(),
        totalRevenue: new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(totalRevenue),
        patientsToday: todayEncounters,
        revenueToday: new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(revenueToday),
        revenueByMethod,
        activeQueue,
        pendingPayments,
        queueBreakdown: { waiting: waitingCount, consultation: consultationCount, lab: labCount, pharmacy: pharmacyCount },
        staffActivity: {
            activeStaff,
            encountersPerStaff: encountersPerStaff.map((item: any) => ({
                staffId: item.doctorId,
                count: item._count.doctorId
            })),
            avgConsultTime
        },
        alerts: { overcrowding, lowInventoryCount, delayedPatients }
    };
}

export async function getTenantSubscription(): Promise<any> {
    const controlDb = getControlDb();
    const cookieStore = await cookies();
    const tenantId = cookieStore.get('amisi-tenant-id')?.value;
    
    if (!tenantId) return null;

    return await controlDb.subscription.findFirst({
        where: { tenantId, status: 'ACTIVE' },
        include: { plan: true }
    });
}
