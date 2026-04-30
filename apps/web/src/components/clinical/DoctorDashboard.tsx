'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, 
    Clock, 
    Stethoscope, 
    ClipboardList, 
    Pill, 
    Beaker, 
    Hospital, 
    Share2, 
    CheckCircle2,
    Timer,
    AlertCircle,
    ChevronRight,
    ArrowRightCircle,
    UserCircle2,
    FileText,
    History
} from 'lucide-react';
import Image from 'next/image';
import { getDynamicQueue, updateEncounterStatus } from '@/app/actions/queue-actions';

interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    mrn: string;
    priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
    waitTime: string;
    vitals: {
        temp: number;
        bp: string;
        hr: number;
        spo2: number;
    };
    triageNotes: string;
}

export default function DoctorDashboard() {
    const [queue, setQueue] = useState<any[]>([]);
    const [activePatient, setActivePatient] = useState<any | null>(null);
    const [consultTime, setConsultTime] = useState(0);
    const [activeTab, setActiveTab] = useState<'notes' | 'labs' | 'prescriptions'>('notes');

    useEffect(() => {
        const fetchQueue = async () => {
            const data = await getDynamicQueue(); // Can pass department here
            setQueue(data);
        };
        fetchQueue();
        const interval = setInterval(fetchQueue, 30000); // Polling every 30s
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        let interval: any;
        if (activePatient) {
            interval = setInterval(() => setConsultTime(t => t + 1), 1000);
        }
        return () => {
            clearInterval(interval);
            setConsultTime(0);
        };
    }, [activePatient]);

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const callNext = async () => {
        if (queue.length > 0) {
            const next = queue[0];
            await updateEncounterStatus(next.id, 'IN_PROGRESS');
            setActivePatient(next);
            setQueue(prev => prev.filter(p => p.id !== next.id));
        }
    };

    const completeVisit = async () => {
        if (!activePatient) return;
        await updateEncounterStatus(activePatient.id, 'COMPLETED');
        setActivePatient(null);
    };

    return (
        <div className="flex flex-col h-screen bg-[#07070a] text-white overflow-hidden">
            {/* TOP BAR */}
            <header className="h-20 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between px-8 shrink-0 backdrop-blur-xl z-20">
                <div className="flex items-center gap-6">
                    <Image src="/logo.png" alt="AmisiMedOS" width={40} height={40} className="object-contain" />
                    <div className="h-8 w-[1px] bg-gray-800"></div>
                    <h1 className="text-sm font-black uppercase tracking-[0.2em] text-blue-500">On-Duty: Doctor Mode</h1>
                </div>

                <div className="flex items-center gap-8">
                    {activePatient && (
                        <div className="flex items-center gap-3 px-6 py-2 rounded-2xl bg-blue-500/10 border border-blue-500/30 text-blue-400">
                            <Timer className="h-4 w-4" />
                            <span className="text-xl font-black font-mono">{formatTime(consultTime)}</span>
                        </div>
                    )}
                    <button 
                        onClick={callNext}
                        disabled={!!activePatient}
                        className={`px-10 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-xl flex items-center gap-3 ${
                            activePatient 
                            ? 'bg-gray-800 text-gray-500 cursor-not-allowed' 
                            : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20'
                        }`}
                    >
                        Call Next Patient
                        <ArrowRightCircle className="h-4 w-4" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden p-6 gap-6">
                {/* LEFT PANEL: QUEUE */}
                <aside className="w-80 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Waitlist Queue</h2>
                        <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full">{queue.length}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {queue.map((p, i) => (
                            <div 
                                key={p.id}
                                className={`w-full p-6 rounded-[32px] border transition-all relative overflow-hidden bg-gray-900/40 border-gray-800 ${i === 0 ? 'ring-2 ring-blue-500/30 bg-blue-500/5' : ''}`}
                            >
                                {i === 0 && (
                                    <div className="absolute top-0 right-0 bg-blue-600 text-[8px] font-black uppercase px-3 py-1 rounded-bl-xl tracking-widest">Recommended Next</div>
                                )}
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-black text-base truncate pr-4">{p.patient.firstName} {p.patient.lastName}</h3>
                                    <div className={`h-2 w-2 rounded-full mt-1 ${p.esiLevel <= 2 ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-emerald-500'}`}></div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                                    <span className="uppercase">{p.patient.gender} • {p.waitMinutes}m wait</span>
                                    <span className="font-black text-blue-400 uppercase tracking-widest">ESI {p.esiLevel || 5}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </aside>

                {/* CENTER PANEL: ACTIVE PATIENT */}
                <main className="flex-1 flex flex-col bg-gray-900/20 border border-gray-800 rounded-[48px] overflow-hidden">
                    {activePatient ? (
                        <>
                            {/* Patient Summary Banner */}
                            <div className="p-8 border-b border-gray-800 bg-gray-900/40">
                                <div className="flex items-center justify-between mb-8">
                                    <div className="flex items-center gap-6">
                                        <div className="h-16 w-16 rounded-3xl bg-blue-600 flex items-center justify-center font-black text-2xl shadow-2xl shadow-blue-900/40">
                                            {activePatient.patient.firstName[0]}
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-black uppercase tracking-tight">{activePatient.patient.firstName} {activePatient.patient.lastName}</h2>
                                            <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">{activePatient.patient.gender} • MRN: {activePatient.patient.mrn}</p>
                                        </div>
                                    </div>
                                    <div className="flex gap-4">
                                        {[
                                            { l: 'BP', v: `${activePatient.systolicBP || '--'}/${activePatient.diastolicBP || '--'}`, c: 'text-rose-400' },
                                            { l: 'HR', v: activePatient.pulse || '--', c: 'text-blue-400' },
                                            { l: 'TEMP', v: (activePatient.temperature || '--') + '°C', c: 'text-amber-400' },
                                            { l: 'SPO2', v: (activePatient.spo2 || '--') + '%', c: 'text-emerald-400' },
                                        ].map(v => (
                                            <div key={v.l} className="bg-black/40 border border-white/5 rounded-2xl px-6 py-3 flex flex-col items-center">
                                                <span className="text-[9px] font-black text-gray-600 uppercase mb-1 tracking-widest">{v.l}</span>
                                                <span className={`text-lg font-black ${v.c}`}>{v.v}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-blue-500/5 border border-blue-500/10 p-5 rounded-3xl flex items-start gap-4">
                                    <ClipboardList className="h-5 w-5 text-blue-500 shrink-0 mt-1" />
                                    <div>
                                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest block mb-1">Nursing Triage Notes</span>
                                        <p className="text-xs text-gray-400 leading-relaxed italic">{activePatient.triageNotes || 'No notes provided.'}</p>
                                    </div>
                                </div>
                            </div>

                            {/* Tabbed Workspace */}
                            <div className="flex-1 flex flex-col overflow-hidden">
                                <div className="flex border-b border-gray-800 px-8 pt-4 gap-8">
                                    {[
                                        { id: 'notes', label: 'Clinical Notes', icon: FileText },
                                        { id: 'labs', label: 'Lab Results', icon: Beaker },
                                        { id: 'prescriptions', label: 'Medications', icon: Pill },
                                    ].map(tab => (
                                        <button 
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`flex items-center gap-3 pb-4 text-[10px] font-black uppercase tracking-widest border-b-2 transition-all ${
                                                activeTab === tab.id ? 'border-blue-500 text-blue-500' : 'border-transparent text-gray-500 hover:text-white'
                                            }`}
                                        >
                                            <tab.icon className="h-4 w-4" />
                                            {tab.label}
                                        </button>
                                    ))}
                                </div>

                                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                                    {activeTab === 'notes' && (
                                        <div className="h-full flex flex-col gap-6">
                                            <div className="flex justify-between items-center">
                                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest">Assessment & Plan</h3>
                                                <button className="flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-widest hover:text-blue-300">
                                                    <History className="h-3 w-3" />
                                                    Previous Notes
                                                </button>
                                            </div>
                                            <textarea 
                                                className="flex-1 bg-black/20 border border-gray-800 rounded-[32px] p-8 text-sm leading-relaxed text-white outline-none focus:border-blue-500/50 transition-all resize-none font-medium"
                                                placeholder="Enter clinical findings, diagnosis, and treatment plan..."
                                            />
                                        </div>
                                    )}
                                    {activeTab === 'labs' && (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-700">
                                            <Beaker className="h-16 w-16 mb-4 opacity-20" />
                                            <p className="text-sm font-black uppercase">No pending results</p>
                                        </div>
                                    )}
                                    {activeTab === 'prescriptions' && (
                                        <div className="flex flex-col items-center justify-center h-full text-gray-700">
                                            <Pill className="h-16 w-16 mb-4 opacity-20" />
                                            <p className="text-sm font-black uppercase">No active prescriptions</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-12">
                            <div className="h-24 w-24 rounded-full bg-blue-600/5 flex items-center justify-center mb-8">
                                <Stethoscope className="h-12 w-12 text-blue-500/40" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Room Available</h2>
                            <p className="text-gray-600 text-sm max-w-xs">Ready to receive the next patient from the triage queue.</p>
                        </div>
                    )}
                </main>

                {/* RIGHT PANEL: ACTIONS */}
                <aside className="w-80 flex flex-col gap-6">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-[40px] p-8 flex flex-col gap-4">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Directives</h3>
                        
                        <button className="w-full py-5 bg-blue-600 hover:bg-blue-500 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-xl shadow-blue-900/20">
                            <Pill className="h-4 w-4" />
                            Prescribe Meds
                        </button>
                        
                        <button className="w-full py-5 bg-gray-800 hover:bg-gray-700 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                            <Beaker className="h-4 w-4" />
                            Order Lab Test
                        </button>

                        <div className="h-[1px] bg-gray-800 my-4"></div>

                        <button className="w-full py-5 bg-amber-600/10 hover:bg-amber-600/20 border border-amber-600/30 text-amber-500 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                            <Hospital className="h-4 w-4" />
                            Admit to Ward
                        </button>

                        <button className="w-full py-5 bg-purple-600/10 hover:bg-purple-600/20 border border-purple-600/30 text-purple-500 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                            <Share2 className="h-4 w-4" />
                            Refer Patient
                        </button>

                        <div className="mt-8 pt-8 border-t border-gray-800">
                            <button 
                                onClick={completeVisit}
                                disabled={!activePatient}
                                className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex flex-col items-center gap-2 shadow-2xl ${
                                    activePatient 
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40' 
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                }`}
                            >
                                <CheckCircle2 className="h-6 w-6" />
                                Complete Visit
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Emergency Pop-up Overlay (Mock) */}
            <AnimatePresence>
                {false && ( // Set to true to test
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                        className="fixed inset-0 z-50 bg-rose-950/80 backdrop-blur-md flex items-center justify-center p-8"
                    >
                        <div className="bg-gray-900 border-4 border-rose-600 rounded-[56px] p-12 max-w-2xl w-full shadow-[0_0_100px_rgba(225,29,72,0.4)] text-center">
                            <div className="h-24 w-24 rounded-full bg-rose-600 flex items-center justify-center mx-auto mb-8 animate-pulse">
                                <AlertCircle className="h-12 w-12 text-white" />
                            </div>
                            <h2 className="text-4xl font-black uppercase tracking-tight text-white mb-4 italic">Emergency Override</h2>
                            <p className="text-rose-400 font-bold uppercase tracking-widest text-sm mb-8">Red Alert: Patient Arrest in Triage</p>
                            <div className="bg-black/40 p-8 rounded-[32px] border border-rose-600/20 mb-10">
                                <h3 className="text-2xl font-black text-white mb-1">David G. Miller</h3>
                                <p className="text-rose-500 font-black tracking-widest uppercase text-[10px]">ESI Level 1 • Room 4</p>
                            </div>
                            <button className="w-full py-6 bg-rose-600 hover:bg-rose-500 text-white rounded-3xl font-black uppercase tracking-[0.2em] shadow-2xl transition-all">Accept Emergency Case</button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
