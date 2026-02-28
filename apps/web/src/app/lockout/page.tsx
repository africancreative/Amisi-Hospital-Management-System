import { ShieldAlert, LogOut, Phone, Mail } from 'lucide-react';
import Link from 'next/link';

export default function LockoutPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-black text-white p-6 font-sans">
            {/* Background Aesthetic */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-900/20 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-gray-900/40 rounded-full blur-[120px]" />
            </div>

            <div className="max-w-2xl w-full bg-zinc-900/50 border border-zinc-800 rounded-2xl p-8 backdrop-blur-xl relative z-10 shadow-2xl">
                <div className="flex flex-col items-center text-center space-y-6">
                    <div className="p-4 bg-red-500/10 rounded-full">
                        <ShieldAlert className="w-16 h-16 text-red-500 animate-bounce" />
                    </div>

                    <div className="space-y-2">
                        <h1 className="text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-zinc-500">
                            Access Restricted
                        </h1>
                        <p className="text-zinc-400 text-lg">
                            This hospital instance has been suspended by the Amisi Cloud system administrator.
                        </p>
                    </div>

                    <div className="w-full h-px bg-zinc-800 my-4" />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full text-left">
                        <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Status</p>
                            <p className="text-red-400 font-medium">Suspended</p>
                        </div>
                        <div className="p-4 rounded-lg bg-zinc-800/50 border border-zinc-700/50">
                            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">Instance ID</p>
                            <p className="text-zinc-300 font-mono text-sm leading-none pt-1">TRANS-GLOBAL-AMISI-09</p>
                        </div>
                    </div>

                    <div className="bg-red-500/5 border border-red-500/10 p-4 rounded-xl text-zinc-400 text-sm leading-relaxed">
                        Reason: Administrative review or pending service agreement update. All data remains encrypted and secure, but operations are temporarily frozen.
                    </div>

                    <div className="flex flex-col sm:flex-row gap-4 w-full pt-4">
                        <button className="flex-1 flex items-center justify-center gap-2 bg-white text-black font-semibold py-3 rounded-lg hover:bg-zinc-200 transition-colors">
                            <Mail className="w-4 h-4" />
                            Contact Support
                        </button>
                        <Link href="/login" className="flex-1 flex items-center justify-center gap-2 bg-zinc-800 text-white font-semibold py-3 rounded-lg hover:bg-zinc-700 transition-colors">
                            <LogOut className="w-4 h-4" />
                            Exit System
                        </Link>
                    </div>

                    <div className="flex items-center gap-6 pt-4 text-zinc-500 text-xs">
                        <span className="flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> +1 (800) AMISI-HQ</span>
                        <span className="flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> compliance@amisi.io</span>
                    </div>
                </div>
            </div>

            <p className="mt-12 text-zinc-600 text-xs tracking-widest uppercase">
                &copy; 2026 Amisi Advanced Agentic Coding. All rights reserved.
            </p>
        </div>
    );
}
