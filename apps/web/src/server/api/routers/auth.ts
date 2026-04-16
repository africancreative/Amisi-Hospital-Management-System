import { z } from 'zod';
import { cookies } from 'next/headers';
import { TRPCError } from '@trpc/server';

import { publicProcedure, protectedProcedure, router } from '@/server/trpc/trpc';
import { getControlDb, getTenantDb } from '@amisimedos/db/client';
import { verifyPassword } from '@amisimedos/auth';

/**
 * Auth Router
 * 
 * Cookie-based auth for web + local node clients.
 * Multi-tenant login resolves tenant by slug (Control DB) then authenticates against tenant shard.
 */
export const authRouter = router({
  me: publicProcedure.query(({ ctx }) => {
    return {
      userId: ctx.session?.userId ?? null,
      role: ctx.session?.role ?? null,
      tenantId: ctx.session?.tenantId ?? null,
      tenantSlug: ctx.tenantSlug ?? null,
      isSystemAdmin: ctx.session?.isSystemAdmin ?? false,
    };
  }),

  login: publicProcedure
    .input(
      z.object({
        tenantSlug: z.string().min(2),
        email: z.string().email(),
        password: z.string().min(1),
      })
    )
    .mutation(async ({ input }) => {
      const tenantSlug = input.tenantSlug.trim().toLowerCase();
      const email = input.email.trim().toLowerCase();

      const controlDb = getControlDb();
      const tenant = await controlDb.tenant.findUnique({ where: { slug: tenantSlug } });
      if (!tenant) {
        throw new TRPCError({ code: 'NOT_FOUND', message: 'Hospital not found' });
      }

      const tenantDb = await getTenantDb(tenant.id, tenant.dbUrl);
      const user = await tenantDb.employee.findUnique({ where: { email } });

      if (!user || !user.passwordHash) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
      }

      const ok = await verifyPassword(input.password, user.passwordHash);
      if (!ok) {
        throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Invalid email or password' });
      }

      // Accept legacy values ('active') as well as canonical ('ACTIVE')
      if ((user.status ?? '').toUpperCase() !== 'ACTIVE') {
        throw new TRPCError({ code: 'FORBIDDEN', message: 'Account is not active' });
      }

      const cookieStore = await cookies();
      cookieStore.set('amisi-tenant-id', tenant.id, { path: '/' });
      cookieStore.set('amisi-tenant-slug', tenant.slug, { path: '/' });
      cookieStore.set('amisi-user-id', user.id, { path: '/' });
      cookieStore.set('amisi-user-role', user.role, { path: '/' });
      cookieStore.set('amisi-user-name', `${user.firstName} ${user.lastName}`, { path: '/' });

      return {
        tenant: { id: tenant.id, slug: tenant.slug, name: tenant.name },
        user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName, role: user.role },
      };
    }),

  logout: protectedProcedure.mutation(async () => {
    const cookieStore = await cookies();
    cookieStore.delete('amisi-tenant-id');
    cookieStore.delete('amisi-tenant-slug');
    cookieStore.delete('amisi-user-id');
    cookieStore.delete('amisi-user-role');
    cookieStore.delete('amisi-user-name');
    cookieStore.delete('amisi-is-system-admin');
    return { success: true };
  }),
});
