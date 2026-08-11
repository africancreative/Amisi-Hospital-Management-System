'use client';

import React, { useEffect, useState } from 'react';
import { 
    Activity,
    TrendingUp,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    Target,
    Loader2
} from 'lucide-react';

interface CRMAnalytics {
    kpis: {
        totalLeads: number;
        conversionRate: number;
        revenue: number;
        pipelineValue: number;
        wonLeads: number;
        lostLeads: number;
        openTasks: number;
    };
    leadsPerSource: { source: string; count: number }[];
    pipelineFunnel: { stage: string; count: number; width: number }[];
    recentLeads: { id: string; hospitalName: string; contactName: string; status: string }[];
    recentActivity: { id: string; type: string; leadName: string; notes: string; dueDate: string; agent: string }[];
}

const formatCurrency = (value: number) =>
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 1 }).format(value);

export function CRMAnalyticsView() {
    const [data, setData] = useState<CRMAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/crm/analytics')
            .then(res => res.json())
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    const kpis = data?.kpis;

    const stats = [
        { label: 'Total Deal Value', value: kpis ? formatCurrency(kpis.revenue) : '-', trend: kpis ? `${kpis.wonLeads} deals won` : '-', positive: true, icon: <TrendingUp className="w-5 h-5" /> },
        { label: 'Win Rate', value: kpis ? `${kpis.conversionRate}%` : '-', trend: kpis ? `${kpis.totalLeads} total leads` : '-', positive: true, icon: <Target className="w-5 h-5" /> },
        { label: 'Open Pipeline', value: kpis ? formatCurrency(kpis.pipelineValue) : '-', trend: kpis ? `${kpis.openTasks} pending tasks` : '-', positive: true, icon: <Activity className="w-5 h-5" /> },
        { label: 'Lost Deals', value: kpis ? String(kpis.lostLeads) : '-', trend: kpis ? `${kpis.wonLeads} won` : '-', positive: kpis ? kpis.wonLeads >= kpis.lostLeads : true, icon: <Users className="w-5 h-5" /> },
    ];

    const maxSourceCount = data?.leadsPerSource.length
        ? Math.max(...data.leadsPerSource.map(s => s.count))
        : 0;

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            <div className="flex items-center justify-between pb-8 border-b border-gray-800">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                        <Activity className="w-8 h-8 text-indigo-500" />
                        CRM Analytics
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Visualize pipeline performance, conversion rates, and agent efficiency.</p>
                </div>
                {loading && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                        Computing metrics...
                    </div>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4 text-gray-400">
                            <span className="text-xs font-black uppercase tracking-widest">{stat.label}</span>
                            {stat.icon}
                        </div>
                        <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                        <div className={`flex items-center gap-1 text-xs font-bold ${stat.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {stat.trend}
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Pipeline Funnel */}
                <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl">
                    <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        Pipeline Funnel
                    </h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                                <span className="text-xs font-bold uppercase tracking-widest">Loading Funnel...</span>
                            </div>
                        ) : !data?.pipelineFunnel?.length ? (
                            <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                                No pipeline data yet.
                            </div>
                        ) : data.pipelineFunnel.map((funnel, i) => (
                            <div key={i} className="relative">
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="font-bold text-gray-300">{funnel.stage}</span>
                                    <span className="text-gray-500">{funnel.count}</span>
                                </div>
                                <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                                    <div
                                        className={`h-full rounded-full ${['bg-blue-500', 'bg-indigo-500', 'bg-purple-500', 'bg-amber-500', 'bg-emerald-500', 'bg-rose-500'][i % 6]}`}
                                        style={{ width: `${Math.max(funnel.width, 4)}%` }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lead Sources */}
                <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl">
                    <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-indigo-500" />
                        Lead Sources
                    </h3>
                    <div className="flex h-64 items-end gap-4">
                        {loading ? (
                            <div className="flex-1 p-8 text-center text-gray-500">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                                <span className="text-xs font-bold uppercase tracking-widest">Loading Sources...</span>
                            </div>
                        ) : !data?.leadsPerSource?.length ? (
                            <div className="flex-1 p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                                No source data yet.
                            </div>
                        ) : data.leadsPerSource.map((bar, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group">
                                <span className="text-xs font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{bar.count}</span>
                                <div
                                    className="w-full bg-indigo-500/20 group-hover:bg-indigo-500 rounded-t-xl transition-all relative overflow-hidden"
                                    style={{ height: maxSourceCount > 0 ? `${Math.max((bar.count / maxSourceCount) * 100, 4)}%` : '4%' }}
                                >
                                    <div className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-indigo-600/50 to-transparent" />
                                </div>
                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 rotate-[-45deg] origin-top-left mt-2">{bar.source}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
