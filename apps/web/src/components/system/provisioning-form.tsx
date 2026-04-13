'use client';

import { useState } from 'react';
import { createTenant } from '../../app/actions/tenant-actions';
import { Button, Input, Card, CardContent, CardHeader, CardTitle, Label } from '@amisimedos/ui';
import { CheckCircle2, Loader2, Globe, Shield, Activity, ChevronRight, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

export function ProvisioningForm() {
    const [selectedModules, setSelectedModules] = useState<string[]>(['pmi', 'opd', 'billing']);
    const [isProvisioning, setIsProvisioning] = useState(false);
    const [status, setStatus] = useState<string[]>([]);
    const [error, setError] = useState<string | null>(null);

    const toggleModule = (code: string) => {
        setSelectedModules(prev => 
            prev.includes(code) ? prev.filter(m => m !== code) : [...prev, code]
        );
    };

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault();
        setIsProvisioning(true);
        setError(null);
        setStatus(['Initializing connection to Control Plane...']);

        const formData = new FormData(e.currentTarget);
        
        try {
            // Simulated progress steps for better UX
            setTimeout(() => setStatus(s => [...s, 'Creating isolated Neon Database...']), 1200);
            setTimeout(() => setStatus(s => [...s, 'Applying AmisiMedOS Tenant Schema...']), 2400);
            setTimeout(() => setStatus(s => [...s, 'Seeding clinical baseline (ER/Lab/Pharmacy)...']), 3600);
            setTimeout(() => setStatus(s => [...s, 'Finalizing security certificates...']), 4800);

            await createTenant(formData);
            
            setStatus(s => [...s, 'Provisioning successful! Redirecting...']);
            setTimeout(() => window.location.href = '/system/dashboard', 2000);
        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
            setIsProvisioning(false);
        }
    }

    if (isProvisioning) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-8 animate-in fade-in zoom-in duration-500">
                <div className="relative">
                    <div className="absolute inset-0 rounded-full bg-blue-500/20 blur-3xl animate-pulse" />
                    <Loader2 className="h-20 w-20 text-blue-500 animate-spin relative z-10" />
                </div>
                <div className="text-center space-y-2">
                    <h2 className="text-2xl font-black text-white uppercase italic tracking-widest">Deploying Cluster</h2>
                    <p className="text-neutral-500">Infrastructure orchestration in progress.</p>
                </div>
                <div className="w-full max-w-md bg-neutral-900/50 border border-white/5 rounded-2xl p-6 font-mono text-sm shadow-2xl">
                    {status.map((line, i) => (
                        <div key={i} className="flex items-center gap-3 text-emerald-400 mb-2 animate-in slide-in-from-left duration-300">
                            <span className="text-neutral-600">[{i+1}]</span>
                            <span>{line}</span>
                        </div>
                    ))}
                    <div className="w-full h-1 bg-neutral-800 rounded-full mt-6 overflow-hidden">
                        <div className="h-full bg-blue-500 animate-progress w-[75%]" />
                    </div>
                </div>
            </div>
        );
    }

    const availableModules = [
        { code: 'pmi', name: 'Patient Index', desc: 'Core demographic & MRN management', recommended: true },
        { code: 'opd', name: 'Outpatient (OPD)', desc: 'Consultations and triage flow', recommended: true },
        { code: 'billing', name: 'Revenue Cycle', desc: 'Enterprise invoicing & insurance', recommended: true },
        { code: 'pharmacy', name: 'PharmOS', desc: 'Inventory & medication dispensing', recommended: false },
        { code: 'lab', name: 'LIS (Laboratory)', desc: 'Specimen tracking & results', recommended: false },
        { code: 'hr', name: 'HR & Payroll', desc: 'Employee contracts & attendance', recommended: false },
    ];

    return (
        <form onSubmit={handleSubmit} className="space-y-8 max-w-3xl mx-auto pb-24">
            {error && (
                <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-500 flex items-center gap-3">
                    <AlertCircle className="h-5 w-5" />
                    <p className="font-bold uppercase tracking-widest text-[10px]">{error}</p>
                </div>
            )}

            {/* Hidden inputs for selected modules */}
            {selectedModules.map(m => (
                <input key={m} type="hidden" name={`module_${m}`} value="on" />
            ))}

            <Card className="bg-neutral-900/40 border-white/5 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="border-b border-white/5 p-8 bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                            <Globe className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-white italic truncate">Cluster Identity</CardTitle>
                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Infrastructure routing & naming</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-neutral-400 font-black uppercase tracking-wider text-[10px]">Hospital Formal Name</Label>
                            <Input name="name" required placeholder="e.g. Amisi Premier" className="bg-white/5 border-white/5 focus:border-blue-500/50 rounded-xl h-12 font-bold" />
                        </div>
                        <div className="space-y-2">
                            <Label className="text-neutral-400 font-black uppercase tracking-wider text-[10px]">URL Slug (Unique ID)</Label>
                            <Input name="slug" required placeholder="amisi-premier" className="bg-white/5 border-white/5 focus:border-blue-500/50 rounded-xl h-12 font-mono" />
                        </div>
                    </div>
                    <div className="grid grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <Label className="text-neutral-400 font-black uppercase tracking-wider text-[10px]">Cloud Region</Label>
                            <select name="region" className="w-full h-12 px-4 rounded-xl bg-neutral-900 border border-white/5 text-sm text-white focus:outline-none focus:border-blue-500/50 font-bold uppercase tracking-widest">
                                <option value="us-east-1">US East (N. Virginia)</option>
                                <option value="eu-central-1">Europe (Frankfurt)</option>
                                <option value="af-south-1">Africa (Cape Town)</option>
                            </select>
                        </div>
                        <div className="space-y-2">
                            <Label className="text-neutral-400 font-black uppercase tracking-wider text-[10px]">Deployment Tier</Label>
                            <select name="tier" className="w-full h-12 px-4 rounded-xl bg-neutral-900 border border-white/5 text-sm text-white focus:outline-none focus:border-blue-500/50 font-bold uppercase tracking-widest text-blue-500">
                                <option value="CLINIC">CLINIC (Shared Edge)</option>
                                <option value="GENERAL">GENERAL (Dedicated Node)</option>
                                <option value="RESEARCH">RESEARCH (High Availability)</option>
                            </select>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-neutral-900/40 border-white/5 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="border-b border-white/5 p-8 bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-400">
                            <Activity className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-white italic">Enterprise Modules</CardTitle>
                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Select clinical sub-systems to mount</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {availableModules.map((m) => {
                            const isSelected = selectedModules.includes(m.code);
                            return (
                                <div 
                                    key={m.code}
                                    onClick={() => toggleModule(m.code)}
                                    className={cn(
                                        "cursor-pointer p-4 rounded-2xl border transition-all flex flex-col gap-2 group relative overflow-hidden",
                                        isSelected 
                                            ? "bg-blue-600/10 border-blue-500 shadow-xl shadow-blue-600/5 translate-y-[-2px]" 
                                            : "bg-white/5 border-white/5 hover:border-white/20"
                                    )}
                                >
                                    {m.recommended && (
                                        <span className="absolute top-0 right-0 px-3 py-1 bg-blue-600 text-[8px] font-black uppercase tracking-widest rounded-bl-xl text-white">Recommended</span>
                                    )}
                                    <div className="flex items-center justify-between">
                                        <h3 className="font-black text-sm uppercase tracking-tight text-white">{m.name}</h3>
                                        <div className={cn("h-4 w-4 rounded-full border flex items-center justify-center transition-all", isSelected ? "bg-blue-600 border-blue-600" : "border-neutral-700")}>
                                            {isSelected && <CheckCircle2 className="h-3 w-3 text-white" />}
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-neutral-500 font-bold leading-relaxed">{m.desc}</p>
                                </div>
                            );
                        })}
                    </div>
                </CardContent>
            </Card>

            <Card className="bg-neutral-900/40 border-white/5 backdrop-blur-xl rounded-3xl overflow-hidden shadow-2xl">
                <CardHeader className="border-b border-white/5 p-8 bg-white/5">
                    <div className="flex items-center gap-4">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-400">
                            <Shield className="h-6 w-6" />
                        </div>
                        <div>
                            <CardTitle className="text-2xl font-black text-white italic">Clinical Supervisor</CardTitle>
                            <p className="text-neutral-500 text-xs font-bold uppercase tracking-widest">Credentials for the first hospital admin</p>
                        </div>
                    </div>
                </CardHeader>
                <CardContent className="p-8 space-y-6">
                    <div className="space-y-4">
                        <div className="space-y-2">
                            <Label className="text-neutral-400 font-black uppercase tracking-wider text-[10px]">Admin Full Name</Label>
                            <Input name="adminName" required placeholder="Dr. John Doe" className="bg-white/5 border-white/5 focus:border-blue-500/50 rounded-xl h-12 font-bold" />
                        </div>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-neutral-400 font-black uppercase tracking-wider text-[10px]">Admin Email</Label>
                                <Input name="adminEmail" type="email" required placeholder="admin@hospital.com" className="bg-white/5 border-white/5 focus:border-blue-500/50 rounded-xl h-12 font-mono" />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-neutral-400 font-black uppercase tracking-wider text-[10px]">Temporary Password</Label>
                                <Input name="adminPassword" type="password" required placeholder="••••••••" className="bg-white/5 border-white/5 focus:border-blue-500/50 rounded-xl h-12" />
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end pt-8">
                <Button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-12 py-8 rounded-3xl font-black text-xl shadow-2xl shadow-blue-500/30 group transition-all uppercase italic tracking-tighter active:scale-95">
                    <span>Provision Cluster</span>
                    <ChevronRight className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform" />
                </Button>
            </div>
        </form>
    );
}
