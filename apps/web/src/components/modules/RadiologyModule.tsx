'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/client';
import { 
  Scan, 
  Dna, 
  FileText, 
  Layers, 
  Maximize2, 
  ClipboardCheck, 
  Activity, 
  Search,
  Monitor,
  AlertCircle,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';

export default function RadiologyModule() {
  const { data: orders, isLoading: ordersLoading } = api.radiology.getActiveOrders.useQuery();
  const [activeOrder, setActiveOrder] = useState<any>(null);

  return (
    <div className="flex h-full bg-black text-slate-100 font-sans">
      <aside className="w-80 border-r border-white/5 flex flex-col bg-gray-950">
        <div className="p-6 border-b border-white/5">
           <div className="flex items-center gap-2 mb-6"><Scan className="text-blue-500" /><h1 className="font-black text-lg tracking-tighter italic">AMISI <span className="text-blue-500">PACS</span></h1></div>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
            {ordersLoading ? (<div className="p-8 text-center text-slate-700 text-xs">Syncing RIS server...</div>) : orders?.map((order: any) => (
             <button key={order.id} onClick={() => setActiveOrder(order)} className={`w-full p-4 rounded-xl text-left border transition-all ${activeOrder?.id === order.id ? 'bg-blue-600/10 border-blue-500/50' : 'bg-white/[0.02] border-white/5'}`}>
                <h4 className="font-bold text-white text-sm mb-1">{order.patient?.firstName} {order.patient?.lastName}</h4>
                <div className="flex items-center gap-2"><span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded">{order.modality}</span></div>
             </button>
           ))}
        </div>
      </aside>
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
         <div className="flex-1 bg-black relative flex items-center justify-center">
            {activeOrder ? (
               <div className="w-full h-full p-4 relative flex flex-col">
                  <div className="flex-1 bg-gray-900/40 rounded-3xl border border-white/5 flex items-center justify-center relative"><Monitor size={84} className="text-slate-800" /></div>
               </div>
            ) : (<div className="text-center space-y-4 opacity-50"><Dna size={84} className="mx-auto text-slate-800" /><p className="text-xs font-black text-slate-600 uppercase">Select Patient Study</p></div>)}
         </div>
      </main>
    </div>
  );
}
