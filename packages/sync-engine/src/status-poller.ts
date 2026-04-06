import { TenantClient } from '@amisi/database';

const tenantDb = new TenantClient();

/**
 * Status Poller Worker
 * Periodically synchronized the cloud suspension status with the local edge instance.
 */
export async function startStatusPoller(cloudBaseUrl: string, tenantId: string, intervalMs: number = 60000) {
    console.log(`[StatusPoller] Started for tenant ${tenantId}. Checking every ${intervalMs}ms...`);

    setInterval(async () => {
        try {
            const response = await fetch(`${cloudBaseUrl}/api/tenant/status?tenantId=${tenantId}`);
            if (!response.ok) {
                console.error(`[StatusPoller] Failed to fetch status: ${response.statusText}`);
                return;
            }

            const data = await response.json();
            const cloudStatus = data.status; // 'active', 'suspended', 'terminated'

            // Map cloud status to local SystemStatus
            const localStatus = cloudStatus === 'suspended' ? 'SUSPENDED' : 'ACTIVE';

            // Check current local status
            const settings = await tenantDb.hospitalSettings.findFirst();
            if (settings && settings.systemStatus !== localStatus) {
                await tenantDb.hospitalSettings.update({
                    where: { id: settings.id },
                    data: { systemStatus: localStatus as any }
                });
                console.log(`[StatusPoller] Local status UPDATED to: ${localStatus}`);
            }

        } catch (error) {
            console.error('[StatusPoller] Worker error:', error);
        }
    }, intervalMs);
}
