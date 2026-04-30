'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
    TrendingUp, 
    TrendingDown, 
    DollarSign, 
    Calendar, 
    Download, 
    ArrowUpRight, 
    ArrowDownRight, 
    PieChart as PieChartIcon, 
    BarChart3,
    Filter,
    Wallet,
    Briefcase,
    FileText
} from 'lucide-react';
import { 
    AreaChart, 
    Area, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    BarChart,
    Bar,
    Cell
} from 'recharts';

const MOCK_DATA = [
    { name: 'Mon', revenue: 45000, expenses: 32000 },
    { name: 'Tue', revenue: 52000, expenses: 35000 },
    { name: 'Wed', revenue: 48000, expenses: 31000 },
    { name: 'Thu', revenue: 61000, expenses: 38000 },
    { name: 'Fri', revenue: 55000, expenses: 42000 },
    { name: 'Sat', revenue: 38000, expenses: 25000 },
    { name: 'Sun', revenue: 42000, expenses: 28000 },
];

const CATEGORY_DATA = [
    { name: 'Consultation', value: 45, color: '#3b82f6' },
    { name: 'Pharmacy', value: 30, color: '#10b981' },
    { name: 'Laboratory', value: 15, color: '#8b5cf6' },
    { name: 'Inpatient', value: 10, color: '#f59e0b' },
];

