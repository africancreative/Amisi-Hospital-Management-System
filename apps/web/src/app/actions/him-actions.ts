'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisimedos/chat';
import { getResolvedTenantId } from '@/lib/tenant';
import { createHash } from 'crypto';

// ---------------------------------------------------------------------------
// RECORD ACCESS & AUDIT LOGGING
// ---------------------------------------------------------------------------

export async function fetchPatientRecord(patientId: string, employeeId: string, reasonForAccess: string) {
    await ensureRole(['HIM_OFFICER', 'DOCTOR', 'NURSE', 'ADMIN', 'AUDITOR']);
    const db = await getTenantDb();

    // Check Access Grants
    const hasGrant = await db.recordAccessGrant.findFirst({
        where: {
            patientId,
            grantedTo: employeeId,
            isActive: true,
            OR: [
                { expiresAt: null },
                { expiresAt: { gt: new Date() } }
            ]
        }
    });

    const patient = await db.patient.findUnique({
        where: { id: patientId },
        include: {
            vitals: { orderBy: { createdAt: 'desc' }, take: 10 },
            prescriptions: true,
            allergies: true,
            labOrders: true,
        }
    });

    // Write strictly to the immutable audit log on every read
    await logAudit({
        action: 'ACCESS',
        resource: 'PatientRecord',
        resourceId: patientId,
        details: {
            employeeId,
            reason: reasonForAccess,
            grantedVia: hasGrant ? hasGrant.id : 'ROLE_DEFAULT'
        }
    });

    return patient;
}

// ---------------------------------------------------------------------------
// RECORD AMENDMENTS & VERSIONING (HIPAA Compliant Edit)
// ---------------------------------------------------------------------------

export async function amendPatientRecord(patientId: string, employeeId: string, employeeRole: string, changeReason: string, updatedData: any) {
    await ensureRole(['HIM_OFFICER', 'DOCTOR']);
    const db = await getTenantDb();

    const previousVersionCount = await db.recordVersion.count({ where: { patientId } });
    const versionNumber = previousVersionCount + 1;

    // Fetch previous hash for cryptographic chaining
    const prevEntry = await db.recordVersion.findUnique({
        where: { patientId_versionNumber: { patientId, versionNumber: previousVersionCount } }
    });
    const prevHash = prevEntry?.hash ?? '0000000000000000000000000000000000000000000000000000000000000000';

    const payload = JSON.stringify(updatedData);
    const chainStr = `${prevHash}|${patientId}|${versionNumber}|${payload}`;
    const hash = createHash('sha256').update(chainStr).digest('hex');

    const newVersion = await db.recordVersion.create({
        data: {
            patientId,
            versionNumber,
            changedBy: employeeId,
            changedByRole: employeeRole,
            changeReason,
            changeType: 'AMENDMENT',
            snapshotData: updatedData, // Note: Encryption should be done above the ORM layer mapped to boolean flag
            isEncrypted: false,
            hash,
            prevHash,
            accessLevel: 'RESTRICTED'
        }
    });

    await logAudit({
        action: 'UPDATE',
        resource: 'PatientRecord',
        resourceId: patientId,
        details: { action: 'AMENDMENT', version: versionNumber, reason: changeReason }
    });

    return newVersion;
}

// ---------------------------------------------------------------------------
// RELEASE OF INFORMATION (ROI) WORKFLOW
// ---------------------------------------------------------------------------

export async function submitROIRequest(data: {
    patientId: string;
    requestedBy: string;
    requesterType: string;
    requesterOrg?: string;
    requesterEmail?: string;
    purposeOfUse: string;
    requestedFields: string[];
    urgency?: string;
    consentFormId?: string;
}) {
    await ensureRole(['HIM_OFFICER', 'ADMIN', 'PATIENT_PORTAL']);
    const db = await getTenantDb();

    const request = await db.releaseRequest.create({
        data: {
            patientId: data.patientId,
            requestedBy: data.requestedBy,
            requesterType: data.requesterType,
            requesterOrg: data.requesterOrg,
            requesterEmail: data.requesterEmail,
            purposeOfUse: data.purposeOfUse,
            requestedFields: data.requestedFields,
            urgency: data.urgency ?? 'ROUTINE',
            consentFormId: data.consentFormId,
            status: 'PENDING',
        }
    });

    await logAudit({
        action: 'CREATE', resource: 'ReleaseRequest', resourceId: request.id,
        details: { patientId: data.patientId, requester: data.requestedBy, purpose: data.purposeOfUse }
    });

    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'ROI_REQUESTED', 'ReleaseRequest', request.id);

    revalidatePath('/him/roi');
    return request;
}

