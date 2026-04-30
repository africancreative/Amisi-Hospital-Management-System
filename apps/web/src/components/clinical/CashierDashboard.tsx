'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Wallet, 
    CreditCard, 
    Banknote, 
    Smartphone, 
    Printer, 
    CheckCircle2, 
    Clock, 
    ChevronRight, 
    UserCircle2,
    ArrowRightCircle,
    Receipt,
    Tag,
    AlertCircle,
    ShieldCheck
} from 'lucide-react';
import Image from 'next/image';

interface PendingBill {
    id: string;
    patientName: string;
    mrn: string;
    waitTime: string;
    items: {
        id: string;
        service: string;
        amount: number;
    }[];
}

export default function CashierDashboard() {
    const [queue, setQueue] = useState<PendingBill[]>([
        { 
            id: 'INV-4021', patientName: 'Robert Johnson', mrn: 'AM-4521', waitTime: '4m',
            items: [
                { id: '1', service: 'OPD Consultation', amount: 1500 },
                { id: '2', service: 'Full Blood Count', amount: 850 },
                { id: '3', service: 'Malaria RDT', amount: 500 },
            ]
        },
        { 
            id: 'INV-4022', patientName: 'Emily White', mrn: 'AM-4522', waitTime: '12m',
            items: [
                { id: '4', service: 'Dental Extraction', amount: 4500 },
                { id: '5', service: 'Antibiotics Batch', amount: 1200 },
            ]
        },
    ]);

    const [activeBill, setActiveBill] = useState<PendingBill | null>(queue[0]);
    const [paymentMethod, setPaymentMethod] = useState<'MPESA' | 'CASH' | 'CARD' | 'INSURANCE' | null>(null);
    const [insuranceDetails, setInsuranceDetails] = useState({ provider: '', policy: '' });
    const [isProcessing, setIsProcessing] = useState(false);
    const [paymentError, setPaymentError] = useState<string | null>(null);
    const [showReceipt, setShowReceipt] = useState(false);

    const calculateTotal = (bill: PendingBill) => {
        return bill.items.reduce((acc, item) => acc + item.amount, 0);
    };

    const handleAddItem = (service: string, amount: number) => {
        if (!activeBill) return;
        const newItem = { id: Math.random().toString(), service, amount };
        setActiveBill({ ...activeBill, items: [...activeBill.items, newItem] });
    };

    const handleRemoveItem = (id: string) => {
        if (!activeBill) return;
        setActiveBill({ ...activeBill, items: activeBill.items.filter(i => i.id !== id) });
    };

    const processPayment = async () => {
        if (!activeBill || !paymentMethod) return;
        
        setIsProcessing(true);
        setPaymentError(null);

        // Simulate M-Pesa Latency or Failure
        if (paymentMethod === 'MPESA') {
            await new Promise(r => setTimeout(r, 2000));
            if (Math.random() > 0.8) {
                setPaymentError('STK Push Timeout: Please check patient phone.');
                setIsProcessing(false);
                return;
            }
        }

        // Mock success
        setShowReceipt(true);
        setIsProcessing(false);
    };

    const finalizePayment = () => {
        setQueue(prev => prev.filter(b => b.id !== activeBill?.id));
        setActiveBill(null);
        setPaymentMethod(null);
        setShowReceipt(false);
    };

    return (
        <div className="flex flex-col h-screen bg-[#07070a] text-white overflow-hidden">
            {/* TOP BAR */}
            <header className="h-20 bg-gray-900/80 border-b border-gray-800 flex items-center justify-between px-8 shrink-0 backdrop-blur-xl z-20">
                <div className="flex items-center gap-6">
                    <Image src="/logo.png" alt="AmisiMedOS" width={40} height={40} className="object-contain" />
                    <div className="h-8 w-[1px] bg-gray-800"></div>
                    <h1 className="text-sm font-black uppercase tracking-[0.2em] text-emerald-500">Revenue Management Suite</h1>
                </div>

                <div className="flex items-center gap-6">
                    <div className="bg-emerald-600/10 border border-emerald-500/20 rounded-full px-4 py-1 flex items-center gap-2">
                        <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live POS Active</span>
                    </div>
                </div>
            </header>

            <div className="flex flex-1 overflow-hidden p-6 gap-6">
                {/* LEFT PANEL: PENDING BILLS */}
                <aside className="w-80 flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-500">Pending Invoices</h2>
                        <span className="text-[10px] font-black bg-white/5 px-3 py-1 rounded-full">{queue.length}</span>
                    </div>
                    
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 custom-scrollbar">
                        {queue.map(bill => (
                            <button 
                                key={bill.id}
                                onClick={() => setActiveBill(bill)}
                                className={`w-full p-6 rounded-[32px] border transition-all text-left relative overflow-hidden group ${
                                    activeBill?.id === bill.id 
                                    ? 'bg-emerald-600/10 border-emerald-500/50 ring-2 ring-emerald-500/20' 
                                    : 'bg-gray-900/40 border-gray-800 hover:border-gray-700'
                                }`}
                            >
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className="font-black text-base truncate pr-4">{bill.patientName}</h3>
                                    <span className="text-[10px] font-black text-emerald-500">{bill.waitTime}</span>
                                </div>
                                <div className="flex items-center justify-between text-[10px] font-bold text-gray-500">
                                    <span className="uppercase">{bill.mrn}</span>
                                    <span className="font-black text-white">KES {calculateTotal(bill).toLocaleString()}</span>
                                </div>
                                <div className="absolute bottom-0 left-0 h-1 bg-emerald-500 transition-all duration-500" style={{ width: activeBill?.id === bill.id ? '100%' : '0%' }}></div>
                            </button>
                        ))}
                    </div>
                </aside>

                {/* CENTER PANEL: POS INTERFACE */}
                <main className="flex-1 flex flex-col bg-gray-900/20 border border-gray-800 rounded-[48px] overflow-hidden relative">
                    {activeBill ? (
                        <>
                            <div className="p-8 border-b border-gray-800 bg-gray-900/40 flex items-center justify-between">
                                <div className="flex items-center gap-6">
                                    <div className="h-16 w-16 rounded-3xl bg-emerald-600 flex items-center justify-center font-black text-2xl shadow-2xl text-white">
                                        {activeBill.patientName[0]}
                                    </div>
                                    <div>
                                        <h2 className="text-2xl font-black uppercase tracking-tight">{activeBill.patientName}</h2>
                                        <p className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em]">Inv ID: {activeBill.id} • {activeBill.mrn}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => handleAddItem('Nursing Fee', 500)} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5">+ Nursing</button>
                                    <button onClick={() => handleAddItem('Dressing', 1200)} className="bg-white/5 hover:bg-white/10 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5">+ Dressing</button>
                                </div>
                            </div>

                            <div className="flex-1 p-10 overflow-y-auto space-y-4 custom-scrollbar">
                                {activeBill.items.map(item => (
                                    <div key={item.id} className="bg-gray-900/40 border border-white/5 p-6 rounded-3xl flex justify-between items-center group transition-all hover:bg-gray-900/60">
                                        <div className="flex items-center gap-4">
                                            <div className="h-10 w-10 bg-white/5 rounded-xl flex items-center justify-center text-gray-500 group-hover:text-emerald-500 transition-colors"><Tag className="h-5 w-5" /></div>
                                            <span className="font-bold text-gray-300">{item.service}</span>
                                        </div>
                                        <div className="flex items-center gap-8">
                                            <span className="font-mono font-black text-lg">KES {item.amount.toLocaleString()}</span>
                                            <button 
                                                onClick={() => handleRemoveItem(item.id)}
                                                className="h-8 w-8 rounded-lg bg-rose-500/10 text-rose-500 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center hover:bg-rose-500 hover:text-white"
                                            >
                                                ×
                                            </button>
                                        </div>
                                    </div>
                                ))}

                                <div className="mt-12 pt-8 border-t border-gray-800 flex justify-between items-center px-4">
                                    <span className="text-sm font-black text-gray-500 uppercase tracking-[0.2em]">Running Total</span>
                                    <span className="text-6xl font-black text-emerald-500 tracking-tighter">KES {calculateTotal(activeBill).toLocaleString()}</span>
                                </div>
                            </div>

                            {/* SUCCESS MODAL / RECEIPT PREVIEW */}
                            <AnimatePresence>
                                {showReceipt && (
                                    <motion.div 
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="absolute inset-0 z-50 bg-[#07070a]/95 flex items-center justify-center p-12"
                                    >
                                        <div className="bg-white text-black p-12 rounded-[32px] w-full max-w-md shadow-[0_0_100px_rgba(16,185,129,0.2)] flex flex-col items-center">
                                            <div className="h-16 w-16 bg-emerald-500 rounded-full flex items-center justify-center mb-6">
                                                <CheckCircle2 className="h-8 w-8 text-white" />
                                            </div>
                                            <h2 className="text-2xl font-black uppercase mb-1">Payment Success</h2>
                                            <p className="text-gray-500 text-xs font-bold uppercase tracking-widest mb-8">Transaction Confirmed</p>
                                            
                                            <div className="w-full border-t border-dashed border-gray-200 py-6 space-y-2">
                                                <div className="flex justify-between text-sm font-bold"><span>Patient</span> <span>{activeBill.patientName}</span></div>
                                                <div className="flex justify-between text-sm font-bold"><span>Total Paid</span> <span className="font-black text-lg">KES {calculateTotal(activeBill).toLocaleString()}</span></div>
                                                <div className="flex justify-between text-sm font-bold"><span>Method</span> <span className="uppercase text-emerald-600">{paymentMethod}</span></div>
                                                {paymentMethod === 'INSURANCE' && (
                                                    <div className="flex justify-between text-[10px] font-black text-blue-600 uppercase border-t border-blue-50 mt-4 pt-2">
                                                        <span>Provider: {insuranceDetails.provider}</span>
                                                        <span>ID: {insuranceDetails.policy}</span>
                                                    </div>
                                                )}
                                            </div>

                                            <button 
                                                onClick={finalizePayment}
                                                className="w-full py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest mt-4 shadow-xl shadow-gray-200"
                                            >
                                                Close & Next Patient
                                            </button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-center p-12">
                            <div className="h-24 w-24 rounded-full bg-emerald-600/5 flex items-center justify-center mb-8">
                                <Wallet className="h-12 w-12 text-emerald-500/40" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-tight mb-2">POS Ready</h2>
                            <p className="text-gray-600 text-sm max-w-xs">Awaiting patient invoices from Clinical or Pharmacy stations.</p>
                        </div>
                    )}
                </main>

                {/* RIGHT PANEL: PAYMENT DIRECTIVE */}
                <aside className="w-96 flex flex-col gap-6">
                    <div className="bg-gray-900/40 border border-gray-800 rounded-[40px] p-8 flex flex-col h-full overflow-y-auto custom-scrollbar">
                        <h3 className="text-xs font-black text-gray-500 uppercase tracking-widest mb-6">Payment Resolution</h3>
                        
                        <div className="space-y-3">
                            {[
                                { id: 'MPESA', icon: Smartphone, label: 'M-Pesa STK' },
                                { id: 'CASH', icon: Banknote, label: 'Cash' },
                                { id: 'CARD', icon: CreditCard, label: 'Credit Card' },
                                { id: 'INSURANCE', icon: ShieldCheck, label: 'Insurance' },
                            ].map(m => (
                                <button 
                                    key={m.id}
                                    onClick={() => { setPaymentMethod(m.id as any); setPaymentError(null); }}
                                    className={`w-full py-6 rounded-3xl border transition-all flex flex-col items-center gap-2 group ${
                                        paymentMethod === m.id 
                                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-xl shadow-emerald-900/40' 
                                        : 'bg-white/5 border-white/5 text-gray-500 hover:border-emerald-500/30'
                                    }`}
                                >
                                    <m.icon className={`h-6 w-6 ${paymentMethod === m.id ? 'text-white' : 'group-hover:text-emerald-500'} transition-colors`} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{m.label}</span>
                                </button>
                            ))}
                        </div>

                        <AnimatePresence>
                            {paymentMethod === 'INSURANCE' && (
                                <motion.div 
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="mt-6 space-y-4 bg-blue-600/5 p-6 rounded-3xl border border-blue-500/20"
                                >
                                    <div className="flex items-center gap-2 text-blue-500 mb-2">
                                        <ShieldCheck className="h-4 w-4" />
                                        <span className="text-[10px] font-black uppercase tracking-widest">Policy Details</span>
                                    </div>
                                    <input 
                                        type="text" 
                                        placeholder="Provider (e.g. NHIF, Jubilee)"
                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-blue-500 transition-all"
                                        value={insuranceDetails.provider}
                                        onChange={(e) => setInsuranceDetails({ ...insuranceDetails, provider: e.target.value })}
                                    />
                                    <input 
                                        type="text" 
                                        placeholder="Member/Policy Number"
                                        className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-xs font-bold focus:outline-none focus:border-blue-500 transition-all"
                                        value={insuranceDetails.policy}
                                        onChange={(e) => setInsuranceDetails({ ...insuranceDetails, policy: e.target.value })}
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {paymentError && (
                            <motion.div 
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="mt-6 p-4 bg-rose-500/10 border border-rose-500/20 rounded-2xl flex items-center gap-3 text-rose-500"
                            >
                                <AlertCircle className="h-5 w-5 shrink-0" />
                                <span className="text-[10px] font-black leading-relaxed">{paymentError}</span>
                            </motion.div>
                        )}

                        <div className="mt-auto pt-8">
                            <button 
                                onClick={processPayment}
                                disabled={!activeBill || !paymentMethod || isProcessing}
                                className={`w-full py-6 rounded-3xl font-black text-xs uppercase tracking-[0.2em] transition-all flex flex-col items-center gap-2 shadow-2xl ${
                                    activeBill && paymentMethod && !isProcessing
                                    ? 'bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40' 
                                    : 'bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                                }`}
                            >
                                {isProcessing ? (
                                    <div className="h-6 w-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                ) : (
                                    <>
                                        <Printer className="h-6 w-6" />
                                        Complete & Receipt
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </aside>
            </div>

        </div>
    );
}
