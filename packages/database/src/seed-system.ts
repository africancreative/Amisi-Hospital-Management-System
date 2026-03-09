import { ControlClient } from './index';
import * as dotenv from 'dotenv';

dotenv.config();

async function seedSystemAdmin() {
    console.log('Seeding system administrator...');
    const controlDb = new ControlClient();

    const adminEmail = 'admin@amisigenuine.com';
    const adminName = 'Platform Admin';
    const passwordHash = '@AmisiAdmin2026'; // Plain for now as per previous seed style

    await controlDb.systemAdmin.upsert({
        where: { email: adminEmail },
        update: {
            name: adminName,
            passwordHash: passwordHash
        },
        create: {
            email: adminEmail,
            name: adminName,
            passwordHash: passwordHash
        }
    });

    console.log(`System Admin seeded: ${adminEmail}`);
    process.exit(0);
}

seedSystemAdmin().catch(err => {
    console.error('System Admin seed error:', err);
    process.exit(1);
});
