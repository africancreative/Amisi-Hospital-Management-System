import { NextRequest, NextResponse } from 'next/server';
import { getControlDb, getTenantDb } from '@/lib/db';
import { resolveSemanticConflict } from '@amisimedos/sync/resolver';
import { verifyPassword } from '@amisimedos/auth';
import crypto from 'crypto';
import { writeFile } from "fs/promises";
import path from "path";
import { v4 as uuidv4 } from "uuid";
import { getOrdersController } from '@/lib/paypal';
import { CheckoutPaymentIntent } from '@paypal/paypal-server-sdk';

// ─── JWT helpers (zero-dep, Node crypto) ────────────────────────────────────
function b64url(buf: Buffer | string): string {
    const s = typeof buf === 'string' ? buf : buf.toString('base64');
    return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function signJwt(payload: Record<string, unknown>, secret: string, expiresInSec = 86400 * 7): string {
    const header  = b64url(Buffer.from(JSON.stringify({ alg: 'HS256', typ: 'JWT' })).toString('base64'));
    const body    = b64url(Buffer.from(JSON.stringify({ ...payload, iat: Math.floor(Date.now()/1000), exp: Math.floor(Date.now()/1000) + expiresInSec })).toString('base64'));
    const sig     = b64url(crypto.createHmac('sha256', secret).update(`${header}.${body}`).digest('base64'));
    return `${header}.${body}.${sig}`;
}
function verifyJwt(token: string, secret: string): Record<string, unknown> | null {
    try {
        const [h, b, s] = token.split('.');
        const expectedSig = b64url(crypto.createHmac('sha256', secret).update(`${h}.${b}`).digest('base64'));
        if (s !== expectedSig) return null;
        const payload = JSON.parse(Buffer.from(b, 'base64').toString());
        if (payload.exp && payload.exp < Math.floor(Date.now()/1000)) return null;
        return payload;
    } catch { return null; }
}

// Use singleton pattern to prevent connection pool exhaustion
const controlDb = getControlDb();

export async function GET(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }): Promise<Response | NextResponse> {
    const resolvedParams = await params;
    const pathSegments = resolvedParams.path || [];
    const fullPath = pathSegments.join('/');

    // 0. Health Check (no auth required)
    if (fullPath === 'api/health') {
        try {
            // Quick DB check
            await getControlDb().$queryRaw`SELECT 1`;
            return NextResponse.json({ status: 'ok', timestamp: new Date().toISOString() });
        } catch (error: any) {
            return NextResponse.json({ status: 'error', message: error.message }, { status: 503 });
        }
    }

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

            const serializedDeltas = deltas.map((d: any) => ({
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

    // 4. Fetch Encounter Chat Messages
    if (fullPath === 'chat/encounter/messages') {
        const tenantId = req.headers.get('x-resolved-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });

        const { searchParams } = new URL(req.url);
        const encounterId = searchParams.get('encounterId');
        if (!encounterId) return NextResponse.json({ error: 'Encounter ID required' }, { status: 400 });

        try {
            const tenantDb = await getTenantDb(tenantId);
            const messages = await tenantDb.encounterChat.findMany({
                where: { encounterId },
                orderBy: { createdAt: 'asc' }
            });
            return NextResponse.json({ messages });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ path?: string[] }> }): Promise<Response | NextResponse> {
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

    // ── Auth: Login (tenant staff OR system admin) ─────────────────────────
    if (fullPath === 'auth/login') {
        try {
            const { email, password, slug } = await req.json();
            if (!email || !password) {
                return NextResponse.json({ error: 'Email and password required' }, { status: 400 });
            }
            const JWT_SECRET = process.env.JWT_SECRET || 'demo-secret-key-change-me';

            // System Admin login (no slug)
            if (!slug) {
                const admin = await controlDb.systemAdmin.findUnique({ where: { email } });
                if (!admin) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
                const valid = await verifyPassword(password, admin.passwordHash);
                if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

                const token = signJwt({ id: admin.id, name: admin.name, role: 'SYSTEM_ADMIN', email: admin.email }, JWT_SECRET);
                const res = NextResponse.json({ token, user: { id: admin.id, name: admin.name, role: 'SYSTEM_ADMIN', email: admin.email } });
                res.cookies.set('amisi-user-role',        'SYSTEM_ADMIN', { httpOnly: true, path: '/', maxAge: 86400 * 7 });
                res.cookies.set('amisi-user-id',           admin.id,       { httpOnly: true, path: '/', maxAge: 86400 * 7 });
                res.cookies.set('amisi-user-name',         admin.name,     { httpOnly: true, path: '/', maxAge: 86400 * 7 });
                res.cookies.set('amisi-is-system-admin',  'true',         { httpOnly: true, path: '/', maxAge: 86400 * 7 });
                return res;
            }

            // Tenant staff login
            const tenant = await controlDb.tenant.findUnique({ where: { slug } });
            if (!tenant || tenant.status !== 'active') {
                return NextResponse.json({ error: 'Hospital not found or suspended' }, { status: 404 });
            }
            const tenantDb = await getTenantDb(tenant.id);
            const employee = await tenantDb.employee.findUnique({ where: { email } });
            if (!employee?.passwordHash) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });

            const valid = await verifyPassword(password, employee.passwordHash);
            if (!valid) return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
            if (employee.status !== 'ACTIVE') {
                return NextResponse.json({ error: `Account ${employee.status.toLowerCase()}. Contact your administrator.` }, { status: 403 });
            }

            const user = { id: employee.id, name: `${employee.firstName} ${employee.lastName}`, role: employee.role as string, email: employee.email, slug, tenantId: tenant.id };
            const token = signJwt(user, JWT_SECRET);
            const res = NextResponse.json({ token, user });
            const cookieOpts = { httpOnly: true, path: '/', maxAge: 86400 * 7 };
            res.cookies.set('amisi-user-role',   user.role,   cookieOpts);
            res.cookies.set('amisi-user-id',      user.id,     cookieOpts);
            res.cookies.set('amisi-user-name',    user.name,   cookieOpts);
            res.cookies.set('amisi-tenant-id',    tenant.id,   cookieOpts);
            res.cookies.set('amisi-tenant-slug',  slug,        cookieOpts);
            return res;

        } catch (err: any) {
            console.error('[Auth] Login error:', err.message);
            return NextResponse.json({ error: 'Authentication failed' }, { status: 500 });
        }
    }

    // ── Chat: Post Message ──────────────────────────────────────────────────
    if (fullPath === 'chat/encounter/message') {
        const tenantId = req.headers.get('x-resolved-tenant-id');
        if (!tenantId) return NextResponse.json({ error: 'Tenant context missing' }, { status: 400 });

        try {
            const { encounterId, senderId, senderName, senderRole, content, messageType, referenceType, referenceId, attachmentUrl } = await req.json();
            if (!encounterId || !content) return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });

            const tenantDb = await getTenantDb(tenantId);
            const message = await tenantDb.encounterChat.create({
                data: {
                    encounterId,
                    senderId,
                    senderName,
                    senderRole,
                    content,
                    messageType: messageType || 'TEXT',
                    referenceType,
                    referenceId,
                    attachmentUrl
                }
            });
            return NextResponse.json({ message });
        } catch (error: any) {
            return NextResponse.json({ error: error.message }, { status: 500 });
        }
    }

    // ── Auth: Logout ────────────────────────────────────────────────────────
    if (fullPath === 'auth/logout') {
        const res = NextResponse.json({ ok: true });
        ['amisi-user-role','amisi-user-id','amisi-user-name','amisi-tenant-id','amisi-tenant-slug','amisi-is-system-admin']
            .forEach(name => res.cookies.set(name, '', { httpOnly: true, path: '/', maxAge: 0 }));
        return res;
    }

    return NextResponse.json({ error: 'Not Found' }, { status: 404 });
}
