import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const MODULE_ROUTE_MAP: Record<string, string> = {
    '/patients': 'EHR',
    '/billing': 'BILLING',
    '/lab': 'LAB',
    '/pharmacy': 'PHARMACY',
    '/inventory': 'INVENTORY',
    '/hr': 'HR',
    '/accounting': 'ACCOUNTING',
};

const DOMAIN_ROLE_MAP: Record<string, string[]> = {
    '/patients': ['DOCTOR', 'NURSE', 'ADMIN'],
    '/billing': ['ACCOUNTANT', 'ADMIN'],
    '/lab': ['LAB_TECH', 'DOCTOR', 'ADMIN'],
    '/pharmacy': ['PHARMACIST', 'DOCTOR', 'ADMIN'],
    '/inventory': ['PHARMACIST', 'ADMIN'],
    '/hr': ['HR', 'ADMIN'],
    '/accounting': ['ACCOUNTANT', 'ADMIN'],
};

export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Resolve Tenant ID
    const tenantId = request.headers.get('x-tenant-id') || request.cookies.get('amisi-tenant-id')?.value;

    // 2. Module Guard
    const matchingModulePath = Object.keys(MODULE_ROUTE_MAP).find(path => pathname.startsWith(path));

    // 3. Suspension Guard (Simulated/Mocked for dev, should fetch from cache/DB in prod)
    // We'll check for a header 'x-tenant-status' which would be injected by a previous layer or resolved here.
    const tenantStatus = request.headers.get('x-tenant-status');

    if (tenantStatus === 'suspended' && !pathname.startsWith('/lockout') && !pathname.startsWith('/api')) {
        return NextResponse.redirect(new URL('/lockout', request.url));
    }

    if (tenantStatus === 'suspended' && pathname.startsWith('/api')) {
        return new NextResponse(JSON.stringify({ error: 'Tenant Suspended' }), {
            status: 403,
            headers: { 'Content-Type': 'application/json' }
        });
    }

    if (matchingModulePath && tenantId) {
        // In a real production scenario, we would check a JWT or a cache (Redis)
        // For this implementation, we assume if a tenantId is present, we check their specific entitlements.
        // For demonstration, we'll allow all if it's the 'default' dev tenant, but in implementation
        // we will check the 'enabled_modules' header or similar.
    }

    const response = NextResponse.next();

    if (tenantId) {
        response.headers.set('x-resolved-tenant-id', tenantId);
    }

    return response;
}

// Ensure middleware runs on all app routes except static files
export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
