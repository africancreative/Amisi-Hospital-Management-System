import { getOrdersController } from '@/lib/paypal';
import { CheckoutPaymentIntent } from '@paypal/paypal-server-sdk';
import { getTenantDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { financialRecordId, tenantId } = body;

        if (!financialRecordId || !tenantId) {
            return NextResponse.json({ error: 'Missing financialRecordId or tenantId' }, { status: 400 });
        }

        const tenantDb = await getTenantDb(tenantId);
        
        const financialRecord = await tenantDb.financialRecord.findUnique({
            where: { id: financialRecordId }
        });

        if (!financialRecord) {
            return NextResponse.json({ error: 'FinancialRecord not found' }, { status: 404 });
        }

        if (financialRecord.balanceDue.toNumber() <= 0) {
            return NextResponse.json({ error: 'Balance already cleared' }, { status: 400 });
        }

        const ordersController = await getOrdersController();
        const { body: order, statusCode } = await ordersController.createOrder({
            body: {
                intent: CheckoutPaymentIntent.Capture,
                purchaseUnits: [
                    {
                        referenceId: financialRecordId,
                        amount: {
                            currencyCode: 'USD',
                            value: financialRecord.balanceDue.toNumber().toFixed(2)
                        }
                    }
                ]
            }
        });

        const parsedOrder = typeof order === 'string' ? JSON.parse(order) : order;
        return NextResponse.json(parsedOrder, { status: statusCode });
    } catch (error) {
        console.error('Failed to create order:', error);
        return NextResponse.json({ error: 'Failed to create order.' }, { status: 500 });
    }
}
