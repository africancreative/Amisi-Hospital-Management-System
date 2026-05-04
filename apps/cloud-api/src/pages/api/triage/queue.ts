import type { NextApiRequest, NextApiResponse } from 'next';
import { syncEngine } from '../../../lib/sync-engine';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { tenantId } = req.query;
    
    // Mock response for triage queue
    const queue = [
      { id: '1', patientId: 'p1', severity: 1, status: 'WAITING', vitals: { bp: '140/90' } },
      { id: '2', patientId: 'p2', severity: 3, status: 'WAITING', vitals: { bp: '120/80' } },
    ];
    
    return res.status(200).json(queue);
  }
  
  res.setHeader('Allow', ['GET']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}
