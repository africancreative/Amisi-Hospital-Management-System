'use server';

import { getTenantDb } from '@/lib/db';
import { getServerUser } from '@/lib/auth-utils';
import { headers } from 'next/headers';
import { createHash } from 'crypto';

// ─── Constants ────────────────────────────────────────────────────────────

const GENESIS_HASH = createHash('sha256').update('amisimedos-audit-genesis-v1').digest('hex');

const RETENTION_YEARS: Record<string, number> = {
  ACTIVITY: 2,
  AUTH: 5,
  DATA_CHANGE: 7,
  ACCESS: 3,
  CHAT: 2,
  ADMIN: 7,
  BILLING: 7,
};

// ─── Types ────────────────────────────────────────────────────────────────

export interface AuditActionParams {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  category?: string;
  severity?: string;
  patientId?: string;
  sessionId?: string;
  department?: string;
}

export interface RecordChangeParams {
  entityType: string;
  entityId: string;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE';
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  changedFields?: string[];
}

export interface ChatAuditParams {
  messageId?: string;
  groupId?: string;
  patientId?: string;
  action: 'EDIT' | 'DELETE' | 'FORWARD' | 'SCREENSHOT' | 'EXPORT' | 'PIN' | 'UNPIN' | 'REACT';
  originalContent?: string;
  newContent?: string;
}

