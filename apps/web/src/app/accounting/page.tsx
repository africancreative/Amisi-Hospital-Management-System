import {
    BookOpen,
    Plus,
    TrendingUp,
    TrendingDown,
    BarChart3,
    FileText,
    ArrowRightLeft,
    History,
    PieChart,
    Wallet,
    ArrowUpRight,
    ArrowDownRight,
    Layers
} from 'lucide-react';
import Link from 'next/link';
import { getRecentJournalEntries, getTrialBalance } from '@/app/actions/accounting-actions';

export default async function AccountingDashboard() {
    const entries = await getRecentJournalEntries();
    const trialBalance = await getTrialBalance();

    // Summary calculations
    const assetBalance = trialBalance.filter((a: any) => a.type === 'ASSET').reduce((acc: number, a: any) => acc + a.balance, 0);
    const revenueBalance = trialBalance.filter((a: any) => a.type === 'REVENUE').reduce((acc: number, a: any) => acc + a.balance, 0);
    const expenseBalance = trialBalance.filter((a: any) => a.type === 'EXPENSE').reduce((acc: number, a: any) => acc + a.balance, 0);
    const netProfit = revenueBalance - expenseBalance;

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <BookOpen className="h-10 w-10 text-violet-500" />
                            Financial Intelligence
                        </h1>
                        <p className="text-gray-500 font-medium mt-2 uppercase text-xs tracking-[0.2em]">
                            IFRS-Compliant Double-Entry Accounting Core
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <Link
                            href="/accounting/coa"
                            className="flex items-center gap-2 rounded-2xl bg-white dark:bg-gray-950 px-6 py-4 border border-gray-200 dark:border-gray-800 font-black text-gray-700 dark:text-white shadow-sm hover:bg-gray-50 dark:hover:bg-gray-900 transition-all uppercase text-xs tracking-widest"
                        >
                            <Layers className="h-4 w-4" />
                            Chart of Accounts
                        </Link>
                        <button className="flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-4 font-black text-white shadow-2xl shadow-violet-500/20 hover:bg-violet-700 transition-all hover:-translate-y-1 active:scale-95 uppercase text-xs tracking-widest">
                            <Plus className="h-4 w-4" />
                            New Journal Entry
                        </button>
                    </div>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <FinStatCard
                        icon={TrendingUp}
                        label="Total Revenue"
                        value={`$${revenueBalance.toLocaleString()}`}
                        color="emerald"
                    />
                    <FinStatCard
                        icon={TrendingDown}
                        label="Total Expenses"
                        value={`$${expenseBalance.toLocaleString()}`}
                        color="red"
                    />
                    <FinStatCard
                        icon={BarChart3}
                        label="Net Profit"
                        value={`$${netProfit.toLocaleString()}`}
                        color="violet"
                        trend={netProfit >= 0 ? 'Surplus' : 'Deficit'}
                    />
                    <FinStatCard
                        icon={Wallet}
                        label="Total Assets"
                        value={`$${assetBalance.toLocaleString()}`}
                        color="blue"
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Recent Transactions */}
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white dark:bg-gray-950 rounded-[40px] border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center">
                                <h2 className="text-xl font-black flex items-center gap-2">
                                    <History className="h-5 w-5 text-gray-400" />
                                    Recent Ledger Entries
                                </h2>
                                <Link href="/accounting/ledger" className="text-xs font-black text-violet-500 hover:underline">View All</Link>
                            </div>
                            <div className="p-0">
                                <table className="w-full text-left">
                                    <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                                        {entries.map((entry) => (
                                            <tr key={entry.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                                                <td className="px-8 py-6">
                                                    <div className="flex items-center gap-4">
                                                        <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-900 flex items-center justify-center shrink-0">
                                                            <ArrowRightLeft className="h-5 w-5 text-gray-400" />
                                                        </div>
                                                        <div>
                                                            <p className="text-sm font-black text-gray-900 dark:text-white">{entry.description}</p>
                                                            <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest mt-0.5">{new Date(entry.date).toLocaleDateString()} • REF: {entry.reference || 'N/A'}</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-6 text-right">
                                                    <div className="flex flex-col items-end">
                                                        <span className="text-sm font-black text-gray-900 dark:text-white">
                                                            ${entry.lines.reduce((sum: number, l: any) => sum + Number(l.debit), 0).toLocaleString()}
                                                        </span>
                                                        <span className="text-[9px] font-black uppercase tracking-widest text-emerald-500">Balanced</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                        {entries.length === 0 && (
                                            <tr>
                                                <td className="px-8 py-20 text-center text-gray-500 italic">No journal entries recorded yet.</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>

                    {/* Quick Reports & Sidebar */}
                    <div className="space-y-8">
                        <section className="bg-violet-950 text-white rounded-[40px] p-8 shadow-2xl shadow-violet-900/40 relative overflow-hidden">
                            <div className="absolute -right-8 -top-8 h-32 w-32 bg-white/10 rounded-full blur-3xl"></div>
                            <h3 className="text-xs font-black uppercase tracking-widest opacity-60 mb-8">Financial Health</h3>
                            <div className="space-y-6">
                                <ReportLink label="Trial Balance" icon={FileText} href="/accounting/reports/trial-balance" />
                                <ReportLink label="Profit & Loss" icon={TrendingUp} href="/accounting/reports/pl" />
                                <ReportLink label="Balance Sheet" icon={BarChart3} href="/accounting/reports/balance-sheet" />
                                <ReportLink label="Cash Flow" icon={PieChart} href="/accounting/reports/cash-flow" />
                            </div>
                        </section>

                        <section className="bg-white dark:bg-gray-950 rounded-[40px] border border-gray-200 dark:border-gray-800 p-8 shadow-sm">
                            <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-6">Accounting Status</h3>
                            <div className="flex items-center gap-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl border border-emerald-100 dark:border-emerald-900/30">
                                <div className="h-3 w-3 rounded-full bg-emerald-500 animate-pulse"></div>
                                <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 uppercase tracking-widest">Double-Entry Enforced</p>
                            </div>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}

function FinStatCard({ icon: Icon, label, value, color, trend }: any) {
    const colors: any = {
        emerald: "text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10",
        red: "text-red-500 bg-red-50 dark:bg-red-500/10",
        violet: "text-violet-500 bg-violet-50 dark:bg-violet-500/10",
        blue: "text-blue-500 bg-blue-50 dark:bg-blue-500/10"
    };

    return (
        <div className="bg-white dark:bg-gray-950 p-6 rounded-[32px] border border-gray-200 dark:border-gray-800 shadow-sm">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 ${colors[color]}`}>
                <Icon className="h-6 w-6" />
            </div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{label}</h3>
            <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black tracking-tight">{value}</span>
                {trend && <span className="text-[9px] font-black uppercase tracking-widest text-violet-500">{trend}</span>}
            </div>
        </div>
    );
}

function ReportLink({ label, icon: Icon, href }: any) {
    return (
        <Link href={href} className="group flex items-center justify-between p-4 rounded-2xl bg-white/5 hover:bg-white/10 transition-all border border-white/5">
            <div className="flex items-center gap-3">
                <Icon className="h-5 w-5 opacity-60" />
                <span className="text-sm font-bold">{label}</span>
            </div>
            <ArrowUpRight className="h-4 w-4 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
        </Link>
    );
}
