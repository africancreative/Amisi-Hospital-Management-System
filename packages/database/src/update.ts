import { getControlDb, getTenantDb } from './tenant-routing';
import { ExtendedSettings } from './provision';
import { PrismaClient } from '@prisma/client';

/**
 * Synchronizes Hospital Settings from the Control Plane to the Isolated Tenant DB.
 * This ensures that branding updates in the central dashboard reflect locally.
 */
export async function syncTenantSettings(tenantId: string, settings: ExtendedSettings) {
    const controlDb = getControlDb();
    
    // 1. Get the tenant metadata to find the isolated DB URL
    const tenant = await controlDb.tenant.findUnique({
        where: { id: tenantId }
    });

    if (!tenant) throw new Error(`Sync Error: Tenant ${tenantId} not found.`);

    console.log(`[Sync] Propagating branding updates to ${tenant.slug}...`);

    // 2. Instantiate the isolated client
    const isolatedClient = new PrismaClient({
        datasources: { db: { url: tenant.dbUrl } }
    });

    try {
        await isolatedClient.$connect();

    // 3. Update the hospital settings
    // We fetch the first record since there should only be one in the system singleton table.
    const existingSettings = await isolatedClient.hospitalSettings.findFirst();

    if (existingSettings) {
        await isolatedClient.hospitalSettings.update({
            where: { id: existingSettings.id },
            data: {
                hospitalName: tenant.name,
                contactEmail: settings.contactEmail,
                phone: settings.phone,
                detailedAddress: settings.detailedAddress,
                taxId: settings.taxId,
                logoUrl: settings.logoUrl,
                marketingSlogan: settings.marketingSlogan,
            }
        });
    } else {
        // Fallback create if somehow settings don't exist
        await isolatedClient.hospitalSettings.create({
            data: {
                hospitalName: tenant.name,
                systemStatus: 'ACTIVE',
                contactEmail: settings.contactEmail,
                phone: settings.phone,
                detailedAddress: settings.detailedAddress,
                taxId: settings.taxId,
                logoUrl: settings.logoUrl,
                marketingSlogan: settings.marketingSlogan,
            }
        });
    }

    console.log(`[Sync] SUCCESS: ${tenant.slug} settings updated.`);
    } catch (err: any) {
        console.error(`[Sync Error] Failed to update isolated settings for ${tenant.slug}:`, err.message);
        throw err;
    } finally {
        await isolatedClient.$disconnect();
    }
}
