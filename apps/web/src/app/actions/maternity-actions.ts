'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisimedos/chat';
import { getResolvedTenantId } from '@/lib/tenant';

// ---------------------------------------------------------------------------
// REGISTER ANTENATAL PATIENT (ANC Booking)
// ---------------------------------------------------------------------------

export async function registerMaternityPatient(data: {
    patientId: string;
    encounterId?: string;
    gravida: number;
    para: number;
    lmp: string;        // ISO date string
    bloodGroup?: string;
    rhesus?: string;
    hivStatus?: string;
    riskFactors?: string[];
}): Promise<any> {
    await ensureRole(['NURSE', 'MIDWIFE', 'ADMIN']);
    const db = await getTenantDb();

    // Calculate EDD (LMP + 280 days — Naegele's Rule)
    const lmp = new Date(data.lmp);
    const edd = new Date(lmp);
    edd.setDate(edd.getDate() + 280);

    // Calculate gestational age in weeks
    const gestationalAgeWeeks = Math.floor((Date.now() - lmp.getTime()) / (7 * 24 * 60 * 60 * 1000));

    // Auto risk stratification
    const riskFactors = data.riskFactors ?? [];
    let riskLevel = 'LOW';
    if (data.hivStatus === 'Positive') { riskFactors.push('HIV_POSITIVE'); riskLevel = 'HIGH'; }
    if (data.gravida > 4) { riskFactors.push('GRAND_MULTIPARITY'); riskLevel = riskLevel === 'LOW' ? 'MEDIUM' : riskLevel; }
    if (gestationalAgeWeeks < 28) { riskFactors.push('PRETERM_RISK'); riskLevel = 'HIGH'; }

    // Set next ANC date (first visit: 4 weeks from now, or per schedule)
    const nextAncDate = new Date();
    nextAncDate.setDate(nextAncDate.getDate() + 28);

    const record = await db.maternityRecord.create({
        data: {
            patientId: data.patientId,
            encounterId: data.encounterId,
            gravida: data.gravida,
            para: data.para,
            lmp,
            edd,
            gestationalAgeWeeks,
            bloodGroup: data.bloodGroup,
            rhesus: data.rhesus,
            hivStatus: data.hivStatus,
            pmtctEnrolled: data.hivStatus === 'Positive',
            riskLevel,
            riskFactors,
            nextAncDate,
            status: 'ANTENATAL',
        }
    });

    // Alert high-risk patients
    if (riskLevel === 'HIGH') {
        const tenantId = await getResolvedTenantId();
        if (tenantId) {
            realtimeHub.broadcast(tenantId, 'HIGH_RISK_PREGNANCY', 'MaternityRecord', record.id, {
                riskFactors, patientId: data.patientId
            });
        }
    }

    await logAudit({
        action: 'CREATE', resource: 'MaternityRecord', resourceId: record.id,
        details: { patientId: data.patientId, edd: edd.toISOString(), riskLevel, pmtctEnrolled: record.pmtctEnrolled }
    });

    revalidatePath('/maternity/register');
    return record;
}

// ---------------------------------------------------------------------------
// RECORD ANC VISIT
// ---------------------------------------------------------------------------

export async function recordANCVisit(maternityRecordId: string, data: {
    fundalHeightCm?: number;
    foetusPresentation?: string;
    foetusHeartRate?: number;
    maternalWeight?: number;
    maternalBP?: string;
    urineProtein?: string;
    urineGlucose?: string;
    notes?: string;
    nextVisitDays?: number;
}): Promise<any> {
    await ensureRole(['NURSE', 'MIDWIFE', 'ADMIN']);
    const db = await getTenantDb();

    const nextAncDate = new Date();
    nextAncDate.setDate(nextAncDate.getDate() + (data.nextVisitDays ?? 28));

    // Log visit as a vitals entry linked to the maternity patient
    const record = await db.maternityRecord.findUnique({ where: { id: maternityRecordId } });
    if (!record) throw new Error('Maternity record not found');

    // Record ANC vitals
    await db.vitals.create({
        data: {
            patientId: record.patientId,
            encounterId: record.encounterId,
            bloodPressure: data.maternalBP,
            weight: data.maternalWeight,
        }
    });

    const updated = await db.maternityRecord.update({
        where: { id: maternityRecordId },
        data: {
            ancVisitCount: { increment: 1 },
            nextAncDate,
        }
    });

    await logAudit({
        action: 'UPDATE', resource: 'MaternityRecord', resourceId: maternityRecordId,
        details: { action: 'ANC_VISIT', ancVisitCount: updated.ancVisitCount, foetusHeartRate: data.foetusHeartRate }
    });

    revalidatePath(`/maternity/${maternityRecordId}`);
    return updated;
}

