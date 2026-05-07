'use server';

import { put } from '@vercel/blob';
import { ensureSuperAdmin } from '@/lib/auth-utils';
import { getControlDb } from '@/lib/db';
import { revalidatePath } from 'next/cache';

export async function uploadHeroImage(formData: FormData) {
  await ensureSuperAdmin();
  
  const file = formData.get('file') as File;
  if (!file) {
    throw new Error('No file provided');
  }

  // Ensure token is available
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
      throw new Error('Vercel Blob token is not configured');
  }

  try {
    const blob = await put(`hero-${Date.now()}-${file.name}`, file, {
      access: 'public',
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    // Update global settings
    const db = getControlDb();
    await db.globalSettings.upsert({
      where: { id: 'singleton' },
      update: { heroImageUrl: blob.url },
      create: { id: 'singleton', heroImageUrl: blob.url, platformName: 'AmisiMedOS', showHero: true }
    });

    revalidatePath('/');
    revalidatePath('/system/content');

    return { success: true, url: blob.url };
  } catch (error: any) {
    console.error('Failed to upload image:', error);
    return { success: false, error: error.message };
  }
}
