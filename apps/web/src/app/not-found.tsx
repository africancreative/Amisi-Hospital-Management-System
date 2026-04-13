'use client';

import { Search, Home, ArrowLeft } from 'lucide-react';
import { Button } from '@amisimedos/ui';

export default function NotFound() {
    return (
        <div className="min-h-screen flex items-center justify-center bg-[#0a0a0b] relative overflow-hidden transition-all duration-700">
            {/* Branded Subtle Background Decoration */}
            <div className="absolute top-[-20%] left-[-20%] w-[60%] h-[60%] bg-blue-600/5 rounded-full blur-[160px]" />
            <div className="absolute bottom-[-20%] right-[-20%] w-[60%] h-[60%] bg-amber-500/5 rounded-full blur-[160px]" />

            <div className="w-full max-w-2xl px-6 relative z-10 text-center space-y-12">
                
                {/* 404 Stylized Hero */}
                <div className="relative group">
                    <h2 className="text-[14rem] md:text-[18rem] font-black text-white/5 tracking-tighter transition-all duration-700 group-hover:text-blue-500/10">
                        404
                    </h2>
                    <div className="absolute inset-0 flex items-center justify-center translate-y-10">
                        <div className="p-6 bg-white/5 border border-white/10 rounded-[3rem] backdrop-blur-3xl shadow-2xl animate-bounce duration-[3s]">
                            <Search className="w-16 h-16 text-amber-500" />
                        </div>
                    </div>
                </div>

                <div className="space-y-4 pt-12">
                    <h1 className="text-3xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                        Module <span className="text-blue-500">Identification</span> Failure
                    </h1>
                    <p className="text-lg text-neutral-500 max-w-sm mx-auto leading-relaxed">
                        The resource or clinical record you are attempting to access does not exist in the HMS registry.
                    </p>
                </div>

                {/* Navigation Hub */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-6 pt-6">
                    <Button
                        onClick={() => window.history.back()}
                        variant="ghost"
                        className="w-full sm:w-auto h-14 px-8 text-neutral-400 hover:text-white hover:bg-white/5 rounded-2xl transition-all flex items-center gap-2 group"
                    >
                        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                        Retrace Path
                    </Button>
                    <Button
                        asChild
                        className="w-full sm:w-auto h-14 px-10 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl transition-all shadow-2xl shadow-blue-600/30 flex items-center gap-2"
                    >
                        <a href="/">
                            <Home className="w-5 h-5" />
                            Primary Registry
                        </a>
                    </Button>
                </div>

                <div className="pt-16">
                    <p className="text-[10px] uppercase font-bold tracking-[0.3em] text-neutral-700">
                        AmisiMedOS Registry Integrity Protocol v4.0
                    </p>
                </div>
            </div>

            {/* Subtle Brand Watermark */}
            <div className="absolute top-10 left-10 opacity-20 hidden md:flex items-center gap-2 select-none group">
                <div className="w-10 h-10 bg-amber-500 rounded-2xl flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-110 transition-transform">
                    <span className="font-bold text-white text-md italic">H</span>
                </div>
                <span className="text-white font-bold tracking-tighter text-sm">HMS SYSTEM REGISTRY</span>
            </div>
        </div>
    );
}
