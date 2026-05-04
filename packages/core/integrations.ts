import { dispatcher } from '@amisi/core/dispatcher';
import { SystemEvent, TriageSeverity } from '@amisi/core';

/**
 * INTEGRATION LOGIC:
 * This file defines how different modules react to events.
 */

// 1. EMR Module: Listens to almost everything to build the patient timeline
dispatcher.register('TriageCompleted', async (event) => {
  console.log(`EMR: Adding triage data to timeline for patient ${event.payload.patientId}`);
});

dispatcher.register('ConsultationStarted', async (event) => {
  console.log(`EMR: Creating new visit entry for patient ${event.payload.patientId}`);
});

dispatcher.register('ChatMessageSent', async (event) => {
  console.log(`EMR: Archiving chat message in clinical record for patient ${event.payload.patientId}`);
});

// 2. Finance Module: Generates charges based on clinical actions
dispatcher.register('ConsultationStarted', async (event) => {
  console.log(`Finance: Generating consultation charge for visit ${event.payload.visitId}`);
});

dispatcher.register('LabOrdered', async (event) => {
  console.log(`Finance: Adding lab test fee for visit ${event.payload.visitId}`);
});

dispatcher.register('PrescriptionIssued', async (event) => {
  console.log(`Finance: Calculating medication costs for visit ${event.payload.visitId}`);
});

// 3. Inventory Module: Deducts stock on prescriptions
dispatcher.register('PrescriptionIssued', async (event) => {
  for (const med of event.payload.medications) {
    console.log(`Inventory: Reducing stock for item ${med.itemId} by ${med.qty}`);
    // if (stock < minQty) emit 'LowStockAlert'
  }
});

// 4. HR Module: Tracks performance and staff activity
dispatcher.register('ConsultationStarted', async (event) => {
  console.log(`HR: Tracking start time for staff ${event.payload.staffId}`);
});

dispatcher.register('PaymentRecorded', async (event) => {
  console.log(`HR: Recording revenue contribution for billing staff`);
});

// 5. Queue System: Real-time updates
dispatcher.register('TriageCompleted', async (event) => {
  console.log(`Queue: Prioritizing patient ${event.payload.patientId} with severity ${event.payload.severity}`);
});
