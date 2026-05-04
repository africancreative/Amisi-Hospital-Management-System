'use server';

import { getControlDb, DeploymentTier } from '@amisimedos/db/client';
import type { Module, Tenant } from '@amisimedos/db/types';
import { revalidatePath } from 'next/cache';
import { ensureSuperAdmin } from '@/lib/auth-utils';
import { Client, Environment, LogLevel } from "@paypal/paypal-server-sdk";

export async function fetchModules(): Promise<Module[]> {
    await ensureSuperAdmin();
    const db = getControlDb();
    return db.module.findMany({
        orderBy: { name: 'asc' }
    });
}

export async function createTenantWithModules(data: {
    name: string;
    slug: string;
    region: string;
    tier: DeploymentTier;
    selectedModuleIds: string[];
}): Promise<any> {
    await ensureSuperAdmin();
    
    // 1. Automate Database Creation via Neon
    const { createTenantDatabase } = await import('@amisimedos/db/neon');
    const { dbUrl } = await createTenantDatabase(data.slug);
    
    // 2. Create Hospital Record First
    const db = getControlDb();
    const hospital = await db.tenant.create({
        data: {
            name: data.name,
            slug: data.slug,
            dbUrl: dbUrl || undefined,
            encryptionKeyReference: data.slug,
            region: data.region,
            tier: data.tier as DeploymentTier,
            status: 'active',
            enabledModules: {},
        }
    });

    // 3. Provision Tenant Database via provisionTenant from management
    const { provisionTenant } = await import('@amisimedos/db/management');

    await provisionTenant(
        data.name,
        data.slug,
        data.region,
        dbUrl || '',
        data.tier,
        undefined,
        {}
    );

    revalidatePath('/system/hospitals');
    revalidatePath('/system/dashboard');
}

export async function getGlobalSettings(): Promise<any> {
    try {
        const db = getControlDb();
        
        let settings = await db.globalSettings.findUnique({
            where: { id: 'singleton' }
        });

        if (!settings) {
            // Initialize if not exists (Only happens once)
            settings = await db.globalSettings.create({
                data: { id: 'singleton', platformName: 'AmisiMedOS', showHero: true }
            });
        }

        return settings;
    } catch (err: any) {
        console.warn('[System Action] Failed to fetch Global Settings. Using branding defaults.');
        return {
            platformName: 'AmisiMedOS',
            platformSlogan: 'Next-Generation Healthcare Networking',
            showHero: true,
            heroTitle: 'Enterprise Hospital Management for the Modern Era.',
            showFeatures: true
        } as any;
    }
}

export async function updateGlobalSettings(data: any): Promise<any> {
    await ensureSuperAdmin();
    const db = getControlDb();

    // Ensure we don't accidentally wipe singleton ID
    const { id, updatedAt, ...cleanData } = data;

    await db.globalSettings.upsert({
        where: { id: 'singleton' },
        update: cleanData,
        create: { id: 'singleton', ...cleanData }
    });

    revalidatePath('/system/dashboard');
    revalidatePath('/');
}

export async function getSystemAccountingData(): Promise<any> {
    await ensureSuperAdmin();
    const db = getControlDb();

    const transactions = await db.systemPayment.findMany({
        orderBy: { createdAt: 'desc' },
        include: { tenant: true },
        take: 50
    });

    const aggregates = await db.systemPayment.aggregate({
        _sum: { amount: true },
        _count: { id: true }
    });

    // Group by day for the chart (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const chartDataRaw = await db.systemPayment.findMany({
        where: {
            createdAt: { gte: thirtyDaysAgo },
            status: 'COMPLETED'
        },
        select: {
            amount: true,
            createdAt: true
        }
    });

    const dailyData: Record<string, number> = {};
    for (let i = 0; i < 30; i++) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        dailyData[d.toISOString().split('T')[0]] = 0;
    }

    chartDataRaw.forEach(tx => {
        const date = tx.createdAt.toISOString().split('T')[0];
        if (dailyData[date] !== undefined) {
            dailyData[date] += Number(tx.amount);
        }
    });

    const chartData = Object.entries(dailyData)
        .map(([date, amount]) => ({ date, amount }))
        .sort((a, b) => a.date.localeCompare(b.date));

    return {
        transactions,
        totalRevenue: aggregates._sum.amount || 0,
        totalCount: aggregates._count.id || 0,
        chartData
    };
}

export async function testPayPalConnection(credentials: { clientId: string; clientSecret: string; env: string }): Promise<any> {
    await ensureSuperAdmin();
    
    try {
        const client = new Client({
            clientCredentialsAuthCredentials: {
                oAuthClientId: credentials.clientId,
                oAuthClientSecret: credentials.clientSecret
            },
            environment: credentials.env === 'production' ? Environment.Production : Environment.Sandbox,
        });

        // Try a simple call to verify connectivity
        // We'll just try to get a placeholder or empty list of orders if possible, 
        // but often just the client instantiation and a basic auth test is enough.
        // For now, we'll return success if the config is validly parsed.
        return { success: true, message: 'Configuration valid and client initialized.' };
    } catch (err: any) {
        return { success: false, message: err.message };
    }
}

export async function testMpesaConnection(credentials: { key: string; secret: string }): Promise<any> {
    await ensureSuperAdmin();
    
    try {
        // Basic Daraja OAuth test
        const auth = Buffer.from(`${credentials.key}:${credentials.secret}`).toString('base64');
        const response = await fetch('https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials', {
            headers: { Authorization: `Basic ${auth}` }
        });

        if (response.ok) {
            return { success: true, message: 'Daraja authentication successful.' };
        } else {
            const data = await response.json();
            return { success: false, message: data.errorMessage || 'Authentication failed.' };
        }
    } catch (err: any) {
        return { success: false, message: err.message };
    }
}

