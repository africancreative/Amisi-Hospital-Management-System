'use server';

import { getControlDb, DeploymentTier } from '@amisi/database';
import { revalidatePath } from 'next/cache';
import { provisionTenant } from '@amisi/database';
import { ensureSuperAdmin } from '@/lib/auth-utils';

export async function getTenants() {
    await ensureSuperAdmin();
    const db = getControlDb();
    return await db.tenant.findMany({
        orderBy: { createdAt: 'desc' },
    });
}

export async function getTenantById(idOrSlug: string) {
    await ensureSuperAdmin();
    const db = getControlDb();
    // Try UUID match first
    const byId = await db.tenant.findUnique({
        where: { id: idOrSlug },
    });
    if (byId) return byId;

    // Fallback to Slug match
    return await db.tenant.findFirst({
        where: { slug: idOrSlug },
    });
}

export async function createTenant(formData: FormData) {
    await ensureSuperAdmin();
    const name = formData.get('name') as string;
    const slug = formData.get('slug') as string;
    const region = formData.get('region') as string;
    const dbUrl = formData.get('dbUrl') as string;

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

    if (!name || !slug || !region || !dbUrl || !adminName || !adminEmail || !adminPassword) {
        throw new Error('Missing required fields');
    }

    // Pass extended configuration to provisioning logic
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
        passwordHash: adminPassword // In a real app, hash this with bcrypt before passing
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
