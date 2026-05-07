import { EventSubscriptionFilter, SystemEvent, EventType } from './types';
import { eventBus } from './index';

// ─── Module Subscription Definitions ─────────────────────────────────────
// Each module declares which events it cares about and what to do when
// they arrive. Subscriptions are registered at app initialization.

export interface ModuleSubscriptionDef {
  module: string;
  filter: EventSubscriptionFilter;
  handler: (event: SystemEvent) => void | Promise<void>;
}

// ─── Billing Module Subscriptions ────────────────────────────────────────

export const billingSubscriptions: ModuleSubscriptionDef[] = [
  {
    module: 'billing',
    filter: {
      types: ['CONSULTATION_COMPLETED', 'TRIAGE_COMPLETED'],
    },
    handler: async (event) => {
      // Auto-generate consultation bill when consultation completes
      console.log(`[Billing] Auto-bill triggered for encounter ${event.encounterId}`);
      // TODO: Call billing-event-actions to generate invoice
    },
  },
  {
    module: 'billing',
    filter: {
      types: ['LAB_ORDERED'],
    },
    handler: async (event) => {
      // Auto-generate lab bill when lab is ordered
      console.log(`[Billing] Lab bill triggered for order ${event.entityId}`);
    },
  },
  {
    module: 'billing',
    filter: {
      types: ['PRESCRIPTION_ISSUED'],
    },
    handler: async (event) => {
      // Auto-generate prescription bill when prescription is issued
      console.log(`[Billing] Prescription bill triggered for Rx ${event.entityId}`);
    },
  },
  {
    module: 'billing',
    filter: {
      types: ['RADIOLOGY_ORDERED'],
    },
    handler: async (event) => {
      console.log(`[Billing] Radiology bill triggered for order ${event.entityId}`);
    },
  },
  {
    module: 'billing',
    filter: {
      types: ['PATIENT_ADMITTED'],
    },
    handler: async (event) => {
      console.log(`[Billing] Admission bill triggered for patient ${event.patientId}`);
    },
  },
];

// ─── Pharmacy Module Subscriptions ───────────────────────────────────────

export const pharmacySubscriptions: ModuleSubscriptionDef[] = [
  {
    module: 'pharmacy',
    filter: {
      types: ['PRESCRIPTION_ISSUED'],
    },
    handler: async (event) => {
      // Notify pharmacy of new prescription to fill
      console.log(`[Pharmacy] New prescription received: ${event.entityId}`);
    },
  },
  {
    module: 'pharmacy',
    filter: {
      types: ['PRESCRIPTION_CANCELLED', 'PRESCRIPTION_AMENDED'],
    },
    handler: async (event) => {
      console.log(`[Pharmacy] Prescription ${event.type}: ${event.entityId}`);
    },
  },
  {
    module: 'pharmacy',
    filter: {
      types: ['DRUG_INTERACTION_ALERT'],
    },
    handler: async (event) => {
      console.warn(`[Pharmacy] Drug interaction alert for ${event.entityId}`);
    },
  },
];

// ─── Inventory Module Subscriptions ──────────────────────────────────────

export const inventorySubscriptions: ModuleSubscriptionDef[] = [
  {
    module: 'inventory',
    filter: {
      types: ['PRESCRIPTION_DISPENSED'],
    },
    handler: async (event) => {
      // Deduct stock when prescription is dispensed
      console.log(`[Inventory] Stock deduction triggered for ${event.entityId}`);
    },
  },
  {
    module: 'inventory',
    filter: {
      types: ['STOCK_EXPIRED', 'STOCK_ADJUSTED'],
    },
    handler: async (event) => {
      console.log(`[Inventory] Stock adjustment: ${event.type} for ${event.entityId}`);
    },
  },
  {
    module: 'inventory',
    filter: {
      types: ['PURCHASE_ORDER_APPROVED'],
    },
    handler: async (event) => {
      console.log(`[Inventory] PO approved, awaiting goods receipt: ${event.entityId}`);
    },
  },
  {
    module: 'inventory',
    filter: {
      types: ['GOODS_RECEIVED'],
    },
    handler: async (event) => {
      // Add stock when goods are received
      console.log(`[Inventory] Goods received, stock updated: ${event.entityId}`);
    },
  },
];

// ─── Lab Module Subscriptions ────────────────────────────────────────────

export const labSubscriptions: ModuleSubscriptionDef[] = [
  {
    module: 'lab',
    filter: {
      types: ['LAB_SAMPLE_COLLECTED'],
    },
    handler: async (event) => {
      console.log(`[Lab] Sample collected, ready for analysis: ${event.entityId}`);
    },
  },
  {
    module: 'lab',
    filter: {
      types: ['LAB_RESULT_READY', 'LAB_RESULT_CRITICAL'],
    },
    handler: async (event) => {
      console.log(`[Lab] Result ready for validation: ${event.entityId}`);
    },
  },
  {
    module: 'lab',
    filter: {
      types: ['LAB_REPORT_GENERATED'],
    },
    handler: async (event) => {
      // Notify ordering doctor of completed lab report
      console.log(`[Lab] Report generated, notifying doctor: ${event.entityId}`);
    },
  },
];

// ─── ADT Module Subscriptions ────────────────────────────────────────────

export const adtSubscriptions: ModuleSubscriptionDef[] = [
  {
    module: 'adt',
    filter: {
      types: ['PATIENT_ADMITTED'],
    },
    handler: async (event) => {
      console.log(`[ADT] Patient admitted to bed: ${event.entityId}`);
    },
  },
  {
    module: 'adt',
    filter: {
      types: ['PATIENT_TRANSFERRED'],
    },
    handler: async (event) => {
      console.log(`[ADT] Patient transferred: ${event.entityId}`);
    },
  },
  {
    module: 'adt',
    filter: {
      types: ['PATIENT_DISCHARGED'],
    },
    handler: async (event) => {
      // Release bed, update patient status
      console.log(`[ADT] Patient discharged, bed released: ${event.entityId}`);
    },
  },
  {
    module: 'adt',
    filter: {
      types: ['BED_STATUS_CHANGED'],
    },
    handler: async (event) => {
      console.log(`[ADT] Bed status changed: ${event.entityId}`);
    },
  },
];


