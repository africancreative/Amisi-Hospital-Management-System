import { NextResponse } from 'next/server';
import { getControlDb } from '@/lib/db';
import { ensureSuperAdmin } from '@/lib/auth-utils';

export async function GET() {
  try {
    await ensureSuperAdmin();
    const db = getControlDb();

    // Fetch orders from SystemPayment with PENDING status
    const orders = await db.systemPayment.findMany({
      where: { status: 'PENDING' },
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const transformed = orders.map((order: any) => ({
      id: order.id,
      tenantName: order.customerEmail || 'Unknown',
      tenantSlug: '',
      planName: order.description || 'N/A',
      amount: Number(order.amount),
      status: order.status,
      type: 'NEW_SUBSCRIPTION', // Default type
      createdAt: order.createdAt,
      reference: order.reference,
    }));

    return NextResponse.json(transformed);
  } catch (error: any) {
    console.error('Failed to fetch orders:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Create new order
export async function POST(request: Request): Promise<NextResponse> {
  try {
    await ensureSuperAdmin();
    const db = getControlDb();
    const body = await request.json();
    
    const { tenantId, planId, amount, method, tenantName, type = 'NEW_SUBSCRIPTION' } = body;

    const order = await db.systemPayment.create({
      data: {
        tenantId,
        amount,
        currency: 'USD',
        method,
        status: 'PENDING',
        reference: `order_${Date.now()}`,
        customerEmail: tenantName,
        customerName: tenantName,
        description: type,
      }
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Failed to create order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

// Update order status (harness from frontend)
export async function PATCH(request: Request): Promise<NextResponse> {
  try {
    await ensureSuperAdmin();
    const db = getControlDb();
    const body = await request.json();
    
    const { orderId, status, ...updateData } = body;

    const order = await db.systemPayment.update({
      where: { id: orderId },
      data: { status, ...updateData }
    });

    return NextResponse.json({ success: true, order });
  } catch (error: any) {
    console.error('Failed to update order:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
