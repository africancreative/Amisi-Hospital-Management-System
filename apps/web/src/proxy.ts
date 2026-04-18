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

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Resolve Tenant context from path or session
    const pathParts = pathname.split('/').filter(Boolean);
    const slug = pathParts[0];
    
    const cookieStore = request.cookies;
    const userRole = cookieStore.get('amisi-user-role')?.value;
    const isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';

    // 2. Public Exception Paths
    const publicPaths = ['/login', '/system/login', '/lockout', '/api/auth'];
    if (pathname === '/' || publicPaths.some(path => pathname.startsWith(path))) {
        if (pathname === '/' && process.env.NEXT_PUBLIC_IS_LOCAL_EDGE_NODE === 'true') {
            const edgeTenant = process.env.NEXT_PUBLIC_EDGE_TENANT_ID || 'amisi-premier';
            return NextResponse.redirect(new URL(`/${edgeTenant}/login`, request.url));
        }
        return NextResponse.next();
    }

    // 3. System Admin paths
    if (pathname.startsWith('/system') || pathname.startsWith('/hospitals')) {
        // Enforce CIA Triad Edge Restrict: Block SaaS features on Edge distributions
        // Exception: Allow access during local dev server execution
        if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_IS_LOCAL_EDGE_NODE === 'true') {
            const edgeTenant = process.env.NEXT_PUBLIC_EDGE_TENANT_ID || 'amisi-premier';
            return NextResponse.redirect(new URL(`/${edgeTenant}/login`, request.url));
        }

        if (!isSystemAdmin) {
            return NextResponse.redirect(new URL('/system/login', request.url));
        }
        return NextResponse.next();
    }

    // 4. Resolve Tenant from Slug or Session
    let tenantId = request.cookies.get('amisi-tenant-id')?.value;
    
    // 5. LAN-First Detection (AmisiMedOS Edge)
    const isLocalGateway = request.headers.get('x-AmisiMedOS-gateway') === 'true';
    const clientIp = request.headers.get('x-forwarded-for') || '127.0.0.1';
    
    // If the first part of the path is NOT a system route, assume it's a potential tenant slug
    const hospitalModulePaths = ['patients', 'billing', 'lab', 'pharmacy', 'inventory', 'hr', 'accounting', 'settings', 'users'];
    
    // We treat /[slug] as a hospital route
    if (slug && !publicPaths.includes(`/${slug}`) && !pathname.startsWith('/system')) {
        const response = NextResponse.next();
        
        // Inject routing metadata for the app to decide which DB to use (Cloud vs Local)
        if (tenantId) {
            response.headers.set('x-resolved-tenant-id', tenantId);
        }
        
        if (isLocalGateway) {
            response.headers.set('x-AmisiMedOS-mode', 'EDGE');
            response.headers.set('x-AmisiMedOS-node-ip', clientIp || '127.0.0.1');
        } else {
            response.headers.set('x-AmisiMedOS-mode', 'CLOUD');
        }
        
        return response;
    }

    // Default Fallback
    if (!userRole && !pathname.startsWith('/login')) {
        return NextResponse.redirect(new URL('/', request.url));
    }

    return NextResponse.next();
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
