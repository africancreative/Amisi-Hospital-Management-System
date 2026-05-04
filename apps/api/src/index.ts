import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import { getControlDb } from '@amisimedos/db';
import { createAuditService } from '@amisimedos/auth';

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

app.get('/api/sync/telemetry', async (req, res) => {
  try {
    const db = getControlDb();
    const stats = await db.syncNode.findMany({
      select: {
        id: true,
        nodeName: true,
        status: true,
        lastHeartbeat: true,
        version: true
      }
    });
    res.json({
      timestamp: new Date().toISOString(),
      nodes: stats,
      summary: {
        total: stats.length,
        healthy: stats.filter((n: any) => n.status === 'HEALTHY').length,
        degraded: stats.filter((n: any) => n.status !== 'HEALTHY').length
      }
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch sync telemetry' });
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

// --- FHIR INTEROPERABILITY ENDPOINTS (Section 5.3) ---

app.get('/api/fhir/v4/Patient/:id', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    if (!tenantId) return res.status(400).send('Missing Tenant ID');

    const { getTenantDb } = await import('@amisimedos/db');
    const db = await getTenantDb(tenantId);
    
    const patient = await (db.patient as any).findUnique({ where: { id: req.params.id } });
    if (!patient) return res.status(404).send('Patient not found');

    // Map to FHIR R4
    const fhirPatient = {
      resourceType: 'Patient',
      id: patient.id,
      identifier: [{ system: 'https://amisigenuine.com/fhir/sid/mrn', value: patient.mrn }],
      name: [{ family: patient.lastName, given: [patient.firstName] }],
      gender: patient.gender?.toLowerCase() || 'unknown',
      birthDate: patient.dob.toISOString().split('T')[0],
      meta: { lastUpdated: patient.updatedAt.toISOString(), versionId: patient.version.toString() }
    };

    res.json(fhirPatient);
  } catch (error) {
    res.status(500).json({ error: 'FHIR Translation failed' });
  }
});

app.get('/api/fhir/v4/Observation', async (req, res) => {
  try {
    const tenantId = req.headers['x-tenant-id'] as string;
    const patientId = req.query.patient as string;
    if (!tenantId || !patientId) return res.status(400).send('Missing parameters');

    const { getTenantDb } = await import('@amisimedos/db');
    const db = await getTenantDb(tenantId);

    const vitals = await (db.vitals as any).findMany({
      where: { patientId },
      orderBy: { createdAt: 'desc' },
      take: 10
    });

    const bundle = {
      resourceType: 'Bundle',
      type: 'searchset',
      total: vitals.length,
      entry: vitals.map((v: any) => ({
        resource: {
          resourceType: 'Observation',
          id: v.id,
          status: 'final',
          subject: { reference: `Patient/${patientId}` },
          effectiveDateTime: v.createdAt.toISOString(),
          code: {
            coding: [{ system: 'http://loinc.org', code: '8867-4', display: 'Heart rate' }],
            text: 'Heart rate'
          },
          valueQuantity: { value: v.pulse, unit: 'bpm', system: 'http://unitsofmeasure.org', code: '/min' }
        }
      }))
    };

    res.json(bundle);
  } catch (error) {
    res.status(500).json({ error: 'FHIR Bundle generation failed' });
  }
});

// Start Server
app.listen(port, async () => {
  console.log(`
  🚀 AmisiMedOS Cloud API is running
  ---
  Port: ${port}
  Mode: ${process.env.NODE_ENV || 'development'}
  `);

  try {
    const { getControlDb } = await import('@amisimedos/db');
    const db = getControlDb();
    const audit = createAuditService(db as any, process.env.SYNC_SHARED_SECRET || 'fallback');
    const status = await audit.verifyIntegrity();
    console.log(`[Audit] Integrity Check: ${status.valid ? '✅ VALID' : '❌ COMPROMISED'} (${status.totalEntries} entries)`);
  } catch (err) {
    console.error('[Audit] Integrity check failed to run:', err);
  }
});
