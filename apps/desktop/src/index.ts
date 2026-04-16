'use strict';

import express, { Request, Response, NextFunction } from 'express';
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
const API_KEY = process.env.LOCAL_API_KEY || 'amisimedos-local-key';
const TRUSTED_IPS = (process.env.TRUSTED_IPS || '127.0.0.1,::1').split(',');

// Security: Rate limiting store
const requestCounts = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100;
const RATE_WINDOW_MS = 60000;

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
    const isLocal = clientIp.startsWith('192.168.') || clientIp.startsWith('10.') || clientIp.startsWith('172.16.') || TRUSTED_IPS.includes(clientIp);
    
    if (!isLocal && process.env.NODE_ENV === 'production') {
        console.warn(`[Security] Blocked non-LAN access from ${clientIp}`);
        res.status(403).json({ error: 'Access denied. LAN connection required.' });
    } else {
        next();
    }
}

function apiKeyMiddleware(req: Request, res: Response, next: NextFunction): void {
    const providedKey = req.headers['x-api-key'] as string;
    if (providedKey && providedKey === API_KEY) {
        next();
    } else if (!providedKey && (req.ip?.startsWith('192.168.') || req.ip?.startsWith('10.') || req.ip === '127.0.0.1')) {
        next();
    } else {
        res.status(401).json({ error: 'Unauthorized. Valid API key required.' });
    }
}

// Base Security Setup
app.use(helmet({
    contentSecurityPolicy: false, 
    crossOriginEmbedderPolicy: false,
    hsts: false
}));

// CORS for LAN
const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:8080',
    'http://127.0.0.1:3000',
    'http://127.0.0.1:8080',
];

app.use(cors({
    origin: function(origin, callback) {
        if (!origin || allowedOrigins.includes(origin) || origin.match(/^http:\/\/192\.168\.\d+\.\d+:3000$/) || origin.match(/^http:\/\/10\.\d+\.\d+\.\d+:3000$/)) {
            callback(null, true);
        } else {
            callback(null, true);
        }
    },
    credentials: true
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Apply security middleware
app.use(rateLimitMiddleware);
app.use(ipFilterMiddleware);
// app.use(apiKeyMiddleware); // Uncomment after testing

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

interface OfflineQueue {
    pending: number;
    lastOffline: string | null;
    isOnline: boolean;
}

let _offlineQueue: OfflineQueue = { pending: 0, lastOffline: null, isOnline: true };

interface SyncStatus {
    lastSync: Date | null;
    pendingEvents: number;
    healthy: boolean;
}

let _syncStatus: SyncStatus = { lastSync: null, pendingEvents: 0, healthy: false };

// ---------------------------------------------------------------------------
// Routes
// ---------------------------------------------------------------------------

app.get('/api/health', (_req: Request, res: Response) => {
    res.json({
        status: 'HEALTHY',
        node: 'EDGE',
        version: process.env.npm_package_version || '1.0.0',
        timestamp: new Date().toISOString(),
        online: _offlineQueue.isOnline,
        sync: _syncStatus,
        offline: {
            pendingWrites: _offlineQueue.pending,
            lastOffline: _offlineQueue.lastOffline
        }
    });
});

app.get('/api/node-info', (_req: Request, res: Response) => {
    res.json({
        lanIp: getLanIp(),
        webPort: 3000,
        apiPort: PORT,
        tenantId: process.env.HOSPITAL_TENANT_ID,
        nodeId: 'amisimedos-local-edge',
        cloudUrl: process.env.CLOUD_SYNC_URL,
        hostname: os.hostname(),
        platform: os.platform(),
    });
});

app.get('/api/sync/status', (_req: Request, res: Response) => {
    res.json({
        ..._syncStatus,
        offline: _offlineQueue
    });
});

app.post('/api/sync/trigger', async (_req: Request, res: Response) => {
    res.json({ message: 'Sync cycle triggered', triggeredAt: new Date().toISOString() });
});

app.get('/api/offline/status', (_req: Request, res: Response) => {
    res.json(_offlineQueue);
});

// ---------------------------------------------------------------------------
// Patient API (Local-first)
// ---------------------------------------------------------------------------

app.get('/api/patients', async (_req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const patients = await db.patient.findMany({
            take: 100,
            orderBy: { createdAt: 'desc' }
        });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patients', details: String(error) });
    }
});

app.get('/api/patients/search', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const { q } = req.query;
        
        if (!q || typeof q !== 'string') {
            return res.status(400).json({ error: 'Search query required' });
        }

        const patients = await db.patient.findMany({
            where: {
                OR: [
                    { mrn: { contains: q, mode: 'insensitive' } },
                    { firstName: { contains: q, mode: 'insensitive' } },
                    { lastName: { contains: q, mode: 'insensitive' } },
                    { phone: { contains: q, mode: 'insensitive' } }
                ]
            },
            take: 20
        });
        res.json(patients);
    } catch (error) {
        res.status(500).json({ error: 'Failed to search patients' });
    }
});

