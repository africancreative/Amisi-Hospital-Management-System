'use client';

import { useState } from 'react';
import { Plus, Trash2, Calculator, Receipt, ShieldCheck } from 'lucide-react';
import { createInvoice } from '@/app/actions/billing-actions';

interface ServiceInvoiceFormProps {
    patients: any[];
}

export default function ServiceInvoiceForm({ patients }: ServiceInvoiceFormProps) {
    const [selectedPatient, setSelectedPatient] = useState('');
    const [items, setItems] = useState([{ description: '', quantity: 1, unitPrice: 0, paymentMode: 'POSTPAID', isTaxable: false, taxRate: 16 }]);
    const [isSaving, setIsSaving] = useState(false);

    const addItem = () => setItems([...items, { description: '', quantity: 1, unitPrice: 0, paymentMode: 'POSTPAID', isTaxable: false, taxRate: 16 }]);
    const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

    const updateItem = (index: number, field: string, value: any) => {
        const newItems = [...items];
        (newItems[index] as any)[field] = value;
        setItems(newItems);
    };

    const calculateSubtotal = () => items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const calculateTax = () => items.reduce((acc, item) => {
        if (!item.isTaxable) return acc;
        return acc + (item.quantity * item.unitPrice * (item.taxRate / 100));
    }, 0);

    const handleSubmit = async () => {
        if (!selectedPatient) return alert('Select a patient');
        setIsSaving(true);
        try {
            await createInvoice(selectedPatient, null, items as any);
            alert('Invoice Created Successfully!');
            window.location.href = '/billing';
        } catch (e) {
            alert('Failed to create invoice');
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="bg-white dark:bg-gray-950 rounded-3xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden font-sans">
            <div className="p-8 border-b border-gray-100 dark:border-gray-900 bg-gray-50/50 dark:bg-gray-900/50 flex justify-between items-center">
                <div>
                    <h3 className="text-xl font-black flex items-center gap-3">
                        <Receipt className="h-6 w-6 text-emerald-500" />
                        Service-Level Invoicing
                    </h3>
                    <p className="text-gray-500 text-sm mt-1">Granular control for prepaid, postpaid, and taxable services.</p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-xl">
                    <ShieldCheck className="h-4 w-4 text-blue-500" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-600">Accounting Access Only</span>
                </div>
            </div>

            <div className="p-8 space-y-8">
                {/* Patient Selection */}
                <div>
                    <label className="text-xs font-black uppercase tracking-widest text-gray-400 mb-2 block">Search Patient</label>
                    <select
                        value={selectedPatient}
                        onChange={(e) => setSelectedPatient(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 focus:ring-2 focus:ring-emerald-500 outline-none transition-all"
                    >
                        <option value="">Select a patient...</option>
                        {patients.map(p => (
                            <option key={p.id} value={p.id}>{p.lastName}, {p.firstName} (#{p.id.slice(0, 8)})</option>
                        ))}
                    </select>
                </div>

                {/* Items Table */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <label className="text-xs font-black uppercase tracking-widest text-gray-400">Invoice Line Items</label>
                        <button onClick={addItem} className="text-xs font-black text-emerald-500 flex items-center gap-1 hover:underline">
                            <Plus className="h-3 w-3" /> Add Service
                        </button>
                    </div>

                    <div className="space-y-4">
                        {items.map((item, idx) => (
                            <div key={idx} className="p-6 rounded-2xl border border-gray-100 dark:border-gray-900 bg-gray-50/30 dark:bg-gray-900/30 grid grid-cols-1 md:grid-cols-6 gap-4 items-end">
                                <div className="md:col-span-2">
                                    <label className="text-[10px] font-black uppercase mb-1 block opacity-50">Description</label>
                                    <input
                                        value={item.description}
                                        onChange={(e) => updateItem(idx, 'description', e.target.value)}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm"
                                        placeholder="e.g., Lab Test - Malaria"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase mb-1 block opacity-50">Price ($)</label>
                                    <input
                                        type="number"
                                        value={item.unitPrice}
                                        onChange={(e) => updateItem(idx, 'unitPrice', parseFloat(e.target.value))}
                                        className="w-full px-4 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black uppercase mb-1 block opacity-50">Mode</label>
                                    <select
                                        value={item.paymentMode}
                                        onChange={(e) => updateItem(idx, 'paymentMode', e.target.value)}
                                        className="w-full px-2 py-2 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 text-[10px] font-bold"
                                    >
                                        <option value="POSTPAID">POSTPAID</option>
                                        <option value="PREPAID">PREPAID</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] font-black uppercase opacity-50">Taxable</label>
                                    <div className="flex items-center gap-2">
                                        <input
                                            type="checkbox"
                                            checked={item.isTaxable}
                                            onChange={(e) => updateItem(idx, 'isTaxable', e.target.checked)}
                                            className="h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                                        />
                                        {item.isTaxable && (
                                            <input
                                                type="number"
                                                value={item.taxRate}
                                                onChange={(e) => updateItem(idx, 'taxRate', parseFloat(e.target.value))}
                                                className="w-12 px-1 py-1 rounded border border-gray-200 dark:border-gray-800 text-[10px]"
                                            />
                                        )}
                                    </div>
                                </div>
                                <div className="flex justify-end">
                                    <button onClick={() => removeItem(idx)} className="p-2 text-gray-300 hover:text-red-500 transition-colors">
                                        <Trash2 className="h-5 w-5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Summary Section */}
                <div className="p-8 bg-emerald-50 dark:bg-emerald-950/20 rounded-3xl border border-emerald-100 dark:border-emerald-900/50">
                    <div className="flex justify-between items-center mb-4">
                        <span className="text-sm font-bold text-emerald-800 dark:text-emerald-400 flex items-center gap-2">
                            <Calculator className="h-4 w-4" />
                            Financial Summary
                        </span>
                        <div className="text-right">
                            <div className="text-xs text-gray-500">Subtotal: ${calculateSubtotal().toLocaleString()}</div>
                            <div className="text-xs text-gray-500">Total Tax: ${calculateTax().toLocaleString()}</div>
                        </div>
                    </div>
                    <div className="flex justify-between items-end border-t border-emerald-100 dark:border-emerald-900/50 pt-4">
                        <div className="text-[10px] uppercase font-black tracking-widest text-emerald-600">Total Payable Amount</div>
                        <div className="text-3xl font-black text-emerald-900 dark:text-emerald-300">
                            ${(calculateSubtotal() + calculateTax()).toLocaleString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 bg-gray-50 dark:bg-gray-900/50 flex justify-end gap-4">
                <button
                    disabled={isSaving}
                    onClick={() => window.location.href = '/billing'}
                    className="px-8 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-800 transition-all"
                >
                    Cancel
                </button>
                <button
                    disabled={isSaving || !selectedPatient}
                    onClick={handleSubmit}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-8 py-3 font-bold text-white shadow-xl shadow-emerald-500/20 hover:bg-emerald-600 transition-all disabled:opacity-50"
                >
                    {isSaving ? 'Processing...' : 'Authorize & Generate Invoice'}
                </button>
            </div>
        </div>
    );
}
