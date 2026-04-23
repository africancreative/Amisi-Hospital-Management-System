import { NextRequest, NextResponse } from 'next/server';
import { getControlDb, getTenantDb } from '@/lib/db';
import { ControlClient } from '@amisimedos/db/client';
import { resolveSemanticConflict } from '@amisimedos/sync/resolver';
import crypto from 'crypto';
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getOrdersController } from '@/lib/paypal';
import { CheckoutPaymentIntent } from '@paypal/paypal-server-sdk';

const controlDb = new ControlClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const fullPath = pathSegments.join('/');

    // 1. Sync Pull
    if (fullPath === 'sync') {
        const tenantId = req.headers.get('x-resolved-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });

        const { searchParams } = new URL(req.url);
        const lastSequence = BigInt(searchParams.get('lastSequence') || '0');

        try {
            const tenantDb = await getTenantDb(tenantId);
            const deltas = await tenantDb.eventJournal.findMany({
                where: { sequenceNumber: { gt: lastSequence } },
                orderBy: { sequenceNumber: 'asc' },
                take: 100
            });

            const serializedDeltas = deltas.map(d => ({
                ...d,
                sequenceNumber: d.sequenceNumber.toString()
            }));

            return NextResponse.json({ deltas: serializedDeltas });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    // 1b. Sync Bootstrap
    if (fullPath === 'sync/bootstrap') {
        const tenantId = req.headers.get('x-resolved-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });

        try {
            const tenantDb = await getTenantDb(tenantId);
            const lastEvent = await tenantDb.eventJournal.findFirst({ orderBy: { sequenceNumber: 'desc' }, select: { sequenceNumber: true } });
            const checkpointSequence = lastEvent?.sequenceNumber?.toString() || '0';

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
                dispensingRecord: await tenantDb.dispensingRecord.findMany({ take: 2000 }),
            };

            return NextResponse.json({ checkpointSequence, snapshot });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    // 2. Tenant License
    if (fullPath === 'tenant/license') {
        const { searchParams } = new URL(req.url);
        const slug = searchParams.get("slug");
        if (!slug) return NextResponse.json({ error: "Slug required" }, { status: 400 });

        const tenant = await controlDb.tenant.findUnique({
            where: { slug },
            select: { id: true, name: true, status: true, logoUrl: true, primaryColor: true, secondaryColor: true, trialEndsAt: true, tier: true },
        });

        if (!tenant) return NextResponse.json({ error: "Hospital not found" }, { status: 404 });
        return NextResponse.json(tenant);
    }

    // 3. Tenant Status
    if (fullPath === 'tenant/status') {
        const { searchParams } = new URL(req.url);
        const tenantId = searchParams.get('tenantId');
        if (!tenantId) return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });

        const tenant = await controlDb.tenant.findUnique({
            where: { id: tenantId },
            select: { status: true, suspensionReason: true }
        });

        if (!tenant) return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        return NextResponse.json({ status: tenant.status, suspensionReason: tenant.suspensionReason });
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }) {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const fullPath = pathSegments.join('/');

    // 1. Sync Push
    if (fullPath === 'sync') {
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

            for (const event of batch) {
                try {
                    const message = `${event.entityType}:${event.entityId}:${event.action}:${JSON.stringify(event.payload)}`;
                    const expectedSignature = crypto.createHmac('sha256', tenant.sharedSecret!).update(message).digest('hex');

                    if (expectedSignature !== event.signature) continue;

                    const modelName = event.entityType.charAt(0).toLowerCase() + event.entityType.slice(1);
                    if (!(tenantDb as any)[modelName]) continue;

                    await tenantDb.$transaction(async (tx) => {
                        const existing = await (tx as any)[modelName].findUnique({ where: { id: event.entityId } });
                        if (existing) {
                            const resolvedData = resolveSemanticConflict(
                                { id: existing.id, version: existing.version, data: existing, timestamp: existing.updatedAt },
                                { id: event.entityId, version: event.payload.version, data: event.payload, timestamp: new Date(event.timestamp) }
                            );
                            await (tx as any)[modelName].update({ where: { id: event.entityId }, data: { ...resolvedData, isSynced: true } });
                        } else {
                            await (tx as any)[modelName].create({ data: { ...event.payload, isSynced: true } });
                        }
                    });
                    acceptedIds.push(event.id);
                } catch (e) {}
            }
            return NextResponse.json({ acceptedIds });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    // 2. System Upload
    if (fullPath === 'system/upload') {
        try {
            const formData = await req.formData();
            const file = formData.get("file") as File;
            if (!file) return NextResponse.json({ error: "No file uploaded" }, { status: 400 });

            const bytes = await file.arrayBuffer();
            const buffer = Buffer.from(bytes);
            const ext = path.extname(file.name);
            const filename = `${uuidv4()}${ext}`;
            const uploadDir = path.join(process.cwd(), "public/uploads");
            await writeFile(path.join(uploadDir, filename), buffer);
            return NextResponse.json({ url: `/uploads/${filename}` });
        } catch (error) {
            return NextResponse.json({ error: "Upload failed" }, { status: 500 });
        }
    }

    // 3. PayPal Create Order
    if (fullPath === 'paypal/create-order') {
        try {
            const { invoiceId, tenantId } = await req.json();
            const tenantDb = await getTenantDb(tenantId);
            const invoice = await tenantDb.invoice.findUnique({ where: { id: invoiceId } });
            if (!invoice) return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });

            const ordersController = await getOrdersController();
            const { body: order, statusCode } = await ordersController.createOrder({
                body: {
                    intent: CheckoutPaymentIntent.Capture,
                    purchaseUnits: [{ referenceId: invoiceId, amount: { currencyCode: 'USD', value: invoice.balanceDue.toNumber().toFixed(2) } }]
                }
            });
            return NextResponse.json(typeof order === 'string' ? JSON.parse(order) : order, { status: statusCode });
        } catch (error) {
            return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 });
        }
    }

    // 4. PayPal Capture Order
    if (fullPath === 'paypal/capture-order') {
        try {
            const { orderID, invoiceId, tenantId } = await req.json();
            const ordersController = await getOrdersController();
            const { body: capturedOrder, statusCode } = await ordersController.captureOrder({ id: orderID, prefer: 'return=minimal' });
            const parsedCapture = typeof capturedOrder === 'string' ? JSON.parse(capturedOrder) : capturedOrder;

            if (parsedCapture.status === 'COMPLETED') {
                const capturedAmountValue = parsedCapture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
                if (!capturedAmountValue) return NextResponse.json({ error: 'Failed to read capture amount' }, { status: 500 });
                const capturedFloat = parseFloat(capturedAmountValue);

                if (tenantId === 'system') {
                    await controlDb.systemPayment.create({
                        data: { amount: capturedFloat, method: 'PAYPAL', status: 'COMPLETED', reference: orderID, 
                                customerEmail: parsedCapture.payer?.email_address || 'unknown',
                                customerName: `${parsedCapture.payer?.name?.given_name || ''} ${parsedCapture.payer?.name?.surname || ''}`.trim() || 'Anonymous',
                                description: `Onboarding Setup Fee (${invoiceId})` }
                    });
                } else {
                    const tenantDb = await getTenantDb(tenantId);
                    const record = await tenantDb.invoice.findUnique({ where: { id: invoiceId } });
                    if (record) {
                        const newBalance = record.balanceDue.toNumber() - capturedFloat;
                        await tenantDb.$transaction([
                            tenantDb.invoice.update({ where: { id: invoiceId }, data: { balanceDue: Math.max(0, newBalance), status: newBalance <= 0 ? 'PAID' : 'PARTIAL' } }),
                            tenantDb.payment.create({ data: { invoiceId, amount: capturedFloat, method: 'paypal', reference: orderID } })
                        ]);
                    }
                }
            }
            return NextResponse.json(parsedCapture, { status: statusCode });
        } catch (error) {
            return NextResponse.json({ error: 'Failed to capture order.' }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}
