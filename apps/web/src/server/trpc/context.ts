import { getTenantBySlug, getTenantDb } from '@amisimedos/db/client';
import { type NextRequest } from 'next/server';

/**
 * tRPC Context Resolver
 * 
 * Logic flow:
 * 1. Extract 'x-tenant-slug' from headers (standard for AmisiMedOS multi-tenancy)
 * 2. Resolve the isolated database client for that specific hospital node
 * 3. Extract auth session metadata (JWT or Session Cookie)
 */
export const createTRPCContext = async (opts: { req: NextRequest }) => {
  const { req } = opts;
  
  // 1. Multi-Tenant Routing (The Core of AmisiMedOS)
  const cookieTenantSlug = req.cookies.get('amisi-tenant-slug')?.value;
  const tenantSlug = req.headers.get('x-tenant-slug') || cookieTenantSlug;
  
  let db = null;
  try {
    if (tenantSlug) {
      db = await getTenantBySlug(tenantSlug);
    } else {
      const tenantIdFromCookie = req.cookies.get('amisi-tenant-id')?.value;
      if (tenantIdFromCookie) {
        db = await getTenantDb(tenantIdFromCookie);
      }
    }
  } catch (e) {
    console.error(`[tRPC Context] Failed to resolve tenant DB client. tenantSlug=${tenantSlug ?? 'null'}`, e);
  }

  // 2. Auth Context (Integrating @amisimedos/auth)
  // Simplified for this stage - extraction from cookies/headers
  const session = {
    userId: req.cookies.get('amisi-user-id')?.value,
    role: req.cookies.get('amisi-user-role')?.value,
    tenantId: req.cookies.get('amisi-tenant-id')?.value,
    isSystemAdmin: req.cookies.get('amisi-is-system-admin')?.value === 'true',
  };

  return {
    req,
    db,
    session,
    tenantSlug,
  };
};

export type Context = Awaited<ReturnType<typeof createTRPCContext>>;
