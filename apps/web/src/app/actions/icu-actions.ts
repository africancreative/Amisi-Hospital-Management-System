'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisi/realtime';
import { getResolvedTenantId } from '@/lib/tenant';

// ICU threshold configuration
const ICU_THRESHOLDS = {
    spO2Min: 90,
    heartRateMax: 140,
    heartRateMin: 40,
    systolicBPMin: 80,
    systolicBPMax: 200,
    tempMax: 39.5,
    tempMin: 35.0,
};

// ---------------------------------------------------------------------------
// OPEN ICU EPISODE
// ---------------------------------------------------------------------------

export async function openICUEpisode(data: {
    patientId: string;
    encounterId?: string;
    bedId?: string;
    admissionReason: string;
    codeStatus?: string;
    isolationStatus?: string;
    ventilatorMode?: string;
    apacheScore?: number;
}) {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    const db = await getTenantDb();

    const episode = await db.iCUMonitoring.create({
        data: {
            patientId: data.patientId,
            encounterId: data.encounterId,
            bedId: data.bedId,
            admissionReason: data.admissionReason,
            codeStatus: data.codeStatus ?? 'FULL',
            isolationStatus: data.isolationStatus ?? 'NONE',
            ventilatorMode: data.ventilatorMode,
            apacheScore: data.apacheScore,
        }
    });

    await logAudit({
        action: 'CREATE', resource: 'ICUMonitoring', resourceId: episode.id,
        details: { patientId: data.patientId, admissionReason: data.admissionReason }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'ICU_ADMISSION', 'Patient', data.patientId);

    revalidatePath('/icu/dashboard');
    return episode;
}

// ---------------------------------------------------------------------------
// RECORD VITALS WITH THRESHOLD ALARM ENGINE
// ---------------------------------------------------------------------------

export async function recordICUVitals(data: {
    patientId: string;
    encounterId?: string;
    icuMonitoringId?: string;
    recordedBy: string;
    bloodPressure?: string;
    heartRate?: number;
    temperature?: number;
    respiratoryRate?: number;
    spO2?: number;
    gcs?: number;
    urineOutputMl?: number;
    painScore?: number;
    infusionData?: object[];
    source?: string;
}) {
    await ensureRole(['NURSE', 'ADMIN']);
    const db = await getTenantDb();

    // --- Threshold Engine ---
    const alarms: string[] = [];
    let systolic: number | undefined;

    if (data.bloodPressure) {
        systolic = parseInt(data.bloodPressure.split('/')[0]);
        if (systolic < ICU_THRESHOLDS.systolicBPMin) alarms.push(`Hypotension: SBP ${systolic} mmHg`);
        if (systolic > ICU_THRESHOLDS.systolicBPMax) alarms.push(`Hypertension: SBP ${systolic} mmHg`);
    }
    if (data.spO2 !== undefined && data.spO2 < ICU_THRESHOLDS.spO2Min)
        alarms.push(`SpO2 critical: ${data.spO2}%`);
    if (data.heartRate !== undefined) {
        if (data.heartRate > ICU_THRESHOLDS.heartRateMax) alarms.push(`Tachycardia: ${data.heartRate} bpm`);
        if (data.heartRate < ICU_THRESHOLDS.heartRateMin) alarms.push(`Bradycardia: ${data.heartRate} bpm`);
    }
    if (data.temperature !== undefined) {
        if (data.temperature > ICU_THRESHOLDS.tempMax) alarms.push(`Hyperthermia: ${data.temperature}°C`);
        if (data.temperature < ICU_THRESHOLDS.tempMin) alarms.push(`Hypothermia: ${data.temperature}°C`);
    }

    const isCritical = alarms.length > 0;

    const vitals = await db.vitalsLog.create({
        data: {
            patientId: data.patientId,
            encounterId: data.encounterId,
            icuMonitoringId: data.icuMonitoringId,
            recordedBy: data.recordedBy,
            bloodPressure: data.bloodPressure,
            heartRate: data.heartRate,
            temperature: data.temperature,
            respiratoryRate: data.respiratoryRate,
            spO2: data.spO2,
            gcs: data.gcs,
            urineOutputMl: data.urineOutputMl,
            painScore: data.painScore,
            infusionData: data.infusionData ?? [],
            source: data.source ?? 'MANUAL',
            isCritical,
        }
    });

    // Broadcast critical alarms immediately
    if (isCritical) {
        const tenantId = await getResolvedTenantId();
        if (tenantId) {
            realtimeHub.broadcast(tenantId, 'ICU_ALARM', 'Patient', data.patientId, {
                alarms, vitalsLogId: vitals.id, severity: 'CRITICAL'
            });
        }
    }

    await logAudit({
        action: 'CREATE', resource: 'VitalsLog', resourceId: vitals.id,
        details: { isCritical, alarms, source: data.source }
    });

    revalidatePath('/icu/dashboard');
    return { vitals, isCritical, alarms };
}

// ---------------------------------------------------------------------------
// UPDATE VENTILATOR SETTINGS
// ---------------------------------------------------------------------------

export async function updateVentilatorSettings(icuMonitoringId: string, settings: {
    ventilatorMode: string;
    fio2?: number;
    tidalVolume?: number;
    peep?: number;
}) {
    await ensureRole(['DOCTOR', 'ADMIN']);
    const db = await getTenantDb();

    const updated = await db.iCUMonitoring.update({
        where: { id: icuMonitoringId },
        data: settings
    });

    await logAudit({
        action: 'UPDATE', resource: 'ICUMonitoring', resourceId: icuMonitoringId,
        details: { action: 'VENTILATOR_UPDATE', ...settings }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'VENTILATOR_UPDATED', 'ICUMonitoring', icuMonitoringId);

    return updated;
}

// ---------------------------------------------------------------------------
// UPDATE SOFA SCORE (daily)
// ---------------------------------------------------------------------------

export async function updateSOFAScore(icuMonitoringId: string, sofaScore: number, apacheScore?: number) {
    await ensureRole(['DOCTOR', 'ADMIN']);
    const db = await getTenantDb();

    const updated = await db.iCUMonitoring.update({
        where: { id: icuMonitoringId },
        data: { sofaScore, apacheScore }
    });

    await logAudit({
        action: 'UPDATE', resource: 'ICUMonitoring', resourceId: icuMonitoringId,
        details: { action: 'SOFA_UPDATE', sofaScore, apacheScore }
    });

    return updated;
}

// ---------------------------------------------------------------------------
// GET ACTIVE ICU PATIENTS (dashboard feed)
// ---------------------------------------------------------------------------

export async function getActiveICUPatients() {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    const db = await getTenantDb();

    return db.iCUMonitoring.findMany({
        where: { dischargedAt: null },
        include: {
            patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
            bed: true,
            vitalsLogs: { orderBy: { recordedAt: 'desc' }, take: 1 }
        },
        orderBy: { admittedAt: 'asc' }
    });
}

// ---------------------------------------------------------------------------
// DISCHARGE FROM ICU
// ---------------------------------------------------------------------------

export async function dischargeFromICU(icuMonitoringId: string) {
    await ensureRole(['DOCTOR', 'ADMIN']);
    const db = await getTenantDb();

    const episode = await db.iCUMonitoring.update({
        where: { id: icuMonitoringId },
        data: { dischargedAt: new Date() }
    });

    if (episode.bedId) {
        await db.bed.update({ where: { id: episode.bedId }, data: { status: 'CLEANING' } });
    }

    await logAudit({
        action: 'UPDATE', resource: 'ICUMonitoring', resourceId: icuMonitoringId,
        details: { action: 'ICU_DISCHARGE' }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'ICU_DISCHARGE', 'Patient', episode.patientId);

    revalidatePath('/icu/dashboard');
    return episode;
}
