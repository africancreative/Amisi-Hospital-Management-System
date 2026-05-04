// ─── Event System — Central Export ───────────────────────────────────────
//
// AmisiMedOS Central Event System
// All modules communicate through this event bus.
//
// Usage:
//   import { eventBus } from '@/lib/event-system';
//   import { registerAllModuleSubscriptions } from '@/lib/event-system/module-subscriptions';
//   import { EventLogPanel } from '@/components/events/EventLogPanel';

export { eventBus } from './event-bus';
export type {
  SystemEvent,
  EventType,
  EventDomain,
  EventSeverity,
  EventSubscription,
  EventSubscriptionFilter,
  EventPayloadMap,
  EventStoreQuery,
  EventStoreResult,
} from './types';

export {
  registerAllModuleSubscriptions,
  getModuleEventMap,
  billingSubscriptions,
  pharmacySubscriptions,
  inventorySubscriptions,
  labSubscriptions,
  adtSubscriptions,
  icuSubscriptions,
  surgerySubscriptions,
  maternitySubscriptions,
  hrSubscriptions,
  systemSubscriptions,
  notificationSubscriptions,
} from './module-subscriptions';
