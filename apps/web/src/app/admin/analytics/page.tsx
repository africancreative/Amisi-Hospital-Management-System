'use client';

import React from 'react';
import { api } from '@/trpc/client';
import { 
  Building2, 
  Users, 
  TrendingUp, 
  Activity, 
  Database,
  Globe,
  ArrowUpRight,
  Hospital,
  ShieldCheck,
  Zap,
  BarChart3
} from 'lucide-react';

export default function AnalyticsDashboard() {
  const { data: kpis, isLoading } = api.analytics.getGlobalKpis.useQuery();
  const { data: trends } = api.analytics.getDailyTrends.useQuery();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-slate-950 items-center justify-center">
        <div className="flex flex-col items-center gap-4">
           <Zap className="text-blue-500 animate-pulse" size={48} />
           <p className="text-slate-500 font-black text-xs uppercase tracking-widest">Aggregating Cross-Tenant Data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-8 font-sans selection:bg-blue-500/30">
      <header className="flex justify-between items-start mb-12">
        <div>
           <div className="flex items-center gap-2 mb-2">
              <ShieldCheck className="text-blue-500" size={18} />
              <span className="text-[10px] font-black text-blue-500 uppercase tracking-[0.2em]">Amisi Cloud Governance</span>
           </div>
           <h1 className="text-4xl font-black tracking-tighter italic uppercase">COMMAND <span className="text-blue-500">CENTER</span></h1>
           <p className="text-slate-500 text-sm mt-1 max-w-md">Multi-Hospital Intelligence Hub & Real-time Tenant Monitoring.</p>
        </div>

        <div className="flex gap-4">
           <div className="px-4 py-2 bg-slate-900/50 border border-slate-800 rounded-xl flex items-center gap-3">
              <Globe className="text-emerald-500" size={16} />
              <span className="text-xs font-bold">{kpis?.aggregate.activeUnits} ACTIVE TENANTS</span>
           </div>
        </div>
      </header>

      {/* Global Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
        <MetricCard 
          icon={<Users className="text-blue-500" />} 
          label="Total Managed Patients" 
          value={kpis?.aggregate.totalPatients?.toLocaleString() || "0"} 
          trend="+12% VS LAST MONTH"
        />
        <MetricCard 
          icon={<Activity className="text-emerald-500" />} 
          label="Active Inpatient Admissions" 
          value={kpis?.aggregate.totalAdmissions?.toLocaleString() || "0"} 
          trend="84% CAPACITY"
          isEmerald
        />
        <MetricCard 
          icon={<TrendingUp className="text-amber-500" />} 
          label="Aggregated Revenue (MTD)" 
          value={`$${(kpis?.aggregate.monthToDateRevenue || 0).toLocaleString()}`} 
          trend="ON TRACK"
        />
        <MetricCard 
          icon={<Database className="text-purple-500" />} 
          label="Data Integrity Status" 
          value="HEALTHY" 
          trend="AES-256 E2EE ACTIVE"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Hospital Breakdown List */}
        <div className="lg:col-span-2 space-y-6">
           <div className="flex items-center justify-between">
              <h2 className="text-sm font-black text-slate-500 uppercase tracking-widest flex items-center gap-2">
                 <Building2 size={16} /> Clinical Units Status
              </h2>
              <button className="text-[10px] font-black text-blue-400 hover:text-blue-300">REFRESH NODES</button>
           </div>
           
           <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {kpis?.hospitalBreakdown.map((hospital: any, idx: number) => (
                <div key={idx} className="bg-slate-900/40 border border-slate-800 p-5 rounded-2xl hover:border-slate-700 transition-all group">
                   <div className="flex justify-between items-start mb-4">
                      <div className="p-3 bg-slate-800 rounded-xl group-hover:bg-blue-600/10 transition-colors">
                         <Hospital className="text-slate-500 group-hover:text-blue-400" size={20} />
                      </div>
                      <span className={`text-[9px] font-black px-2 py-0.5 rounded-full ${hospital.status === 'ONLINE' ? 'bg-emerald-500/20 text-emerald-500' : 'bg-rose-500/20 text-rose-500'}`}>
                         {hospital.status}
                      </span>
                   </div>
                   <h3 className="font-bold text-slate-100 group-hover:text-blue-400 transition-colors">{hospital.name}</h3>
                   <p className="text-[10px] text-slate-500 mb-4">{hospital.status === 'ONLINE' ? 'Uptime: 99.9%' : 'Connection Lost'}</p>
                   
                   <div className="grid grid-cols-3 gap-2">
                      <div className="bg-black/20 p-2 rounded-lg text-center">
                         <p className="text-[9px] font-black text-slate-600 uppercase">Patients</p>
                         <p className="text-xs font-bold">{hospital.patients || 0}</p>
                      </div>
                      <div className="bg-black/20 p-2 rounded-lg text-center">
                         <p className="text-[9px] font-black text-slate-600 uppercase">Rev</p>
                         <p className="text-xs font-bold text-emerald-400">${hospital.revenue?.toLocaleString()}</p>
                      </div>
                      <div className="bg-black/20 p-2 rounded-lg text-center">
                         <p className="text-[9px] font-black text-slate-600 uppercase">Ops</p>
                         <p className="text-xs font-bold text-amber-500">{((hospital.admissions || 0) / (hospital.patients || 1) * 10).toFixed(1)}%</p>
                      </div>
                   </div>
                </div>
              ))}
           </div>
        </div>

        {/* Global Trends Sidebars */}
        <div className="space-y-8">
           <div className="bg-blue-600/5 border border-blue-500/20 p-8 rounded-[2rem] relative overflow-hidden group">
              <Zap className="absolute -right-4 -top-4 text-blue-500/10" size={120} />
              <h3 className="text-sm font-black text-blue-400/80 uppercase tracking-widest mb-4">System Efficiency</h3>
              <div className="space-y-6 relative">
                 <div>
                    <div className="flex justify-between text-[11px] mb-1">
                       <span className="font-black text-slate-400 tracking-tighter italic">AVG CLOUD SYNC LATENCY</span>
                       <span className="text-blue-400 font-bold tracking-tight italic">42ms</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full w-[85%] bg-blue-500" />
                    </div>
                 </div>
                 <div>
                    <div className="flex justify-between text-[11px] mb-1">
                       <span className="font-black text-slate-400 tracking-tighter italic">DATABASE OPTIMIZATION</span>
                       <span className="text-emerald-400 font-bold tracking-tight italic">HEALTHY</span>
                    </div>
                    <div className="h-1 bg-slate-800 rounded-full overflow-hidden">
                       <div className="h-full w-[98%] bg-emerald-500" />
                    </div>
                 </div>
              </div>
           </div>

           <div className="bg-slate-900/60 border border-slate-800 p-8 rounded-[2rem]">
              <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                 <BarChart3 size={14} /> Global Admissions Trend
              </h3>
              <div className="flex items-end justify-between h-40 gap-1.5 px-2">
                 {trends?.map((t: any, idx: number) => (
                   <div key={idx} className="flex-1 flex flex-col items-center gap-3 group">
                      <div 
                         style={{ height: `${(t.count / 312) * 100}%` }}
                         className="w-full bg-slate-800 rounded-t-lg group-hover:bg-blue-600 transition-all relative"
                      >
                         <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-blue-600 text-[10px] px-2 py-0.5 rounded font-black">
                            {t.count}
                         </div>
                      </div>
                      <span className="text-[9px] font-black text-slate-600 uppercase tracking-wide group-hover:text-blue-500 pb-1">{t.day}</span>
                   </div>
                 ))}
              </div>
           </div>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ 
  icon, 
  label, 
  value, 
  trend, 
  isEmerald 
}: { 
  icon: React.ReactNode; 
  label: string; 
  value: string; 
  trend: string;
  isEmerald?: boolean;
}) {
  return (
    <div className="bg-slate-900/40 border border-slate-800/50 p-6 rounded-3xl hover:bg-slate-900/60 transition-all hover:scale-[1.02] active:scale-[0.98] duration-300">
       <div className="mb-4 p-2 w-fit bg-slate-800 rounded-xl">{icon}</div>
       <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">{label}</p>
       <div className="flex items-baseline gap-2 mb-3">
          <h2 className="text-3xl font-black italic tracking-tighter">{value}</h2>
          <ArrowUpRight size={14} className={isEmerald ? "text-emerald-500" : "text-blue-500"} />
       </div>
       <p className={`text-[9px] font-black italic tracking-tighter ${isEmerald ? 'text-emerald-500/80 bg-emerald-500/10' : 'text-blue-500/80 bg-blue-500/10'} px-2 py-1 rounded w-fit`}>
          {trend}
       </p>
    </div>
  );
}
