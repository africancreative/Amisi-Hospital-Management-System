'use server';

import { TenantClient } from '@amisimedos/db/client';
import { revalidatePath } from 'next/cache';
import { headers } from 'next/headers';

const tenantDb = new TenantClient();

export type Attachment = {
    id: string;
    type: string;
    url: string;
    fileName?: string | null;
    fileSize?: number | null;
};

export type ChatMessage = {
    id: string;
    content: string | null;
    patientId: string;
    authorId: string;
    authorName: string;
    authorRole: string;
    timestamp: Date;
    attachments: Attachment[];
};

export async function sendClinicalMessage(patientId: string, content: string, authorName: string, authorRole: string): Promise<any> {
    const headerList = await headers();
    const tenantId = headerList.get('x-resolved-tenant-id');

    if (!tenantId) throw new Error('Tenant ID not resolved');

    // In a real app, authorId would come from session/JWT
    const authorId = 'system-user-id';

    const message = await tenantDb.chatMessage.create({
        data: {
            content,
            patientId,
            authorId,
            authorName,
            authorRole,
        },
        include: { attachments: true }
    });

    revalidatePath(`/patients/${patientId}`);
    return message;
}

export async function sendClinicalMedia(patientId: string, authorName: string, authorRole: string, formData: FormData): Promise<any> {
    const headerList = await headers();
    const tenantId = headerList.get('x-resolved-tenant-id');

    if (!tenantId) throw new Error('Tenant ID not resolved');

    const content = formData.get('content') as string;
    const files = formData.getAll('files') as File[];
    const authorId = 'system-user-id';

    const message = await tenantDb.$transaction(async (tx) => {
        const msg = await tx.chatMessage.create({
            data: {
                content: content || null,
                patientId,
                authorId,
                authorName,
                authorRole,
            }
        });

        if (files && files.length > 0) {
            for (const file of files) {
                const mockUrl = `/api/storage/mock/${file.name}`;
                await tx.attachment.create({
                    data: {
                        messageId: msg.id,
                        type: file.type.startsWith('image/') ? 'image' :
                            file.type.startsWith('audio/') ? 'voice' : 'document',
                        url: mockUrl,
                        fileName: file.name,
                        fileSize: file.size,
                    }
                });
            }
        }

        return await tx.chatMessage.findUnique({
            where: { id: msg.id },
            include: { attachments: true }
        });
    });

    revalidatePath(`/patients/${patientId}`);
    return message;
}

export async function getClinicalMessages(patientId: string): Promise<any> {
    const headerList = await headers();
    const tenantId = headerList.get('x-resolved-tenant-id');

    if (!tenantId) throw new Error('Tenant ID not resolved');

    const messages = await tenantDb.chatMessage.findMany({
        where: { patientId },
        include: { attachments: true },
        orderBy: { timestamp: 'asc' }
    });

    return messages;
}
