'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, Network, CheckCircle2, ChevronRight, Loader2, Database } from 'lucide-react';

export default function SetupWizard() {
    const router = useRouter();
    const [step, setStep] = useState(1);
    const [hospitalId, setHospitalId] = useState('');
    const [dbName, setDbName] = useState('amisi_edge');
    const [dbPassword, setDbPassword] = useState('');
    const [isValidating, setIsValidating] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [hospitalName, setHospitalName] = useState<string | null>(null);

    const validateHospital = async () => {
        if (!hospitalId.trim()) {
            setError('Hospital ID is required.');
            return;
        }
        setIsValidating(true);
        setError(null);
        try {
            const res = await fetch(`/api/tenant/license?slug=${hospitalId.trim()}`);
            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to validate hospital');
            }
            const data = await res.json();
            if (data.status !== 'active') throw new Error('Hospital is suspended.');
            setHospitalName(data.name);
            setStep(2);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsValidating(false);
        }
    };

    const completeSetup = async () => {
        if (!dbName.trim() || !dbPassword.trim()) {
            setError('Database credentials are required.');
            return;
        }
        setIsValidating(true);
        setError(null);
        try {
            // Send config to the local edge node API
            const res = await fetch('http://localhost:8080/api/setup', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    tenantId: hospitalId.trim(), // In a real flow, the UUID might be fetched, using slug here assuming local node resolves it
                    slug: hospitalId.trim(),
                    dbName: dbName.trim(),
                    dbPassword: dbPassword.trim()
                })
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || 'Failed to configure local node');
            }

            // Successfully written to ~/.amisimedos/config.json
            // We can now navigate to the login page
            router.push(`/${hospitalId.trim()}/login`);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setIsValidating(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-6 text-white font-sans">
            <div className="w-full max-w-lg">
                <div className="flex flex-col items-center mb-8">
                    <img src="/logo.png" alt="AmisiMedOS" className="h-16 mb-4 opacity-90" />
                    <h1 className="text-2xl font-black tracking-wider">LOCAL NODE SETUP</h1>
                </div>

                <div className="bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl rounded-3xl p-8 shadow-2xl">
                    {/* Stepper */}
                    <div className="flex items-center justify-center space-x-4 mb-8">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 1 ? 'bg-blue-600' : 'bg-white/10'}`}>1</div>
                        <div className={`w-12 h-1 bg-white/10 rounded-full overflow-hidden`}>
                            <div className={`h-full bg-blue-600 transition-all ${step >= 2 ? 'w-full' : 'w-0'}`} />
                        </div>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${step >= 2 ? 'bg-blue-600' : 'bg-white/10'}`}>2</div>
                    </div>

                    {error && (
                        <div className="mb-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-400 text-sm font-medium flex items-start gap-3">
                            <span className="mt-0.5 shrink-0">⚠️</span>
                            <span>{error}</span>
                        </div>
                    )}

                    {step === 1 ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4">
                            <div>
                                <h2 className="text-lg font-bold mb-1">Verify Hospital</h2>
                                <p className="text-sm text-neutral-400">Enter your provided Hospital ID (Slug) to link this node to your cloud control plane.</p>
                            </div>
                            
                            <div className="space-y-2">
                                <label className="text-xs font-black tracking-widest text-neutral-500">HOSPITAL ID</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <Building2 className="h-5 w-5 text-blue-500" />
                                    </div>
                                    <input 
                                        type="text" 
                                        value={hospitalId}
                                        onChange={(e) => setHospitalId(e.target.value)}
                                        className="w-full bg-black/40 border border-white/10 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-white/20 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
                                        placeholder="e.g. amisi-demo"
                                        onKeyDown={(e) => e.key === 'Enter' && validateHospital()}
                                    />
                                </div>
                            </div>

                            <button 
                                onClick={validateHospital}
                                disabled={isValidating}
                                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                            >
                                {isValidating ? <Loader2 className="h-5 w-5 animate-spin" /> : (
                                    <>CONTINUE <ChevronRight className="h-4 w-4" /></>
                                )}
                            </button>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                            <div className="flex items-center gap-3 p-4 bg-emerald-500/10 border border-emerald-500/20 rounded-xl text-emerald-400 mb-6">
                                <CheckCircle2 className="h-5 w-5" />
                                <span className="font-bold">{hospitalName}</span> verified.
                            </div>

                            <div>
                                <h2 className="text-lg font-bold mb-1">Local Edge Database</h2>
                                <p className="text-sm text-neutral-400">Provide the credentials for the local PostgreSQL instance that will run on this node.</p>
                            </div>

                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <label className="text-xs font-black tracking-widest text-neutral-500">DATABASE NAME</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Database className="h-4 w-4 text-neutral-400" />
                                        </div>
                                        <input 
                                            type="text" 
                                            value={dbName}
                                            onChange={(e) => setDbName(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500"
                                            placeholder="amisi_edge"
                                        />
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-xs font-black tracking-widest text-neutral-500">DATABASE PASSWORD</label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <Network className="h-4 w-4 text-neutral-400" />
                                        </div>
                                        <input 
                                            type="password" 
                                            value={dbPassword}
                                            onChange={(e) => setDbPassword(e.target.value)}
                                            className="w-full bg-black/40 border border-white/10 rounded-xl py-3 pl-11 pr-4 text-white focus:outline-none focus:border-blue-500"
                                            placeholder="••••••••"
                                            onKeyDown={(e) => e.key === 'Enter' && completeSetup()}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3 pt-2">
                                <button 
                                    onClick={() => setStep(1)}
                                    className="px-6 py-3.5 rounded-xl border border-white/10 hover:bg-white/5 font-bold text-neutral-300 transition-all"
                                >
                                    BACK
                                </button>
                                <button 
                                    onClick={completeSetup}
                                    disabled={isValidating}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white font-bold py-3.5 rounded-xl transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                                >
                                    {isValidating ? <Loader2 className="h-5 w-5 animate-spin" /> : 'COMPLETE SETUP'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
