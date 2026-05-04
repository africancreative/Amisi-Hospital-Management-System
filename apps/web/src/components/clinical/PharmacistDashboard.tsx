'use client';

import React, { useState, useEffect } from 'react';
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
    FileText,
    TrendingUp,
    Calendar,
    Hash,
    ChevronDown,
    ChevronUp,
} from 'lucide-react';
import Image from 'next/image';
import { RealtimeStockTracker } from '@/components/inventory/RealtimeStockTracker';
import { InventoryFlowPanel } from '@/components/inventory/InventoryFlowPanel';
import { dispenseWithInventoryTracking, getAvailableBatches, type InventoryBatchInfo } from '@/lib/inventory-flow-actions';

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
        inventoryItemId?: string;
        inventoryItem?: { name: string; quantity: number; minLevel: number; price: number; unit: string };
    }[];
}

export default function PharmacistDashboard({ tenantId }: { tenantId?: string }) {
    const [queue, setQueue] = useState<Prescription[]>([
        {
            id: 'RX-7721',
            patientName: 'David G. Miller',
            priority: 'URGENT',
            timeReceived: '10:42 AM',
            items: [
                { id: '1', drugName: 'Amoxicillin 500mg', dosage: '1 Tab TID', instructions: 'Take after meals for 7 days', stockStatus: 'IN_STOCK', quantity: 21, inventoryItemId: 'inv-1', inventoryItem: { name: 'Amoxicillin 500mg', quantity: 150, minLevel: 30, price: 500, unit: 'tabs' } },
                { id: '2', drugName: 'Paracetamol 500mg', dosage: '2 Tabs PRN', instructions: 'Every 6 hours for fever', stockStatus: 'LOW_STOCK', quantity: 20, inventoryItemId: 'inv-2', inventoryItem: { name: 'Paracetamol 500mg', quantity: 15, minLevel: 20, price: 200, unit: 'tabs' } },
            ]
        },
        {
            id: 'RX-7722',
            patientName: 'Sarah Jenkins',
            priority: 'NORMAL',
            timeReceived: '10:55 AM',
            items: [
                { id: '3', drugName: 'Atorvastatin 20mg', dosage: '1 Tab Daily', instructions: 'At bedtime', stockStatus: 'IN_STOCK', quantity: 30, inventoryItemId: 'inv-3', inventoryItem: { name: 'Atorvastatin 20mg', quantity: 200, minLevel: 50, price: 1200, unit: 'tabs' } },
            ]
        }
    ]);

    const [activeRx, setActiveRx] = useState<Prescription | null>(queue[0]);
    const [searchQuery, setSearchQuery] = useState('');
    const [showFlowPanel, setShowFlowPanel] = useState(false);
    const [showStockTracker, setShowStockTracker] = useState(false);
    const [dispensing, setDispensing] = useState(false);
    const [dispenseResult, setDispenseResult] = useState<{ success: boolean; message: string } | null>(null);
    const [expandedItem, setExpandedItem] = useState<string | null>(null);
    const [itemBatches, setItemBatches] = useState<Record<string, InventoryBatchInfo[]>>({});
    const [selectedBatches, setSelectedBatches] = useState<Record<string, { batchId: string; quantity: number }[]>>({});
    const [loadingBatches, setLoadingBatches] = useState<Record<string, boolean>>({});

    const loadBatches = async (itemId: string) => {
        if (itemBatches[itemId] || loadingBatches[itemId]) return;
        setLoadingBatches(prev => ({ ...prev, [itemId]: true }));
        try {
            const batches = await getAvailableBatches(itemId);
            setItemBatches(prev => ({ ...prev, [itemId]: batches }));
            if (batches.length > 0 && !selectedBatches[itemId]) {
                setSelectedBatches(prev => ({ ...prev, [itemId]: [{ batchId: batches[0].id, quantity: 0 }] }));
            }
        } catch (err) {
            console.error('Failed to load batches:', err);
        } finally {
            setLoadingBatches(prev => ({ ...prev, [itemId]: false }));
        }
    };

    const addBatchSelection = (itemId: string) => {
        setSelectedBatches(prev => ({
            ...prev,
            [itemId]: [...(prev[itemId] || []), { batchId: '', quantity: 0 }],
        }));
    };

    const updateBatchSelection = (itemId: string, index: number, field: 'batchId' | 'quantity', value: string | number) => {
        setSelectedBatches(prev => {
            const current = [...(prev[itemId] || [])];
            current[index] = { ...current[index], [field]: value };
            return { ...prev, [itemId]: current };
        });
    };

    const removeBatchSelection = (itemId: string, index: number) => {
        setSelectedBatches(prev => {
            const current = [...(prev[itemId] || [])];
            current.splice(index, 1);
            return { ...prev, [itemId]: current };
        });
    };

    const dispense = async () => {
        if (!activeRx) return;
        setDispensing(true);
        setDispenseResult(null);
        
        try {
            const result = await dispenseWithInventoryTracking(activeRx.id, 'pharmacist-1');
            setDispenseResult({ success: result.success, message: result.message });
            
            if (result.success) {
                setQueue(prev => prev.filter((rx: any) => rx.id !== activeRx.id));
                setTimeout(() => setActiveRx(null), 1500);
            }
        } catch (error) {
            setDispenseResult({ success: false, message: error instanceof Error ? error.message : 'Dispensing failed' });
        } finally {
            setDispensing(false);
        }
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

                <div className="flex items-center gap-4">
                    <button
                        onClick={() => setShowStockTracker(true)}
                        className="bg-blue-600/10 border border-blue-500/30 rounded-xl px-4 py-2 flex items-center gap-2 hover:bg-blue-600/20 transition-all"
                    >
                        <TrendingUp className="h-4 w-4 text-blue-500" />
                        <span className="text-[10px] font-black text-blue-500 uppercase tracking-widest">Stock Monitor</span>
                    </button>
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
                        {queue.map((rx: any) => (
                            <button 
                                key={rx.id}
                                onClick={() => { setActiveRx(rx); setDispenseResult(null); }}
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
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => setShowFlowPanel(true)}
                                        className="bg-emerald-600/10 border border-emerald-500/30 rounded-xl px-4 py-2 hover:bg-emerald-600/20 transition-all"
                                    >
                                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Flow Status</span>
                                    </button>
                                    <div className="bg-black/40 border border-white/5 px-6 py-3 rounded-2xl flex items-center gap-3">
                                        <Clock className="h-4 w-4 text-emerald-500" />
                                        <span className="text-xs font-black uppercase text-emerald-500">Wait-time: 12m</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex-1 p-10 overflow-y-auto space-y-6 custom-scrollbar">
                                <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest px-2">Medication List</h3>
                                {activeRx.items.map((item: any) => (
                                    <div 
                                        key={item.id}
                                        className="bg-gray-900/60 border border-gray-800 rounded-[40px] overflow-hidden group hover:border-emerald-500/30 transition-all"
                                    >
                                        <div className="p-8 flex items-center justify-between">
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
                                            <div className="text-right flex items-center gap-4">
                                                <div>
                                                    <span className="text-3xl font-black text-white block">Qty: {item.quantity}</span>
                                                    <span className={`text-[9px] font-black uppercase tracking-widest mt-2 block ${
                                                        item.stockStatus === 'IN_STOCK' ? 'text-emerald-500' : 
                                                        item.stockStatus === 'LOW_STOCK' ? 'text-amber-500' : 
                                                        'text-rose-500'
                                                    }`}>
                                                        {item.stockStatus.replace('_', ' ')}
                                                    </span>
                                                    {item.inventoryItem && (
                                                        <span className="text-[9px] font-bold text-gray-600 mt-1 block">
                                                            {item.inventoryItem.quantity} in stock
                                                        </span>
                                                    )}
                                                </div>
                                                {item.inventoryItemId && (
                                                    <button
                                                        onClick={() => {
                                                            const isExpanded = expandedItem === item.id;
                                                            setExpandedItem(isExpanded ? null : item.id);
                                                            if (!isExpanded) loadBatches(item.inventoryItemId!);
                                                        }}
                                                        className="p-2 rounded-xl bg-gray-800 hover:bg-gray-700 transition-colors"
                                                    >
                                                        {expandedItem === item.id ? <ChevronUp className="h-4 w-4 text-gray-400" /> : <ChevronDown className="h-4 w-4 text-gray-400" />}
                                                    </button>
                                                )}
                                            </div>
                                        </div>

                                        <AnimatePresence>
                                            {expandedItem === item.id && item.inventoryItemId && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0 }}
                                                    animate={{ height: 'auto', opacity: 1 }}
                                                    exit={{ height: 0, opacity: 0 }}
                                                    className="overflow-hidden border-t border-gray-800"
                                                >
                                                    <div className="p-6 space-y-4 bg-black/20">
                                                        <div className="flex items-center justify-between">
                                                            <h5 className="text-[10px] font-black text-gray-500 uppercase tracking-widest flex items-center gap-2">
                                                                <Hash className="h-3 w-3" />
                                                                Batch Selection (FEFO)
                                                            </h5>
                                                            <button
                                                                onClick={() => addBatchSelection(item.id)}
                                                                className="text-[10px] font-bold text-emerald-500 hover:text-emerald-400 transition-colors"
                                                            >
                                                                + Add Batch
                                                            </button>
                                                        </div>

                                                        {loadingBatches[item.id] ? (
                                                            <div className="flex items-center justify-center py-6">
                                                                <div className="h-5 w-5 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin" />
                                                            </div>
                                                        ) : (
                                                            <div className="space-y-3">
                                                                {(selectedBatches[item.id] || []).map((selection: any, idx: any) => {
                                                                    const availableBatches = itemBatches[item.id] || [];
                                                                    const selectedBatch = availableBatches.find((b: any) => b.id === selection.batchId);
                                                                    return (
                                                                        <div key={idx} className="flex items-center gap-3 bg-gray-900/60 border border-gray-800 rounded-2xl p-4">
                                                                            <select
                                                                                value={selection.batchId}
                                                                                onChange={(e) => updateBatchSelection(item.id, idx, 'batchId', e.target.value)}
                                                                                className="flex-1 bg-black/40 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                                                                            >
                                                                                <option value="">Select batch...</option>
                                                                                {availableBatches.filter((b: any) => b.quantity > 0 && !b.isExpired).map((batch: any) => (
                                                                                    <option key={batch.id} value={batch.id}>
                                                                                        {batch.batchNumber} (Qty: {batch.quantity}, Exp: {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : 'N/A'})
                                                                                    </option>
                                                                                ))}
                                                                            </select>
                                                                            <div className="flex items-center gap-2">
                                                                                <input
                                                                                    type="number"
                                                                                    min={1}
                                                                                    max={selectedBatch?.quantity ?? 999}
                                                                                    value={selection.quantity || ''}
                                                                                    onChange={(e) => updateBatchSelection(item.id, idx, 'quantity', parseInt(e.target.value) || 0)}
                                                                                    placeholder="Qty"
                                                                                    className="w-20 bg-black/40 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white outline-none focus:border-emerald-500/50"
                                                                                />
                                                                                {(selectedBatches[item.id] || []).length > 1 && (
                                                                                    <button
                                                                                        onClick={() => removeBatchSelection(item.id, idx)}
                                                                                        className="p-2 rounded-lg hover:bg-rose-500/10 text-gray-500 hover:text-rose-500 transition-colors"
                                                                                    >
                                                                                        <XCircle className="h-4 w-4" />
                                                                                    </button>
                                                                                )}
                                                                            </div>
                                                                        </div>
                                                                    );
                                                                })}

                                                                {itemBatches[item.id] && itemBatches[item.id].length > 0 && (
                                                                    <div className="mt-4 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/20">
                                                                        <h6 className="text-[9px] font-black text-emerald-500 uppercase tracking-widest mb-2">Available Batches (FEFO Order)</h6>
                                                                        <div className="space-y-2">
                                                                            {itemBatches[item.id].map((batch: any) => (
                                                                                <div key={batch.id} className="flex items-center justify-between text-[10px]">
                                                                                    <div className="flex items-center gap-3">
                                                                                        <span className="font-bold text-gray-300">{batch.batchNumber}</span>
                                                                                        {batch.isExpired && <span className="text-rose-500 font-bold">EXPIRED</span>}
                                                                                    </div>
                                                                                    <div className="flex items-center gap-4 text-gray-500">
                                                                                        <span className="flex items-center gap-1"><Calendar className="h-3 w-3" /> {batch.expiryDate ? new Date(batch.expiryDate).toLocaleDateString() : 'N/A'}</span>
                                                                                        <span>Qty: {batch.quantity}</span>
                                                                                    </div>
                                                                                </div>
                                                                            ))}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>
                                    </div>
                                ))}

                                {activeRx.items.some((i: any) => i.stockStatus === 'LOW_STOCK') && (
                                    <div className="bg-amber-500/5 border border-amber-500/10 p-6 rounded-[32px] flex items-center gap-4">
                                        <AlertTriangle className="h-6 w-6 text-amber-500" />
                                        <p className="text-xs font-bold text-amber-500/80 uppercase tracking-tight leading-relaxed">
                                            Inventory alert: <span className="text-white font-black">Paracetamol 500mg</span> is below safety threshold. Please reorder soon.
                                        </p>
                                    </div>
                                )}

                                {dispenseResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className={`p-6 rounded-[32px] flex items-center gap-4 ${
                                            dispenseResult.success 
                                                ? 'bg-emerald-500/10 border border-emerald-500/20' 
                                                : 'bg-rose-500/10 border border-rose-500/20'
                                        }`}
                                    >
                                        {dispenseResult.success ? (
                                            <CheckCircle2 className="h-6 w-6 text-emerald-500" />
                                        ) : (
                                            <XCircle className="h-6 w-6 text-rose-500" />
                                        )}
                                        <p className={`text-xs font-bold uppercase tracking-tight ${
                                            dispenseResult.success ? 'text-emerald-500' : 'text-rose-500'
                                        }`}>
                                            {dispenseResult.message}
                                        </p>
                                    </motion.div>
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
                                disabled={!activeRx || dispensing}
                                className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex flex-col items-center gap-2 shadow-2xl ${
                                    activeRx && !dispensing
                                    ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-900/40' 
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed'
                                }`}
                            >
                                {dispensing ? (
                                    <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <CheckCircle2 className="h-6 w-6" />
                                )}
                                {dispensing ? 'Processing...' : 'Verify & Dispense'}
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

            {/* Inventory Flow Panel (modal overlay) */}
            {showFlowPanel && activeRx && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
                    <div className="w-full max-w-2xl bg-gray-900 border border-gray-800 rounded-[40px] p-8 relative">
                        <button
                            onClick={() => setShowFlowPanel(false)}
                            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Prescription → Billing Flow</h3>
                        <InventoryFlowPanel
                            prescription={{
                                id: activeRx.id,
                                patientId: 'patient-1',
                                patientName: activeRx.patientName,
                                orderedBy: 'Dr. Current User',
                                status: 'pending',
                                isBilled: false,
                                isPaid: false,
                                items: activeRx.items.map((item: any) => ({
                                    id: item.id,
                                    drugName: item.drugName,
                                    dosage: item.dosage,
                                    quantity: item.quantity,
                                    inventoryItemId: item.inventoryItemId,
                                    inventoryItem: item.inventoryItem
                                }))
                            }}
                            compact
                        />
                    </div>
                </div>
            )}

            {/* Realtime Stock Tracker (modal overlay) */}
            {showStockTracker && (
                <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-8">
                    <div className="w-full max-w-4xl bg-gray-900 border border-gray-800 rounded-[40px] p-8 relative max-h-[90vh] overflow-y-auto">
                        <button
                            onClick={() => setShowStockTracker(false)}
                            className="absolute top-6 right-6 text-gray-500 hover:text-white transition-colors"
                        >
                            ✕
                        </button>
                        <h3 className="text-sm font-black text-white uppercase tracking-widest mb-6">Realtime Stock Monitor</h3>
                        <RealtimeStockTracker tenantId={tenantId} />
                    </div>
                </div>
            )}
        </div>
    );
}
