import { NextApiRequest, NextApiResponse } from 'next';
import { syncEngine } from '../../lib/sync-engine';
import { Event } from '@amisi/core';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const tenantId = req.headers['x-tenant-context'] as string;

  if (req.method === 'POST') {
    const event: Event = req.body;
    try {
      const result = await syncEngine.reconcileEvent(event);
      return res.status(200).json(result);
    } catch (error) {
      return res.status(500).json({ error: 'Sync failed', details: error });
    }
  }

  if (req.method === 'GET') {
    const { since } = req.query;
    const updates = await syncEngine.fetchUpdatesSince(tenantId, since as string);
    return res.status(200).json(updates);
  }

  res.status(405).end();
}
