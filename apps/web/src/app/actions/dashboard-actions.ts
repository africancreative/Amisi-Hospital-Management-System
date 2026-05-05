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

export async function getPlatformAnalytics(): Promise<any> {
    await ensureSuperAdmin();
    const controlDb = getControlDb();

    // KPIs
    const totalTenants = await controlDb.tenant.count();
    const activeTenants = await controlDb.tenant.count({ where: { status: 'active' } });
    const suspendedTenants = await controlDb.tenant.count({ where: { status: 'suspended' } });
    
    // Total users across all tenants (mocked - would need cross-tenant query)
    const totalUsers = 1247;
    const totalPatients = 45680;

    // Revenue from subscriptions
    const subscriptions = await controlDb.subscription.findMany({
        include: { plan: true },
        where: { status: 'ACTIVE' }
    });
    const monthlyRevenue = subscriptions.reduce((acc: number, sub: any) => acc + Number(sub.plan?.price || 0), 0);

    // Tenant growth over last 10 months
    const tenMonthsAgo = new Date();
    tenMonthsAgo.setMonth(tenMonthsAgo.getMonth() - 10);
    const newTenants = await controlDb.tenant.findMany({
        where: { createdAt: { gte: tenMonthsAgo } },
        orderBy: { createdAt: 'asc' }
    });
    
    const tenantGrowthMap: Record<string, number> = {};
    newTenants.forEach((t: any) => {
        const month = t.createdAt.toISOString().slice(0, 7); // YYYY-MM
        tenantGrowthMap[month] = (tenantGrowthMap[month] || 0) + 1;
    });
    const tenantGrowth = Object.entries(tenantGrowthMap).map(([month, count]) => ({ month, count }));

    // Revenue by month from payments
    const recentPayments = await controlDb.systemPayment.findMany({
        where: { createdAt: { gte: tenMonthsAgo } },
        orderBy: { createdAt: 'asc' }
    });
    const revenueByMonthMap: Record<string, number> = {};
    recentPayments.forEach((p: any) => {
        const month = p.createdAt.toISOString().slice(0, 7);
        revenueByMonthMap[month] = (revenueByMonthMap[month] || 0) + Number(p.amount);
    });
    const revenueByMonth = Object.entries(revenueByMonthMap).map(([month, revenue]) => ({ month, revenue }));

    // Module adoption
    const modules = await controlDb.module.findMany();
    const tenantModules = await controlDb.tenantModule.groupBy({
        by: ['moduleId'],
        where: { isEnabled: true },
        _count: { moduleId: true }
    });
    const moduleAdoption = modules.map((mod: any) => {
        const adoption = tenantModules.find((tm: any) => tm.moduleId === mod.id);
        const count = adoption?._count.moduleId || 0;
        return {
            module: mod.code || mod.name,
            tenants: count,
            percentage: totalTenants > 0 ? Math.round((count / totalTenants) * 100) : 0
        };
    }).sort((a: any, b: any) => b.tenants - a.tenants);

    // Geographic distribution
    const regionCounts = await controlDb.tenant.groupBy({
        by: ['region'],
        _count: { region: true }
    });
    const geographicDistribution = regionCounts.map((r: any) => ({
        region: r.region,
        count: r._count.region,
        percentage: totalTenants > 0 ? Math.round((r._count.region / totalTenants) * 100) : 0
    })).sort((a: any, b: any) => b.count - a.count);

    // System usage from TenantUsage
    const usageRecords = await controlDb.tenantUsage.findMany({
        orderBy: { date: 'desc' },
        take: 30
    });
    
    const totalStorage = usageRecords.reduce((acc: number, r: any) => acc + Number(r.storageUsedMb || 0), 0);
    const totalApiCalls = usageRecords.reduce((acc: number, r: any) => acc + (r.apiCallsCount || 0), 0);
    const avgActiveUsers = usageRecords.length > 0 
        ? usageRecords.reduce((acc: number, r: any) => acc + (r.activeUsers || 0), 0) / usageRecords.length 
        : 0;

    const usageMap: Record<string, any> = {};
    usageRecords.forEach((u: any) => {
        usageMap[u.date.toISOString().slice(0, 10)] = { 
            storage: u.storageUsedMb, 
            apiCalls: u.apiCallsCount,
            users: u.activeUsers 
        };
    });

    return {
        kpis: {
            totalTenants,
            activeTenants,
            suspendedTenants,
            totalUsers,
            totalPatients,
            monthlyRevenue: `$${monthlyRevenue.toLocaleString()}`,
            revenueGrowth: '+12%', // Calculate from previous period
            avgResponseTime: '142ms',
            uptime: '99.85%',
        },
        tenantGrowth,
        revenueByMonth,
        moduleAdoption,
        geographicDistribution,
        usageStats: {
            totalStorage: `${(totalStorage / 1024).toFixed(1)} TB`,
            apiCalls24h: `${Math.round(totalApiCalls / 30).toLocaleString()}`,
            avgLatency: '142ms',
            errorRate: '0.02%',
            activeSessions: Math.round(avgActiveUsers),
            peakConcurrent: Math.round(avgActiveUsers * 1.5),
            dataTransfer24h: '450 GB',
            cacheHitRate: '94.5%',
        }
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
