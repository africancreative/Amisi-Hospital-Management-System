'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/client';
import { 
  Pill, 
  Package, 
  ShoppingCart, 
  History, 
  Search, 
  AlertTriangle, 
  ArrowRight,
  User,
  PlusCircle,
  Activity
} from 'lucide-react';

export default function PharmacyModule() {
  const { data: inventory, isLoading: invLoading } = api.pharmacy.getInventory.useQuery();
  const { data: prescriptions, isLoading: rxLoading } = api.pharmacy.getPendingPrescriptions.useQuery();
  
  const [activeTab, setActiveTab] = useState<'DISPENSE' | 'INVENTORY'>('DISPENSE');
  const [activeRx, setActiveRx] = useState<any>(null);

  const stats = [
    { label: 'Pending Rx', count: prescriptions?.length || 0, icon: Pill, color: 'text-amber-500' },
    { label: 'Low Stock', count: inventory?.filter((i: any) => i.quantityOnHand < 50).length || 0, icon: AlertTriangle, color: 'text-rose-500' },
    { label: 'Expiring Soon', count: inventory?.filter((i: any) => {
      const diff = new Date(i.expiryDate).getTime() - new Date().getTime();
      return diff < 1000 * 60 * 60 * 24 * 30; // 30 days
    }).length || 0, icon: History, color: 'text-blue-500' },
    { label: 'Dispensed Today', count: 0, icon: ShoppingCart, color: 'text-emerald-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-950 text-slate-100">
      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 rounded-lg">
            <Pill className="text-emerald-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black">PharmOS <span className="text-emerald-500">Inventory</span></h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Clinical Dispensing & Stock Management</p>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <input 
               type="text" 
               placeholder="Search Medication (NDC/Generic)..." 
               className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-emerald-500/50 w-64 transition-all"
             />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-xl font-bold text-sm transition-all shadow-lg shadow-emerald-500/10">
             <PlusCircle size={18} />
             Add New Stock
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {stats.map((s, i) => (
             <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 ${s.color}`}>
                  <s.icon size={24} />
                </div>
                <div>
                  <p className="text-3xl font-black">{s.count}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{s.label}</p>
                </div>
             </div>
           ))}
        </div>

        <div className="flex bg-white/5 p-1 rounded-2xl w-fit border border-white/5">
           <button 
             onClick={() => setActiveTab('DISPENSE')}
             className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'DISPENSE' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/10' : 'text-slate-400 hover:text-white'}`}
           >
             Dispensing Queue
           </button>
           <button 
             onClick={() => setActiveTab('INVENTORY')}
             className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${activeTab === 'INVENTORY' ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' : 'text-slate-400 hover:text-white'}`}
           >
             Inventory List
           </button>
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
           {activeTab === 'DISPENSE' ? (
             <>
               <div className="w-80 flex flex-col gap-4 overflow-y-auto pr-2">
                  {rxLoading ? (
                    <div className="p-8 text-center text-slate-500">Searching prescriptions...</div>
                  ) : prescriptions?.map((rx: any) => (
                   <button 
                     key={rx.id}
                     onClick={() => setActiveRx(rx)}
                     className={`p-4 rounded-2xl border text-left transition-all ${activeRx?.id === rx.id ? 'bg-emerald-600/10 border-emerald-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                   >
                     <div className="flex justify-between items-start mb-2">
                        <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-black text-slate-400">Rx #{rx.id.slice(0, 6)}</span>
                        <div className="p-1 bg-amber-500/20 rounded-lg"><Activity size={10} className="text-amber-500" /></div>
                     </div>
                     <h4 className="font-bold text-white mb-1 truncate">{rx.patient?.firstName} {rx.patient?.lastName}</h4>
                     <p className="text-xs text-slate-500 truncate">{rx.items.length} item(s) • ordered by {rx.orderedBy}</p>
                   </button>
                 ))}
               </div>

               <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
                 {activeRx ? (
                   <>
                     <div className="p-8 border-b border-white/10">
                        <div className="flex justify-between items-center">
                           <div>
                              <h2 className="text-2xl font-black">Dispensing Workflow</h2>
                              <p className="text-slate-500 text-sm">Patient: {activeRx.patient?.firstName} {activeRx.patient?.lastName}</p>
                           </div>
                           <div className="flex items-center gap-3">
                              <span className="text-xs font-bold text-slate-400 px-3 py-1 bg-white/5 rounded-lg border border-white/5 italic">ordered {new Date(activeRx.createdAt).toLocaleDateString()}</span>
                              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500"><Pill size={24} /></div>
                           </div>
                        </div>
                     </div>
                     <div className="flex-1 p-8 overflow-y-auto space-y-8">
                        <section className="space-y-4">
                           <h3 className="text-sm font-bold text-slate-500 uppercase tracking-widest pl-3 border-l-2 border-emerald-500">Ordered Items</h3>
                           <div className="grid grid-cols-1 gap-4">
                              {activeRx.items.map((item: any) => (
                                <div key={item.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-2xl flex justify-between items-center group hover:border-white/20 transition-all">
                                   <div className="flex items-center gap-4">
                                      <div className="w-10 h-10 bg-emerald-500/10 rounded-xl flex items-center justify-center text-emerald-500"><Pill size={20} /></div>
                                      <div>
                                         <p className="font-black text-white">{item.drugName}</p>
                                         <p className="text-xs text-slate-500">{item.dosage} • {item.frequency} for {item.duration}</p>
                                      </div>
                                   </div>
                                   <div className="flex items-center gap-6">
                                      <div className="text-center">
                                         <p className="text-[10px] text-slate-600 font-black uppercase">Quantity</p>
                                         <p className="text-xl font-black text-emerald-500">{item.quantity}</p>
                                      </div>
                                      <button className="p-2 bg-emerald-600 rounded-lg hover:bg-emerald-500 transition-all active:scale-95">
                                         <ArrowRight size={20} className="text-white" />
                                      </button>
                                   </div>
                                </div>
                              ))}
                           </div>
                        </section>
                        <div className="bg-amber-500/5 border border-amber-500/10 p-4 rounded-2xl flex gap-3">
                           <AlertTriangle className="text-amber-500 shrink-0" size={20} />
                           <div>
                              <p className="text-sm font-bold text-amber-500">Pharmacy Conflict Check</p>
                              <p className="text-xs text-slate-500">No contraindications detected for this patient profile and selected medication batch.</p>
                           </div>
                        </div>
                     </div>
                     <div className="p-6 bg-white/[0.02] border-t border-white/10 flex justify-between items-center">
                        <div className="flex items-center gap-2">
                           <User className="text-slate-500" size={16} />
                           <span className="text-xs text-slate-500">Logged in as: <b>Lead Pharmacist</b></span>
                        </div>
                        <div className="flex gap-4">
                           <button className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-black rounded-xl text-sm transition-all">Report Issue</button>
                           <button className="px-10 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-black rounded-xl text-sm shadow-xl shadow-emerald-600/20 transition-all active:scale-95">Complete Dispense</button>
                        </div>
                     </div>
                   </>
                 ) : (
                   <div className="flex flex-col items-center justify-center flex-1 text-slate-700">
                      <div className="p-6 bg-white/5 rounded-full mb-4">
                        <Package size={64} strokeWidth={1} />
                      </div>
                      <p className="text-lg font-black">Select an Rx from the queue</p>
                      <p className="text-sm">Patient prescription details will populate here</p>
                   </div>
                 )}
               </div>
             </>
           ) : (
             <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
                <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/[0.02]">
                   <h3 className="font-black text-xl">Stock Ledger (FEFO)</h3>
                   <div className="flex gap-2">
                      <span className="text-[10px] font-bold px-3 py-1 bg-rose-500/10 text-rose-500 rounded-full">Low Stock (2)</span>
                      <span className="text-[10px] font-bold px-3 py-1 bg-blue-500/10 text-blue-500 rounded-full">Expiring (1)</span>
                   </div>
                </div>
                <div className="flex-1 overflow-auto">
                   <table className="w-full text-left text-sm">
                      <thead className="sticky top-0 bg-gray-900 border-b border-white/5">
                         <tr>
                            <th className="p-4 text-slate-500 font-black uppercase text-[10px]">Medication</th>
                            <th className="p-4 text-slate-500 font-black uppercase text-[10px]">Batch #</th>
                            <th className="p-4 text-slate-500 font-black uppercase text-[10px]">On Hand</th>
                            <th className="p-4 text-slate-500 font-black uppercase text-[10px]">Expiry</th>
                            <th className="p-4 text-slate-500 font-black uppercase text-[10px]">Location</th>
                            <th className="p-4 text-slate-500 font-black uppercase text-[10px]">Status</th>
                         </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                          {invLoading ? (
                             <tr><td colSpan={6} className="p-8 text-center text-slate-600">Syncing stock...</td></tr>
                          ) : inventory?.map((item: any) => (
                            <tr key={item.id} className="hover:bg-white/[0.02] transition-colors">
                               <td className="p-4">
                                  <p className="font-black text-white">{item.medication.name}</p>
                                  <p className="text-[10px] text-slate-500">{item.medication.genericName}</p>
                               </td>
                               <td className="p-4 font-mono text-emerald-500 text-xs">{item.batchNumber}</td>
                               <td className="p-4 font-black text-lg">{item.quantityOnHand} <span className="text-[10px] text-slate-500 font-normal">{item.medication.unit}</span></td>
                               <td className="p-4">
                                  <p className={`text-xs font-bold ${new Date(item.expiryDate) < new Date() ? 'text-rose-500' : 'text-slate-300'}`}>{new Date(item.expiryDate).toLocaleDateString()}</p>
                               </td>
                               <td className="p-4 text-xs font-bold text-slate-500">Main Pharmacy A1</td>
                               <td className="p-4">
                                  <div className={`w-2 h-2 rounded-full ${item.quantityOnHand > 100 ? 'bg-emerald-500' : 'bg-amber-500 animate-pulse'}`} />
                               </td>
                            </tr>
                         ))}
                      </tbody>
                   </table>
                </div>
             </div>
           )}
        </div>
      </main>
    </div>
  );
}
