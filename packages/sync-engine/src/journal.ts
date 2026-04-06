import type { PrismaClient } from '@amisi/database';
import crypto from 'crypto';

const SECRET_KEY = process.env.SYNC_SECRET || 'amisi-edge-secret';

/**
 * Journaling service to record every mutation on both Cloud and Edge.
 * Every entry is signed using the tenant-specific shared secret.
 */
export async function recordEvent(
    db: PrismaClient,
    entityType: string,
    entityId: string,
    action: 'CREATE' | 'UPDATE' | 'DELETE',
    payload: any,
    sharedSecret: string,
    direction: 'OUTGOING' | 'INCOMING' = 'OUTGOING'
) {
    const payloadString = JSON.stringify(payload);
    
    // Use HMAC-SHA256 with the sharedSecret from Tenant Provisioning
    const signature = crypto
        .createHmac('sha256', sharedSecret)
        .update(`${entityType}:${entityId}:${action}:${payloadString}`)
        .digest('hex');

    return await db.eventJournal.create({
        data: {
            entityType,
            entityId,
            action,
            payload,
            signature,
            direction,
            timestamp: new Date()
        }
    });
}
