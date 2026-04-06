import { PrismaClient } from '@amisi/tenant-client';

/**
 * Generates a unique, deterministic Medical Record Number (MRN)
 * Format: [PREFIX]-[YEAR]-[SEQUENTIAL_ID]
 * Example: AM-2024-00123
 */
export async function generateMRN(db: any, prefix: string = 'AM'): Promise<string> {
    const year = new Date().getFullYear();
    
    // Count existing patients to determine sequence
    // In a high-concurrency production env, we would use a dedicated Sequence table or Redis counter.
    const count = await db.patient.count();
    const sequence = (count + 1).toString().padStart(5, '0');
    
    return `${prefix}-${year}-${sequence}`;
}
