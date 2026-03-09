"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    CreditCard,
    Receipt,
    User,
    Calendar,
    AlertCircle,
    CheckCircle2,
    Plus,
    DollarSign,
    ShieldCheck,
    Clock
} from "lucide-react";
import { getInvoiceById, recordServiceLevelPayment } from "@/app/actions/billing-actions";
import { getHospitalSettings } from "@/app/actions/hospital-actions";
import ExportInvoiceButton from "@/components/ExportInvoiceButton";

export default function InvoiceDetailPage() {
    const { id } = useParams();
    const [invoice, setInvoice] = useState<any>(null);
    const [hospitalSettings, setHospitalSettings] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isRecording, setIsRecording] = useState(false);
    const [paymentAmount, setPaymentAmount] = useState<number>(0);
    const [selectedItem, setSelectedItem] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [invData, settingsData] = await Promise.all([
                    getInvoiceById(id as string),
                    getHospitalSettings()
                ]);
                setInvoice(invData);
                setHospitalSettings(settingsData);
            } catch (error) {
                console.error("Error fetching invoice details:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleRecordPayment = async () => {
        if (!selectedItem || paymentAmount <= 0) return;
        setIsRecording(true);
        try {
            await recordServiceLevelPayment(selectedItem.id, paymentAmount, 'CASH');
            // Refresh data
            const updatedInv = await getInvoiceById(id as string);
            setInvoice(updatedInv);
            setSelectedItem(null);
            setPaymentAmount(0);
        } catch (error) {
            alert("Payment failed");
        } finally {
            setIsRecording(true);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-gray-500 font-mono animate-pulse">Querying Financial Engine...</div>;
    if (!invoice) return <div className="p-8 text-center text-red-500">Invoice not found.</div>;

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <div className="mx-auto max-w-6xl">
                <header className="mb-10 lg:flex justify-between items-end">
                    <div>
                        <Link href="/billing" className="text-emerald-500 flex items-center gap-1 text-xs font-black uppercase tracking-widest mb-4 hover:underline">
                            <ArrowLeft className="h-3 w-3" /> Financial Command
                        </Link>
                        <div className="flex items-center gap-4">
                            <h1 className="text-4xl font-black tracking-tight">Invoice #{invoice.id.slice(0, 8)}</h1>
                            <StatusPill status={invoice.status} />
                        </div>
                        <div className="flex items-center gap-4 mt-3 text-sm text-gray-500 font-medium">
                            <span className="flex items-center gap-1.5"><User className="h-4 w-4" /> {invoice.patient.lastName}, {invoice.patient.firstName}</span>
                            <span className="flex items-center gap-1.5" suppressHydrationWarning><Calendar className="h-4 w-4" /> {new Date(invoice.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>

                    <div className="flex gap-3 mt-6 lg:mt-0">
                        <ExportInvoiceButton invoice={invoice} hospitalSettings={hospitalSettings} variant="full" />
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        {/* Service Items Table */}
                        <section className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center bg-gray-50/30 dark:bg-gray-900/30">
                                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2">
                                    <Receipt className="h-5 w-5 text-emerald-500" />
                                    Service Breakdown
                                </h2>
                                <div className="flex items-center gap-2 px-3 py-1 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-full">
                                    <ShieldCheck className="h-3 w-3 text-blue-500" />
                                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Accounting Verified</span>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-900 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                            <th className="px-8 py-4">Service Desc</th>
                                            <th className="px-4 py-4">Mode</th>
                                            <th className="px-4 py-4">Total</th>
                                            <th className="px-4 py-4">Paid</th>
                                            <th className="px-8 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                                        {invoice.items.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                                                <td className="px-8 py-5">
                                                    <div className="font-bold text-sm">{item.description}</div>
                                                    <div className="text-[10px] text-gray-500 mt-0.5">{item.isTaxable ? `Includes ${Number(item.taxRate)}% Tax` : 'Tax Exempt'}</div>
                                                </td>
                                                <td className="px-4 py-5">
                                                    <span className={`px-2 py-0.5 rounded text-[10px] font-black ${item.paymentMode === 'PREPAID' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400' : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'}`}>
                                                        {item.paymentMode}
                                                    </span>
                                                </td>
                                                <td className="px-4 py-5 font-black text-sm">${Number(item.subtotal).toLocaleString()}</td>
                                                <td className="px-4 py-5">
                                                    <div className="text-sm font-bold text-emerald-500">${Number(item.paidAmount).toLocaleString()}</div>
                                                    <div className={`text-[10px] font-black uppercase ${item.paymentStatus === 'PAID' ? 'text-emerald-400' : 'text-orange-400'}`}>
                                                        {item.paymentStatus}
                                                    </div>
                                                </td>
                                                <td className="px-8 py-5 text-right">
                                                    {item.paymentStatus !== 'PAID' && (
                                                        <button
                                                            onClick={() => setSelectedItem(item)}
                                                            className="text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-200 dark:border-emerald-800 px-3 py-1.5 rounded-lg hover:bg-emerald-500 hover:text-white transition-all"
                                                        >
                                                            Rec. Payment
                                                        </button>
                                                    )}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>

                        {/* Payment History */}
                        <section className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden p-8">
                            <h3 className="text-xs font-black uppercase tracking-[0.2em] text-gray-400 mb-6">Payment Ledger</h3>
                            <div className="space-y-4">
                                {invoice.payments.length === 0 ? (
                                    <div className="text-sm text-gray-400 font-medium italic">No payments recorded yet.</div>
                                ) : (
                                    invoice.payments.map((pay: any) => (
                                        <div key={pay.id} className="flex justify-between items-center p-4 bg-gray-50 dark:bg-gray-900/50 rounded-2xl border border-gray-100 dark:border-gray-900">
                                            <div className="flex items-center gap-3">
                                                <div className="h-10 w-10 bg-emerald-500/10 rounded-full flex items-center justify-center">
                                                    <DollarSign className="h-5 w-5 text-emerald-500" />
                                                </div>
                                                <div>
                                                    <div className="text-sm font-black">{pay.method} Payment</div>
                                                    <div className="text-[10px] text-gray-500" suppressHydrationWarning>{new Date(pay.createdAt).toLocaleString()}</div>
                                                </div>
                                            </div>
                                            <div className="text-right font-black text-emerald-600">
                                                +${Number(pay.amount).toLocaleString()}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>
                    </div>

                    <div className="space-y-8">
                        {/* Summary Sidebar */}
                        <section className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm p-8">
                            <h3 className="text-sm font-black uppercase tracking-widest mb-6 border-b border-gray-100 dark:border-gray-900 pb-4">Balance Sheet</h3>
                            <div className="space-y-4">
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Total Billed</span>
                                    <span className="font-black">${Number(invoice.totalAmount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between text-sm">
                                    <span className="text-gray-500 font-medium">Total Paid</span>
                                    <span className="font-black text-emerald-500">-${(Number(invoice.totalAmount) - Number(invoice.balanceDue)).toLocaleString()}</span>
                                </div>
                                <div className="pt-4 border-t border-dashed border-gray-200 dark:border-gray-800 flex justify-between items-end">
                                    <div className="text-[10px] font-black uppercase tracking-widest text-gray-400">Due Now</div>
                                    <div className="text-3xl font-black text-orange-500">${Number(invoice.balanceDue).toLocaleString()}</div>
                                </div>
                            </div>
                        </section>

                        {/* Edge Sync Status */}
                        <section className="bg-gray-900 rounded-3xl p-8 text-white shadow-2xl relative overflow-hidden">
                            <div className="absolute -right-4 -top-4 opacity-10">
                                <Clock className="h-32 w-32" />
                            </div>
                            <h4 className="text-sm font-black uppercase tracking-widest mb-4 flex items-center gap-2">
                                <Clock className="h-4 w-4 text-emerald-400" />
                                Edge Replication
                            </h4>
                            <p className="text-[10px] leading-relaxed opacity-60">
                                This financial record is currently stored on the hospital's local edge node and will be synchronized to the central cloud repository during the next scheduled reconciliation period.
                            </p>
                        </section>
                    </div>
                </div>
            </div>

            {/* Payment Modal */}
            {selectedItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-8 border-b border-gray-100 dark:border-gray-900">
                            <h3 className="text-xl font-black">Record Service Payment</h3>
                            <p className="text-gray-500 text-sm mt-1">Recording payment for: {selectedItem.description}</p>
                        </div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Amount to pay ($)</label>
                                <div className="relative">
                                    <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                                    <input
                                        type="number"
                                        value={paymentAmount}
                                        onChange={(e) => setPaymentAmount(parseFloat(e.target.value))}
                                        className="w-full pl-12 pr-4 py-4 rounded-2xl bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-800 font-black text-xl outline-none focus:ring-2 focus:ring-emerald-500 transition-all"
                                        placeholder="0.00"
                                    />
                                </div>
                                <div className="flex justify-between mt-2">
                                    <button
                                        onClick={() => setPaymentAmount(Number(selectedItem.subtotal) - Number(selectedItem.paidAmount))}
                                        className="text-[10px] font-black text-emerald-500 uppercase hover:underline"
                                    >
                                        Pay Full Balance (${(Number(selectedItem.subtotal) - Number(selectedItem.paidAmount)).toLocaleString()})
                                    </button>
                                </div>
                            </div>
                        </div>
                        <div className="p-8 bg-gray-50 dark:bg-gray-900 flex gap-4">
                            <button
                                onClick={() => setSelectedItem(null)}
                                className="flex-1 px-6 py-3 rounded-2xl font-black text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
                            >
                                Cancel
                            </button>
                            <button
                                disabled={isRecording || paymentAmount <= 0}
                                onClick={handleRecordPayment}
                                className="flex-2 inline-flex items-center justify-center gap-2 rounded-2xl bg-emerald-500 px-8 py-3 font-black text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50"
                            >
                                <CreditCard className="h-5 w-5" />
                                {isRecording ? 'Record...' : 'Confirm Payment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const isPaid = status === 'paid';
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPaid ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400' : 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400'}`}>
            {isPaid ? <CheckCircle2 className="h-3 w-3" /> : <AlertCircle className="h-3 w-3" />}
            {status}
        </span>
    );
}
