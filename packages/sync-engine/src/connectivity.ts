import { TenantClient as PrismaClient } from '@amisi/database';
import axios from 'axios';

/**
 * Detects if the edge server is currently offline.
 */
export async function isOffline(): Promise<boolean> {
    try {
        // Ping a known Cloud endpoint (Amisi Dashboard)
        await axios.get('https://amisigenuine.com/api/health', { timeout: 2000 });
        return false;
    } catch {
        return true;
    }
}

/**
 * Logic to resolve conflicts between Edge and Cloud using Versioning.
 * Version-based conflict detection: Higher version wins.
 * 
 * If versions are equal, we could use 'Last Write Wins' based on updatedAt,
 * or throw for manual resolution.
 */
export function resolveConflict(edgeEntity: any, cloudEntity: any) {
    if (edgeEntity.version > cloudEntity.version) {
        return { winner: 'EDGE', data: edgeEntity };
    } else if (cloudEntity.version > edgeEntity.version) {
        return { winner: 'CLOUD', data: cloudEntity };
    } else {
        // Equal versions: Tie-break with timestamp
        return edgeEntity.updatedAt > cloudEntity.updatedAt
            ? { winner: 'EDGE', data: edgeEntity }
            : { winner: 'CLOUD', data: cloudEntity };
    }
}
