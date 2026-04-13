'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/client';
import { 
  Receipt, 
  CreditCard, 
  Wallet, 
  Search, 
  FileText, 
  Clock, 
  CheckCircle2, 
  Plus, 
  ArrowRight,
  TrendingUp,
  Landmark
} from 'lucide-react';

export default function BillingDashboard() {
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  const { data: invoice, isLoading: invLoading, refetch } = api.billing.getInvoice.useQuery(activeInvoiceId || '', {
    enabled: !!activeInvoiceId
  });

  const stats = [
    { label: 'Revenue Expected', value: 'KSh 420.5K', icon: TrendingUp, color: 'text-blue-500' },
    { label: 'Unpaid Invoices', value: '24', icon: FileText, color: 'text-amber-500' },
    { label: 'Insurance Pending', value: 'KSh 180.0K', icon: Landmark, color: 'text-indigo-500' },
    { label: 'Collected Today', value: 'KSh 85.2K', icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-950 text-slate-100 font-sans">
      {/* Header */}
      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Receipt className="text-blue-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black">Capital <span className="text-blue-500">Billing</span></h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Revenue Cycle Management</p>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <input 
               type="text" 
               placeholder="Search Patient Name or Invoice #..." 
               className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 w-64 transition-all"
             />
           </div>
           <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm transition-all shadow-xl shadow-blue-600/20">
             <Plus size={18} />
             Create Manual Invoice
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {stats.map((s, i) => (
             <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center gap-4 transition-transform hover:scale-[1.02]">
                <div className={`p-4 rounded-2xl bg-white/5 ${s.color}`}>
                  <s.icon size={26} />
                </div>
                <div>
                  <p className="text-2xl font-black text-white">{s.value}</p>
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{s.label}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
           {/* Sidebar: Open Accounts */}
           <div className="w-96 flex flex-col gap-4 overflow-y-auto pr-2">
              <div className="flex justify-between items-center px-2">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Active Accounts</h3>
                 <button className="text-[10px] font-black text-blue-400">View All</button>
              </div>
              
              {[1, 2, 3, 4, 5].map((i) => (
                <button 
                  key={i}
                  onClick={() => setActiveInvoiceId(`inv-${i}`)}
                  className={`p-5 rounded-3xl border text-left transition-all relative overflow-hidden group ${activeInvoiceId === `inv-${i}` ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/5' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                        <Clock size={12} />
                        <span>Created 2h ago</span>
                     </div>
                     <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-500 uppercase">Partial</span>
                  </div>
                  <h4 className="font-bold text-white text-lg">Amisi Mwangi</h4>
                  <div className="flex justify-between items-end mt-2">
                     <p className="text-xs text-slate-400">Visit: Consultation + Labs</p>
                     <p className="text-xl font-black text-white">KSh 12,500</p>
                  </div>
                  {activeInvoiceId === `inv-${i}` && (
                    <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500" />
                  )}
                </button>
              ))}
           </div>

           {/* Detailed Invoice View */}
           <div className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col relative shadow-2xl">
              {activeInvoiceId ? (
                <>
                  <div className="p-8 border-b border-white/10 flex justify-between items-start bg-white/[0.02]">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <h2 className="text-3xl font-black">Invoice <span className="text-blue-500">#{activeInvoiceId}</span></h2>
                           <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black text-slate-500">VERSION 4.2</span>
                        </div>
                        <div className="flex gap-6 text-sm">
                           <span className="text-slate-400">Patient ID: <b className="text-white">PNT-00125</b></span>
                           <span className="text-slate-400">Visit ID: <b className="text-white">VST-7890</b></span>
                        </div>
                     </div>
                     <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Balance Due</p>
                        <p className="text-4xl font-black text-rose-500 leading-none">KSh 8,250</p>
                     </div>
                  </div>

                  <div className="flex-1 p-8 overflow-y-auto space-y-8">
                     {/* Line Items */}
                     <section className="space-y-4">
                        <div className="flex justify-between items-center">
                           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-3 border-l-4 border-blue-500">Billable Services</h3>
                           <button className="text-xs font-bold text-blue-400 flex items-center gap-1"><Plus size={14} /> Add Item</button>
                        </div>
                        <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden">
                           <table className="w-full text-left text-sm">
                              <thead className="bg-white/5">
                                 <tr>
                                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Service/Item</th>
                                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Qty</th>
                                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Unit Price</th>
                                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total</th>
                                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                 {[
                                    { desc: 'General Consultation', qty: 1, price: 1500, cat: 'CONSULTATION', status: 'PAID' },
                                    { desc: 'Complete Blood Count (CBC)', qty: 1, price: 2500, cat: 'LAB', status: 'UNPAID' },
                                    { desc: 'Urinalysis', qty: 1, price: 1200, cat: 'LAB', status: 'UNPAID' },
                                    { desc: 'Paracetamol 500mg (Blister)', qty: 3, price: 250, cat: 'PHARMACY', status: 'UNPAID' },
                                 ].map((item, idx) => (
                                    <tr key={idx} className="hover:bg-white/[0.01]">
                                       <td className="p-4">
                                          <p className="font-bold text-white">{item.desc}</p>
                                          <p className="text-[10px] text-slate-500 font-bold">{item.cat}</p>
                                       </td>
                                       <td className="p-4 text-center font-bold text-slate-400">{item.qty}</td>
                                       <td className="p-4 text-right font-medium text-slate-400">KSh {item.price.toLocaleString()}</td>
                                       <td className="p-4 text-right font-black text-white">KSh {(item.qty * item.price).toLocaleString()}</td>
                                       <td className="p-4 text-center">
                                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${item.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                             {item.status}
                                          </span>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </section>

                     {/* Payment & Insurance Section */}
                     <div className="grid grid-cols-2 gap-8">
                        <section className="space-y-4">
                           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-3 border-l-4 border-indigo-500">Payer Information</h3>
                           <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-3xl space-y-4">
                               <div className="flex gap-4">
                                  <button className="flex-1 py-3 bg-white/5 border border-indigo-500/50 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white shadow-xl shadow-indigo-500/5">
                                     <Wallet size={18} className="text-indigo-500" /> Cash / Card
                                  </button>
                                  <button className="flex-1 py-3 bg-indigo-600 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold text-white shadow-xl shadow-indigo-500/20 active:scale-95 transition-all">
                                     <Landmark size={18} /> Insurance
                                  </button>
                               </div>
                               <div className="space-y-2">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Policy / pre-auth Details</p>
                                  <input type="text" placeholder="NHIF / GA Insurance Policy #" className="w-full bg-white/5 border border-white/10 rounded-2xl py-3 px-4 text-sm focus:outline-none focus:border-indigo-500/50" />
                               </div>
                           </div>
                        </section>

                        <section className="space-y-4">
                           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-3 border-l-4 border-emerald-500">Record Payment</h3>
                           <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl space-y-4">
                               <div className="relative">
                                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1 px-1">Amount to pay</p>
                                  <div className="relative">
                                     <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-emerald-500">KSh</span>
                                     <input type="number" placeholder="0.00" className="w-full bg-white/5 border border-emerald-500/20 rounded-2xl py-4 pl-14 pr-4 text-2xl font-black focus:outline-none focus:border-emerald-500/50" />
                                  </div>
                               </div>
                               <button className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-lg text-white shadow-2xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-3">
                                  <CreditCard size={24} />
                                  Post Payment
                               </button>
                           </div>
                        </section>
                     </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 space-y-4 text-slate-700">
                   <div className="p-8 border-2 border-dashed border-white/5 rounded-full">
                      <FileText size={84} strokeWidth={1} />
                   </div>
                   <div className="text-center">
                      <h4 className="text-xl font-black text-slate-500">No Invoice Selected</h4>
                      <p className="text-sm text-slate-600">Choose a patient from the list to begin settlement</p>
                   </div>
                   <button className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 rounded-full text-xs font-black text-slate-400 transition-all">
                      <Search size={14} /> Search Records
                   </button>
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}
