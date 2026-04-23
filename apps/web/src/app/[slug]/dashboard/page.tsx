'use client';

import React from 'react';
import { api } from '@/trpc/client';
import { 
  DollarSign, 
  Users, 
  Activity, 
  Beaker, 
  Scan, 
  Bed, 
  AlertTriangle, 
  TrendingUp,
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  LineChart,
  Line,
  AreaChart,
  Area
} from 'recharts';

export default function CentralDashboard() {
  // --- Data Fetching ---
  const { data: invoices } = api.billing.getOpenInvoices.useQuery();
  const { data: labOrders } = api.lab.getActiveOrders.useQuery();
  const { data: radOrders } = api.radiology.getActiveOrders.useQuery();
  const { data: occupancy } = api.ward.getWardOccupancy.useQuery();
  const { data: stockAlerts } = api.pharmacy.getStockAlerts.useQuery();
  const { data: employees } = api.hr.getEmployees.useQuery();

  // --- Derived Stats ---
  const totalRevenue = invoices?.reduce((acc: number, inv: any) => acc + Number(inv.balanceDue), 0) || 0;
  const activePatients = occupancy?.reduce((acc: number, w: any) => acc + w.occupied, 0) || 0;
  const totalBeds = occupancy?.reduce((acc: number, w: any) => acc + w.totalBeds, 0) || 0;
  const criticalAlerts = stockAlerts?.length || 0;

  // --- Mock Chart Data ---
  const revenueData = [
    { name: 'Mon', revenue: 4000 },
    { name: 'Tue', revenue: 3000 },
    { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 },
    { name: 'Fri', revenue: 1890 },
    { name: 'Sat', revenue: 2390 },
    { name: 'Sun', revenue: 3490 },
  ];

  const occupancyData = occupancy?.map((w: any) => ({
    name: w.name,
    occupied: w.occupied,
    available: w.available
  })) || [];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      {/* Header */}
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hospital Command Center</h1>
          <p className="text-slate-500 mt-1 font-medium italic">AmisiMedOS Premium Edition — Enterprise View</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-white px-4 py-2 rounded-xl border border-slate-200 shadow-sm flex items-center gap-3">
             <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
             <span className="text-sm font-semibold text-slate-600">All Systems Operational</span>
          </div>
        </div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard 
          title="Outstanding Revenue" 
          value={`$${totalRevenue.toLocaleString()}`} 
          trend="+12.5%" 
          trendUp={true} 
          icon={<DollarSign className="text-blue-600" />} 
          color="blue"
        />
        <StatCard 
          title="Active Inpatients" 
          value={activePatients.toString()} 
          subValue={`of ${totalBeds} beds occupied`}
          trend="+3 today" 
          trendUp={true} 
          icon={<Bed className="text-purple-600" />} 
          color="purple"
        />
        <StatCard 
          title="Pending Lab/Rad" 
          value={( (labOrders?.length || 0) + (radOrders?.length || 0) ).toString()} 
          trend="-2.1%" 
          trendUp={false} 
          icon={<Beaker className="text-amber-600" />} 
          color="amber"
        />
        <StatCard 
          title="Critical Alerts" 
          value={criticalAlerts.toString()} 
          trend="Stock & Expiry" 
          trendUp={criticalAlerts === 0} 
          icon={<AlertTriangle className={criticalAlerts > 0 ? "text-rose-600" : "text-emerald-600"} />} 
          color={criticalAlerts > 0 ? "rose" : "emerald"}
        />
      </div>

      {/* Main Charts & Lists */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Revenue Trends */}
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-slate-800 text-lg">Weekly Revenue Velocity</h3>
              <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-widest">
                <Clock size={14}/>
                Real-time
              </div>
            </div>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#2563eb" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'}}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Ward Distribution */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-6">Ward Occupancy Distribution</h3>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={occupancyData} layout="vertical" barSize={32}>
                  <XAxis type="number" hide />
                  <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} width={100} tick={{fontSize: 12, fontWeight: 600, fill: '#475569'}} />
                  <Tooltip cursor={{fill: '#f8fafc'}} />
                  <Bar dataKey="occupied" stackId="a" fill="#7c3aed" radius={[0, 0, 0, 0]} />
                  <Bar dataKey="available" stackId="a" fill="#e2e8f0" radius={[0, 6, 6, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Right Sidebar: Operations Feed */}
        <div className="space-y-8">
          
          {/* Diagnostic Orders Queue */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-4 flex items-center gap-2">
              <Activity size={20} className="text-indigo-500" />
              Recent Diagnostic Orders
            </h3>
            <div className="space-y-4">
              {labOrders?.slice(0, 3).map((order: any) => (
                <OrderRow key={order.id} type="LAB" title={order.testPanelId} status={order.status} urgency={order.urgency} />
              ))}
              {radOrders?.slice(0, 3).map((order: any) => (
                <OrderRow key={order.id} type="RAD" title={order.targetRegion} status={order.status} urgency={order.priority} />
              ))}
              {(!labOrders?.length && !radOrders?.length) && (
                <p className="text-slate-400 text-sm text-center py-8">No pending diagnostic orders</p>
              )}
            </div>
          </div>

          {/* HR & Staffing Summary */}
          <div className="bg-slate-900 p-6 rounded-2xl shadow-xl shadow-slate-200">
            <h3 className="font-bold text-white text-lg mb-4 flex items-center gap-2">
              <Users size={20} className="text-sky-400" />
              HR & Staffing
            </h3>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">Total Staff</span>
                <span className="text-white font-bold">{employees?.length || 0}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400 text-sm">On Duty Now</span>
                <span className="text-sky-400 font-bold">14</span>
              </div>
              <div className="flex justify-between items-center border-t border-slate-800 pt-4 mt-4">
                <span className="text-slate-400 text-sm italic">Next Payroll Run</span>
                <span className="text-white text-xs font-mono bg-slate-800 px-2 py-1 rounded">2026-05-01</span>
              </div>
            </div>
            <button className="w-full mt-6 bg-sky-500 hover:bg-sky-400 text-white text-sm font-bold py-3 rounded-xl transition-all shadow-lg shadow-sky-500/20">
              Manage Payroll
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}

// --- Subcomponents ---

function StatCard({ title, value, subValue, trend, trendUp, icon, color }: any) {
  const colorMap: any = {
    blue: 'bg-blue-50 border-blue-100',
    purple: 'bg-purple-50 border-purple-100',
    amber: 'bg-amber-50 border-amber-100',
    rose: 'bg-rose-50 border-rose-100',
    emerald: 'bg-emerald-50 border-emerald-100',
  };

  return (
    <div className={`p-6 rounded-2xl border shadow-sm flex flex-col ${colorMap[color]} bg-white`}>
      <div className="flex justify-between items-start mb-4">
        <div className="p-3 bg-white rounded-xl shadow-sm border border-inherit">
          {icon}
        </div>
        <div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>
          {trendUp ? <ArrowUpRight size={14}/> : <ArrowDownRight size={14}/>}
          {trend}
        </div>
      </div>
      <div>
        <h4 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wide">{title}</h4>
        <div className="flex items-baseline gap-2">
           <span className="text-3xl font-black text-slate-900">{value}</span>
           {subValue && <span className="text-xs text-slate-400 font-medium">{subValue}</span>}
        </div>
      </div>
    </div>
  );
}

function OrderRow({ type, title, status, urgency }: any) {
  return (
    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 border border-transparent hover:border-slate-100 transition-all cursor-pointer group">
      <div className="flex items-center gap-3">
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold ${type === 'LAB' ? 'bg-blue-100 text-blue-600' : 'bg-purple-100 text-purple-600'}`}>
          {type[0]}
        </div>
        <div>
          <p className="text-sm font-bold text-slate-800 group-hover:text-blue-600 transition-colors">{title}</p>
          <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{status}</p>
        </div>
      </div>
      <div className={`text-[10px] font-black px-2 py-0.5 rounded-full ${urgency === 'STAT' ? 'bg-rose-100 text-rose-600' : 'bg-slate-100 text-slate-500'}`}>
        {urgency}
      </div>
    </div>
  );
}
