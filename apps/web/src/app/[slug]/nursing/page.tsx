'use client';

import React, { useState, useEffect } from 'react';
import { api } from '@/trpc/client';
import { 
  Activity, 
  Thermometer, 
  Droplets, 
  Stethoscope, 
  Pill, 
  ClipboardList, 
  AlertTriangle, 
  Search,
  CheckCircle2,
  Clock,
  ChevronRight,
  TrendingDown,
  TrendingUp,
  User,
  ShieldAlert,
  Fingerprint,
  Zap,
  Heart
} from 'lucide-react';

export default function NursingStation() {
  const { data: admittedPatients, isLoading } = api.nursing.getAdmittedPatients.useQuery();
  const [activePatient, setActivePatient] = useState<any>(null);
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    setIsOffline(!navigator.onLine);
    const handleConnectivity = () => setIsOffline(!navigator.onLine);
    window.addEventListener('online', handleConnectivity);
    window.addEventListener('offline', handleConnectivity);
    return () => {
      window.removeEventListener('online', handleConnectivity);
      window.removeEventListener('offline', handleConnectivity);
    };
  }, []);

  const stats = [
    { label: 'Ward Occupancy', count: admittedPatients?.length || 0, icon: User, color: 'text-blue-500' },
    { label: 'Pending Meds', count: 12, icon: Pill, color: 'text-amber-500' },
    { label: 'System Alert (NEWS2 >= 5)', count: 2, icon: AlertTriangle, color: 'text-rose-500' },
    { label: 'Node Connectivity', count: isOffline ? 'OFFLINE' : 'ONLINE', icon: Zap, color: isOffline ? 'text-rose-500' : 'text-emerald-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-950 text-slate-100 font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-gray-900/50 backdrop-blur-md sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg">
            <Activity className="text-indigo-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black italic tracking-tighter uppercase">AMISI <span className="text-indigo-500">NURSING</span></h1>
            <p className="text-[10px] text-slate-500 uppercase tracking-[0.2em] font-black">AI-Powered Intelligent Triage</p>
          </div>
        </div>

        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 rounded-xl font-bold text-xs text-slate-400 hover:text-white hover:border-indigo-500/40 transition-all">
              <Fingerprint size={16} className="text-indigo-400" />
              Global Bio Search
           </button>

           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <input 
               type="text" 
               placeholder="Search Admitted Patient..." 
               className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-xs focus:outline-none focus:border-indigo-500/50 w-64 transition-all"
             />
           </div>
           
           <button className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 rounded-xl font-black text-xs transition-all shadow-xl shadow-indigo-500/20 active:scale-95 group">
             <Stethoscope size={18} className="group-hover:rotate-12 transition-transform" />
             Initiate Round
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {stats.map((s, i) => (
             <div key={i} className="bg-white/[0.03] border border-white/5 p-5 rounded-3xl flex items-center gap-4 hover:border-white/10 transition-all">
                <div className={`p-4 rounded-2xl bg-black/20 ${s.color}`}>
                   <s.icon size={26} />
                </div>
                <div>
                   <p className="text-2xl font-black text-white">{s.count}</p>
                   <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{s.label}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
           {/* Patient Board */}
           <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2 custom-scrollbar">
              <div className="flex items-center justify-between px-2 mb-2">
                 <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Inpatient Worklist</h3>
                 <span className="text-[10px] font-black text-indigo-500">{admittedPatients?.length} BEDDED</span>
              </div>
              
              {isLoading ? (
                <div className="p-20 text-center text-slate-700 italic text-xs">Syncing floor sensors...</div>
              ) : admittedPatients?.map((admission: any) => (
                <button 
                  key={admission.id}
                  onClick={() => setActivePatient(admission)}
                  className={`p-5 rounded-[2.5rem] border text-left transition-all relative group overflow-hidden ${activePatient?.id === admission.id ? 'bg-indigo-600/10 border-indigo-500/50 shadow-2xl shadow-indigo-500/10' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                     <span className="text-[10px] font-black px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-400 uppercase tracking-tighter">BED {admission.bed?.number}</span>
                     
                     {/* NEWS2 Stability Tag */}
                     <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-full ${admission.id === admittedPatients?.[0]?.id ? 'bg-rose-500/20 text-rose-500' : 'bg-emerald-500/20 text-emerald-500'}`}>
                        <div className={`w-1.5 h-1.5 rounded-full ${admission.id === admittedPatients?.[0]?.id ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                        <span className="text-[8px] font-black uppercase tracking-tighter">{admission.id === admittedPatients?.[0]?.id ? 'NEWS2: 7' : 'NEWS2: 1'}</span>
                     </div>
                  </div>
                  
                  <h4 className="font-bold text-white text-md tracking-tight mb-1 group-hover:text-indigo-400 transition-colors">{admission.encounter.patient?.firstName} {admission.encounter.patient?.lastName}</h4>
                  
                  <div className="flex items-center gap-3 text-[10px] text-slate-500 font-bold uppercase tracking-tighter">
                     <div className="flex items-center gap-1">
                        <Clock size={10} />
                        <span>Day {Math.floor((new Date().getTime() - new Date(admission.admittedAt).getTime()) / (1000 * 60 * 60 * 24))}</span>
                     </div>
                     <ChevronRight size={10} className="text-slate-700" />
                     <span className="truncate">{admission.bed?.ward?.name}</span>
                  </div>
                  
                  {activePatient?.id === admission.id && (
                    <div className="absolute right-0 top-0 bottom-0 w-1.5 bg-indigo-500" />
                  )}
                </button>
              ))}
           </div>

           {/* Central Charting Area */}
           <div className="flex-1 bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden flex flex-col shadow-2xl relative">
              {isOffline && (
                 <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-rose-600 text-white px-4 py-1.5 rounded-full text-[10px] font-black uppercase z-50 flex items-center gap-2 shadow-xl shadow-rose-600/20 border border-white/20">
                    <Zap size={12} className="animate-pulse" />
                    Offline Mode: Local Clinical Buffer Active
                 </div>
              )}

              {activePatient ? (
                <>
                  <div className="p-10 border-b border-white/5 bg-gradient-to-r from-indigo-500/5 to-transparent">
                    <div className="flex justify-between items-start">
                       <div>
                          <div className="flex items-center gap-4 mb-3">
                             <h2 className="text-4xl font-black tracking-tighter italic">{activePatient.encounter.patient?.firstName} <span className="text-indigo-500">{activePatient.encounter.patient?.lastName}</span></h2>
                             <span className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-500 tracking-widest">HOSPITAL NO: {activePatient.encounter.patient?.id.slice(0, 8)}</span>
                          </div>
                          <div className="flex items-center gap-6 text-[11px] font-black text-slate-500 uppercase tracking-widest">
                             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-indigo-500 rounded-full" /> BED {activePatient.bed?.number}</span>
                             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-slate-700 rounded-full" /> {activePatient.bed?.ward?.name}</span>
                             <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 bg-emerald-500 rounded-full" /> ADMITTED {new Date(activePatient.admittedAt).toLocaleDateString()}</span>
                          </div>
                       </div>
                       
                       {/* Stability Summary Badge */}
                       <div className="p-6 bg-white/[0.03] border border-white/5 rounded-3xl text-right">
                          <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mb-1 italic">Clinical Stability (NEWS2)</p>
                          <div className="flex items-center gap-3 justify-end">
                             <span className="text-3xl font-black italic tracking-tighter text-rose-500">7.0</span>
                             <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-rose-500 uppercase tracking-tighter">CRITICAL RISK</span>
                                <span className="text-[8px] font-bold text-slate-600">NEWS2 Protocol v4</span>
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>

                  <div className="flex-1 p-10 overflow-y-auto space-y-12 custom-scrollbar">
                     {/* Vitals Trend Grid */}
                     <section className="space-y-6">
                        <div className="flex justify-between items-center">
                           <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] pl-3 border-l-4 border-indigo-500">INTELLIGENT TELEMETRY (AI-NEWS2)</h3>
                           <div className="flex items-center gap-4">
                              <span className="text-[10px] font-black text-slate-600 italic">SCALE 1: GENERAL ACUTE</span>
                              <button className="text-[10px] font-black text-indigo-400 hover:text-indigo-300">GRAPHICAL TRENDS</button>
                           </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                           {[
                              { label: 'RESPI RATE', val: '28', unit: 'bpm', icon: Activity, color: 'text-rose-500', points: '+3 NEWS2', isCritical: true },
                              { label: 'SpO2', val: '92', unit: '%', icon: Heart, color: 'text-amber-500', points: '+2 NEWS2', isAmber: true },
                              { label: 'TEMP', val: '39.4', unit: '°C', icon: Thermometer, color: 'text-rose-500', points: '+2 NEWS2', isCritical: true },
                              { label: 'B/P (SYST)', val: '142', unit: 'mmHg', icon: Droplets, color: 'text-emerald-500', points: '0 NEWS2' },
                           ].map((v, i) => (
                              <div key={i} className={`p-6 rounded-[2.5rem] border transition-all relative overflow-hidden group ${v.isCritical ? 'bg-rose-500/10 border-rose-500/30 shadow-xl shadow-rose-500/5' : v.isAmber ? 'bg-amber-500/5 border-amber-500/20' : 'bg-white/5 border-white/5'}`}>
                                 <div className="flex justify-between items-start mb-4">
                                    <div className={`p-3 rounded-2xl bg-black/40 ${v.color}`}>
                                       <v.icon size={20} />
                                    </div>
                                    <span className={`text-[9px] font-black px-2.5 py-1 rounded-full italic tracking-tighter ${v.isCritical ? 'bg-rose-500 text-white' : v.isAmber ? 'bg-amber-500 text-black' : 'bg-white/10 text-slate-500'}`}>{v.points}</span>
                                 </div>
                                 <p className="text-4xl font-black text-white italic tracking-tighter mb-1">{v.val}<span className="text-xs ml-1 text-slate-500 font-normal"> {v.unit}</span></p>
                                 <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{v.label}</p>
                                 
                                 {v.isCritical && (
                                    <div className="absolute inset-0 border-2 border-rose-500/20 rounded-[2.5rem] animate-pulse" />
                                 )}
                              </div>
                           ))}
                        </div>
                     </section>

                     {/* Medication Administration Board (MAR) */}
                     <div className="grid grid-cols-2 gap-12">
                        <section className="space-y-6">
                           <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] pl-3 border-l-4 border-emerald-500">TREATMENT PLAN (MAR)</h3>
                           <div className="space-y-4">
                              {activePatient.encounter.prescriptions?.[0]?.items?.map((item: any) => (
                                 <div key={item.id} className="bg-white/[0.01] border border-white/5 p-6 rounded-[2rem] flex justify-between items-center group hover:border-emerald-500/40 transition-all hover:bg-emerald-500/5">
                                    <div className="flex items-center gap-5">
                                       <div className="p-4 bg-emerald-500/10 rounded-2xl text-emerald-500 group-hover:scale-110 transition-transform">
                                          <Pill size={24} />
                                       </div>
                                       <div>
                                          <p className="font-black text-white text-md tracking-tight uppercase italic">{item.drugName}</p>
                                          <p className="text-[10px] text-slate-500 font-black tracking-[0.1em] uppercase">{item.dosage} • {item.frequency} • NEXT DOSE 14:00</p>
                                       </div>
                                    </div>
                                    <button className="p-3 bg-emerald-600 rounded-2xl hover:bg-emerald-500 transition-all shadow-xl shadow-emerald-600/30 active:scale-90 text-white">
                                       <CheckCircle2 size={24} />
                                    </button>
                                 </div>
                              ))}
                           </div>
                        </section>

                        <section className="space-y-6">
                           <div className="flex justify-between items-center">
                              <h3 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] pl-3 border-l-4 border-blue-500">HANDOVER NOTES</h3>
                              <span className="text-[9px] font-black text-slate-700 italic">LAST MODIFIED: 10M AGO</span>
                           </div>
                           <div className="bg-black/40 border border-white/5 rounded-[2.5rem] flex flex-col h-full min-h-[350px] group focus-within:border-blue-500/50 transition-all">
                              <div className="p-6 border-b border-white/5 flex gap-2">
                                 <div className="w-2.5 h-2.5 rounded-full bg-rose-500/50" />
                                 <div className="w-2.5 h-2.5 rounded-full bg-amber-500/50" />
                                 <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/50" />
                              </div>
                              <textarea 
                                 placeholder="Start clinical handover, clinical observations or escalation requests..." 
                                 className="flex-1 bg-transparent border-none focus:outline-none p-8 text-sm text-slate-400 leading-relaxed resize-none font-medium italic placeholder:text-slate-700"
                              />
                              <div className="p-6 bg-white/[0.01] border-t border-white/5 flex justify-between items-center">
                                 <div className="flex items-center gap-2">
                                    <div className={`w-2 h-2 rounded-full ${isOffline ? 'bg-rose-500 animate-pulse' : 'bg-emerald-500'}`} />
                                    <span className="text-[10px] text-slate-600 font-black uppercase italic tracking-tighter">
                                       {isOffline ? 'OFFLINE BUFFER ACTIVE' : 'CLOUD SYNC SYNCED'}
                                    </span>
                                 </div>
                                 <button className="px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest rounded-xl shadow-2xl shadow-blue-500/30 transition-all active:scale-95">Save Update</button>
                              </div>
                           </div>
                        </section>
                     </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 space-y-6 text-slate-800">
                   <div className="p-12 bg-white/[0.01] rounded-full border border-white/5 animate-pulse">
                      <ClipboardList size={84} strokeWidth={0.5} className="text-slate-800" />
                   </div>
                   <div className="text-center">
                      <h4 className="text-xl font-black text-slate-700 italic tracking-tighter uppercase mb-1">Station Selection Required</h4>
                      <p className="text-xs text-slate-800 font-black uppercase tracking-[0.2em]">Select an active bed to initiate clinical round</p>
                   </div>
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}
;
}
