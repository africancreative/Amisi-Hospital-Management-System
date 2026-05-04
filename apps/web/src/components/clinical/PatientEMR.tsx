'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    User, 
    History,
    FileText, 
    Beaker, 
    Pill, 
    Plus, 
    Search, 
    ChevronRight, 
    Calendar, 
    Activity, 
    AlertCircle,
    Save,
    Clock,
    Lock,
    Share2,
    CheckCircle2 as CheckIcon
} from 'lucide-react';
import { useAuth } from '@/lib/auth';
import Image from 'next/image';
import { EncounterChatSidebar } from '../chat/EncounterChatSidebar';
import { MedicalTimeline } from './MedicalTimeline';
import { TimelineEvent } from '@/lib/timeline-types';

interface ClinicalEvent {
    id: string;
    type: 'VISIT' | 'LAB' | 'PRESCRIPTION' | 'NOTE';
    date: string;
    title: string;
    description: string;
    author: string;
}

export default function PatientEMR({ patientId = 'demo-patient-1' }: { patientId?: string }) {
    const [activeTab, setActiveTab] = useState<'history' | 'notes' | 'labs' | 'prescriptions'>('history');
    const [isSaving, setIsSaving] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<TimelineEvent | null>(null);

    // Active Encounter for Chat Context
    const [activeEncounterId, setActiveEncounterId] = useState<string | null>('demo-encounter-id');
    const { token, user } = useAuth();

    const handleSaveNote = () => {
        setIsSaving(true);
        setTimeout(() => setIsSaving(false), 1500);
    };

    return (
        <div className="flex flex-col h-screen bg-[#07070a] text-white overflow-hidden">
            {/* PATIENT BANNER */}
            <header className="h-28 bg-gray-900/60 border-b border-gray-800 flex items-center px-10 gap-10 shrink-0 backdrop-blur-2xl z-20">
                <div className="h-16 w-16 rounded-[24px] bg-blue-600 flex items-center justify-center text-2xl font-black shadow-2xl shadow-blue-900/40">
                    RJ
                </div>
                <div className="flex-1">
                    <div className="flex items-center gap-4 mb-1">
                        <h1 className="text-2xl font-black tracking-tight">Robert Johnson</h1>
                        <span className="bg-rose-500/10 text-rose-500 text-[10px] font-black uppercase px-3 py-1 rounded-full border border-rose-500/20 flex items-center gap-2">
                            <AlertCircle className="h-3 w-3" /> Penicillin Allergy
                        </span>
                    </div>
                    <div className="flex items-center gap-6 text-xs font-bold text-gray-500 uppercase tracking-widest">
                        <span>52 Years • Male</span>
                        <div className="h-3 w-[1px] bg-gray-800"></div>
                        <span>MRN: AM-4521</span>
                        <div className="h-3 w-[1px] bg-gray-800"></div>
                        <span className="text-emerald-500">Status: Active Management</span>
                    </div>
                </div>

                <div className="flex gap-3">
                    <button className="bg-blue-600 hover:bg-blue-500 px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center gap-3 transition-all shadow-xl shadow-blue-900/20">
                        <Plus className="h-4 w-4" /> New Encounter
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden p-6 gap-6">
                {/* LEFT: UNIFIED MEDICAL TIMELINE */}
                <aside className="w-96 flex flex-col bg-gray-900/20 border border-gray-800 rounded-[48px] overflow-hidden">
                    <MedicalTimeline
                        patientId={patientId}
                        onEventSelect={setSelectedEvent}
                    />
                </aside>

                {/* CENTER: TABBED WORKSPACE */}
                <main className="flex-1 flex flex-col bg-gray-900/20 border border-gray-800 rounded-[48px] overflow-hidden relative">
                    {/* TABS HEADER */}
                    <div className="flex border-b border-gray-800 bg-gray-900/40 p-2">
                        {[
                            { id: 'history', label: 'Clinical Summary', icon: Activity },
                            { id: 'notes', label: 'Consult Notes', icon: FileText },
                            { id: 'labs', label: 'Lab Reports', icon: Beaker },
                            { id: 'prescriptions', label: 'Medications', icon: Pill },
                        ].map((tab: any) => (
                            <button 
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as any)}
                                className={`flex-1 flex items-center justify-center gap-3 py-5 rounded-[24px] text-[10px] font-black uppercase tracking-widest transition-all ${
                                    activeTab === tab.id 
                                    ? 'bg-blue-600 text-white shadow-xl shadow-blue-900/20' 
                                    : 'text-gray-500 hover:text-white hover:bg-white/5'
                                }`}
                            >
                                <tab.icon className="h-4 w-4" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* CONTENT AREA */}
                    <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                        <AnimatePresence mode="wait">
                            {activeTab === 'history' && (
                                <motion.div 
                                    key="history" 
                                    initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }}
                                    className="space-y-10"
                                >
                                    <section>
                                        <h3 className="text-xs font-black text-blue-500 uppercase tracking-widest mb-6">Longitudinal Diagnosis</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            {['Essential Hypertension (I10)', 'Type 2 Diabetes (E11.9)', 'Hyperlipidemia (E78.5)'].map((dx: any) => (
                                                <div key={dx} className="bg-gray-900/60 border border-white/5 p-6 rounded-3xl flex items-center justify-between group">
                                                    <span className="text-sm font-bold text-gray-300">{dx}</span>
                                                    <span className="text-[8px] font-black bg-blue-600/10 text-blue-500 px-3 py-1 rounded-full border border-blue-500/20 uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Active</span>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                    
                                    <section>
                                        <h3 className="text-xs font-black text-emerald-500 uppercase tracking-widest mb-6">Current Care Plan</h3>
                                        <div className="bg-emerald-600/5 border border-emerald-500/20 p-8 rounded-[40px] relative overflow-hidden">
                                            <div className="absolute top-0 right-0 p-6 opacity-10"><Activity className="h-24 w-24" /></div>
                                            <p className="text-base text-gray-300 leading-relaxed font-bold italic">
                                                "Maintain BP below 130/80. Monitor fasting glucose weekly. Low sodium diet emphasized. Next review in 3 months with Lipid Panel."
                                            </p>
                                            <div className="mt-8 flex items-center gap-4">
                                                <div className="h-10 w-10 rounded-xl bg-emerald-600 flex items-center justify-center font-black">SW</div>
                                                <div>
                                                    <span className="text-[10px] font-black text-emerald-500 uppercase block tracking-widest">Last Review</span>
                                                    <span className="text-xs font-bold text-gray-500">Dr. Sarah Wilson • 15 Apr 2024</span>
                                                </div>
                                            </div>
                                        </div>
                                    </section>
                                </motion.div>
                            )}

                            {activeTab === 'notes' && (
                                <motion.div 
                                    key="notes" 
                                    initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                                    className="h-full flex flex-col"
                                >
                                    <div className="flex-1 bg-black/40 border border-white/5 rounded-[40px] p-10 flex flex-col relative group">
                                        <div className="flex items-center justify-between mb-8 text-gray-500">
                                            <div className="flex items-center gap-3">
                                                <FileText className="h-5 w-5 text-blue-500" />
                                                <span className="text-xs font-black uppercase tracking-widest">SOAP Consultation Note</span>
                                            </div>
                                            <span className="text-[10px] font-mono tracking-widest uppercase flex items-center gap-2">
                                                <Clock className="h-3 w-3" /> Auto-Saving...
                                            </span>
                                        </div>
                                        <textarea 
                                            placeholder="Start typing SOAP note or clinical observations... (Max 3 actions to finalize)"
                                            className="flex-1 bg-transparent border-none focus:ring-0 text-lg font-bold leading-relaxed placeholder:text-gray-800 resize-none"
                                        />
                                        <div className="mt-8 pt-8 border-t border-white/5 flex items-center justify-between">
                                            <div className="flex gap-4">
                                                <button className="bg-white/5 hover:bg-white/10 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">Add Template</button>
                                                <button className="bg-white/5 hover:bg-white/10 px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 transition-all">Add Vitals</button>
                                            </div>
                                            <button 
                                                onClick={handleSaveNote}
                                                className={`px-10 py-4 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex items-center gap-3 shadow-2xl ${
                                                    isSaving ? 'bg-emerald-600 text-white' : 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40'
                                                }`}
                                            >
                                                {isSaving ? (
                                                    <><CheckCircle2 className="h-4 w-4 animate-bounce" /> Note Saved</>
                                                ) : (
                                                    <><Save className="h-4 w-4" /> Sign & Lock Note</>
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>

                {/* RIGHT: CONTEXT CHAT SIDEBAR */}
                {activeEncounterId && (
                    <aside className="w-80 flex flex-col bg-gray-900/20 border border-gray-800 rounded-[48px] overflow-hidden">
                        <EncounterChatSidebar encounterId={activeEncounterId} />
                    </aside>
                )}
            </div>

        </div>
    );
}

function CheckCircle2(props: any) {
    return (
        <svg
            {...props}
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        >
            <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    )
}
