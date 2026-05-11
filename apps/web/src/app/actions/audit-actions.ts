'use server';

import { getControlDb } from '@/lib/db';
import { ensureSuperAdmin } from '@/lib/auth-utils';

// ─── AUDIT LOG TYPES ──────────────────────────────────────────────────────────

export type GlobalAuditEntry = {
    id: string;
    tenantId: string | null;
    tenantName: string;
    actorId: string | null;
    actorName: string;
    actorRole: string;
    action: string;
    resource: string;
    resourceId: string | null;
    details: any;
    ipAddress: string | null;
    timestamp: Date;
    isVerified: boolean;
};

// ─── AUDIT ACTIONS ────────────────────────────────────────────────────────────

/**
 * Fetches the most recent platform-level audit logs across all tenants.
 * Requires super-admin authentication.
 */
export async function getGlobalAuditLogs(limit = 100): Promise<GlobalAuditEntry[]> {
    await ensureSuperAdmin();
    const db = getControlDb();

    const logs = await db.tenantConfigAuditLog.findMany({
        take: limit,
        orderBy: { timestamp: 'desc' },
        include: { tenant: { select: { name: true } } },
    });

    return logs.map((log: any) => ({
        id: log.id,
        tenantId: log.tenantId,
        tenantName: log.tenant?.name ?? 'Platform',
        actorId: log.actorId,
        actorName: log.actorName ?? 'System',
        actorRole: log.actorRole ?? 'SYSTEM',
        action: log.action,
        resource: log.field ?? 'System',
        resourceId: null,
        details: { old: log.oldValue, new: log.newValue },
        ipAddress: log.ipAddress ?? null,
        timestamp: log.timestamp,
        isVerified: true,
    }));
}
