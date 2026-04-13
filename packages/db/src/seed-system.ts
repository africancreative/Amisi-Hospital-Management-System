import { ControlClient } from './index';
import crypto from 'crypto';
import * as dotenv from 'dotenv';
import { hashPassword } from './lib/crypto';
import path from 'path';

// Resilient env loader for seed script
const envPath = path.join(__dirname, '../../../.env');
dotenv.config({ path: envPath });

async function seedSystemAdmin() {
    console.log('[AmisiMedOS] Provisioning system administrators...');
    if (!process.env.NEON_DATABASE_URL) {
        console.error('[AmisiMedOS] Error: NEON_DATABASE_URL is not set in the environment.');
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
        console.log(`[AmisiMedOS] Processing admin: ${adminData.email}...`);
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
        console.log(`[AmisiMedOS] Admin synchronized: ${adminData.email}`);
    }

    console.log('[AmisiMedOS] System Admin provisioning complete.');
    process.exit(0);
}

seedSystemAdmin().catch(err => {
    console.error('[AmisiMedOS] System Admin provisioning error:', err);
    process.exit(1);
});
