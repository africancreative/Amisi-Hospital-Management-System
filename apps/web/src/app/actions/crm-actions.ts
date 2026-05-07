'use server';

import { db } from '@amisimedos/db';

export async function getCRMLeads(): Promise<any[]> {
    return db.lead.findMany({
        orderBy: { createdAt: 'desc' },
        include: {
            assignedAgent: true,
            communications: true,
        }
    });
}

export async function getCRMTasks(): Promise<any[]> {
    return db.task.findMany({
        orderBy: { dueDate: 'asc' },
        include: {
            assignedTo: true,
            lead: true,
        }
    });
}

export async function getCRMCommunications(): Promise<any[]> {
    return db.communicationLog.findMany({
        orderBy: { timestamp: 'desc' },
        take: 50,
        include: {
            user: true,
            lead: true,
        }
    });
}
