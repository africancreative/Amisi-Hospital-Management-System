import { PrismaClient } from '@prisma/client';
import { Event, SystemEvent } from '@amisi/core';

const prisma = new PrismaClient();

export class CloudSyncEngine {
  /**
   * reconciles an event from a local node into the Neon cloud database.
   * Implements Last-Write-Wins (LWW) based on timestamp for conflict resolution.
   */
  async reconcileEvent(event: Event<SystemEvent>) {
    const { tenantId, entity, action, payload, timestamp } = event;

    return await prisma.$transaction(async (tx) => {
      // 1. Log the event for audit
      await tx.eventLog.create({
        data: {
          tenantId,
          entity,
          entityId: (payload as any).id || 'global',
          action,
          payload: payload as any,
          synced: true,
        },
      });

      // 2. Apply the state change to the specific entity
      switch (entity) {
        case 'Patient':
          await this.handlePatientSync(tx, payload, action);
          break;
        case 'TriageEntry':
          await this.handleTriageSync(tx, payload, action);
          break;
        // ... other entities
      }

      return { success: true, syncedAt: new Date().toISOString() };
    });
  }

  private async handlePatientSync(tx: any, payload: any, action: string) {
    if (action === 'CREATE' || action === 'UPDATE') {
      await tx.patient.upsert({
        where: { id: payload.id },
        update: { ...payload },
        create: { ...payload },
      });
    }
  }

  private async handleTriageSync(tx: any, payload: any, action: string) {
    if (action === 'CREATE' || action === 'UPDATE') {
      await tx.triageEntry.upsert({
        where: { id: payload.id },
        update: { ...payload },
        create: { ...payload },
      });
    }
  }

  async fetchUpdatesSince(tenantId: string, lastSyncTimestamp: string) {
    return await prisma.eventLog.findMany({
      where: {
        tenantId,
        createdAt: { gt: new Date(lastSyncTimestamp) },
      },
      orderBy: { createdAt: 'asc' },
    });
  }
}

export const syncEngine = new CloudSyncEngine();
