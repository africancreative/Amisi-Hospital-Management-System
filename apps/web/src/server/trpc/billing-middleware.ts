import { TRPCError } from '@trpc/server';
import type { TenantClient } from '@amisimedos/db/client';

/**
 * Clinical Resilience Billing Middleware
 * 
 * Implements the 72-hour 'Clinical Grace' rule.
 * Ensures critical hospital operations continue even during internet outages 
 * or subscription expiration, providing a safety window for care.
 */

export const checkBillingStatus = async (tenantDb: TenantClient) => {
  // 1. Fetch Local Subscription Cache from the Edge Node DB
  // In a local node, we prioritize the local cache to allow for offline operation.
  const localSub = await tenantDb.localSubscription.findFirst({
    where: { id: 'singleton' }
  });

  if (!localSub) {
    // Cloud can run without the local cache; Edge should not.
    const isCloud = process.env.NODE_TYPE === 'CLOUD' || process.env.CLOUD_MODE === 'true';
    if (isCloud) {
      return {
        isExpired: false,
        isLockout: false,
        isWithinGrace: false,
        gracePeriodRemaining: 0,
        planCode: 'UNKNOWN',
        missingLocalSubscription: true,
      };
    }

    throw new TRPCError({
      code: 'FORBIDDEN',
      message: '[Billing Error] No active subscription record found on this node. Please connect to the Amisi Cloud Hub to initialize.',
    });
  }

  const now = new Date();
  const gracePeriodEnd = new Date(localSub.gracePeriodEnd);

  // 2. Resilience Logic: Check if we are within the Clinical Grace window
  if (now > gracePeriodEnd) {
    throw new TRPCError({
      code: 'PAYMENT_REQUIRED',
      message: `[Clinical Lockout] Your 72-hour clinical grace period ended on ${gracePeriodEnd.toLocaleString()}. System operations are now restricted. Please renew your AmisiMedOS subscription.`,
    });
  }

  // 3. Status Logic
  const isExpired = now > new Date(localSub.validUntil);
  const isLockout = now > gracePeriodEnd;
  
  return {
    isExpired,
    isLockout,
    isWithinGrace: now <= gracePeriodEnd && isExpired,
    gracePeriodRemaining: Math.max(0, gracePeriodEnd.getTime() - now.getTime()),
    planCode: localSub.planCode
  };
};
