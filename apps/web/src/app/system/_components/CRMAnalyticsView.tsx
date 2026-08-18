'use client';

import React from 'react';
import { 
    Activity,
    TrendingUp,
    BarChart3,
    PieChart,
    ArrowUpRight,
    ArrowDownRight,
    Users,
    Target
} from 'lucide-react';

export function CRMAnalyticsView() {
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
                <div className="flex gap-4">
                    <select className="bg-gray-900 border border-gray-800 rounded-xl px-4 py-2 text-sm text-white font-bold focus:outline-none">
                        <option>Last 30 Days</option>
                        <option>This Quarter</option>
                        <option>This Year</option>
                        <option>All Time</option>
                    </select>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: 'Total Deal Value', value: '$2.4M', trend: '+14.5%', positive: true, icon: <TrendingUp className="w-5 h-5" /> },
                    { label: 'Win Rate', value: '24.8%', trend: '+2.1%', positive: true, icon: <Target className="w-5 h-5" /> },
                    { label: 'Avg Sales Cycle', value: '42 Days', trend: '-5 Days', positive: true, icon: <Activity className="w-5 h-5" /> },
                    { label: 'Lost Deals', value: '18', trend: '+3', positive: false, icon: <Users className="w-5 h-5" /> },
                ].map((stat, i) => (
                    <div key={i} className="bg-gray-900 border border-gray-800 p-6 rounded-2xl">
                        <div className="flex items-center justify-between mb-4 text-gray-400">
                            <span className="text-xs font-black uppercase tracking-widest">{stat.label}</span>
                            {stat.icon}
                        </div>
                        <p className="text-3xl font-bold text-white mb-2">{stat.value}</p>
                        <div className={`flex items-center gap-1 text-xs font-bold ${stat.positive ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {stat.positive ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                            {stat.trend} vs last period
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
                {/* Pipeline Funnel Mock */}
                <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl">
                    <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                        <BarChart3 className="w-5 h-5 text-indigo-500" />
                        Pipeline Funnel
                    </h3>
                    <div className="space-y-4">
                        {[
                            { stage: 'New Lead', count: 124, width: '100%', color: 'bg-blue-500' },
                            { stage: 'Qualified', count: 86, width: '70%', color: 'bg-indigo-500' },
                            { stage: 'Proposal Sent', count: 42, width: '40%', color: 'bg-purple-500' },
                            { stage: 'Negotiation', count: 18, width: '20%', color: 'bg-amber-500' },
                            { stage: 'Won', count: 8, width: '10%', color: 'bg-emerald-500' },
                        ].map((funnel, i) => (
                            <div key={i} className="relative">
                                <div className="flex items-center justify-between text-sm mb-1">
                                    <span className="font-bold text-gray-300">{funnel.stage}</span>
                                    <span className="text-gray-500">{funnel.count}</span>
                                </div>
                                <div className="w-full h-4 bg-gray-800 rounded-full overflow-hidden">
                                    <div 
                                        className={`h-full ${funnel.color} rounded-full`}
                                        style={{ width: funnel.width }}
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Lead Sources Mock */}
                <div className="bg-gray-900 border border-gray-800 p-8 rounded-3xl">
                    <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-2">
                        <PieChart className="w-5 h-5 text-indigo-500" />
                        Lead Sources
                    </h3>
                    <div className="flex h-64 items-end gap-4">
                        {[
                            { source: 'Website', height: '100%', value: '45%' },
                            { source: 'Referral', height: '60%', value: '25%' },
                            { source: 'LinkedIn', height: '40%', value: '15%' },
                            { source: 'Cold Email', height: '25%', value: '10%' },
                            { source: 'Events', height: '15%', value: '5%' },
                        ].map((bar, i) => (
                            <div key={i} className="flex-1 flex flex-col items-center justify-end gap-2 group">
                                <span className="text-xs font-bold text-gray-500 opacity-0 group-hover:opacity-100 transition-opacity">{bar.value}</span>
                                <div 
                                    className="w-full bg-indigo-500/20 group-hover:bg-indigo-500 rounded-t-xl transition-all relative overflow-hidden"
                                    style={{ height: bar.height }}
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
