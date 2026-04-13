import { getControlDb, getTenantDb } from '@amisimedos/db';

const controlDb = getControlDb();

/**
 * Global Biometric Identification Service
 * 
 * Allows hospital branches to identify patients using biometric hashes (Fingerprint/Iris).
 * Coordinates with the Cloud Hub (Control DB) to resolve patient records across the network.
 */

interface BiometricMatch {
  tenantId: string;
  tenantName: string;
  patientId: string;
  firstName: string;
  lastName: string;
  mrn: string;
}

/**
 * Searches the entire Clinical Network for a matching biometric hash.
 */
export async function identifyPatientGlobally(biometricHash: string): Promise<BiometricMatch | null> {
  // 1. Check Global Biometric Index (Control Hub)
  // This avoids horizontal scanning across thousands of tenant shards
  const globalMatch = await controlDb.patientIndex.findUnique({
    where: { biometricHash }
  });

  if (!globalMatch) return null;

  // 2. Resolve Clinical Metadata from the specific Tenant Shard
  try {
    const tenantDb = await getTenantDb(globalMatch.tenantId);
    const patient = await tenantDb.patient.findUnique({
      where: { id: globalMatch.patientId },
      select: { firstName: true, lastName: true, mrn: true }
    });

    if (!patient) return null;

    // 3. Fetch Tenant name for UI context
    const tenant = await controlDb.tenant.findUnique({
      where: { id: globalMatch.tenantId },
      select: { name: true }
    });

    return {
      tenantId: globalMatch.tenantId,
      tenantName: tenant?.name || 'Unknown Branch',
      patientId: globalMatch.patientId,
      firstName: patient.firstName,
      lastName: patient.lastName,
      mrn: patient.mrn
    };
  } catch (err) {
    console.error(`[Biometric ID] Failed to resolve metadata for tenant ${globalMatch.tenantId}:`, err);
    return null;
  }
}

/**
 * Registers a patient as the "Primary Identity" for a biometric hash in the Global Hub.
 */
export async function registerGlobalIdentity(
  biometricHash: string, 
  biometricType: string, 
  tenantId: string, 
  patientId: string
) {
  return controlDb.patientIndex.upsert({
    where: { biometricHash },
    update: { tenantId, patientId, updatedAt: new Date() },
    create: { 
        biometricHash, 
        biometricType, 
        tenantId, 
        patientId, 
        timestamp: new Date() 
    }
  });
}
