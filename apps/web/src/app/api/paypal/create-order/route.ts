import { getOrdersController } from '@/lib/paypal';
import { CheckoutPaymentIntent } from '@paypal/paypal-server-sdk';
import { getTenantDb } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { invoiceId, tenantId } = body;

        if (!invoiceId || !tenantId) {
            return NextResponse.json({ error: 'Missing invoiceId or tenantId' }, { status: 400 });
        }

        const tenantDb = await getTenantDb(tenantId);
        
        const invoice = await tenantDb.invoice.findUnique({
            where: { id: invoiceId }
        });

        if (!invoice) {
            return NextResponse.json({ error: 'Invoice not found' }, { status: 404 });
        }

        if (invoice.balanceDue.toNumber() <= 0) {
            return NextResponse.json({ error: 'Balance already cleared' }, { status: 400 });
        }

        const ordersController = await getOrdersController();
        const { body: order, statusCode } = await ordersController.createOrder({
            body: {
                intent: CheckoutPaymentIntent.Capture,
                purchaseUnits: [
                    {
                        referenceId: invoiceId,
                        amount: {
                            currencyCode: 'USD',
                            value: invoice.balanceDue.toNumber().toFixed(2)
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
