import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { getTenantDb } from '@amisi/database';
import { runSyncLoop } from '@amisi/sync-engine';

dotenv.config();

const app = express();
const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());

app.get('/api/health', (req, res) => {
    res.json({ status: 'HEALTHY', node: 'EDGE', timestamp: new Date() });
});

async function bootstrap() {
    const tenantId = process.env.HOSPITAL_TENANT_ID;
    if (!tenantId) {
        console.error('HOSPITAL_TENANT_ID not found in environment.');
        process.exit(1);
    }

    try {
        console.log(`[HealthOS Local] Starting node for Tenant ${tenantId}...`);
        const db = await getTenantDb(tenantId);
        
        // Start the sync engine in background
        runSyncLoop(tenantId, db);

        app.listen(port, () => {
            console.log(`[HealthOS Local] API running on port ${port}`);
        });
    } catch (e) {
        console.error('Failed to bootstrap HealthOS Local Node:', e);
        process.exit(1);
    }
}

bootstrap();
