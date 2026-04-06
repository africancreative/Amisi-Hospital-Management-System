import { ControlClient } from './index';
import { hashPassword } from '@amisi/auth';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedSystemAdmin() {
    console.log('[Amisi HealthOS] Provisioning system administrators...');
    if (!process.env.NEON_DATABASE_URL) {
        console.error('[Amisi HealthOS] Error: NEON_DATABASE_URL is not set in the environment.');
        process.exit(1);
    }

    const controlDb = new ControlClient();

    const admins = [
        {
            email: 'admin@amisigenuine.com',
            name: 'Platform Admin',
            password: '@AmisiAdmin2026'
        },
        {
            email: 'amisi@amisigenuine.com',
            name: 'Amisi System Admin',
            password: '@theVerge#2047'
        }
    ];

    for (const adminData of admins) {
        console.log(`[Amisi HealthOS] Processing admin: ${adminData.email}...`);
        const passwordHash = await hashPassword(adminData.password);

        await controlDb.systemAdmin.upsert({
            where: { email: adminData.email },
            update: {
                name: adminData.name,
                passwordHash: passwordHash
            },
            create: {
                email: adminData.email,
                name: adminData.name,
                passwordHash: passwordHash
            }
        });
        console.log(`[Amisi HealthOS] Admin synchronized: ${adminData.email}`);
    }

    console.log('[Amisi HealthOS] System Admin provisioning complete.');
    process.exit(0);
}

seedSystemAdmin().catch(err => {
    console.error('[Amisi HealthOS] System Admin provisioning error:', err);
    process.exit(1);
});
