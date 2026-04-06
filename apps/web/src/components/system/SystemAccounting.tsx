'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, CreditCard, Users, Activity, ExternalLink, ShieldAlert, BadgeInfo } from 'lucide-react';
import { getSystemAccountingData } from '@/app/actions/system-actions';
import { RevenueChart } from './RevenueChart';

export function SystemAccounting() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSystemAccountingData().then(res => {
      setData(res);
      setLoading(false);
    });
  }, []);

  if (loading) return (
    <div className="flex-1 flex items-center justify-center h-64 text-neutral-500 animate-pulse">
        <Activity className="h-6 w-6 mr-2" />
        Syncing platform ledger...
    </div>
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <AccountingStatCard 
            title="Total Revenue" 
            value={`$${(Number(data.totalRevenue)).toLocaleString()}`} 
            icon={TrendingUp} 
            color="emerald" 
        />
        <AccountingStatCard 
            title="Transactions" 
            value={data.totalCount.toString()} 
            icon={CreditCard} 
            color="blue" 
        />
        <AccountingStatCard 
            title="Average Ticket" 
            value={`$${data.totalCount > 0 ? (Number(data.totalRevenue) / data.totalCount).toFixed(2) : '0'}`} 
            icon={Activity} 
            color="indigo" 
        />
      </div>

      <div className="rounded-3xl border border-white/5 bg-neutral-900/40 p-8 backdrop-blur-xl">
          <div className="flex items-center justify-between mb-8">
              <h3 className="text-lg font-bold text-white flex items-center gap-3">
                  <TrendingUp className="h-5 w-5 text-emerald-500" />
                  Growth & Revenue Analytics
              </h3>
              <div className="flex items-center gap-2">
                 <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                 <span className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">Real-time Feed</span>
              </div>
          </div>
          <RevenueChart data={data.chartData} />
      </div>

      <div className="rounded-3xl border border-white/5 bg-neutral-900/40 p-8 backdrop-blur-xl mb-12">
        <h3 className="text-lg font-bold text-white mb-8 flex items-center gap-3">
            <BadgeInfo className="h-5 w-5 text-blue-500" />
            Transaction Ledger
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/5">
                <th className="pb-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Hospital</th>
                <th className="pb-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Amount</th>
                <th className="pb-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Payment ID</th>
                <th className="pb-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Method</th>
                <th className="pb-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Status</th>
                <th className="pb-4 text-[10px] font-black text-neutral-500 uppercase tracking-widest">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/5">
              {data.transactions.length === 0 ? (
                  <tr>
                      <td colSpan={6} className="py-12 text-center text-neutral-600 text-xs font-bold uppercase tracking-widest">
                          No transactions recorded in the ledger yet.
                      </td>
                  </tr>
              ) : (
                data.transactions.map((tx: any) => (
                    <tr key={tx.id} className="group hover:bg-white/[0.02] transition-colors">
                        <td className="py-5 font-bold text-white text-sm">
                            {tx.tenant?.name || 'Manual Adjustment'}
                        </td>
                        <td className="py-5 text-sm text-neutral-300 font-mono">
                            ${(Number(tx.amount)).toFixed(2)}
                        </td>
                        <td className="py-5 text-[10px] text-neutral-500 font-mono">
                            {tx.reference}
                        </td>
                        <td className="py-5">
                            <span className="px-3 py-1 rounded-full bg-neutral-800 text-[10px] font-black text-white/50 uppercase tracking-widest border border-white/5">
                                {tx.method}
                            </span>
                        </td>
                        <td className="py-5">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${tx.status === 'COMPLETED' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-rose-500/10 text-rose-500'}`}>
                                {tx.status}
                            </span>
                        </td>
                        <td className="py-5 text-xs text-neutral-600">
                            {new Date(tx.createdAt).toLocaleDateString()}
                        </td>
                    </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function AccountingStatCard({ title, value, icon: Icon, color }: { title: string; value: string; icon: any; color: string; }) {
  const bgColors: any = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    emerald: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    indigo: "bg-indigo-500/10 text-indigo-400 border-indigo-500/20",
    rose: "bg-rose-500/10 text-rose-400 border-rose-500/20",
  };

  return (
    <div className={`rounded-3xl border ${bgColors[color]} bg-neutral-900/50 p-7 backdrop-blur-xl shadow-2xl flex flex-col justify-between group`}>
      <div className="flex items-center justify-between">
        <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest">{title}</p>
        <div className={`p-3 rounded-2xl ${bgColors[color]} group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6" />
        </div>
      </div>
      <div className="mt-8">
        <p className="text-4xl font-black text-white tracking-tighter italic">{value}</p>
      </div>
    </div>
  );
}
