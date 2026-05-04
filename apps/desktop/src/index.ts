import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import os from 'os';
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { getTenantDb, mapToFHIRPatient, mapToFHIREncounter } from '@amisimedos/db';
import { runSyncLoop } from '@amisimedos/sync';
import { startLanDiscovery } from './lan-discovery';
import { ROLE_PERMISSIONS } from '@amisimedos/auth';

dotenv.config();

// ─── Config loader: first-run checks ~/.amisimedos/config.json ───────────────
const CONFIG_DIR  = path.join(os.homedir(), '.amisimedos');
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json');

interface NodeConfig {
    HOSPITAL_TENANT_ID: string;
    HOSPITAL_SLUG: string;
    LOCAL_EDGE_DATABASE_URL: string;
    LOCAL_EDGE_DIRECT_URL: string;
    CLOUD_SYNC_URL: string;
}

function loadNodeConfig(): NodeConfig | null {
    try {
        if (!fs.existsSync(CONFIG_FILE)) return null;
        return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')) as NodeConfig;
    } catch { return null; }
}

function saveNodeConfig(cfg: NodeConfig): void {
    if (!fs.existsSync(CONFIG_DIR)) fs.mkdirSync(CONFIG_DIR, { recursive: true });
    fs.writeFileSync(CONFIG_FILE, JSON.stringify(cfg, null, 2));
}

// Apply persisted config over env vars
const savedConfig = loadNodeConfig();
if (savedConfig) {
    process.env.HOSPITAL_TENANT_ID       = savedConfig.HOSPITAL_TENANT_ID;
    process.env.HOSPITAL_SLUG            = savedConfig.HOSPITAL_SLUG;
    process.env.LOCAL_EDGE_DATABASE_URL  = savedConfig.LOCAL_EDGE_DATABASE_URL;
    process.env.LOCAL_EDGE_DIRECT_URL    = savedConfig.LOCAL_EDGE_DIRECT_URL;
    process.env.CLOUD_SYNC_URL           = savedConfig.CLOUD_SYNC_URL;
}

const app = express();
const PORT      = parseInt(process.env.PORT || '8080');
const API_KEY   = process.env.LOCAL_API_KEY || 'amisimedos-local-key';
const JWT_SECRET = process.env.JWT_SECRET   || 'demo-secret-key-change-me';
const TRUSTED_IPS = (process.env.TRUSTED_IPS || '127.0.0.1,::1').split(',');

// ─── JWT helpers (zero-dep) ──────────────────────────────────────────────────
function b64url(buf: Buffer | string): string {
    const s = typeof buf === 'string' ? buf : buf.toString('base64');
    return s.replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '');
}
function verifyJwt(token: string): Record<string, any> | null {
    try {
        const [h, b, s] = token.split('.');
        const expectedSig = b64url(crypto.createHmac('sha256', JWT_SECRET).update(`${h}.${b}`).digest('base64'));
        if (s !== expectedSig) return null;
        const payload = JSON.parse(Buffer.from(b, 'base64url').toString());
        if (payload.exp && payload.exp < Math.floor(Date.now() / 1000)) return null;
        return payload;
    } catch { return null; }
}

// ─── Security: Rate limiting ─────────────────────────────────────────────────
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100, RATE_WINDOW_MS = 60000;

function rateLimitMiddleware(req: Request, res: Response, next: NextFunction): void {
    const ip = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const record = requestCounts.get(ip);
    if (!record || now > record.resetTime) {
        requestCounts.set(ip, { count: 1, resetTime: now + RATE_WINDOW_MS });
        next();
    } else if (record.count >= RATE_LIMIT) {
        res.status(429).json({ error: 'Too many requests', retryAfter: Math.ceil((record.resetTime - now) / 1000) });
    } else {
        record.count++;
        next();
    }
}

function ipFilterMiddleware(req: Request, res: Response, next: NextFunction): void {
    const clientIp = req.ip || req.socket.remoteAddress || '';
    const isLocal = clientIp.startsWith('192.168.') || clientIp.startsWith('10.') ||
                    clientIp.startsWith('172.16.')   || TRUSTED_IPS.includes(clientIp);
    if (!isLocal && process.env.NODE_ENV === 'production') {
        console.warn(`[Security] Blocked non-LAN access from ${clientIp}`);
        res.status(403).json({ error: 'Access denied. LAN connection required.' });
    } else {
        next();
    }
}

