'use server';

import { getControlDb, getTenantDb } from '@/lib/db';
import { ensureRole, ensureSuperAdmin } from '@/lib/auth-utils';

export async function getPlatformDashboardStats() {
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

export async function getTenantDashboardStats() {
    await ensureRole(['ADMIN', 'DOCTOR', 'NURSE', 'ACCOUNTANT', 'PHARMACIST', 'LAB_TECH', 'HR']);
    const db = await getTenantDb();

    const patientCount = await db.patient.count();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayEncounters = await db.encounter.count({
        where: { createdAt: { gte: today } }
    });

    const pendingLabs = await db.labOrder.count({
        where: { status: 'pending' }
    });

    const revenue = await db.financialRecord.findMany({
        where: { status: 'paid' },
        select: { totalAmount: true }
    });

    const totalRevenue = revenue.reduce((acc, curr) => acc + Number(curr.totalAmount), 0);

    return {
        patientCount: patientCount.toString(),
        todayEncounters: todayEncounters.toString(),
        pendingLabs: pendingLabs.toString(),
        totalRevenue: new Intl.NumberFormat('en-KE', { style: 'currency', currency: 'KES' }).format(totalRevenue)
    };
}
