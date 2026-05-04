'use client';

import { useRouter } from 'next/navigation';
import { ShieldX, ArrowLeft, LogOut } from 'lucide-react';

export default function UnauthorizedPage() {
    const router = useRouter();

    return (
        <div className="min-h-screen bg-[#0A0F1E] flex items-center justify-center p-6">
            {/* Ambient background */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-rose-600/5 rounded-full blur-3xl" />
            </div>

            <div className="relative max-w-md w-full">
                {/* Card */}
                <div className="rounded-3xl bg-white/[0.03] border border-white/[0.06] backdrop-blur-xl p-10 text-center space-y-6">

                    {/* Icon */}
                    <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-rose-500/10 border border-rose-500/20 mx-auto">
                        <ShieldX className="h-10 w-10 text-rose-400" />
                    </div>

                    {/* Status badge */}
                    <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/20">
                        <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse" />
                        <span className="text-xs font-black text-rose-400 uppercase tracking-widest">Access Denied — 403</span>
                    </div>

                    {/* Heading */}
                    <div className="space-y-2">
                        <h1 className="text-2xl font-black text-white">Insufficient Privileges</h1>
                        <p className="text-sm text-neutral-500 leading-relaxed">
                            Your current role does not grant access to this module.
                            This access attempt has been logged for security audit.
                        </p>
                    </div>

                    {/* Audit note */}
                    <div className="rounded-xl bg-amber-500/5 border border-amber-500/10 px-4 py-3 text-left">
                        <p className="text-xs text-amber-400/80 font-mono">
                            RBAC_VIOLATION: Role mismatch on module access attempt.
                            Contact your hospital administrator if you believe this is an error.
                        </p>
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col gap-3 pt-2">
                        <button
                            onClick={() => router.back()}
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-sm font-bold text-white transition-all"
                        >
                            <ArrowLeft className="h-4 w-4" />
                            Go Back
                        </button>
                        <a
                            href="/login"
                            className="flex items-center justify-center gap-2 w-full py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-sm font-bold text-rose-400 transition-all"
                        >
                            <LogOut className="h-4 w-4" />
                            Sign Out
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
}
