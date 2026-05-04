import { NextRequest, NextResponse } from 'next/server';

export async function middleware(request: NextRequest) {
  const url = request.nextUrl;
  
  // 1. Extract Tenant ID from subdomain or header
  // Example: tenant1.amisimedos.ai or X-Tenant-ID header
  const hostname = request.headers.get('host');
  const tenantId = request.headers.get('x-tenant-id');
  
  if (!tenantId && !hostname) {
    return NextResponse.json({ error: 'Missing Tenant Identification' }, { status: 400 });
  }

  // 2. Validate Tenant via Cache/DB (Simplified here)
  // In production, use Redis to verify if tenant is active and which modules are enabled
  
  // 3. Attach Tenant Context to request headers for API routes
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set('x-tenant-context', tenantId || 'default');

  return NextResponse.next({
    request: {
      headers: requestHeaders,
    },
  });
}

export const config = {
  matcher: '/api/:path*',
};
