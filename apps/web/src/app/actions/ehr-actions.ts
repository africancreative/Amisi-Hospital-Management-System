'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// Patient Actions
export async function getPatients(query?: string) {
    const db = await getTenantDb();
    return await db.patient.findMany({
        where: query ? {
            OR: [
                { firstName: { contains: query, mode: 'insensitive' } },
                { lastName: { contains: query, mode: 'insensitive' } },
            ]
        } : {},
        orderBy: { createdAt: 'desc' },
    });
}

export async function getPatientById(id: string) {
    const db = await getTenantDb();
    return await db.patient.findUnique({
        where: { id },
        include: {
            encounters: {
                include: {
                    vitals: true,
                    diagnoses: true,
                },
                orderBy: { createdAt: 'desc' },
            },
            vitals: {
                orderBy: { createdAt: 'desc' },
                take: 5,
            },
            allergies: true,
            financialRecords: {
                orderBy: { createdAt: 'desc' },
            },
            labOrders: {
                include: { results: true },
                orderBy: { createdAt: 'desc' },
            },
            chats: {
                include: { attachments: true },
                orderBy: { timestamp: 'desc' },
            }
        }
    });
}

export async function createPatient(formData: FormData) {
    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const dob = new Date(formData.get('dob') as string);
    const gender = formData.get('gender') as string;

    const db = await getTenantDb();
    const patient = await db.patient.create({
        data: {
            firstName,
            lastName,
            dob,
            gender,
        }
    });

    revalidatePath('/patients');
    return patient;
}

// Encounter Actions
export async function createEncounter(patientId: string, formData: FormData) {
    const doctorName = formData.get('doctorName') as string;
    const type = formData.get('type') as string;
    const notes = formData.get('notes') as string;
    const plan = formData.get('plan') as string;

    const db = await getTenantDb();
    const encounter = await db.encounter.create({
        data: {
            patientId,
            doctorName,
            type,
            notes,
            plan,
        }
    });

    // Extract Vitals if provided
    const bp = formData.get('bloodPressure') as string;
    if (bp) {
        await db.vitals.create({
            data: {
                patientId,
                encounterId: encounter.id,
                bloodPressure: bp,
                heartRate: parseInt(formData.get('heartRate') as string) || undefined,
                temperature: formData.get('temperature') ? parseFloat(formData.get('temperature') as string) : undefined,
                weight: formData.get('weight') ? parseFloat(formData.get('weight') as string) : undefined,
            }
        });
    }

    revalidatePath(`/patients/${patientId}`);
    return encounter;
}
