'use client';

import React, { useState } from 'react';
import { trpc } from '@/trpc/client';
import { 
    Building2, 
    Globe, 
    Database, 
    Shield, 
    ChevronRight, 
    ChevronLeft, 
    CheckCircle2, 
    Rocket,
    AlertCircle,
    Info,
    Layers
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { DeploymentTier } from '@amisimedos/constants';

/**
 * SaaS Admin: Hospital Onboarding Center
 */
export default function OnboardHospital() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        name: '',
        slug: '',
        region: 'US-EAST-1',
        tier: DeploymentTier.CLINIC as DeploymentTier,
        dbUrl: '',
        selectedModuleIds: [] as string[]
    });

    const { data: modules } = trpc.system.listAllModules.useQuery();
    const onboard = trpc.system.onboardTenant.useMutation({
        onSuccess: () => {
            router.push('/admin/hospitals');
        }
    });

    const toggleModule = (id: string) => {
        setFormData(prev => ({
            ...prev,
            selectedModuleIds: prev.selectedModuleIds.includes(id) 
                ? prev.selectedModuleIds.filter(mid => mid !== id)
                : [...prev.selectedModuleIds, id]
        }));
    };

    const nextStep = () => setStep(s => s + 1);
    const prevStep = () => setStep(s => s - 1);

    const isSubmitting = onboard.isPending;

    return (
        <div className="min-h-screen bg-slate-950 p-8 flex items-center justify-center">
            <div className="w-full max-w-4xl">
                {/* Progress Bar */}
                <div className="mb-12 flex items-center justify-center gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className={`h-10 w-10 rounded-full flex items-center justify-center font-bold transition-all ${
                                step >= i ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-900 text-slate-600 border border-slate-800'
                            }`}>
                                {step > i ? <CheckCircle2 size={20} /> : i}
                            </div>
                            {i < 3 && <div className={`h-1 w-12 rounded-full ${step > i ? 'bg-blue-600' : 'bg-slate-800'}`} />}
                        </div>
                    ))}
                </div>

                {/* Form Container */}
                <div className="bg-slate-900/50 rounded-[3rem] border border-slate-800 p-10 backdrop-blur-xl shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 p-10 opacity-5">
                        <Rocket size={200} className="text-blue-500" />
                    </div>

                    {/* Step 1: Base Identity */}
                    {step === 1 && (
                        <div className="relative z-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">Hospital Identity</h1>
                                <p className="text-slate-400">Define the global fingerprint for the new platform node.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Legal Name</label>
                                    <div className="relative">
                                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input 
                                            type="text"
                                            placeholder="e.g. St. Jude Regional"
                                            className="w-full pl-12 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all"
                                            value={formData.name}
                                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Universal Slug</label>
                                    <div className="relative">
                                        <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                        <input 
                                            type="text"
                                            placeholder="e.g. st-jude"
                                            className="w-full pl-12 pr-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all font-mono"
                                            value={formData.slug}
                                            onChange={(e) => setFormData({...formData, slug: e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '')})}
                                        />
                                    </div>
                                    <p className="text-[10px] text-slate-600 ml-1 italic font-mono">Url: amisigenuine.com/{formData.slug || 'slug'}</p>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Cloud Region</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
                                        value={formData.region}
                                        onChange={(e) => setFormData({...formData, region: e.target.value})}
                                    >
                                        <option value="US-EAST-1">US East (N. Virginia)</option>
                                        <option value="EU-WEST-2">Europe (London)</option>
                                        <option value="AF-SOUTH-1">Africa (Cape Town)</option>
                                        <option value="AS-SOUTH-1">Asia (Mumbai)</option>
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest ml-1">Deployment Tier</label>
                                    <select 
                                        className="w-full px-6 py-4 bg-slate-950 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none appearance-none"
                                        value={formData.tier}
                                        onChange={(e) => setFormData({...formData, tier: e.target.value as DeploymentTier})}
                                    >
                                        <option value={DeploymentTier.CLINIC}>Clinical Tier (Small/Medium)</option>
                                        <option value={DeploymentTier.HOSPITAL}>Hospital Tier (Large/Enterprise)</option>
                                        <option value={DeploymentTier.NETWORK}>Network Tier (Regional)</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Resource Configuration */}
                    {step === 2 && (
                        <div className="relative z-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">Resource Strategy</h1>
                                <p className="text-slate-400">Configure data residency and infrastructure connectivity.</p>
                            </div>

                            <div className="space-y-6">
                                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Database className="text-blue-400" size={20} />
                                        <h3 className="font-bold text-white uppercase text-sm tracking-widest">PostgreSQL System of Record</h3>
                                    </div>
                                    <p className="text-sm text-slate-500 mb-6 font-medium">
                                        By default, AmisiMedOS auto-provisions a high-performance Neon DB cluster. 
                                        For isolated Enterprise VPCs, provide a custom connection string below.
                                    </p>
                                    <div className="space-y-4">
                                        <input 
                                            type="text"
                                            placeholder="Dynamic Auto-Provisioning (Default)"
                                            className="w-full px-6 py-4 bg-slate-900/50 border border-slate-800 rounded-2xl text-white focus:ring-2 focus:ring-blue-500/50 outline-none transition-all placeholder:text-slate-700 font-mono text-sm"
                                            value={formData.dbUrl}
                                            onChange={(e) => setFormData({...formData, dbUrl: e.target.value})}
                                        />
                                        <div className="flex items-center gap-2 p-3 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                                            <Info size={14} className="text-blue-400 shrink-0" />
                                            <span className="text-[10px] text-blue-300 font-medium">Leave empty to utilize the platform's standard Neon Cloud provisioning engine.</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-6 rounded-2xl bg-slate-950 border border-slate-800">
                                    <div className="flex items-center gap-3 mb-4">
                                        <Shield className="text-emerald-400" size={20} />
                                        <h3 className="font-bold text-white uppercase text-sm tracking-widest">Cryptography & Sovereignty</h3>
                                    </div>
                                    <div className="flex items-center justify-between text-sm">
                                        <span className="text-slate-400">AES-256-GCM Envelope Encryption</span>
                                        <span className="text-emerald-400 font-bold uppercase tracking-widest">Enforced</span>
                                    </div>
                                    <div className="mt-2 h-1 w-full bg-slate-900 rounded-full overflow-hidden">
                                        <div className="h-full w-full bg-emerald-500 animate-pulse" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 3: Module Entitlements */}
                    {step === 3 && (
                        <div className="relative z-10 animate-in fade-in slide-in-from-right-4 duration-500">
                            <div className="mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">Module Strategy</h1>
                                <p className="text-slate-400">Select the functional modules to be activated for this hospital.</p>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                {modules?.map((module) => (
                                    <button 
                                        key={module.id}
                                        onClick={() => toggleModule(module.id)}
                                        className={`group relative p-6 rounded-2xl border transition-all text-left ${
                                            formData.selectedModuleIds.includes(module.id)
                                                ? 'bg-blue-600/10 border-blue-500/50'
                                                : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                                        }`}
                                    >
                                        {formData.selectedModuleIds.includes(module.id) && (
                                            <div className="absolute top-2 right-2">
                                                <CheckCircle2 size={16} className="text-blue-400" />
                                            </div>
                                        )}
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className={`p-2 rounded-xl ${formData.selectedModuleIds.includes(module.id) ? 'bg-blue-500 text-white shadow-lg shadow-blue-600/20' : 'bg-slate-800 text-slate-500 group-hover:text-slate-300 transition-colors'}`}>
                                                <Layers size={18} />
                                            </div>
                                            <span className="font-bold text-sm text-white">{module.name}</span>
                                        </div>
                                        <p className="text-[10px] text-slate-500 font-medium uppercase tracking-widest">{module.code}</p>
                                    </button>
                                ))}
                            </div>
                            
                            {/* Summary Footer */}
                            <div className="mt-8 p-4 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between">
                                <div className="flex flex-col">
                                    <span className="text-[10px] text-slate-500 uppercase font-black">Total Selected</span>
                                    <span className="text-xl font-black text-white">{formData.selectedModuleIds.length} Modules</span>
                                </div>
                                <div className="flex items-center gap-1 p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl">
                                    <AlertCircle size={14} className="text-amber-500" />
                                    <span className="text-[10px] text-amber-500 font-bold">Estimated Cost: $450/mo</span>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation Buttons */}
                    <div className="mt-12 flex items-center justify-between pt-8 border-t border-slate-800/50 relative z-10">
                        <button 
                            onClick={step === 1 ? () => router.back() : prevStep}
                            className="flex items-center gap-2 px-8 py-4 text-slate-400 hover:text-white transition-colors font-bold uppercase tracking-widest text-xs"
                            disabled={isSubmitting}
                        >
                            <ChevronLeft size={18} />
                            {step === 1 ? 'Cancel' : 'Back'}
                        </button>

                        <button 
                            onClick={step === 3 ? () => onboard.mutate(formData) : nextStep}
                            disabled={isSubmitting || (step === 1 && (!formData.name || !formData.slug))}
                            className="group flex items-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-600/20 active:scale-95 disabled:opacity-50 disabled:grayscale"
                        >
                            {isSubmitting ? (
                                <>
                                    <div className="h-5 w-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    Provisioning...
                                </>
                            ) : (
                                <>
                                    {step === 3 ? 'Deploy Hospital' : 'Next Step'}
                                    <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </div>
                </div>

                {/* Infrastructure Note */}
                <div className="mt-6 flex items-center justify-center gap-3 text-slate-600">
                    <Shield size={16} />
                    <span className="text-[10px] uppercase font-bold tracking-[0.2em]">Amisi Sovereign Infrastructure Node • HIPAA Tier 4</span>
                </div>
            </div>

            <style jsx>{`
                .custom-scrollbar::-webkit-scrollbar {
                    width: 4px;
                }
                .custom-scrollbar::-webkit-scrollbar-track {
                    background: transparent;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb {
                    background: #1e293b;
                    border-radius: 10px;
                }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                    background: #334155;
                }
            `}</style>
        </div>
    );
}