// ─── RBAC middleware ─────────────────────────────────────────────────────────
interface AuthRequest extends Request { user?: Record<string, any>; }

function requireAuth(req: AuthRequest, res: Response, next: NextFunction): void {
    const authHeader = req.headers.authorization;
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null;
    if (!token) {
        res.status(401).json({ error: 'Authorization required. Include Bearer token.' });
        return;
    }
    const payload = verifyJwt(token);
    if (!payload) {
        res.status(401).json({ error: 'Invalid or expired token.' });
        return;
    }
    req.user = payload;
    next();
}

function requirePermission(permission: string) {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        const role = req.user?.role as string;
        if (!role) { res.status(401).json({ error: 'Not authenticated' }); return; }
        const rolePerms = ROLE_PERMISSIONS[role as keyof typeof ROLE_PERMISSIONS];
        if (!rolePerms || !rolePerms.includes(permission as any)) {
            console.warn(`[RBAC] Denied: ${role} attempted ${permission}`);
            res.status(403).json({ error: `Forbidden: ${role} cannot perform ${permission}` });
            return;
        }
        next();
    };
}

// ─── Express setup ───────────────────────────────────────────────────────────
app.use(helmet({ contentSecurityPolicy: false, crossOriginEmbedderPolicy: false, hsts: false }));

const allowedOrigins = ['http://localhost:3000','http://localhost:8080','http://127.0.0.1:3000'];
app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin) ||
            origin.match(/^http:\/\/192\.168\.\d+\.\d+:300[0-9]$/) ||
            origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:300[0-9]$/)) {
            callback(null, true);
        } else {
            callback(null, false);
        }
    },
    credentials: true
}));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(rateLimitMiddleware);
app.use(ipFilterMiddleware);

function getLanIp(): string {
    const nets = os.networkInterfaces();
    for (const name of Object.keys(nets)) {
        for (const net of nets[name] ?? []) {
            if (net.family === 'IPv4' && !net.internal) return net.address;
        }
    }
    return '127.0.0.1';
}

interface OfflineQueue { pending: number; lastOffline: string | null; isOnline: boolean; }
let _offlineQueue: OfflineQueue = { pending: 0, lastOffline: null, isOnline: true };
interface SyncStatus { lastSync: Date | null; pendingEvents: number; healthy: boolean; }
let _syncStatus: SyncStatus = { lastSync: null, pendingEvents: 0, healthy: false };

// ─── Public routes (no auth required) ────────────────────────────────────────
app.get('/api/health', (_req, res) => {
    res.json({
        status: 'HEALTHY', node: 'EDGE',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        online: _offlineQueue.isOnline, sync: _syncStatus,
        offline: { pendingWrites: _offlineQueue.pending, lastOffline: _offlineQueue.lastOffline }
    });
});

app.get('/api/node-info', (_req, res) => {
    res.json({
        lanIp: getLanIp(), webPort: 3000, apiPort: PORT,
        tenantId: process.env.HOSPITAL_TENANT_ID,
        slug: process.env.HOSPITAL_SLUG,
        nodeId: 'amisimedos-local-edge',
        cloudUrl: process.env.CLOUD_SYNC_URL,
        hostname: os.hostname(), platform: os.platform(),
        setupComplete: !!savedConfig,
    });
});

// ─── Setup endpoint (first-run, LAN-only) ────────────────────────────────────
app.post('/api/setup', async (req, res) => {
    if (savedConfig) {
        res.status(409).json({ error: 'Node already configured. Delete ~/.amisimedos/config.json to reset.' });
        return;
    }
    try {
        const { tenantId, slug, dbName, dbPassword, cloudUrl } = req.body;
        if (!tenantId || !slug || !dbName || !dbPassword) {
            res.status(400).json({ error: 'tenantId, slug, dbName and dbPassword are required' });
            return;
        }
        const dbUser = req.body.dbUser || 'postgres';
        const dbHost = req.body.dbHost || 'localhost';
        const dbPort = req.body.dbPort || '5432';
        const edgeUrl = `postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`;

        const config: NodeConfig = {
            HOSPITAL_TENANT_ID:      tenantId,
            HOSPITAL_SLUG:           slug,
            LOCAL_EDGE_DATABASE_URL: edgeUrl,
            LOCAL_EDGE_DIRECT_URL:   edgeUrl,
            CLOUD_SYNC_URL:          cloudUrl || `https://amisigenuine.com/api/sync`,
        };
        saveNodeConfig(config);

        // Apply immediately without restart
        process.env.HOSPITAL_TENANT_ID      = config.HOSPITAL_TENANT_ID;
        process.env.LOCAL_EDGE_DATABASE_URL = config.LOCAL_EDGE_DATABASE_URL;
        process.env.LOCAL_EDGE_DIRECT_URL   = config.LOCAL_EDGE_DIRECT_URL;
        process.env.CLOUD_SYNC_URL          = config.CLOUD_SYNC_URL;

        res.json({ ok: true, message: 'Node configured successfully. Restart recommended.' });
    } catch (err: any) {
        res.status(500).json({ error: 'Setup failed', detail: err.message });
    }
});

