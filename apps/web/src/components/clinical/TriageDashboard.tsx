'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Activity, 
    Clock, 
    ChevronRight, 
    Plus, 
    Minus, 
    AlertCircle,
    ArrowRightCircle,
    UserCircle2,
    CheckCircle2,
    Timer,
    AlertTriangle,
    Stethoscope,
    Flame,
    Wind,
    Skull,
    Thermometer,
    Droplets,
    Heart,
    Beaker
} from 'lucide-react';
import Image from 'next/image';
import { saveTriageIntake } from '@/app/actions/queue-actions';

interface Patient {
    id: string;
    name: string;
    age: number;
    gender: string;
    arrivalAt: string;
    mrn: string;
    status: 'WAITING' | 'IN_INTAKE' | 'READY';
}

export default function TriageDashboard() {
    const [queue, setQueue] = useState<Patient[]>([
        { id: 'AM-2023-4521', name: 'Jane Doe', age: 28, gender: 'F', arrivalAt: '09:12 AM', mrn: 'AM-2023-4521', status: 'WAITING' },
        { id: 'AM-2023-4522', name: 'John Smith', age: 45, gender: 'M', arrivalAt: '09:25 AM', mrn: 'AM-2023-4522', status: 'WAITING' },
        { id: 'AM-2023-4523', name: 'Sarah Lee', age: 19, gender: 'F', arrivalAt: '09:30 AM', mrn: 'AM-2023-4523', status: 'WAITING' },
    ]);

    const [selectedPatient, setSelectedPatient] = useState<Patient | null>(queue[0]);
    const [intakeTimer, setIntakeTimer] = useState(0);
    
    // Intake State
    const [symptoms, setSymptoms] = useState<string[]>([]);
    const [vitals, setVitals] = useState({
        bp_sys: 120,
        bp_dia: 80,
        hr: 72,
        temp: 36.5,
        spo2: 98
    });
    const [risks, setRisks] = useState<string[]>([]);
    const [esiLevel, setEsiLevel] = useState<number | null>(null);

    useEffect(() => {
        let interval: any;
        if (selectedPatient) {
            interval = setInterval(() => setIntakeTimer(t => t + 1), 1000);
        }
        return () => {
            clearInterval(interval);
            setIntakeTimer(0);
        };
    }, [selectedPatient]);

    const toggleItem = (list: string[], setList: (l: string[]) => void, item: string) => {
        if (list.includes(item)) setList(list.filter(i => i !== item));
        else setList([...list, item]);
    };

    const handleSave = async (route: 'OPD' | 'EMERGENCY' | 'FAST_TRACK') => {
        if (!selectedPatient) return;
        
        await saveTriageIntake(selectedPatient.id, {
            vitals: {
                temp: vitals.temp,
                sys: vitals.bp_sys,
                dia: vitals.bp_dia,
                pulse: vitals.hr,
                spo2: vitals.spo2
            },
            symptoms,
            risks,
            esiLevel: esiLevel || undefined,
            route
        });

        // Remove from local queue for immediate feedback
        setQueue(prev => prev.filter(p => p.id !== selectedPatient.id));
        setSelectedPatient(null);
    };

    const updateVital = (key: keyof typeof vitals, delta: number) => {
        setVitals(prev => ({ ...prev, [key]: Number((prev[key] + delta).toFixed(1)) }));
    };

    const isCritical = (key: string, val: number) => {
        if (key === 'bp_sys' && val >= 160) return true;
        if (key === 'temp' && (val >= 39 || val <= 35)) return true;
        if (key === 'spo2' && val < 92) return true;
        if (key === 'hr' && (val >= 120 || val <= 45)) return true;
        return false;
    };

    const formatTime = (sec: number) => {
        const m = Math.floor(sec / 60);
        const s = sec % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex flex-col h-screen bg-[#07070a] text-white overflow-hidden">
            {/* TOP BAR */}
            <header className="h-20 bg-gray-900/60 border-b border-gray-800 flex items-center justify-between px-8 shrink-0">
                <div className="flex items-center gap-6">
                    <Image src="/logo.png" alt="AmisiMedOS" width={40} height={40} className="object-contain" />
                    <div className="h-8 w-[1px] bg-gray-800"></div>
                    <h1 className="text-sm font-black uppercase tracking-[0.2em] text-blue-500">On-Duty: Triage Mode</h1>
                </div>

                <div className="flex items-center gap-8">
                    <div className={`flex items-center gap-3 px-6 py-2 rounded-2xl border ${intakeTimer > 120 ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-blue-500/10 border-blue-500/30 text-blue-400'}`}>
                        <Timer className="h-4 w-4" />
                        <span className="text-xl font-black font-mono tracking-tighter">{formatTime(intakeTimer)}</span>
                    </div>
                    <button 
                        className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-900/20 flex items-center gap-3"
                        onClick={() => {
                            const idx = queue.findIndex(p => p.id === selectedPatient?.id);
                            if (idx < queue.length - 1) setSelectedPatient(queue[idx+1]);
                        }}
                    >
                        Next Patient
                        <ArrowRightCircle className="h-4 w-4" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden p-6 gap-6">
                {/* LEFT PANEL: QUEUE */}
                <aside className="w-80 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Incoming Queue</h2>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {queue.map(p => (
                            <button 
                                key={p.id}
                                onClick={() => setSelectedPatient(p)}
                                className={`w-full p-6 rounded-[32px] border transition-all text-left relative overflow-hidden ${
                                    selectedPatient?.id === p.id 
                                    ? 'bg-blue-600/10 border-blue-500/50 ring-2 ring-blue-500/20' 
                                    : 'bg-gray-900/40 border-gray-800'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-black text-base truncate pr-8">{p.name}</h3>
                                    <span className="text-[9px] font-black text-gray-600 font-mono">{p.arrivalAt}</span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-bold text-gray-500 uppercase">{p.id}</span>
                                    <div className="flex items-center gap-1.5">
                                        <div className={`h-1.5 w-1.5 rounded-full ${p.status === 'WAITING' ? 'bg-amber-500' : 'bg-emerald-500'}`}></div>
                                        <span className="text-[9px] font-black uppercase text-gray-400">{p.status.replace('_', ' ')}</span>
                                    </div>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* CENTER PANEL: ACTIVE INTAKE */}
                <main className="flex-1 flex flex-col bg-gray-900/20 border border-gray-800 rounded-[48px] overflow-hidden">
                    <div className="flex-1 overflow-y-auto p-10 space-y-12 custom-scrollbar">
                        {/* SECTION 1: BASIC INFO */}
                        <section>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <UserCircle2 className="h-3 w-3" /> Section 1: Basic Info
                            </h3>
                            <div className="grid grid-cols-4 gap-6">
                                <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-3xl">
                                    <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">Full Name</span>
                                    <p className="text-lg font-black">{selectedPatient?.name}</p>
                                </div>
                                <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-3xl">
                                    <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">Age</span>
                                    <p className="text-lg font-black">{selectedPatient?.age} YRS</p>
                                </div>
                                <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-3xl">
                                    <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">Gender</span>
                                    <p className="text-lg font-black">{selectedPatient?.gender === 'F' ? 'Female' : 'Male'}</p>
                                </div>
                                <div className="bg-blue-600/10 border border-blue-500/20 p-6 rounded-3xl">
                                    <span className="text-[9px] font-black text-blue-500 uppercase block mb-1">Patient ID</span>
                                    <p className="text-lg font-black font-mono tracking-tighter text-blue-400">{selectedPatient?.id}</p>
                                </div>
                            </div>
                        </section>

                        {/* SECTION 2: QUICK SYMPTOMS (TAP-BASED) */}
                        <section>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Stethoscope className="h-3 w-3" /> Section 2: Quick Symptoms
                            </h3>
                            <div className="grid grid-cols-5 gap-4">
                                {[
                                    { id: 'Fever', icon: Flame },
                                    { id: 'Pain', icon: AlertCircle },
                                    { id: 'Cough', icon: Wind },
                                    { id: 'Injury', icon: AlertTriangle },
                                    { id: 'Other', icon: Plus },
                                ].map(s => (
                                    <button 
                                        key={s.id}
                                        onClick={() => toggleItem(symptoms, setSymptoms, s.id)}
                                        className={`py-6 rounded-3xl border transition-all flex flex-col items-center gap-3 ${
                                            symptoms.includes(s.id) 
                                            ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40' 
                                            : 'bg-gray-900/40 border-gray-800 text-gray-500 hover:border-gray-700'
                                        }`}
                                    >
                                        <s.icon className="h-6 w-6" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">{s.id}</span>
                                    </button>
                                ))}
                            </div>
                        </section>

                        {/* SECTION 3: VITAL SIGNS */}
                        <section>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <Activity className="h-3 w-3" /> Section 3: Vital Signs
                            </h3>
                            <div className="grid grid-cols-2 gap-6">
                                {[
                                    { id: 'bp_sys', label: 'Blood Pressure (Sys)', unit: 'mmHg', val: vitals.bp_sys, step: 5, icon: Activity },
                                    { id: 'hr', label: 'Pulse Rate', unit: 'bpm', val: vitals.hr, step: 2, icon: Heart },
                                    { id: 'temp', label: 'Temperature', unit: '°C', val: vitals.temp, step: 0.1, icon: Thermometer },
                                    { id: 'spo2', label: 'Oxygen Level', unit: '%', val: vitals.spo2, step: 1, icon: Droplets },
                                ].map(v => (
                                    <div key={v.id} className={`p-8 rounded-[40px] border transition-all flex flex-col gap-6 relative overflow-hidden ${isCritical(v.id, v.val) ? 'bg-rose-500/10 border-rose-500/40' : 'bg-gray-900/60 border-gray-800'}`}>
                                        <div className="flex justify-between items-center">
                                            <span className={`text-[10px] font-black uppercase tracking-widest ${isCritical(v.id, v.val) ? 'text-rose-500' : 'text-gray-500'}`}>{v.label}</span>
                                            {isCritical(v.id, v.val) && <AlertCircle className="h-4 w-4 text-rose-500 animate-pulse" />}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <button onClick={() => updateVital(v.id as any, -v.step)} className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all"><Minus className="h-6 w-6" /></button>
                                            <div className="text-center">
                                                <span className={`text-6xl font-black tracking-tighter ${isCritical(v.id, v.val) ? 'text-rose-500' : 'text-white'}`}>{v.val}</span>
                                                <span className="text-xs font-bold text-gray-600 ml-2 uppercase">{v.unit}</span>
                                            </div>
                                            <button onClick={() => updateVital(v.id as any, v.step)} className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center hover:bg-white/10 active:scale-90 transition-all"><Plus className="h-6 w-6" /></button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </section>

                        {/* SECTION 4: RISK FLAGS */}
                        <section>
                            <h3 className="text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                                <AlertTriangle className="h-3 w-3" /> Section 4: Risk Flags
                            </h3>
                            <div className="grid grid-cols-4 gap-4">
                                {[
                                    { id: 'Breathing', label: 'Difficulty Breathing', icon: Wind },
                                    { id: 'Severe Pain', label: 'Severe Pain', icon: AlertCircle },
                                    { id: 'Bleeding', label: 'Active Bleeding', icon: Droplets },
                                    { id: 'Unconscious', label: 'Unconscious', icon: Skull },
                                ].map(r => (
                                    <button 
                                        key={r.id}
                                        onClick={() => toggleItem(risks, setRisks, r.id)}
                                        className={`p-6 rounded-3xl border transition-all flex flex-col items-center gap-3 text-center ${
                                            risks.includes(r.id) 
                                            ? 'bg-rose-600 border-rose-500 text-white shadow-lg shadow-rose-900/40' 
                                            : 'bg-gray-900/40 border-gray-800 text-gray-500 hover:border-gray-700'
                                        }`}
                                    >
                                        <r.icon className="h-5 w-5" />
                                        <span className="text-[9px] font-black uppercase leading-tight">{r.label}</span>
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>
                </main>

                {/* RIGHT PANEL: QUEUE CONTROL */}
                <aside className="w-80 flex flex-col gap-6">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-[40px] p-8 flex flex-col gap-4">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Queue Control</h3>
                        
                        <div className="space-y-3">
                            <button 
                                onClick={() => handleSave('OPD')}
                                className="w-full py-6 bg-blue-600 hover:bg-blue-500 rounded-3xl font-black text-xs uppercase tracking-widest transition-all flex flex-col items-center gap-2 shadow-xl shadow-blue-900/20"
                            >
                                <Stethoscope className="h-5 w-5" />
                                Ready for Doctor
                            </button>

                            <button className="w-full py-5 bg-gray-800 hover:bg-gray-700 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                                <Beaker className="h-4 w-4" />
                                Send to Lab
                            </button>
                        </div>

                        <div className="h-[1px] bg-gray-800 my-4"></div>

                        <div className="space-y-3">
                            <h4 className="text-[9px] font-black text-gray-600 uppercase tracking-widest mb-2 px-2">Assign Department</h4>
                            <div className="grid grid-cols-2 gap-2">
                                {['General', 'Pediatrics', 'Gynae', 'Dental'].map(dept => (
                                    <button key={dept} className="py-3 bg-white/5 border border-white/5 rounded-xl text-[9px] font-black uppercase hover:bg-white/10 transition-all">
                                        {dept}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-8 pt-8 border-t border-gray-800">
                            <button 
                                onClick={() => handleSave('EMERGENCY')}
                                className="w-full py-6 bg-rose-600 hover:bg-rose-500 text-white rounded-3xl font-black text-xs uppercase tracking-widest shadow-2xl shadow-rose-900/40 transition-all"
                            >
                                ESCALATE TO ER
                            </button>
                        </div>
                    </div>

                    <div className="bg-blue-600/5 border border-blue-500/10 p-8 rounded-[40px]">
                        <h4 className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4">Suggested Priority</h4>
                        <div className="flex items-center gap-4">
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center font-black text-xl ${risks.length > 0 || isCritical('bp_sys', vitals.bp_sys) ? 'bg-rose-500 text-white' : 'bg-amber-500 text-white'}`}>
                                {risks.length > 0 || isCritical('bp_sys', vitals.bp_sys) ? '2' : '3'}
                            </div>
                            <div>
                                <p className="text-xs font-black uppercase text-white">{risks.length > 0 ? 'Urgent Assessment' : 'Standard Priority'}</p>
                                <p className="text-[10px] font-medium text-gray-500">Based on vital analysis</p>
                            </div>
                        </div>
                    </div>
                </aside>
            </div>

        </div>
    );
}
