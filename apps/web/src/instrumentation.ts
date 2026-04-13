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
  }
}
