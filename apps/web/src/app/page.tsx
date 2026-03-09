import { cookies } from "next/headers";
import { Plus, Users, Building2, Activity, TrendingUp, DollarSign, Microscope, Pill } from "lucide-react";
import { getPlatformDashboardStats, getTenantDashboardStats } from "./actions/dashboard-actions";
import Link from "next/link";

export default async function Home() {
  const cookieStore = await cookies();
  const isSystemAdmin = cookieStore.get('amisi-is-system-admin')?.value === 'true';

  if (isSystemAdmin) {
    const stats = await getPlatformDashboardStats();
    return <PlatformDashboard stats={stats} />;
  }

  const stats = await getTenantDashboardStats();
  return <TenantDashboard stats={stats} />;
}

function PlatformDashboard({ stats }: { stats: any }) {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-[#0a0a0b]">
      <div className="mx-auto max-w-7xl">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Platform Control Plane</h1>
            <p className="text-neutral-500 mt-2 text-lg">
              Global overview of the Amisi Genuine infrastructure.
            </p>
          </div>
          <Link href="/hospitals" className="inline-flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-3 font-semibold text-white shadow-lg shadow-blue-600/20 hover:bg-blue-500 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-5 w-5" />
            <span>Onboard Hospital</span>
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Hospitals" value={stats.hospitalCount} icon={Building2} trend="+2 this month" color="blue" />
          <StatCard title="Total Users" value={stats.totalUsers} icon={Users} trend="+18% this week" color="indigo" />
          <StatCard title="Active Subscriptions" value={stats.activeSubscriptions} icon={TrendingUp} trend="Revenue Growing" color="emerald" />
          <StatCard title="System Health" value={stats.systemHealth} icon={Activity} trend="Operational" color="rose" />
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="rounded-3xl border border-white/5 bg-neutral-900/50 p-8 backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Recent Deployments</h2>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/5">
                  <div className="h-10 w-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400">
                    <Building2 className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-white">Amisi Premier - Region: East Africa</p>
                    <p className="text-xs text-neutral-500">Provisioned 2 hours ago</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold uppercase tracking-wider">Success</span>
                </div>
              ))}
            </div>
          </div>
          <div className="rounded-3xl border border-white/5 bg-neutral-900/50 p-8 backdrop-blur-xl shadow-2xl flex flex-col items-center justify-center text-center">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/10 flex items-center justify-center text-amber-500 mb-4 font-bold text-2xl italic">G</div>
            <h2 className="text-xl font-bold text-white mb-2">Amisi Genuine Enterprise</h2>
            <p className="text-neutral-500 max-w-xs">The world's most advanced hospital management infrastructure at your fingertips.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function TenantDashboard({ stats }: { stats: any }) {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-[#0a0a0b]">
      <div className="mx-auto max-w-7xl">
        <header className="flex justify-between items-center mb-10">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-white">Hospital Dashboard</h1>
            <p className="text-neutral-500 mt-2 text-lg">
              Daily operations and clinical statistics.
            </p>
          </div>
          <Link href="/patients" className="inline-flex items-center gap-2 rounded-xl bg-amber-500 px-6 py-3 font-semibold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-all hover:scale-[1.02] active:scale-[0.98]">
            <Plus className="h-5 w-5" />
            <span>Register Patient</span>
          </Link>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard title="Total Patients" value={stats.patientCount} icon={Users} trend="Active Records" color="blue" />
          <StatCard title="Today's Encounters" value={stats.todayEncounters} icon={Activity} trend="Rising" color="rose" />
          <StatCard title="Pending Labs" value={stats.pendingLabs} icon={Microscope} trend="Action Required" color="amber" />
          <StatCard title="Hospital Revenue" value={stats.totalRevenue} icon={DollarSign} trend="Calculated" color="emerald" />
        </div>

        <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 rounded-3xl border border-white/5 bg-neutral-900/50 p-8 backdrop-blur-xl shadow-2xl">
            <h2 className="text-xl font-bold text-white mb-6">Patient Queue Activity</h2>
            <div className="h-64 flex flex-col items-center justify-center gap-4 border-2 border-dashed border-white/5 rounded-3xl">
              <Activity className="h-12 w-12 text-neutral-700" />
              <p className="text-neutral-500">Live activity feed will appear here as patients are checked in.</p>
            </div>
          </div>
          <div className="space-y-6">
            <QuickAction icon={Users} label="Manage Staff" href="/users" color="blue" />
            <QuickAction icon={Microscope} label="Lab Results" href="/lab" color="rose" />
            <QuickAction icon={Pill} label="Pharmacy Stock" href="/inventory" color="amber" />
          </div>
        </div>
      </div>
    </div>
  );
}

function QuickAction({ icon: Icon, label, href, color }: { icon: any, label: string, href: string, color: string }) {
  const colors: any = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20 hover:bg-blue-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20 hover:bg-rose-500/20",
    amber: "bg-amber-500/10 text-amber-400 border-amber-500/20 hover:bg-amber-500/20",
  };

  return (
    <Link href={href} className={`flex items-center gap-4 p-6 rounded-3xl border backdrop-blur-sm transition-all hover:scale-[1.02] active:scale-[0.98] ${colors[color]}`}>
      <Icon className="h-6 w-6" />
      <span className="font-bold text-lg">{label}</span>
    </Link>
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
    <div className="rounded-3xl border border-white/5 bg-neutral-900/50 p-6 backdrop-blur-xl shadow-2xl flex flex-col justify-between group transition-all hover:border-white/10">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-neutral-400 uppercase tracking-widest">{title}</p>
        <div className={`p-3 rounded-2xl ${bgColors[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-8">
        <p className="text-4xl font-black text-white">{value}</p>
        <div className="flex items-center gap-2 mt-2">
          <TrendingUp className="h-4 w-4 text-emerald-500" />
          <p className="text-xs font-medium text-neutral-500">{trend}</p>
        </div>
      </div>
    </div>
  );
}