export default function FinanceDashboard() {
    const [period, setPeriod] = useState<'daily' | 'weekly' | 'monthly'>('weekly');

    return (
        <div className="flex flex-col h-screen bg-[#07070a] text-white overflow-hidden p-8">
            {/* HEADER & CONTROLS */}
            <header className="flex items-center justify-between mb-10">
                <div>
                    <h1 className="text-3xl font-black tracking-tight mb-2 uppercase">Financial Intelligence</h1>
                    <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Hospital Revenue & Expense Analytics</p>
                </div>

                <div className="flex items-center gap-4 bg-gray-900/40 p-2 rounded-[24px] border border-gray-800">
                    {['daily', 'weekly', 'monthly'].map((p) => (
                        <button 
                            key={p}
                            onClick={() => setPeriod(p as any)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                                period === p ? 'bg-blue-600 text-white shadow-lg' : 'text-gray-500 hover:text-white'
                            }`}
                        >
                            {p}
                        </button>
                    ))}
                </div>

                <div className="flex gap-3">
                    <button className="h-12 px-6 bg-white/5 border border-white/5 rounded-2xl flex items-center gap-3 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                        <Download className="h-4 w-4" /> Export Report
                    </button>
                </div>
            </header>

            <div className="flex-1 overflow-y-auto custom-scrollbar space-y-8 pr-2">
                {/* TOP STATS GRID */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {[
                        { label: 'Total Revenue', value: 'KES 2,450,000', change: '+12.5%', isUp: true, icon: TrendingUp, color: 'text-emerald-500' },
                        { label: 'Total Expenses', value: 'KES 1,120,000', change: '+2.1%', isUp: false, icon: TrendingDown, color: 'text-rose-500' },
                        { label: 'Net Profit', value: 'KES 1,330,000', change: '+18.2%', isUp: true, icon: Wallet, color: 'text-blue-500' },
                    ].map((stat, idx) => (
                        <motion.div 
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="bg-gray-900/40 border border-gray-800 rounded-[40px] p-8 group hover:border-blue-500/30 transition-all"
                        >
                            <div className="flex justify-between items-start mb-6">
                                <div className={`h-12 w-12 rounded-2xl bg-white/5 flex items-center justify-center ${stat.color}`}>
                                    <stat.icon className="h-6 w-6" />
                                </div>
                                <div className={`flex items-center gap-1 text-[10px] font-black ${stat.isUp ? 'text-emerald-500' : 'text-rose-500'}`}>
                                    {stat.isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
                                    {stat.change}
                                </div>
                            </div>
                            <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-1">{stat.label}</span>
                            <span className="text-3xl font-black tracking-tight">{stat.value}</span>
                        </motion.div>
                    ))}
                </div>

                {/* CHARTS ROW */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">
                    {/* Main Revenue Chart */}
                    <div className="lg:col-span-2 bg-gray-900/40 border border-gray-800 rounded-[40px] p-8 flex flex-col">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Revenue vs Expenses</h3>
                            <div className="flex gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-blue-500"></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase">Revenue</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="h-2 w-2 rounded-full bg-rose-500"></div>
                                    <span className="text-[10px] font-black text-gray-500 uppercase">Expenses</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={MOCK_DATA}>
                                    <defs>
                                        <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                                    <XAxis dataKey="name" stroke="#4b5563" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                    <YAxis stroke="#4b5563" fontSize={10} fontWeight="bold" axisLine={false} tickLine={false} />
                                    <Tooltip 
                                        contentStyle={{ backgroundColor: '#111827', border: 'none', borderRadius: '16px', fontSize: '10px', fontWeight: 'bold' }}
                                        itemStyle={{ color: '#fff' }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#3b82f6" strokeWidth={4} fillOpacity={1} fill="url(#colorRevenue)" />
                                    <Area type="monotone" dataKey="expenses" stroke="#f43f5e" strokeWidth={2} fillOpacity={0} />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* Revenue by Category */}
                    <div className="bg-gray-900/40 border border-gray-800 rounded-[40px] p-8 flex flex-col">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-500 mb-8">Revenue Distribution</h3>
                        <div className="flex-1 flex flex-col justify-center gap-6">
                            {CATEGORY_DATA.map((cat) => (
                                <div key={cat.name} className="space-y-2">
                                    <div className="flex justify-between items-center text-[10px] font-black uppercase">
                                        <span className="text-gray-500">{cat.name}</span>
                                        <span>{cat.value}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div 
                                            initial={{ width: 0 }}
                                            animate={{ width: `${cat.value}%` }}
                                            transition={{ duration: 1, ease: 'easeOut' }}
                                            className="h-full rounded-full" 
                                            style={{ backgroundColor: cat.color }}
                                        ></motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* BOTTOM ROW: RECENT TRANSACTIONS */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-[40px] p-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-500">Recent Transactions</h3>
                            <button className="text-[10px] font-black text-blue-500 uppercase hover:underline">View All</button>
                        </div>
                        <div className="space-y-4">
                            {[
                                { id: 'T-9812', name: 'NHIF Payment - Ward C', date: '2 mins ago', amount: '+ KES 45,000', type: 'IN' },
                                { id: 'T-9811', name: 'Medical Supplies Restock', date: '45 mins ago', amount: '- KES 12,400', type: 'OUT' },
                                { id: 'T-9810', name: 'Consultation Fee - RJ', date: '1 hour ago', amount: '+ KES 3,500', type: 'IN' },
                            ].map((tx) => (
                                <div key={tx.id} className="flex items-center justify-between p-4 bg-black/20 rounded-2xl border border-white/5 group hover:border-blue-500/20 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${tx.type === 'IN' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                            {tx.type === 'IN' ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                                        </div>
                                        <div>
                                            <h4 className="text-sm font-bold text-gray-200">{tx.name}</h4>
                                            <span className="text-[10px] font-black text-gray-600 uppercase tracking-widest">{tx.id} • {tx.date}</span>
                                        </div>
                                    </div>
                                    <span className={`text-sm font-black font-mono ${tx.type === 'IN' ? 'text-emerald-500' : 'text-rose-500'}`}>{tx.amount}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="bg-blue-600/10 border border-blue-500/20 rounded-[40px] p-10 flex flex-col items-center justify-center text-center">
                        <div className="h-20 w-20 bg-blue-600 rounded-[32px] flex items-center justify-center shadow-2xl shadow-blue-900/40 mb-8">
                            <FileText className="h-10 w-10" />
                        </div>
                        <h2 className="text-2xl font-black uppercase tracking-tight mb-4">Audit Reports</h2>
                        <p className="text-gray-500 text-sm max-w-xs mb-10 font-bold leading-relaxed">
                            "Generate comprehensive tax-compliant financial statements and department-wise P&L reports."
                        </p>
                        <div className="grid grid-cols-2 gap-4 w-full max-w-sm">
                            <button className="py-4 bg-blue-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl shadow-blue-900/20 hover:bg-blue-500 transition-all">Daily Recap</button>
                            <button className="py-4 bg-white/5 border border-white/5 text-gray-400 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 transition-all">Monthly P&L</button>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}
