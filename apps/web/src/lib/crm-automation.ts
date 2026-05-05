import { getControlDb } from '@/lib/db';
import { PipelineStage, FacilityType, TaskType } from '@amisimedos/db';

interface AutomationRule {
  id: string;
  name: string;
  condition: (lead: any) => boolean;
  action: (lead: any, db: any) => Promise<void>;
}

/**
 * Auto-assign leads to agents based on workload balancing
 */
export async function autoAssignLead(leadId: string): Promise<string | null> {
  const db = getControlDb();
  
  // Get all active agents with their current lead counts
  const agents = await db.systemUser.findMany({
    where: { role: 'agent' },
    include: {
      _count: {
        select: { leads: true }
      }
    }
  });

  if (agents.length === 0) return null;

  // Find agent with least leads (workload balancing)
  const leastLoadedAgent = agents.reduce((prev, current) => 
    (prev._count.leads < current._count.leads) ? prev : current
  );

  // Assign lead to this agent
  await db.lead.update({
    where: { id: leadId },
    data: { assignedAgentId: leastLoadedAgent.id }
  });

  return leastLoadedAgent.id;
}

/**
 * Auto-create follow-up tasks based on lead status and time elapsed
 */
export async function createAutoFollowUp(leadId: string): Promise<void> {
  const db = getControlDb();
  const lead = await db.lead.findUnique({ where: { id: leadId } });
  
  if (!lead || lead.status === 'Won' || lead.status === 'Lost') return;

  // Check if there's already a pending task for this lead
  const existingTask = await db.task.findFirst({
    where: { 
      leadId, 
      status: 'PENDING',
      dueDate: { gte: new Date() }
    }
  });

  if (existingTask) return; // Don't create duplicate follow-ups

  // Calculate due date based on pipeline stage
  const now = new Date();
  let dueDate: Date;
  let taskType: TaskType;
  let notes: string;

  switch (lead.status) {
    case 'NewLead':
      dueDate = new Date(now.getTime() + 24 * 60 * 60 * 1000); // 1 day
      taskType = 'CALL';
      notes = 'New lead - initial contact required';
      break;
    case 'Qualified':
      dueDate = new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000); // 3 days
      taskType = 'EMAIL';
      notes = 'Send detailed information package';
      break;
    case 'ProposalSent':
      dueDate = new Date(now.getTime() + 2 * 24 * 60 * 60 * 1000); // 2 days
      taskType = 'CALL';
      notes = 'Follow up on proposal - address questions';
      break;
    case 'Negotiation':
      dueDate = new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000); // 1 day
      taskType = 'CALL';
      notes = 'Active negotiation - maintain momentum';
      break;
    default:
      return; // No follow-up for other stages
  }

  await db.task.create({
    data: {
      leadId,
      type: taskType,
      dueDate,
      status: 'PENDING',
      notes,
      assignedToId: lead.assignedAgentId,
    }
  });
}

/**
 * Suggest modules based on facility type with detailed reasoning
 */
export function suggestModulesForFacility(facilityType: FacilityType): { module: string; reason: string }[] {
  const suggestions: Record<string, { module: string; reason: string }[]> = {
    [FacilityType.CLINIC]: [
      { module: 'EMR', reason: 'Core patient records management for daily clinic operations' },
      { module: 'Billing', reason: 'Essential for processing patient payments and insurance' },
      { module: 'Inventory', reason: 'Track medical supplies and medication stock' },
    ],
    [FacilityType.HOSPITAL]: [
      { module: 'EMR', reason: 'Comprehensive patient records across departments' },
      { module: 'Pharmacy', reason: 'Manage in-house pharmacy and drug dispensing' },
      { module: 'Lab', reason: 'Laboratory test ordering and results management' },
      { module: 'Billing', reason: 'Complex billing for multi-department services' },
      { module: 'Inventory', reason: 'Track equipment, supplies, and medications' },
    ],
    [FacilityType.PHARMACY]: [
      { module: 'Pharmacy', reason: 'Core dispensing, drug interactions, and inventory' },
      { module: 'Inventory', reason: 'Track drug stock, expiry dates, and reorders' },
      { module: 'Billing', reason: 'Process prescriptions and insurance claims' },
    ],
    [FacilityType.LAB]: [
      { module: 'Lab', reason: 'Test catalog, sample tracking, and results reporting' },
      { module: 'Billing', reason: 'Bill for laboratory tests and services' },
      { module: 'Inventory', reason: 'Track reagents, consumables, and equipment' },
    ],
    [FacilityType.SPECIALIST]: [
      { module: 'EMR', reason: 'Specialized patient records for your practice' },
      { module: 'Billing', reason: 'Handle referrals and specialist billing' },
      { module: 'Inventory', reason: 'Track specialized equipment and supplies' },
    ],
  };

  return suggestions[facilityType as string] || [
    { module: 'EMR', reason: 'Core patient record management' },
    { module: 'Billing', reason: 'Essential billing functionality' },
  ];
}

/**
 * Apply automation rules when lead is created or updated
 */
export async function applyAutomationRules(leadId: string, event: 'create' | 'update'): Promise<void> {
  const db = getControlDb();
  const lead = await db.lead.findUnique({ 
    where: { id: leadId },
    include: { assignedAgent: true }
  });

  if (!lead) return;

  // Rule 1: Auto-assign new leads
  if (event === 'create' && !lead.assignedAgentId) {
    await autoAssignLead(leadId);
  }

  // Rule 2: Auto-create follow-up tasks
  await createAutoFollowUp(leadId);

  // Rule 3: Suggest modules for new leads with facility type
  if (event === 'create' && lead.facilityType && !lead.customConfig) {
    const suggestions = suggestModulesForFacility(lead.facilityType as FacilityType);
    const suggestedModules = suggestions.map(s => s.module);
    const moduleReasons = Object.fromEntries(suggestions.map(s => [s.module, s.reason]));

    await db.lead.update({
      where: { id: leadId },
      data: {
        customConfig: JSON.stringify({
          modules: suggestedModules,
          moduleReasons,
          numberOfUsers: lead.facilityType === FacilityType.HOSPITAL ? 50 : 10,
          devices: lead.facilityType === FacilityType.HOSPITAL ? 20 : 5,
          deploymentType: 'cloud',
          suggestedByAutomation: true,
        })
      }
    });
  }
}

/**
 * Run daily automation (to be called by cron job)
 */
export async function runDailyAutomation(): Promise<{ processed: number; tasksCreated: number }> {
  const db = getControlDb();
  let tasksCreated = 0;

  // Get all active leads (not Won or Lost)
  const activeLeads = await db.lead.findMany({
    where: {
      status: {
        in: ['NewLead', 'Qualified', 'ProposalSent', 'Negotiation']
      }
    }
  });

  for (const lead of activeLeads) {
    const beforeCount = await db.task.count({ where: { leadId: lead.id, status: 'PENDING' } });
    await createAutoFollowUp(lead.id);
    const afterCount = await db.task.count({ where: { leadId: lead.id, status: 'PENDING' } });
    
    if (afterCount > beforeCount) tasksCreated++;
  }

  return { processed: activeLeads.length, tasksCreated };
}
