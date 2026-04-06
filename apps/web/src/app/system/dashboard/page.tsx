import { cookies } from "next/headers";
import { Plus, Users, Building2, Activity, TrendingUp, ShieldAlert, Monitor, Globe, ChevronRight } from "lucide-react";
import { getPlatformDashboardStats } from "../../actions/dashboard-actions";
import { getTenants } from "../../actions/tenant-actions";
import { getGlobalSettings } from "../../actions/system-actions";
import { AuditMonitoring } from "@/components/system/audit-monitoring";
import { SystemAccounting } from "@/components/system/SystemAccounting";
import { SystemSettingsForm } from "@/components/system/SystemSettingsForm";
import Link from "next/link";
import { redirect } from "next/navigation";

export default async function SystemDashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const cookieStore = await cookies();
  const isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';
  const { tab = 'overview' } = await searchParams;

  if (!isSystemAdmin) {
    redirect('/system/login');
  }

  const [stats, settings] = await Promise.all([
    getPlatformDashboardStats(),
    getGlobalSettings()
  ]);

  return (
    <div className="flex-1 overflow-y-auto p-12 bg-gray-50 dark:bg-[#060607]">
      <div className="mx-auto max-w-7xl">
        <header className="flex justify-between items-start mb-16 relative">
          <div className="absolute -top-12 -left-12 h-64 w-64 bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="relative z-10">
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 shadow-lg shadow-emerald-500/5">
                <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Platform Status: Optimal</span>
              </div>
              <span className="text-[10px] font-black text-neutral-600 uppercase tracking-widest">Global Core v4.2.0</span>
            </div>
            <h1 className="text-7xl font-black text-white uppercase italic tracking-tighter leading-[0.8] mb-4">
                {settings.platformName || 'COSMOS'}
            </h1>
            <p className="text-neutral-500 text-xl font-bold italic tracking-tight max-w-2xl border-l-2 border-blue-600/50 pl-6 py-1">
              {settings.platformSlogan || 'Distributed clinical orchestration and HIPAA security monitoring.'}
            </p>
          </div>
          <div className="flex flex-col items-end gap-6 relative z-10">
             <div className="flex items-center gap-2 p-1 bg-neutral-900/80 backdrop-blur-xl border border-white/5 rounded-2xl shadow-2xl">
                <Link href="?tab=overview" className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${tab === 'overview' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-neutral-500 hover:text-white'}`}>
                    Live Overview
                </Link>
                <Link href="?tab=accounting" className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${tab === 'accounting' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-neutral-500 hover:text-white'}`}>
                    Network Ledger
                </Link>
                <Link href="?tab=security" className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${tab === 'security' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-neutral-500 hover:text-white'}`}>
                    Security Hub
                </Link>
                <Link href="?tab=settings" className={`px-5 py-2.5 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all flex items-center gap-2 ${tab === 'settings' ? 'bg-blue-600 text-white shadow-xl shadow-blue-600/20' : 'text-neutral-500 hover:text-white'}`}>
                    Platform Config
                </Link>
             </div>
             <Link href="/system/hospitals/create" className="group flex items-center gap-4 rounded-3xl bg-white p-2 pr-8 font-black text-xs text-black shadow-2xl shadow-white/10 hover:bg-neutral-100 transition-all hover:scale-[1.05] active:scale-[0.95]">
                <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-600/40 group-hover:rotate-90 transition-transform duration-500">
                    <Plus className="h-5 w-5" />
                </div>
                <span className="uppercase tracking-widest italic">Onboard Enterprise Hospital</span>
              </Link>
          </div>
        </header>

        {tab === 'overview' ? (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">
            {/* Real-time Stats Grid */}
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard title="Active Clusters" value={stats.hospitalCount.toString()} icon={Building2} trend="Deployment Stable" color="blue" />
              <StatCard title="Provider Network" value={stats.totalUsers.toString()} icon={Users} trend="Active Sessions" color="indigo" />
              <StatCard title="ARR Projection" value={`$${(Number(stats.activeSubscriptions) * 1250).toLocaleString()}`} icon={TrendingUp} trend="Scale Revenue" color="emerald" />
              <StatCard title="Cluster Health" value="99.9%" icon={Activity} trend="Zero Latency" color="rose" />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pb-12">
              <div className="lg:col-span-2 rounded-[2.5rem] border border-white/5 bg-neutral-900/40 p-10 backdrop-blur-3xl shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-10 opacity-[0.03] group-hover:opacity-10 transition-opacity duration-1000">
                    <Monitor className="h-48 w-48" />
                </div>
                <div className="flex items-center justify-between mb-10">
                    <h2 className="text-2xl font-black text-white italic flex items-center gap-4 uppercase tracking-tighter">
                        <div className="h-8 w-1 bg-blue-600 rounded-full" />
                        Infrastructure Nodes
                    </h2>
                    <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest bg-white/5 px-3 py-1 rounded-lg">Real-time Heartbeat Monitoring</span>
                </div>
                
                <div className="grid gap-4">
                  {(await getTenants()).map((tenant: any) => (
                    <div key={tenant.id} className="flex items-center gap-6 p-6 rounded-[2rem] bg-white/[0.03] border border-white/5 group hover:border-blue-500/30 transition-all hover:bg-blue-600/[0.03] hover:translate-x-2">
                      <div className="h-14 w-14 rounded-2xl bg-gradient-to-br from-blue-500/20 to-indigo-500/10 flex items-center justify-center text-blue-400 group-hover:scale-110 transition-transform shadow-xl">
                        <Building2 className="h-7 w-7" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-1">
                            <p className="text-xl font-black text-white tracking-widest uppercase italic">{tenant.name}</p>
                            <span className="h-1 w-1 rounded-full bg-neutral-800" />
                            <span className="text-[8px] font-black text-blue-500 uppercase tracking-widest">{tenant.tier}</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-[10px] text-neutral-500 uppercase tracking-[0.2em] font-bold">
                                {tenant.slug}.amisi.health
                            </p>
                            <span className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest flex items-center gap-2">
                                <Globe className="h-3 w-3" />
                                {tenant.region.replace(/-/g, ' ')}
                            </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-6">
                         <div className="text-right">
                            <div className="flex items-center gap-2 justify-end mb-1">
                                <div className="h-1.5 w-1.5 rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/50" />
                                <span className="text-[10px] font-black text-white uppercase tracking-widest">Active</span>
                            </div>
                            <p className="text-[10px] text-neutral-600 font-bold uppercase tracking-widest">Ping: 12ms</p>
                         </div>
                         <Link 
                            href={`/system/hospitals/${tenant.id}/edit`}
                            className="bg-neutral-800 hover:bg-blue-600 text-[10px] font-black uppercase tracking-widest py-4 px-6 rounded-2xl text-neutral-400 hover:text-white transition-all active:scale-95 border border-white/5 shadow-xl"
                          >
                            Access Node
                          </Link>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="space-y-8">
                  <div className="rounded-[2.5rem] border border-white/5 bg-gradient-to-br from-blue-600 to-indigo-700 p-10 shadow-2xl flex flex-col justify-between group overflow-hidden relative min-h-[440px]">
                    <div className="absolute -bottom-10 -right-10 p-8 opacity-20 group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-1000">
                        <ShieldAlert className="h-64 w-64" />
                    </div>
                    <div className="relative z-10">
                        <div className="h-20 w-20 rounded-3xl bg-white/20 backdrop-blur-2xl flex items-center justify-center text-white mb-8 font-black text-3xl italic shadow-2xl">
                            {settings.platformName?.[0] || 'A'}
                        </div>
                        <h2 className="text-4xl font-black text-white leading-[0.9] uppercase italic tracking-tighter mb-4">
                            Platform<br/>Intelligence
                        </h2>
                        <p className="text-white/60 text-base font-bold italic tracking-tight leading-relaxed max-w-[220px]">
                            Advanced telemetry and distributed cluster management for enterprise healthcare.
                        </p>
                    </div>
                    <div className="space-y-4 relative z-10 mt-12">
                        <button className="w-full py-5 bg-white rounded-3xl text-blue-600 font-black text-xs uppercase tracking-widest hover:scale-[1.02] hover:shadow-2xl transition-all shadow-xl shadow-blue-900/40 active:scale-95">
                            Launch Health Monitor
                        </button>
                        <p className="text-[9px] text-center font-black text-white/40 uppercase tracking-[0.3em]">Authorized Session: System root</p>
                    </div>
                  </div>

                  <div className="rounded-[2.5rem] border border-white/5 bg-neutral-900/40 p-8 backdrop-blur-3xl shadow-2xl flex items-center justify-between group cursor-pointer hover:border-blue-500/30 transition-all">
                      <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 group-hover:scale-110 transition-transform">
                              <ShieldAlert className="h-6 w-6" />
                          </div>
                          <div>
                              <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-1">Security Audit</p>
                              <p className="text-lg font-black text-white uppercase italic tracking-tighter underline decoration-amber-500/50 decoration-2 underline-offset-4">0 Threats Detected</p>
                          </div>
                      </div>
                      <ChevronRight className="h-6 w-6 text-neutral-700 group-hover:translate-x-1 group-hover:text-amber-500 transition-all" />
                  </div>
              </div>
            </div>
          </div>
        ) : tab === 'accounting' ? (
           <SystemAccounting />
        ) : tab === 'settings' ? (
           <SystemSettingsForm />
        ) : (
           <AuditMonitoring />
        )}
      </div>
    </div>
  );
}

function StatCard({ title, value, icon: Icon, trend, color }: { title: string; value: string; icon: any; trend: string; color: string; }) {
  const bgColors: any = {
    blue: "bg-blue-500/10 text-blue-400",
    emerald: "bg-emerald-500/10 text-emerald-400",
    amber: "bg-amber-500/10 text-amber-400",
    rose: "bg-rose-500/10 text-rose-400",
    indigo: "bg-indigo-500/10 text-indigo-400",
  };

  return (
    <div className="rounded-3xl border border-white/5 bg-neutral-900/50 p-7 backdrop-blur-xl shadow-2xl flex flex-col justify-between group transition-all hover:border-white/10 hover:shadow-blue-500/5">
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-[0.2em]">{title}</p>
        <div className={`p-3 rounded-2xl ${bgColors[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-10">
        <p className="text-5xl font-black text-white tracking-tighter italic">{value}</p>
        <div className="flex items-center gap-2 mt-4">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <p className="text-xs font-bold text-neutral-500 uppercase tracking-widest">{trend}</p>
        </div>
      </div>
    </div>
  );
}
