import { eventBus, AmisiEvents, EncounterPayload, LabOrderPayload, DispensingPayload } from './bus';
import { getTenantDb } from '../client';
import crypto from 'crypto';

export function initializeEventHandlers() {
    console.log('[EventBus] Initializing Patient-Centric Reactive Listeners...');

    // ─── 1. ENCOUNTER CREATED (Triage & Chat) ─────────────────────────────────
    eventBus.on(AmisiEvents.ENCOUNTER_CREATED, async (payload: EncounterPayload) => {
        try {
            const db = await getTenantDb(payload.tenantId);
            console.log(`[EventBus] Processing ENCOUNTER_CREATED for ${payload.encounterId}`);
            
            // Auto-create an EncounterChat thread
            await db.encounterChat.create({
                data: {
                    encounterId: payload.encounterId,
                    senderId: 'SYSTEM',
                    senderName: 'Amisi Bot',
                    senderRole: 'SYSTEM',
                    messageType: 'SYSTEM',
                    content: `Encounter started. Status: ${payload.status}. Department: ${payload.department || 'Triage'}`
                }
            });

            // Queue Management handled by Encounter.status, but we could explicitly set QueueNumber if missing
            if (!payload.department) {
                await db.encounter.update({
                    where: { id: payload.encounterId },
                    data: { 
                        department: 'TRIAGE',
                        status: 'TRIAGE_ASSIGNED',
                        queueNumber: `T-${crypto.randomInt(100, 999)}`
                    }
                });
            }
        } catch (err) {
            console.error(`[EventBus] Error handling ENCOUNTER_CREATED:`, err);
        }
    });

    // ─── 2. LAB ORDER PLACED (Chat & Billing & Queue) ─────────────────────────
    eventBus.on(AmisiEvents.LAB_ORDER_PLACED, async (payload: LabOrderPayload) => {
        try {
            const db = await getTenantDb(payload.tenantId);
            console.log(`[EventBus] Processing LAB_ORDER_PLACED for ${payload.orderId}`);

            // 1. Send Chat Notification
            if (payload.encounterId) {
                await db.encounterChat.create({
                    data: {
                        encounterId: payload.encounterId,
                        senderId: 'SYSTEM',
                        senderName: 'Amisi Bot',
                        senderRole: 'SYSTEM',
                        messageType: 'SYSTEM',
                        content: `Lab Order Placed: ${payload.testName} by ${payload.orderedBy}.`
                    }
                });

                // 2. Generate Uncaptured BillItem
                // Find visit associated with this encounter
                const encounter = await db.encounter.findUnique({
                    where: { id: payload.encounterId },
                    select: { visitId: true }
                });

                if (encounter?.visitId) {
                    await db.billItem.create({
                        data: {
                            visitId: encounter.visitId,
                            encounterId: payload.encounterId,
                            description: `Lab Test: ${payload.testName}`,
                            quantity: 1,
                            unitPrice: 50.00, // In reality, fetch from pricing table
                            totalPrice: 50.00,
                            currency: 'USD',
                            category: 'LAB',
                            status: 'UNPAID'
                        }
                    });
                }

                // 3. Move patient to Lab Queue
                await db.encounter.update({
                    where: { id: payload.encounterId },
                    data: { department: 'LAB', status: 'DIAGNOSTICS_PENDING' }
                });
            }
        } catch (err) {
            console.error(`[EventBus] Error handling LAB_ORDER_PLACED:`, err);
        }
    });

    // ─── 3. PRESCRIPTION DISPENSED (Inventory & Billing) ──────────────────────
    eventBus.on(AmisiEvents.PRESCRIPTION_DISPENSED, async (payload: DispensingPayload) => {
        try {
            const db = await getTenantDb(payload.tenantId);
            console.log(`[EventBus] Processing PRESCRIPTION_DISPENSED for ${payload.recordId}`);

            // 1. Deduct Inventory and Log Stock Movement
            const item = await db.inventoryItem.findUnique({ where: { id: payload.itemId } });
            if (item) {
                const newQuantity = item.quantity - payload.quantityDispensed;
                
                await db.$transaction([
                    db.inventoryItem.update({
                        where: { id: payload.itemId },
                        data: { quantity: newQuantity }
                    }),
                    db.stockMovement.create({
                        data: {
                            itemId: payload.itemId,
                            type: 'OUT',
                            quantity: -payload.quantityDispensed,
                            reason: `Dispensed Rx: ${payload.prescriptionId || 'Unknown'}`,
                            actorId: payload.dispensedBy,
                            actorName: payload.dispensedBy,
                            balanceAfter: newQuantity
                        }
                    })
                ]);

                // 2. Automated Billing
                if (payload.prescriptionId) {
                    const prescription = await db.prescription.findUnique({
                        where: { id: payload.prescriptionId },
                        include: { encounter: true }
                    });

                    if (prescription?.encounter?.visitId) {
                        const totalCost = Number(item.price) * payload.quantityDispensed;
                        await db.billItem.create({
                            data: {
                                visitId: prescription.encounter.visitId,
                                encounterId: prescription.encounterId,
                                description: `Pharmacy: ${item.name} x${payload.quantityDispensed}`,
                                quantity: payload.quantityDispensed,
                                unitPrice: item.price,
                                totalPrice: totalCost,
                                currency: 'USD',
                                category: 'PHARMACY',
                                status: 'UNPAID', // or PAID if cash taken at pharmacy
                                inventoryItemId: item.id
                            }
                        });
                    }
                }
            }
        } catch (err) {
            console.error(`[EventBus] Error handling PRESCRIPTION_DISPENSED:`, err);
        }
    });

    // ─── 4. ENCOUNTER UPDATED (Completion / Checkout) ────────────────────────
    eventBus.on(AmisiEvents.ENCOUNTER_UPDATED, async (payload: EncounterPayload) => {
        try {
            if (payload.status === 'TREATMENT_COMPLETE' || payload.status === 'BILLING_COMPLETE') {
                const db = await getTenantDb(payload.tenantId);
                console.log(`[EventBus] Processing ENCOUNTER_UPDATED (Completed) for ${payload.encounterId}`);

                // Send final message
                await db.encounterChat.create({
                    data: {
                        encounterId: payload.encounterId,
                        senderId: 'SYSTEM',
                        senderName: 'Amisi Bot',
                        senderRole: 'SYSTEM',
                        messageType: 'SYSTEM',
                        content: `Encounter marked as ${payload.status}. Thread archived.`
                    }
                });

                // Clear queue
                if (payload.department !== 'DISCHARGED') {
                    await db.encounter.update({
                        where: { id: payload.encounterId },
                        data: { 
                            department: 'DISCHARGED',
                            completedAt: new Date(),
                            queueNumber: null // Remove from active queues
                        }
                    });
                }
            }
        } catch (err) {
            console.error(`[EventBus] Error handling ENCOUNTER_UPDATED:`, err);
        }
    });
}
