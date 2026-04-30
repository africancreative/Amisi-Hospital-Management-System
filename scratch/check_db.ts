import { getControlDb } from './apps/web/src/lib/db';

async function check() {
    try {
        const db = getControlDb();
        const tenants = await db.tenant.findMany();
        console.log('Tenants:', JSON.stringify(tenants, null, 2));
    } catch (e) {
        console.error('Error checking DB:', e);
    }
}

check();
