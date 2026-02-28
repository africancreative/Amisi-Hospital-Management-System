import { NextRequest, NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db';
import { ControlClient, TenantClient } from '@amisi/database';
import crypto from 'crypto';

const controlDb = new ControlClient();

/**
 * Bi-Directional Sync API
 */

// GET: Pull deltas from Cloud to Edge
export async function GET(req: NextRequest) {
    const tenantId = req.headers.get('x-resolved-tenant-id');
    if (!tenantId) return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });

    const { searchParams } = new URL(req.url);
    const lastId = searchParams.get('lastId') || '';

    try {
        const tenantDb = await getTenantDb();

        // Find events that haven't been synced to this specific edge yet
        // In this MVP, we use the EventJournal as the source of truth
        const deltas = await tenantDb.eventJournal.findMany({
            where: {
                timestamp: { gt: new Date(Date.now() - 24 * 60 * 60 * 1000) }, // Last 24h
                id: { gt: lastId },
            },
            orderBy: { id: 'asc' },
            take: 100
        });

        return NextResponse.json({ deltas });
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
        const tenant = await controlDb.tenant.findUnique({ where: { id: tenantId } });

        if (!tenant || !tenant.publicKeySpki) {
            return NextResponse.json({ error: 'Tenant sync not initialized' }, { status: 403 });
        }

        const acceptedIds: string[] = [];
        const conflicts: any[] = [];
        const tenantDb = await getTenantDb();

        // Process batch in a transaction
        await tenantDb.$transaction(async (tx) => {
            for (const event of batch) {
                // 1. Verify Signature
                const message = `${event.entityType}:${event.entityId}:${event.action}:${JSON.stringify(event.payload)}`;
                const isValid = crypto.verify(
                    null,
                    Buffer.from(message),
                    {
                        key: tenant.publicKeySpki!,
                        format: 'pem',
                        type: 'spki'
                    },
                    Buffer.from(event.signature, 'hex')
                );

                if (!isValid) {
                    throw new Error(`Invalid signature for event ${event.id}`);
                }

                // 2. Conflict Resolution
                if (event.entityType === 'FinancialRecord') {
                    // Check for duplicates
                    const existing = await tx.financialRecord.findUnique({ where: { id: event.entityId } });
                    if (existing) {
                        conflicts.push({ id: event.entityId, reason: 'IMMUTABLE_DUPLICATE_REJECTED' });
                        continue;
                    }
                }

                if (event.entityType === 'Encounter') {
                    const existing = await (tx as any).encounter.findUnique({ where: { id: event.entityId } });
                    if (existing && existing.version >= event.payload.version) {
                        // Mark as conflict pending manual merge
                        await (tx as any).encounter.update({
                            where: { id: event.entityId },
                            data: {
                                conflictStatus: 'PENDING_MERGE',
                                conflictData: event.payload
                            }
                        });
                        conflicts.push({ id: event.entityId, reason: 'CLINICAL_CONFLICT_PENDING' });
                        continue;
                    }
                }

                // 3. Apply Change
                // This is a simplified apply logic for the MVP
                // In a full implementation, this would dynamically route to entity handlers
                try {
                    const model = (tx as any)[event.entityType.charAt(0).toLowerCase() + event.entityType.slice(1)];
                    if (event.action === 'CREATE') {
                        await model.create({ data: { ...event.payload, isSynced: true } });
                    } else if (event.action === 'UPDATE') {
                        await model.update({
                            where: { id: event.entityId },
                            data: { ...event.payload, isSynced: true }
                        });
                    }
                    acceptedIds.push(event.id);
                } catch (e: any) {
                    console.error(`Apply failed for ${event.id}:`, e);
                }
            }
        });

        return NextResponse.json({ acceptedIds, conflicts });
    } catch (error: any) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