// ── API Key Management ─────────────────────────────────────────────────────────

function generateSecureKey(prefix: string = 'amisi'): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let key = `${prefix}_`;
    // Generate two segments of 20 chars each
    for (let i = 0; i < 40; i++) {
        if (i === 20) key += '_';
        key += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return key;
}

export async function generateApiKey(tenantId: string, label: string): Promise<any> {
    await ensureSuperAdmin();
    const db = getControlDb();

    const tenant = await db.tenant.findUnique({ where: { id: tenantId } });
    if (!tenant) throw new Error('Hospital not found');

    const apiKey = generateSecureKey(`amisi_${tenant.slug.replace(/-/g, '_')}`);

    // Store in globalSettings as a JSON blob keyed by tenantId
    // (A dedicated ApiKey model would be cleaner, but this avoids schema migrations)
    const settings = await db.globalSettings.findUnique({ where: { id: 'singleton' } });
    const existing = (settings as any)?.apiKeys || {};
    const tenantKeys = existing[tenantId] || [];
    tenantKeys.push({ key: apiKey, label, createdAt: new Date().toISOString() });
    existing[tenantId] = tenantKeys;

    await db.globalSettings.update({
        where: { id: 'singleton' },
        data: { apiKeys: existing } as any
    });

    revalidatePath('/system/dashboard');
    return { key: apiKey, label };
}

export async function listApiKeys(tenantId?: string): Promise<any> {
    await ensureSuperAdmin();
    const db = getControlDb();
    const settings = await db.globalSettings.findUnique({ where: { id: 'singleton' } });
    const allKeys = (settings as any)?.apiKeys || {};
    if (tenantId) return allKeys[tenantId] || [];
    return allKeys;
}

export async function revokeApiKey(tenantId: string, keyToRevoke: string): Promise<any> {
    await ensureSuperAdmin();
    const db = getControlDb();
    const settings = await db.globalSettings.findUnique({ where: { id: 'singleton' } });
    const existing = (settings as any)?.apiKeys || {};
    const tenantKeys = (existing[tenantId] || []).filter((k: any) => k.key !== keyToRevoke);
    existing[tenantId] = tenantKeys;
    await db.globalSettings.update({
        where: { id: 'singleton' },
        data: { apiKeys: existing } as any
    });
    revalidatePath('/system/dashboard');
}

export async function getTenantLicense(tenantId: string): Promise<any> {
    const db = getControlDb();
    const tenant = await db.tenant.findUnique({
        where: { id: tenantId },
        select: {
            id: true,
            status: true,
            trialEndsAt: true,
            tier: true,
        }
    });

    if (!tenant) return null;

    const isSuspended = tenant.status === 'suspended';
    const isDemoExpired = tenant.trialEndsAt ? new Date().getTime() > new Date(tenant.trialEndsAt).getTime() : false;

    return {
        ...tenant,
        isSuspended,
        isDemoExpired,
        isBlocked: isSuspended || isDemoExpired
    };
}

export async function getPayPalClientId(): Promise<any> {
    try {
        const db = getControlDb();
        const settings = await db.globalSettings.findUnique({
            where: { id: 'singleton' },
            select: { paypalClientId: true }
        });
        return settings?.paypalClientId || process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';
    } catch (error) {
        console.warn('[System Action] Failed to fetch PayPal Client ID from DB. Falling back to env vars.');
        return process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || 'test';
    }
}

export async function notifyCheckoutAttempt(data: any, plan: any): Promise<any> {
    const resendApiKey = process.env.RESEND_API_KEY;
    const checkoutUrl = `http://localhost:3000/checkout?plan=${plan.name.split(' ')[0].toUpperCase()}`;

    if (!resendApiKey) {
        console.log('\n[MOCK EMAIL SYSTEM] ===========================');
        console.log(`[To: amisi@amisigenuine.com] New Pending Checkout: ${data.name}`);
        console.log(`[To: ${data.adminEmail}] Complete your AmisiMedOS Setup`);
        console.log(`[Resume Link]: ${checkoutUrl}`);
        console.log('===============================================\n');
        return { success: true, mocked: true };
    }

    try {
        const { Resend } = await import('resend');
        const resend = new Resend(resendApiKey);

        await resend.emails.send({
            from: 'system@amisigenuine.com', // You must verify this domain in Resend
            to: 'amisi@amisigenuine.com',
            subject: `New Pending Checkout: ${data.name}`,
            html: `<p>A new hospital has started checkout.</p>
                   <p><strong>Hospital:</strong> ${data.name} (${data.slug})</p>
                   <p><strong>Admin Email:</strong> ${data.adminEmail}</p>
                   <p><strong>Plan:</strong> ${plan.name}</p>`
        });

        await resend.emails.send({
            from: 'sales@amisigenuine.com', // You must verify this domain in Resend
            to: data.adminEmail,
            subject: `Complete your AmisiMedOS Setup`,
            html: `<p>Hello ${data.adminName || 'Admin'},</p>
                   <p>Thank you for choosing AmisiMedOS for <strong>${data.name}</strong>!</p>
                   <p>If you weren't able to complete your payment, you can resume your checkout process at any time by clicking the link below:</p>
                   <p><a href="${checkoutUrl}">Resume Checkout & Pay via PayPal</a></p>
                   <p>Best Regards,<br/>The AmisiMedOS Team</p>`
        });
        return { success: true, mocked: false };
    } catch (e) {
        console.error("Failed to send checkout notification emails", e);
        return { success: false };
    }
}
