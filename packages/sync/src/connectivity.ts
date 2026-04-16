import axios from 'axios';

/**
 * Legacy connectivity check - prefer using connectivity-auto.ts
 * @deprecated Use connectivityManager.isOnline() / connectivityManager.isOffline()
 */
export async function isOffline(): Promise<boolean> {
    try {
        await axios.get('https://amisigenuine.com/api/health', { timeout: 2000 });
        return false;
    } catch {
        return true;
    }
}