app.get('/api/sync/status', (_req, res) => res.json({ ..._syncStatus, offline: _offlineQueue }));
app.post('/api/sync/trigger', (_req, res) => res.json({ message: 'Sync triggered', triggeredAt: new Date().toISOString() }));

// ─── Protected clinical routes ────────────────────────────────────────────────
// All routes below require a valid JWT (Bearer token from login)

app.get('/api/patients', requireAuth, requirePermission('patient:read'), async (_req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        res.json(await db.patient.findMany({ take: 100, orderBy: { createdAt: 'desc' } }));
    } catch (e) { res.status(500).json({ error: 'Failed to fetch patients', details: String(e) }); }
});

app.get('/api/patients/search', requireAuth, requirePermission('patient:read'), async (req: AuthRequest, res) => {
    const { q } = req.query;
    if (!q || typeof q !== 'string') { res.status(400).json({ error: 'Search query required' }); return; }
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        res.json(await db.patient.findMany({
            where: { OR: [
                { mrn: { contains: q, mode: 'insensitive' } },
                { firstName: { contains: q, mode: 'insensitive' } },
                { lastName: { contains: q, mode: 'insensitive' } },
                { phone: { contains: q, mode: 'insensitive' } }
            ]}, take: 20
        }));
    } catch (e) { res.status(500).json({ error: 'Failed to search patients' }); }
});

app.get('/api/patients/:id', requireAuth, requirePermission('patient:read'), async (req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        const patient = await db.patient.findUnique({
            where: { id: req.params.id },
            include: { encounters: true, vitals: true, prescriptions: true }
        });
        if (!patient) { res.status(404).json({ error: 'Patient not found' }); return; }
        res.json(patient);
    } catch (e) { res.status(500).json({ error: 'Failed to fetch patient' }); }
});

app.post('/api/patients', requireAuth, requirePermission('patient:write'), async (req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        const patient = await db.patient.create({
            data: {
                firstName: req.body.firstName, lastName: req.body.lastName,
                dob: req.body.dob ? new Date(req.body.dob) : new Date(),
                gender: req.body.gender, phone: req.body.phone, email: req.body.email,
                address: req.body.address, mrn: req.body.mrn || `AM-${Date.now()}`,
                emergencyContactName: req.body.emergencyContactName,
                emergencyContactPhone: req.body.emergencyContactPhone,
                insuranceProvider: req.body.insuranceProvider, insuranceId: req.body.insuranceId
            }
        });
        res.status(201).json(patient);
    } catch (e) { res.status(500).json({ error: 'Failed to create patient', details: String(e) }); }
});

app.put('/api/patients/:id', requireAuth, requirePermission('patient:write'), async (req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        res.json(await db.patient.update({ where: { id: req.params.id }, data: req.body }));
    } catch (e) { res.status(500).json({ error: 'Failed to update patient' }); }
});

app.delete('/api/patients/:id', requireAuth, requirePermission('patient:delete'), async (req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        await db.patient.delete({ where: { id: req.params.id } });
        res.status(204).send();
    } catch (e) { res.status(500).json({ error: 'Failed to delete patient' }); }
});

