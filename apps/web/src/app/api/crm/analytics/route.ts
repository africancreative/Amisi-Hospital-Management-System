import { NextResponse } from 'next/server';
import { getControlDb } from '@/lib/db';
import { PipelineStage } from '@amisimedos/db';

export async function GET() {
  try {
    const db = getControlDb();

    const totalLeads = await db.lead.count();

    const leadsPerSource = await db.lead.groupBy({
      by: ['source'],
      _count: { id: true },
    });

    const wonLeads = await db.lead.count({
      where: { status: PipelineStage.Won },
    });
    const conversionRate = totalLeads > 0 ? (wonLeads / totalLeads) * 100 : 0;

    const revenueAggregate = await db.lead.aggregate({
      where: { status: PipelineStage.Won },
      _sum: { potentialValue: true },
    });
    const revenue = revenueAggregate._sum?.potentialValue?.toNumber() || 0;

    const openStages = [
      PipelineStage.NewLead,
      PipelineStage.Qualified,
      PipelineStage.ProposalSent,
      PipelineStage.Negotiation,
    ];
    const pipelineAggregate = await db.lead.aggregate({
      where: { status: { in: openStages } },
      _sum: { potentialValue: true },
    });
    const pipelineValue = pipelineAggregate._sum?.potentialValue?.toNumber() || 0;

    const formatSource = (source: string) =>
      source.replace(/([A-Z])/g, ' $1').replace(/^./, c => c.toUpperCase()).trim();

    const formattedLeadsPerSource = leadsPerSource.map(item => ({
      source: formatSource(item.source),
      count: item._count.id,
    }));

    return NextResponse.json({
      kpis: {
        totalLeads,
        conversionRate: parseFloat(conversionRate.toFixed(2)),
        revenue,
        pipelineValue,
        wonLeads,
      },
      leadsPerSource: formattedLeadsPerSource,
    });
  } catch (error) {
    console.error('Analytics API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics data' },
      { status: 500 }
    );
  }
}
