'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Users, 
    UserPlus, 
    Stethoscope, 
    Activity, 
    Clock, 
    AlertCircle, 
    ChevronRight,
    ArrowRightCircle,
    CheckCircle2
} from 'lucide-react';
import { registerAndCheckIn, updateEncounterStatus, getActiveQueue } from '@/app/actions/queue-actions';

interface QueueItem {
    id: string;
    queueNumber: string;
    priority: string;
    status: string;
    department: string;
    createdAt: Date;
    patient: {
        firstName: string;
        lastName: string;
        mrn: string;
    };
}

export default function QueueDashboard() {
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [showRegister, setShowRegister] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchQueue();
        const interval = setInterval(fetchQueue, 5000); // Poll every 5s for demo (real-time hub would be better)
        return () => clearInterval(interval);
    }, []);

    const fetchQueue = async () => {
        const data = await getActiveQueue();
        setQueue(data as any);
        setLoading(false);
    };

    const handleCallNext = async (doctorId: string, doctorName: string) => {
        // Find highest priority patient who is TRIAGED
        const next = queue.find((q: any) => q.status === 'TRIAGED');
        if (next) {
            await updateEncounterStatus(next.id, 'IN_PROGRESS', doctorId, doctorName);
            fetchQueue();
        }
    };

    const getStatusConfig = (status: string, priority: string) => {
        if (priority === 'EMERGENCY') return { bg: 'bg-rose-500/10', border: 'border-rose-500/30', text: 'text-rose-500', label: 'EMERGENCY', icon: AlertCircle };
        
        switch (status) {
            case 'CHECKED_IN': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', label: 'WAITING', icon: Clock };
            case 'TRIAGED': return { bg: 'bg-amber-500/10', border: 'border-amber-500/30', text: 'text-amber-500', label: 'TRIAGED', icon: Activity };
            case 'IN_PROGRESS': return { bg: 'bg-blue-500/10', border: 'border-blue-500/30', text: 'text-blue-500', label: 'IN CONSULTATION', icon: Stethoscope };
            case 'COMPLETED': return { bg: 'bg-emerald-500/10', border: 'border-emerald-500/30', text: 'text-emerald-500', label: 'COMPLETED', icon: CheckCircle2 };
            default: return { bg: 'bg-gray-500/10', border: 'border-gray-500/30', text: 'text-gray-500', label: 'UNKNOWN', icon: Users };
        }
    };

    return (
        <div className="flex flex-col h-full bg-[#07070a] text-white p-8">
            {/* Header / Stats */}
            <header className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black tracking-tighter uppercase flex items-center gap-3">
                        <Users className="h-8 w-8 text-blue-500" />
                        Live Queue Management
                    </h1>
                    <p className="text-gray-500 text-sm font-medium mt-1">Real-time patient flow monitoring</p>
                </div>

                <div className="flex gap-4">
                    <button 
                        onClick={() => setShowRegister(true)}
                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20"
                    >
                        <UserPlus className="h-5 w-5" />
                        Express Registration
                    </button>
                    
                    <div className="bg-gray-900/50 border border-gray-800 rounded-2xl px-6 py-3 flex items-center gap-4">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Active Patients</span>
                            <span className="text-xl font-black">{queue.length}</span>
                        </div>
                        <div className="w-[1px] h-8 bg-gray-800"></div>
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black text-rose-500 uppercase tracking-widest">Emergencies</span>
                            <span className="text-xl font-black text-rose-500">{queue.filter((q: any) => q.priority === 'EMERGENCY').length}</span>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Grid */}
            <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
                {/* Left Side: The Board */}
                <section className="col-span-8 flex flex-col gap-6 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="grid grid-cols-2 gap-6">
                        <AnimatePresence mode="popLayout">
                            {queue.map((item: any) => {
                                const config = getStatusConfig(item.status, item.priority);
                                return (
                                    <motion.div
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className={`p-6 rounded-3xl border ${config.bg} ${config.border} flex flex-col gap-4 relative overflow-hidden group hover:scale-[1.02] transition-transform`}
                                    >
                                        <div className="flex justify-between items-start">
                                            <div className="flex flex-col">
                                                <span className={`text-[10px] font-black uppercase tracking-widest ${config.text} flex items-center gap-2`}>
                                                    <config.icon className="h-3 w-3" />
                                                    {config.label}
                                                </span>
                                                <h3 className="text-2xl font-black mt-2 tracking-tight">
                                                    {item.patient.firstName} {item.patient.lastName}
                                                </h3>
                                                <span className="text-gray-500 text-xs font-mono uppercase mt-1">{item.patient.mrn}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-3xl font-black text-white/90 font-mono tracking-tighter bg-black/40 px-4 py-2 rounded-2xl border border-white/5">
                                                    #{item.queueNumber}
                                                </span>
                                                <span className="text-[10px] font-black text-gray-500 uppercase mt-2">{item.department}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between mt-2 pt-4 border-t border-white/5">
                                            <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold">
                                                <Clock className="h-3 w-3" />
                                                WAITING: {Math.floor((Date.now() - new Date(item.createdAt).getTime()) / 60000)} MINS
                                            </div>
                                            
                                            <div className="flex gap-2">
                                                {item.status === 'CHECKED_IN' && (
                                                    <button 
                                                        onClick={() => updateEncounterStatus(item.id, 'TRIAGED')}
                                                        className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                                                    >
                                                        Start Triage
                                                    </button>
                                                )}
                                                {item.status === 'TRIAGED' && (
                                                    <button 
                                                        onClick={() => handleCallNext('DOC-1', 'Dr. Smith')}
                                                        className="bg-blue-600 hover:bg-blue-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all flex items-center gap-2"
                                                    >
                                                        Call to Consultation
                                                        <ChevronRight className="h-3 w-3" />
                                                    </button>
                                                )}
                                                {item.status === 'IN_PROGRESS' && (
                                                    <button 
                                                        onClick={() => updateEncounterStatus(item.id, 'COMPLETED')}
                                                        className="bg-emerald-600 hover:bg-emerald-500 px-4 py-2 rounded-xl text-[10px] font-black uppercase transition-all"
                                                    >
                                                        Finish Visit
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        {/* Background Glow */}
                                        <div className={`absolute -right-8 -top-8 w-24 h-24 blur-[60px] rounded-full ${config.bg} opacity-50`}></div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </section>

                {/* Right Side: Public Board / Triage Info */}
                <aside className="col-span-4 flex flex-col gap-6">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-3xl p-8 flex flex-col gap-6 h-full">
                        <div className="flex items-center gap-3 border-b border-gray-800 pb-6">
                            <ArrowRightCircle className="h-6 w-6 text-blue-500" />
                            <h2 className="text-xl font-black uppercase tracking-tight">Now Calling</h2>
                        </div>
                        
                        <div className="flex-1 space-y-6 overflow-y-auto">
                            {queue.filter((q: any) => q.status === 'IN_PROGRESS').map((item: any) => (
                                <motion.div 
                                    initial={{ x: 20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="bg-blue-500/10 border border-blue-500/20 p-6 rounded-2xl flex items-center justify-between"
                                    key={item.id}
                                >
                                    <div className="flex flex-col">
                                        <span className="text-3xl font-black font-mono text-blue-400">#{item.queueNumber}</span>
                                        <span className="text-sm font-bold text-white/80 mt-1 uppercase truncate max-w-[150px]">{item.patient.firstName}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block">Go to</span>
                                        <span className="text-lg font-black text-white uppercase">{item.department}</span>
                                    </div>
                                </motion.div>
                            ))}

                            {queue.filter((q: any) => q.status === 'IN_PROGRESS').length === 0 && (
                                <div className="h-full flex flex-col items-center justify-center text-center opacity-30 grayscale py-20">
                                    <Users className="h-12 w-12 mb-4" />
                                    <p className="text-sm font-bold uppercase tracking-widest">No Active Consultations</p>
                                </div>
                            )}
                        </div>

                        <div className="pt-6 border-t border-gray-800">
                             <div className="bg-black/60 p-4 rounded-2xl border border-white/5 flex items-center justify-between">
                                <span className="text-xs font-bold text-gray-500 uppercase">Estimated Wait</span>
                                <span className="text-lg font-black text-amber-500 font-mono">~15 MINS</span>
                             </div>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Registration Modal (Partial Implementation for Demo) */}
            <AnimatePresence>
                {showRegister && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-8"
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="bg-gray-900 border border-gray-800 rounded-[40px] p-12 max-w-2xl w-full shadow-2xl relative overflow-hidden"
                        >
                            <h2 className="text-3xl font-black uppercase tracking-tight mb-8 flex items-center gap-4">
                                <UserPlus className="h-8 w-8 text-blue-500" />
                                Express Check-In
                            </h2>

                            <form className="space-y-6" onSubmit={async (e) => {
                                e.preventDefault();
                                const fd = new FormData(e.currentTarget);
                                await registerAndCheckIn({
                                    firstName: fd.get('firstName') as string,
                                    lastName: fd.get('lastName') as string,
                                    dob: fd.get('dob') as string,
                                    gender: fd.get('gender') as string,
                                    department: fd.get('department') as string,
                                    priority: fd.get('priority') as any,
                                });
                                setShowRegister(false);
                                fetchQueue();
                            }}>
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">First Name</label>
                                        <input name="firstName" required className="w-full bg-black border border-gray-800 rounded-2xl px-6 py-4 text-sm focus:border-blue-500 outline-none transition-all" placeholder="John" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Last Name</label>
                                        <input name="lastName" required className="w-full bg-black border border-gray-800 rounded-2xl px-6 py-4 text-sm focus:border-blue-500 outline-none transition-all" placeholder="Doe" />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Date of Birth</label>
                                        <input name="dob" type="date" required className="w-full bg-black border border-gray-800 rounded-2xl px-6 py-4 text-sm focus:border-blue-500 outline-none transition-all" />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Priority</label>
                                        <select name="priority" className="w-full bg-black border border-gray-800 rounded-2xl px-6 py-4 text-sm focus:border-blue-500 outline-none transition-all appearance-none">
                                            <option value="NORMAL">NORMAL</option>
                                            <option value="URGENT">URGENT</option>
                                            <option value="EMERGENCY">EMERGENCY</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="space-y-2">
                                    <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Route to Department</label>
                                    <select name="department" className="w-full bg-black border border-gray-800 rounded-2xl px-6 py-4 text-sm focus:border-blue-500 outline-none transition-all appearance-none">
                                        <option value="OPD">OUTPATIENT (OPD)</option>
                                        <option value="ER">EMERGENCY (ER)</option>
                                        <option value="LAB">LABORATORY</option>
                                        <option value="RADIOLOGY">RADIOLOGY</option>
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button 
                                        type="button"
                                        onClick={() => setShowRegister(false)}
                                        className="flex-1 py-4 rounded-2xl border border-gray-800 font-bold hover:bg-white/5 transition-all uppercase text-xs"
                                    >
                                        Cancel
                                    </button>
                                    <button 
                                        type="submit"
                                        className="flex-1 py-4 rounded-2xl bg-blue-600 hover:bg-blue-500 text-white font-bold transition-all uppercase text-xs shadow-lg shadow-blue-900/20"
                                    >
                                        Print Ticket & Assign
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
}
