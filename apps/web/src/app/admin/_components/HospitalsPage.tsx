'use client';

import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import { 
    Building2, 
    Plus, 
    Search, 
    Filter, 
    MoreVertical, 
    Activity, 
    ShieldCheck, 
    AlertTriangle,
    CreditCard,
    Layers,
    ArrowUpRight,
    Power
} from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';

/**
 * SaaS Admin: Hospital Management Dashboard
 */
export default function HospitalsDashboard() {
    const [search, setSearch] = useState('');
    const { data: hospitals, isLoading, refetch } = trpc.system.listTenants.useQuery();
    const toggleStatus = trpc.system.toggleTenantStatus.useMutation({
        onSuccess: () => refetch()
    });

    const filteredHospitals = (hospitals as any[])?.filter((h: any) => 
        h.name.toLowerCase().includes(search.toLowerCase()) || 
        h.slug.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="p-8 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <div className="p-1.5 bg-blue-500/10 rounded-lg">
                            <Building2 className="text-blue-400" size={18} />
                        </div>
                        <span className="text-blue-400 text-xs font-bold uppercase tracking-widest">Platform Governance</span>
                    </div>
                    <h1 className="text-4xl font-bold text-white mb-2">Hospital Network</h1>
                    <p className="text-slate-400">Manage multi-tenant distribution, module entitlements, and connectivity status.</p>
                </div>

                <Link 
                    href="/admin/hospitals/onboard"
                    className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-600/20 active:scale-95"
                >
                    <Plus size={20} />
                    Onboard Hospital
                </Link>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
                {[
                    { label: 'Total Hospitals', value: hospitals?.length || 0, icon: Building2, color: 'text-blue-400' },
                    { label: 'Active Nodes', value: (hospitals as any[])?.filter((h: any) => h.status === 'active').length || 0, icon: ShieldCheck, color: 'text-emerald-400' },
                    { label: 'Suspended', value: (hospitals as any[])?.filter((h: any) => h.status === 'suspended').length || 0, icon: AlertTriangle, color: 'text-amber-400' },
                    { label: 'Total Revenue', value: '$128.4k', icon: CreditCard, color: 'text-indigo-400' },
                ].map((stat: any, i: any) => (
                    <div key={i} className="p-6 rounded-[2rem] bg-slate-900/40 border border-slate-800 backdrop-blur-sm group hover:border-slate-700 transition-all">
                        <div className="flex items-start justify-between mb-4">
                            <div className={`p-3 rounded-2xl bg-slate-800/50 ${stat.color}`}>
                                <stat.icon size={24} />
                            </div>
                            <div className="flex items-center gap-1 text-emerald-400 text-xs font-bold leading-none">
                                <ArrowUpRight size={14} />
                                +12%
                            </div>
                        </div>
                        <h3 className="text-3xl font-bold text-white mb-1 tracking-tight">{stat.value}</h3>
                        <p className="text-slate-500 text-xs font-medium uppercase tracking-wider">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Main Content Area */}
            <div className="bg-slate-950/50 rounded-[2.5rem] border border-slate-800 overflow-hidden shadow-2xl backdrop-blur-xl">
                {/* Table Controls */}
                <div className="px-8 py-6 border-b border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input 
                            type="text"
                            placeholder="Search by name or slug..."
                            className="w-full pl-12 pr-6 py-3 bg-slate-900/50 border border-slate-800 rounded-2xl text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    
                    <div className="flex items-center gap-3">
                        <button className="p-3 bg-slate-900/50 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                            <Filter size={20} />
                        </button>
                    </div>
                </div>

                {/* Hospitals Table */}
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-slate-900/20 border-b border-slate-800">
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Hospital Information</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Modules</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Deployment</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Status</th>
                                <th className="px-8 py-4 text-xs font-bold text-slate-500 uppercase tracking-widest">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/50">
                            {isLoading ? (
                                <tr>
                                    <td colSpan={5} className="px-8 py-20 text-center text-slate-500 animate-pulse">
                                        Synchronizing platform nodes...
                                    </td>
                                </tr>
                            ) : filteredHospitals?.map((hospital: any) => (
                                <tr key={hospital.id} className="group hover:bg-slate-800/10 transition-colors">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <div className="h-12 w-12 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700 flex items-center justify-center text-xl font-black text-white shadow-xl">
                                                {hospital.name.charAt(0)}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">{hospital.name}</span>
                                                <span className="text-xs text-slate-500 font-mono tracking-tight">{hospital.slug}.amisigenuine.com</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <div className="px-3 py-1 bg-slate-800/50 border border-slate-700 rounded-full text-[10px] font-bold text-slate-300 flex items-center gap-1.5 uppercase">
                                                <Layers size={12} className="text-blue-400" />
                                                {hospital._count.entitlements} Active
                                            </div>
                                            <Link 
                                                href={`/admin/hospitals/${hospital.id}/modules`}
                                                className="p-1 px-2 border border-slate-800 rounded-md text-[10px] text-slate-500 hover:text-white hover:border-slate-600 transition-all uppercase font-bold"
                                            >
                                                Configure
                                            </Link>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex flex-col">
                                            <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">{hospital.tier}</span>
                                            <span className="text-[10px] text-slate-500 uppercase">{hospital.region}</span>
                                        </div>
                                    </td>
                                    <td className="px-8 py-6">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                            hospital.status === 'active' 
                                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                                        }`}>
                                            {hospital.status}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-2">
                                            <button 
                                                onClick={() => toggleStatus.mutate({ 
                                                    id: hospital.id, 
                                                    status: hospital.status === 'active' ? 'suspended' : 'active' 
                                                })}
                                                disabled={toggleStatus.isPending}
                                                className={`p-2 rounded-xl transition-all ${
                                                    hospital.status === 'active'
                                                        ? 'bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white'
                                                        : 'bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500 hover:text-white'
                                                }`}
                                                title={hospital.status === 'active' ? 'Suspend Hospital' : 'Activate Hospital'}
                                            >
                                                <Power size={16} />
                                            </button>
                                            <button className="p-2 text-slate-500 hover:text-white transition-colors">
                                                <MoreVertical size={20} />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>

                {/* Footer/Pagination */}
                <div className="px-8 py-6 border-t border-slate-800 bg-slate-900/20 text-center">
                    <p className="text-xs text-slate-500">
                        Showing <span className="text-white font-bold">{filteredHospitals?.length || 0}</span> hospital instances deployed globally.
                    </p>
                </div>
            </div>
        </div>
    );
}
