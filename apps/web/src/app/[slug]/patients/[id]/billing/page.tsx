import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
    ArrowLeft,
    CreditCard,
    Receipt,
    Plus,
    DollarSign,
    CheckCircle2,
    AlertCircle,
    FileText,
    Wallet
} from 'lucide-react';
import { getPatientById } from '@/app/actions/ehr-actions';
import { recordPayment } from '@/app/actions/billing-actions';
import { revalidatePath } from 'next/cache';

export default async function PatientBillingPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const patient = await getPatientById(id);

    if (!patient) {
        notFound();
    }

    const totalBalance = patient.invoices.reduce((acc: number, r: any) => acc + Number(r.balanceDue), 0);

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
            <div className="mx-auto max-w-5xl">
                <header className="mb-10">
                    <Link
                        href={`/patients/${patient.id}`}
                        className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-gray-900 dark:hover:text-white transition-colors mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Clinical Profile
                    </Link>
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        <div>
                            <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                                <Receipt className="h-10 w-10 text-emerald-500" />
                                Financial Ledger
                            </h1>
                            <p className="text-gray-500 font-medium mt-1 uppercase text-xs tracking-widest">
                                {patient.lastName}, {patient.firstName} • Account ID: {patient.id.slice(0, 8)}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-950 p-6 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm flex items-center gap-5">
                            <div className="h-12 w-12 rounded-xl bg-orange-100 dark:bg-orange-950/30 flex items-center justify-center">
                                <Wallet className="h-6 w-6 text-orange-500" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">Total Balance Due</p>
                                <h2 className="text-3xl font-black text-orange-500" suppressHydrationWarning>${totalBalance.toLocaleString()}</h2>
                            </div>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 gap-8">
                    <section className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl shadow-gray-200/50 dark:shadow-none overflow-hidden">
                        <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center">
                            <h2 className="text-xl font-bold font-mono uppercase tracking-widest flex items-center gap-2">
                                <FileText className="h-5 w-5 text-emerald-500" />
                                Invoice History
                            </h2>
                        </div>

                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-gray-50 dark:bg-gray-900/50 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                        <th className="px-8 py-5">Status</th>
                                        <th className="px-4 py-5">ID</th>
                                        <th className="px-4 py-5">Encounter</th>
                                        <th className="px-4 py-5">Total</th>
                                        <th className="px-4 py-5">Remaining</th>
                                        <th className="px-8 py-5 text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100 dark:divide-gray-900">
                                    {patient.invoices.map((record: any) => (
                                        <tr key={record.id} className="group hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                                            <td className="px-8 py-5">
                                                <StatusPill status={record.status} />
                                            </td>
                                            <td className="px-4 py-5 font-mono text-sm font-medium">#{record.id.slice(0, 8)}</td>
                                            <td className="px-4 py-5 text-sm font-medium text-gray-500">
                                                {record.encounterId ? 'Clinical Visit' : 'Service Only'}
                                            </td>
                                            <td className="px-4 py-5 text-sm font-bold" suppressHydrationWarning>${Number(record.totalAmount).toLocaleString()}</td>
                                            <td className="px-4 py-5 text-sm font-black text-orange-500" suppressHydrationWarning>
                                                ${Number(record.balanceDue).toLocaleString()}
                                            </td>
                                            <td className="px-8 py-5 text-right">
                                                {Number(record.balanceDue) > 0 && (
                                                    <form action={async (formData) => {
                                                        'use server';
                                                        await recordPayment({ invoiceId: record.id, amount: Number(record.balanceDue), method: 'CASH' });
                                                    }}>
                                                        <button
                                                            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-emerald-500 text-white text-xs font-black uppercase tracking-widest hover:bg-emerald-600 transition-all shadow-lg shadow-emerald-500/20 active:scale-95"
                                                        >
                                                            <CreditCard className="h-3.5 w-3.5" />
                                                            Quick Pay
                                                        </button>
                                                    </form>
                                                )}
                                                {Number(record.balanceDue) === 0 && (
                                                    <span className="text-emerald-500">
                                                        <CheckCircle2 className="h-5 w-5 ml-auto" />
                                                    </span>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                    {patient.invoices.length === 0 && (
                                        <tr>
                                            <td colSpan={6} className="px-8 py-20 text-center text-gray-500 italic font-medium">
                                                No financial records found for this patient.
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </section>
                </div>
            </div>
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
