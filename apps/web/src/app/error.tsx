'use client';

import { useEffect } from 'react';
import { ShieldAlert, RotateCcw, Home, MessageSquare } from 'lucide-react';
import { Button } from '@amisimedos/ui';

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string };
    reset: () => void;
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error('System Runtime Exception:', error);
    }, [error]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] relative overflow-hidden transition-all duration-700">
            {/* High-End Background - Branded Royal Blue & Amber Gradients */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/10 rounded-full blur-[160px] animate-pulse duration-[10s]" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-amber-500/10 rounded-full blur-[160px] animate-pulse duration-[8s]" />

            <div className="w-full max-w-2xl px-6 relative z-10">
                <div className="text-center space-y-8">
                    {/* Premium Iconography Component */}
                    <div className="relative mx-auto w-32 h-32 flex items-center justify-center">
                        <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse" />
                        <div className="relative z-10 w-24 h-24 bg-neutral-900 border border-white/10 rounded-3xl flex items-center justify-center shadow-2xl backdrop-blur-xl">
                            <ShieldAlert className="w-12 h-12 text-red-500" />
                        </div>
                    </div>

                    <div className="space-y-3">
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-white">
                            System Integrity <span className="text-amber-500">Intercepted</span>
                        </h1>
                        <p className="text-lg text-neutral-400 max-w-lg mx-auto leading-relaxed">
                            A runtime exception has been detected within the HMS core. 
                            Our security protocols have isolated the error to prevent data compromise.
                        </p>
                    </div>

                    {/* Error Technical Details (Subtle) */}
                    {error.digest && (
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-4 max-w-sm mx-auto backdrop-blur-md">
                            <p className="text-[10px] uppercase tracking-widest text-neutral-500 mb-1">Incident Token</p>
                            <code className="text-xs font-mono text-amber-500/80">{error.digest}</code>
                        </div>
                    )}

                    {/* Action Hub */}
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                        <Button
                            onClick={reset}
                            className="w-full sm:w-auto h-14 px-8 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-2xl transition-all duration-300 shadow-xl shadow-blue-600/20 flex items-center gap-2 group"
                        >
                            <RotateCcw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                            Retry Operation
                        </Button>
                        <Button
                            asChild
                            variant="outline"
                            className="w-full sm:w-auto h-14 px-8 border-white/10 bg-white/5 hover:bg-white/10 text-white font-semibold rounded-2xl transition-all backdrop-blur-md flex items-center gap-2"
                        >
                            <a href="/">
                                <Home className="w-5 h-5" />
                                Return Dashboard
                            </a>
                        </Button>
                    </div>

                    {/* Support Footer */}
                    <div className="pt-12 border-t border-white/5 flex flex-col items-center gap-4">
                        <p className="text-sm text-neutral-500">Need immediate clinical or technical support?</p>
                        <a 
                            href="https://wa.me/254700578380" 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 text-amber-500 hover:text-amber-400 font-medium transition-colors group"
                        >
                            <MessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
                            Contact AmisiMedOS Support
                        </a>
                    </div>
                </div>
            </div>

            {/* Subtle Brand Watermark */}
            <div className="absolute bottom-10 left-10 opacity-10 flex items-center gap-2 select-none">
                <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center">
                    <span className="font-bold text-black text-xs italic">H</span>
                </div>
                <span className="text-white font-bold tracking-tighter text-sm uppercase">AmisiMedOS</span>
            </div>
        </div>
    );
}