// Encounters
app.post('/api/encounters', requireAuth, requirePermission('encounter:write'), async (req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        const { patientId, encounterType, doctorName, department, reason } = req.body;
        const visit = await db.visit.create({ data: {
            patientId, type: encounterType === 'IPD' ? 'INPATIENT' : encounterType === 'ED' ? 'EMERGENCY' : 'OUTPATIENT', status: 'OPEN', reason
        }});
        const encounter = await db.encounter.create({ data: {
            patientId, visitId: visit.id,
            encounterType: encounterType || 'OPD',
            doctorName: doctorName || 'Unknown',
            type: encounterType === 'IPD' ? 'Inpatient' : encounterType === 'ED' ? 'Emergency' : 'Outpatient',
            department, status: 'CHECKED_IN', checkedInAt: new Date()
        }});
        res.status(201).json({ visit, encounter });
    } catch (e) { res.status(500).json({ error: 'Failed to create encounter', details: String(e) }); }
});

app.get('/api/encounters/:id', requireAuth, requirePermission('encounter:read'), async (req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        const enc = await db.encounter.findUnique({
            where: { id: req.params.id },
            include: { patient: true, visit: true, encounterNotes: true, encounterChats: true, diagnoses: true, prescriptions: true }
        });
        if (!enc) { res.status(404).json({ error: 'Encounter not found' }); return; }
        res.json(enc);
    } catch (e) { res.status(500).json({ error: 'Failed to fetch encounter' }); }
});

app.patch('/api/encounters/:id/status', requireAuth, requirePermission('encounter:write'), async (req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        const { status, esiLevel, triageNotes, dischargeSummary } = req.body;
        const data: any = { status };
        if (status === 'TRIAGED') { data.esiLevel = esiLevel; data.triageNotes = triageNotes; data.triagedAt = new Date(); }
        if (status === 'DISCHARGED') { data.dischargeSummary = dischargeSummary; data.dischargedAt = new Date(); }
        res.json(await db.encounter.update({ where: { id: req.params.id }, data }));
    } catch (e) { res.status(500).json({ error: 'Failed to update encounter status' }); }
});

// Notes & Chat
app.post('/api/encounters/:id/notes', requireAuth, requirePermission('encounter:write'), async (req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        const { authorId, authorName, authorRole, content, noteType } = req.body;
        res.status(201).json(await db.encounterNote.create({ data: { encounterId: req.params.id, authorId, authorName, authorRole, content, noteType: noteType || 'GENERAL' } }));
    } catch (e) { res.status(500).json({ error: 'Failed to add note' }); }
});

app.post('/api/encounters/:id/chat', requireAuth, requirePermission('chat:write'), async (req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        const { senderId, senderName, senderRole, content } = req.body;
        res.status(201).json(await db.encounterChat.create({ data: { encounterId: req.params.id, senderId, senderName, senderRole, content } }));
    } catch (e) { res.status(500).json({ error: 'Failed to send chat' }); }
});

app.get('/api/encounters/:id/notes', requireAuth, requirePermission('encounter:read'), async (req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        res.json(await db.encounterNote.findMany({ where: { encounterId: req.params.id }, orderBy: { createdAt: 'asc' } }));
    } catch (e) { res.status(500).json({ error: 'Failed to fetch notes' }); }
});

// Vitals
app.post('/api/vitals', requireAuth, requirePermission('patient:write'), async (req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        const { patientId, encounterId, bloodPressure, heartRate, temperature, respiratoryRate, spO2, weight, height } = req.body;
        res.status(201).json(await db.vitals.create({ data: {
            patientId, encounterId, bloodPressure,
            heartRate: heartRate ? parseInt(heartRate) : undefined,
            temperature: temperature ? parseFloat(temperature) : undefined,
            respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : undefined,
            spO2: spO2 ? parseInt(spO2) : undefined,
            weight: weight ? parseFloat(weight) : undefined,
            height: height ? parseFloat(height) : undefined
        }}));
    } catch (e) { res.status(500).json({ error: 'Failed to record vitals', details: String(e) }); }
});

app.get('/api/patients/:id/vitals', requireAuth, requirePermission('patient:read'), async (req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        res.json(await db.vitals.findMany({ where: { patientId: req.params.id }, orderBy: { createdAt: 'desc' }, take: 50 }));
    } catch (e) { res.status(500).json({ error: 'Failed to fetch vitals' }); }
});

// Employees (read-only for non-admins)
app.get('/api/employees', requireAuth, requirePermission('patient:read'), async (_req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        res.json(await db.employee.findMany({
            select: { id: true, employeeId: true, firstName: true, lastName: true, role: true, department: true, status: true, email: true },
            take: 100
        }));
    } catch (e) { res.status(500).json({ error: 'Failed to fetch employees' }); }
});

