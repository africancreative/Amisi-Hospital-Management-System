import { Prisma } from '../generated/tenant-client';
import crypto from 'crypto';
import { kms } from './lib/kms';
import { mapToFHIRPatient, mapToFHIREncounter, mapToFHIRObservations } from './fhir';
import { eventBus, AmisiEvents } from './events/bus';

interface JournalOptions {
  sharedSecret: string;
  nodeType: 'EDGE' | 'CLOUD';
  tenantId: string;
}

/**
 * Prisma Extension for Automated Change Data Capture (CDC)
 * Automatically records every mutation into the EventJournal.
 */
export const withJournaling = (options: JournalOptions) => {
  return Prisma.defineExtension((client) => {
    return client.$extends({
      name: 'AmisiJournaling',
      query: {
        $allModels: {
          async $allOperations({ model, operation, args, query }) {
            // 1. Skip non-mutation operations
            const mutationOps = ['create', 'update', 'upsert', 'delete', 'createMany', 'updateMany', 'deleteMany'];
            if (!mutationOps.includes(operation)) {
              return query(args);
            }

            // 2. Skip infrastructure models to prevent infinite loops
            const skipModels = ['EventJournal', 'AuditLog', 'SyncNode', 'SyncQueue', 'ChangeLog'];
            if (skipModels.includes(model)) {
              return query(args);
            }

            // 3. Execute the actual mutation first
            const result = await query(args);

            // 4. Extract Entity ID and Action
            let entityId = (result as any)?.id;
            let action: 'CREATE' | 'UPDATE' | 'DELETE' = 'UPDATE';
            
            if (operation.includes('create')) action = 'CREATE';
            if (operation.includes('delete')) action = 'DELETE';

            // 5. Record the event in the Journal
            try {
              const direction = options.nodeType === 'EDGE' ? 'OUTGOING' : 'INCOMING';
              
              const signature = crypto
                .createHmac('sha256', options.sharedSecret)
                .update(`${model}:${entityId}:${action}:${JSON.stringify(result)}`)
                .digest('hex');

              // 5a. Selected-Field Encryption (E2EE)
              // We move sensitive clinical data to encryptedPayload
              const SEARCHABLE_FIELDS = ['id', 'mrn', 'firstName', 'lastName', 'status', 'patientId', 'encounterId', 'visitId', 'version', 'updatedAt'];
              const filteredPayload: any = {};
              const sensitivePayload: any = {};

              Object.keys(result || {}).forEach(key => {
                if (SEARCHABLE_FIELDS.includes(key)) {
                  filteredPayload[key] = (result as any)[key];
                } else {
                  sensitivePayload[key] = (result as any)[key];
                }
              });

              // 5b. FHIR R4 Semantic Enrichment
              // If the model is a clinical entity, add the FHIR representation to the non-sensitive payload
              try {
                if (model === 'Patient') {
                  filteredPayload.fhir = mapToFHIRPatient(result as any);
                } else if (model === 'Encounter') {
                  filteredPayload.fhir = mapToFHIREncounter(result as any);
                } else if (model === 'VitalsLog' || model === 'Vitals') {
                  filteredPayload.fhir = mapToFHIRObservations(result as any);
                }
              } catch (fhirErr) {
                console.warn(`[Journaling] FHIR Mapping failed for ${model}:`, fhirErr);
              }

              // Authenticated Encryption (AES-GCM)
              const iv = crypto.randomBytes(12);
              
              // Internal KMS Integration: Unwrap the DEK if it's stored in wrapped format
              let encryptionKey: Buffer;
              try {
                // If sharedSecret is colon-separated, it's a wrapped KMS key
                const rawKey = options.sharedSecret.includes(':') 
                  ? await kms.unwrapKey(options.sharedSecret) 
                  : options.sharedSecret;
                
                encryptionKey = crypto.createHash('sha256').update(rawKey).digest();
              } catch (err) {
                console.error('[S-KMS] Failed to unwrap encryption key. Falling back to raw secret.', err);
                encryptionKey = crypto.createHash('sha256').update(options.sharedSecret).digest();
              }

              const cipher = crypto.createCipheriv('aes-256-gcm', encryptionKey, iv);
              const encrypted = Buffer.concat([cipher.update(JSON.stringify(sensitivePayload), 'utf8'), cipher.final()]);
              const tag = cipher.getAuthTag();
              const encryptedPayload = `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted.toString('hex')}`;

              // 5b. Global Sequence Authority (Cloud Hub)
              let sequenceNumber = BigInt(0);
              if (options.nodeType === 'CLOUD') {
                const lastEvent = await (client as any).eventJournal.findFirst({
                  orderBy: { sequenceNumber: 'desc' },
                  select: { sequenceNumber: true }
                });
                sequenceNumber = (lastEvent?.sequenceNumber || BigInt(0)) + BigInt(1);
              }

              // 6. Persist to EventJournal (The Change Log)
              const journalEntry = await (client as any).eventJournal.create({
                data: {
                  entityType: model,
                  entityId: entityId || 'BATCH',
                  action,
                  payload: filteredPayload,
                  encryptedPayload,
                  signature,
                  direction,
                  isSynced: options.nodeType === 'CLOUD',
                  sequenceNumber,
                  timestamp: new Date()
                }
              });

              // 7. If on Edge, also record in SyncQueue for replication
              if (options.nodeType === 'EDGE') {
                await (client as any).syncQueue.create({
                  data: {
                    eventId: journalEntry.id,
                    payload: filteredPayload,
                    direction: 'OUTGOING',
                    status: 'PENDING',
                    nextAttemptAt: new Date()
                  }
                });
              }

            } catch (err) {
              console.error(`[Journaling Extension Error] Failed to log ${operation} on ${model}:`, err);
            }

            // 8. Fire Local Reactive Events
            try {
              if (model === 'Encounter') {
                eventBus.emit(action === 'CREATE' ? AmisiEvents.ENCOUNTER_CREATED : AmisiEvents.ENCOUNTER_UPDATED, {
                  tenantId: options.tenantId,
                  encounterId: entityId,
                  patientId: (result as any).patientId,
                  type: (result as any).encounterType || 'OPD',
                  department: (result as any).department,
                  status: (result as any).status
                });
              } else if (model === 'DiagnosticOrder' && action === 'CREATE' && (result as any).category === 'LAB') {
                eventBus.emit(AmisiEvents.LAB_ORDER_PLACED, {
                  tenantId: options.tenantId,
                  orderId: entityId,
                  encounterId: (result as any).encounterId,
                  patientId: (result as any).patientId,
                  testName: (result as any).testName,
                  orderedBy: (result as any).orderedBy
                });
              } else if (model === 'DispensingRecord' && action === 'CREATE') {
                eventBus.emit(AmisiEvents.PRESCRIPTION_DISPENSED, {
                  tenantId: options.tenantId,
                  recordId: entityId,
                  prescriptionId: (result as any).prescriptionId,
                  itemId: (result as any).itemId,
                  quantityDispensed: (result as any).quantityDispensed,
                  dispensedBy: (result as any).dispensedBy
                });
              }
            } catch (emitErr) {
               console.error(`[EventBus] Failed to emit event for ${model}:`, emitErr);
            }

            return result;
          },
        },
      },
    });
  });
};
