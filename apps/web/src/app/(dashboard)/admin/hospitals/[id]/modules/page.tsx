'use client';

import React, { useState, useEffect } from 'react';
import { trpc } from '@/trpc/client';
import { 
    Layers, 
    ArrowLeft, 
    Save, 
    ShieldCheck, 
    Zap,
    Building2,
    Search
} from 'lucide-react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';

/**
 * SaaS Admin: Hospital Module Entitlement Center
 */
export default function HospitalModules() {
    const params = useParams();
    const router = useRouter();
    const id = params.id as string;

    const { data: hospital, isLoading: isLoadingHospital } = trpc.system.getTenant.useQuery({ id });
    const { data: allModules, isLoading: isLoadingModules } = trpc.system.listAllModules.useQuery();
    const updateModules = trpc.system.updateTenantModules.useMutation({
        onSuccess: () => {
            router.push('/admin/hospitals');
        }
    });

    const [selectedIds, setSelectedIds] = useState<string[]>([]);

    useEffect(() => {
        if (hospital?.entitlements) {
            setSelectedIds(hospital.entitlements.map((e: typeof hospital.entitlements[number]) => e.moduleId));
        }
    }, [hospital]);

    const toggleModule = (moduleId: string) => {
        setSelectedIds(prev => 
            prev.includes(moduleId)
                ? prev.filter(mid => mid !== moduleId)
                : [...prev, moduleId]
        );
    };

    const handleSave = () => {
        updateModules.mutate({
            tenantId: id,
            moduleIds: selectedIds
        });
    };

    if (isLoadingHospital || isLoadingModules) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <div className="h-10 w-10 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin" />
            </div>
        );
    }

    return (
        <div className="p-8 max-w-5xl mx-auto">
            {/* Header Area */}
            <div className="mb-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <Link 
                        href="/admin/hospitals"
                        className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-widest mb-4"
                    >
                        <ArrowLeft size={14} />
                        Back to Hospitals
                    </Link>
                    <div className="flex items-center gap-4">
                        <div className="h-14 w-14 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center text-2xl font-black text-white shadow-2xl">
                            {hospital?.name.charAt(0)}
                        </div>
                        <div>
                            <h1 className="text-3xl font-bold text-white mb-1">{hospital?.name}</h1>
                            <p className="text-slate-500 font-mono text-xs uppercase tracking-wider">Module Entitlements • Platform Tier: {hospital?.tier}</p>
                        </div>
                    </div>
                </div>

                <button 
                    onClick={handleSave}
                    disabled={updateModules.isPending}
                    className="flex items-center gap-2 px-8 py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-emerald-600/20 active:scale-95 disabled:opacity-50"
                >
                    {updateModules.isPending ? 'Syncing...' : (
                        <>
                            <Save size={20} />
                            Save Entitlements
                        </>
                    )}
                </button>
            </div>

            {/* Platform Capabilities Guard */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="p-6 rounded-3xl bg-blue-600/5 border border-blue-500/10 backdrop-blur-sm">
                    <div className="p-3 bg-blue-500 text-white rounded-2xl w-fit mb-4 shadow-lg shadow-blue-500/20">
                        <Zap size={24} />
                    </div>
                    <h3 className="font-bold text-white mb-2">Instant Activation</h3>
                    <p className="text-xs text-slate-400">Modules selected here are immediately provisioned and accessible on the hospital node.</p>
                </div>

                <div className="p-6 rounded-3xl bg-emerald-600/5 border border-emerald-500/10 backdrop-blur-sm">
                    <div className="p-3 bg-emerald-500 text-white rounded-2xl w-fit mb-4 shadow-lg shadow-emerald-500/20">
                        <ShieldCheck size={24} />
                    </div>
                    <h3 className="font-bold text-white mb-2">Dynamic Guardhousing</h3>
                    <p className="text-xs text-slate-400">Permissions are automatically re-calculated for all hospital employees upon save.</p>
                </div>

                <div className="p-6 rounded-3xl bg-indigo-600/5 border border-indigo-500/10 backdrop-blur-sm">
                    <div className="p-3 bg-indigo-500 text-white rounded-2xl w-fit mb-4 shadow-lg shadow-indigo-500/20">
                        <Layers size={24} />
                    </div>
                    <h3 className="font-bold text-white mb-2">Monolithic Scale</h3>
                    <p className="text-xs text-slate-400">Unified billing and data residency remains consistent across all module expansions.</p>
                </div>
            </div>

            {/* Modules Grid */}
            <div className="bg-slate-900/50 rounded-[2.5rem] border border-slate-800 p-8">
                <div className="flex items-center justify-between mb-8 px-2">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <Building2 className="text-slate-500" size={20} />
                        Available Modules
                    </h2>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em]">
                        {selectedIds.length} / {allModules?.length} Enabled
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {allModules?.map((module) => {
                        const isEnabled = selectedIds.includes(module.id);
                        return (
                            <button 
                                key={module.id}
                                onClick={() => toggleModule(module.id)}
                                className={`group p-6 rounded-[2rem] border transition-all text-left flex items-center justify-between ${
                                    isEnabled 
                                        ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/5' 
                                        : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-2xl transition-all ${
                                        isEnabled ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-600 group-hover:text-slate-400'
                                    }`}>
                                        <Layers size={20} />
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="font-bold text-white group-hover:text-blue-400 transition-colors">{module.name}</span>
                                        <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{module.code}</span>
                                    </div>
                                </div>
                                <div className={`h-6 w-6 rounded-full border-2 flex items-center justify-center transition-all ${
                                    isEnabled ? 'bg-blue-600 border-blue-400' : 'border-slate-800'
                                }`}>
                                    {isEnabled && <ShieldCheck size={14} className="text-white" />}
                                </div>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
