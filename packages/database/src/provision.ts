import { getControlDb, TenantClient } from './index';
import { DeploymentTier } from '../generated/control-client';
import { execSync } from 'child_process';
import crypto from 'crypto';
import path from 'path';

export interface ExtendedSettings {
    contactEmail?: string | null;
    phone?: string | null;
    detailedAddress?: string | null;
    taxId?: string | null;
    logoUrl?: string | null;
    marketingSlogan?: string | null;
}

export interface AdminInfo {
    name: string;
    email: string;
    passwordHash: string;
}

/**
 * Provisions a new Tenant
 * 1. Creates a record in the Neon Control Plane.
 * 2. Emits a new Encryption Key ID.
 * 3. Applies the latest tenant schema migration to their isolated database.
 * 4. Seeds initial hospital settings.
 */
export async function provisionTenant(
    name: string,
    slug: string,
    region: string,
    isolatedDbUrl: string,
    tier: DeploymentTier = 'CLINIC',
    settings?: ExtendedSettings,
    enabledModules?: any,
    admin?: AdminInfo
) {
    console.log(`[Provision] Starting provisioning for tenant: ${name} (${slug})`);

    // Create a unique reference ID for KMS encryption
    const keyRef = `kms-amisi-${crypto.randomBytes(16).toString('hex')}`;

    const controlDb = getControlDb();

    console.log(`[Provision] Storing tenant metadata in Control Plane...`);
    const tenant = await controlDb.tenant.create({
        data: {
            name,
            slug,
            region,
            dbUrl: isolatedDbUrl,
            encryptionKeyReference: keyRef,
            tier: tier,
            enabledModules: enabledModules || getDefaultModulesForTier(tier)
        }
    });

    console.log(`[Provision] Tenant created with ID: ${tenant.id}`);

    // Apply Prisma schema manually to the new isolated DB URL
    console.log(`[Provision] Pushing Tenant Prisma schema to isolated edge database...`);

    try {
        const pkgRoot = path.join(__dirname, '..');
        execSync(`cmd.exe /c npx prisma db push --schema ./prisma/tenant.prisma`, {
            env: {
                ...process.env,
                LOCAL_EDGE_DATABASE_URL: isolatedDbUrl
            },
            cwd: pkgRoot,
            stdio: 'inherit'
        });
        console.log(`[Provision] Validation: Schema successfully pushed to ${name}'s DB.`);

        // Seed Initial Settings
        console.log(`[Provision] Seeding initial Hospital Settings...`);
        const isolatedClient = new TenantClient({
            datasourceUrl: isolatedDbUrl
        });

        await isolatedClient.$connect();

        await isolatedClient.hospitalSettings.create({
            data: {
                hospitalName: name,
                systemStatus: 'ACTIVE',
                contactEmail: settings?.contactEmail,
                phone: settings?.phone,
                detailedAddress: settings?.detailedAddress,
                taxId: settings?.taxId,
                logoUrl: settings?.logoUrl,
                marketingSlogan: settings?.marketingSlogan,
            }
        });

        await isolatedClient.$disconnect();
        console.log(`[Provision] Hospital Settings Seeded successfully.`);

        // Seed Admin User
        if (admin) {
            console.log(`[Provision] Seeding initial Admin User: ${admin.email}...`);
            await seedAdminUser(isolatedDbUrl, admin);
        }

    } catch (err: any) {
        console.error(`[Provision Error] Critical failure for tenant ${tenant.id}.`);
        await controlDb.tenant.delete({ where: { id: tenant.id } });
        throw new Error('Tenant provisioning failed: ' + err.message);
    }

    console.log(`[Provision] SUCCESS. Tenant ready. KMS Ref: ${keyRef}`);
    return tenant;
}

function getDefaultModulesForTier(tier: DeploymentTier) {
    const base: any = {
        pmi: true,
        opd: true,
        pharmacy: true,
        rcm: true,
        ipd: false,
        lis: false,
        ris: false,
        inventory: false,
        ot: false,
        icu: false,
        ctms: false,
        irb: false
    };

    if (tier === 'GENERAL' || tier === 'RESEARCH') {
        base.ipd = true;
        base.lis = true;
        base.ris = true;
        base.inventory = true;
    }

    if (tier === 'RESEARCH') {
        base.ot = true;
        base.icu = true;
        base.ctms = true;
        base.irb = true;
    }

    return base;
}

async function seedAdminUser(dbUrl: string, admin: AdminInfo) {
    const isolatedClient = new TenantClient({
        datasourceUrl: dbUrl
    });

    await isolatedClient.$connect();

    // Split name into first/last for the Employee model
    const nameParts = admin.name.split(' ');
    const firstName = nameParts[0] || 'Admin';
    const lastName = nameParts.slice(1).join(' ') || 'User';

    await isolatedClient.employee.create({
        data: {
            employeeId: 'ADM-001',
            firstName,
            lastName,
            email: admin.email,
            passwordHash: admin.passwordHash,
            role: 'ADMIN',
            department: 'Administration',
            status: 'active',
            baseSalary: 0,
            permissions: JSON.stringify(['*'])
        }
    });

    await isolatedClient.$disconnect();
}

// If run directly from CLI
if (require.main === module) {
    const [, , name, slug, region, dbUrl, tier] = process.argv;
    if (!name || !slug || !region || !dbUrl) {
        console.error("Usage: ts-node provision.ts <HospitalName> <Slug> <Region> <DatabaseUrl> [Tier]");
        process.exit(1);
    }

    provisionTenant(name, slug, region, dbUrl, (tier as DeploymentTier) || 'CLINIC')
        .then(() => process.exit(0))
        .catch(e => {
            console.error(e);
            process.exit(1);
        });
}
