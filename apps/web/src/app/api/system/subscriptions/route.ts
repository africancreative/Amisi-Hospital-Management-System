import { NextResponse } from 'next/server';
import { getControlDb } from '@/lib/db';
import { ensureSuperAdmin } from '@/lib/auth-utils';

export async function GET() {
  try {
    await ensureSuperAdmin();
    const db = getControlDb();

    const subscriptions = await db.subscription.findMany({
      include: {
        plan: true,
        tenant: {
          select: { id: true, name: true, slug: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    const transformed = subscriptions.map((sub: any) => ({
      id: sub.id,
      tenantId: sub.tenantId,
      tenantName: sub.tenant?.name || 'Unknown',
      planName: sub.plan?.name || 'N/A',
      planPrice: Number(sub.plan?.price) || 0,
      status: sub.status,
      startDate: sub.startDate,
      endDate: sub.endDate,
      autoRenew: sub.autoRenew,
      tenantSlug: sub.tenant?.slug || '',
    }));

    return NextResponse.json(transformed);
  } catch (error: any) {
    console.error('Failed to fetch subscriptions:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
