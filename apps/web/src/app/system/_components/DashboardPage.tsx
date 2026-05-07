import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getTenants } from "../../actions/core-actions";
import { getPlatformAnalytics } from "../../actions/ui-actions";
import Link from "next/link";
import { 
  Building2, 
  Activity, 
  TrendingUp, 
  ShieldAlert, 
  CreditCard,
  Puzzle,
  MoreVertical,
  Play,
  Pause,
  ArrowUpRight,
  Database,
  Globe
} from "lucide-react";
import { cn } from "@/lib/utils";

export default async function SystemDashboardPage() {
  const cookieStore = await cookies();
  const isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';

  if (!isSystemAdmin) {
    redirect('/system/login');
  }

  const [tenants, analytics] = await Promise.all([
    getTenants(),
    getPlatformAnalytics()
  ]);

  return (
    <div className="space-y-8 pb-12 animate-in fade-in slide-in-from-bottom-8 duration-1000">

      {/* DASHBOARD HEADER */}
      <div className="flex items-center justify-between pb-8 border-b border-gray-800">
        <div>
          <h1 className="text-3xl font-black text-white tracking-tight uppercase italic flex items-center gap-3">
            <Activity className="w-8 h-8 text-blue-500" />
            Platform Overview
          </h1>
          <p className="text-gray-400 mt-2 text-sm">Real-time status of your hospital nodes and system health.</p>
        </div>
      </div>
      
      {/* SECTION 1: TENANT OVERVIEW */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Building2 className="w-5 h-5 text-blue-500" />
            Tenant Overview
          </h2>
          <Link href="/system/tenants/new" className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-colors shadow-lg shadow-blue-500/20">
            Create Tenant
          </Link>
        </div>
        
        <div className="bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-800/50 text-gray-400">
                <tr>
                  <th className="px-6 py-4 font-medium">Hospital Name</th>
                  <th className="px-6 py-4 font-medium">Region</th>
                  <th className="px-6 py-4 font-medium">Status</th>
                  <th className="px-6 py-4 font-medium">Plan Tier</th>
                  <th className="px-6 py-4 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-800">
                {tenants.map((tenant: any) => (
                  <tr key={tenant.id} className="hover:bg-gray-800/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded bg-gray-800 flex items-center justify-center shrink-0">
                          <span className="font-bold text-gray-400">{tenant.name.charAt(0)}</span>
                        </div>
                        <div>
                          <p className="font-medium text-gray-200">{tenant.name}</p>
                          <p className="text-xs text-gray-500">{tenant.slug}.amisimedos.com</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-400">{tenant.region.replace(/-/g, ' ')}</td>
                    <td className="px-6 py-4">
                      <span className={cn(
                        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium",
                        tenant.status === 'active' ? "bg-green-500/10 text-green-400" :
                        tenant.status === 'trial' ? "bg-blue-500/10 text-blue-400" :
                        "bg-red-500/10 text-red-400"
                      )}>
                        {tenant.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-gray-300 font-medium">{tenant.tier}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/system/tenants/${tenant.slug}`} className="p-2 text-gray-400 hover:text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                          <ArrowUpRight className="w-4 h-4" />
                        </Link>
                        <button className="p-2 text-gray-400 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                          <Pause className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* SECTION 2: REVENUE ANALYTICS */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-white flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-emerald-500" />
          Revenue Analytics
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl flex flex-col justify-center">
            <h3 className="text-gray-400 text-sm font-medium mb-1">Monthly Recurring Revenue</h3>
            <p className="text-4xl font-bold text-white mb-4">{analytics.kpis.monthlyRevenue}</p>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-emerald-400 font-medium">{analytics.kpis.revenueGrowth}</span>
              <span className="text-gray-500">vs last month</span>
            </div>
          </div>
          
          <div className="bg-gray-900 border border-gray-800 p-6 rounded-xl">
            <h3 className="text-gray-400 text-sm font-medium mb-4">Payment Trends</h3>
            <div className="h-32 flex items-end gap-2">
              {analytics.revenueByMonth.map((point: any, i: number) => {
                const maxRev = Math.max(...analytics.revenueByMonth.map((r: any) => r.revenue));
                const height = maxRev > 0 ? `${(point.revenue / maxRev) * 100}%` : '0%';
                return (
                  <div key={i} className="flex-1 flex flex-col justify-end group relative">
                    <div 
                      className="bg-emerald-500/20 hover:bg-emerald-500/40 rounded-t-sm transition-all"
                      style={{ height }}
                    />
                    <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded text-white whitespace-nowrap z-10 transition-opacity">
                      ${point.revenue}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500">
              {analytics.revenueByMonth.map((point: any, i: number) => (
                <span key={i}>{point.month.slice(5)}</span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* SECTION 3: SYSTEM HEALTH */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Activity className="w-5 h-5 text-rose-500" />
            System Health
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-400">API Uptime (30d)</p>
                  <p className="text-2xl font-bold text-white">{analytics.kpis.uptime}</p>
                </div>
                <div className="w-12 h-12 bg-green-500/10 rounded-full flex items-center justify-center">
                  <Activity className="w-6 h-6 text-green-500" />
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-6 border-t border-gray-800">
                <div>
                  <p className="text-xs text-gray-500 mb-1">Avg Response Time</p>
                  <p className="text-lg font-semibold text-gray-200">{analytics.kpis.avgResponseTime}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Error Rate</p>
                  <p className="text-lg font-semibold text-gray-200">{analytics.usageStats.errorRate}</p>
                </div>
              </div>

              <div className="pt-6 border-t border-gray-800">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-medium text-gray-300">Database Sync Status</h3>
                  <span className="text-xs text-green-400 bg-green-500/10 px-2 py-1 rounded-full">All Synced</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Database className="w-4 h-4" /> Control Plane
                    </span>
                    <span className="text-gray-200">Optimal</span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-400 flex items-center gap-2">
                      <Database className="w-4 h-4" /> Tenant Databases (42)
                    </span>
                    <span className="text-gray-200">100% Synced</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: MODULE USAGE */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold text-white flex items-center gap-2">
            <Puzzle className="w-5 h-5 text-amber-500" />
            Module Usage
          </h2>
          <div className="bg-gray-900 border border-gray-800 rounded-xl p-6">
            <div className="space-y-6">
              {analytics.moduleAdoption.slice(0, 5).map((mod: any, i: number) => (
                <div key={i}>
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-gray-300 font-medium capitalize">{mod.module.replace(/_/g, ' ').toLowerCase()}</span>
                    <span className="text-gray-400">{mod.percentage}% ({mod.tenants})</span>
                  </div>
                  <div className="w-full bg-gray-800 rounded-full h-2">
                    <div 
                      className="bg-amber-500 h-2 rounded-full transition-all duration-1000"
                      style={{ width: `${mod.percentage}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>

    </div>
  );
}
