'use client';

import { useState } from 'react';
import { Server, ShieldAlert, CheckCircle2, Box, Activity, DollarSign } from 'lucide-react';
import { createTenantWithModules } from '@/app/actions/system-actions';
import { useRouter } from 'next/navigation';

export default function OnboardingForm({ availableModules }: { availableModules: any[] }) {
    const router = useRouter();
    const [selectedModules, setSelectedModules] = useState<string[]>([]);
    const [status, setStatus] = useState<'idle' | 'deploying' | 'error' | 'success'>('idle');
    const [errorMessage, setErrorMessage] = useState('');

    const toggleModule = (id: string) => {
        if (selectedModules.includes(id)) {
            setSelectedModules(v => v.filter((val: any) => val !== id));
        } else {
            setSelectedModules(v => [...v, id]);
        }
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setStatus('deploying');
        setErrorMessage('');

        const formData = new FormData(e.currentTarget);
        const data = {
            name: formData.get('name') as string,
            slug: (formData.get('slug') as string).toLowerCase().replace(/[^a-z0-9]/g, '-'),
            region: formData.get('region') as string,
            tier: formData.get('tier') as 'CLINIC' | 'GENERAL' | 'RESEARCH',
            selectedModuleIds: selectedModules
        };

        try {
            await createTenantWithModules(data);
            setStatus('success');
            setTimeout(() => {
                router.push('/system/hospitals'); // Return to master list
            }, 3000);
        } catch (err: any) {
            setErrorMessage(err.message || 'Deployment failed');
            setStatus('error');
        }
    }

    if (status === 'success') {
        return (
            <div className="absolute inset-0 bg-[#0a0a0b] z-50 flex items-center justify-center">
                <div className="text-center space-y-6">
                    <CheckCircle2 className="h-20 w-20 text-green-400 mx-auto animate-pulse" />
                    <h2 className="text-3xl font-black italic">Provisioning Cluster</h2>
                    <p className="text-neutral-500">Database and routing mapping verified. Redirecting you to master panel...</p>
                </div>
            </div>
        );
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-12 pb-24">
            
            {/* Core Settings */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                    <Server className="h-5 w-5 text-blue-400" />
                    <h2 className="text-xl font-bold uppercase tracking-widest text-neutral-300">Cluster Identity</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-400">Hospital Formal Name</label>
                        <input required name="name" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all font-mono" placeholder="Mercy General" />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-400">URL Routing Slug (Unique)</label>
                        <input required name="slug" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all font-mono" placeholder="mercy-general" />
                        <p className="text-xs text-neutral-500">Access path: AmisiMedOS.com/mercy-general</p>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-400">Infrastructure Region</label>
                        <select required name="region" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all appearance-none">
                            <option value="us-east-1">US East (N. Virginia)</option>
                            <option value="eu-west-1">EU West (Ireland)</option>
                            <option value="af-south-1">AF South (Cape Town)</option>
                        </select>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-semibold text-neutral-400">Deployment Tier</label>
                        <select required name="tier" className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-all appearance-none">
                            <option value="CLINIC">Shared Edge Node (Clinic)</option>
                            <option value="GENERAL">Dedicated Postgres DB (General)</option>
                            <option value="RESEARCH">HIPAA Multi-Region Replicated (Research)</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Feature Modules */}
            <div className="bg-white/5 border border-white/10 rounded-3xl p-8">
                <div className="flex items-center gap-3 mb-8 border-b border-white/5 pb-4">
                    <Box className="h-5 w-5 text-amber-400" />
                    <h2 className="text-xl font-bold uppercase tracking-widest text-neutral-300">Software Entitlements</h2>
                </div>
                
                <p className="text-sm text-neutral-400 mb-6">Select which enterprise modules to mount to this silo's UI and Database engine.</p>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {availableModules.map((m: any) => {
                        const isSelected = selectedModules.includes(m.id);
                        return (
                            <div 
                                key={m.id}
                                onClick={() => toggleModule(m.id)}
                                className={`cursor-pointer border rounded-2xl p-5 transition-all flex flex-col items-start gap-4 ${isSelected ? 'bg-blue-600/10 border-blue-500/50 scale-[1.02]' : 'bg-black/40 border-white/10 hover:border-white/30'}`}
                            >
                                <div className="flex w-full items-center justify-between">
                                    <div className="h-10 w-10 bg-white/5 rounded-full flex items-center justify-center">
                                        {isSelected ? <CheckCircle2 className="h-5 w-5 text-blue-400" /> : <Activity className="h-5 w-5 text-neutral-500" />}
                                    </div>
                                    <span className="text-xs font-mono px-2 py-1 bg-white/10 rounded text-neutral-300">#{m.code}</span>
                                </div>
                                <div>
                                    <h3 className="font-bold">{m.name}</h3>
                                    <p className="text-xs text-neutral-500 mt-1 line-clamp-2">{m.description || 'Enterprise Module'}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Submit Block */}
            {status === 'error' && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-xl flex items-center gap-3">
                    <ShieldAlert className="h-5 w-5" /> {errorMessage}
                </div>
            )}

            <button 
                type="submit" 
                disabled={status === 'deploying'}
                className="w-full py-5 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-lg hover:from-blue-500 hover:to-indigo-500 transition-all shadow-2xl shadow-blue-600/30 disabled:opacity-50"
            >
                {status === 'deploying' ? 'Spinning up Cluster Infrastructure...' : 'Provision Medical Cluster'}
            </button>
        </form>
    );
}
