'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisimedos/chat';
import { getResolvedTenantId } from '@/lib/tenant';
import { postInventoryJournalEntry } from './accounting-bridge';

/**
 * OHIF / Cornerstone.js DICOM Viewer Config Pattern Placeholder
 * -------------------------------------------------------------
 * When implementing the frontend viewer component, the local Edge Node 
 * will act as the DICOMWeb server (WADO-RS/QIDO-RS).
 * 
 * Flow:
 * 1. Read `storageUrl` from `DicomInstance` via these actions.
 * 2. Pass to OHIF viewer `<Viewer dicomWebEndpoint={edgeDicomProxyUrl} studyInstanceUid={study.dicomStudyUID} />`
 * 3. The viewer fetches actual .dcm files asynchronously.
 */

// ---------------------------------------------------------------------------
// CPOE: CREATE RADIOLOGY ORDER (With Auto-Billing Hook)
// ---------------------------------------------------------------------------

export async function createRadiologyOrder(data: {
    patientId: string;
    encounterId: string;
    orderedById: string;
    modality: string;
    targetRegion: string;
    clinicalIndication: string;
    priority?: string;
    billedAmount?: number;
}) {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    const db = await getTenantDb();

    // 1. Create the clinical order
    const order = await db.radiologyOrder.create({
        data: {
            patientId: data.patientId,
            encounterId: data.encounterId,
            orderedById: data.orderedById,
            modality: data.modality,
            targetRegion: data.targetRegion,
            clinicalIndication: data.clinicalIndication,
            priority: data.priority ?? 'ROUTINE',
            billedAmount: data.billedAmount,
            status: 'PENDING',
        }
    });

    // 2. Billing Hook: Post to Patient's generic financial account via Accounting proxy
    if (data.billedAmount && data.billedAmount > 0) {
        const fiscalPeriod = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        await postInventoryJournalEntry({
            type: 'CLINICAL_CHARGE', 
            sourceId: order.id,
            amount: data.billedAmount,
            description: `Radiology: ${data.modality} ${data.targetRegion}`,
            fiscalPeriod,
            accountingStandard: 'BOTH',
        });

        await db.radiologyOrder.update({
            where: { id: order.id },
            data: { isBilled: true }
        });
    }

    await logAudit({
        action: 'CREATE', resource: 'RadiologyOrder', resourceId: order.id,
        details: { patientId: data.patientId, modality: data.modality }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'RADIOLOGY_ORDERED', 'RadiologyOrder', order.id);

    revalidatePath(`/radiology/orders`);
    return order;
}

// ---------------------------------------------------------------------------
// PACS: DICOM METADATA INGESTION (Edge Node Webhook)
// ---------------------------------------------------------------------------

export interface DicomWebhookPayload {
    dicomStudyUID: string;
    accessionNumber: string;
    modality: string;
    studyDate: string;
    series: {
        dicomSeriesUID: string;
        seriesNumber: number;
        modality: string;
        bodyPartExamined?: string;
        instances: {
            dicomSOPInstanceUID: string;
            instanceNumber: number;
            storageUrl: string; // S3 or Edge blob URL
            fileSizeKb?: number;
        }[];
    }[];
}

export async function ingestDicomMetadata(orderId: string | null, patientId: string, payload: DicomWebhookPayload) {
    // Usually called by the Edge node's background PACS listener service automatically
    const db = await getTenantDb();

    // Prevent duplicate study ingestion
    const existingStudy = await db.imagingStudy.findUnique({
        where: { dicomStudyUID: payload.dicomStudyUID }
    });
    
    if (existingStudy) return existingStudy;

    // Build the hierarchical study -> series -> instance payload atomically
    const study = await db.imagingStudy.create({
        data: {
            orderId,
            patientId,
            dicomStudyUID: payload.dicomStudyUID,
            accessionNumber: payload.accessionNumber,
            modality: payload.modality,
            studyDate: new Date(payload.studyDate),
            status: 'ACQUIRED',
            series: {
                create: payload.series.map(s => ({
                    dicomSeriesUID: s.dicomSeriesUID,
                    seriesNumber: s.seriesNumber,
                    modality: s.modality,
                    bodyPartExamined: s.bodyPartExamined,
                    numberOfInstances: s.instances.length,
                    instances: {
                        create: s.instances.map(inst => ({
                            dicomSOPInstanceUID: inst.dicomSOPInstanceUID,
                            instanceNumber: inst.instanceNumber,
                            storageUrl: inst.storageUrl,
                            fileSizeKb: inst.fileSizeKb,
                        }))
                    }
                }))
            }
        }
    });

    // Mark order as complete now that images are generated
    if (orderId) {
        await db.radiologyOrder.update({
            where: { id: orderId },
            data: { status: 'COMPLETED' }
        });
    }

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'STUDY_ACQUIRED', 'ImagingStudy', study.id);

    return study;
}

// ---------------------------------------------------------------------------
// RADIOLOGIST TRANSCRIPTION / REPORT SUBMISSION
// ---------------------------------------------------------------------------

export async function submitRadiologistReport(studyId: string, data: {
    patientId: string;
    signingRadiologistId: string;
    findings: string;
    impression: string;
    isCriticalResult: boolean;
}) {
    await ensureRole(['RADIOLOGIST', 'DOCTOR', 'ADMIN']);
    const db = await getTenantDb();

    const report = await db.radiologyReport.create({
        data: {
            studyId,
            patientId: data.patientId,
            signingRadiologistId: data.signingRadiologistId,
            findings: data.findings,
            impression: data.impression,
            isCriticalResult: data.isCriticalResult,
            status: 'SIGNED',
            signedAt: new Date(),
        }
    });

    await db.imagingStudy.update({
        where: { id: studyId },
        data: { status: 'REPORTED', radiologistId: data.signingRadiologistId }
    });

    // Alert engine for critical findings (e.g. Brain Bleed, Pneumothorax)
    const tenantId = await getResolvedTenantId();
    if (tenantId && data.isCriticalResult) {
        realtimeHub.broadcast(tenantId, 'CRITICAL_RESULT_ALERT', 'RadiologyReport', report.id, {
            severity: 'CRITICAL',
            patientId: data.patientId,
            message: 'A critical radiology finding requires immediate clinical attention.'
        });
    }

    await logAudit({
        action: 'CREATE', resource: 'RadiologyReport', resourceId: report.id,
        details: { studyId, isCritical: data.isCriticalResult }
    });

    revalidatePath(`/radiology/reports`);
    return report;
}

// ---------------------------------------------------------------------------
// FETCH DICOM STORAGE REFS (For OHIF Viewer binding)
// ---------------------------------------------------------------------------

export async function getStudyDicomRefs(studyId: string) {
    await ensureRole(['DOCTOR', 'RADIOLOGIST', 'ADMIN']);
    const db = await getTenantDb();

    // Pull the indexing hierarchy so the viewer client can fetch chunks
    return db.imagingStudy.findUnique({
        where: { id: studyId },
        include: {
            series: {
                include: {
                    instances: {
                        select: { dicomSOPInstanceUID: true, storageUrl: true, instanceNumber: true }
                    }
                },
                orderBy: { seriesNumber: 'asc' }
            }
        }
    });
}
