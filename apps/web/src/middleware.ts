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

    // 1. Resolve Tenant ID and User Role
    const tenantId = request.headers.get('x-tenant-id') || request.cookies.get('amisi-tenant-id')?.value;
    const userRole = request.cookies.get('amisi-user-role')?.value;
    const isSystemAdmin = request.cookies.get('amisi-is-system-admin')?.value === 'true';

    // 2. Auth Exception Paths (Allow login and static assets)
    const authPaths = ['/login', '/system/login', '/lockout'];
    if (authPaths.some(path => pathname.startsWith(path))) {
        return NextResponse.next();
    }

    // 3. Authentication Check
    if (!userRole) {
        // Redirect to appropriate login
        if (pathname.startsWith('/hospitals') || pathname.startsWith('/users')) {
            return NextResponse.redirect(new URL('/system/login', request.url));
        }
        return NextResponse.redirect(new URL('/login', request.url));
    }

    // 2. Module Guard
    const matchingModulePath = Object.keys(MODULE_ROUTE_MAP).find(path => pathname.startsWith(path));

    // 3. RBAC Guard
    const domainPath = Object.keys(DOMAIN_ROLE_MAP).find(path => pathname.startsWith(path));
    if (domainPath) {
        const allowedRoles = DOMAIN_ROLE_MAP[domainPath];
        if (!allowedRoles.includes(userRole)) {
            // Redirect to a specialized 'suspended' or 'unauthorized' page or home
            // For now, redirecting to home with a query param
            return NextResponse.redirect(new URL('/?error=unauthorized', request.url));
        }
    }

    // 4. System Admin Guard (Restrict /hospitals and /users strictly to ADMIN)
    if (pathname.startsWith('/hospitals') || pathname.startsWith('/users')) {
        if (userRole !== 'ADMIN') {
            return NextResponse.redirect(new URL('/?error=system_admin_only', request.url));
        }
    }

    // 5. Suspension Guard
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
