/**
 * Next.js Instrumentation
 * Used for server-side initialization of persistent services.
 */

export async function register() {
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // 1. Start AmisiMedOS LAN Discovery (Local Node Only)
    try {
      const { startDiscovery } = await import('./lib/discovery');
      startDiscovery();
    } catch (error) {
      console.error('[Instrumentation] Failed to start LAN Discovery:', error);
    }

    // 2. Start Sync Engine (Local Edge Node Only)
    const isEdgeNode = process.env.IS_EDGE_NODE === 'true' || process.env.NODE_ENV === 'development';
    const edgeTenantId = process.env.EDGE_TENANT_ID;

    if (isEdgeNode && edgeTenantId) {
      console.log(`[Instrumentation] Starting Sync Engine for Edge Node: ${edgeTenantId}`);
      try {
        const { getTenantDb } = await import('./lib/db');
        const { runSyncLoop } = await import('@amisimedos/sync');
        
        const edgeDb = await getTenantDb(edgeTenantId);
        
        // Fire and forget
        runSyncLoop(edgeTenantId, edgeDb).catch((err: any) => {
          console.error('[Instrumentation] Sync Engine Loop crashed:', err);
        });
      } catch (err) {
        console.error('[Instrumentation] Failed to initialize Sync Engine:', err);
      }
    }
  }
}
