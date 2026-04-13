import { NextRequest, NextResponse } from 'next/server';
import { getTenantDb } from '@/lib/db';

/**
 * Sync Bootstrap API (Cloud Hub)
 * 
 * Provides a Full State Snapshot for recovering Edge nodes.
 */
export async function GET(req: NextRequest) {
    const tenantId = req.headers.get('x-resolved-tenant-id');
    if (!tenantId) {
        return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });
    }

    try {
        const tenantDb = await getTenantDb(tenantId);

        // 1. Get current checkpoint sequence
        const lastEvent = await tenantDb.eventJournal.findFirst({
            orderBy: { sequenceNumber: 'desc' },
            select: { sequenceNumber: true }
        });
        const checkpointSequence = lastEvent?.sequenceNumber?.toString() || '0';

        // 2. Extract state for core clinical tables
        // In a production environment, this would be a streamed export or a pre-signed S3 URL
        const snapshot = {
            patient: await tenantDb.patient.findMany({ take: 5000 }),
            encounter: await tenantDb.encounter.findMany({ take: 5000 }),
            visit: await tenantDb.visit.findMany({ take: 5000 }),
            invoice: await tenantDb.invoice.findMany({ take: 5000 }),
            billItem: await tenantDb.billItem.findMany({ take: 10000 }),
            inventoryItem: await tenantDb.inventoryItem.findMany(),
            inventoryBatch: await tenantDb.inventoryBatch.findMany(),
            ward: await tenantDb.ward.findMany(),
            bed: await tenantDb.bed.findMany(),
            admission: await tenantDb.admission.findMany({ where: { status: 'ADMITTED' } }),
            labOrder: await tenantDb.labOrder.findMany({ take: 2000 }),
            pharmacyDispatch: await tenantDb.pharmacyDispatch.findMany({ take: 2000 }),
        };

        return NextResponse.json({
            checkpointSequence,
            snapshot
        });
    } catch (error: any) {
        console.error('[Sync Bootstrap Error]', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