// ─── HR Module Subscriptions ─────────────────────────────────────────────

export const hrSubscriptions: ModuleSubscriptionDef[] = [
  {
    module: 'hr',
    filter: {
      types: ['LEAVE_REQUESTED', 'LEAVE_APPROVED', 'LEAVE_REJECTED'],
    },
    handler: async (event) => {
      console.log(`[HR] Leave event: ${event.type} for ${event.actorId}`);
    },
  },
  {
    module: 'hr',
    filter: {
      types: ['SHIFT_ASSIGNED', 'SHIFT_SWAPPED'],
    },
    handler: async (event) => {
      console.log(`[HR] Shift event: ${event.type} for ${event.actorId}`);
    },
  },
  {
    module: 'hr',
    filter: {
      types: ['CREDENTIAL_EXPIRING'],
    },
    handler: async (event) => {
      console.warn(`[HR] Credential expiring: ${event.actorId}`);
    },
  },
];

// ─── System Module Subscriptions ─────────────────────────────────────────

export const systemSubscriptions: ModuleSubscriptionDef[] = [
  {
    module: 'system',
    filter: {
      types: ['SYNC_COMPLETED', 'SYNC_FAILED'],
    },
    handler: async (event) => {
      console.log(`[System] Sync event: ${event.type}`);
    },
  },
  {
    module: 'system',
    filter: {
      types: ['MODULE_ENABLED', 'MODULE_DISABLED'],
    },
    handler: async (event) => {
      console.log(`[System] Module toggled: ${event.type}`);
    },
  },
  {
    module: 'system',
    filter: {
      severities: ['CRITICAL'],
    },
    handler: async (event) => {
      console.error(`[System] Critical event: ${event.type} (${event.entityType}:${event.entityId})`);
    },
  },
];

// ─── Notification Module Subscriptions ───────────────────────────────────

export const notificationSubscriptions: ModuleSubscriptionDef[] = [
  {
    module: 'notifications',
    filter: {
      types: ['LAB_RESULT_CRITICAL'],
    },
    handler: async (event) => {
      // Send push notification / SMS for critical events
      console.error(`[Notifications] Critical alert sent: ${event.type}`);
    },
  },
  {
    module: 'notifications',
    filter: {
      types: ['PAYMENT_RECORDED', 'BILL_PAID_IN_FULL'],
    },
    handler: async (event) => {
      console.log(`[Notifications] Payment notification: ${event.type}`);
    },
  },
  {
    module: 'notifications',
    filter: {
      types: ['PRESCRIPTION_RECEIVED'],
    },
    handler: async (event) => {
      console.log(`[Notifications] Pharmacy notified of prescription`);
    },
  },
];

// ─── Master Registration Function ────────────────────────────────────────

const allSubscriptions: ModuleSubscriptionDef[][] = [
  billingSubscriptions,
  pharmacySubscriptions,
  inventorySubscriptions,
  labSubscriptions,
  adtSubscriptions,
  hrSubscriptions,
  systemSubscriptions,
  notificationSubscriptions,
];

export function registerAllModuleSubscriptions(): string[] {
  const subscriptionIds: string[] = [];

  for (const moduleSubs of allSubscriptions) {
    for (const sub of moduleSubs) {
      const id = eventBus.subscribe(sub.module, sub.filter, sub.handler);
      subscriptionIds.push(id);
    }
  }

  console.log(`[EventSystem] Registered ${subscriptionIds.length} module subscriptions`);
  return subscriptionIds;
}

// ─── Get Active Subscriptions by Module ──────────────────────────────────

export function getModuleEventMap(): Record<string, EventType[]> {
  return {
    billing: ['CONSULTATION_COMPLETED', 'TRIAGE_COMPLETED', 'LAB_ORDERED', 'PRESCRIPTION_ISSUED', 'RADIOLOGY_ORDERED', 'PATIENT_ADMITTED', 'SURGERY_SCHEDULED'],
    pharmacy: ['PRESCRIPTION_ISSUED', 'PRESCRIPTION_CANCELLED', 'PRESCRIPTION_AMENDED', 'DRUG_INTERACTION_ALERT'],
    inventory: ['PRESCRIPTION_DISPENSED', 'STOCK_EXPIRED', 'STOCK_ADJUSTED', 'PURCHASE_ORDER_APPROVED', 'GOODS_RECEIVED'],
    lab: ['LAB_SAMPLE_COLLECTED', 'LAB_RESULT_READY', 'LAB_RESULT_CRITICAL', 'LAB_REPORT_GENERATED'],
    adt: ['PATIENT_ADMITTED', 'PATIENT_TRANSFERRED', 'PATIENT_DISCHARGED', 'BED_STATUS_CHANGED'],
    hr: ['LEAVE_REQUESTED', 'LEAVE_APPROVED', 'LEAVE_REJECTED', 'SHIFT_ASSIGNED', 'SHIFT_SWAPPED', 'CREDENTIAL_EXPIRING'],
    system: ['SYNC_COMPLETED', 'SYNC_FAILED', 'MODULE_ENABLED', 'MODULE_DISABLED'],
    notifications: ['LAB_RESULT_CRITICAL', 'PAYMENT_RECORDED', 'BILL_PAID_IN_FULL', 'PRESCRIPTION_RECEIVED'],
  };
}
