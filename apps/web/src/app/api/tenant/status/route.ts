import { NextResponse } from 'next/server';
import { ControlClient } from '@amisimedos/db';

const controlDb = new ControlClient();

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const tenantId = searchParams.get('tenantId');

    if (!tenantId) {
        return NextResponse.json({ error: 'Tenant ID required' }, { status: 400 });
    }

    try {
        const tenant = await controlDb.tenant.findUnique({
            where: { id: tenantId },
            select: { status: true, suspensionReason: true }
        });

        if (!tenant) {
            return NextResponse.json({ error: 'Tenant not found' }, { status: 404 });
        }

        return NextResponse.json({
            status: tenant.status,
            suspensionReason: tenant.suspensionReason
        });
    } catch (error) {
        return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
}
