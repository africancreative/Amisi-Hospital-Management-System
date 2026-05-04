import { isOffline } from '@amisimedos/sync';

export async function fetchWithFallback(endpoint: string, options: RequestInit = {}): Promise<any> {
  const cloudUrl = process.env.NEXT_PUBLIC_CLOUD_URL || 'https://cloud.amisimedos.com';
  // Attempt to get the local node IP from localStorage (configured during setup)
  const localNodeIp = typeof window !== 'undefined' ? localStorage.getItem('localNodeIp') : null;

  try {
    // 1. Check if we're known to be offline before attempting cloud
    const currentlyOffline = await isOffline();
    
    if (!currentlyOffline) {
      // 2. Attempt Cloud Request
      const response = await fetch(`${cloudUrl}${endpoint}`, options);
      if (response.ok) {
        return response;
      }
    }
  } catch (error) {
    console.warn('[API Fallback] Cloud request failed, checking for local node...');
  }

  // 3. Fallback to Local Node
  if (localNodeIp) {
    try {
      const localResponse = await fetch(`http://${localNodeIp}:3000${endpoint}`, options);
      
      // If it's a mutation, we rely on the local node's sync engine to journal it
      return localResponse;
    } catch (error) {
      console.error('[API Fallback] Local node also unreachable.', error);
      throw new Error("Both Cloud and Local Node are unreachable.");
    }
  }

  throw new Error("Offline Mode: No Local Node IP configured and Cloud is unreachable.");
}