app.get('/api/patients/:id', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const patient = await db.patient.findUnique({
            where: { id: req.params.id },
            include: { 
                encounters: true,
                vitals: true,
                prescriptions: true
            }
        });
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch patient' });
    }
});

app.post('/api/patients', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const patient = await db.patient.create({
            data: {
                firstName: req.body.firstName,
                lastName: req.body.lastName,
                dob: req.body.dob ? new Date(req.body.dob) : new Date(),
                gender: req.body.gender,
                phone: req.body.phone,
                email: req.body.email,
                address: req.body.address,
                mrn: req.body.mrn || `AM-${Date.now()}`,
                emergencyContactName: req.body.emergencyContactName,
                emergencyContactPhone: req.body.emergencyContactPhone,
                insuranceProvider: req.body.insuranceProvider,
                insuranceId: req.body.insuranceId
            }
        });
        res.status(201).json(patient);
    } catch (error) {
        res.status(500).json({ error: 'Failed to create patient', details: String(error) });
    }
});

app.put('/api/patients/:id', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const patient = await db.patient.update({
            where: { id: req.params.id },
            data: req.body
        });
        res.json(patient);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update patient' });
    }
});

app.delete('/api/patients/:id', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        await db.patient.delete({
            where: { id: req.params.id }
        });
        res.status(204).send();
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete patient' });
    }
});

// ---------------------------------------------------------------------------
// Encounter API (OPD/ED/IPD)
// ---------------------------------------------------------------------------

app.post('/api/encounters', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const { patientId, encounterType, doctorName, department, reason } = req.body;

        const visit = await db.visit.create({
            data: {
                patientId,
                type: encounterType === 'IPD' ? 'INPATIENT' : encounterType === 'ED' ? 'EMERGENCY' : 'OUTPATIENT',
                status: 'OPEN',
                reason
            }
        });

        const encounter = await db.encounter.create({
            data: {
                patientId,
                visitId: visit.id,
                encounterType: encounterType || 'OPD',
                doctorName: doctorName || 'Unknown',
                type: encounterType === 'IPD' ? 'Inpatient' : encounterType === 'ED' ? 'Emergency' : 'Outpatient',
                department,
                status: 'CHECKED_IN',
                checkedInAt: new Date()
            }
        });

        res.status(201).json({ visit, encounter });
    } catch (error) {
        res.status(500).json({ error: 'Failed to create encounter', details: String(error) });
    }
});

app.get('/api/encounters/:id', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const encounter = await db.encounter.findUnique({
            where: { id: req.params.id },
            include: {
                patient: true,
                visit: true,
                encounterNotes: true,
                encounterChats: true,
                diagnoses: true,
                prescriptions: true
            }
        });
        if (!encounter) return res.status(404).json({ error: 'Encounter not found' });
        res.json(encounter);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch encounter' });
    }
});