// ---------------------------------------------------------------------------
// START LABOUR (opens DeliveryLog + WHO Partogram)
// ---------------------------------------------------------------------------

export async function startLabour(maternityRecordId: string, data: {
    midwifeId: string;
    obstetricianId?: string;
    membraneStatus?: string;
    liquorColor?: string;
}): Promise<any> {
    await ensureRole(['NURSE', 'MIDWIFE', 'ADMIN']);
    const db = await getTenantDb();

    // Transition maternity record to LABOUR status
    await db.maternityRecord.update({
        where: { id: maternityRecordId },
        data: { status: 'LABOUR' }
    });

    // Create the DeliveryLog (partogram container)
    const deliveryLog = await db.deliveryLog.create({
        data: {
            maternityRecordId,
            patientId: (await db.maternityRecord.findUnique({ where: { id: maternityRecordId } }))!.patientId,
            midwifeId: data.midwifeId,
            obstetricianId: data.obstetricianId,
            labourOnsetAt: new Date(),
            membraneStatus: data.membraneStatus ?? 'INTACT',
            liquorColor: data.liquorColor ?? 'CLEAR',
            partogramData: [],
        }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'LABOUR_STARTED', 'MaternityRecord', maternityRecordId);

    await logAudit({
        action: 'CREATE', resource: 'DeliveryLog', resourceId: deliveryLog.id,
        details: { maternityRecordId, midwifeId: data.midwifeId }
    });

    revalidatePath('/maternity/active-labour');
    return deliveryLog;
}

// ---------------------------------------------------------------------------
// PUSH PARTOGRAM DATA POINT (WHO Alert Line Engine)
// ---------------------------------------------------------------------------

export interface PartogramPoint {
    time: number;           // Unix timestamp (ms)
    cervicalDilation: number; // cm (0–10)
    foetaltDescent: number;   // Fetal station (-3 to +3)
    contractionsPerHr: number;
    foetusHeartRate: number;  // bpm
    maternalBP?: string;
}

export async function pushPartogramPoint(deliveryLogId: string, point: PartogramPoint): Promise<any> {
    await ensureRole(['NURSE', 'MIDWIFE', 'ADMIN']);
    const db = await getTenantDb();

    const log = await db.deliveryLog.findUnique({ where: { id: deliveryLogId } });
    if (!log) throw new Error('Delivery log not found');

    const existingData = (log.partogramData as unknown as PartogramPoint[]) ?? [];

    // WHO Alert Line dystocia check: dilation should progress ≥ 1cm/hr in active phase
    const lastPoint = existingData.at(-1);
    if (lastPoint && point.cervicalDilation >= 4) { // Active phase starts at 4cm
        const hoursElapsed = (point.time - lastPoint.time) / 3600000;
        const dilationProgress = point.cervicalDilation - lastPoint.cervicalDilation;
        if (hoursElapsed >= 1 && dilationProgress < 1) {
            const tenantId = await getResolvedTenantId();
            if (tenantId) {
                realtimeHub.broadcast(tenantId, 'PARTOGRAM_ALERT', 'DeliveryLog', deliveryLogId, {
                    reason: 'LABOUR_DYSTOCIA',
                    message: `Dilation ${dilationProgress.toFixed(1)}cm in ${hoursElapsed.toFixed(1)}hr (WHO: ≥1cm/hr)`,
                });
            }
        }
    }

    // Foetal distress check
    if (point.foetusHeartRate < 110 || point.foetusHeartRate > 160) {
        const tenantId = await getResolvedTenantId();
        if (tenantId) {
            realtimeHub.broadcast(tenantId, 'FOETAL_DISTRESS', 'DeliveryLog', deliveryLogId, {
                fhr: point.foetusHeartRate,
                message: `FHR ${point.foetusHeartRate} bpm — outside normal range (110–160)`
            });
        }
    }

    const updated = await db.deliveryLog.update({
        where: { id: deliveryLogId },
        data: { partogramData: [...existingData, point] as any }
    });

    revalidatePath('/maternity/active-labour');
    return updated;
}

// ---------------------------------------------------------------------------
// RECORD DELIVERY EVENT + AUTO-CREATE NEONATAL PATIENT RECORD
// ---------------------------------------------------------------------------

export async function recordDelivery(deliveryLogId: string, data: {
    deliveryMethod: string;
    cSectionIndication?: string;
    bloodLossMl?: number;
    episiotomy?: boolean;
    perinealTear?: string;
    isEmergency?: boolean;
    babySex: string;
    birthWeightKg: number;
    apgar1min: number;
    apgar5min: number;
    resuscitationRequired?: boolean;
    oxytocinGiven?: boolean;
    vitaminKGiven?: boolean;
}): Promise<any> {
    await ensureRole(['NURSE', 'MIDWIFE', 'DOCTOR', 'ADMIN']);
    const db = await getTenantDb();

    const log = await db.deliveryLog.findUnique({
        where: { id: deliveryLogId },
        include: { maternityRecord: { include: { patient: true } } }
    });
    if (!log) throw new Error('Delivery log not found');

    const mother = log.maternityRecord.patient;

    // 1. Update the delivery log
    await db.deliveryLog.update({
        where: { id: deliveryLogId },
        data: {
            deliveryTime: new Date(),
            deliveryMethod: data.deliveryMethod,
            cSectionIndication: data.cSectionIndication,
            bloodLossMl: data.bloodLossMl,
            episiotomy: data.episiotomy ?? false,
            perinealTear: data.perinealTear ?? 'NONE',
            isEmergency: data.isEmergency ?? false,
            babySex: data.babySex,
            birthWeightKg: data.birthWeightKg,
            apgar1min: data.apgar1min,
            apgar5min: data.apgar5min,
            resuscitationRequired: data.resuscitationRequired ?? false,
            oxytocinGiven: data.oxytocinGiven ?? false,
            vitaminKGiven: data.vitaminKGiven ?? false,
        }
    });

    // 2. Auto-create neonatal Patient record linked to mother
    const neonatalMrn = `NEO-${mother.mrn}-${Date.now().toString().slice(-4)}`;
    const neonate = await db.patient.create({
        data: {
            mrn: neonatalMrn,
            firstName: `Baby (${data.babySex})`,
            lastName: mother.lastName,
            dob: new Date(),
            gender: data.babySex,
        }
    });

    // 3. Update MaternityRecord with delivery outcome
    await db.maternityRecord.update({
        where: { id: log.maternityRecordId },
        data: {
            status: 'POSTNATAL',
            deliveryOutcome: data.deliveryMethod === 'C_SECTION' ? 'C_SECTION' : 'SVD',
            deliveryDate: new Date(),
            birthWeightKg: data.birthWeightKg,
            apgar1min: data.apgar1min,
            apgar5min: data.apgar5min,
            neonatalPatientId: neonate.id,
        }
    });

    // Broadcast critical alerts
    const tenantId = await getResolvedTenantId();
    if (tenantId) {
        realtimeHub.broadcast(tenantId, 'DELIVERY_COMPLETE', 'MaternityRecord', log.maternityRecordId, {
            deliveryMethod: data.deliveryMethod,
            apgar5min: data.apgar5min,
            isEmergency: data.isEmergency,
        });

        // NICU alert if APGAR < 7 or resuscitation needed
        if (data.apgar5min < 7 || data.resuscitationRequired) {
            realtimeHub.broadcast(tenantId, 'NICU_ALERT', 'Patient', neonate.id, {
                reason: data.resuscitationRequired ? 'RESUSCITATION' : 'LOW_APGAR',
                apgar5min: data.apgar5min,
                birthWeightKg: data.birthWeightKg,
            });
        }
    }

    await logAudit({
        action: 'UPDATE', resource: 'DeliveryLog', resourceId: deliveryLogId,
        details: { deliveryMethod: data.deliveryMethod, isEmergency: data.isEmergency, neonatalPatientId: neonate.id }
    });

    revalidatePath('/maternity/active-labour');
    revalidatePath(`/patients/${mother.id}`);
    return { deliveryLog: log, neonate };
}

// ---------------------------------------------------------------------------
// ACTIVE LABOUR BOARD (dashboard)
// ---------------------------------------------------------------------------

export async function getActiveLaborPatients(): Promise<any> {
    await ensureRole(['NURSE', 'MIDWIFE', 'ADMIN']);
    const db = await getTenantDb();

    return db.maternityRecord.findMany({
        where: { status: 'LABOUR' },
        include: {
            patient: { select: { id: true, firstName: true, lastName: true, mrn: true } },
            deliveryLog: true,
        },
        orderBy: { updatedAt: 'asc' }
    });
}
