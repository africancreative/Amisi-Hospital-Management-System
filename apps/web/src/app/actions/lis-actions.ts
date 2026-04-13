'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisimedos/chat';
import { getResolvedTenantId } from '@/lib/tenant';
import { postInventoryJournalEntry } from './accounting-bridge';

// ---------------------------------------------------------------------------
// 1. CPOE: CREATE LAB ORDER (Supports Hospital & Standalone SaaS Modes)
// ---------------------------------------------------------------------------

export async function createLabOrder(data: {
    testPanelId: string;
    urgency?: string;
    clinicalNotes?: string;
    billedAmount?: number;
    // For Hospital Operations:
    patientId?: string;
    encounterId?: string;
    orderedById?: string;
    // For Standalone Lab Operations:
    isStandalone?: boolean;
    externalPatientSource?: string;
    externalPatientData?: any;
}) {
    await ensureRole(['DOCTOR', 'NURSE', 'LAB_TECH', 'ADMIN']);
    const db = await getTenantDb();

    // Mode Validation
    if (!data.isStandalone && !data.patientId) {
        throw new Error('HOSPITAL_MODE_RESTRICTION: Hospital orders require a linked Patient ID.');
    }
    if (data.isStandalone && !data.externalPatientData) {
        throw new Error('STANDALONE_MODE_RESTRICTION: Standalone orders require external patient demographic data.');
    }

    const order = await db.labOrder.create({
        data: {
            patientId: data.patientId,
            encounterId: data.encounterId,
            orderedById: data.orderedById,
            isStandalone: data.isStandalone ?? false,
            externalPatientSource: data.externalPatientSource,
            externalPatientData: data.externalPatientData,
            testPanelId: data.testPanelId,
            urgency: data.urgency ?? 'ROUTINE',
            clinicalNotes: data.clinicalNotes,
            billedAmount: data.billedAmount,
            status: 'PENDING',
        }
    });

    // Accounting & Billing Hook
    if (data.billedAmount && data.billedAmount > 0) {
        const fiscalPeriod = `${new Date().getFullYear()}-${String(new Date().getMonth() + 1).padStart(2, '0')}`;
        await postInventoryJournalEntry({
            type: 'CLINICAL_CHARGE', 
            sourceId: order.id,
            amount: data.billedAmount,
            description: `Lab Test: ${data.testPanelId} (Standalone: ${data.isStandalone})`,
            fiscalPeriod,
            accountingStandard: 'BOTH',
        });

        await db.labOrder.update({
            where: { id: order.id },
            data: { isBilled: true }
        });
    }

    await logAudit({
        action: 'CREATE', resource: 'LabOrder', resourceId: order.id,
        details: { testPanelId: data.testPanelId, standalone: data.isStandalone }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'LAB_ORDERED', 'LabOrder', order.id);

    revalidatePath('/lab/orders');
    return order;
}

// ---------------------------------------------------------------------------
// 2. SPECIMEN COLLECTION (Phlebotomy Workflow)
// ---------------------------------------------------------------------------

export async function collectSpecimen(data: {
    labOrderId: string;
    specimenType: string;
    containerType?: string;
    collectedById: string;
}) {
    await ensureRole(['NURSE', 'LAB_TECH', 'ADMIN']);
    const db = await getTenantDb();

    const order = await db.labOrder.findUnique({ where: { id: data.labOrderId } });
    if (!order) throw new Error('Order not found');

    // Generate unique specimen barcode: e.g. LIS-2024-XXXX
    const count = await db.labSample.count();
    const barcode = `LIS-${new Date().getFullYear()}-${String(count + 1).padStart(6, '0')}`;

    const sample = await db.labSample.create({
        data: {
            labOrderId: data.labOrderId,
            specimenType: data.specimenType,
            containerType: data.containerType,
            barcode,
            collectedAt: new Date(),
            collectedById: data.collectedById,
        }
    });

    await db.labOrder.update({
        where: { id: data.labOrderId },
        data: { status: 'SAMPLE_COLLECTED' }
    });

    await logAudit({
        action: 'CREATE', resource: 'LabSample', resourceId: sample.id,
        details: { barcode, specimenType: data.specimenType }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'SPECIMEN_COLLECTED', 'LabSample', sample.id);

    revalidatePath('/lab/samples');
    return sample;
}

// ---------------------------------------------------------------------------
// 3. ANALYZER RESULT INGESTION (HL7 Proxy Payload from Edge Note)
// ---------------------------------------------------------------------------

export interface MachineResultPayload {
    machineId: string;
    analyzedAt: string;
    results: {
        biomarkerName: string;
        valueResult: string;
        numericValue?: number;
        unit?: string;
        referenceRangeMin?: number;
        referenceRangeMax?: number;
        referenceText?: string;
    }[];
}

export async function ingestAnalyzerResults(labOrderId: string, payload: MachineResultPayload) {
    // This is typically called programmatically by the proxy, but could be manual entry by LAB_TECH
    const db = await getTenantDb();

    const order = await db.labOrder.findUnique({ where: { id: labOrderId } });
    if (!order) throw new Error('Order not found');

    const resultRecords = [];
    let hasAbnormal = false;

    // Process each biomarker in the panel
    for (const res of payload.results) {
        let flag = 'NORMAL';

        // Auto-flagging engine based on reference ranges
        if (res.numericValue !== undefined && res.referenceRangeMin !== undefined && res.referenceRangeMax !== undefined) {
            if (res.numericValue < res.referenceRangeMin) flag = 'LOW';
            if (res.numericValue > res.referenceRangeMax) flag = 'HIGH';
            
            // Critical boundary estimation (customizable per biomarker logic)
            // Example approx rule: 50% outside range is critical
            const range = res.referenceRangeMax - res.referenceRangeMin;
            if (res.numericValue < (res.referenceRangeMin - (range * 0.5))) flag = 'CRITICAL_LOW';
            if (res.numericValue > (res.referenceRangeMax + (range * 0.5))) flag = 'CRITICAL_HIGH';
        } else if (res.referenceText && res.valueResult.toUpperCase() !== res.referenceText.toUpperCase()) {
            flag = 'ABNORMAL'; // E.g., Negative vs Positive
        }

        if (flag !== 'NORMAL') hasAbnormal = true;

        const record = await db.labResult.create({
            data: {
                labOrderId,
                biomarkerName: res.biomarkerName,
                valueResult: res.valueResult,
                numericValue: res.numericValue,
                unit: res.unit,
                referenceRangeMin: res.referenceRangeMin,
                referenceRangeMax: res.referenceRangeMax,
                referenceText: res.referenceText,
                flag,
                machineId: payload.machineId,
                analyzedAt: new Date(payload.analyzedAt),
            }
        });
        resultRecords.push(record);
    }

    await db.labOrder.update({
        where: { id: labOrderId },
        data: { status: 'IN_ANALYSIS' }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'RESULTS_INGESTED', 'LabOrder', labOrderId, { hasAbnormal });

    revalidatePath(`/lab/orders/${labOrderId}`);
    return { inserted: resultRecords.length, hasAbnormal };
}

// ---------------------------------------------------------------------------
// 4. PATHOLOGIST VALIDATION & REPORT GENERATION
// ---------------------------------------------------------------------------

export async function validateLabReport(labOrderId: string, pathologistId: string, clinicalInterpretation?: string, isCritical: boolean = false) {
    await ensureRole(['PATHOLOGIST', 'DOCTOR', 'ADMIN']);
    const db = await getTenantDb();

    const order = await db.labOrder.findUnique({ where: { id: labOrderId }, include: { results: true } });
    if (!order) throw new Error('Order not found');

    // Auto-escalate isCritical if the machine found critical values
    const hasCriticalFlags = order.results.some(r => r.flag === 'CRITICAL_HIGH' || r.flag === 'CRITICAL_LOW');
    const finalCriticalStatus = isCritical || hasCriticalFlags;

    const report = await db.labReport.create({
        data: {
            labOrderId,
            pathologistId,
            clinicalInterpretation,
            isCritical: finalCriticalStatus,
            status: 'FINAL',
            validatedAt: new Date(),
        }
    });

    await db.labOrder.update({
        where: { id: labOrderId },
        data: { status: 'COMPLETED' }
    });

    await logAudit({
        action: 'CREATE', resource: 'LabReport', resourceId: report.id,
        details: { labOrderId, isCritical: finalCriticalStatus }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) {
        realtimeHub.broadcast(tenantId, 'LAB_REPORT_VALIDATED', 'LabReport', report.id);
        
        if (finalCriticalStatus && !order.isStandalone) {
            // Alert ordering physician for hospital patients
            realtimeHub.broadcast(tenantId, 'CRITICAL_LAB_ALERT', 'Patient', order.patientId!, {
                labOrderId,
                message: 'Critical lab values confirmed by Pathologist.'
            });
        }
    }

    revalidatePath(`/lab/reports`);
    return report;
}
