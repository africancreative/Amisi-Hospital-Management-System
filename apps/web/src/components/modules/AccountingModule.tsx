import React from 'react';
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
    Layers
} from 'lucide-react';
import Link from 'next/link';
import { getRecentJournalEntries, getTrialBalance } from '@/app/actions/accounting-actions';

export default async function AccountingModule({ params }: { params: { slug: string } }) {
    const { slug } = params;
    const entries = await getRecentJournalEntries();
    const trialBalance = await getTrialBalance();

    const assetBalance = trialBalance.filter((a: any) => a.type === 'ASSET').reduce((acc: any, a: any) => acc + a.balance, 0);
    const revenueBalance = trialBalance.filter((a: any) => a.type === 'REVENUE').reduce((acc: any, a: any) => acc + a.balance, 0);
    const expenseBalance = trialBalance.filter((a: any) => a.type === 'EXPENSE').reduce((acc: any, a: any) => acc + a.balance, 0);
    const netProfit = revenueBalance - expenseBalance;

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3"><BookOpen className="h-10 w-10 text-violet-500" /> Financial Intelligence</h1>
                        <p className="text-gray-500 font-medium mt-2 uppercase text-xs tracking-[0.2em]">IFRS-Compliant Accounting Core</p>
                    </div>
                    <div className="flex gap-4">
                        <Link href={`/${slug}/accounting/coa`} className="flex items-center gap-2 rounded-2xl bg-white px-6 py-4 border text-xs tracking-widest"><Layers className="h-4 w-4" /> Chart of Accounts</Link>
                        <button className="bg-violet-600 px-8 py-4 font-black text-white rounded-2xl text-xs tracking-widest">New Journal Entry</button>
                    </div>
                </header>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
                    <FinStatCard icon={TrendingUp} label="Total Revenue" value={`$${revenueBalance.toLocaleString()}`} color="emerald" />
                    <FinStatCard icon={TrendingDown} label="Total Expenses" value={`$${expenseBalance.toLocaleString()}`} color="red" />
                    <FinStatCard icon={BarChart3} label="Net Profit" value={`$${netProfit.toLocaleString()}`} color="violet" trend={netProfit >= 0 ? 'Surplus' : 'Deficit'} />
                    <FinStatCard icon={Wallet} label="Total Assets" value={`$${assetBalance.toLocaleString()}`} color="blue" />
                </div>
            </div>
        </div>
    );
}

function FinStatCard({ icon: Icon, label, value, color, trend }: any) {
    const colors: any = { emerald: "text-emerald-500 bg-emerald-50", red: "text-red-500 bg-red-50", violet: "text-violet-500 bg-violet-50", blue: "text-blue-500 bg-blue-50" };
    return (
        <div className="bg-white p-6 rounded-[32px] border">
            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 ${colors[color]}`}><Icon className="h-6 w-6" /></div>
            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 mb-2">{label}</h3>
            <div className="flex items-baseline gap-2"><span className="text-2xl font-black">{value}</span></div>
        </div>
    );
}
