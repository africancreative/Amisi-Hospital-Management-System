'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, 
    Pill, 
    Search, 
    AlertTriangle, 
    CheckCircle2, 
    XCircle, 
    RefreshCcw,
    UserCircle2,
    Clock,
    ChevronRight,
    ArrowRightCircle,
    Info,
    FileText
} from 'lucide-react';
import Image from 'next/image';

interface Prescription {
    id: string;
    patientName: string;
    priority: 'NORMAL' | 'URGENT' | 'EMERGENCY';
    timeReceived: string;
    items: {
        id: string;
        drugName: string;
        dosage: string;
        instructions: string;
        stockStatus: 'IN_STOCK' | 'LOW_STOCK' | 'OUT_OF_STOCK';
        quantity: number;
    }[];
}

export default function PharmacistDashboard() {
    const [queue, setQueue] = useState<Prescription[]>([
        {
            id: 'RX-7721',
            patientName: 'David G. Miller',
            priority: 'URGENT',
            timeReceived: '10:42 AM',
            items: [
                { id: '1', drugName: 'Amoxicillin 500mg', dosage: '1 Tab TID', instructions: 'Take after meals for 7 days', stockStatus: 'IN_STOCK', quantity: 21 },
                { id: '2', drugName: 'Paracetamol 500mg', dosage: '2 Tabs PRN', instructions: 'Every 6 hours for fever', stockStatus: 'LOW_STOCK', quantity: 20 },
            ]
        },
        {
            id: 'RX-7722',
            patientName: 'Sarah Jenkins',
            priority: 'NORMAL',
            timeReceived: '10:55 AM',
            items: [
                { id: '3', drugName: 'Atorvastatin 20mg', dosage: '1 Tab Daily', instructions: 'At bedtime', stockStatus: 'IN_STOCK', quantity: 30 },
            ]
        }
    ]);

    const [activeRx, setActiveRx] = useState<Prescription | null>(queue[0]);
    const [searchQuery, setSearchQuery] = useState('');

    const dispense = () => {
        if (!activeRx) return;
        setQueue(prev => prev.filter(rx => rx.id !== activeRx.id));
        setActiveRx(null);
    };

    return (
        <div className="flex flex-col h-screen bg-[#07070a] text-white overflow-hidden">
            {/* TOP BAR: INSTANT SEARCH */}
            <header className="h-20 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between px-8 shrink-0 backdrop-blur-xl z-20">
                <div className="flex items-center gap-6">
                    <Image src="/logo.png" alt="AmisiMedOS" width={40} height={40} className="object-contain" />
                    <div className="h-8 w-[1px] bg-gray-800"></div>
                    <h1 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500">On-Duty: Pharmacy</h1>
                </div>

                <div className="flex-1 max-w-2xl px-12">
                    <div className="relative group">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-500 group-focus-within:text-emerald-500 transition-colors" />
                        <input 
                            type="text" 
                            placeholder="Instant Drug Lookup (Name, NDC, or Batch #)..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-black/40 border border-gray-800 rounded-2xl py-3 pl-14 pr-6 text-sm text-white outline-none focus:border-emerald-500/50 transition-all"
                        />
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex flex-col items-end">
                        <span className="text-[10px] font-black text-gray-500 uppercase">Station PH-1</span>
                        <span className="text-xs font-bold text-white">L. Pharmacist</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden p-6 gap-6">
                {/* LEFT PANEL: RX QUEUE */}
                <aside className="w-80 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Incoming Prescriptions</h2>
                        <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full">{queue.length}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {queue.map(rx => (
                            <button 
                                key={rx.id}
                                onClick={() => setActiveRx(rx)}
                                className={`w-full p-6 rounded-[32px] border transition-all text-left relative overflow-hidden ${
                                    activeRx?.id === rx.id 
                                    ? 'bg-emerald-600/10 border-emerald-500/50 ring-2 ring-emerald-500/20' 
                                    : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-black text-base truncate pr-4">{rx.patientName}</h3>
                                    <div className={`h-2 w-2 rounded-full mt-1 ${rx.priority === 'URGENT' ? 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.6)]' : 'bg-blue-500'}`}></div>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                                    <span className="uppercase">{rx.id} • {rx.timeReceived}</span>
                                    <span className={`font-black uppercase tracking-widest ${rx.priority === 'URGENT' ? 'text-rose-500' : 'text-emerald-500'}`}>
                                        {rx.priority}
                                    </span>
                                </div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* CENTER PANEL: SELECTED PRESCRIPTION */}
                <main className="flex-1 flex flex-col bg-gray-900/20 border border-gray-800 rounded-[48px] overflow-hidden">
                    {activeRx ? (
                        <>
                            <div className="p-8 border-b border-gray-800 bg-gray-900/40 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-3xl bg-emerald-600 flex items-center justify-center font-black text-2xl shadow-2xl shadow-emerald-900/40">
                                        {activeRx.patientName[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">{activeRx.patientName}</h2>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Prescription Order: {activeRx.id}</p>
                                    </div>
                                </div>
                                <div className="bg-black/40 border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-3">
                                    <Clock className="h-4 w-4 text-emerald-500" />
                                    <span className="text-xs font-black uppercase text-emerald-500">Wait-time: 12m</span>
                                </div>
                            </div>

                            <div className="flex-1 p-10 overflow-y-auto space-y-6 custom-scrollbar">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2">Medication List</h3>
                                {activeRx.items.map(item => (
                                    <div 
                                        key={item.id}
                                        className="bg-gray-900/60 border border-gray-800 p-8 rounded-[40px] flex items-center justify-between group hover:border-emerald-500/30 transition-all"
                                    >
                                        <div className="flex items-start gap-6">
                                            <div className={`p-4 rounded-2xl ${
                                                item.stockStatus === 'IN_STOCK' ? 'bg-emerald-500/10 text-emerald-500' : 
                                                item.stockStatus === 'LOW_STOCK' ? 'bg-amber-500/10 text-amber-500' : 
                                                'bg-rose-500/10 text-rose-500'
                                            }`}>
                                                <Pill className="h-8 w-8" />
                                            </div>
                                            <div>
                                                <h4 className="text-xl font-black text-white">{item.drugName}</h4>
                                                <p className="text-sm font-bold text-gray-400 mt-1 uppercase tracking-tight">{item.dosage}</p>
                                                <div className="flex items-center gap-4 mt-4">
                                                    <span className="flex items-center gap-1.5 text-[10px] font-black uppercase bg-black/40 px-3 py-1 rounded-lg text-gray-500">
                                                        <FileText className="h-3 w-3" />
                                                        {item.instructions}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-3xl font-black text-white block">Qty: {item.quantity}</span>
                                            <span className={`text-[9px] font-black uppercase tracking-widest mt-2 block ${
                                                item.stockStatus === 'IN_STOCK' ? 'text-emerald-500' : 
                                                item.stockStatus === 'LOW_STOCK' ? 'text-amber-500' : 
                                                'text-rose-500'
                                            }`}>
                                                {item.stockStatus.replace('_', ' ')}
                                            </span>
                                        </div>
                                    </div>
                                ))}

                                {activeRx.items.some(i => i.stockStatus === 'LOW_STOCK') && (
                                    <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[32px] flex items-center gap-4">
                                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                                        <p className="text-xs font-bold text-amber-500/80 uppercase tracking-tight leading-relaxed">
                                            Inventory alert: <span className="text-white font-black">Paracetamol 500mg</span> is below safety threshold. Please reorder soon.
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-12">
                            <div className="h-24 w-24 rounded-full bg-emerald-600/5 flex items-center justify-center mb-8">
                                <Package className="h-12 w-12 text-emerald-500/40" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">Queue Clear</h2>
                            <p className="text-gray-600 text-sm max-w-xs">Waiting for new clinical prescriptions from consultation rooms.</p>
                        </div>
                    )}
                </main>

                {/* RIGHT PANEL: ACTIONS */}
                <aside className="w-80 flex flex-col gap-6">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-[40px] p-8 flex flex-col gap-4 h-full">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-4">Directives</h3>
                        
                        <div className="space-y-3">
                            <button className="w-full py-5 bg-emerald-600/10 hover:bg-emerald-600/20 border border-emerald-600/30 text-emerald-500 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                                <RefreshCcw className="h-4 w-4" />
                                Substitute Drug
                            </button>
                            
                            <button className="w-full py-5 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-600/30 text-rose-500 rounded-3xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center justify-center gap-3">
                                <XCircle className="h-4 w-4" />
                                Mark Out-of-Stock
                            </button>
                        </div>

                        <div className="h-[1px] bg-gray-800 my-6"></div>

                        <div className="bg-black/40 border border-white/5 p-6 rounded-3xl mb-auto">
                            <h4 className="text-[10px] font-black text-gray-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Info className="h-3 w-3" /> Safety Check
                            </h4>
                            <p className="text-[10px] text-gray-400 font-bold leading-relaxed italic">
                                "Double-check patient identity and dosage frequency before finalizing the dispense."
                            </p>
                        </div>

                        <div className="pt-8 border-t border-gray-800">
                            <button 
                                onClick={dispense}
                                disabled={!activeRx}
                                className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex flex-col items-center gap-2 shadow-2xl ${
                                    activeRx 
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40' 
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                }`}
                            >
                                <CheckCircle2 className="h-6 w-6" />
                                Verify & Dispense
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

        </div>
    );
}
