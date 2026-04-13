'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/client';
import { 
  FlaskConical, 
  Beaker, 
  ClipboardList, 
  CheckCircle2, 
  Clock, 
  Search,
  PlusCircle,
  FileText,
  AlertCircle
} from 'lucide-react';

export default function LaboratoryDashboard() {
  const { data: orders, isLoading, refetch } = api.lab.getActiveOrders.useQuery();
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [view, setView] = useState<'QUEUE' | 'ANALYZE'>('QUEUE');

  const stats = [
    { label: 'Pending Collection', count: orders?.filter(o => o.status === 'PENDING').length || 0, icon: FlaskConical, color: 'text-amber-500' },
    { label: 'In Analysis', count: orders?.filter(o => o.status === 'SAMPLE_COLLECTED').length || 0, icon: Beaker, color: 'text-blue-500' },
    { label: 'Critical Results', count: 0, icon: AlertCircle, color: 'text-rose-500' },
    { label: 'Completed Today', count: 0, icon: CheckCircle2, color: 'text-emerald-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-950 text-slate-100">
      {/* Header */}
      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-500/10 rounded-lg">
            <FlaskConical className="text-blue-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black">Clinical <span className="text-blue-500">Laboratory</span></h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-bold">Diagnostics & Pathology</p>
          </div>
        </div>

        <div className="flex gap-4">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <input 
               type="text" 
               placeholder="Search Patient or Order ID..." 
               className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 w-64 transition-all"
             />
           </div>
           <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold text-sm transition-all shadow-lg shadow-blue-500/10">
             <PlusCircle size={18} />
             Walk-in Lab Order
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6 space-y-6">
        {/* Stats Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {stats.map((s, i) => (
             <div key={i} className="bg-white/5 border border-white/10 p-4 rounded-2xl flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-white/5 ${s.color}`}>
                  <s.icon size={24} />
                </div>
                <div>
                  <p className="text-3xl font-black">{s.count}</p>
                  <p className="text-xs text-slate-500 font-bold uppercase tracking-tight">{s.label}</p>
                </div>
             </div>
           ))}
        </div>

        {/* Content Area */}
        <div className="flex gap-6 h-[calc(100%-120px)]">
           {/* Worklist Sidebar */}
           <div className="w-96 flex flex-col gap-4 overflow-y-auto pr-2">
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest px-2">Active Worklist</h3>
              {isLoading ? (
                <div className="p-8 text-center text-slate-500">Loading worklist...</div>
              ) : orders?.map((order) => (
                <button 
                  key={order.id}
                  onClick={() => setActiveOrder(order)}
                  className={`p-4 rounded-2xl text-left border transition-all ${activeOrder?.id === order.id ? 'bg-blue-600/10 border-blue-500/50' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-[10px] bg-white/10 px-2 py-0.5 rounded-full font-bold text-slate-400">#{order.id.slice(0, 8)}</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        order.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' : 
                        order.status === 'SAMPLE_COLLECTED' ? 'bg-blue-500/10 text-blue-500' : 'bg-emerald-500/10 text-emerald-500'
                    }`}>
                      {order.status.replace('_', ' ')}
                    </span>
                  </div>
                  <h4 className="font-bold text-white mb-1 truncate">{order.patient?.firstName} {order.patient?.lastName}</h4>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <ClipboardList size={12} />
                    <span className="text-blue-400 font-bold">{order.testPanelId}</span>
                  </div>
                </button>
              ))}
           </div>

           {/* Detail / Action View */}
           <div className="flex-1 bg-white/5 border border-white/10 rounded-3xl overflow-hidden flex flex-col">
              {activeOrder ? (
                <>
                  <div className="p-8 border-b border-white/10 bg-white/[0.02]">
                    <div className="flex justify-between items-start">
                       <div>
                          <h2 className="text-2xl font-black mb-1">{activeOrder.testPanelId} Test Order</h2>
                          <div className="flex items-center gap-4 text-sm">
                             <span className="text-slate-400">Patient: <b className="text-white">{activeOrder.patient?.firstName} {activeOrder.patient?.lastName}</b></span>
                             <span className="text-slate-400">DOB: <b className="text-white">{new Date(activeOrder.patient?.dob).toLocaleDateString()}</b></span>
                          </div>
                       </div>
                       <div className="p-3 bg-white/5 rounded-2xl border border-white/10 flex items-center gap-4">
                          <div className="text-right">
                             <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Priority</p>
                             <p className="text-sm font-black text-rose-500">{activeOrder.urgency}</p>
                          </div>
                          <Clock className="text-slate-500" />
                       </div>
                    </div>
                  </div>

                  <div className="flex-1 p-8">
                     {activeOrder.status === 'PENDING' ? (
                        <div className="flex flex-col items-center justify-center h-full text-center space-y-6">
                           <div className="p-6 bg-amber-500/10 rounded-full border border-amber-500/20">
                              <FlaskConical className="text-amber-500" size={48} />
                           </div>
                           <div>
                              <h3 className="text-xl font-bold">Awaiting Sample Collection</h3>
                              <p className="text-slate-400 max-w-sm mt-2">The sample for this order has not been collected yet. Please proceed with phlebotomy.</p>
                           </div>
                           <button className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white font-black rounded-2xl shadow-xl shadow-blue-600/20 transition-all active:scale-95">
                              Check-in Sample
                           </button>
                        </div>
                     ) : (
                        <div className="space-y-8">
                           <div className="grid grid-cols-2 gap-8">
                              <div className="space-y-4">
                                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Specimen Details</h4>
                                 <div className="bg-white/5 p-4 rounded-2xl border border-white/10">
                                    {activeOrder.samples?.[0] ? (
                                       <div className="space-y-2">
                                          <p className="text-sm">Type: <span className="font-bold">{activeOrder.samples[0].specimenType}</span></p>
                                          <p className="text-sm">Barcode: <span className="font-bold text-blue-400">{activeOrder.samples[0].barcode}</span></p>
                                          <p className="text-[10px] text-slate-500 uppercase font-black">Collected {new Date(activeOrder.samples[0].collectedAt).toLocaleString()}</p>
                                       </div>
                                    ) : <p className="text-slate-500 italic">No sample recorded</p>}
                                 </div>
                              </div>
                              <div className="space-y-4">
                                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest">Clinical Notes</h4>
                                 <div className="bg-white/5 p-4 rounded-2xl border border-white/10 min-h-[100px] text-sm text-slate-300 italic">
                                    {activeOrder.clinicalNotes || "No specific instructions provided by referring physician."}
                                 </div>
                              </div>
                           </div>

                           <div className="space-y-4">
                              <div className="flex justify-between items-center">
                                 <h4 className="text-sm font-bold text-slate-400 uppercase tracking-widest border-l-4 border-blue-500 pl-3">Result Parameters</h4>
                                 <button className="text-xs font-bold text-blue-400 hover:text-blue-300">Add Parameter</button>
                              </div>
                              
                              <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                                 <table className="w-full text-left text-sm">
                                    <thead className="bg-white/5">
                                       <tr>
                                          <th className="p-4 font-bold text-slate-400 uppercase text-[10px]">Parameter</th>
                                          <th className="p-4 font-bold text-slate-400 uppercase text-[10px]">Result</th>
                                          <th className="p-4 font-bold text-slate-400 uppercase text-[10px]">Unit</th>
                                          <th className="p-4 font-bold text-slate-400 uppercase text-[10px]">Reference Range</th>
                                          <th className="p-4 font-bold text-slate-400 uppercase text-[10px]">Flag</th>
                                       </tr>
                                    </thead>
                                    <tbody className="divide-y divide-white/5">
                                       {[1,2,3].map(i => (
                                          <tr key={i} className="hover:bg-white/[0.02]">
                                             <td className="p-4">
                                                <input type="text" placeholder="e.g. Hemoglobin" className="bg-transparent border-none focus:outline-none w-full text-white font-semibold" />
                                             </td>
                                             <td className="p-4">
                                                <input type="text" placeholder="0.00" className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 focus:border-blue-500/50 w-24 text-center font-black" />
                                             </td>
                                             <td className="p-4">
                                                <input type="text" placeholder="g/dL" className="bg-transparent border-none focus:outline-none w-16 text-slate-500 italic" />
                                             </td>
                                             <td className="p-4">
                                                <div className="flex gap-2">
                                                   <input type="text" placeholder="Min" className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 w-16 text-center text-xs" />
                                                   <input type="text" placeholder="Max" className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 w-16 text-center text-xs" />
                                                </div>
                                             </td>
                                             <td className="p-4">
                                                <select className="bg-white/5 border border-white/10 rounded-lg px-2 py-1 text-xs font-bold text-slate-400 appearance-none cursor-pointer">
                                                   <option>NORMAL</option>
                                                   <option>HIGH</option>
                                                   <option>LOW</option>
                                                </select>
                                             </td>
                                          </tr>
                                       ))}
                                    </tbody>
                                 </table>
                              </div>
                           </div>
                           
                           <div className="flex justify-end gap-4 p-4">
                              <button className="px-6 py-2 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-all">Save Draft</button>
                              <button className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl shadow-lg shadow-emerald-600/10 transition-all">Submit for Validation</button>
                           </div>
                        </div>
                     )}
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-slate-600">
                   <div className="p-6 bg-white/5 rounded-full mb-4">
                      <FileText size={48} strokeWidth={1} />
                   </div>
                   <p className="font-bold text-lg">Select a lab order from the worklist</p>
                   <p className="text-sm">Patient diagnostics details will appear here</p>
                </div>
              )}
           </div>
        </div>
      </main>
    </div>
  );
}
