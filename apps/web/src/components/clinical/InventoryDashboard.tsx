'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Search, 
    Package, 
    AlertTriangle, 
    ArrowUpRight, 
    History, 
    Plus, 
    Filter,
    MoreHorizontal,
    ShoppingCart,
    Clock,
    Zap,
    Tag,
    Layers
} from 'lucide-react';
import Image from 'next/image';

interface StockItem {
    id: string;
    name: string;
    code: string;
    category: string;
    quantity: number;
    minLevel: number;
    unit: string;
    price: number;
    expiry: string;
}

export default function InventoryDashboard() {
    const [searchQuery, setSearchQuery] = useState('');
    const [items, setItems] = useState<StockItem[]>([
        { id: '1', name: 'Amoxicillin 500mg', code: 'DRG-001', category: 'Antibiotics', quantity: 1500, minLevel: 200, unit: 'Tabs', price: 12.0, expiry: '2025-12-20' },
        { id: '2', name: 'Paracetamol 500mg', code: 'DRG-002', category: 'Analgesics', quantity: 80, minLevel: 100, unit: 'Tabs', price: 5.0, expiry: '2025-08-15' },
        { id: '3', name: 'Insulin Glargine', code: 'DRG-003', category: 'Endocrine', quantity: 0, minLevel: 10, unit: 'Vials', price: 450.0, expiry: '2024-11-05' },
        { id: '4', name: 'Ceftriaxone 1g', code: 'DRG-004', category: 'Antibiotics', quantity: 45, minLevel: 50, unit: 'Vials', price: 85.0, expiry: '2026-01-10' },
    ]);

    const getStockStatus = (item: StockItem) => {
        if (item.quantity <= 0) return { label: 'OUT OF STOCK', color: 'bg-rose-500', text: 'text-rose-500' };
        if (item.quantity <= item.minLevel) return { label: 'LOW STOCK', color: 'bg-amber-500', text: 'text-amber-500' };
        return { label: 'IN STOCK', color: 'bg-emerald-500', text: 'text-emerald-500' };
    };

    const filteredItems = items.filter((i: any) => 
        i.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        i.code.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="flex flex-col h-screen bg-[#07070a] text-white overflow-hidden">
            {/* SEARCH-FIRST HEADER */}
            <header className="h-24 bg-gray-900/60 border-b border-gray-800 flex items-center px-8 gap-12 shrink-0 backdrop-blur-2xl z-20">
                <div className="flex items-center gap-6">
                    <Image src="/logo.png" alt="AmisiMedOS" width={40} height={40} className="object-contain" />
                    <div className="h-8 w-[1px] bg-gray-800"></div>
                    <h1 className="text-sm font-black uppercase tracking-[0.2em] text-purple-500">Inventory Control</h1>
                </div>

                <div className="flex-1 max-w-4xl relative group">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 h-6 w-6 text-gray-500 group-focus-within:text-purple-500 transition-colors" />
                    <input 
                        type="text" 
                        placeholder="Search by drug name, code, or category (sub-second lookup)..."
                        className="w-full bg-black/40 border border-white/5 rounded-[32px] py-5 pl-16 pr-8 text-lg font-bold placeholder:text-gray-700 focus:outline-none focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500/30 transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        autoFocus
                    />
                    <div className="absolute right-6 top-1/2 -translate-y-1/2 flex items-center gap-2">
                        <kbd className="bg-gray-800 px-2 py-1 rounded text-[10px] font-black text-gray-500">⌘</kbd>
                        <kbd className="bg-gray-800 px-2 py-1 rounded text-[10px] font-black text-gray-500">F</kbd>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <button className="h-14 w-14 bg-purple-600 rounded-2xl flex items-center justify-center shadow-xl shadow-purple-900/40 hover:bg-purple-500 transition-all">
                        <Plus className="h-6 w-6" />
                    </button>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden p-6 gap-6">
                {/* MAIN GRID */}
                <main className="flex-1 overflow-y-auto custom-scrollbar pr-2">
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence mode="popLayout">
                            {filteredItems.map((item: any) => {
                                const status = getStockStatus(item);
                                return (
                                    <motion.div 
                                        key={item.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        className="bg-gray-900/40 border border-gray-800 rounded-[40px] p-8 hover:border-purple-500/30 transition-all group relative overflow-hidden"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="h-14 w-14 rounded-2xl bg-white/5 flex items-center justify-center text-gray-500 group-hover:text-purple-400 transition-colors">
                                                <Package className="h-7 w-7" />
                                            </div>
                                            <div className={`px-4 py-2 rounded-full text-[10px] font-black tracking-widest ${status.color} bg-opacity-10 ${status.text} border border-white/5`}>
                                                {status.label}
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-black mb-1 truncate">{item.name}</h3>
                                        <div className="flex items-center gap-2 mb-6">
                                            <Tag className="h-3 w-3 text-gray-600" />
                                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{item.code} • {item.category}</span>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-8">
                                            <div className="bg-black/40 rounded-3xl p-5 border border-white/5">
                                                <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">Quantity</span>
                                                <span className="text-2xl font-black font-mono">{item.quantity}</span>
                                                <span className="text-[10px] text-gray-500 ml-1 uppercase">{item.unit}</span>
                                            </div>
                                            <div className="bg-black/40 rounded-3xl p-5 border border-white/5">
                                                <span className="text-[9px] font-black text-gray-600 uppercase block mb-1">Price/Unit</span>
                                                <span className="text-lg font-black font-mono">KES {item.price.toFixed(1)}</span>
                                            </div>
                                        </div>

                                        <div className="flex items-center justify-between pt-6 border-t border-gray-800">
                                            <div className="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase">
                                                <Clock className="h-3 w-3" />
                                                Expiry: {item.expiry}
                                            </div>
                                            <button className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center hover:bg-purple-600 transition-all">
                                                <ArrowUpRight className="h-5 w-5" />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </main>

                {/* ALERTS & STATS SIDEBAR */}
                <aside className="w-96 flex flex-col gap-6">
                    {/* CRITICAL ALERTS */}
                    <div className="bg-rose-500/10 border border-rose-500/20 rounded-[40px] p-8">
                        <div className="flex items-center gap-3 mb-6 text-rose-500">
                            <AlertTriangle className="h-6 w-6" />
                            <h2 className="text-xs font-black uppercase tracking-[0.2em]">Reorder Urgently</h2>
                        </div>
                        
                        <div className="space-y-4">
                            {items.filter((i: any) => i.quantity <= i.minLevel).map((item: any) => (
                                <div key={item.id} className="flex items-center justify-between bg-black/40 p-4 rounded-2xl border border-rose-500/10">
                                    <div>
                                        <h4 className="text-xs font-black truncate max-w-[140px]">{item.name}</h4>
                                        <span className="text-[10px] font-bold text-rose-500/60 uppercase">{item.quantity} {item.unit} left</span>
                                    </div>
                                    <button className="bg-rose-500 text-white p-2 rounded-lg hover:scale-110 transition-transform">
                                        <ShoppingCart className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* QUICK STATS */}
                    <div className="bg-gray-900/40 border border-gray-800 rounded-[40px] p-8 flex-1">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-8">Warehouse Status</h3>
                        
                        <div className="space-y-6">
                            {[
                                { label: 'Total Value', value: 'KES 1.2M', icon: Zap, color: 'text-yellow-500' },
                                { label: 'Active SKU', value: '412 Items', icon: Layers, color: 'text-purple-500' },
                                { label: 'Recent Move', value: '12m ago', icon: History, color: 'text-blue-500' },
                            ].map((stat: any) => (
                                <div key={stat.label} className="flex items-center gap-5 group">
                                    <div className={`h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center transition-all group-hover:scale-110`}>
                                        <stat.icon className={`h-5 w-5 ${stat.color}`} />
                                    </div>
                                    <div>
                                        <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest block mb-0.5">{stat.label}</span>
                                        <span className="text-base font-black tracking-tight">{stat.value}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="mt-12">
                            <button className="w-full py-5 bg-white/5 border border-white/10 rounded-3xl font-black text-[10px] uppercase tracking-widest hover:bg-white/10 transition-all flex items-center justify-center gap-3">
                                <History className="h-4 w-4 text-purple-500" />
                                Full Audit Log
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

        </div>
    );
}
