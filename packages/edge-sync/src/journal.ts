import { TenantClient as PrismaClient } from '@amisi/database';
import crypto from 'crypto';

const SECRET_KEY = process.env.SYNC_SECRET || 'amisi-edge-secret';

/**
 * Journaling service to record every mutation on the edge.
 */
export async function recordEvent(
    db: PrismaClient,
    entityType: string,
    entityId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    payload: any
) {
    const payloadString = JSON.stringify(payload);
    const signature = crypto
        .createHmac('sha256', SECRET_KEY)
        .update(`${entityType}:${entityId}:${action}:${payloadString}`)
        .digest('hex');

    return await db.eventJournal.create({
        data: {
            entityType,
            entityId,
            action,
            payload,
            signature,
            timestamp: new Date()
        }
    });
}
