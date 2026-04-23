'use client';

import { ShieldAlert, LogOut, ExternalLink } from 'lucide-react';
import { Button } from '@amisimedos/ui';
import { logout } from '@/app/actions/auth-actions';

export function TenantLockout({ 
    reason 
}: { 
    reason: 'SUSPENDED' | 'DEMO_EXPIRED' 
}) {
    return (
        <div className="fixed inset-0 z-[100] bg-neutral-950 flex items-center justify-center p-6 font-sans">
            {/* Background Decorations */}
            <div className="absolute top-[-10%] right-[-10%] w-[50%] h-[50%] bg-red-600/10 rounded-full blur-[120px]" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-amber-500/5 rounded-full blur-[120px]" />

            <div className="max-w-md w-full relative z-10 text-center">
                <div className="mb-8 flex justify-center">
                    <div className="h-20 w-20 rounded-3xl bg-red-500/10 border border-red-500/20 flex items-center justify-center animate-pulse">
                        <ShieldAlert className="h-10 w-10 text-red-500" />
                    </div>
                </div>

                <h1 className="text-4xl font-black tracking-tighter text-white mb-4 italic uppercase">
                    {reason === 'SUSPENDED' ? 'Access Restricted' : 'Demo Period Ended'}
                </h1>
                
                <p className="text-neutral-400 text-lg leading-relaxed mb-8">
                    {reason === 'SUSPENDED' 
                        ? "This hospital node has been administratively suspended. Access to clinical records is currently limited to read-only or restricted entirely."
                        : "Your 3-day enterprise demo has expired. Please contact the platform orchestrator to activate your full license."}
                </p>

                <div className="space-y-4">
                    <Button 
                        onClick={() => window.location.href = 'mailto:billing@amisigenuine.com'}
                        className="w-full bg-blue-600 hover:bg-blue-500 text-white h-14 rounded-2xl font-bold flex items-center justify-center gap-2"
                    >
                        Contact Billing Support <ExternalLink className="h-4 w-4" />
                    </Button>

                    <form action={logout}>
                        <Button 
                            variant="ghost"
                            type="submit"
                            className="w-full h-14 text-neutral-500 hover:text-white hover:bg-white/5 rounded-2xl font-bold flex items-center justify-center gap-2"
                        >
                            Return to Login <LogOut className="h-4 w-4" />
                        </Button>
                    </form>
                </div>

                <p className="mt-12 text-[10px] font-black text-neutral-600 uppercase tracking-widest">
                    AmisiMedOS Distributed Infrastructure v4.0.1
                </p>
            </div>
        </div>
    );
}
