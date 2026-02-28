import { Plus, Users, Building2, Activity } from "lucide-react";

export default function Home() {
  return (
    <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900">
      <div className="mx-auto max-w-7xl">
        <header className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">Dashboard Overview</h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Welcome to the Amisi Super Admin Control Plane.
            </p>
          </div>
          <button className="inline-flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-medium text-white shadow hover:bg-emerald-600 transition-colors">
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Add Hospital</span>
          </button>
        </header>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {/* Stat Cards */}
          <StatCard title="Total Hospitals" value="12" icon={Building2} trend="+2 this month" />
          <StatCard title="Active Users" value="8,409" icon={Users} trend="+18% this week" />
          <StatCard title="System Health" value="99.9%" icon={Activity} trend="Operational" green />
        </div>

        {/* Dashboard Content Area */}
        <div className="mt-8 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Onboarding Activity</h2>
          <div className="h-64 flex items-center justify-center rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-800 text-gray-400 dark:text-gray-500">
            No recent activity to display.
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  green
}: {
  title: string;
  value: string;
  icon: any;
  trend: string;
  green?: boolean;
}) {
  return (
    <div className="rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 p-6 shadow-sm flex flex-col justify-between">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</p>
        <div className="p-2 bg-emerald-50 dark:bg-emerald-500/10 rounded-lg">
          <Icon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
      </div>
      <div className="mt-4">
        <p className="text-3xl font-bold text-gray-900 dark:text-white">{value}</p>
        <p className={`text-sm mt-1 ${green ? 'text-emerald-600 dark:text-emerald-400' : 'text-gray-500 dark:text-gray-400'}`}>
          {trend}
        </p>
      </div>
    </div>
  );
}
