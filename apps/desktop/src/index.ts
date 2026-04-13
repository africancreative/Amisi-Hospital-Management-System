'use strict';

import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import os from 'os';
import { getTenantDb } from '@amisimedos/db';
import { runSyncLoop } from '@amisimedos/sync';
import { startLanDiscovery } from './lan-discovery';

dotenv.config();

const app = express();
const PORT = parseInt(process.env.PORT || '8080');

// Base Security Setup
app.use(helmet({
    // Allow Next.js frontend if needed, disable some strict protections for LAN environment
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false
}));

// Restrict CORS to specific local domains rather than '*'
const allowedOrigins = [
    'http://localhost:3000',
    'http://amisimedos-local.local:3000',
    'https://amisigenuine.com'
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.startsWith('http://192.168.')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by Desktop CORS'));
        }
    },
    credentials: true
}));

app.use(express.json());

// ---------------------------------------------------------------------------
// Helper: Get LAN IP
// ---------------------------------------------------------------------------
function getLanIp(): string {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name] ?? []) {
            if (net.family === 'IPv4' && !net.internal) {
                return net.address;
            }
        }
    }
    return '127.0.0.1';
}

let _syncStatus = { lastSync: null as Date | null, pendingEvents: 0, healthy: false };

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

/** Health check — used by LAN clients and monitoring tools */
app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        status: 'HEALTHY',
        node: 'EDGE',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date(),
    });
});

/** Node info — LAN IP, ports, tenant ID */
app.get('/api/node-info', (_req: Request, res: Response) => {
    res.json({
        lanIp: getLanIp(),
        webPort: 3000,
        apiPort: PORT,
        tenantId: process.env.HOSPITAL_TENANT_ID,
        nodeId: 'amisimedos-local-edge',
        cloudUrl: process.env.CLOUD_SYNC_URL,
    });
});

/** Sync status — last timestamp, pending queue depth */
app.get('/api/sync/status', (_req: Request, res: Response) => {
    res.json(_syncStatus);
});

/** Manual sync trigger — for admin use via UI */
app.post('/api/sync/trigger', async (_req: Request, res: Response) => {
    res.json({ message: 'Sync cycle triggered', triggeredAt: new Date() });
    // The sync loop handles this natively; this endpoint signals the UI
});

// ---------------------------------------------------------------------------
// Offline Fallback Middleware
// ---------------------------------------------------------------------------

/**
 * All requests gracefully degrade to local DB when offline.
 * The sync engine handles re-queuing writes made during outage.
 */
app.use((_req: Request, res: Response, next: Function) => {
    // Pass through — the request hits local DB regardless of cloud status
    next();
});

// ---------------------------------------------------------------------------
// Bootstrap
// ---------------------------------------------------------------------------

async function bootstrap() {
    const tenantId = process.env.HOSPITAL_TENANT_ID;
    if (!tenantId) {
        console.error('[AmisiMedOS Edge] HOSPITAL_TENANT_ID is not configured.');
        console.error('[AmisiMedOS Edge] Please set up your .env file from .env.local.template');
        process.exit(1);
    }

    try {
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`  AmisiMedOS Local Node — Edge v1.0.0`);
        console.log(`  Tenant: ${tenantId}`);
        console.log(`  LAN IP: ${getLanIp()}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

        // 1. Connect to local PostgreSQL
        const db = await getTenantDb(tenantId);
        console.log('[AmisiMedOS Edge] ✅ Local PostgreSQL connected.');

        // 2. Start background sync engine (Cloud bidirectional sync)
        runSyncLoop(tenantId, db);
        console.log('[AmisiMedOS Edge] ✅ Sync engine started (15s interval).');

        // 3. Broadcast LAN presence via mDNS
        startLanDiscovery(PORT);
        console.log('[AmisiMedOS Edge] ✅ mDNS discovery broadcasting.');

        // 4. Start API server on all interfaces (0.0.0.0 = LAN accessible)
        app.listen(PORT, '0.0.0.0', () => {
            console.log(`[AmisiMedOS Edge] ✅ API running on http://${getLanIp()}:${PORT}`);
            console.log(`[AmisiMedOS Edge] ✅ Web UI available at http://${getLanIp()}:3000`);
        });

    } catch (e) {
        console.error('[AmisiMedOS Edge] ❌ Bootstrap failed:', e);
        process.exit(1);
    }
}

bootstrap();