app.patch('/api/encounters/:id/status', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const { status, esiLevel, triageNotes, dischargeSummary } = req.body;

        const updateData: any = { status };
        if (status === 'TRIAGED') {
            updateData.esiLevel = esiLevel;
            updateData.triageNotes = triageNotes;
            updateData.triagedAt = new Date();
        }
        if (status === 'DISCHARGED') {
            updateData.dischargeSummary = dischargeSummary;
            updateData.dischargedAt = new Date();
        }

        const encounter = await db.encounter.update({
            where: { id: req.params.id },
            data: updateData
        });
        res.json(encounter);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update encounter status' });
    }
});

// ---------------------------------------------------------------------------
// Encounter Notes & Chat
// ---------------------------------------------------------------------------

app.post('/api/encounters/:id/notes', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const { authorId, authorName, authorRole, content, noteType } = req.body;

        const note = await db.encounterNote.create({
            data: {
                encounterId: req.params.id,
                authorId,
                authorName,
                authorRole,
                content,
                noteType: noteType || 'GENERAL'
            }
        });
        res.status(201).json(note);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add note' });
    }
});

app.post('/api/encounters/:id/chat', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const { senderId, senderName, senderRole, content } = req.body;

        const chat = await db.encounterChat.create({
            data: {
                encounterId: req.params.id,
                senderId,
                senderName,
                senderRole,
                content
            }
        });
        res.status(201).json(chat);
    } catch (error) {
        res.status(500).json({ error: 'Failed to add chat message' });
    }
});

app.get('/api/encounters/:id/notes', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const notes = await db.encounterNote.findMany({
            where: { encounterId: req.params.id },
            orderBy: { createdAt: 'asc' }
        });
        res.json(notes);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch notes' });
    }
});

app.get('/api/encounters/:id/chat', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const chats = await db.encounterChat.findMany({
            where: { encounterId: req.params.id },
            orderBy: { createdAt: 'asc' }
        });
        res.json(chats);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch chat' });
    }
});

// ---------------------------------------------------------------------------
// Vitals API
// ---------------------------------------------------------------------------

app.post('/api/vitals', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const { patientId, encounterId, bloodPressure, heartRate, temperature, respiratoryRate, spO2, weight, height } = req.body;

        const vital = await db.vitals.create({
            data: {
                patientId,
                encounterId,
                bloodPressure,
                heartRate: heartRate ? parseInt(heartRate) : undefined,
                temperature: temperature ? parseFloat(temperature) : undefined,
                respiratoryRate: respiratoryRate ? parseInt(respiratoryRate) : undefined,
                spO2: spO2 ? parseInt(spO2) : undefined,
                weight: weight ? parseFloat(weight) : undefined,
                height: height ? parseFloat(height) : undefined
            }
        });
        res.status(201).json(vital);
    } catch (error) {
        res.status(500).json({ error: 'Failed to record vitals', details: String(error) });
    }
});

app.get('/api/patients/:id/vitals', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const vitals = await db.vitals.findMany({
            where: { patientId: req.params.id },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(vitals);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch vitals' });
    }
});

// ---------------------------------------------------------------------------
// Employee API
// ---------------------------------------------------------------------------

app.get('/api/employees', async (_req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const employees = await db.employee.findMany({
            select: {
                id: true, employeeId: true, firstName: true, lastName: true,
                role: true, department: true, status: true, email: true
            },
            take: 100
        });
        res.json(employees);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employees' });
    }
});

app.get('/api/employees/:id', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const employee = await db.employee.findUnique({
            where: { id: req.params.id }
        });
        if (!employee) return res.status(404).json({ error: 'Employee not found' });
        res.json(employee);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch employee' });
    }
});

// ---------------------------------------------------------------------------
// Inventory API
// ---------------------------------------------------------------------------

