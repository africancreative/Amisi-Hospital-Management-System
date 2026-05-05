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

// Route → allowed roles (enforced at middleware, before any Server Component)
const DOMAIN_ROLE_MAP: Record<string, string[]> = {
    '/emr':        ['DOCTOR', 'NURSE', 'ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'ADMISSIONS'],
    '/patients':   ['DOCTOR', 'NURSE', 'ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST', 'ADMISSIONS'],
    '/billing':    ['ACCOUNTANT', 'ADMIN', 'SUPER_ADMIN', 'RECEPTIONIST'],
    '/lab':        ['LAB_TECH', 'PATHOLOGIST', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN'],
    '/pharmacy':   ['PHARMACIST', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN'],
    '/inventory':  ['PHARMACIST', 'PROCUREMENT_MANAGER', 'INVENTORY_CLERK', 'ADMIN', 'SUPER_ADMIN'],
    '/hr':         ['HR', 'HR_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
    '/accounting': ['ACCOUNTANT', 'AUDITOR', 'ADMIN', 'SUPER_ADMIN'],
    '/wards':      ['NURSE', 'NURSE_MANAGER', 'ICU_NURSE', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN'],
    '/icu':        ['ICU_NURSE', 'DOCTOR', 'ANESTHESIOLOGIST', 'ADMIN', 'SUPER_ADMIN'],
    '/surgery':    ['SURGEON', 'ANESTHESIOLOGIST', 'OT_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
    '/radiology':  ['RADIOGRAPHER', 'RADIOLOGIST', 'DOCTOR', 'ADMIN', 'SUPER_ADMIN'],
    '/settings':   ['ADMIN', 'SUPER_ADMIN'],
    '/users':      ['ADMIN', 'SUPER_ADMIN'],
    '/chat':       ['DOCTOR', 'NURSE', 'PHARMACIST', 'LAB_TECH', 'ACCOUNTANT', 'HR', 'HR_MANAGER',
                    'ICU_NURSE', 'ONCOLOGY_NURSE', 'RADIOGRAPHER', 'RADIOLOGIST', 'RECEPTIONIST',
                    'PATHOLOGIST', 'PROCUREMENT_MANAGER', 'INVENTORY_CLERK', 'ADMISSIONS',
                    'NURSE_MANAGER', 'HIM_OFFICER', 'AUDITOR', 'SURGEON', 'ANESTHESIOLOGIST',
                    'OT_MANAGER', 'ADMIN', 'SUPER_ADMIN'],
};

const ADMIN_REDIRECT_MAP: Record<string, string> = {
  '/admin/analytics': '/system/analytics',
  '/admin/security': '/system/settings',
  '/admin/settings': '/system/settings',
  '/admin/hospitals': '/system/tenants',
  '/admin/hospitals/onboard': '/system/tenants/new',
  '/admin/events': '/system/audit',
  '/admin/users': '/system/users',
};

export function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 0. Redirect legacy /admin routes to /system
    if (pathname === '/admin' || pathname === '/admin/') {
        return NextResponse.redirect(new URL('/system/dashboard', request.url));
    }
    if (ADMIN_REDIRECT_MAP[pathname]) {
        return NextResponse.redirect(new URL(ADMIN_REDIRECT_MAP[pathname], request.url));
    }
    if (pathname.startsWith('/admin/')) {
        const subpath = pathname.replace('/admin/', '');
        return NextResponse.redirect(new URL(`/system/${subpath}`, request.url));
    }

    // 1. Resolve Tenant context from path or session
    const pathParts = pathname.split('/').filter(Boolean);
    const slug = pathParts[0];
    
    const cookieStore = request.cookies;
    const userRole = cookieStore.get('amisi-user-role')?.value;
    const isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';

    // 2. Public Exception Paths
    const publicPaths = ['/login', '/system/login', '/lockout', '/api/auth', '/api/tenant/license', '/api/health', '/setup'];
    if (pathname === '/' || publicPaths.some((path: any) => pathname.startsWith(path))) {
        if (pathname === '/' && process.env.NEXT_PUBLIC_IS_LOCAL_EDGE_NODE === 'true') {
            const edgeTenant = process.env.NEXT_PUBLIC_EDGE_TENANT_ID;
            if (edgeTenant) {
                return NextResponse.redirect(new URL(`/${edgeTenant}/login`, request.url));
            }
            // First run on edge node -> setup wizard
            return NextResponse.redirect(new URL(`/setup`, request.url));
        }
        return NextResponse.next();
    }

    // 3. System Admin paths
    if (pathname.startsWith('/system') || pathname.startsWith('/hospitals')) {
        // Enforce CIA Triad Edge Restrict: Block SaaS features on Edge distributions
        // Exception: Allow access during local dev server execution
        if (process.env.NODE_ENV !== 'development' && process.env.NEXT_PUBLIC_IS_LOCAL_EDGE_NODE === 'true') {
            const edgeTenant = process.env.NEXT_PUBLIC_EDGE_TENANT_ID;
            if (edgeTenant) {
                return NextResponse.redirect(new URL(`/${edgeTenant}/login`, request.url));
            }
            return NextResponse.redirect(new URL(`/login`, request.url));
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

        // ── RBAC enforcement ─────────────────────────────────────────────────
        // Determine which sub-module is being accessed: /{slug}/{module}/...
        const modulePath = pathParts.length >= 2 ? `/${pathParts[1]}` : '/';
        const allowedRoles = DOMAIN_ROLE_MAP[modulePath];

        if (allowedRoles) {
            // Must be authenticated to access any role-gated module
            if (!userRole) {
                return NextResponse.redirect(new URL(`/${slug}/login`, request.url));
            }
            // Role not permitted → forbidden page (does NOT leak route existence)
            if (!allowedRoles.includes(userRole)) {
                return NextResponse.redirect(new URL(`/${slug}/unauthorized`, request.url));
            }
        } else if (!userRole && modulePath !== '/') {
            // Any non-root tenant path requires authentication
            return NextResponse.redirect(new URL(`/${slug}/login`, request.url));
        }
        // ─────────────────────────────────────────────────────────────────────

        const response = NextResponse.next();

        // Inject routing metadata so Server Components know mode (CLOUD vs EDGE)
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
