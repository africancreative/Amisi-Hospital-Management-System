import {
    Layers,
    Plus,
    Search,
    Filter,
    ChevronRight,
    BookOpen,
    ShieldCheck,
    AlertCircle
} from 'lucide-react';
import Link from 'next/link';
import { getAccounts } from '@/app/actions/accounting-actions';

export default async function ChartOfAccountsPage() {
    const accounts = await getAccounts();

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
                            <Layers className="h-10 w-10 text-violet-500" />
                            Chart of Accounts
                        </h1>
                        <p className="text-gray-500 font-medium mt-2 uppercase text-xs tracking-[0.2em]">
                            Global Ledger Segmentation & Hierarchy
                        </p>
                    </div>

                    <button className="flex items-center gap-2 rounded-2xl bg-violet-600 px-8 py-4 font-black text-white shadow-2xl shadow-violet-500/20 hover:bg-violet-700 transition-all hover:-translate-y-1 active:scale-95 uppercase text-xs tracking-widest">
                        <Plus className="h-4 w-4" />
                        Create New Account
                    </button>
                </header>

                {/* Filter & Search */}
                <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-sm">
                    <div className="relative flex-1 max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search by Code or Account Name..."
                            className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-900 border-0 rounded-2xl text-sm font-medium focus:ring-2 focus:ring-violet-500 transition-all"
                        />
                    </div>
                    <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2 px-4 py-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-900/40 rounded-xl text-[10px] font-black text-emerald-600 uppercase tracking-widest">
                            <ShieldCheck className="h-3 w-3" />
                            Standardized
                        </div>
                        <button className="p-3 rounded-xl border border-gray-200 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors">
                            <Filter className="h-4 w-4 text-gray-500" />
                        </button>
                    </div>
                </div>

                {/* Accounts Table */}
                <div className="bg-white dark:bg-gray-950 rounded-[40px] border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400 border-b border-gray-100 dark:border-gray-900">
                                <th className="px-8 py-5">Code / Name</th>
                                <th className="px-4 py-5">Type</th>
                                <th className="px-8 py-5 text-right">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                            {accounts.map((acc) => (
                                <tr key={acc.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors group">
                                    <td className="px-8 py-6">
                                        <div className="flex items-center gap-4">
                                            <span className="h-10 w-16 bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center font-mono text-xs font-black text-gray-500">
                                                {acc.code}
                                            </span>
                                            <div>
                                                <p className="text-sm font-black text-gray-900 dark:text-white">{acc.name}</p>
                                                <p className="text-[10px] font-bold text-gray-500 mt-0.5">{acc.description || 'No description provided'}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-6">
                                        <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-[0.1em] ${getTypeStyle(acc.type)}`}>
                                            {acc.type}
                                        </span>
                                    </td>
                                    <td className="px-8 py-6 text-right">
                                        <span className={`h-2.5 w-2.5 rounded-full inline-block ${acc.isActive ? 'bg-emerald-500' : 'bg-gray-300'}`}></span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {accounts.length === 0 && (
                        <div className="p-20 text-center">
                            <AlertCircle className="h-16 w-16 text-gray-200 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-gray-400">CoA is Empty</h3>
                            <p className="text-gray-500">Initialize your Chart of Accounts to start financial tracking.</p>
                            <button className="mt-8 px-8 py-4 bg-violet-600 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-xl shadow-violet-500/20">
                                Seed Default Accounts
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

function getTypeStyle(type: string) {
    const styles: any = {
        ASSET: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400",
        LIABILITY: "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400",
        EQUITY: "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-400",
        REVENUE: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400",
        EXPENSE: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
    };
    return styles[type] || "bg-gray-100 text-gray-700";
}
