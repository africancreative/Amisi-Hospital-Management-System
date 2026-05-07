'use client';

import React, { useEffect, useState } from 'react';
import { 
    Users, 
    Activity, 
    TrendingUp, 
    PhoneCall, 
    MessageSquare, 
    Calendar,
    Target
} from 'lucide-react';

export function CRMDashboard({ feature }: { feature: string }) {
    if (feature === 'leads') {
        const CRMLeadsView = require('./CRMLeadsView').CRMLeadsView;
        return <CRMLeadsView />;
    }
    
    if (feature === 'automation') {
        const CRMAutomationsView = require('./CRMAutomationsView').CRMAutomationsView;
        return <CRMAutomationsView />;
    }
    
    if (feature === 'analytics') {
        const CRMAnalyticsView = require('./CRMAnalyticsView').CRMAnalyticsView;
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
            </div>
            
            {/* 3-COLUMN METRICS GRID */}
            <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Users className="w-24 h-24" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Total Active Leads</h3>
                    <p className="text-4xl font-bold text-white mb-2">124</p>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-emerald-400 font-medium">+12%</span>
                        <span className="text-gray-500">vs last month</span>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <Activity className="w-24 h-24" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Pipeline Conversion</h3>
                    <p className="text-4xl font-bold text-white mb-2">18.5%</p>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-emerald-400 font-medium">+2.1%</span>
                        <span className="text-gray-500">vs last month</span>
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col justify-center relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-4 opacity-10">
                        <TrendingUp className="w-24 h-24" />
                    </div>
                    <h3 className="text-gray-400 text-sm font-medium mb-1">Open Tasks</h3>
                    <p className="text-4xl font-bold text-white mb-2">42</p>
                    <div className="flex items-center gap-2 text-sm">
                        <span className="text-rose-400 font-medium">+5</span>
                        <span className="text-gray-500">needs attention</span>
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
                        {[
                            { name: 'City Central Hospital', contact: 'Dr. Sarah Jenkins', status: 'NewLead' },
                            { name: 'Westside Clinic', contact: 'Mark Thompson', status: 'Qualified' },
                            { name: 'Sunrise Pharmacy', contact: 'Emily Chen', status: 'ProposalSent' },
                            { name: 'Global Health Network', contact: 'Dr. Robert Cole', status: 'Negotiation' },
                        ].map((lead, i) => (
                            <div key={i} className="flex items-center justify-between p-4 rounded-lg bg-gray-800/50 hover:bg-gray-800 transition-colors">
                                <div>
                                    <p className="font-bold text-gray-200">{lead.name}</p>
                                    <p className="text-xs text-gray-400">{lead.contact}</p>
                                </div>
                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                    lead.status === 'NewLead' ? 'bg-blue-500/10 text-blue-400' :
                                    lead.status === 'Qualified' ? 'bg-indigo-500/10 text-indigo-400' :
                                    lead.status === 'ProposalSent' ? 'bg-amber-500/10 text-amber-400' :
                                    'bg-emerald-500/10 text-emerald-400'
                                }`}>
                                    {lead.status.replace(/([A-Z])/g, ' $1').trim()}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
                    <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                        <PhoneCall className="w-5 h-5 text-indigo-500" />
                        Recent Communications
                    </h3>
                    <div className="space-y-4">
                        {[
                            { type: 'CALL', desc: 'Outbound call to City Central', time: '10 mins ago', agent: 'Agent Smith' },
                            { type: 'EMAIL', desc: 'Proposal sent to Sunrise', time: '1 hour ago', agent: 'Agent Doe' },
                            { type: 'WHATSAPP', desc: 'Follow-up message sent', time: '3 hours ago', agent: 'Agent Smith' },
                            { type: 'MEETING', desc: 'Demo session completed', time: 'Yesterday', agent: 'Agent Johnson' },
                        ].map((log, i) => (
                            <div key={i} className="flex items-start gap-4 p-4 rounded-lg bg-gray-800/50">
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                                    log.type === 'CALL' ? 'bg-emerald-500/10 text-emerald-500' :
                                    log.type === 'EMAIL' ? 'bg-blue-500/10 text-blue-500' :
                                    log.type === 'WHATSAPP' ? 'bg-green-500/10 text-green-500' :
                                    'bg-purple-500/10 text-purple-500'
                                }`}>
                                    {log.type === 'CALL' ? <PhoneCall className="w-4 h-4" /> :
                                     log.type === 'EMAIL' ? <MessageSquare className="w-4 h-4" /> :
                                     log.type === 'WHATSAPP' ? <MessageSquare className="w-4 h-4" /> :
                                     <Calendar className="w-4 h-4" />}
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-gray-200">{log.desc}</p>
                                    <p className="text-xs text-gray-500 mt-1">{log.agent}</p>
                                </div>
                                <span className="text-[10px] text-gray-500 uppercase font-bold tracking-widest">{log.time}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
}
