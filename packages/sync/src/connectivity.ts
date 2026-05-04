import axios from 'axios';

/**
 * Legacy connectivity check - prefer using connectivity-auto.ts
 * @deprecated Use connectivityManager.isOnline() / connectivityManager.isOffline()
 */
export async function isOffline(): Promise<boolean> {
    try {
        // In local development, the Cloud API might be on localhost:4000
        const cloudUrl = process.env.CLOUD_SYNC_URL || 'http://localhost:4000/api/sync';
        const healthUrl = cloudUrl.replace('/sync', '/health');
        
        await axios.get(healthUrl, { timeout: 2000 });
        return false;
    } catch {
        try {
            // Fallback to public health check if configured
            await axios.get('https://amisigenuine.com/api/health', { timeout: 2000 });
            return false;
        } catch {
            return true;
        }
    }
}
