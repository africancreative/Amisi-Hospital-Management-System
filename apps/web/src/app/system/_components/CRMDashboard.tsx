'use client';

import React, { useEffect, useState } from 'react';
import {
    Users,
    Activity,
    TrendingUp,
    PhoneCall,
    MessageSquare,
    Calendar,
    Target,
    Loader2
} from 'lucide-react';
import { CRMLeadsView } from './CRMLeadsView';
import { CRMAutomationsView } from './CRMAutomationsView';
import { CRMAnalyticsView } from './CRMAnalyticsView';

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
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

export function CRMDashboard({ feature }: { feature: string }) {
    if (feature === 'leads') {
        return <CRMLeadsView />;
    }
    
    if (feature === 'automation') {
        return <CRMAutomationsView />;
    }
    
    if (feature === 'analytics') {
        return <CRMAnalyticsView />;
    }

    if (feature !== 'dashboard') {
        return (
            <div className="p-12 text-center h-full flex flex-col items-center justify-center space-y-4 text-gray-400">
                <h1 className="text-3xl font-black text-white italic uppercase tracking-widest capitalize">CRM {feature.replace('-', ' ')}</h1>
                <p>This CRM module could not be loaded.</p>
            </div>
        );
    }

    return <DashboardContent />;
}

function DashboardContent() {
    const [data, setData] = useState<CRMAnalytics | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch('/api/crm/analytics')
            .then(res => res.json())
            .then(setData)
            .catch(() => setData(null))
            .finally(() => setLoading(false));
    }, []);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'NewLead': 'bg-blue-500/10 text-blue-400',
            'Qualified': 'bg-indigo-500/10 text-indigo-400',
            'ProposalSent': 'bg-amber-500/10 text-amber-400',
            'Negotiation': 'bg-purple-500/10 text-purple-400',
            'Won': 'bg-emerald-500/10 text-emerald-400',
            'Lost': 'bg-rose-500/10 text-rose-400'
        };
        return colors[status] || 'bg-gray-500/10 text-gray-400';
    };

    const getActivityIcon = (type: string) => {
        if (type === 'CALL') return <PhoneCall className="w-4 h-4" />;
        if (type === 'EMAIL') return <MessageSquare className="w-4 h-4" />;
        return <Calendar className="w-4 h-4" />;
    };

    const getActivityColor = (type: string) => {
        if (type === 'CALL') return 'bg-emerald-500/10 text-emerald-500';
        if (type === 'EMAIL') return 'bg-blue-500/10 text-blue-500';
        return 'bg-purple-500/10 text-purple-500';
    };

    const kpis = data?.kpis;
    const recentLeads = data?.recentLeads || [];
    const recentActivity = data?.recentActivity || [];

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* DASHBOARD HEADER */}
            <div className="flex items-center justify-between pb-8 border-b border-gray-800">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                        <Target className="w-8 h-8 text-indigo-500" />
                        CRM Hub
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Real-time overview of leads, agents, and pipeline automation.</p>
                </div>
                {loading && (
                    <div className="flex items-center gap-2 text-gray-500 text-sm">
                        <Loader2 className="w-4 h-4 animate-spin text-indigo-500" />
                        Syncing pipeline...
                    </div>
                )}
            </div>
            
            {/* 3-COLUMN METRICS GRID */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Users className="w-24 h-24" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Total Active Leads</h3>
                    <p className="text-4xl font-bold text-white mb-2">{kpis ? kpis.totalLeads : '-'}</p>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-emerald-400 font-medium">{kpis ? `${kpis.wonLeads} won` : '—'}</span>
                        <span className="text-gray-500">in pipeline</span>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Activity className="w-24 h-24" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Pipeline Conversion</h3>
                    <p className="text-4xl font-bold text-white mb-2">{kpis ? `${kpis.conversionRate}%` : '-'}</p>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-emerald-400 font-medium">{kpis ? formatCurrency(kpis.pipelineValue) : '—'}</span>
                        <span className="text-gray-500">pipeline value</span>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-24 h-24" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Open Tasks</h3>
                    <p className="text-4xl font-bold text-white mb-2">{kpis ? kpis.openTasks : '-'}</p>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-emerald-400 font-medium">{kpis ? formatCurrency(kpis.revenue) : '—'}</span>
                        <span className="text-gray-500">won revenue</span>
                    </div>
                </div>
            </section>

            {/* PIPELINE & RECENT LEADS */}
            <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <Users className="w-5 h-5 text-indigo-500" />
                        Recent Leads
                    </h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                                <span className="text-xs font-bold uppercase tracking-widest">Loading Leads...</span>
                            </div>
                        ) : recentLeads.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                                No leads yet. They will appear here as they come in.
                            </div>
                        ) : recentLeads.map(lead => (
                            <div key={lead.id} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                                <div>
                                    <p className="font-bold text-gray-200">{lead.hospitalName}</p>
                                    <p className="text-xs text-gray-400">{lead.contactName}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${getStatusColor(lead.status)}`}>
                                    {lead.status.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PhoneCall className="w-5 h-5 text-indigo-500" />
                        Recent Activity
                    </h3>
                    <div className="space-y-4">
                        {loading ? (
                            <div className="p-8 text-center text-gray-500">
                                <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                                <span className="text-xs font-bold uppercase tracking-widest">Loading Activity...</span>
                            </div>
                        ) : recentActivity.length === 0 ? (
                            <div className="p-8 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                                No tasks scheduled yet. Automation will populate this queue.
                            </div>
                        ) : recentActivity.map(log => (
                            <div key={log.id} className="flex items-start gap-4 p-4 rounded-lg bg-gray-800/50">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${getActivityColor(log.type)}`}>
                                    {getActivityIcon(log.type)}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-200">{log.leadName}</p>
                                    <p className="text-xs text-gray-500 mt-1">{log.agent}</p>
                                </div>
                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{log.type}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
