import { NextRequest, NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db';
import { ControlClient, TenantClient } from '@amisimedos/db/client';
import { resolveSemanticConflict } from '@amisimedos/sync/resolver';
import crypto from 'crypto';

const controlDb = new ControlClient();

/**
 * Bi-Directional Sync API (Cloud Hub)
 * Handles Edge Node push/pull orchestration.
 */

// GET: Pull deltas from Cloud to Edge
export async function GET(req: NextRequest) {
    const tenantId = req.headers.get('x-resolved-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const lastSequence = BigInt(searchParams.get('lastSequence') || '0');

    try {
        const tenantDb = await getTenantDb(tenantId);

        // Find all events that were created on Cloud OR previously synced from other edges
        // and have a sequence number higher than what the requester has
        const deltas = await tenantDb.eventJournal.findMany({
            where: {
                sequenceNumber: { gt: lastSequence },
                // Only pull events that happened on Cloud or came from other nodes
                // We don't want to send back events that the edge itself originated
                // For now, we pull all that have a Cloud-assigned sequenceNumber
            },
            orderBy: { sequenceNumber: 'asc' },
            take: 100
        });

        const serializedDeltas = deltas.map(d => ({
            ...d,
            sequenceNumber: d.sequenceNumber.toString()
        }));

        return NextResponse.json({ deltas: serializedDeltas });
    } catch (error: any) {
        console.error('[Sync Pull Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

// POST: Push deltas from Edge to Cloud
export async function POST(req: NextRequest) {
    const tenantId = req.headers.get('x-resolved-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });

    try {
        const { batch } = await req.json();
        const tenant = await controlDb.tenant.findUnique({ 
            where: { id: tenantId },
            select: { sharedSecret: true }
        });

        if (!tenant || !tenant.sharedSecret) {
            return NextResponse.json({ error: 'Tenant sync not initialized' }, { status: 403 });
        }

        const acceptedIds: string[] = [];
        const tenantDb = await getTenantDb(tenantId);

        // We process each event individually to allow partial success if needed,
        // but transactionalize the data write + journal log per-event.
        for (const event of batch) {
            try {
                // 1. Verify HMAC Signature
                const message = `${event.entityType}:${event.entityId}:${event.action}:${JSON.stringify(event.payload)}`;
                const expectedSignature = crypto
                    .createHmac('sha256', tenant.sharedSecret!)
                    .update(message)
                    .digest('hex');

                if (expectedSignature !== event.signature) {
                    console.error(`[Sync] Signature mismatch for event ${event.id}`);
                    continue; 
                }

                // 2. Application Logic with CDC suppression (optional, but extension handles it)
                const modelName = event.entityType.charAt(0).toLowerCase() + event.entityType.slice(1);
                const model = (tenantDb as any)[modelName];
                
                if (!model) continue;

                await tenantDb.$transaction(async (tx) => {
                    const existing = await (tx as any)[modelName].findUnique({ where: { id: event.entityId } });

                    if (existing) {
                        const resolvedData = resolveSemanticConflict(
                            { id: existing.id, version: existing.version, data: existing, timestamp: existing.updatedAt },
                            { id: event.entityId, version: event.payload.version, data: event.payload, timestamp: new Date(event.timestamp) }
                        );

                        await (tx as any)[modelName].update({
                            where: { id: event.entityId },
                            data: { ...resolvedData, isSynced: true }
                        });
                    } else {
                        await (tx as any)[modelName].create({
                            data: { ...event.payload, isSynced: true }
                        });
                    }

                    // On Cloud, we don't manually create a journal entry here because the
                    // Prisma Extension 'withJournaling' will automatically catch this write
                    // and record it as INCOMING/Synced=true.
                });

                acceptedIds.push(event.id);
            } catch (eventErr: any) {
                console.warn(`[Sync Post] Failed to apply event ${event.id}:`, eventErr.message);
            }
        }

        return NextResponse.json({ acceptedIds });
    } catch (error: any) {
        console.error('[Sync Push Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}