// Inventory
app.get('/api/inventory', requireAuth, requirePermission('inventory:read'), async (_req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        res.json(await db.inventoryItem.findMany({ take: 100, orderBy: { name: 'asc' } }));
    } catch (e) { res.status(500).json({ error: 'Failed to fetch inventory' }); }
});

// Billing
app.get('/api/invoices', requireAuth, requirePermission('billing:read'), async (_req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        res.json(await db.invoice.findMany({ include: { patient: true }, orderBy: { createdAt: 'desc' }, take: 50 }));
    } catch (e) { res.status(500).json({ error: 'Failed to fetch invoices' }); }
});

// Audit (admin only)
app.get('/api/audit', requireAuth, requirePermission('audit:read'), async (_req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        res.json(await db.auditLog.findMany({ orderBy: { timestamp: 'desc' }, take: 100 }));
    } catch (e) { res.status(500).json({ error: 'Failed to fetch audit logs' }); }
});

// FHIR R4
app.get('/api/fhir/Patient/:id', requireAuth, requirePermission('patient:read'), async (req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        const patient = await db.patient.findUnique({ where: { id: req.params.id } });
        if (!patient) { res.status(404).json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'not-found' }] }); return; }
        res.setHeader('Content-Type', 'application/fhir+json');
        res.json(mapToFHIRPatient(patient as any));
    } catch (e) { res.status(500).json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'exception', diagnostics: String(e) }] }); }
});

app.get('/api/fhir/Encounter/:id', requireAuth, requirePermission('encounter:read'), async (req: AuthRequest, res) => {
    try {
        const db = await getTenantDb(process.env.HOSPITAL_TENANT_ID!);
        const enc = await db.encounter.findUnique({ where: { id: req.params.id } });
        if (!enc) { res.status(404).json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'not-found' }] }); return; }
        res.setHeader('Content-Type', 'application/fhir+json');
        res.json(mapToFHIREncounter(enc as any));
    } catch (e) { res.status(500).json({ resourceType: 'OperationOutcome', issue: [{ severity: 'error', code: 'exception', diagnostics: String(e) }] }); }
});

// ─── Error handler ───────────────────────────────────────────────────────────
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[AmisiMedOS Edge] Error:', err.message);
    res.status(500).json({ error: 'Internal server error', message: err.message });
});

// ─── Bootstrap ───────────────────────────────────────────────────────────────
async function bootstrap() {
    const tenantId = process.env.HOSPITAL_TENANT_ID;

    if (!tenantId) {
        // First-run mode: start server without tenant, awaiting /api/setup
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('  AmisiMedOS Local Node — FIRST RUN MODE');
        console.log('  No hospital configured yet.');
        console.log('  Open the desktop app to complete setup.');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
        app.listen(PORT, '0.0.0.0', () => console.log(`Setup endpoint ready: http://localhost:${PORT}/api/setup`));
        return;
    }

    try {
        console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
        console.log(`  AmisiMedOS Local Node — Edge v1.0.0`);
        console.log(`  Tenant : ${tenantId}`);
        console.log(`  LAN IP : ${getLanIp()}`);
        console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);

        const db = await getTenantDb(tenantId);
        console.log('[AmisiMedOS Edge] ✅ Local PostgreSQL connected.');

        runSyncLoop(tenantId, db);
        console.log('[AmisiMedOS Edge] ✅ Sync engine started.');

        startLanDiscovery(PORT);
        console.log('[AmisiMedOS Edge] ✅ mDNS discovery broadcasting.');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n┌────────────────────────────────────────────────────────┐`);
            console.log(`│  AmisiMedOS Local Node — Ready                         │`);
            console.log(`├────────────────────────────────────────────────────────┤`);
            console.log(`│  API:    http://${getLanIp()}:${PORT}/api               │`);
            console.log(`│  Health: http://${getLanIp()}:${PORT}/api/health        │`);
            console.log(`│  Auth required on all clinical endpoints (Bearer JWT)  │`);
            console.log(`└────────────────────────────────────────────────────────┘\n`);
        });

    } catch (e) {
        console.error('[AmisiMedOS Edge] ❌ Bootstrap failed:', e);
        process.exit(1);
    }
}

bootstrap();
