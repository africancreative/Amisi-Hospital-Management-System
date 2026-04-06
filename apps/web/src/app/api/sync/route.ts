import { NextRequest, NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db';
import { ControlClient, TenantClient } from '@amisi/database';
import { resolveSemanticConflict } from '../../../../../../packages/sync-engine/src/resolver';
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
        const tenantDb = await getTenantDb();

        // Find all outgoing events that the edge hasn't seen yet
        const deltas = await tenantDb.eventJournal.findMany({
            where: {
                sequenceNumber: { gt: lastSequence },
                direction: 'OUTGOING'
            },
            orderBy: { sequenceNumber: 'asc' },
            take: 100
        });

        // Convert BigInt to string for JSON serialization
        const serializedDeltas = deltas.map(d => ({
            ...d,
            sequenceNumber: d.sequenceNumber.toString()
        }));

        return NextResponse.json({ deltas: serializedDeltas });
    } catch (error: any) {
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
        const conflicts: any[] = [];
        const tenantDb = await getTenantDb();

        // Process batch in a transaction
        await tenantDb.$transaction(async (tx) => {
            for (const event of batch) {
                // 1. Verify HMAC Signature using Shared Secret
                const message = `${event.entityType}:${event.entityId}:${event.action}:${JSON.stringify(event.payload)}`;
                const expectedSignature = crypto
                    .createHmac('sha256', tenant.sharedSecret!)
                    .update(message)
                    .digest('hex');

                if (expectedSignature !== event.signature) {
                    console.error(`[Sync] Signature mismatch for event ${event.id}`);
                    continue; // Skip invalid events
                }

                // 2. Clinical Reconciliation (Semantic Hybrid)
                const modelName = event.entityType.charAt(0).toLowerCase() + event.entityType.slice(1);
                const model = (tx as any)[modelName];
                
                if (!model) {
                    console.warn(`[Sync] Unknown entity type: ${event.entityType}`);
                    continue;
                }

                const existing = await model.findUnique({ where: { id: event.entityId } });

                if (existing) {
                    // RESOLVE CONFLICT
                    const resolvedData = resolveSemanticConflict(
                        { 
                            id: existing.id, 
                            version: existing.version, 
                            data: existing, 
                            timestamp: existing.updatedAt 
                        },
                        { 
                            id: event.entityId, 
                            version: event.payload.version, 
                            data: event.payload, 
                            timestamp: new Date(event.timestamp) 
                        }
                    );

                    await model.update({
                        where: { id: event.entityId },
                        data: { ...resolvedData, isSynced: true }
                    });
                } else {
                    // APPLY NEW
                    await model.create({
                        data: { ...event.payload, isSynced: true }
                    });
                }

                acceptedIds.push(event.id);
            }
        });

        return NextResponse.json({ acceptedIds, conflicts });
    } catch (error: any) {
        console.error('[Sync Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
