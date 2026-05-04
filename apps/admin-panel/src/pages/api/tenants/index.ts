import { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const { name, domain, modules } = req.body;
    
    try {
      const tenant = await prisma.tenant.create({
        data: {
          name,
          domain,
          enabledModules: {
            create: modules.map((m: string) => ({ name: m, enabled: true })),
          },
        },
        include: { enabledModules: true },
      });
      
      return res.status(201).json(tenant);
    } catch (error) {
      return res.status(400).json({ error: 'Tenant creation failed', details: error });
    }
  }

  if (req.method === 'GET') {
    const tenants = await prisma.tenant.findMany({
      include: { enabledModules: true },
    });
    return res.status(200).json(tenants);
  }

  if (req.method === 'PATCH') {
    const { tenantId, moduleName, enabled } = req.body;
    
    await prisma.module.updateMany({
      where: { tenantId, name: moduleName },
      data: { enabled },
    });
    
    return res.status(200).json({ success: true });
  }

  res.status(405).end();
}
