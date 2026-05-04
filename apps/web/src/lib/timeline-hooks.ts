/**
 * Timeline Event Hooks — Auto-create timeline entries from existing workflows.
 * 
 * These hooks wrap existing server actions to ensure every clinical action
 * automatically appends an immutable entry to the patient's medical record timeline.
 */

import {
    createTimelineEvent,
    recordConsultationEvent,
    recordPrescriptionEvent,
    recordLabEvent,
    recordChatEvent,
    recordQueueEvent,
    recordVitalsEvent,
} from '@/lib/timeline-actions';
import { EVENT_TYPE } from '@/lib/timeline-types';

/**
 * Hook: Record encounter lifecycle events
 */
export function useEncounterTimeline() {
    return {
        recordEncounterStart: async (data: {
            patientId: string;
            visitId?: string;
            encounterId: string;
            department?: string;
        }) => recordConsultationEvent({
            ...data,
            eventType: EVENT_TYPE.CONSULTATION_STARTED,
            title: 'Consultation Started',
            description: `Patient seen in ${data.department ?? 'clinic'} for evaluation.`,
            metadata: { department: data.department },
        }),

        recordEncounterComplete: async (data: {
            patientId: string;
            visitId?: string;
            encounterId: string;
            diagnosis?: string;
            plan?: string;
        }) => recordConsultationEvent({
            ...data,
            eventType: EVENT_TYPE.CONSULTATION_COMPLETED,
            title: 'Consultation Completed',
            description: data.diagnosis ? `Diagnosis: ${data.diagnosis}` : 'Consultation finalized.',
            metadata: { diagnosis: data.diagnosis, plan: data.plan },
        }),

        recordSOAPNote: async (data: {
            patientId: string;
            encounterId: string;
            subjective?: string;
            objective?: string;
            assessment?: string;
            plan?: string;
        }) => recordConsultationEvent({
            ...data,
            eventType: EVENT_TYPE.SOAP_NOTE_CREATED,
            title: 'SOAP Note Created',
            description: data.assessment ?? 'Clinical note documented.',
            metadata: {
                subjective: data.subjective,
                objective: data.objective,
                assessment: data.assessment,
                plan: data.plan,
            },
        }),

        recordProgressNote: async (data: {
            patientId: string;
            encounterId: string;
            content: string;
        }) => recordConsultationEvent({
            ...data,
            eventType: EVENT_TYPE.PROGRESS_NOTE_ADDED,
            title: 'Progress Note Added',
            description: data.content.substring(0, 200),
        }),

        recordNursingNote: async (data: {
            patientId: string;
            encounterId: string;
            content: string;
        }) => recordConsultationEvent({
            ...data,
            eventType: EVENT_TYPE.NURSING_NOTE_ADDED,
            title: 'Nursing Note Added',
            description: data.content.substring(0, 200),
        }),

        recordDischargeNote: async (data: {
            patientId: string;
            encounterId: string;
            summary?: string;
        }) => recordConsultationEvent({
            ...data,
            eventType: EVENT_TYPE.DISCHARGE_NOTE_CREATED,
            title: 'Discharge Note Created',
            description: data.summary ?? 'Patient discharged with instructions.',
            metadata: { summary: data.summary },
        }),
    };
}

/**
 * Hook: Record prescription lifecycle events
 */
export function usePrescriptionTimeline() {
    return {
        recordPrescriptionCreated: async (data: {
            patientId: string;
            visitId?: string;
            encounterId?: string;
            prescriptionId: string;
            drugName: string;
            dosage?: string;
            frequency?: string;
        }) => recordPrescriptionEvent({
            ...data,
            eventType: EVENT_TYPE.PRESCRIPTION_CREATED,
            title: `Prescription: ${data.drugName}`,
            description: `New prescription ordered for ${data.drugName}${data.dosage ? ` (${data.dosage})` : ''}.`,
            prescriptionId: data.prescriptionId,
            metadata: {
                drugName: data.drugName,
                dosage: data.dosage,
                frequency: data.frequency,
            },
        }),

        recordPrescriptionDispensed: async (data: {
            patientId: string;
            encounterId?: string;
            prescriptionId: string;
            drugName: string;
            quantity?: number;
            pharmacistName?: string;
        }) => recordPrescriptionEvent({
            ...data,
            eventType: EVENT_TYPE.PRESCRIPTION_DISPENSED,
            title: `Prescription Dispensed: ${data.drugName}`,
            description: `Dispensed by ${data.pharmacistName ?? 'pharmacy staff'}${data.quantity ? ` (Qty: ${data.quantity})` : ''}.`,
            prescriptionId: data.prescriptionId,
            metadata: {
                drugName: data.drugName,
                quantity: data.quantity,
                pharmacistName: data.pharmacistName,
            },
        }),

        recordPrescriptionCancelled: async (data: {
            patientId: string;
            encounterId?: string;
            prescriptionId: string;
            drugName: string;
            reason?: string;
        }) => recordPrescriptionEvent({
            ...data,
            eventType: EVENT_TYPE.PRESCRIPTION_CANCELLED,
            title: `Prescription Cancelled: ${data.drugName}`,
            description: data.reason ?? 'Prescription cancelled.',
            prescriptionId: data.prescriptionId,
            metadata: { drugName: data.drugName, reason: data.reason },
        }),
    };
}

