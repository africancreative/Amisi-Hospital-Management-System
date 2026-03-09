import Link from 'next/link';
import {
    DollarSign,
    TrendingUp,
    CreditCard,
    Clock,
    ArrowUpRight,
    FileText,
    CheckCircle2,
    AlertCircle,
    Plus
} from 'lucide-react';
import ExportInvoiceButton from '@/components/ExportInvoiceButton';
import { getHospitalRevenueStats } from '@/app/actions/billing-actions';
import { getHospitalSettings } from '@/app/actions/hospital-actions';

export default async function BillingPage() {
    const stats = await getHospitalRevenueStats();
    const hospitalSettings = await getHospitalSettings();

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10">
                    <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                        <DollarSign className="h-10 w-10 text-emerald-500" />
                        Financial Command
                    </h1>
                    <p className="text-gray-500 font-medium mt-2">
                        Real-time revenue monitoring and fiscal health metrics for this hospital.
                    </p>
                </header>

                <div className="flex gap-4 mb-10 overflow-x-auto pb-2">
                    <Link href="/billing/invoice/new" className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500 px-6 py-4 font-black text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all whitespace-nowrap">
                        <Plus className="h-5 w-5" />
                        New Service Invoice
                    </Link>
                </div>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                    <StatCard
                        label="Total Revenue"
                        value={`$${stats.totalReceived.toLocaleString()}`}
                        trend="+12% vs last month"
                        icon={TrendingUp}
                        color="emerald"
                    />
                    <StatCard
                        label="Accrued (Unpaid)"
                        value={`$${stats.outstanding.toLocaleString()}`}
                        trend="Invoiced but pending"
                        icon={Clock}
                        color="orange"
                    />
                    <StatCard
                        label="Collection Rate"
                        value={`${((stats.totalReceived / (stats.totalInvoiced || 1)) * 100).toFixed(1)}%`}
                        trend="Efficiency index"
                        icon={CreditCard}
                        color="blue"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Recent Invoices */}
                        <section className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center">
                                <h2 className="text-xl font-bold font-mono uppercase tracking-widest">Recent Transactions</h2>
                                <button className="text-xs font-black text-emerald-500 hover:underline">View All</button>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                            <th className="px-8 py-4">Status</th>
                                            <th className="px-4 py-4">Reference</th>
                                            <th className="px-4 py-4">Amount</th>
                                            <th className="px-4 py-4">Date</th>
                                            <th className="px-8 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                                        {stats.recentInvoices.map((inv: any) => (
                                            <tr key={inv.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                                                <td className="px-8 py-4">
                                                    <StatusPill status={inv.status} />
                                                </td>
                                                <td className="px-4 py-4 font-mono text-sm">
                                                    #{inv.id.slice(0, 8)}
                                                </td>
                                                <td className="px-4 py-4 font-black text-sm" suppressHydrationWarning>
                                                    ${Number(inv.totalAmount).toLocaleString()}
                                                </td>
                                                <td className="px-4 py-4 text-xs text-gray-500 font-medium" suppressHydrationWarning>
                                                    {new Date(inv.createdAt).toLocaleDateString()}
                                                </td>
                                                <td className="px-8 py-4 text-right flex items-center justify-end gap-3">
                                                    <Link href={`/billing/${inv.id}`} className="text-xs font-black text-emerald-500 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 px-3 py-2 rounded-lg transition-all">
                                                        Manage
                                                    </Link>
                                                    <ExportInvoiceButton invoice={inv} hospitalSettings={hospitalSettings} />
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        {/* Quick Actions */}
                        <section className="bg-emerald-600 rounded-3xl p-8 text-white shadow-2xl shadow-emerald-600/30">
                            <h3 className="text-lg font-black uppercase tracking-widest mb-6 border-b border-white/20 pb-4 flex items-center gap-2">
                                <ArrowUpRight className="h-5 w-5" />
                                Fiscal Guard
                            </h3>
                            <p className="text-sm opacity-90 leading-relaxed mb-6">
                                All financial records on the edge are locked and cannot be purged until successfully reconciled with the Global Neon System.
                            </p>
                            <div className="space-y-4">
                                <ExportInvoiceButton
                                    invoice={{ id: 'GENERAL_LEDGER', totalAmount: stats.totalReceived, status: 'Audited', createdAt: new Date() }}
                                    hospitalSettings={hospitalSettings}
                                    variant="full"
                                />
                                <button className="w-full py-4 px-6 border border-white/30 text-white rounded-2xl font-black text-sm hover:bg-white/10 transition-all font-sans">
                                    Force Sync Flush
                                </button>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function StatCard({ label, value, trend, icon: Icon, color }: { label: string, value: string, trend: string, icon: any, color: string }) {
    const textColor = color === 'emerald' ? 'text-emerald-500' : color === 'orange' ? 'text-orange-500' : 'text-blue-500';
    const bgColor = color === 'emerald' ? 'bg-emerald-50 dark:bg-emerald-500/10' : color === 'orange' ? 'bg-orange-50 dark:bg-orange-500/10' : 'bg-blue-50 dark:bg-blue-500/10';

    return (
        <div className="bg-white dark:bg-gray-950 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm relative overflow-hidden group hover:border-emerald-500/40 transition-all">
            <div className={`absolute top-0 right-0 p-6 opacity-10 group-hover:scale-125 group-hover:opacity-20 transition-all`}>
                <Icon className={`h-16 w-16 ${textColor}`} />
            </div>
            <div className={`h-12 w-12 rounded-2xl ${bgColor} flex items-center justify-center mb-6`}>
                <Icon className={`h-6 w-6 ${textColor}`} />
            </div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-1">{label}</p>
            <h4 className="text-3xl font-black" suppressHydrationWarning>{value}</h4>
            <p className="mt-4 text-xs font-bold flex items-center gap-1 opacity-70">
                {trend}
            </p>
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const isPaid = status === 'paid';
    const isPending = status === 'pending';

    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' :
            isPending ? 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400' :
                'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
            }`}>
            {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {status}
        </span>
    );
}
