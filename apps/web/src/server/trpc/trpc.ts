import { initTRPC, TRPCError } from '@trpc/server';
import { type Context } from './context';
import { ZodError } from 'zod';
import { checkBillingStatus } from './billing-middleware';
import { Role } from '@amisimedos/db';
import { Permission, hasPermission } from '@amisimedos/auth';

/**
 * tRPC Initialization
 */
const t = initTRPC.context<Context>().meta<{
  cloudOnly?: boolean;
}>().create({
  errorFormatter({ shape, error }) {
    return {
      ...shape,
      data: {
        ...shape.data,
        zodError:
          error.cause instanceof ZodError ? error.cause.flatten() : null,
      },
    };
  },
});

/**
 * Procedures
 */
export const router = t.router;
export const publicProcedure = t.procedure;

/**
 * Middleware: Enforce Multi-Tenancy & Billing Resilience
 * Rejects requests that do not specify a valid AmisiMedOS Clinical Node slug,
 * or if the node is in a hard clinical lockout.
 */
const enforceTenant = t.middleware(async ({ ctx, next }) => {
  if (!ctx.db || !ctx.tenantSlug) {
    throw new TRPCError({
      code: 'BAD_REQUEST',
      message: '[Routing Error] No valid Clinical Node slug detected. Access denied.',
    });
  }

  // Enforcement: 72-hour clinical grace check
  // This ensure that even if offline, we respect the last signed billing status
  const billing = await checkBillingStatus(ctx.tenantSlug);

  // Read-Only Enforcement: Block mutations if past grace period
  if (billing.isLockout && type === 'mutation') {
    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '[Clinical Lockout] Your 72-hour grace period has expired. The system is currently in READ-ONLY mode. Please renew your subscription to resume clinical charting.',
    });
  }

  return next({
    ctx: {
      db: ctx.db,
      tenantSlug: ctx.tenantSlug,
      billing, // Attach billing status to context for UI/Procedure use
    },
  });
});

/**
 * Middleware: Enforce Authentication
 */
const isAuthed = t.middleware(({ ctx, next }) => {
  if (!ctx.session || !ctx.session.userId) {
    throw new TRPCError({
      code: 'UNAUTHORIZED',
      message: 'Authentication required to access clinical operations.',
    });
  }
  return next({
    ctx: {
      session: { ...ctx.session, userId: ctx.session.userId },
    },
  });
});

/**
 * Base Procedures for AmisiMedOS Clinical Workflows
 */
export const tenantProcedure = publicProcedure.use(enforceTenant);
export const protectedProcedure = tenantProcedure.use(isAuthed);

/**
 * Middleware: Enforce Specific Capability (RBAC)
 */
export const requirePermission = (permission: Permission) => 
  t.middleware(({ ctx, next }) => {
    if (!ctx.session || !ctx.session.userId) {
      throw new TRPCError({ code: 'UNAUTHORIZED' });
    }

    const { role } = ctx.session;
    // userPermissions would come from the database in a real session, 
    // for now we pass empty array to use role-based defaults.
    if (!hasPermission(role as Role, [], permission)) {
      throw new TRPCError({
        code: 'FORBIDDEN',
        message: `[Access Denied] Your role (${role}) does not have the required capability: ${permission}`,
      });
    }

    return next();
  });

/**
 * Procedural Factories for Clinical Domains
 */
export const clinicalProcedure = protectedProcedure.use(requirePermission('CONSULTATION_WRITE'));
export const financeProcedure = protectedProcedure.use(requirePermission('LEDGER_VIEW'));
export const adminProcedure = protectedProcedure.use(requirePermission('RECORDS_WRITE'));

