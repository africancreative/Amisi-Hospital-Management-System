import crypto from 'crypto';
import { TenantClient } from '@amisimedos/db';

export type AuditAction = 
  | 'CREATE' | 'UPDATE' | 'DELETE' | 'ACCESS' 
  | 'LOGIN' | 'LOGOUT' | 'EXPORT' | 'PRINT' 
  | 'APPROVE' | 'REJECT' | 'TRANSFER';

export interface AuditEntry {
  actorId: string;
  actorName: string;
  actorRole: string;
  action: AuditAction;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  timestamp?: Date;
}

export interface AuditFilter {
  actorId?: string;
  action?: AuditAction;
  resource?: string;
  resourceId?: string;
  startDate?: Date;
  endDate?: Date;
  limit?: number;
}

export class AuditService {
  private db: TenantClient;
  private sharedSecret: string;
  private lastHash: string = '';

  constructor(db: TenantClient, sharedSecret: string) {
    this.db = db;
    this.sharedSecret = sharedSecret;
  }

  private computeHash(entry: AuditEntry, previousHash: string): string {
    const payload = JSON.stringify({
      actorId: entry.actorId,
      action: entry.action,
      resource: entry.resource,
      resourceId: entry.resourceId,
      timestamp: entry.timestamp,
      previousHash
    });
    
    return crypto
      .createHmac('sha256', this.sharedSecret)
      .update(payload)
      .digest('hex');
  }

  public async log(entry: Omit<AuditEntry, 'timestamp'>): Promise<void> {
    const timestamp = new Date();
    const hash = this.computeHash({ ...entry, timestamp }, this.lastHash);
    
    await this.db.auditLog.create({
      data: {
        actorId: entry.actorId,
        actorName: entry.actorName,
        actorRole: entry.actorRole,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId,
        details: entry.details || {},
        ipAddress: entry.ipAddress,
        userAgent: entry.userAgent,
        timestamp,
        hash
      }
    });

    this.lastHash = hash;
  }

  public async logAsync(entry: Omit<AuditEntry, 'timestamp'>): Promise<void> {
    this.log(entry).catch(err => console.error('[Audit] Failed to log:', err));
  }

  public async query(filter: AuditFilter = {}): Promise<any[]> {
    const where: any = {};
    
    if (filter.actorId) where.actorId = filter.actorId;
    if (filter.action) where.action = filter.action;
    if (filter.resource) where.resource = filter.resource;
    
    if (filter.startDate || filter.endDate) {
      where.timestamp = {};
      if (filter.startDate) where.timestamp.gte = filter.startDate;
      if (filter.endDate) where.timestamp.lte = filter.endDate;
    }

    return this.db.auditLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      take: filter.limit || 100
    });
  }

  public async verifyIntegrity(): Promise<{ valid: boolean; brokenAt?: string; totalEntries: number }> {
    const logs = await this.db.auditLog.findMany({
      orderBy: { timestamp: 'asc' },
      select: { id: true, hash: true }
    });

    let previousHash = '';
    
    for (const log of logs) {
      const expectedHash = this.computeHashFromStored(log.id, previousHash);
      
      if (log.hash !== expectedHash) {
        return { valid: false, brokenAt: log.id, totalEntries: logs.length };
      }
      
      previousHash = log.hash;
    }

    return { valid: true, totalEntries: logs.length };
  }

  private computeHashFromStored(id: string, previousHash: string): string {
    const payload = `${id}:${previousHash}`;
    return crypto
      .createHmac('sha256', this.sharedSecret)
      .update(payload)
      .digest('hex');
  }

  public async getUserActivity(userId: string, days: number = 30): Promise<any[]> {
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    
    return this.query({
      actorId: userId,
      startDate,
      limit: 100
    });
  }

  public async getResourceHistory(resource: string, resourceId: string): Promise<any[]> {
    return this.query({
      resource,
      resourceId,
      limit: 50
    });
  }

  public async getFailedLogins(hours: number = 24): Promise<any[]> {
    const startDate = new Date();
    startDate.setHours(startDate.getHours() - hours);
    
    return this.db.auditLog.findMany({
      where: {
        action: 'LOGIN',
        timestamp: { gte: startDate },
        details: { path: ['success'], equals: false }
      },
      orderBy: { timestamp: 'desc' }
    });
  }
}

export const createAuditService = (db: TenantClient, secret: string) => 
  new AuditService(db, secret);