'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Package, 
    ScanLine, 
    AlertTriangle, 
    CheckCircle2, 
    Search,
    Info,
    ArrowRight
} from 'lucide-react';

export default function PharmacistDispensing({ prescription }: { prescription?: any }) {
    const [scanned, setScanned] = useState(false);

    return (
        <div className="flex flex-col h-full gap-8">
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-black text-white uppercase tracking-tight flex items-center gap-3">
                        <Package className="h-6 w-6 text-blue-500" />
                        Dispensing Station
                    </h2>
                    <p className="text-gray-500 text-xs font-bold uppercase mt-1">Station: PHARM-D1 | Dr. Sarah Chen</p>
                </div>
            </div>

            <div className="grid grid-cols-12 gap-8 flex-1 overflow-hidden">
                {/* Left: Prescription Details */}
                <div className="col-span-5 flex flex-col bg-gray-900/40 border border-gray-800 rounded-[40px] p-8">
                    <div className="mb-8">
                        <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-4">Patient Details</span>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-2xl bg-gray-800 flex items-center justify-center text-lg font-black text-gray-400">MD</div>
                            <div>
                                <h3 className="text-lg font-black text-white">Michael R. Davis</h3>
                                <span className="text-xs font-bold text-gray-600">ID: P09876543 | 58Y, Male</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex-1 space-y-6">
                        <div className="bg-black/40 border border-white/5 rounded-3xl p-6">
                            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest block mb-2">Prescribed Medication</span>
                            <h4 className="text-xl font-black text-white mb-1">Atorvastatin 40 mg</h4>
                            <p className="text-xs text-gray-400 font-bold mb-4">Tabs | Take one tablet daily at bedtime</p>
                            
                            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
                                <div>
                                    <span className="text-[8px] font-black text-gray-500 uppercase block">Quantity</span>
                                    <span className="text-sm font-black text-white">30 Units</span>
                                </div>
                                <div>
                                    <span className="text-[8px] font-black text-gray-500 uppercase block">Refills</span>
                                    <span className="text-sm font-black text-white">0 (New)</span>
                                </div>
                            </div>
                        </div>

                        {/* Interaction Alert */}
                        <div className="bg-rose-500/10 border border-rose-500/30 rounded-3xl p-6 flex gap-4">
                            <AlertTriangle className="h-6 w-6 text-rose-500 shrink-0" />
                            <div>
                                <h4 className="text-xs font-black text-rose-500 uppercase tracking-tight mb-1">Drug Interaction Detected</h4>
                                <p className="text-[10px] text-rose-500/80 leading-relaxed font-bold">High-risk interaction with Clarithromycin. Concurrent use increases risk of Myopathy.</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right: Scanning Station */}
                <div className="col-span-7 flex flex-col gap-6">
                    <div className="flex-1 bg-gray-900/60 border border-gray-800 rounded-[40px] flex flex-col items-center justify-center p-12 text-center relative overflow-hidden group">
                        <div className={`p-8 rounded-[48px] border-4 border-dashed transition-all duration-700 ${scanned ? 'border-emerald-500 bg-emerald-500/10' : 'border-blue-500/20 bg-blue-500/5'}`}>
                            {scanned ? (
                                <CheckCircle2 className="h-20 w-20 text-emerald-500 animate-in zoom-in duration-300" />
                            ) : (
                                <ScanLine className="h-20 w-20 text-blue-500 animate-pulse" />
                            )}
                        </div>
                        <h3 className="text-xl font-black text-white mt-8 uppercase tracking-tight">
                            {scanned ? 'Medication Validated' : 'Ready to Scan'}
                        </h3>
                        <p className="text-gray-500 text-sm mt-2 max-w-[280px]">
                            {scanned ? 'Batch #ATV-2023-452. Expiry: 12/2025' : 'Position medication barcode within the scanner field of view.'}
                        </p>
                        
                        {!scanned && (
                            <button 
                                onClick={() => setScanned(true)}
                                className="mt-8 px-12 py-4 bg-white text-black rounded-2xl text-xs font-black uppercase tracking-widest hover:bg-blue-500 hover:text-white transition-all shadow-2xl"
                            >
                                Simulate Scan
                            </button>
                        )}

                        {/* Inventory Pulse */}
                        <div className="absolute bottom-8 right-8 flex items-center gap-2 bg-black/40 border border-white/5 px-4 py-2 rounded-xl">
                            <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                            <span className="text-[10px] font-black text-gray-500 uppercase">Stock: 318 Units</span>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <button className="flex-1 py-6 bg-gray-800 hover:bg-gray-700 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all">Cancel Batch</button>
                        <button 
                            disabled={!scanned}
                            className={`flex-[2] py-6 rounded-3xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center justify-center gap-3 shadow-2xl ${
                                scanned ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/20' : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                            }`}
                        >
                            Verify & Dispense Medication
                            <ArrowRight className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