app.get('/api/inventory', async (_req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const items = await db.inventoryItem.findMany({
            take: 100,
            orderBy: { name: 'asc' }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch inventory' });
    }
});

app.get('/api/inventory/alerts', async (_req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const items = await db.inventoryItem.findMany({
            where: {
                quantity: { lte: 10 }
            },
            select: { id: true, name: true, quantity: true, minLevel: true }
        });
        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch alerts' });
    }
});

// ---------------------------------------------------------------------------
// Chat API (Local)
// ---------------------------------------------------------------------------

app.get('/api/chat/conversations', async (_req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const groups = await db.chatGroup.findMany({
            include: { members: { include: { user: true } } },
            take: 50
        });
        res.json(groups);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch conversations' });
    }
});

app.get('/api/chat/messages/:groupId', async (req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const messages = await db.userChatMessage.findMany({
            where: { groupId: req.params.groupId },
            include: { sender: true, attachments: true },
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        res.json(messages);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch messages' });
    }
});

// ---------------------------------------------------------------------------
// Billing API
// ---------------------------------------------------------------------------

app.get('/api/invoices', async (_req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const invoices = await db.invoice.findMany({
            include: { patient: true },
            orderBy: { createdAt: 'desc' },
            take: 50
        });
        res.json(invoices);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch invoices' });
    }
});

// ---------------------------------------------------------------------------
// Audit & Event Log
// ---------------------------------------------------------------------------

app.get('/api/audit', async (_req: Request, res: Response) => {
    try {
        const tenantId = process.env.HOSPITAL_TENANT_ID!;
        const db = await getTenantDb(tenantId);
        const logs = await db.auditLog.findMany({
            orderBy: { timestamp: 'desc' },
            take: 100
        });
        res.json(logs);
    } catch (error) {
        res.status(500).json({ error: 'Failed to fetch audit logs' });
    }
});

// ---------------------------------------------------------------------------
// Offline Fallback Middleware
// ---------------------------------------------------------------------------

app.use((req: Request, res: Response, next: NextFunction) => {
    // All requests hit local DB - offline fallback is handled by sync engine
    next();
});

// ---------------------------------------------------------------------------
// Error Handler
// ---------------------------------------------------------------------------

app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
    console.error('[AmisiMedOS Edge] Error:', err.message);
    res.status(500).json({ error: 'Internal server error', message: err.message });
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

        const db = await getTenantDb(tenantId);
        console.log('[AmisiMedOS Edge] ✅ Local PostgreSQL connected.');

        runSyncLoop(tenantId, db);
        console.log('[AmisiMedOS Edge] ✅ Sync engine started (15s interval).');

        startLanDiscovery(PORT);
        console.log('[AmisiMedOS Edge] ✅ mDNS discovery broadcasting.');

        app.listen(PORT, '0.0.0.0', () => {
            console.log(`\n┌─────────────────────────────────────────────────────────────┐`);
            console.log(`│  AmisiMedOS Local Node - Ready for Multi-Device Access   │`);
            console.log(`├─────────────────────────────────────────────────────────────┤`);
            console.log(`│  API Server:    http://${getLanIp()}:${PORT}/api                  │`);
            console.log(`│  Web UI:        http://${getLanIp()}:3000                       │`);
            console.log(`│  Health:        http://${getLanIp()}:${PORT}/api/health            │`);
            console.log(`├─────────────────────────────────────────────────────────────┤`);
            console.log(`│  Access from other devices on the network:               │`);
            console.log(`│  1. Ensure device is on same LAN (192.168.x.x)           │`);
            console.log(`│  2. Open browser to http://${getLanIp()}:3000               │`);
            console.log(`│  3. Use API: http://${getLanIp()}:${PORT}/api/<endpoint>        │`);
            console.log(`└─────────────────────────────────────────────────────────────┘\n`);
        });

    } catch (e) {
        console.error('[AmisiMedOS Edge] ❌ Bootstrap failed:', e);
        process.exit(1);
    }
}

bootstrap();
