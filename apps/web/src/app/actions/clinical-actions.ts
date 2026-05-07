'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { ensureRole } from '@/lib/auth-utils';
import { logAudit } from '@/lib/audit';
import { realtimeHub } from '@amisimedos/chat';
import { getResolvedTenantId, getTenantSyncSecret } from '@/lib/tenant';
import { recordEvent } from '@amisimedos/sync';
import { generateMRN } from '@/lib/mrn';

// ─── PATIENT & EHR ACTIONS ───────────────────────────────────────────────────

export async function getPatients(query?: string): Promise<any> {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    const db = await getTenantDb();
    return db.patient.findMany({
        where: query ? { OR: [{ firstName: { contains: query, mode: 'insensitive' } }, { lastName: { contains: query, mode: 'insensitive' } }, { mrn: { contains: query, mode: 'insensitive' } }] } : {},
        orderBy: { createdAt: 'desc' },
    });
}

export async function getPatientById(id: string): Promise<any> {
    const db = await getTenantDb();
    return db.patient.findUnique({
        where: { id },
        include: {
            vitals: { orderBy: { createdAt: 'desc' }, take: 5 },
            diagnosticOrders: { orderBy: { createdAt: 'desc' } },
            labOrders: { orderBy: { createdAt: 'desc' } },
            prescriptions: { orderBy: { createdAt: 'desc' } },
            encounters: { orderBy: { createdAt: 'desc' }, include: { vitals: true } },
            chats: { orderBy: { timestamp: 'desc' } },
            allergies: true,
            invoices: { orderBy: { createdAt: 'desc' } },
        }
    });
}

export async function createPatient(formData: FormData): Promise<any> {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const db = await getTenantDb();
    const mrn = await generateMRN(db, "AM");
    const patient = await db.$transaction(async (tx: any) => {
        const p = await tx.patient.create({ data: { mrn, firstName, lastName, dob: new Date(formData.get('dob') as string), gender: formData.get('gender') as string, phone: formData.get('phone') as string, email: formData.get('email') as string } });
        await tx.encounter.create({ data: { patientId: p.id, type: 'INTAKE', doctorName: 'SYSTEM', notes: 'Initial intake.' } });
        return p;
    });
    await logAudit({ action: 'CREATE', resource: 'Patient', resourceId: patient.id });
    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'PATIENT_MUTATED', 'Patient', patient.id);
    revalidatePath('/patients');
    return patient;
}

export async function createEncounter(patientId: string, formData: FormData): Promise<any> {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    const db = await getTenantDb();
    const encounter = await db.encounter.create({ data: { patientId, doctorName: formData.get('doctorName') as string, type: formData.get('type') as string, notes: formData.get('notes') as string } });
    await logAudit({ action: 'CREATE', resource: 'Encounter', resourceId: encounter.id });
    revalidatePath(`/patients/${patientId}`);
    return encounter;
}

// ─── ADT ACTIONS (Admission, Discharge, Transfer) ────────────────────────────

export async function admitPatient(data: { encounterId: string; bedId: string; attendingPhysicianId?: string; admissionReason?: string; }): Promise<any> {
    await ensureRole(['DOCTOR', 'NURSE', 'ADMIN']);
    const db = await getTenantDb();
    const bed = await db.bed.findUnique({ where: { id: data.bedId } });
    if (!bed || bed.status !== 'AVAILABLE') throw new Error('BED_UNAVAILABLE');
    const admission = await db.$transaction(async (tx: any) => {
        const adm = await tx.admission.create({ data: { encounterId: data.encounterId, bedId: data.bedId, status: 'ADMITTED' } });
        await tx.bed.update({ where: { id: data.bedId }, data: { status: 'OCCUPIED' } });
        return adm;
    });
    revalidatePath('/ward/admissions');
    return admission;
}

export async function dischargePatient(admissionId: string): Promise<any> {
    await ensureRole(['DOCTOR', 'ADMIN']);
    const db = await getTenantDb();
    const admission = await db.admission.findUnique({ where: { id: admissionId } });
    if (!admission || admission.status !== 'ADMITTED') throw new Error('DISCHARGE_FAILED');
    await db.$transaction(async (tx: any) => {
        await tx.admission.update({ where: { id: admissionId }, data: { status: 'DISCHARGED', dischargedAt: new Date() } });
        await tx.bed.update({ where: { id: admission.bedId }, data: { status: 'AVAILABLE' } });
    });
    revalidatePath('/ward/admissions');
    return { success: true };
}

// ─── DIAGNOSTIC & LAB ACTIONS ────────────────────────────────────────────────

export async function orderDiagnostic(formData: FormData): Promise<any> {
    await ensureRole(['DOCTOR', 'ADMIN']);
    const patientId = formData.get('patientId') as string;
    const db = await getTenantDb();
    const order = await db.diagnosticOrder.create({
        data: { patientId, testName: formData.get('testName') as string, category: formData.get('category') as string || 'LAB', status: 'pending', orderedBy: 'SYSTEM' }
    });
    const tenantId = await getResolvedTenantId();
    if (tenantId) realtimeHub.broadcast(tenantId, 'DIAGNOSTIC_ORDERED', 'Patient', patientId);
    revalidatePath(`/patients/${patientId}`);
    return order;
}
