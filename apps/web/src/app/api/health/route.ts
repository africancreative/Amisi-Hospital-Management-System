import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

/**
 * GET /api/health
 * Simple health check endpoint used by the desktop electron app
 * and the connectivity sentinel to verify the web server is alive.
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'ok',
      service: 'amisimedos-web',
      timestamp: new Date().toISOString(),
    },
    { status: 200 }
  );
}
