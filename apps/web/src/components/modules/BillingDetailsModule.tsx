"use client";

import { useState, useEffect } from "react";
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
import { getInvoiceById, recordServiceLevelPayment } from "@/app/actions/operations-actions";
import { getHospitalSettings } from "@/app/actions/core-actions";
import ExportInvoiceButton from "@/components/ExportInvoiceButton";

export default function BillingDetailsModule({ id }: { id: string }) {
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
                    getInvoiceById(id),
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
            const updatedInv = await getInvoiceById(id);
            setInvoice(updatedInv);
            setSelectedItem(null);
            setPaymentAmount(0);
        } catch (error) {
            alert("Payment failed");
        } finally {
            setIsRecording(false);
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
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <section className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-xl overflow-hidden">
                            <div className="px-8 py-6 border-b border-gray-100 dark:border-gray-900 flex justify-between items-center bg-gray-50/30 dark:bg-gray-900/30">
                                <h2 className="text-sm font-black uppercase tracking-widest flex items-center gap-2"><Receipt className="h-5 w-5 text-emerald-500" /> Service Breakdown</h2>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="border-b border-gray-100 dark:border-gray-900 text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">
                                            <th className="px-8 py-4">Service Desc</th>
                                            <th className="px-4 py-4">Total</th>
                                            <th className="px-4 py-4">Paid</th>
                                            <th className="px-8 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-50 dark:divide-gray-900">
                                        {invoice.items.map((item: any) => (
                                            <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/40 transition-colors">
                                                <td className="px-8 py-5"><div className="font-bold text-sm">{item.description}</div></td>
                                                <td className="px-4 py-5 font-black text-sm">${Number(item.subtotal).toLocaleString()}</td>
                                                <td className="px-4 py-5"><div className="text-sm font-bold text-emerald-500">${Number(item.paidAmount).toLocaleString()}</div></td>
                                                <td className="px-8 py-5 text-right">{item.paymentStatus !== 'PAID' && (<button onClick={() => setSelectedItem(item)} className="text-[10px] font-black uppercase tracking-widest text-emerald-600 border border-emerald-200 px-3 py-1.5 rounded-lg">Rec. Payment</button>)}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </section>
                    </div>
                </div>
            </div>

            {selectedItem && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-6">
                    <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 shadow-2xl w-full max-w-md overflow-hidden">
                        <div className="p-8 border-b border-gray-100"><h3 className="text-xl font-black">Record Service Payment</h3></div>
                        <div className="p-8 space-y-6">
                            <div>
                                <label className="text-[10px] font-black uppercase text-gray-400 block mb-2">Amount to pay ($)</label>
                                <input type="number" value={paymentAmount} onChange={(e) => setPaymentAmount(parseFloat(e.target.value))} className="w-full px-4 py-4 rounded-2xl bg-gray-50 border border-gray-200 font-black text-xl" />
                            </div>
                        </div>
                        <div className="p-8 bg-gray-50 flex gap-4"><button onClick={() => setSelectedItem(null)} className="flex-1 px-6 py-3 font-black text-gray-500">Cancel</button><button disabled={isRecording || paymentAmount <= 0} onClick={handleRecordPayment} className="flex-2 rounded-2xl bg-emerald-500 px-8 py-3 font-black text-white">{isRecording ? 'Record...' : 'Confirm'}</button></div>
                    </div>
                </div>
            )}
        </div>
    );
}

function StatusPill({ status }: { status: string }) {
    const isPaid = status === 'paid';
    return (
        <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${isPaid ? 'bg-emerald-100 text-emerald-700' : 'bg-orange-100 text-orange-700'}`}>
            {status}
        </span>
    );
}
