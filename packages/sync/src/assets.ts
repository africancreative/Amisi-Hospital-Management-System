import fs from 'fs';
import path from 'path';
import axios from 'axios';
import { TenantClient } from '@amisimedos/db';

const STORAGE_ROOT = process.env.STORAGE_PATH || './storage/dicom';

/**
 * Asset Manager
 * 
 * Handles local caching of high-bandwidth clinical assets (DICOM, Scans).
 */
export class AssetManager {
    constructor() {
        if (!fs.existsSync(STORAGE_ROOT)) {
            fs.mkdirSync(STORAGE_ROOT, { recursive: true });
        }
    }

    /**
     * Ensures an asset is available locally on the Edge node.
     * If not found, it pulls from Cloud and caches it.
     */
    async ensureAssetLocally(instanceId: string, cloudUrl: string): Promise<string> {
        const localPath = path.join(STORAGE_ROOT, `${instanceId}.dcm`);

        if (fs.existsSync(localPath)) {
            return localPath;
        }

        console.log(`[Asset Manager] Cache miss for ${instanceId}. Fetching from Cloud...`);

        try {
            const response = await axios({
                method: 'GET',
                url: `${cloudUrl}/api/assets/dicom/${instanceId}`,
                responseType: 'stream'
            });

            const writer = fs.createWriteStream(localPath);
            response.data.pipe(writer);

            return new Promise((resolve, reject) => {
                writer.on('finish', () => resolve(localPath));
                writer.on('error', reject);
            });
        } catch (error: any) {
            console.error(`[Asset Manager] Failed to pull asset ${instanceId}:`, error.message);
            throw error;
        }
    }

    /**
     * Background Pre-fetch
     * Triggered when a new ImagingStudy is pulled to the Edge.
     */
    async prefetchStudy(studyId: string, instanceIds: string[], cloudUrl: string) {
        console.log(`[Asset Manager] Pre-fetching study ${studyId} (${instanceIds.length} instances)`);
        
        for (const id of instanceIds) {
            try {
                await this.ensureAssetLocally(id, cloudUrl);
            } catch (err) {
                // Continue with other instances if one fails
                continue;
            }
        }
    }
}

export const assetManager = new AssetManager();
