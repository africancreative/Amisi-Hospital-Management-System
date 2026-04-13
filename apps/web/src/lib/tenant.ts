import { headers } from 'next/headers';
import { getControlDb } from '@amisimedos/db';

/**
 * Resolves the current tenant ID from the injected middleware headers.
 */
export async function getResolvedTenantId(): Promise<string | null> {
  const headerList = await headers();
  return headerList.get('x-resolved-tenant-id');
}

/**
 * Fetches the shared sync secret for the current tenant.
 */
export async function getTenantSyncSecret(tenantId: string): Promise<string | null> {
  const controlDb = getControlDb();
  const tenant = await controlDb.tenant.findUnique({
    where: { id: tenantId },
    select: { sharedSecret: true }
  });
  return tenant?.sharedSecret || null;
}
