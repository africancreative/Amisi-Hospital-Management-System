'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  Building2, 
  Bed as BedIcon, 
  Users, 
  ClipboardList, 
  Stethoscope, 
  TrendingUp,
  ArrowRight,
  Plus
} from 'lucide-react';
import { ClinicalWorkspace } from '@/components/clinical/ClinicalWorkspace';
import { api } from '@/trpc/react';

/**
 * IPD (Inpatient Department) Ward Manager
 * 
 * Orchestrates long-term patient stays, bed management, 
 * and multi-disciplinary rounds for the ward.
 */
export default function InpatientPage() {
    const params = useParams();
    const slug = params?.slug as string;
    
    const [selectedPatient, setSelectedPatient] = useState<{
        id: string;
        name: string;
        mrn: string;
        status: string;
        visitId?: string;
        wardName: string;
        bedNumber: string;
    } | null>(null);

    // 1. Fetch Admitted Patients
    const { data: admissions, isLoading } = api.nursing.getAdmittedPatients.useQuery();

    const handlePatientSelect = (adm: any) => {
        const p = adm.encounter.patient;
        setSelectedPatient({
            id: p.id,
            name: `${p.firstName} ${p.lastName}`,
            mrn: p.mrn,
            status: 'ADMITTED',
            visitId: adm.encounter.visitId,
            wardName: adm.bed.ward.name,
            bedNumber: adm.bed.number
        });
    };

    return (
        <ClinicalWorkspace 
          title="Inpatient Ward Management" 
          department="IPD"
          patient={selectedPatient || undefined}
        >
            <div className="space-y-8">
                {/* Ward Capacity & Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Total Census', value: '24', icon: Users, color: 'text-blue-500' },
                        { label: 'Ward Capacity', value: '86%', icon: TrendingUp, color: 'text-emerald-500' },
                        { label: 'Critical Care', value: '3', icon: ClipboardList, color: 'text-red-500' },
                        { label: 'Pending Discharge', value: '5', icon: Stethoscope, color: 'text-amber-500' },
                    ].map((stat) => (
                        <div key={stat.label} className="bg-gray-900/40 border border-gray-800 p-4 rounded-2xl flex items-center gap-4 hover:border-gray-700 transition-all">
                            <div className={`p-2.5 rounded-xl bg-gray-950/80 border border-white/5 ${stat.color}`}>
                                <stat.icon className="h-5 w-5" />
                            </div>
                            <div className="flex flex-col">
                                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest leading-none mb-1">{stat.label}</span>
                                <span className="text-xl font-black text-white">{stat.value}</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Ward Trackboard (Bed View) */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-emerald-500/10 flex items-center justify-center border border-emerald-500/20">
                                <Building2 className="h-4 w-4 text-emerald-500" />
                            </div>
                            <h2 className="text-sm font-black text-white uppercase tracking-tight">General Medical Ward</h2>
                        </div>
                        <div className="flex items-center gap-2">
                             <button className="h-8 px-4 bg-gray-950 border border-gray-800 hover:border-emerald-500/50 text-white rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2">
                                <Plus className="h-3 w-3" />
                                New Admission
                             </button>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-0 divide-x divide-y divide-gray-800">
                        {admissions?.map((adm: { id: string; encounter: { patient: { id: string; firstName: string; lastName: string; mrn: string }; visitId: string }; bed: { ward: { name: string }; number: string } }) => (
                            <div 
                                key={adm.id} 
                                onClick={() => handlePatientSelect(adm)}
                                className={`group p-6 hover:bg-emerald-500/5 transition-all cursor-pointer relative ${
                                    selectedPatient?.id === adm.encounter.patient.id ? 'bg-emerald-500/5' : ''
                                }`}
                            >
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="h-10 w-10 rounded-xl bg-gray-950/80 border border-gray-800 flex flex-col items-center justify-center">
                                            <BedIcon className="h-4 w-4 text-emerald-500" />
                                            <span className="text-[10px] font-black text-white">{adm.bed.number}</span>
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-white leading-tight">{adm.encounter.patient.firstName} {adm.encounter.patient.lastName}</span>
                                            <span className="text-[9px] text-gray-500 font-mono tracking-tighter uppercase">{adm.encounter.patient.mrn}</span>
                                        </div>
                                    </div>
                                    {selectedPatient?.id === adm.encounter.patient.id && (
                                        <div className="absolute top-6 right-6 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <div className="flex justify-between items-center bg-gray-950/40 rounded-lg p-2 border border-gray-800/50">
                                        <span className="text-[8px] font-black text-gray-600 uppercase">Consultant</span>
                                        <span className="text-[10px] font-bold text-white uppercase italic">Dr. Malo</span>
                                    </div>
                                    <div className="flex justify-between items-center text-[10px]">
                                        <span className="text-gray-500 font-medium">Bedsore Risk:</span>
                                        <span className="text-emerald-500 font-black">LOW</span>
                                    </div>
                                </div>

                                <div className="mt-4 pt-4 border-t border-gray-800/40 flex items-center justify-between">
                                    <div className="flex -space-x-2">
                                        {[1, 2].map(i => (
                                            <div key={i} className="h-6 w-6 rounded-full bg-gray-800 border-2 border-gray-900 flex items-center justify-center text-[8px] font-black text-gray-500">
                                                N{i}
                                            </div>
                                        ))}
                                    </div>
                                    <button className="text-[10px] font-black text-gray-500 hover:text-emerald-400 uppercase tracking-widest flex items-center gap-1 transition-colors">
                                        View Rounds
                                        <ArrowRight className="h-3 w-3" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Admission & Routine Hub */}
                {selectedPatient && (
                    <div className="bg-gray-950/60 border border-emerald-500/20 rounded-2xl overflow-hidden shadow-2xl animate-in fade-in duration-700">
                        <div className="p-6 border-b border-gray-800 flex items-center gap-3 bg-emerald-500/5">
                            <ClipboardList className="h-4 w-4 text-emerald-400" />
                            <h2 className="text-sm font-black text-white uppercase tracking-tight">Active Inpatient Lifecycle</h2>
                        </div>
                        <div className="p-8 grid grid-cols-3 gap-8">
                            <div className="col-span-2 space-y-8">
                                <div className="grid grid-cols-2 gap-8">
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-emerald-500"></div>
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Nursing Rounds Summary</h4>
                                        </div>
                                        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-4 space-y-4">
                                            <div className="flex items-start gap-4">
                                                <div className="h-8 w-8 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-center text-[10px] font-black text-white">08:00</div>
                                                <p className="text-xs text-gray-400 italic">"Stable. IV fluids continuing. Complained of mild nausea."</p>
                                            </div>
                                            <div className="flex items-start gap-4">
                                                <div className="h-8 w-8 rounded-lg bg-gray-950 border border-gray-800 flex items-center justify-center text-[10px] font-black text-white">12:00</div>
                                                <p className="text-xs text-gray-400 italic">"Medications administered. Pain level 2/10. Vitals stable."</p>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="flex items-center gap-2">
                                            <div className="h-1.5 w-1.5 rounded-full bg-blue-500"></div>
                                            <h4 className="text-[10px] font-black text-white uppercase tracking-widest">Physician Orders</h4>
                                        </div>
                                        <div className="space-y-2">
                                            {['Complete Blood Count', 'Daily Chest X-Ray', 'Physiotherapy Consult'].map(order => (
                                                <div key={order} className="flex items-center justify-between p-3 bg-gray-900/50 border border-gray-800 rounded-xl">
                                                    <span className="text-xs text-gray-300 font-medium">{order}</span>
                                                    <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-500 text-[9px] font-black uppercase border border-blue-500/20">Active</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Discharge Planning / Readiness Note</label>
                                    <textarea rows={2} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-emerald-500/50 outline-none resize-none" placeholder="Assess for discharge today..."></textarea>
                                </div>
                            </div>

                            {/* IPD Billing Monitor */}
                            <div className="bg-emerald-600/5 p-8 rounded-2xl border border-emerald-500/10 flex flex-col justify-between">
                                <div className="space-y-6">
                                    <div className="flex items-center gap-2 mb-4">
                                        <TrendingUp className="h-4 w-4 text-emerald-500" />
                                        <h4 className="text-[10px] font-black text-white uppercase tracking-widest leading-none">Accrued Ward Charges</h4>
                                    </div>
                                    
                                    <div className="space-y-3">
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400">General Ward (Bed {selectedPatient.bedNumber})</span>
                                            <span className="text-white font-mono">$120.00/day</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400">Nursing Service (Daily)</span>
                                            <span className="text-white font-mono">$45.00</span>
                                        </div>
                                        <div className="flex justify-between items-center text-xs">
                                            <span className="text-gray-400">IPD Pharmacy Order</span>
                                            <span className="text-white font-mono">$28.40</span>
                                        </div>
                                    </div>

                                    <div className="h-[1px] bg-gray-800/60 my-6"></div>
                                    
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-white uppercase">Accrued Total</span>
                                        <span className="text-2xl font-black text-emerald-500 font-mono">$193.40</span>
                                    </div>
                                </div>

                                <button className="w-full mt-8 py-4 bg-emerald-600 text-white rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 transition-all shadow-xl active:scale-95 shadow-emerald-900/20">
                                    Update Rounds & Post Charges
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ClinicalWorkspace>
    );
}
