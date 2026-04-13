import { tenantProcedure, router } from '@/server/trpc/trpc';
import { z } from 'zod';

export const syncRouter = router({
  /**
   * getSyncHistory
   * Returns current node status and recent sync activity.
   */
  getSyncStatus: tenantProcedure
    .query(async ({ ctx }) => {
      const nodes = await ctx.db.syncNode.findMany({
        orderBy: { updatedAt: 'desc' }
      });

      const unsyncedCount = await ctx.db.eventJournal.count({
        where: { isSynced: false, direction: 'OUTGOING' }
      });

      return {
        nodes: nodes.map(n => ({
          id: n.id,
          name: n.nodeName,
          type: n.nodeType,
          status: n.status,
          version: n.version,
          lastHeartbeat: n.lastHeartbeat,
          isHealthy: n.status === 'HEALTHY' && 
                    (new Date().getTime() - n.lastHeartbeat.getTime() < 60000)
        })),
        queue: {
          unsyncedCount,
          isProcessing: unsyncedCount > 0
        }
      };
    }),

  /**
   * registerNode
   * Heartbeat registration for Edge or Mobile nodes.
   */
  heartbeat: tenantProcedure
    .input(z.object({
      nodeId: z.string(),
      nodeName: z.string(),
      version: z.string(),
      status: z.string().default('HEALTHY')
    }))
    .mutation(async ({ ctx, input }) => {
      return ctx.db.syncNode.upsert({
        where: { id: input.nodeId },
        update: {
          lastHeartbeat: new Date(),
          status: input.status,
          version: input.version
        },
        create: {
          id: input.nodeId,
          nodeName: input.nodeName,
          nodeType: 'MOBILE',
          version: input.version,
          status: input.status
        }
      });
    })
});