/**
 * Hook: Record lab/radiology lifecycle events
 */
export function useLabTimeline() {
    return {
        recordLabOrdered: async (data: {
            patientId: string;
            visitId?: string;
            encounterId?: string;
            labOrderId: string;
            testName: string;
            urgency?: string;
        }) => recordLabEvent({
            ...data,
            eventType: EVENT_TYPE.LAB_ORDERED,
            title: `Lab Ordered: ${data.testName}`,
            description: `Lab test ordered${data.urgency === 'STAT' ? ' (STAT)' : ''}.`,
            labOrderId: data.labOrderId,
            metadata: { testName: data.testName, urgency: data.urgency },
        }),

        recordLabSampleCollected: async (data: {
            patientId: string;
            encounterId?: string;
            labOrderId: string;
            testName: string;
            specimenType?: string;
        }) => recordLabEvent({
            ...data,
            eventType: EVENT_TYPE.LAB_SAMPLE_COLLECTED,
            title: `Sample Collected: ${data.testName}`,
            description: data.specimenType ? `Specimen: ${data.specimenType}` : 'Sample collected.',
            labOrderId: data.labOrderId,
            metadata: { testName: data.testName, specimenType: data.specimenType },
        }),

        recordLabResultReady: async (data: {
            patientId: string;
            encounterId?: string;
            labOrderId: string;
            testName: string;
            results?: Array<{ name: string; value: string; flag: string }>;
            isCritical?: boolean;
        }) => recordLabEvent({
            ...data,
            eventType: data.isCritical ? EVENT_TYPE.LAB_RESULT_CRITICAL : EVENT_TYPE.LAB_RESULT_READY,
            title: `Lab Result: ${data.testName}`,
            description: `Results available${data.isCritical ? ' — CRITICAL VALUE' : ''}.`,
            labOrderId: data.labOrderId,
            isCritical: data.isCritical,
            metadata: { testName: data.testName, results: data.results },
        }),

        recordLabReportFinalized: async (data: {
            patientId: string;
            encounterId?: string;
            labOrderId: string;
            testName: string;
            pathologistName?: string;
        }) => recordLabEvent({
            ...data,
            eventType: EVENT_TYPE.LAB_REPORT_FINALIZED,
            title: `Lab Report Finalized: ${data.testName}`,
            description: data.pathologistName ? `Reviewed by ${data.pathologistName}` : 'Report finalized.',
            labOrderId: data.labOrderId,
            metadata: { testName: data.testName, pathologistName: data.pathologistName },
        }),
    };
}

/**
 * Hook: Record chat/communication events
 */
export function useChatTimeline() {
    return {
        recordChatMessage: async (data: {
            patientId: string;
            encounterId: string;
            chatMessageId: string;
            content: string;
            messageType?: string;
        }) => recordChatEvent({
            ...data,
            eventType: EVENT_TYPE.CHAT_MESSAGE_SENT,
            title: 'Clinical Message Sent',
            description: data.content.substring(0, 200),
            chatMessageId: data.chatMessageId,
            metadata: { messageType: data.messageType },
        }),

        recordLabResultShared: async (data: {
            patientId: string;
            encounterId: string;
            chatMessageId: string;
            labOrderId: string;
            testName: string;
        }) => recordChatEvent({
            ...data,
            eventType: EVENT_TYPE.CHAT_LAB_RESULT_SHARED,
            title: `Lab Result Shared: ${data.testName}`,
            description: 'Lab results shared in encounter chat.',
            chatMessageId: data.chatMessageId,
            metadata: { labOrderId: data.labOrderId, testName: data.testName },
        }),

        recordClinicalNoteShared: async (data: {
            patientId: string;
            encounterId: string;
            chatMessageId: string;
            noteType?: string;
        }) => recordChatEvent({
            ...data,
            eventType: EVENT_TYPE.CHAT_CLINICAL_NOTE_SHARED,
            title: 'Clinical Note Shared',
            description: 'Clinical note shared in encounter chat.',
            chatMessageId: data.chatMessageId,
            metadata: { noteType: data.noteType },
        }),
    };
}

/**
 * Hook: Record queue movement events
 */