export async function reviewROIRequest(requestId: string, reviewerId: string, action: 'APPROVE' | 'DENY', notes?: string) {
    await ensureRole(['HIM_OFFICER', 'ADMIN']);
    const db = await getTenantDb();

    const request = await db.releaseRequest.findUnique({ where: { id: requestId } });
    if (!request) throw new Error('Request not found');

    const updated = await db.releaseRequest.update({
        where: { id: requestId },
        data: {
            status: action === 'APPROVE' ? 'APPROVED' : 'DENIED',
            reviewedBy: reviewerId,
            reviewedAt: new Date(),
            approvalNotes: action === 'APPROVE' ? notes : undefined,
            denialReason: action === 'DENY' ? notes : undefined,
        }
    });

    if (action === 'APPROVE') {
        const tenantId = await getResolvedTenantId();
        if (tenantId) realtimeHub.broadcast(tenantId, 'ROI_APPROVED', 'ReleaseRequest', requestId);
    }

    await logAudit({
        action: 'UPDATE', resource: 'ReleaseRequest', resourceId: requestId,
        details: { action: 'ROI_REVIEW', decision: action, reviewerId }
    });

    revalidatePath('/him/roi');
    return updated;
}

// ---------------------------------------------------------------------------
// CONSENT FORMS
// ---------------------------------------------------------------------------

export async function registerConsentForm(data: {
    patientId: string;
    formType: string;
    version: string;
    consentGiven: boolean;
    consentScope: string[];
    authorizedParty?: string;
    signedByName?: string;
    signatureMethod?: string;
    witnessId?: string;
    documentUrl?: string;
    expiresDays?: number;
}) {
    await ensureRole(['HIM_OFFICER', 'DOCTOR', 'NURSE', 'ADMIN']);
    const db = await getTenantDb();

    const expiresAt = data.expiresDays ? new Date(Date.now() + data.expiresDays * 86400000) : undefined;

    const form = await db.consentForm.create({
        data: {
            patientId: data.patientId,
            formType: data.formType,
            version: data.version,
            consentGiven: data.consentGiven,
            consentScope: data.consentScope,
            authorizedParty: data.authorizedParty,
            signedAt: new Date(),
            signedByName: data.signedByName,
            signatureMethod: data.signatureMethod,
            witnessId: data.witnessId,
            documentUrl: data.documentUrl,
            expiresAt,
            isEncrypted: !!data.documentUrl,
        }
    });

    await logAudit({
        action: 'CREATE', resource: 'ConsentForm', resourceId: form.id,
        details: { patientId: data.patientId, type: data.formType, granted: data.consentGiven }
    });

    revalidatePath(`/him/patients/${data.patientId}`);
    return form;
}

// ---------------------------------------------------------------------------
// RECORD ACCESS GRANTS
// ---------------------------------------------------------------------------

export async function grantRecordAccess(data: {
    patientId: string;
    grantedTo: string;
    grantedToRole: string;
    grantedBy: string;
    accessLevel: string;
    scope: string[];
    reason?: string;
    expiresDays?: number;
}) {
    await ensureRole(['HIM_OFFICER', 'ADMIN', 'DOCTOR']);
    const db = await getTenantDb();

    const expiresAt = data.expiresDays ? new Date(Date.now() + data.expiresDays * 86400000) : undefined;

    const grant = await db.recordAccessGrant.create({
        data: {
            patientId: data.patientId,
            grantedTo: data.grantedTo,
            grantedToRole: data.grantedToRole,
            grantedBy: data.grantedBy,
            accessLevel: data.accessLevel,
            scope: data.scope,
            reason: data.reason,
            expiresAt,
            isActive: true,
        }
    });

    await logAudit({
        action: 'CREATE', resource: 'RecordAccessGrant', resourceId: grant.id,
        details: { patientId: data.patientId, grantedTo: data.grantedTo, level: data.accessLevel }
    });

    return grant;
}
