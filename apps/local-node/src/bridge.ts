// Local Node Sync Bridge (Simplified implementation for Tauri/Node.js)
// This runs on the hospital LAN node.

import { Event, SystemEvent } from '@amisi/core';
import axios from 'axios';
import { PrismaClient } from '@amisimedos/db/generated/tenant-client';

const localDb = new PrismaClient(); 
const CLOUD_API_URL = 'https://api.amisimedos.ai/api/v1/sync';
const MAX_OFFLINE_HOURS = 72;

export class LocalSyncBridge {
  private isOnline: boolean = true;

  async recordLocalAction(event: Event<SystemEvent>) {
    // 1. Write to local DB (WAL - Write Ahead Log)
    await localDb.eventJournal.create({
      data: {
        entityType: event.entity,
        entityId: (event.payload as any).id || 'global',
        action: event.action,
        payload: event.payload as any,
        isSynced: false,
        direction: 'OUTGOING',
        timestamp: new Date(event.timestamp),
      },
    });

    // 2. Attempt to push to cloud immediately
    this.attemptSync();
  }

  async attemptSync() {
    const cutoffDate = new Date(Date.now() - MAX_OFFLINE_HOURS * 60 * 60 * 1000);
    
    const pendingEvents = await localDb.eventJournal.findMany({
      where: { 
        isSynced: false,
        timestamp: { gte: cutoffDate }
      },
      orderBy: { timestamp: 'asc' },
    });

    if (pendingEvents.length === 0) return;

    try {
      for (const event of pendingEvents) {
        // Map EventJournal back to Event for Cloud API
        const cloudEvent: Event = {
          eventId: event.id,
          tenantId: 'TBD', // Should be pulled from config
          entity: event.entityType,
          action: event.action as any,
          timestamp: event.timestamp.toISOString(),
          payload: event.payload as any,
          checksum: 'sha256-mock',
        };

        await axios.post(CLOUD_API_URL, cloudEvent, {
          headers: { 'x-tenant-id': cloudEvent.tenantId },
        });
        
        await localDb.eventJournal.update({
          where: { id: event.id },
          data: { isSynced: true },
        });
      }
      this.isOnline = true;
    } catch (e) {
      console.error('Cloud offline. Operating in offline mode...');
      this.isOnline = false;
    }
  }


  async pullCloudUpdates(tenantId: string, lastSync: string) {
    try {
      const response = await axios.get(`${CLOUD_API_URL}?since=${lastSync}`, {
        headers: { 'x-tenant-id': tenantId },
      });
      
      const updates = response.data;
      for (const event of updates) {
        await this.applyToLocalDb(event);
      }
    } catch (e) {
      console.error('Failed to pull updates from cloud.');
    }
  }

  private async applyToLocalDb(event: any) {
    // Logic to update local Patient/Visit/EMR tables
  }
}

export const localBridge = new LocalSyncBridge();