export interface AccessLogParams {
  resourceType: string;
  resourceId: string;
  patientId?: string;
  accessReason?: string;
  accessDuration?: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────

async function getTenantIdFromHeaders(): Promise<string> {
  const headerList = await headers();
  const tenantId = headerList.get('x-tenant-id');
  if (!tenantId) throw new Error('No tenant context for audit');
  return tenantId;
}

async function getChainPosition(tenantId: string): Promise<bigint> {
  const db = await getTenantDb(tenantId);
  const last = await db.auditLog.findFirst({
    orderBy: { chainPosition: 'desc' },
    select: { chainPosition: true },
  });
  return last ? last.chainPosition + BigInt(1) : BigInt(0);
}

function computeHash(
  entry: {
    id: string;
    action: string;
    resource: string;
    resourceId?: string | null;
    actorId: string;
    timestamp: Date;
  },
  prevHash: string
): string {
  const canonical = JSON.stringify({
    prevHash,
    id: entry.id,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId,
    actorId: entry.actorId,
    timestamp: entry.timestamp.toISOString(),
  });
  return createHash('sha256').update(canonical).digest('hex');
}

function getRetainUntil(category: string): Date | undefined {
  const years = RETENTION_YEARS[category] ?? 2;
  const date = new Date();
  date.setFullYear(date.getFullYear() + years);
  return date;
}

// ─── Core: Audit Action ───────────────────────────────────────────────────

export async function auditAction(params: AuditActionParams): Promise<{ id: string; hash: string; chainPosition: bigint }> {
  const db = await getTenantDb();
  const tenantId = await getTenantIdFromHeaders();
  const user = await getServerUser();
  const headerList = await headers();

  const actorId = user?.id ?? 'SYSTEM';
  const actorName = user?.name ?? 'System';
  const actorRole = user?.role ?? 'SYSTEM';
  const ipAddress = headerList.get('x-forwarded-for') ?? headerList.get('x-real-ip');
  const userAgent = headerList.get('user-agent');

  const chainPosition = await getChainPosition(tenantId);
  const category = params.category ?? 'ACTIVITY';
  const severity = params.severity ?? 'INFO';

  // Get previous hash for chain
  const prevEntry = await db.auditLog.findFirst({
    where: { chainPosition: { lte: chainPosition - BigInt(1) } },
    orderBy: { chainPosition: 'desc' },
    select: { hash: true },
  });
  const prevHash = prevEntry?.hash ?? GENESIS_HASH;

  // Create with temporary hash (will be computed after we have the ID)
  const entry = await db.auditLog.create({
    data: {
      actorId,
      actorName,
      actorRole,
      sessionId: params.sessionId,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details as any,
      ipAddress,
      userAgent,
      department: params.department,
      category,
      severity,
      prevHash,
      hash: '', // will be updated below
      chainPosition,
      retainUntil: getRetainUntil(category),
    },
    select: { id: true, timestamp: true, hash: true },
  });

  // Compute and update hash
  const hash = computeHash(
    {
      id: entry.id,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      actorId,
      timestamp: entry.timestamp,
    },
    prevHash
  );

  await db.auditLog.update({
    where: { id: entry.id },
    data: { hash },
  });

  return { id: entry.id, hash, chainPosition };
}

// ─── Record Change ────────────────────────────────────────────────────────

export async function recordChange(params: RecordChangeParams): Promise<void> {
  const db = await getTenantDb();
  const user = await getServerUser();

  const actorId = user?.id ?? 'SYSTEM';
  const actorName = user?.name ?? 'System';

  // Create parent audit log
  const auditResult = await auditAction({
    action: params.changeType,
    resource: params.entityType,
    resourceId: params.entityId,
    category: 'DATA_CHANGE',
    severity: params.changeType === 'DELETE' ? 'WARNING' : 'INFO',
  });

  // Determine changed fields
  let changedFields = params.changedFields ?? [];
  if (changedFields.length === 0 && params.beforeState && params.afterState) {
    changedFields = Object.keys(params.afterState).filter(
      (key) => JSON.stringify(params.beforeState?.[key]) !== JSON.stringify(params.afterState?.[key])
    );
  }

  // Create record change entry
  await db.auditRecordChange.create({
    data: {
      auditLogId: auditResult.id,
      entityType: params.entityType,
      entityId: params.entityId,
      changeType: params.changeType,
      beforeState: params.beforeState as any,
      afterState: params.afterState as any,
      changedFields,
      actorId,
      actorName,
    },
  });
}

// ─── Chat Audit ───────────────────────────────────────────────────────────

export async function auditChatAction(params: ChatAuditParams): Promise<void> {
  const db = await getTenantDb();
  const user = await getServerUser();

  const actorId = user?.id ?? 'SYSTEM';
  const actorName = user?.name ?? 'System';

  const auditResult = await auditAction({
    action: params.action,
    resource: 'ChatMessage',
    resourceId: params.messageId,
    category: 'CHAT',
    severity: params.action === 'DELETE' ? 'WARNING' : 'INFO',
    patientId: params.patientId,
  });

  await db.auditChatAction.create({
    data: {
      auditLogId: auditResult.id,
      messageId: params.messageId,
      groupId: params.groupId,
      patientId: params.patientId,
      action: params.action,
      originalContent: params.originalContent,
      newContent: params.newContent,
      actorId,
      actorName,
    },
  });
}

// ─── Access Log ───────────────────────────────────────────────────────────

export async function logAccess(params: AccessLogParams): Promise<void> {
  const db = await getTenantDb();
  const user = await getServerUser();
  const headerList = await headers();

  const actorId = user?.id ?? 'SYSTEM';
  const actorName = user?.name ?? 'System';
  const actorRole = user?.role ?? 'SYSTEM';
  const ipAddress = headerList.get('x-forwarded-for') ?? headerList.get('x-real-ip');

  const auditResult = await auditAction({
    action: 'ACCESS',
    resource: params.resourceType,
    resourceId: params.resourceId,
    category: 'ACCESS',
    patientId: params.patientId,
  });

  await db.auditAccessLog.create({
    data: {
      auditLogId: auditResult.id,
      resourceType: params.resourceType,
      resourceId: params.resourceId,
      patientId: params.patientId,
      accessReason: params.accessReason,
      accessDuration: params.accessDuration,
      actorId,
      actorName,
      actorRole,
      ipAddress,
    },
  });
}

// ─── Chain Verification ───────────────────────────────────────────────────

export interface ChainVerificationResult {
  valid: boolean;
  brokenAt?: bigint;
  totalEntries: number;
  checkedFrom: bigint;
}

export async function verifyAuditChain(fromPosition: number = 0): Promise<ChainVerificationResult> {
  const db = await getTenantDb();

  const entries = await db.auditLog.findMany({
    where: { chainPosition: { gte: BigInt(fromPosition) } },
    orderBy: { chainPosition: 'asc' },
    select: {
      id: true,
      action: true,
      resource: true,
      resourceId: true,
      actorId: true,
      timestamp: true,
      prevHash: true,
      hash: true,
      chainPosition: true,
    },
  });

  if (entries.length === 0) return { valid: true, totalEntries: 0, checkedFrom: BigInt(fromPosition) };

  let expectedPrevHash = fromPosition === 0 ? GENESIS_HASH : entries[0].prevHash;

  for (const entry of entries) {
    if (entry.prevHash !== expectedPrevHash) {
      return {
        valid: false,
        brokenAt: entry.chainPosition,
        totalEntries: entries.length,
        checkedFrom: BigInt(fromPosition),
      };
    }

    const computed = computeHash(
      {
        id: entry.id,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        actorId: entry.actorId,
        timestamp: entry.timestamp,
      },
      entry.prevHash!
    );

    if (computed !== entry.hash) {
      return {
        valid: false,
        brokenAt: entry.chainPosition,
        totalEntries: entries.length,
        checkedFrom: BigInt(fromPosition),
      };
    }

    expectedPrevHash = computed;
  }

  return {
    valid: true,
    totalEntries: entries.length,
    checkedFrom: BigInt(fromPosition),
  };
}

// ─── Query Helpers ────────────────────────────────────────────────────────

export async function getAuditLog(params: {
  limit?: number;
  offset?: number;
  actorId?: string;
  resource?: string;
  resourceId?: string;
  category?: string;
  severity?: string;
  dateFrom?: Date;
  dateTo?: Date;
  patientId?: string;
}): Promise<any> {
  const db = await getTenantDb();

  const where: Record<string, unknown> = {};
  if (params.actorId) where.actorId = params.actorId;
  if (params.resource) where.resource = params.resource;
  if (params.resourceId) where.resourceId = params.resourceId;
  if (params.category) where.category = params.category;
  if (params.severity) where.severity = params.severity;
  if (params.dateFrom || params.dateTo) {
    where.timestamp = {};
    if (params.dateFrom) (where.timestamp as any).gte = params.dateFrom;
    if (params.dateTo) (where.timestamp as any).lte = params.dateTo;
  }

  const [entries, total] = await Promise.all([
    db.auditLog.findMany({
      where,
      orderBy: { chainPosition: 'desc' },
      take: params.limit ?? 50,
      skip: params.offset ?? 0,
      include: {
        recordChanges: true,
        chatActions: true,
        accessLogs: true,
      },
    }),
    db.auditLog.count({ where }),
  ]);

  return { entries, total };
}

export async function getRecordHistory(entityType: string, entityId: string): Promise<any> {
  const db = await getTenantDb();

  const changes = await db.auditRecordChange.findMany({
    where: { entityType, entityId },
    orderBy: { timestamp: 'desc' },
    include: { auditLog: true },
  });

  return changes;
}

export async function getChatAudit(messageId: string): Promise<any> {
  const db = await getTenantDb();

  const actions = await db.auditChatAction.findMany({
    where: { messageId },
    orderBy: { timestamp: 'desc' },
    include: { auditLog: true },
  });

  return actions;
}

export async function getPatientAccessLog(patientId: string, dateFrom?: Date, dateTo?: Date): Promise<any> {
  const db = await getTenantDb();

  const where: Record<string, unknown> = { patientId };
  if (dateFrom || dateTo) {
    where.timestamp = {};
    if (dateFrom) (where.timestamp as any).gte = dateFrom;
    if (dateTo) (where.timestamp as any).lte = dateTo;
  }

  const entries = await db.auditAccessLog.findMany({
    where,
    orderBy: { timestamp: 'desc' },
    include: { auditLog: true },
  });

  return entries;
}

// ─── Retention Job ────────────────────────────────────────────────────────

export async function runRetentionJob(): Promise<any> {
  const db = await getTenantDb();
  const now = new Date();

  const result = await db.auditLog.updateMany({
    where: {
      retainUntil: { lte: now },
      isRetained: true,
    },
    data: { isRetained: false },
  });

  console.log(`[Audit Retention] Marked ${result.count} entries as expired`);
  return result.count;
}
