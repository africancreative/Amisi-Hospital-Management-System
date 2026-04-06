import { getOrdersController } from '@/lib/paypal';
import { getTenantDb, getControlDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { orderID, financialRecordId, tenantId } = body;

        if (!orderID || !financialRecordId || !tenantId) {
            return NextResponse.json({ error: 'Missing orderID, financialRecordId or tenantId' }, { status: 400 });
        }

        const ordersController = await getOrdersController();
        const { body: capturedOrder, statusCode } = await ordersController.captureOrder({
            id: orderID,
            prefer: 'return=minimal'
        });

        const parsedCapture = typeof capturedOrder === 'string' ? JSON.parse(capturedOrder) : capturedOrder;

        if (parsedCapture.status === 'COMPLETED') {
            const capturedAmountValue = parsedCapture.purchase_units?.[0]?.payments?.captures?.[0]?.amount?.value;
            
            if (!capturedAmountValue) {
               return NextResponse.json({ error: 'Failed to read capture amount from PayPal' }, { status: 500 });
            }

            const capturedFloat = parseFloat(capturedAmountValue);

            // Handle Global System Payments (Onboarding/Setup)
            if (tenantId === 'system') {
                const controlDb = getControlDb();
                await controlDb.systemPayment.create({
                    data: {
                        amount: capturedFloat,
                        method: 'PAYPAL',
                        status: 'COMPLETED',
                        reference: orderID,
                        customerEmail: parsedCapture.payer?.email_address || 'unknown',
                        customerName: `${parsedCapture.payer?.name?.given_name || ''} ${parsedCapture.payer?.name?.surname || ''}`.trim() || 'Anonymous',
                        description: `Onboarding Setup Fee (${financialRecordId})`
                    }
                });
                return NextResponse.json(parsedCapture, { status: statusCode });
            }

            // Handle Tenant-Specific Payments (Patient Billing)
            const tenantDb = await getTenantDb(tenantId);
            const record = await tenantDb.financialRecord.findUnique({
                where: { id: financialRecordId }
            });

            if (record) {
                const newBalance = record.balanceDue.toNumber() - capturedFloat;
                const isPaid = newBalance <= 0;

                await tenantDb.$transaction([
                    tenantDb.financialRecord.update({
                        where: { id: financialRecordId },
                        data: {
                            balanceDue: Math.max(0, newBalance),
                            status: isPaid ? 'paid' : 'partial'
                        }
                    }),
                    tenantDb.payment.create({
                        data: {
                            financialRecordId: financialRecordId,
                            amount: capturedFloat,
                            method: 'paypal',
                            reference: orderID
                        }
                    })
                ]);
            }

            return NextResponse.json(parsedCapture, { status: statusCode });
        }

        return NextResponse.json(parsedCapture, { status: statusCode });
    } catch (error) {
        console.error('Failed to capture order:', error);
        return NextResponse.json({ error: 'Failed to capture order.' }, { status: 500 });
    }
}
