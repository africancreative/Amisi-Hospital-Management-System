import { EventEmitter } from 'events';

// Central Event Bus for AmisiMedOS
class AmisiEventBus extends EventEmitter {
    constructor() {
        super();
        // Increase limit since we'll have multiple module listeners (Queue, Chat, Billing, etc.)
        this.setMaxListeners(20);
    }
}

export const eventBus = new AmisiEventBus();

// Core Event Types
export enum AmisiEvents {
    ENCOUNTER_CREATED = 'ENCOUNTER_CREATED',
    ENCOUNTER_UPDATED = 'ENCOUNTER_UPDATED',
    LAB_ORDER_PLACED = 'LAB_ORDER_PLACED',
    PRESCRIPTION_DISPENSED = 'PRESCRIPTION_DISPENSED',
}

// Payload Types
export interface EncounterPayload {
    tenantId: string;
    encounterId: string;
    patientId: string;
    type: string;
    department?: string | null;
    status: string;
}

export interface LabOrderPayload {
    tenantId: string;
    orderId: string;
    encounterId?: string | null;
    patientId: string;
    testName: string;
    orderedBy: string;
}

export interface DispensingPayload {
    tenantId: string;
    recordId: string;
    prescriptionId?: string | null;
    itemId: string;
    quantityDispensed: number;
    dispensedBy: string;
}
