const { PrismaClient } = require('./generated/control-client');
const prisma = new PrismaClient();

async function check() {
    try {
        const tenants = await prisma.tenant.findMany();
        console.log('Tenants:', JSON.stringify(tenants, null, 2));
    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

check();
