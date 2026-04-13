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

export default function RadiologyDashboard() {
  const { data: orders, isLoading: ordersLoading } = api.radiology.getActiveOrders.useQuery();
  const [activeOrder, setActiveOrder] = useState<any>(null);
  const [activeStudy, setActiveStudy] = useState<any>(null);
  const [selectedInstance, setSelectedInstance] = useState<string | null>(null);

  const { data: studyDetails, isLoading: studyLoading } = api.radiology.getImagingStudy.useQuery(
    { studyId: activeOrder?.studies?.[0]?.id || '' },
    { enabled: !!activeOrder?.studies?.[0]?.id }
  );

  return (
    <div className="flex h-full bg-black text-slate-100 font-sans">
      {/* Sidebar: Worklist */}
      <aside className="w-80 border-r border-white/5 flex flex-col bg-gray-950">
        <div className="p-6 border-b border-white/5">
           <div className="flex items-center gap-2 mb-6">
              <Scan className="text-blue-500" />
              <h1 className="font-black text-lg tracking-tighter italic">AMISI <span className="text-blue-500">PACS</span></h1>
           </div>
           
           <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={14} />
              <input 
                 type="text" 
                 placeholder="Search Accession / Case..." 
                 className="w-full bg-white/5 border border-white/10 rounded-lg py-1.5 pl-9 pr-3 text-xs focus:outline-none focus:border-blue-500/50"
              />
           </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3">
           <div className="flex justify-between items-center mb-1">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest pl-2">RIS Worklist</h3>
              <LayoutGrid size={14} className="text-slate-500" />
           </div>
           
           {ordersLoading ? (
             <div className="p-8 text-center text-slate-700 text-xs">Syncing RIS server...</div>
           ) : orders?.map((order) => (
             <button 
                key={order.id}
                onClick={() => setActiveOrder(order)}
                className={`w-full p-4 rounded-xl text-left border transition-all relative overflow-hidden group ${activeOrder?.id === order.id ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/5' : 'bg-white/[0.02] border-white/5 hover:border-white/10'}`}
             >
                <div className="flex justify-between items-start mb-2">
                   <span className="text-[9px] font-black text-slate-500">ACC: {order.id.slice(0, 8)}</span>
                   <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${order.urgency === 'STAT' ? 'bg-rose-500/20 text-rose-500' : 'bg-blue-500/20 text-blue-500'}`}>{order.urgency}</span>
                </div>
                <h4 className="font-bold text-white text-sm mb-1">{order.patient?.firstName} {order.patient?.lastName}</h4>
                <div className="flex items-center gap-2">
                   <span className="text-[10px] font-black text-blue-400 bg-blue-400/10 px-1.5 py-0.5 rounded italic">{order.modality}</span>
                   <span className="text-[10px] text-slate-500 font-bold truncate">{order.targetRegion}</span>
                </div>
                
                <div className={`absolute right-0 top-0 bottom-0 w-1 transition-all ${activeOrder?.id === order.id ? 'bg-blue-500' : 'bg-transparent'}`} />
             </button>
           ))}
        </div>
      </aside>

      {/* Main Workspace */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
         {/* Top Info Bar */}
         <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-gray-950/80 backdrop-blur-md">
            {activeOrder ? (
               <div className="flex items-center gap-8">
                  <div className="flex items-center gap-4">
                     <p className="text-xs text-slate-500">Patient: <b className="text-slate-100">{activeOrder.patient?.firstName} {activeOrder.patient?.lastName}</b></p>
                     <p className="text-xs text-slate-500">Sex: <b className="text-slate-100">{activeOrder.patient?.sex}</b></p>
                     <p className="text-xs text-slate-500">Age: <b className="text-slate-100">34Y</b></p>
                  </div>
                  <div className="h-4 w-px bg-white/10" />
                  <p className="text-xs text-slate-500">Procedure: <b className="text-blue-400">{activeOrder.targetRegion} - {activeOrder.modality}</b></p>
               </div>
            ) : (
               <p className="text-xs text-slate-600 italic">No case selected</p>
            )}

            <div className="flex items-center gap-4">
               <button className="p-2 text-slate-400 hover:text-white transition-colors"><Maximize2 size={16} /></button>
               <button className="px-4 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-black text-xs rounded-lg transition-all shadow-lg shadow-blue-500/10">Compare Prior</button>
            </div>
         </div>

         {/* Viewer Workspace */}
         <div className="flex-1 flex overflow-hidden">
            {/* Thumbnail Navigation */}
            <div className="w-24 border-r border-white/5 bg-gray-900 overflow-y-auto p-2 space-y-4">
               {studyLoading ? (
                  [1,2,3].map(i => <div key={i} className="aspect-square bg-white/5 rounded-lg animate-pulse" />)
               ) : studyDetails?.series?.map((s: any) => (
                  <button 
                     key={s.id} 
                     className="w-full aspect-square bg-gray-800 rounded-lg border border-white/5 overflow-hidden group relative hover:border-blue-500/50 transition-all"
                  >
                     <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-1.5 flex flex-col justify-end">
                        <p className="text-[8px] font-black text-slate-400 truncate">{s.seriesDescription || 'Series ' + s.seriesNumber}</p>
                        <p className="text-[8px] font-black text-blue-500">{s.instances?.length} IMG</p>
                     </div>
                  </button>
               ))}
            </div>

            {/* Main Image View */}
            <div className="flex-1 bg-black relative flex items-center justify-center overflow-hidden">
               {activeOrder ? (
                  <div className="w-full h-full p-4 relative flex flex-col">
                     {/* Placeholder DICOM Area */}
                     <div className="flex-1 bg-gray-900/40 rounded-3xl border border-white/5 flex items-center justify-center relative group">
                        <Monitor size={84} className="text-slate-800 group-hover:text-blue-900 transition-colors duration-1000" />
                        
                        {/* Corner Overlays */}
                        <div className="absolute top-6 left-6 text-[10px] font-mono text-slate-500 space-y-1">
                           <p>ID: {activeOrder.patient?.id.slice(0, 12)}</p>
                           <p>SER: 2  IMG: 14</p>
                        </div>
                        <div className="absolute top-6 right-6 text-[10px] font-mono text-slate-500 text-right space-y-1">
                           <p>WINDOW: 400</p>
                           <p>LEVEL: 40</p>
                        </div>
                        <div className="absolute bottom-6 left-6 text-[10px] font-mono text-slate-500">
                           <p>THK: 5.0mm</p>
                        </div>
                        <div className="absolute bottom-6 right-6 text-[10px] font-mono text-slate-500 text-right">
                           <p className="text-blue-400 font-black">AMISI MEDOS HIGH-RES VIEW</p>
                        </div>
                     </div>

                     {/* Image Controls */}
                     <div className="h-16 flex items-center justify-center gap-12 text-slate-500">
                        <button className="flex flex-col items-center gap-1 hover:text-white transition-colors">
                           <Layers size={18} />
                           <span className="text-[8px] font-black uppercase">Stack</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 hover:text-white transition-colors">
                           <Activity size={18} />
                           <span className="text-[8px] font-black uppercase">Cine</span>
                        </button>
                        <button className="flex flex-col items-center gap-1 hover:text-white transition-colors">
                           <LayoutGrid size={18} />
                           <span className="text-[8px] font-black uppercase">Grid</span>
                        </button>
                     </div>
                  </div>
               ) : (
                  <div className="text-center space-y-4 opacity-50">
                     <Dna size={84} className="mx-auto text-slate-800" />
                     <p className="text-xs font-black text-slate-600 uppercase tracking-widest">Select Patient Study</p>
                  </div>
               )}
            </div>

            {/* Right Pane: Report & Info */}
            <div className="w-96 border-l border-white/5 bg-gray-950 flex flex-col">
               <div className="p-6 border-b border-white/5">
                  <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                     <FileText size={14} /> Radiology Report
                  </h3>
               </div>
               
               <div className="flex-1 p-6 overflow-y-auto space-y-6">
                  {activeOrder ? (
                     <>
                        <div className="space-y-4">
                           <div className="bg-white/5 p-4 rounded-xl border border-white/5">
                              <p className="text-[10px] text-slate-500 font-black uppercase mb-2">Clinical Indication</p>
                              <p className="text-xs text-slate-300 leading-relaxed italic">
                                 {activeOrder.clinicalIndication || "Rule out acute pathology in targeted region."}
                              </p>
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] text-slate-500 font-black uppercase pl-1">Findings</label>
                              <textarea 
                                 placeholder="Enter diagnostic findings..." 
                                 className="w-full h-40 bg-white/5 border border-white/10 rounded-xl p-4 text-xs focus:outline-none focus:border-blue-500/50 resize-none leading-relaxed"
                              />
                           </div>

                           <div className="space-y-2">
                              <label className="text-[10px] text-slate-500 font-black uppercase pl-1">Impression</label>
                              <textarea 
                                 placeholder="Final diagnostic summary..." 
                                 className="w-full h-24 bg-white/5 border border-white/10 rounded-xl p-4 text-xs focus:outline-none focus:border-blue-500/50 resize-none font-bold"
                              />
                           </div>

                           <div className="flex items-center gap-3 p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
                              <input type="checkbox" className="w-4 h-4 rounded border-rose-500/50 bg-transparent text-rose-500 focus:ring-rose-500 focus:ring-offset-0 transition-all" />
                              <div className="flex items-center gap-2 text-rose-500">
                                 <AlertCircle size={14} />
                                 <span className="text-[10px] font-black uppercase tracking-tighter">Critical Finding Notification</span>
                              </div>
                           </div>
                        </div>
                     </>
                  ) : (
                     <div className="flex flex-col items-center justify-center h-full opacity-20">
                        <ClipboardCheck size={48} />
                     </div>
                  )}
               </div>

               <div className="p-6 border-t border-white/5 bg-gray-900/50">
                  <button 
                     disabled={!activeOrder}
                     className="w-full py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-20 disabled:hover:bg-blue-600 text-white font-black text-sm rounded-xl shadow-xl shadow-blue-500/20 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                     <ChevronRight size={18} />
                     Distribute Report
                  </button>
               </div>
            </div>
         </div>
      </main>
    </div>
  );
}
