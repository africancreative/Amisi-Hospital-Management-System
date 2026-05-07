'use server';

import { getTenantDb, getControlDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

// ─── CHAT & COMMUNICATION ACTIONS ────────────────────────────────────────────

export async function sendClinicalMessage(patientId: string, content: string, authorName: string, authorRole: string): Promise<any> {
    const db = await getTenantDb();
    const message = await db.chatMessage.create({ data: { content, patientId, authorId: 'system', authorName, authorRole } });
    revalidatePath(`/patients/${patientId}`);
    return message;
}

// ─── QUEUE MANAGEMENT ACTIONS ────────────────────────────────────────────────

export async function updateQueueStatus(ticketId: string, status: string): Promise<any> {
    const db = await getTenantDb();
    const ticket = await db.queueTicket.update({ where: { id: ticketId }, data: { status } });
    revalidatePath('/queue');
    return ticket;
}

// ─── DASHBOARD & ANALYTICS ACTIONS ───────────────────────────────────────────

export async function getTenantDashboardStats(date?: string): Promise<any> {
    const db = await getTenantDb();
    const patients = await db.patient.count();
    const revenue = await db.payment.aggregate({ _sum: { amount: true } });
    const occupancy = await db.bed.count({ where: { status: 'OCCUPIED' } });
    return { patients, revenue: revenue._sum.amount || 0, occupancy };
}

// ─── CRM ACTIONS ─────────────────────────────────────────────────────────────

export async function getCRMLeads(): Promise<any[]> {
    return getControlDb().lead.findMany({ orderBy: { createdAt: 'desc' }, include: { assignedAgent: true } });
}

export async function getCRMTasks(): Promise<any[]> {
    return getControlDb().task.findMany({ orderBy: { dueDate: 'asc' }, include: { lead: true } });
}
