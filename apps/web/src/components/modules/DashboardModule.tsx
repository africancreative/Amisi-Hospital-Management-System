'use client';

import React from 'react';
import { api } from '@/trpc/client';
import { 
  DollarSign, 
  Users, 
  Activity, 
  Beaker, 
  Bed, 
  AlertTriangle, 
  Clock,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar
} from 'recharts';

export default function DashboardModule() {
  const { data: invoices } = api.billing.getOpenInvoices.useQuery();
  const { data: labOrders } = api.lab.getActiveOrders.useQuery();
  const { data: radOrders } = api.radiology.getActiveOrders.useQuery();
  const { data: occupancy } = api.ward.getWardOccupancy.useQuery();
  const { data: stockAlerts } = api.pharmacy.getStockAlerts.useQuery();
  const { data: employees } = api.hr.getEmployees.useQuery();

  const totalRevenue = invoices?.reduce((acc: number, inv: any) => acc + Number(inv.balanceDue), 0) || 0;
  const activePatients = occupancy?.reduce((acc: number, w: any) => acc + w.occupied, 0) || 0;
  const totalBeds = occupancy?.reduce((acc: number, w: any) => acc + w.totalBeds, 0) || 0;
  const criticalAlerts = stockAlerts?.length || 0;

  const revenueData = [
    { name: 'Mon', revenue: 4000 }, { name: 'Tue', revenue: 3000 }, { name: 'Wed', revenue: 2000 },
    { name: 'Thu', revenue: 2780 }, { name: 'Fri', revenue: 1890 }, { name: 'Sat', revenue: 2390 }, { name: 'Sun', revenue: 3490 },
  ];

  const occupancyData = occupancy?.map((w: any) => ({ name: w.name, occupied: w.occupied, available: w.available })) || [];

  return (
    <div className="min-h-screen bg-slate-50 p-8">
      <div className="flex justify-between items-end mb-8">
        <div><h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hospital Command Center</h1><p className="text-slate-500 mt-1 font-medium italic">AmisiMedOS Premium Edition</p></div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard title="Outstanding Revenue" value={`$${totalRevenue.toLocaleString()}`} trend="+12.5%" trendUp={true} icon={<DollarSign className="text-blue-600" />} color="blue" />
        <StatCard title="Active Inpatients" value={activePatients.toString()} subValue={`of ${totalBeds} beds`} trend="+3 today" trendUp={true} icon={<Bed className="text-purple-600" />} color="purple" />
        <StatCard title="Pending Lab/Rad" value={( (labOrders?.length || 0) + (radOrders?.length || 0) ).toString()} trend="-2.1%" trendUp={false} icon={<Beaker className="text-amber-600" />} color="amber" />
        <StatCard title="Critical Alerts" value={criticalAlerts.toString()} trend="Stock" trendUp={criticalAlerts === 0} icon={<AlertTriangle className={criticalAlerts > 0 ? "text-rose-600" : "text-emerald-600"} />} color={criticalAlerts > 0 ? "rose" : "emerald"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-8">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
            <h3 className="font-bold text-slate-800 text-lg mb-6">Weekly Revenue Velocity</h3>
            <div className="h-80 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={revenueData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} />
                  <Tooltip />
                  <Area type="monotone" dataKey="revenue" stroke="#2563eb" strokeWidth={3} fill="#2563eb" fillOpacity={0.1} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, subValue, trend, trendUp, icon, color }: any) {
  return (
    <div className="p-6 rounded-2xl border shadow-sm flex flex-col bg-white">
      <div className="flex justify-between items-start mb-4"><div className="p-3 bg-white rounded-xl shadow-sm border">{icon}</div><div className={`flex items-center gap-1 text-xs font-bold ${trendUp ? 'text-emerald-600' : 'text-rose-600'}`}>{trend}</div></div>
      <div><h4 className="text-slate-500 text-sm font-semibold mb-1 uppercase tracking-wide">{title}</h4><div className="flex items-baseline gap-2"><span className="text-3xl font-black text-slate-900">{value}</span>{subValue && <span className="text-xs text-slate-400 font-medium">{subValue}</span>}</div></div>
    </div>
  );
}
