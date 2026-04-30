import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import { getControlDb } from '@amisimedos/db';

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

// Routes
app.get('/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'AmisiMedOS Cloud API'
  });
});

app.get('/api/system/status', async (req, res) => {
  try {
    const db = getControlDb();
    const tenantCount = await db.tenant.count();
    res.json({ 
      activeNodes: tenantCount,
      platform: 'AmisiMedOS',
      version: '4.0.0'
    });
  } catch (error) {
    res.status(500).json({ error: 'Database connection failed' });
  }
});

// Cloud Sync Receiver (Downstream from Edge Nodes)
app.post('/api/_sync', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) return res.status(400).send('Missing Tenant ID');

    const { batch } = req.body;
    if (!Array.isArray(batch)) return res.status(400).send('Invalid batch format');

    const { getTenantDb } = await import('@amisimedos/db');
    const db = await getTenantDb(tenantId);
    const results = [];

    for (const item of batch) {
      const { entityType, entityId, action, payload, timestamp } = item;
      const offlineTime = new Date(timestamp);

      if (entityType === 'Patient') {
        const existingRecord = await (db.patient as any).findUnique({ where: { id: entityId } });
        if (existingRecord) {
          if (offlineTime > new Date(existingRecord.updatedAt)) {
            await (db.patient as any).update({ where: { id: entityId }, data: payload });
            results.push({ id: item.id, status: 'merged' });
          } else {
            results.push({ id: item.id, status: 'discarded_stale' });
          }
        } else if (action === 'CREATE') {
          await (db.patient as any).create({ data: { ...payload, id: entityId } });
          results.push({ id: item.id, status: 'created' });
        }
      }
    }
    res.json({ success: true, results });
  } catch (error) {
    console.error('[Sync] Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Cloud Replication API (Upstream for Edge Nodes)
app.get('/api/replication/pull', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) return res.status(400).send('Missing Tenant ID');

    const cursor = req.query.cursor as string;
    const limit = parseInt(req.query.limit as string || '100', 10);

    const { getTenantDb } = await import('@amisimedos/db');
    const db = await getTenantDb(tenantId);

    const changes = await (db as any).cloudSyncJournal.findMany({
      where: cursor ? { sequenceId: { gt: BigInt(cursor) } } : undefined,
      orderBy: { sequenceId: 'asc' },
      take: limit
    });

    const serializedChanges = changes.map((c: any) => ({
      ...c,
      sequenceId: c.sequenceId.toString(),
      timestamp: c.timestamp.toISOString()
    }));

    res.json({
      success: true,
      changes: serializedChanges,
      nextCursor: changes.length > 0 ? changes[changes.length - 1].sequenceId.toString() : cursor,
      hasMore: changes.length === limit
    });
  } catch (error) {
    console.error('[Replication] Error:', error);
    res.status(500).send('Internal Server Error');
  }
});

// Start Server
app.listen(port, () => {
  console.log(`
  🚀 AmisiMedOS Cloud API is running
  ---
  Port: ${port}
  Mode: ${process.env.NODE_ENV || 'development'}
  `);
});
