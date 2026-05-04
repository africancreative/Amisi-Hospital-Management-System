'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Bed, 
    Activity, 
    Pill, 
    Beaker, 
    LogOut, 
    CheckCircle2, 
    AlertCircle, 
    Clock, 
    UserCircle2, 
    ArrowRightCircle,
    Bell,
    FileText,
    Thermometer,
    Heart,
    Droplets
} from 'lucide-react';
import Image from 'next/image';

interface AdmittedPatient {
    id: string;
    bed: string;
    name: string;
    status: 'STABLE' | 'CRITICAL' | 'MONITORING';
    diagnosis: string;
    vitals: {
        temp: number;
        hr: number;
        spo2: number;
    };
    nextMedAt: string;
    alerts: number;
}

export default function WardDashboard() {
    const [patients, setPatients] = useState<AdmittedPatient[]>([
        { 
            id: '1', bed: '302-A', name: 'Michael Davis', 
            status: 'MONITORING', diagnosis: 'Post-Op Appendectomy',
            vitals: { temp: 37.1, hr: 78, spo2: 97 },
            nextMedAt: '12:00 PM', alerts: 0
        },
        { 
            id: '2', bed: '305-B', name: 'Sarah Wilson', 
            status: 'CRITICAL', diagnosis: 'Acute Respiratory Distress',
            vitals: { temp: 38.5, hr: 112, spo2: 89 },
            nextMedAt: '11:30 AM', alerts: 2
        },
        { 
            id: '3', bed: '308-C', name: 'James Taylor', 
            status: 'STABLE', diagnosis: 'Pneumonia Management',
            vitals: { temp: 36.8, hr: 72, spo2: 98 },
            nextMedAt: '02:00 PM', alerts: 0
        },
    ]);

    const [activePatient, setActivePatient] = useState<AdmittedPatient | null>(patients[1]);

    return (
        <div className="flex flex-col h-screen bg-[#07070a] text-white overflow-hidden">
            {/* TOP BAR */}
            <header className="h-20 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between px-8 shrink-0 backdrop-blur-xl z-20">
                <div className="flex items-center gap-6">
                    <Image src="/logo.png" alt="AmisiMedOS" width={40} height={40} className="object-contain" />
                    <div className="h-8 w-[1px] bg-gray-800"></div>
                    <h1 className="text-sm font-black uppercase tracking-[0.2em] text-blue-500">On-Duty: Ward 3B</h1>
                </div>

                <div className="flex items-center gap-8">
                    <div className="bg-black/40 border border-white/5 rounded-2xl px-6 py-2 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest">
                        <span className="text-gray-500">Staff: 2 Nurses</span>
                        <div className="h-4 w-[1px] bg-gray-800"></div>
                        <span className="text-gray-500">Occupancy: 12/20</span>
                    </div>
                    <div className="relative">
                        <Bell className="h-6 w-6 text-rose-500 animate-bounce" />
                        <span className="absolute -top-1 -right-1 h-4 w-4 bg-rose-600 rounded-full flex items-center justify-center text-[8px] font-black">2</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden p-6 gap-6">
                {/* LEFT PANEL: PATIENT LIST */}
                <aside className="w-80 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Patient Census</h2>
                        <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full">{patients.length}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {patients.map((p: any) => (
                            <button 
                                key={p.id}
                                onClick={() => setActivePatient(p)}
                                className={`w-full p-6 rounded-[32px] border transition-all text-left relative overflow-hidden ${
                                    activePatient?.id === p.id 
                                    ? 'bg-blue-600/10 border-blue-500/50 ring-2 ring-blue-500/20' 
                                    : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <div>
                                        <h3 className="font-black text-base truncate pr-4">{p.name}</h3>
                                        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Bed {p.bed}</p>
                                    </div>
                                    <div className={`h-2 w-2 rounded-full mt-1 ${
                                        p.status === 'CRITICAL' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)] animate-pulse' : 
                                        p.status === 'MONITORING' ? 'bg-amber-500' : 'bg-emerald-500'
                                    }`}></div>
                                </div>
                                {p.alerts > 0 && (
                                    <div className="mt-4 flex items-center gap-2 text-rose-500 bg-rose-500/10 px-3 py-1 rounded-full border border-rose-500/20 w-fit">
                                        <AlertCircle className="h-3 w-3" />
                                        <span className="text-[8px] font-black uppercase">Critical Alert</span>
                                    </div>
                                )}
                            </button>
                        ))}
                    </div>
                </aside>

                {/* CENTER PANEL: ACTIVE PATIENT CARE */}
                <main className="flex-1 flex flex-col bg-gray-900/20 border border-gray-800 rounded-[48px] overflow-hidden">
                    {activePatient ? (
                        <>
                            <div className="p-8 border-b border-gray-800 bg-gray-900/40">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-6">
                                        <div className={`h-16 w-16 rounded-3xl flex items-center justify-center font-black text-2xl shadow-2xl ${
                                            activePatient.status === 'CRITICAL' ? 'bg-rose-600 shadow-rose-900/40' : 'bg-blue-600 shadow-blue-900/40'
                                        }`}>
                                            {activePatient.bed.split('-')[1]}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black uppercase tracking-tight">{activePatient.name}</h2>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">{activePatient.diagnosis}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        {[
                                            { l: 'HR', v: activePatient.vitals.hr, c: 'text-blue-400', i: Heart },
                                            { l: 'TEMP', v: activePatient.vitals.temp + '°', c: 'text-amber-400', i: Thermometer },
                                            { l: 'SPO2', v: activePatient.vitals.spo2 + '%', c: 'text-emerald-400', i: Droplets },
                                        ].map((v: any) => (
                                            <div key={v.l} className="bg-black/40 border border-white/5 rounded-2xl px-6 py-3 flex flex-col items-center min-w-[80px]">
                                                <v.i className={`h-3 w-3 mb-1 ${v.c}`} />
                                                <span className={`text-lg font-black ${v.c}`}>{v.v}</span>
                                                <span className="text-[8px] font-black text-gray-600 uppercase tracking-widest">{v.l}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-3xl flex items-center gap-4">
                                        <Clock className="h-5 w-5 text-blue-500" />
                                        <div>
                                            <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block">Next Medication</span>
                                            <p className="text-sm font-black text-white">{activePatient.nextMedAt}</p>
                                        </div>
                                    </div>
                                    <div className="bg-rose-500/5 border border-rose-500/10 p-5 rounded-3xl flex items-center gap-4">
                                        <AlertCircle className="h-5 w-5 text-rose-500" />
                                        <div>
                                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest block">Last Alert</span>
                                            <p className="text-sm font-black text-white">{activePatient.status === 'CRITICAL' ? 'O2 Desaturation (89%)' : 'None'}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 p-10 overflow-y-auto space-y-10 custom-scrollbar">
                                <section>
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2 mb-6">Medication Schedule</h3>
                                    <div className="space-y-3">
                                        {[
                                            { name: 'Ceftriaxone 1g IV', time: '11:30 AM', status: 'PENDING' },
                                            { name: 'Paracetamol 1g IV', time: '09:00 AM', status: 'GIVEN' },
                                            { name: 'Oxygen Therapy 4L/min', time: 'CONTINUOUS', status: 'ACTIVE' },
                                        ].map((med: any) => (
                                            <div key={med.name} className="bg-gray-900/60 border border-gray-800 p-6 rounded-3xl flex items-center justify-between">
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl ${med.status === 'GIVEN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-blue-500/10 text-blue-500'}`}>
                                                        <Pill className="h-5 w-5" />
                                                    </div>
                                                    <div>
                                                        <h4 className="font-black text-sm">{med.name}</h4>
                                                        <span className="text-[10px] font-bold text-gray-500 uppercase">{med.time}</span>
                                                    </div>
                                                </div>
                                                <span className={`text-[10px] font-black px-4 py-1 rounded-full border ${
                                                    med.status === 'GIVEN' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-500' : 'bg-blue-500/10 border-blue-500/20 text-blue-500'
                                                }`}>
                                                    {med.status}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </section>

                                <section>
                                    <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2 mb-6">Nursing Timeline</h3>
                                    <div className="border-l-2 border-gray-800 ml-4 pl-8 space-y-8">
                                        <div className="relative">
                                            <div className="absolute -left-[37px] top-0 h-4 w-4 rounded-full bg-blue-600 ring-4 ring-blue-900/20"></div>
                                            <span className="text-[10px] font-black text-gray-600 uppercase">10:15 AM - Nrs. Amina</span>
                                            <p className="text-sm text-gray-400 mt-2">Patient reported mild chest pain. Vitals recorded. Oxygen adjusted to 4L/min.</p>
                                        </div>
                                        <div className="relative">
                                            <div className="absolute -left-[37px] top-0 h-4 w-4 rounded-full bg-gray-800"></div>
                                            <span className="text-[10px] font-black text-gray-600 uppercase">08:00 AM - Shift Handover</span>
                                            <p className="text-sm text-gray-400 mt-2">Patient stable throughout night shift. IV fluids continuing at 100ml/hr.</p>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-12">
                            <div className="h-24 w-24 rounded-full bg-blue-600/5 flex items-center justify-center mb-8">
                                <Bed className="h-12 w-12 text-blue-500/40" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Ward Census</h2>
                            <p className="text-gray-600 text-sm max-w-xs">Select a bed to view detailed care plan and vitals history.</p>
                        </div>
                    )}
                </main>

                {/* RIGHT PANEL: BEDSIDE ACTIONS */}
                <aside className="w-80 flex flex-col gap-6">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-[40px] p-8 flex flex-col gap-4 h-full">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Bedside Directives</h3>
                        
                        <div className="space-y-3">
                            <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20">
                                <Activity className="h-4 w-4" />
                                Record Vitals
                            </button>
                            
                            <button className="w-full py-5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 text-emerald-500 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                                <Pill className="h-4 w-4" />
                                Administer Meds
                            </button>
                        </div>

                        <div className="h-[1px] bg-gray-800 my-6"></div>

                        <div className="space-y-3">
                            <button className="w-full py-5 bg-gray-800 hover:bg-gray-700 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                                <Beaker className="h-4 w-4" />
                                Request Lab
                            </button>
                            
                            <button className="w-full py-5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/30 text-purple-500 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                                <FileText className="h-4 w-4" />
                                View Care Plan
                            </button>
                        </div>

                        <div className="mt-auto pt-8 border-t border-gray-800">
                            <button className="w-full py-6 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-600/30 text-rose-500 rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl transition-all flex flex-col items-center gap-2">
                                <LogOut className="h-6 w-6" />
                                Discharge Patient
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

        </div>
    );
}
