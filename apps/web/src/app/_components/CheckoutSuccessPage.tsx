import React from 'react';
import { CheckCircle2, ArrowRight, Building2 } from 'lucide-react';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  return (
    <div className="min-h-screen bg-[#07070a] text-white flex items-center justify-center p-6 selection:bg-blue-500/30">
      <div className="max-w-md w-full bg-white/5 border border-white/10 rounded-[40px] p-12 text-center relative overflow-hidden">
        
        {/* Success Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-64 h-64 bg-emerald-500/20 blur-[80px] -z-10" />

        <div className="h-24 w-24 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/20">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>

        <h1 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-tight">
          Payment<br />
          <span className="text-emerald-500">Confirmed</span>
        </h1>
        
        <p className="text-neutral-400 mb-10 leading-relaxed">
          Welcome to the AmisiMedOS network. Your hospital infrastructure is being provisioned. You will receive an email with your dedicated access credentials shortly.
        </p>

        <div className="space-y-4">
          <Link 
            href="/"
            className="w-full py-5 rounded-2xl bg-blue-600 text-white font-black text-sm uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-500 transition-all shadow-xl shadow-blue-600/20 active:scale-[0.98]"
          >
            Go to Homepage <ArrowRight className="h-4 w-4" />
          </Link>
          <div className="flex items-center justify-center gap-2 text-xs text-neutral-500 font-bold uppercase tracking-widest mt-6">
             <Building2 className="h-4 w-4" />
             Infrastructure Readiness: 24h
          </div>
        </div>

      </div>
    </div>
  );
}
