'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/client';
import { 
  Hotel, 
  Bed, 
  UserPlus, 
  ArrowRightLeft, 
  LogOut, 
  Info,
  Activity,
  AlertCircle,
  Thermometer,
  ShieldAlert,
  LayoutGrid,
  ChevronRight
} from 'lucide-react';

export default function WardModule() {
  const { data: wards, isLoading, refetch } = api.ward.getWardsWithBeds.useQuery();
  const [selectedBed, setSelectedBed] = useState<any>(null);

  const totalBeds = wards?.reduce((acc: number, w: any) => acc + w.beds.length, 0) || 0;
  const occupiedBeds = wards?.reduce((acc: number, w: any) => acc + w.beds.filter((b: any) => b.status === 'OCCUPIED').length, 0) || 0;
  const availableBeds = wards?.reduce((acc: number, w: any) => acc + w.beds.filter((b: any) => b.status === 'AVAILABLE').length, 0) || 0;

  const stats = [
    { label: 'Total Capacity', value: totalBeds, icon: Hotel, color: 'text-blue-500' },
    { label: 'Occupancy Rate', value: totalBeds ? Math.round((occupiedBeds / totalBeds) * 100) + '%' : '0%', icon: Activity, color: 'text-emerald-500' },
    { label: 'Available Beds', value: availableBeds, icon: Bed, color: 'text-blue-400' },
    { label: 'Cleaning/Maint', value: totalBeds - occupiedBeds - availableBeds, icon: AlertCircle, color: 'text-amber-500' },
  ];

  return (
    <div className="flex flex-col h-full bg-gray-950 text-slate-100 font-sans">
      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg"><Hotel className="text-blue-500" size={24} /></div>
          <div>
            <h1 className="text-xl font-black">Ward <span className="text-blue-500">Director</span></h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Bed Inventory & ADT Monitor</p>
          </div>
        </div>
        <div className="flex gap-4">
           <button className="flex items-center gap-2 px-6 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl font-black text-sm transition-all"><LayoutGrid size={18} /> Floor Plan View</button>
           <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm transition-all shadow-xl shadow-blue-500/20 active:scale-95"><UserPlus size={18} /> Express Admission</button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
           {stats.map((s, i) => (
             <div key={i} className="bg-white/5 border border-white/10 p-5 rounded-3xl flex items-center gap-4 transition-transform hover:scale-[1.02]">
                <div className={`p-4 rounded-2xl bg-white/5 ${s.color}`}><s.icon size={26} /></div>
                <div><p className="text-2xl font-black text-white">{s.value}</p><p className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{s.label}</p></div>
             </div>
           ))}
        </div>

        <div className="flex-1 flex gap-6 overflow-hidden">
           <div className="flex-1 overflow-y-auto space-y-10 pr-2">
               {isLoading ? (
                 <div className="p-20 text-center text-slate-600 italic">Syncing bed sensors...</div>
               ) : wards?.map((ward: any) => (
                <section key={ward.id} className="space-y-4">
                   <div className="flex justify-between items-end border-b border-white/5 pb-4">
                      <div>
                         <h2 className="text-2xl font-black flex items-center gap-3">{ward.name}<span className="text-[10px] font-black px-3 py-1 bg-white/10 text-slate-400 rounded-full">{ward.type}</span></h2>
                         <p className="text-xs text-slate-500 font-bold uppercase tracking-tight mt-1">{ward.beds.length} Total Units • {ward.beds.filter((b: any) => b.status ==='AVAILABLE').length} Available</p>
                      </div>
                   </div>
                   <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-4">
                      {ward.beds.map((bed: any) => {
                         const patient = bed.admissions?.[0]?.encounter?.patient;
                         return (
                            <button key={bed.id} onClick={() => setSelectedBed(bed)} className={`p-4 rounded-3xl border transition-all flex flex-col items-center justify-center text-center relative group min-h-[140px] ${bed.status === 'AVAILABLE' ? 'bg-white/5 border-white/5 hover:border-emerald-500/50 hover:bg-emerald-500/5' : bed.status === 'OCCUPIED' ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/5' : 'bg-amber-500/10 border-amber-500/50'}`}>
                               <Bed size={32} className={`mb-3 ${bed.status === 'AVAILABLE' ? 'text-slate-700' : bed.status === 'OCCUPIED' ? 'text-blue-500' : 'text-amber-500'}`} />
                               <p className="text-lg font-black text-white">{bed.number}</p>
                               {bed.status === 'OCCUPIED' ? (<p className="text-[10px] font-black text-blue-400 uppercase truncate px-2 w-full mt-1">{patient?.lastName}</p>) : (<p className="text-[10px] font-black text-slate-600 uppercase tracking-tighter mt-1">{bed.status}</p>)}
                            </button>
                         );
                      })}
                   </div>
                </section>
              ))}
           </div>

           <div className="w-96 bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl">
              {selectedBed ? (
                 <>
                    <div className="p-8 border-b border-white/10 bg-white/[0.02]">
                       <div className="flex justify-between items-start mb-6"><div className="p-4 bg-white/5 rounded-2xl border border-white/10"><Bed className={selectedBed.status === 'OCCUPIED' ? 'text-blue-500' : 'text-emerald-500'} size={32} /></div><div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest ${selectedBed.status === 'OCCUPIED' ? 'bg-blue-500/20 text-blue-500' : 'bg-emerald-500/20 text-emerald-500'}`}>{selectedBed.status}</div></div>
                       <h3 className="text-3xl font-black">Bed {selectedBed.number}</h3>
                    </div>
                    <div className="flex-1 p-8 overflow-y-auto space-y-8">
                       {selectedBed.status === 'OCCUPIED' && selectedBed.admissions?.[0] ? (
                          <div className="bg-white/5 p-5 rounded-3xl border border-white/10"><p className="text-xs text-slate-500 font-bold uppercase mb-1">Patient Name</p><p className="text-xl font-black">{selectedBed.admissions[0].encounter.patient?.firstName} {selectedBed.admissions[0].encounter.patient?.lastName}</p></div>
                       ) : (<div className="flex flex-col items-center justify-center h-full text-center space-y-4 opacity-40"><UserPlus size={48} strokeWidth={1} /><p className="text-xs font-black uppercase tracking-widest leading-relaxed">System Ready for<br />New Admission</p></div>)}
                    </div>
                 </>
              ) : (<div className="flex flex-col items-center justify-center h-full text-slate-700"><Hotel size={64} strokeWidth={1} className="mb-4 opacity-20" /><p className="font-black text-lg">Select a bed unit</p></div>)}
           </div>
        </div>
      </main>
    </div>
  );
}
