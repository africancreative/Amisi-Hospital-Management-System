'use server';

import { getTenantDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function getHospitalSettings() {
    const db = await getTenantDb();
    let settings = await db.hospitalSettings.findFirst();

    if (!settings) {
        // Initialize if not exists
        settings = await db.hospitalSettings.create({
            data: {
                hospitalName: 'Amisi General Hospital',
            }
        });
    }

    return settings;
}

export async function updateHospitalBranding(formData: FormData) {
    const db = await getTenantDb();
    const settings = await getHospitalSettings();

    await db.hospitalSettings.update({
        where: { id: settings.id },
        data: {
            hospitalName: formData.get('hospitalName') as string,
            detailedAddress: formData.get('detailedAddress') as string,
            taxId: formData.get('taxId') as string,
            marketingSlogan: formData.get('marketingSlogan') as string,
            contactEmail: formData.get('contactEmail') as string,
            phone: formData.get('phone') as string,
            logoUrl: formData.get('logoUrl') as string,
        }
    });

    revalidatePath('/');
    revalidatePath('/settings');
}
