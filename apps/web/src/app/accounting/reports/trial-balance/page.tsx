import {
    FileText,
    Printer,
    Download,
    ChevronRight,
    Scale,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { getTrialBalance } from '../../actions/accounting-actions';

export default async function TrialBalancePage() {
    const trialBalance = await getTrialBalance();

    const totalDebits = trialBalance.reduce((acc: number, a: any) => acc + a.totalDebit, 0);
    const totalCredits = trialBalance.reduce((acc: number, a: any) => acc + a.totalCredit, 0);
    const isBalanced = Math.abs(totalDebits - totalCredits) < 0.01;

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10 flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div>
                        <Link
                            href="/accounting"
                            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                        >
                            <ChevronRight className="h-4 w-4 rotate-180" />
                            Back to Intelligence
                        </Link>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <Scale className="h-10 w-10 text-violet-500" />
                            Trial Balance
                        </h1>
                        <p className="text-gray-500 font-medium mt-2 uppercase text-xs tracking-[0.2em]">
                            Consolidated Ledger Verification • {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <button className="p-4 rounded-2xl bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all text-gray-600 dark:text-white">
                            <Printer className="h-5 w-5" />
                        </button>
                        <button className="flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-4 font-black text-white shadow-2xl shadow-violet-500/20 hover:bg-violet-700 transition-all hover:-translate-y-1 active:scale-95 uppercase text-xs tracking-widest">
                            <Download className="h-4 w-4" />
                            Export PDF
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Status Column */}
                    <div className="lg:col-span-1 space-y-6">
                        <section className={`rounded-[40px] p-8 border ${isBalanced ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-100 dark:border-emerald-900/30' : 'bg-red-50 dark:bg-red-950/20 border-red-100 dark:border-red-900/30'}`}>
                            <div className={`h-12 w-12 rounded-2xl flex items-center justify-center mb-6 ${isBalanced ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'}`}>
                                {isBalanced ? <ShieldCheck className="h-6 w-6" /> : <AlertCircle className="h-6 w-6" />}
                            </div>
                            <h3 className={`text-base font-black ${isBalanced ? 'text-emerald-950 dark:text-emerald-400' : 'text-red-950 dark:text-red-400'}`}>
                                {isBalanced ? 'Ledger Balanced' : 'Imbalance Detected'}
                            </h3>
                            <p className="text-xs font-medium opacity-70 mt-2 mb-6 leading-relaxed">
                                {isBalanced
                                    ? 'Total debits exactly match total credits in accordance with double-entry standards.'
                                    : 'A mathematical discrepancy exists between total debits and credits. Manual audit required.'}
                            </p>
                            <div className="pt-6 border-t border-black/5 dark:border-white/5 space-y-4">
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Debits</p>
                                    <p className="text-xl font-black font-mono mt-1">${totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest opacity-60">Total Credits</p>
                                    <p className="text-xl font-black font-mono mt-1">${totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</p>
                                </div>
                            </div>
                        </section>
                    </div>

                    {/* Table Column */}
                    <div className="lg:col-span-3">
                        <section className="bg-white dark:bg-gray-950 rounded-[40px] border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-gray-900">
                                        <th className="px-8 py-5">Account Code & Name</th>
                                        <th className="px-4 py-5 text-right">Debit</th>
                                        <th className="px-8 py-5 text-right">Credit</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                                    {trialBalance.map((acc) => (
                                        <tr key={acc.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <span className="text-xs font-mono font-black text-gray-400">{acc.code}</span>
                                                    <div>
                                                        <p className="text-sm font-black text-gray-900 dark:text-white uppercase tracking-tight">{acc.name}</p>
                                                        <p className="text-[9px] font-bold text-violet-500 uppercase tracking-widest">{acc.type}</p>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-4 py-6 text-right font-mono text-sm font-bold">
                                                {acc.totalDebit > 0 ? acc.totalDebit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                                            </td>
                                            <td className="px-8 py-6 text-right font-mono text-sm font-bold">
                                                {acc.totalCredit > 0 ? acc.totalCredit.toLocaleString(undefined, { minimumFractionDigits: 2 }) : '—'}
                                            </td>
                                        </tr>
                                    ))}
                                    {trialBalance.length === 0 && (
                                        <tr>
                                            <td colSpan={3} className="px-8 py-20 text-center text-gray-500 italic">No ledger activity captured yet.</td>
                                        </tr>
                                    )}
                                </tbody>
                                <tfoot>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50 border-t border-black/5 dark:border-white/5">
                                        <td className="px-8 py-8 text-sm font-black uppercase tracking-widest">Grand Total</td>
                                        <td className="px-4 py-8 text-right font-mono text-lg font-black text-violet-500">${totalDebits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                        <td className="px-8 py-8 text-right font-mono text-lg font-black text-violet-500">${totalCredits.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                                    </tr>
                                </tfoot>
                            </table>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
}
