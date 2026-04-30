import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// Note: Middleware runs in the Edge Runtime. 
// Prisma doesn't run well here yet without the Data Proxy/Accelerate,
// but we can use a direct fetch or a simplified client if needed.
// However, since we are in a monorepo, we'll use a direct check if possible 
// or just trust the URL slug and let the page components verify.

export async function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 1. Skip static assets, internal routes, and public pages
    if (
        pathname.startsWith('/_next') ||
        pathname.startsWith('/api') ||
        pathname.startsWith('/static') ||
        pathname.startsWith('/favicon.ico') ||
        pathname === '/' ||
        pathname === '/login' ||
        pathname === '/system/login'
    ) {
        return NextResponse.next();
    }

    // 2. Extract slug from path (e.g., /amisi-demo/dashboard -> amisi-demo)
    const segments = pathname.split('/').filter(Boolean);
    if (segments.length === 0) return NextResponse.next();

    const slug = segments[0];

    // 3. To prevent a crash, we need to resolve the tenant ID from the slug.
    // In a real production app with Neon, we'd use a cached fetch or edge-compatible client.
    // For now, we'll inject the slug as the ID if we can't do a lookup here,
    // OR we'll do a simple fetch if we have an internal API for this.
    
    // For this implementation, we will pass the slug through a header 
    // that the Server Actions and Page Components will use to resolve the full tenant object.
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set('x-tenant-slug', slug);
    
    // Note: We need the actual UUID for internal lookups.
    // We'll rely on the lib/db.ts to do a one-time lookup and cache if missing.

    return NextResponse.next({
        request: {
            headers: requestHeaders,
        },
    });
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         */
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
};
