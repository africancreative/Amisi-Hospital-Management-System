import { NextResponse } from 'next/server';
import { getControlDb } from '@/lib/db';
import { ensureSuperAdmin } from '@/lib/auth-utils';

export async function GET() {
  try {
    await ensureSuperAdmin();
    const db = getControlDb();

    const payments = await db.systemPayment.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100
    });

    const transformed = payments.map((p: any) => ({
      id: p.id,
      tenantName: p.customerEmail || 'Unknown',
      amount: Number(p.amount),
      currency: p.currency,
      method: p.method,
      status: p.status,
      reference: p.reference,
      customerEmail: p.customerEmail,
      createdAt: p.createdAt,
    }));

    return NextResponse.json(transformed);
  } catch (error: any) {
    console.error('Failed to fetch payments:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
