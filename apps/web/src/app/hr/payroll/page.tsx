import {
    DollarSign,
    ArrowLeft,
    Calendar,
    TrendingUp,
    CheckCircle2,
    Clock,
    Download,
    Play,
    User,
    BadgeCheck,
    CreditCard
} from 'lucide-react';
import Link from 'next/link';
import { getPayrollHistory } from '../../actions/hr-actions';

export default async function PayrollPage() {
    const history = await getPayrollHistory();
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();

    const pendingPayments = history.filter(h => h.status === 'processed' || h.status === 'draft');
    const totalOutflow = history.reduce((acc, h) => acc + Number(h.netAmount), 0);

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <div className="mx-auto max-w-7xl">
                <header className="mb-10">
                    <Link
                        href="/hr"
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to HR Center
                    </Link>
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                                <DollarSign className="h-10 w-10 text-emerald-500" />
                                Payroll Management
                            </h1>
                            <p className="text-gray-500 font-medium mt-2 uppercase text-xs tracking-[0.2em]">
                                Financial Compensation & Compliance Hub
                            </p>
                        </div>

                        <button className="flex items-center gap-3 rounded-2xl bg-emerald-500 px-8 py-4 font-black text-white shadow-2xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all hover:-translate-y-1 active:scale-95 uppercase text-xs tracking-widest">
                            <Play className="h-4 w-4" />
                            Generate New Payroll
                        </button>
                    </div>
                </header>

                {/* KPI Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                    <div className="bg-white dark:bg-gray-950 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="h-12 w-12 rounded-2xl bg-blue-50 dark:bg-blue-500/10 flex items-center justify-center mb-6">
                            <Calendar className="h-6 w-6 text-blue-500" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Current Period</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black">{new Date().toLocaleString('default', { month: 'long' })} {currentYear}</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-950 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm">
                        <div className="h-12 w-12 rounded-2xl bg-orange-50 dark:bg-orange-500/10 flex items-center justify-center mb-6">
                            <Clock className="h-6 w-6 text-orange-500" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Pending Approvals</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black">{pendingPayments.length} Employees</span>
                        </div>
                    </div>
                    <div className="bg-white dark:bg-gray-950 p-8 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm border-emerald-500/20">
                        <div className="h-12 w-12 rounded-2xl bg-emerald-50 dark:bg-emerald-500/10 flex items-center justify-center mb-6">
                            <TrendingUp className="h-6 w-6 text-emerald-500" />
                        </div>
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2">Monthly Outflow</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-2xl font-black">${totalOutflow.toLocaleString()}</span>
                        </div>
                    </div>
                </div>

                {/* Payroll Table */}
                <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
                    <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center bg-gray-50/50 dark:bg-gray-900/50">
                        <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Payroll Transaction History</h2>
                        <button className="text-xs font-black text-emerald-500 flex items-center gap-1 hover:underline">
                            <Download className="h-4 w-4" />
                            Export Salary Report
                        </button>
                    </div>

                    <table className="w-full text-left">
                        <thead>
                            <tr className="text-[10px] font-black uppercase tracking-widest text-gray-400 border-b border-gray-100 dark:border-gray-900">
                                <th className="px-8 py-5">Employee</th>
                                <th className="px-4 py-5">Period</th>
                                <th className="px-4 py-5">Net Salary</th>
                                <th className="px-4 py-5 text-center">Status</th>
                                <th className="px-8 py-5 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-gray-900 font-sans">
                            {history.map((record) => (
                                <tr key={record.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                                    <td className="px-8 py-5">
                                        <div className="flex items-center gap-3">
                                            <div className="h-10 w-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                                                <User className="h-5 w-5 text-gray-400" />
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-gray-800 dark:text-gray-200">{record.employee.lastName}, {record.employee.firstName}</p>
                                                <p className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">{record.employee.role}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-4 py-5">
                                        <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                            {new Date(0, record.periodMonth - 1).toLocaleString('default', { month: 'short' })} {record.periodYear}
                                        </span>
                                    </td>
                                    <td className="px-4 py-5">
                                        <span className="text-sm font-black text-gray-900 dark:text-white">${Number(record.netAmount).toLocaleString()}</span>
                                    </td>
                                    <td className="px-4 py-5 text-center">
                                        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${record.status === 'paid' ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400' :
                                                record.status === 'draft' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400' :
                                                    'bg-orange-100 text-orange-700 dark:bg-orange-900/40 dark:text-orange-400'
                                            }`}>
                                            {record.status === 'paid' ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                                            {record.status}
                                        </div>
                                    </td>
                                    <td className="px-8 py-5 text-right">
                                        {record.status !== 'paid' && (
                                            <button className="px-4 py-2 bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-emerald-600 transition-all flex items-center gap-2 ml-auto">
                                                <CreditCard className="h-3.5 w-3.5" />
                                                Pay Now
                                            </button>
                                        )}
                                        {record.status === 'paid' && (
                                            <button className="p-2 rounded-lg text-gray-400 hover:text-gray-900 dark:hover:text-white ml-auto">
                                                <Download className="h-4 w-4" />
                                            </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {history.length === 0 && (
                        <div className="p-20 text-center">
                            <DollarSign className="h-16 w-16 text-gray-200 mx-auto mb-6" />
                            <h3 className="text-xl font-black text-gray-400">No Payroll Data</h3>
                            <p className="text-gray-500">Run your first payroll cycle to see employee compensation details.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
