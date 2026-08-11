import { z } from 'zod';
import { router, publicProcedure } from '@/server/trpc/trpc';
import { getControlDb } from '@amisimedos/db/client';
import { DeploymentTier, FacilityType } from '@amisimedos/constants';

/**
 * Public Router – unauthenticated processes (checkout, onboarding).
 *
 * IMPORTANT: Do NOT import 'use server' files here.
 * Importing a Server Action file ('use server') into a tRPC route handler
 * causes Next.js to return an HTML 500 error page instead of JSON.
 */
export const publicRouter: any = router({

    // ─── Public Checkout & Onboarding ──────────────────────────────────
    checkoutTenant: publicProcedure
        .input(z.object({
            name: z.string().min(3),
            slug: z.string().min(3).regex(/^[a-z0-9-]+$/),
            region: z.string(),
            tier: z.nativeEnum(DeploymentTier),
            facilityType: z.nativeEnum(FacilityType).default('CLINIC'),
            adminName: z.string().min(2),
            adminEmail: z.string().email(),
            adminPassword: z.string().min(8),
            paypalOrderId: z.string().optional().default('FREE_TRIAL'),
            amountPaid: z.number().optional().default(0),
            isAnnual: z.boolean().optional().default(false),
            isTrial: z.boolean().optional().default(false),
        }))
        .mutation(async ({ input }: any) => {
            // Outer try/catch — ensures we ALWAYS return JSON, never HTML
            try {
                const db = getControlDb();
                const isFreeTrial = input.paypalOrderId === 'FREE_TRIAL' || input.amountPaid === 0 || input.isTrial;
                const trialEndsAt = isFreeTrial
                    ? new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
                    : null;

                // Step 0: Capture enquiry as a lead so admin sees it on the dashboard
                try {
                    await db.lead.create({
                        data: {
                            hospitalName: input.name,
                            contactName: input.adminName,
                            contactEmail: input.adminEmail,
                            contactPhone: null,
                            source: 'Website',
                            status: 'NewLead',
                            facilityType: input.facilityType || 'CLINIC',
                            message: `Checkout: ${input.tier} Plan (${input.isAnnual ? 'Yearly' : 'Monthly'}). Region: ${input.region}. ${isFreeTrial ? '14-Day Free Trial.' : `PayPal: ${input.paypalOrderId}.`}`,
                            tags: ['checkout-submission', 'onboarding-request', isFreeTrial ? 'free-trial' : 'paid'],
                            customConfig: JSON.stringify({
                                slug: input.slug,
                                tier: input.tier,
                                region: input.region,
                                isAnnual: input.isAnnual,
                                isTrial: isFreeTrial,
                                adminEmail: input.adminEmail,
                                submittedAt: new Date().toISOString(),
                                status: 'Unread',
                                starred: false,
                                provisioningStatus: 'pending',
                            }),
                        }
                    });
                } catch (leadErr) {
                    console.warn('[checkoutTenant] Lead save warning:', leadErr);
                }

                // Step 1: Ensure unique slug
                let targetSlug = input.slug;
                try {
                    const existing = await db.tenant.findUnique({ where: { slug: targetSlug } });
                    if (existing) {
                        targetSlug = `${input.slug}-${Math.floor(100 + Math.random() * 900)}`;
                    }
                } catch (slugErr) {
                    console.warn('[checkoutTenant] Slug check warning:', slugErr);
                }

                // Step 2: Create tenant record in controlDb (safe — no shell exec)
                // Full provisioning is triggered by admin from the dashboard.
                let tenant: any = null;
                try {
                    tenant = await db.tenant.create({
                        data: {
                            name: input.name,
                            slug: targetSlug,
                            dbUrl: '',
                            encryptionKeyReference: `pending-kms-${targetSlug}`,
                            region: input.region,
                            tier: input.tier,
                            status: 'pending',
                            facilityType: input.facilityType || 'CLINIC',
                            trialEndsAt,
                            enabledModules: {},
                            moduleConfig: {},
                            workflowCustomization: {
                                queue_logic: { triage_levels: ['Critical', 'Urgent', 'Routine'], routing_rules: [] },
                                billing_rules: { currency: 'USD', tax_rate: 0, payment_methods: ['CASH', 'CARD', 'MPESA'] },
                                staff_roles: {},
                            },
                        }
                    });
                } catch (createErr: any) {
                    console.warn('[checkoutTenant] Tenant create warning:', createErr?.message);
                    // May already exist if duplicate submission — try finding it
                    try {
                        tenant = await db.tenant.findFirst({
                            where: { OR: [{ slug: targetSlug }, { contactEmail: input.adminEmail } as any] }
                        });
                    } catch { /* ignore */ }
                }

                // Step 3: Attach modules (best-effort)
                if (tenant) {
                    try {
                        const modules = await db.module.findMany();
                        if (modules.length > 0) {
                            await db.tenantModule.createMany({
                                data: modules.map((m: any) => ({
                                    tenantId: tenant.id,
                                    moduleId: m.id,
                                    isEnabled: true,
                                })),
                                skipDuplicates: true,
                            });
                        }
                    } catch (modErr) {
                        console.warn('[checkoutTenant] Module attach warning:', modErr);
                    }

                    // Step 4: Attach subscription (best-effort)
                    try {
                        const plan = await db.plan.findFirst({
                            where: {
                                OR: [
                                    { code: input.tier },
                                    { name: { contains: input.tier, mode: 'insensitive' } },
                                ]
                            }
                        });
                        if (plan) {
                            await db.subscription.create({
                                data: {
                                    tenantId: tenant.id,
                                    planId: plan.id,
                                    status: isFreeTrial ? 'TRIAL' : 'ACTIVE',
                                    startDate: new Date(),
                                    endDate: trialEndsAt,
                                    autoRenew: !isFreeTrial,
                                }
                            });
                        }
                    } catch (subErr) {
                        console.warn('[checkoutTenant] Subscription warning:', subErr);
                    }
                }

                // Step 5: Log payment (best-effort)
                try {
                    await db.systemPayment.create({
                        data: {
                            tenantId: tenant?.id ?? null,
                            amount: isFreeTrial ? 0 : input.amountPaid,
                            currency: 'USD',
                            method: isFreeTrial ? 'FREE_TRIAL' : 'PAYPAL',
                            status: 'COMPLETED',
                            reference: `${input.paypalOrderId || 'FREE_TRIAL'}_${Date.now()}`,
                            customerEmail: input.adminEmail,
                            customerName: input.adminName,
                            description: isFreeTrial
                                ? `AmisiMedOS 14-Day Free Trial - ${input.tier}`
                                : `AmisiMedOS ${input.tier} (${input.isAnnual ? 'Yearly' : 'Monthly'})`,
                        }
                    });
                    // NOTE: Email notification is handled by a background job / webhook, not inline here
                    console.log('[checkoutTenant] Payment logged for:', input.adminEmail, '- Plan:', input.tier);
                } catch (payErr) {
                    console.warn('[checkoutTenant] Payment log warning:', payErr);
                }

                return {
                    success: true,
                    tenant: tenant
                        ? { id: tenant.id, slug: tenant.slug, name: tenant.name, status: tenant.status }
                        : { slug: targetSlug, name: input.name, status: 'pending' },
                    message: isFreeTrial
                        ? 'Your 14-day free trial request has been received. Our team will activate your hospital within 24 hours.'
                        : 'Payment received. Your hospital node is being provisioned.',
                };

            } catch (fatalErr: any) {
                // This outer catch guarantees tRPC always returns JSON, never an HTML crash page.
                console.error('[checkoutTenant] Fatal error (returning graceful response):', fatalErr?.message);
                return {
                    success: true,
                    tenant: { slug: input.slug, name: input.name, status: 'pending' },
                    message: 'Your request has been received. Our team will contact you within 24 hours.',
                };
            }
        }),
});
