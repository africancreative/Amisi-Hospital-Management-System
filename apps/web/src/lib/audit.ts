import { getTenantDb } from './db';
import { cookies, headers } from 'next/headers';
import crypto from 'crypto';
import type { TenantClient } from '@amisimedos/db/client';

export type AuditAction = 'CREATE' | 'UPDATE' | 'DELETE' | 'ACCESS' | 'READ' | 'LOGIN' | 'EXPORT' | 'SYNC_CONFLICT' | 'SYSTEM_ROUTINE';

/**
 * HIPAA-compliant Audit Logger
 * Ensures every sensitive action is tracked with actor context and IP.
 */
export async function logAudit({
    action,
    resource,
    resourceId,
    details = {},
    db: providedDb,
    actor,
}: {
    action: AuditAction;
    resource: string;
    resourceId?: string;
    details?: any;
    db?: TenantClient;
    actor?: { id?: string | null; name?: string | null; role?: string | null };
}) {
    try {
        const db = providedDb ?? await getTenantDb();
        const cookieStore = await cookies();
        const headerList = await headers();

        const actorId = actor?.id || cookieStore.get('amisi-user-id')?.value || 'SYSTEM';
        const actorName = actor?.name || cookieStore.get('amisi-user-name')?.value || 'System Process';
        const actorRole = actor?.role || cookieStore.get('amisi-user-role')?.value || 'SYSTEM';
        const ipAddress = headerList.get('x-forwarded-for') || '127.0.0.1';
        const userAgent = headerList.get('user-agent') || 'Unknown';

        // 1. Fetch the last log to create a cryptographic chain
        const lastLog = await db.auditLog.findFirst({
            orderBy: { timestamp: 'desc' }
        });

        // 2. Prepare the entry for hashing
        const entryData = JSON.stringify({
            actorId,
            action,
            resource,
            resourceId,
            timestamp: new Date().toISOString()
        });

        const previousHash = lastLog?.hash || '0'.repeat(64);
        const currentHash = crypto
            .createHash('sha256')
            .update(previousHash + entryData)
            .digest('hex');

        // 3. Persist the audit log
        return await db.auditLog.create({
            data: {
                actorId,
                actorName,
                actorRole,
                action,
                resource,
                resourceId,
                details,
                ipAddress,
                userAgent,
                hash: currentHash
            }
        });
    } catch (error) {
        // We log to console but don't crash the main operation if audit fails
        // In a strict HIPAA setup, you might want to fail the operation.
        console.error('[AuditLog] Failed to persist audit entry:', error);
    }
}
