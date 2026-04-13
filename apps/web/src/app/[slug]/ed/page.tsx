'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  AlertTriangle, 
  Activity, 
  ShieldCheck, 
  Clock, 
  UserPlus,
  Flame,
  ArrowRight,
  Stethoscope
} from 'lucide-react';
import { ClinicalWorkspace } from '@/components/clinical/ClinicalWorkspace';
import { api } from '@/trpc/react';

/**
 * ED (Emergency Department) Master Workspace
 * 
 * High-velocity clinical interface focusing on critical triage, 
 * EMTALA compliance (MSE), and rapid stabilization.
 */
export default function EmergencyPage() {
    const params = useParams();
    const slug = params?.slug as string;
    
    const [selectedPatient, setSelectedPatient] = useState<{
        id: string;
        name: string;
        mrn: string;
        status: string;
        visitId?: string;
        esiLevel?: number;
    } | null>(null);

    // 1. Fetch Recently Active Patients in ER
    const { data: erPatients } = api.patient.getRecent.useQuery();

    const handlePatientSelect = (p: any) => {
        setSelectedPatient({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            mrn: p.mrn,
            status: 'ER TRIAGE',
            visitId: 'er-visit-id',
            esiLevel: 2 // Mock for UI
        });
    };

    const esiLevels = [
        { level: 1, label: 'RESUSCITATION', color: 'bg-red-600', description: 'Immediate life-saving intervention required' },
        { level: 2, label: 'EMERGENT', color: 'bg-orange-500', description: 'High risk/Confused/Lethargic or Severe Pain' },
        { level: 3, label: 'URGENT', color: 'bg-yellow-500', description: '2+ resources needed / Stable vitals' },
        { label: 'MSE', icon: Stethoscope, color: 'bg-blue-600', description: 'Medical Screening Examination Complete' }
    ];

    return (
        <ClinicalWorkspace 
          title="Emergency Department" 
          department="ED"
          patient={selectedPatient || undefined}
        >
            <div className="space-y-8">
                {/* Critical Alerts & Stats */}
                <div className="grid grid-cols-4 gap-4">
                    <div className="col-span-2 bg-gradient-to-br from-red-500/10 to-transparent border border-red-500/20 p-6 rounded-2xl flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-red-600 flex items-center justify-center animate-pulse shadow-[0_0_20px_rgba(220,38,38,0.4)]">
                                <Flame className="h-6 w-6 text-white" />
                            </div>
                            <div>
                                <h3 className="text-xl font-black text-white uppercase tracking-tighter">Level 1 Trauma</h3>
                                <p className="text-xs text-red-500 font-bold uppercase tracking-widest">Active Resuscitation: 01</p>
                            </div>
                        </div>
                        <button className="px-6 py-2 bg-red-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-red-500 transition-all">
                            Dispatch Trauma Team
                        </button>
                    </div>
                    {[
                        { label: 'Wait to MSE', value: '14m', icon: Clock, color: 'text-blue-400' },
                        { label: 'ED Census', value: '12', icon: Activity, color: 'text-amber-400' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-gray-900/40 border border-gray-800 p-4 rounded-2xl flex flex-col justify-center">
                            <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1">{stat.label}</span>
                            <div className="flex items-center gap-2">
                                <stat.icon className={`h-4 w-4 ${stat.color}`} />
                                <span className="text-xl font-black text-white">{stat.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Patient Trackboard */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
                        <div className="flex items-center gap-3">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                            <h2 className="text-sm font-black text-white uppercase tracking-tight">Active ED Trackboard</h2>
                        </div>
                        <button className="h-8 px-4 bg-gray-800 border border-gray-700 hover:border-red-500/50 text-white rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2">
                            <UserPlus className="h-3 w-3" />
                            Emergency Admission
                        </button>
                    </div>

                    <div className="divide-y divide-gray-800">
                        {erPatients?.map((p, idx) => (
                            <div 
                                key={p.id} 
                                onClick={() => handlePatientSelect(p)}
                                className={`group flex items-center justify-between p-5 hover:bg-white/5 transition-all cursor-pointer ${
                                    selectedPatient?.id === p.id ? 'bg-red-500/5 border-l-2 border-red-500' : ''
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className={`h-12 w-12 rounded-xl flex items-center justify-center text-xs font-black border ${
                                        idx === 0 ? 'bg-red-600 border-red-400 text-white shadow-lg' : 'bg-gray-950/80 border-gray-800 text-gray-400'
                                    }`}>
                                        {idx === 0 ? 'ESI 1' : `ESI ${idx + 2}`}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white leading-none mb-1">{p.firstName} {p.lastName}</span>
                                        <span className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">{p.mrn}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-8">
                                    <div className="hidden md:flex flex-col items-center px-4 py-1 bg-gray-950/50 rounded-lg border border-gray-800">
                                        <span className="text-[8px] font-black text-gray-600 uppercase mb-0.5">Wait Time</span>
                                        <span className="text-[10px] font-mono text-amber-500">12:04</span>
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Assignment</span>
                                        <span className="text-[10px] font-bold text-white uppercase italic">Dr. Malo (ER 1)</span>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-700 group-hover:text-red-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Trauma/ESI Assessment Hub */}
                {selectedPatient && (
                    <div className="bg-gray-950/60 border border-red-500/20 rounded-2xl overflow-hidden shadow-[0_0_50px_rgba(239,68,68,0.1)] lg:grid lg:grid-cols-3">
                        <div className="col-span-2 p-8 border-r border-gray-800">
                            <div className="flex items-center gap-3 mb-8">
                                <Activity className="h-5 w-5 text-red-500" />
                                <h2 className="text-sm font-black text-white uppercase tracking-tight">Rapid Medical Assessment</h2>
                            </div>
                            
                            <div className="grid grid-cols-4 gap-4 mb-8">
                                {esiLevels.map((lvl: any) => (
                                    <button 
                                        key={lvl.label}
                                        className={`p-4 rounded-2xl border transition-all flex flex-col items-center text-center gap-2 ${
                                            selectedPatient.esiLevel === lvl.level 
                                            ? `${lvl.color} border-white/20 shadow-xl` 
                                            : 'bg-gray-900/50 border-gray-800 hover:border-gray-600'
                                        }`}
                                    >
                                        {lvl.icon ? <lvl.icon className="h-5 w-5 text-white" /> : <span className="text-lg font-black text-white">{lvl.level}</span>}
                                        <span className="text-[9px] font-black text-white uppercase tracking-tighter">{lvl.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Presenting Condition</label>
                                        <input type="text" className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500/50 outline-none" placeholder="e.g., Chest Pain, Acute Trauma" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">MSE Status (EMTALA)</label>
                                        <select className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500/50 outline-none appearance-none">
                                            <option>PENDING SCREENING</option>
                                            <option>STABILIZED</option>
                                            <option>UNSTABLE - TRANSFER</option>
                                        </select>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Intervention Plan</label>
                                    <textarea rows={3} className="w-full bg-gray-900 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-red-500/50 outline-none resize-none" placeholder="Initiate IV fluids, stat ECG..."></textarea>
                                </div>
                            </div>
                        </div>

                        {/* ED Real-Time Billing */}
                        <div className="bg-gray-900/40 p-8 flex flex-col justify-between">
                            <div className="space-y-4">
                                <div className="flex items-center gap-2 mb-6">
                                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                                    <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Emergency Billing Logs</h4>
                                </div>
                                
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">ESI Level {selectedPatient.esiLevel} Triage</span>
                                        <span className="text-white font-mono">$45.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">MSE Exam Charge</span>
                                        <span className="text-white font-mono">$35.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">Emergency Nursing</span>
                                        <span className="text-white font-mono">$20.00</span>
                                    </div>
                                </div>

                                <div className="h-[1px] bg-gray-800 my-6"></div>
                                
                                <div className="flex justify-between items-center">
                                    <span className="text-xs font-black text-white uppercase">ER Current Total</span>
                                    <span className="text-2xl font-black text-red-500 font-mono">$100.00</span>
                                </div>
                                <p className="text-[9px] text-gray-600 uppercase font-medium mt-2 leading-tight">
                                    * Every stabilization step is automatically billed in real-time.
                                </p>
                            </div>

                            <div className="space-y-3">
                                <button className="w-full py-4 bg-red-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-red-500 transition-all shadow-xl active:scale-95 shadow-red-900/20">
                                    Authorize Stabilization Flow
                                </button>
                                <button className="w-full py-3 bg-gray-950 border border-gray-800 text-gray-400 rounded-xl text-[10px] font-black uppercase tracking-widest hover:text-white transition-all">
                                    Request IPD Transfer
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ClinicalWorkspace>
    );
}
