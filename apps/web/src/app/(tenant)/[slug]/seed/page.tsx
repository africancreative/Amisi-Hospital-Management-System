'use client';

import React, { useState } from 'react';
import { seedDemoData } from '@/app/actions/seed-demo';
import { useParams } from 'next/navigation';
import { Database, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';

export default function SeedPage() {
    const params = useParams();
    const slug = params.slug as string;
    const [status, setStatus] = useState<'IDLE' | 'SEEDING' | 'SUCCESS' | 'ERROR'>('IDLE');
    const [error, setError] = useState<string | null>(null);

    const handleSeed = async () => {
        setStatus('SEEDING');
        try {
            await seedDemoData(slug);
            setStatus('SUCCESS');
        } catch (err: any) {
            console.error(err);
            setStatus('ERROR');
            setError(err.message || 'Seeding failed');
        }
    };

    return (
        <div className="min-h-screen bg-[#07070a] flex items-center justify-center p-8">
            <div className="max-w-md w-full bg-gray-900/40 border border-gray-800 rounded-[48px] p-12 text-center shadow-2xl">
                <div className="h-20 w-20 bg-blue-600/10 rounded-3xl flex items-center justify-center mx-auto mb-8">
                    <Database className="h-10 w-10 text-blue-500" />
                </div>
                
                <h1 className="text-2xl font-black uppercase tracking-tight mb-4">Environment Seeder</h1>
                <p className="text-gray-500 text-sm font-bold leading-relaxed mb-10 uppercase tracking-widest">
                    Initializing demo data for: <br/>
                    <span className="text-blue-500">/{slug}</span>
                </p>

                {status === 'IDLE' && (
                    <button 
                        onClick={handleSeed}
                        className="w-full py-5 bg-blue-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-blue-900/40 hover:bg-blue-500 transition-all"
                    >
                        Seed Demo Data
                    </button>
                )}

                {status === 'SEEDING' && (
                    <div className="flex flex-col items-center gap-4 py-4">
                        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Generating Records...</span>
                    </div>
                )}

                {status === 'SUCCESS' && (
                    <div className="flex flex-col items-center gap-6">
                        <div className="h-12 w-12 bg-emerald-500 rounded-full flex items-center justify-center">
                            <CheckCircle2 className="h-6 w-6 text-white" />
                        </div>
                        <p className="text-emerald-500 text-xs font-black uppercase tracking-widest">Seeding Complete</p>
                        <a 
                            href={`/${slug}/dashboard`}
                            className="w-full py-4 bg-white/5 border border-white/5 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all"
                        >
                            Go to Dashboard
                        </a>
                    </div>
                )}

                {status === 'ERROR' && (
                    <div className="flex flex-col items-center gap-4">
                        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500">
                            <AlertCircle className="h-5 w-5 shrink-0" />
                            <span className="text-[10px] font-black text-left">{error}</span>
                        </div>
                        <button onClick={() => setStatus('IDLE')} className="text-[10px] font-black text-gray-500 uppercase hover:text-white underline">Try Again</button>
                    </div>
                )}
            </div>
        </div>
    );
}
