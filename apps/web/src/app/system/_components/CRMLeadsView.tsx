'use client';

import React, { useEffect, useState } from 'react';
import { 
    Users, 
    Search,
    Filter,
    MoreVertical,
    Loader2
} from 'lucide-react';
import { getCRMLeads } from '@/app/actions/crm-actions';

export function CRMLeadsView() {
    const [leads, setLeads] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        getCRMLeads().then(data => {
            setLeads(data);
            setLoading(false);
        });
    }, []);

    const getStatusColor = (status: string) => {
        const colors: Record<string, string> = {
            'NewLead': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'Qualified': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            'ProposalSent': 'bg-amber-500/10 text-amber-400 border-amber-500/20',
            'Negotiation': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            'Won': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'Lost': 'bg-rose-500/10 text-rose-400 border-rose-500/20'
        };
        return colors[status] || 'bg-gray-500/10 text-gray-400 border-gray-500/20';
    };

    return (
        <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000 h-full flex flex-col">
            <div className="flex items-center justify-between pb-8 border-b border-gray-800 shrink-0">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
                        <Users className="w-8 h-8 text-indigo-500" />
                        Leads & Pipeline
                    </h1>
                    <p className="text-gray-400 mt-2 text-sm">Manage potential hospital clients and track deal progress.</p>
                </div>
                <div className="flex gap-4">
                    <div className="relative">
                        <Search className="w-4 h-4 text-gray-500 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input 
                            placeholder="Search leads..." 
                            className="bg-gray-900 border border-gray-800 rounded-xl py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500/50 w-64"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-4 py-2 bg-gray-900 border border-gray-800 hover:bg-gray-800 text-white rounded-xl text-sm font-bold transition-all">
                        <Filter className="w-4 h-4" />
                        Filters
                    </button>
                    <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-indigo-600/20">
                        + New Lead
                    </button>
                </div>
            </div>

            <div className="bg-gray-900 border border-gray-800 rounded-2xl flex-1 overflow-hidden flex flex-col">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-gray-800 bg-gray-900/50">
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Hospital Name</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Contact</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Pipeline Stage</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Potential Value</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest">Source</th>
                                <th className="p-4 text-xs font-black text-gray-500 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800">
                            {loading ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500">
                                        <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-indigo-500" />
                                        <span className="text-xs font-bold uppercase tracking-widest">Loading Leads Data...</span>
                                    </td>
                                </tr>
                            ) : leads.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="p-12 text-center text-gray-500 font-bold uppercase tracking-widest text-xs">
                                        No leads found in pipeline.
                                    </td>
                                </tr>
                            ) : leads.map(lead => (
                                <tr key={lead.id} className="hover:bg-gray-800/50 transition-colors group cursor-pointer">
                                    <td className="p-4">
                                        <p className="font-bold text-white group-hover:text-indigo-400 transition-colors">{lead.hospitalName}</p>
                                        <p className="text-xs text-gray-500 mt-1">{lead.facilityType}</p>
                                    </td>
                                    <td className="p-4">
                                        <p className="font-medium text-gray-300">{lead.contactName}</p>
                                        <p className="text-xs text-gray-500 mt-1">{lead.contactEmail}</p>
                                    </td>
                                    <td className="p-4">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${getStatusColor(lead.status)}`}>
                                            {lead.status.replace(/([A-Z])/g, ' $1').trim()}
                                        </span>
                                    </td>
                                    <td className="p-4 font-mono text-sm text-gray-300">
                                        {lead.potentialValue ? `$${Number(lead.potentialValue).toLocaleString()}` : '-'}
                                    </td>
                                    <td className="p-4">
                                        <span className="px-2 py-1 bg-gray-800 rounded text-xs text-gray-400 font-medium">
                                            {lead.source}
                                        </span>
                                    </td>
                                    <td className="p-4 text-right">
                                        <button className="p-2 hover:bg-gray-700 rounded-lg text-gray-400 hover:text-white transition-colors">
                                            <MoreVertical className="w-4 h-4" />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
