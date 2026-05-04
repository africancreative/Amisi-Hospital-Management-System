'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';
import { getServerUser } from '@/lib/auth-utils';
import {
    TimelineEventPayload,
    TimelineFilters,
    EVENT_CATEGORY,
    CATEGORY_EVENT_TYPES,
    EventType,
} from '@/lib/timeline-types';

/**
 * Infer the category from an event type.
 */
function inferCategory(eventType: EventType) {
    for (const [category, types] of Object.entries(CATEGORY_EVENT_TYPES)) {
        if (types.includes(eventType)) {
            return category as (typeof EVENT_CATEGORY)[keyof typeof EVENT_CATEGORY];
        }
    }
    return EVENT_CATEGORY.SYSTEM;
}

/**
 * Append a new event to the patient timeline.
 * Events are immutable and append-only.
 */
export async function createTimelineEvent(payload: TimelineEventPayload): Promise<any> {
    try {
        const user = await getServerUser();
        const db = await getTenantDb();

        const category = inferCategory(payload.eventType);

        const event = await db.patientTimelineEvent.create({
            data: {
                patientId: payload.patientId,
                eventType: payload.eventType,
                title: payload.title,
                description: payload.description,
                visitId: payload.visitId ?? null,
                encounterId: payload.encounterId ?? null,
                actorId: payload.actorId,
                actorName: payload.actorName,
                actorRole: payload.actorRole,
                occurredAt: payload.metadata?.occurredAt ? new Date(payload.metadata.occurredAt as string) : new Date(),
            },
        });

        revalidatePath(`/${process.env.NEXT_PUBLIC_TENANT_SLUG}/patient/${payload.patientId}`);

        return { success: true, event };
    } catch (error) {
        console.error('[Timeline] Failed to create event:', error);
        return { success: false, error: 'Failed to create timeline event' };
    }
}

/**
 * Fetch timeline events for a patient with optional filters.
 */
export async function getPatientTimeline(
    patientId: string,
    filters?: TimelineFilters
): Promise<any> {
    try {
        const db = await getTenantDb();

        const where: Record<string, unknown> = { patientId };

        // Category filter
        if (filters?.categories && filters.categories.length > 0) {
            const allowedTypes = filters.categories.flatMap(
                (cat) => CATEGORY_EVENT_TYPES[cat] ?? []
            );
            if (allowedTypes.length > 0) {
                where.eventType = { in: allowedTypes };
            }
        }

        // Event type filter
        if (filters?.eventTypes && filters.eventTypes.length > 0) {
            where.eventType = { in: filters.eventTypes };
        }

        // Visit filter
        if (filters?.visitId) {
            where.visitId = filters.visitId;
        }

        // Encounter filter
        if (filters?.encounterId) {
            where.encounterId = filters.encounterId;
        }

        // Date range
        if (filters?.dateFrom || filters?.dateTo) {
            const dateFilter: Record<string, Date> = {};
            if (filters.dateFrom) dateFilter.gte = filters.dateFrom;
            if (filters.dateTo) dateFilter.lte = filters.dateTo;
            where.occurredAt = dateFilter;
        }

        // Actor filter
        if (filters?.actorId) {
            where.actorId = filters.actorId;
        }

        const events = await db.patientTimelineEvent.findMany({
            where,
            orderBy: { occurredAt: 'desc' },
            take: filters?.searchQuery ? undefined : 200,
        });

        // Client-side search if needed
        let filtered = events;
        if (filters?.searchQuery) {
            const q = filters.searchQuery.toLowerCase();
            filtered = events.filter(
                (e) =>
                    e.title.toLowerCase().includes(q) ||
                    (e.description ?? '').toLowerCase().includes(q) ||
                    (e.actorName ?? '').toLowerCase().includes(q)
            );
        }

        // Group by date
        const groups = groupByDate(filtered);

        return { success: true, events: filtered, groups };
    } catch (error) {
        console.error('[Timeline] Failed to fetch events:', error);
        return { success: false, error: 'Failed to fetch timeline', events: [], groups: [] };
    }
}

/**
 * Group timeline events by date for display.
 */
function groupByDate(events: { occurredAt: Date }[]) {
    const groups: Record<string, { date: string; label: string; events: typeof events }> = {};

    for (const event of events) {
        const date = event.occurredAt.toISOString().split('T')[0];
        const today = new Date().toISOString().split('T')[0];
        const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];

        let label: string;
        if (date === today) label = 'Today';
        else if (date === yesterday) label = 'Yesterday';
        else label = event.occurredAt.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });

        if (!groups[date]) {
            groups[date] = { date, label, events: [] };
        }
        groups[date].events.push(event);
    }

    return Object.values(groups).sort((a, b) => b.date.localeCompare(a.date));
}

// ─── Convenience Event Creators ──────────────────────────────────────────

export async function recordConsultationEvent(data: {
    patientId: string;
    visitId?: string;
    encounterId: string;
    eventType: EventType;
    title: string;
    description: string;
    metadata?: Record<string, unknown>;
}): Promise<any> {
    const user = await getServerUser();
    return createTimelineEvent({
        ...data,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
    });
}

export async function recordPrescriptionEvent(data: {
    patientId: string;
    visitId?: string;
    encounterId?: string;
    eventType: EventType;
    title: string;
    description: string;
    prescriptionId?: string;
    metadata?: Record<string, unknown>;
}): Promise<any> {
    const user = await getServerUser();
    return createTimelineEvent({
        ...data,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        relatedResourceType: 'Prescription',
        relatedResourceId: data.prescriptionId,
    });
}

export async function recordLabEvent(data: {
    patientId: string;
    visitId?: string;
    encounterId?: string;
    eventType: EventType;
    title: string;
    description: string;
    labOrderId?: string;
    isCritical?: boolean;
    metadata?: Record<string, unknown>;
}): Promise<any> {
    const user = await getServerUser();
    return createTimelineEvent({
        ...data,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        relatedResourceType: 'LabOrder',
        relatedResourceId: data.labOrderId,
        isCritical: data.isCritical,
    });
}

export async function recordChatEvent(data: {
    patientId: string;
    encounterId: string;
    eventType: EventType;
    title: string;
    description: string;
    chatMessageId?: string;
    metadata?: Record<string, unknown>;
}): Promise<any> {
    const user = await getServerUser();
    return createTimelineEvent({
        ...data,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        relatedResourceType: 'EncounterChat',
        relatedResourceId: data.chatMessageId,
    });
}

export async function recordQueueEvent(data: {
    patientId: string;
    visitId?: string;
    encounterId: string;
    eventType: EventType;
    title: string;
    description: string;
    queueNumber?: string;
    metadata?: Record<string, unknown>;
}): Promise<any> {
    const user = await getServerUser();
    return createTimelineEvent({
        ...data,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        metadata: {
            ...data.metadata,
            queueNumber: data.queueNumber,
        },
    });
}

export async function recordVitalsEvent(data: {
    patientId: string;
    encounterId: string;
    eventType: EventType;
    title: string;
    description: string;
    vitalsId?: string;
    isCritical?: boolean;
    metadata?: Record<string, unknown>;
}): Promise<any> {
    const user = await getServerUser();
    return createTimelineEvent({
        ...data,
        actorId: user.id,
        actorName: user.name,
        actorRole: user.role,
        relatedResourceType: 'Vitals',
        relatedResourceId: data.vitalsId,
        isCritical: data.isCritical,
    });
}
