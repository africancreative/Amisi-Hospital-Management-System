'use server';

import { getControlDb } from '@/lib/db';
import { TenantClient } from '@amisimedos/db/client';
import { ensureSuperAdmin } from '@/lib/auth-utils';

export type GlobalAuditEntry = {
    id: string;
    tenantName: string;
    actorName: string;
    actorRole: string;
    action: string;
    resource: string;
    resourceId?: string;
    timestamp: string;
    ipAddress?: string;
    isVerified: boolean;
};

/**
 * Aggregates high-priority audit logs from all active hospital tenants.
 */
export async function getGlobalAuditLogs(): Promise<GlobalAuditEntry[]> {
    await ensureSuperAdmin();
    const controlDb = getControlDb();
    
    // 1. Fetch all active tenants
    const tenants = await controlDb.tenant.findMany({
        where: { status: 'active' },
        select: { id: true, name: true, dbUrl: true }
    });

    const allLogs: GlobalAuditEntry[] = [];

    // 2. Fetch logs from each tenant (Parallel with limit to avoid connection exhaustion)
    const logPromises = tenants.map(async (tenant) => {
        try {
            // Instantiate a dynamic client for this tenant
            const tenantDb = new TenantClient({
                datasources: { db: { url: tenant.dbUrl } }
            });

            const logs = await (tenantDb as any).auditLog.findMany({
                orderBy: { timestamp: 'desc' },
                take: 10
            });

            await tenantDb.$disconnect();

            return logs.map((log: any) => ({
                id: log.id,
                tenantName: tenant.name,
                actorName: log.actorName,
                actorRole: log.actorRole,
                action: log.action,
                resource: log.resource,
                resourceId: log.resourceId || undefined,
                timestamp: log.timestamp.toISOString(),
                ipAddress: log.ipAddress || undefined,
                isVerified: !!log.hash // Simple verification for MVP
            }));
        } catch (error) {
            console.error(`[Audit] Failed to fetch logs for tenant ${tenant.name}:`, error);
            return [];
        }
    });

    const results = await Promise.all(logPromises);
    results.forEach((logs: GlobalAuditEntry[]) => allLogs.push(...logs));

    // 3. Sort globally by timestamp
    return allLogs.sort((a, b) => 
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
}

/**
 * Returns security summary for the platform dashboard.
 */
export async function getSecuritySummary(): Promise<any> {
    await ensureSuperAdmin();
    const logs = await getGlobalAuditLogs();
    
    return {
        totalEvents: logs.length,
        highRiskEvents: logs.filter((l: any) => ['EXPORT', 'DELETE'].includes(l.action)).length,
        unverifiedCount: logs.filter((l: any) => !l.isVerified).length,
        latestEvent: logs[0]
    };
}
