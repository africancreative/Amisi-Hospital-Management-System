/**
 * Conflict Resolution Logic: AmisiMedOS
 * Performs semantic Field-Level Merging (FLM) for clinical data.
 */

export interface SyncRecord {
  id: string;
  version: number;
  data: Record<string, any>;
  updatedByRole?: string;
  timestamp: Date;
}

/**
 * Resolves a conflict between two data records using a hybrid semantic approach.
 */
export function resolveSemanticConflict(
  local: SyncRecord,
  remote: SyncRecord
): Record<string, any> {
  // 1. If versions are identical, use the one with the higher role priority or later timestamp
  if (local.version === remote.version) {
    if (getRolePriority(local.updatedByRole) > getRolePriority(remote.updatedByRole)) {
      return local.data;
    }
    if (local.timestamp > remote.timestamp) {
      return local.data;
    }
    return remote.data;
  }

  // 2. Perform Field-Level Merge
  const mergedData = { ...remote.data };
  const localFields = Object.keys(local.data);

  for (const field of localFields) {
    const localValue = local.data[field];
    const remoteValue = remote.data[field];

    // If localValue is different from remoteValue, we have a field-level divergence
    if (JSON.stringify(localValue) !== JSON.stringify(remoteValue)) {
      // If the remote record doesn't have this field at all, keep local
      if (remoteValue === undefined) {
        mergedData[field] = localValue;
        continue;
      }

      // SAME-FIELD CONFLICT:
      // Special Logic: Array Merging for Clinical Lists (Allergies, Diagnoses, etc.)
      if (Array.isArray(localValue) && Array.isArray(remoteValue)) {
        // Semantic Merge: Union of both sets to ensure zero data loss in clinical lists
        const combined = Array.from(new Set([...localValue, ...remoteValue]));
        mergedData[field] = combined;
        continue;
      }

      // Both sides updated the same field. Use Role-Based Priority.
      if (getRolePriority(local.updatedByRole) > getRolePriority(remote.updatedByRole)) {
        mergedData[field] = localValue;
      }
      // Else: Keep remote as the authoritative 'Cloud' or more senior 'Role' update
    }
  }

  return mergedData;
}


/**
 * Returns a numerical priority for clinical roles.
 */
function getRolePriority(role?: string): number {
  const priorities: Record<string, number> = {
    'ADMIN': 10,
    'DOCTOR': 8,
    'SURGEON': 8,
    'SPECIALIST': 8,
    'PHARMACIST': 6,
    'NURSE': 4,
    'STAFF': 2,
    'USER': 1
  };
  return role ? (priorities[role] || 1) : 1;
}
