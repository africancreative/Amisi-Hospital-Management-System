import { SystemEvent, TenantId } from './index';

export type EventHandler = (event: SystemEvent, tenantId: TenantId) => Promise<void>;

export class EventDispatcher {
  private handlers: Map<string, EventHandler[]> = new Map();

  register(eventType: string, handler: EventHandler) {
    const current = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, [...current, handler]);
  }

  async dispatch(event: SystemEvent, tenantId: TenantId) {
    const eventHandlers = this.handlers.get(event.type) || [];
    
    // Log event to DB for sync and audit
    await this.logEvent(event, tenantId);

    // Execute all registered handlers in parallel
    await Promise.all(eventHandlers.map(handler => handler(event, tenantId)));
  }

  private async logEvent(event: SystemEvent, tenantId: TenantId) {
    // Mock DB log
    console.log(`[EventLog] ${tenantId} | ${event.type} | ${JSON.stringify(event.payload)}`);
  }
}

export const dispatcher = new EventDispatcher();
