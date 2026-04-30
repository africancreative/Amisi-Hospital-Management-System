'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    Stethoscope, 
    History, 
    ClipboardList, 
    Zap, 
    FileText, 
    Beaker, 
    Image as ImageIcon,
    Plus,
    ArrowRight
} from 'lucide-react';

export default function DoctorWorkspace({ patient }: { patient: any }) {
    const [activeTab, setActiveTab] = useState<'history' | 'treatment'>('treatment');

    const orderSets = [
        { name: 'Acute Pain Set', meds: ['Paracetamol 1g', 'Ibuprofen 400mg'], color: 'from-orange-500/20 to-rose-500/20' },
        { name: 'Standard Malaria', meds: ['AL (Lumartem) 1x4', 'Paracetamol'], color: 'from-emerald-500/20 to-teal-500/20' },
        { name: 'Infection (Mild)', meds: ['Amoxicillin 500mg', 'Vitamin C'], color: 'from-blue-500/20 to-indigo-500/20' },
        { name: 'GI Upset Set', meds: ['Omeprazole 20mg', 'Metoclopramide'], color: 'from-purple-500/20 to-pink-500/20' },
    ];

    return (
        <div className="flex flex-col h-full gap-6">
            {/* Patient Mini-Header */}
            <div className="bg-gray-900/60 border border-gray-800 p-6 rounded-[32px] flex items-center justify-between">
                <div className="flex items-center gap-6">
                    <div className="h-16 w-16 rounded-[24px] bg-blue-600 flex items-center justify-center text-xl font-black text-white">
                        {patient.name[0]}
                    </div>
                    <div>
                        <h2 className="text-xl font-black text-white">{patient.name}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black text-gray-500 uppercase font-mono">{patient.mrn}</span>
                            <span className="h-1 w-1 rounded-full bg-gray-700"></span>
                            <span className="text-[10px] font-black text-blue-400 uppercase">Male, 34Y</span>
                        </div>
                    </div>
                </div>
                <div className="flex gap-4">
                    <div className="bg-black/40 border border-white/5 rounded-2xl px-5 py-2 flex flex-col items-end">
                        <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Vitals Status</span>
                        <span className="text-xs font-bold text-emerald-500 uppercase">Stable (98%)</span>
                    </div>
                </div>
            </div>

            {/* Main Content Split */}
            <div className="grid grid-cols-12 gap-6 flex-1 overflow-hidden">
                {/* Left: History Timeline */}
                <div className="col-span-5 flex flex-col bg-gray-900/40 border border-gray-800 rounded-[40px] overflow-hidden">
                    <div className="p-6 border-b border-gray-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <History className="h-4 w-4 text-blue-500" />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Clinical History</h3>
                        </div>
                        <button className="text-[10px] font-black text-gray-500 hover:text-white uppercase transition-all">View All</button>
                    </div>
                    <div className="flex-1 overflow-y-auto p-6 space-y-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="relative pl-8 border-l border-gray-800">
                                <div className="absolute left-[-5px] top-0 h-2 w-2 rounded-full bg-blue-500 ring-4 ring-blue-500/20"></div>
                                <div className="mb-1">
                                    <span className="text-[9px] font-black text-gray-500 uppercase">12 Oct 2023, 09:15 AM</span>
                                </div>
                                <div className="bg-gray-800/40 border border-white/5 rounded-2xl p-4">
                                    <h4 className="text-xs font-black text-white uppercase mb-1">Follow-up: Malaria</h4>
                                    <p className="text-[11px] text-gray-400 leading-relaxed">Patient reported completion of dosage. Fever subsided. Appetite returned to normal.</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Right: Treatment Center */}
                <div className="col-span-7 flex flex-col gap-6 overflow-hidden">
                    {/* Fast Order Sets */}
                    <div className="bg-blue-600/5 border border-blue-500/20 rounded-[40px] p-8">
                        <div className="flex items-center gap-3 mb-6">
                            <Zap className="h-4 w-4 text-blue-400 fill-blue-400" />
                            <h3 className="text-xs font-black text-white uppercase tracking-widest">Quick Order Sets</h3>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            {orderSets.map((set) => (
                                <button 
                                    key={set.name}
                                    className={`relative p-5 rounded-3xl bg-gradient-to-br ${set.color} border border-white/5 text-left group hover:border-blue-500/30 transition-all`}
                                >
                                    <span className="block text-xs font-black text-white uppercase mb-2">{set.name}</span>
                                    <div className="flex gap-2 flex-wrap">
                                        {set.meds.map(m => (
                                            <span key={m} className="text-[8px] font-bold text-white/40 bg-black/40 px-2 py-0.5 rounded-md">{m}</span>
                                        ))}
                                    </div>
                                    <Plus className="absolute right-4 top-1/2 -translate-y-1/2 h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-all" />
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Manual Entry */}
                    <div className="bg-gray-900/40 border border-gray-800 rounded-[40px] p-8 flex-1 flex flex-col gap-6">
                         <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <FileText className="h-4 w-4 text-gray-500" />
                                <h3 className="text-xs font-black text-white uppercase tracking-widest">Encounter Notes</h3>
                            </div>
                         </div>
                         <textarea 
                            className="flex-1 bg-black/40 border border-gray-800 rounded-3xl p-6 text-sm text-white outline-none focus:border-blue-500/50 transition-all resize-none"
                            placeholder="Type clinical findings and plan..."
                         />
                         <div className="flex gap-3">
                            <button className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Order Lab</button>
                            <button className="flex-1 py-4 bg-gray-800 hover:bg-gray-700 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all">Imaging</button>
                            <button className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-2">
                                Sign & Close Encounter
                                <ArrowRight className="h-3 w-3" />
                            </button>
                         </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
