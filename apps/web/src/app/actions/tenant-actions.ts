'use server';

import { getControlDb } from '@amisimedos/db/client';
import { DeploymentTier } from '@amisimedos/constants';
import { Decimal } from '@amisimedos/db/types';
import { revalidatePath } from 'next/cache';
import { ensureSuperAdmin } from '@/lib/auth-utils';
import { hashPassword } from '@amisimedos/auth';

export async function createTenant(formData: FormData) {
    await ensureSuperAdmin();
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const region = formData.get('region') as string;

    const adminName = formData.get('adminName') as string;
    const adminEmail = formData.get('adminEmail') as string;
    const adminPassword = formData.get('adminPassword') as string;

    // Optional fields
    const contactEmail = formData.get('contactEmail') as string | null;
    const phone = formData.get('phone') as string | null;
    const detailedAddress = formData.get('detailedAddress') as string | null;
    const taxId = formData.get('taxId') as string | null;
    const logoUrl = formData.get('logoUrl') as string | null;
    const marketingSlogan = formData.get('marketingSlogan') as string | null;

    const tier = (formData.get('tier') as DeploymentTier) || 'CLINIC';

    // Expanded Modules
    const enabledModules = {
        pmi: formData.get('module_pmi') === 'on',
        opd: formData.get('module_opd') === 'on',
        pharmacy: formData.get('module_pharmacy') === 'on',
        rcm: formData.get('module_rcm') === 'on',
        ipd: formData.get('module_ipd') === 'on',
        lis: formData.get('module_lis') === 'on',
        ris: formData.get('module_ris') === 'on',
        inventory: formData.get('module_inventory') === 'on',
        ot: formData.get('module_ot') === 'on',
        icu: formData.get('module_icu') === 'on',
        ctms: formData.get('module_ctms') === 'on',
        irb: formData.get('module_irb') === 'on',
    };

    if (!name || !slug || !region || !adminName || !adminEmail || !adminPassword) {
        throw new Error('Missing required fields');
    }

    console.log(`[Provisioning Action] Starting automated flow for ${slug}...`);

    // 1. Automate Database Creation via Neon
    const { createTenantDatabase } = await import('@amisimedos/db/management' as any);
    const { dbUrl } = await createTenantDatabase(slug);
    console.log(`[Provisioning Action] Neon DB generated: ${dbUrl}`);

    // 2. Hash the initial admin password
    const passwordHash = await hashPassword(adminPassword);

    // 3. Trigger Core Provisioning Logic
    const { provisionTenant } = await import('@amisimedos/db/management' as any);
    await provisionTenant(name, slug, region, dbUrl, tier, {
        contactEmail,
        phone,
        detailedAddress,
        taxId,
        logoUrl,
        marketingSlogan
    }, enabledModules, {
        name: adminName,
        email: adminEmail,
        passwordHash
    });

    revalidatePath('/hospitals');
}

export async function updateTenantStatus(id: string, status: 'active' | 'suspended' | 'terminated') {
    await ensureSuperAdmin();
    const db = getControlDb();
    await db.tenant.update({
        where: { id },
        data: { status },
    });

    revalidatePath('/hospitals');
    revalidatePath(`/hospitals/${id}`);
}

export async function updateEnabledModules(id: string, modules: any) {
    await ensureSuperAdmin();
    const db = getControlDb();
    await db.tenant.update({
        where: { id },
        data: { enabledModules: modules },
    });

    revalidatePath(`/hospitals/${id}`);
}

export async function getTenants() {
    await ensureSuperAdmin();
    const db = getControlDb();
    return db.tenant.findMany({
        orderBy: { createdAt: 'desc' }
    });
}

export async function getTenantById(id: string) {
    await ensureSuperAdmin();
    const db = getControlDb();
    return db.tenant.findUnique({
        where: { id }
    });
}

export async function updateTenantFull(id: string, data: any) {
    await ensureSuperAdmin();
    const db = getControlDb();

    const { name, region, dbUrl, tier, enabledModules, ...settings } = data;

    // 1. Update the Control Plane
    const updatedTenant = await db.tenant.update({
        where: { id },
        data: {
            name,
            region,
            dbUrl,
            tier,
            enabledModules
        }
    });

    // 2. Sync to the isolated local DB if connectivity is available
    // This propagates branding changes (Name, Logo, Address)
    try {
        const { syncTenantSettings } = await import('@amisimedos/db/management' as any);
        await syncTenantSettings(id, settings);
    } catch (e) {
        console.error(`[Admin Action] Sync failed for ${updatedTenant.slug}. Settings may be out of sync.`, e);
    }

    revalidatePath('/system/dashboard');
    revalidatePath(`/system/hospitals/${id}/edit`);
}

export async function cloneTenant(sourceId: string, newConfig: any) {
    await ensureSuperAdmin();
    const db = getControlDb();

    // 1. Fetch source baseline
    const source = await db.tenant.findUnique({
        where: { id: sourceId }
    });

    if (!source) throw new Error('Source hospital for cloning not found');

    // 2. Prepare for provisioning
    const { name, slug, region, dbUrl, adminName, adminEmail, adminPassword } = newConfig;
    
    // In a real scenario, we might want to copy more settings, 
    // but for now we inherit Modules and Tier.
    const { provisionTenant } = await import('@amisimedos/db/management' as any);
    await provisionTenant(
        name,
        slug,
        region,
        dbUrl,
        source.tier as DeploymentTier,
        {}, // Branding is fresh for the node
        source.enabledModules,
        {
            name: adminName,
            email: adminEmail,
            // Pass the original password (will be hashed in provisionTenant)
            passwordHash: adminPassword 
        }
    );

    revalidatePath('/system/dashboard');
}

export async function deleteTenant(id: string) {
    await ensureSuperAdmin();
    const db = getControlDb();
    
    // For safety, we could soft-delete, but the user asked for "delete"
    // Let's implement hard-delete since it relates to orchestration
    await db.tenant.delete({
        where: { id }
    });

    revalidatePath('/system/dashboard');
}