export function useQueueTimeline() {
    return {
        recordQueueRegistered: async (data: {
            patientId: string;
            visitId?: string;
            encounterId: string;
            queueNumber: string;
            department?: string;
        }) => recordQueueEvent({
            ...data,
            eventType: EVENT_TYPE.QUEUE_REGISTERED,
            title: `Queue Registered: ${data.queueNumber}`,
            description: `Patient registered in queue${data.department ? ` (${data.department})` : ''}.`,
            metadata: { department: data.department },
        }),

        recordQueueCheckedIn: async (data: {
            patientId: string;
            visitId?: string;
            encounterId: string;
            queueNumber: string;
        }) => recordQueueEvent({
            ...data,
            eventType: EVENT_TYPE.QUEUE_CHECKED_IN,
            title: `Checked In: ${data.queueNumber}`,
            description: 'Patient checked in and waiting.',
        }),

        recordQueueTriaged: async (data: {
            patientId: string;
            encounterId: string;
            queueNumber: string;
            esiLevel?: number;
            triageNotes?: string;
        }) => recordQueueEvent({
            ...data,
            eventType: EVENT_TYPE.QUEUE_TRIAGED,
            title: `Triaged: ${data.queueNumber}`,
            description: data.triageNotes ?? `ESI Level ${data.esiLevel ?? 'assigned'}.`,
            metadata: { esiLevel: data.esiLevel, triageNotes: data.triageNotes },
        }),

        recordQueueInConsultation: async (data: {
            patientId: string;
            encounterId: string;
            queueNumber: string;
            providerName?: string;
        }) => recordQueueEvent({
            ...data,
            eventType: EVENT_TYPE.QUEUE_IN_CONSULTATION,
            title: `In Consultation: ${data.queueNumber}`,
            description: data.providerName ? `Seen by ${data.providerName}` : 'Consultation started.',
        }),

        recordQueueTransferred: async (data: {
            patientId: string;
            encounterId: string;
            queueNumber: string;
            fromDepartment?: string;
            toDepartment?: string;
        }) => recordQueueEvent({
            ...data,
            eventType: EVENT_TYPE.QUEUE_TRANSFERRED,
            title: `Transferred: ${data.queueNumber}`,
            description: `${data.fromDepartment ?? 'Unknown'} → ${data.toDepartment ?? 'Unknown'}`,
            metadata: { fromDepartment: data.fromDepartment, toDepartment: data.toDepartment },
        }),

        recordQueueCompleted: async (data: {
            patientId: string;
            encounterId: string;
            queueNumber: string;
        }) => recordQueueEvent({
            ...data,
            eventType: EVENT_TYPE.QUEUE_COMPLETED,
            title: `Queue Completed: ${data.queueNumber}`,
            description: 'Patient visit completed.',
        }),

        recordQueuePriorityChanged: async (data: {
            patientId: string;
            encounterId: string;
            queueNumber: string;
            oldPriority?: string;
            newPriority?: string;
        }) => recordQueueEvent({
            ...data,
            eventType: EVENT_TYPE.QUEUE_PRIORITY_CHANGED,
            title: `Priority Changed: ${data.queueNumber}`,
            description: `${data.oldPriority ?? 'Normal'} → ${data.newPriority ?? 'Urgent'}`,
            metadata: { oldPriority: data.oldPriority, newPriority: data.newPriority },
        }),
    };
}

/**
 * Hook: Record vitals events
 */
export function useVitalsTimeline() {
    return {
        recordVitalsRecorded: async (data: {
            patientId: string;
            encounterId: string;
            vitalsId?: string;
            temperature?: number;
            bloodPressure?: string;
            heartRate?: number;
            spO2?: number;
            respiratoryRate?: number;
            weight?: number;
        }) => {
            const bp = data.bloodPressure ?? `${data.weight ? `${data.weight}kg` : ''}`;
            return recordVitalsEvent({
                ...data,
                eventType: EVENT_TYPE.VITALS_RECORDED,
                title: 'Vitals Recorded',
                description: `BP: ${data.bloodPressure ?? '—'}, HR: ${data.heartRate ?? '—'}, Temp: ${data.temperature ?? '—'}°C, SpO2: ${data.spO2 ?? '—'}%`,
                vitalsId: data.vitalsId,
                metadata: {
                    temperature: data.temperature,
                    bloodPressure: data.bloodPressure,
                    heartRate: data.heartRate,
                    spO2: data.spO2,
                    respiratoryRate: data.respiratoryRate,
                    weight: data.weight,
                },
            });
        },

        recordCriticalVitals: async (data: {
            patientId: string;
            encounterId: string;
            parameter: string;
            value: string;
            threshold: string;
        }) => recordVitalsEvent({
            ...data,
            eventType: EVENT_TYPE.VITALS_CRITICAL_ALERT,
            title: `Critical Vitals Alert: ${data.parameter}`,
            description: `${data.parameter}: ${data.value} (threshold: ${data.threshold})`,
            isCritical: true,
            metadata: { parameter: data.parameter, value: data.value, threshold: data.threshold },
        }),
    };
}
