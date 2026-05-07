'use client';

import React from 'react';
import { CheckCircle2, ArrowRight, Building2, Globe } from 'lucide-react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug') || 'your-hospital';

  return (
    <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center p-6 selection:bg-blue-500/30">
      <div className="max-w-xl w-full bg-white/5 border border-white/10 rounded-[40px] p-12 text-center relative overflow-hidden">
        
        {/* Success Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/20 blur-[80px] -z-10" />

        <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>

        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-tight">
          Your system<br />
          <span className="text-emerald-500">Is Ready</span>
        </h1>
        
        <p className="text-neutral-400 mb-8 leading-relaxed max-w-sm mx-auto">
          Welcome to the AmisiMedOS network. Your hospital infrastructure has been provisioned. You will receive an email with your dedicated access credentials shortly.
        </p>

        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 mb-10 text-left">
            <p className="text-[10px] font-black uppercase tracking-widest text-emerald-500 mb-2">Your Dedicated Portal</p>
            <div className="flex items-center gap-3">
                <Globe className="text-slate-500 shrink-0" size={20} />
                <a 
                    href={`https://amisimedos.amisigenuine.com/${slug}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-lg font-mono font-bold text-blue-400 hover:text-blue-300 transition-colors break-all"
                >
                    amisimedos.amisigenuine.com/{slug}
                </a>
            </div>
        </div>

        <div className="space-y-4">
          <Link 
            href={`https://amisimedos.amisigenuine.com/${slug}`}
            className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
          >
            Launch System Dashboard <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 font-bold uppercase tracking-widest mt-6">
             <Building2 className="h-4 w-4" />
             Infrastructure Readiness: Active
          </div>
        </div>

      </div>
    </div>
  );
}
