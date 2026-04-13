'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { 
  UserPlus, 
  Stethoscope, 
  ClipboardList, 
  Activity, 
  ShieldAlert,
  Search,
  ArrowRight
} from 'lucide-react';
import { ClinicalWorkspace } from '@/components/clinical/ClinicalWorkspace';
import { api } from '@/trpc/react';
import { format } from 'date-fns';

/**
 * OPD (Outpatient Department) Dashboard
 * 
 * Manages the high-volume patient flow from registration to consult.
 */
export default function OpdPage() {
    const params = useParams();
    const slug = params?.slug as string;
    
    const [selectedPatient, setSelectedPatient] = useState<{
        id: string;
        name: string;
        mrn: string;
        status: string;
        visitId?: string;
    } | null>(null);

    // 1. Fetch Recently Active Patients in OPD
    const { data: opdPatients, isLoading } = api.patient.getRecent.useQuery();

    const handlePatientSelect = (patient: any) => {
        setSelectedPatient({
            id: patient.id,
            name: `${patient.firstName} ${patient.lastName}`,
            mrn: patient.mrn,
            status: 'TRIAGE PENDING',
            visitId: 'mock-visit-id' // In real app, we'd fetch/create a visit
        });
    };

    return (
        <ClinicalWorkspace 
          title="Outpatient Department" 
          department="OPD"
          patient={selectedPatient || undefined}
        >
            <div className="space-y-8">
                {/* Dashboard Stats */}
                <div className="grid grid-cols-4 gap-4">
                    {[
                        { label: 'Waiting/Clinic', value: '18', icon: ClipboardList, color: 'text-blue-500' },
                        { label: 'In Triage', value: '4', icon: Activity, color: 'text-emerald-500' },
                        { label: 'With Doctor', value: '6', icon: Stethoscope, color: 'text-purple-500' },
                        { label: 'High Priority', value: '2', icon: ShieldAlert, color: 'text-amber-500' },
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

                {/* Patient Intake Queue */}
                <div className="bg-gray-900/40 border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between bg-gray-900/60">
                        <div className="flex items-center gap-3">
                            <div className="h-8 w-8 rounded-full bg-blue-500/10 flex items-center justify-center border border-blue-500/20">
                                <ClipboardList className="h-4 w-4 text-blue-500" />
                            </div>
                            <h2 className="text-sm font-black text-white uppercase tracking-tight">Active Intake Queue</h2>
                        </div>
                        <div className="flex items-center gap-2">
                             <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-gray-500" />
                                <input 
                                    type="text" 
                                    placeholder="Search MRN or Name..." 
                                    className="bg-gray-950/50 border border-gray-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-white focus:outline-none focus:border-blue-500/50 min-w-[240px]"
                                />
                             </div>
                             <button className="h-8 px-4 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-[10px] font-black uppercase transition-all flex items-center gap-2">
                                <UserPlus className="h-3 w-3" />
                                Register Patient
                             </button>
                        </div>
                    </div>

                    <div className="divide-y divide-gray-800">
                        {opdPatients?.map((p) => (
                            <div 
                                key={p.id} 
                                onClick={() => handlePatientSelect(p)}
                                className={`group flex items-center justify-between p-4 hover:bg-white/5 transition-all cursor-pointer ${
                                    selectedPatient?.id === p.id ? 'bg-blue-500/5 border-l-2 border-blue-500' : ''
                                }`}
                            >
                                <div className="flex items-center gap-4">
                                    <div className="h-10 w-10 rounded-xl bg-gray-800 flex items-center justify-center text-xs font-black text-gray-400 group-hover:text-blue-400 transition-colors">
                                        {p.firstName[0]}{p.lastName[0]}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-white leading-none mb-1">{p.firstName} {p.lastName}</span>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] text-gray-500 font-mono tracking-tighter uppercase">{p.mrn}</span>
                                            <span className="h-1 w-1 rounded-full bg-gray-700"></span>
                                            <span className="text-[10px] text-gray-500 font-bold uppercase">{format(new Date(p.dateOfBirth), 'dd MMM yyyy')}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-6">
                                    <div className="flex flex-col items-end">
                                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest mb-1 leading-none">Status</span>
                                        <div className="bg-gray-950/80 px-3 py-1 rounded-full border border-gray-800 text-[9px] font-black text-gray-400 group-hover:text-blue-400 transition-all uppercase">
                                            Waiting for Triage
                                        </div>
                                    </div>
                                    <ArrowRight className="h-4 w-4 text-gray-700 group-hover:text-blue-500 group-hover:translate-x-1 transition-all" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Triage Workspace (Displayed when patient selected) */}
                {selectedPatient && (
                    <div className="bg-gray-900/40 border border-blue-500/20 rounded-2xl overflow-hidden shadow-2xl animate-in slide-in-from-bottom-4 duration-500">
                        <div className="p-6 border-b border-gray-800 flex items-center gap-3 bg-blue-500/5">
                            <Activity className="h-4 w-4 text-blue-400" />
                            <h2 className="text-sm font-black text-white uppercase tracking-tight">Rapid Triage & Assessment</h2>
                        </div>
                        <div className="p-8 grid grid-cols-3 gap-8">
                            <div className="col-span-2 space-y-6">
                                <div className="grid grid-cols-3 gap-4">
                                    {['Temp (°C)', 'Pulse (bpm)', 'Resp (bpm)'].map(label => (
                                        <div key={label} className="space-y-2">
                                            <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">{label}</label>
                                            <input type="number" className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none" />
                                        </div>
                                    ))}
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-wider">Clinical Notes / Chief Complaint</label>
                                    <textarea rows={4} className="w-full bg-gray-950 border border-gray-800 rounded-xl px-4 py-3 text-sm text-white focus:border-blue-500/50 outline-none resize-none" placeholder="Describe clinical findings..."></textarea>
                                </div>
                            </div>
                            <div className="bg-gray-950/80 p-6 rounded-2xl border border-gray-800 flex flex-col justify-between">
                                <div className="space-y-4">
                                    <h4 className="text-[10px] font-black text-emerald-500 uppercase tracking-[0.2em] mb-4">Billing Preview</h4>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">OPD Triage Fee</span>
                                        <span className="text-white font-mono">$10.00</span>
                                    </div>
                                    <div className="flex justify-between items-center text-xs">
                                        <span className="text-gray-400">Nursing Service</span>
                                        <span className="text-white font-mono">$5.00</span>
                                    </div>
                                    <div className="h-[1px] bg-gray-800 my-4"></div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-xs font-black text-white uppercase">Total to Post</span>
                                        <span className="text-lg font-black text-emerald-500 font-mono">$15.00</span>
                                    </div>
                                </div>
                                <button className="w-full py-4 bg-white text-gray-950 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-emerald-500 hover:text-white transition-all shadow-lg active:scale-95">
                                    Confirm Triage & Post Bill
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </ClinicalWorkspace>
    );
}
