'use client';

import React, { useState } from 'react';
import { api } from '@/trpc/client';
import { 
  Receipt, CreditCard, Wallet, Search, FileText, 
  Clock, CheckCircle2, Plus, TrendingUp, Landmark, X
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

type OpenInvoice = NonNullable<ReturnType<typeof api.billing.getOpenInvoices.useQuery>['data']>[number];
type BillItemWithAllocs = NonNullable<ReturnType<typeof api.billing.getInvoice.useQuery>['data']>['billItems'][number];

export default function BillingDashboard() {
  const [activeInvoiceId, setActiveInvoiceId] = useState<string | null>(null);
  
  // Queries
  const { data: openInvoices, refetch: refetchInvoices } = api.billing.getOpenInvoices.useQuery();
  const { data: activeInvoice, refetch: refetchInvoice } = api.billing.getInvoice.useQuery(activeInvoiceId || '', {
    enabled: !!activeInvoiceId
  });

  // Mutations
  const createBillItem = api.billing.createBillItem.useMutation({
    onSuccess: () => { refetchInvoice(); setShowAddModal(false); }
  });
  const recordPayment = api.billing.recordPayment.useMutation({
    onSuccess: () => { refetchInvoice(); refetchInvoices(); setPaymentAmount(''); setAllocations({}); }
  });

  // UI State
  const [showAddModal, setShowAddModal] = useState(false);
  const [newItem, setNewItem] = useState({ desc: '', qty: 1, price: 0, cat: 'CONSULTATION', tax: 0, discount: 0, isExempt: false, currency: 'USD' });
  const [paymentAmount, setPaymentAmount] = useState('');
  const [paymentCurrency, setPaymentCurrency] = useState('USD');
  const [paymentMethod, setPaymentMethod] = useState('CASH');
  const [allocations, setAllocations] = useState<Record<string, number>>({});
  const [autoAllocate, setAutoAllocate] = useState(true);

  const handlePostPayment = () => {
    if (!activeInvoiceId || !paymentAmount) return;
    
    let allocArray: { billItemId: string, amount: number }[] | undefined = undefined;
    if (!autoAllocate) {
       allocArray = Object.entries(allocations).map(([id, amt]) => ({ billItemId: id, amount: amt })).filter(a => a.amount > 0);
    }

    recordPayment.mutate({
      invoiceId: activeInvoiceId,
      amount: Number(paymentAmount),
      method: paymentMethod,
      currency: paymentCurrency,
      autoAllocate,
      allocations: allocArray
    });
  };

  const handleAllocationChange = (itemId: string, amt: number) => {
     setAllocations(prev => ({ ...prev, [itemId]: amt }));
     // Auto update total payment amount based on allocations
     setPaymentAmount(Object.values({ ...allocations, [itemId]: amt }).reduce((a, b) => a + b, 0).toString());
  };

  return (
    <div className="flex flex-col h-full bg-gray-950 text-slate-100 font-sans">
      <header className="p-6 border-b border-white/5 flex justify-between items-center bg-gray-900/50">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-600/20 rounded-lg">
            <Receipt className="text-blue-500" size={24} />
          </div>
          <div>
            <h1 className="text-xl font-black">Capital <span className="text-blue-500">Billing</span></h1>
            <p className="text-xs text-slate-500 uppercase tracking-widest font-black">Revenue Cycle Management</p>
          </div>
        </div>
        <div className="flex gap-4">
           <div className="relative">
             <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
             <input type="text" placeholder="Search Patient Name..." className="pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-xl text-sm focus:outline-none focus:border-blue-500/50 w-64" />
           </div>
           <button className="flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-sm transition-all shadow-xl shadow-blue-600/20">
             <Plus size={18} /> Create Manual Invoice
           </button>
        </div>
      </header>

      <main className="flex-1 overflow-hidden p-6 flex flex-col gap-6">
        <div className="flex-1 flex gap-6 overflow-hidden">
           {/* Sidebar: Open Accounts */}
           <div className="w-96 flex flex-col gap-4 overflow-y-auto pr-2">
              <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest px-2">Active Accounts</h3>
              {openInvoices?.map((inv: OpenInvoice) => (
                <button 
                  key={inv.id}
                  onClick={() => setActiveInvoiceId(inv.id)}
                  className={`p-5 rounded-3xl border text-left transition-all relative overflow-hidden group ${activeInvoiceId === inv.id ? 'bg-blue-600/10 border-blue-500/50 shadow-lg shadow-blue-500/5' : 'bg-white/5 border-white/5 hover:border-white/20'}`}
                >
                  <div className="flex justify-between items-start mb-3">
                     <div className="flex items-center gap-2 text-[10px] font-black text-slate-500 uppercase">
                        <Clock size={12} />
                        <span>{formatDistanceToNow(new Date(inv.createdAt))} ago</span>
                     </div>
                     <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${inv.status === 'PARTIAL' ? 'bg-amber-500/20 text-amber-500' : 'bg-rose-500/20 text-rose-500'}`}>{inv.status}</span>
                  </div>
                  <h4 className="font-bold text-white text-lg">{inv.patient?.firstName} {inv.patient?.lastName}</h4>
                  <div className="flex justify-between items-end mt-2">
                     <p className="text-xs text-slate-400">Total: {inv.currency} {Number(inv.totalAmount).toLocaleString()}</p>
                     <p className="text-xl font-black text-white">{inv.currency} {Number(inv.balanceDue).toLocaleString()}</p>
                  </div>
                </button>
              ))}
           </div>

           {/* Detailed Invoice View */}
           <div className="flex-1 bg-white/5 border border-white/10 rounded-[2.5rem] overflow-hidden flex flex-col shadow-2xl relative">
              {activeInvoice ? (
                <>
                  <div className="p-8 border-b border-white/10 flex justify-between items-start bg-white/[0.02]">
                     <div>
                        <div className="flex items-center gap-3 mb-2">
                           <h2 className="text-3xl font-black">Invoice <span className="text-blue-500">#{activeInvoice.id.slice(0, 8)}</span></h2>
                        </div>
                        <p className="text-sm text-slate-400">Patient ID: <b className="text-white">{activeInvoice.patientId}</b></p>
                     </div>
                     <div className="text-right flex flex-col items-end gap-2">
                        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Balance Due</p>
                        <p className="text-4xl font-black text-rose-500 leading-none">{activeInvoice.currency} {Number(activeInvoice.balanceDue).toLocaleString()}</p>
                     </div>
                  </div>

                  <div className="flex-1 p-8 overflow-y-auto space-y-8">
                     {/* Line Items */}
                     <section className="space-y-4">
                        <div className="flex justify-between items-center">
                           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-3 border-l-4 border-blue-500">Billable Services</h3>
                           <button onClick={() => setShowAddModal(true)} className="text-xs font-bold text-blue-400 flex items-center gap-1"><Plus size={14} /> Add Item</button>
                        </div>
                        <div className="bg-white/[0.02] border border-white/10 rounded-3xl overflow-hidden">
                           <table className="w-full text-left text-sm">
                              <thead className="bg-white/5">
                                 <tr>
                                    {(!autoAllocate) && <th className="p-4">Pay</th>}
                                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest">Service</th>
                                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Price</th>
                                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Tax/Disc</th>
                                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-right">Total</th>
                                    <th className="p-4 text-[10px] font-black text-slate-500 uppercase tracking-widest text-center">Status</th>
                                 </tr>
                              </thead>
                              <tbody className="divide-y divide-white/5">
                                 {activeInvoice.billItems.map((item: BillItemWithAllocs) => (
                                    <tr key={item.id} className="hover:bg-white/[0.01]">
                                       {(!autoAllocate) && (
                                         <td className="p-4">
                                            {item.status !== 'PAID' && (
                                              <input 
                                                type="number" 
                                                className="w-20 bg-white/5 border border-white/20 rounded p-1 text-xs" 
                                                placeholder="Amount"
                                                value={allocations[item.id] || ''}
                                                onChange={(e) => handleAllocationChange(item.id, Number(e.target.value))}
                                              />
                                            )}
                                         </td>
                                       )}
                                       <td className="p-4">
                                          <p className="font-bold text-white flex items-center gap-2">
                                            {item.description}
                                            {item.isExempt && <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-500 text-[8px] uppercase tracking-wider">Exempt</span>}
                                          </p>
                                          <p className="text-[10px] text-slate-500 font-bold">{item.category} (x{Number(item.quantity)})</p>
                                       </td>
                                       <td className="p-4 text-right font-medium text-slate-400">{item.currency} {Number(item.unitPrice).toLocaleString()}</td>
                                       <td className="p-4 text-right text-xs">
                                          {Number(item.taxAmount) > 0 && <p className="text-rose-400">+{Number(item.taxAmount)} Tax</p>}
                                          {Number(item.discountAmount) > 0 && <p className="text-emerald-400">-{Number(item.discountAmount)} Disc</p>}
                                       </td>
                                       <td className="p-4 text-right font-black text-white">{item.currency} {Number(item.totalPrice).toLocaleString()}</td>
                                       <td className="p-4 text-center">
                                          <span className={`text-[9px] font-black px-2 py-0.5 rounded-full uppercase ${item.status === 'PAID' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-amber-500/10 text-amber-500'}`}>
                                             {item.status}
                                          </span>
                                       </td>
                                    </tr>
                                 ))}
                              </tbody>
                           </table>
                        </div>
                     </section>

                     <div className="grid grid-cols-2 gap-8">
                        {/* Payer Info */}
                        <section className="space-y-4">
                           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-3 border-l-4 border-indigo-500">Payment Strategy</h3>
                           <div className="bg-indigo-500/5 border border-indigo-500/10 p-6 rounded-3xl space-y-4">
                               <div className="flex gap-4">
                                  <button onClick={() => setAutoAllocate(true)} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-xl transition-all ${autoAllocate ? 'bg-indigo-600 text-white' : 'bg-white/5 border border-indigo-500/50 text-slate-300'}`}>
                                     Waterfall (Auto)
                                  </button>
                                  <button onClick={() => setAutoAllocate(false)} className={`flex-1 py-3 rounded-2xl flex items-center justify-center gap-2 text-sm font-bold shadow-xl transition-all ${!autoAllocate ? 'bg-indigo-600 text-white' : 'bg-white/5 border border-indigo-500/50 text-slate-300'}`}>
                                     Per-Item Selection
                                  </button>
                               </div>
                               <p className="text-xs text-slate-400 mt-2">
                                 {autoAllocate ? "Payments automatically clear the oldest unpaid services first." : "Manually enter payment amounts next to specific services above."}
                               </p>
                           </div>
                        </section>

                        {/* Record Payment */}
                        <section className="space-y-4">
                           <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest pl-3 border-l-4 border-emerald-500">Post Transaction</h3>
                           <div className="bg-emerald-500/5 border border-emerald-500/10 p-6 rounded-3xl space-y-4">
                               <div className="relative flex items-center gap-2">
                                  <select 
                                    className="bg-white/5 border border-white/20 rounded-xl py-4 px-3 text-sm font-black focus:outline-none text-emerald-500"
                                    value={paymentCurrency}
                                    onChange={e => setPaymentCurrency(e.target.value)}
                                  >
                                     <option value="USD">USD</option>
                                     <option value="KSh">KSh</option>
                                     <option value="EUR">EUR</option>
                                  </select>
                                  <input 
                                    type="number" 
                                    placeholder="0.00" 
                                    value={paymentAmount}
                                    disabled={!autoAllocate}
                                    onChange={(e) => setPaymentAmount(e.target.value)}
                                    className="w-full bg-white/5 border border-emerald-500/20 rounded-xl py-4 px-4 text-2xl font-black focus:outline-none focus:border-emerald-500/50 disabled:opacity-50" 
                                  />
                               </div>
                               <button onClick={handlePostPayment} disabled={recordPayment.isPending || !paymentAmount} className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 rounded-2xl font-black text-lg text-white shadow-2xl shadow-emerald-600/20 transition-all active:scale-95 flex items-center justify-center gap-3 disabled:opacity-50">
                                  <CreditCard size={24} /> {recordPayment.isPending ? 'Processing...' : 'Post Payment'}
                               </button>
                           </div>
                        </section>
                     </div>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center flex-1 text-slate-700">
                   <div className="p-8 border-2 border-dashed border-white/5 rounded-full mb-4"><FileText size={64} strokeWidth={1} /></div>
                   <h4 className="text-xl font-black text-slate-500">No Invoice Selected</h4>
                </div>
              )}
           </div>
        </div>
      </main>

      {/* Add Item Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center">
           <div className="bg-gray-900 border border-white/10 p-8 rounded-3xl w-full max-w-xl">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-2xl font-black text-white">Add Billed Service</h2>
                 <button onClick={() => setShowAddModal(false)}><X size={24} className="text-slate-500 hover:text-white" /></button>
              </div>
              <div className="space-y-4">
                 <div>
                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Description</label>
                    <input type="text" value={newItem.desc} onChange={e => setNewItem({...newItem, desc: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none focus:border-blue-500" placeholder="e.g. Lab Test" />
                 </div>
                 <div className="grid grid-cols-3 gap-4">
                    <div>
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Price</label>
                       <input type="number" value={newItem.price} onChange={e => setNewItem({...newItem, price: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none" />
                    </div>
                    <div>
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Qty</label>
                       <input type="number" value={newItem.qty} onChange={e => setNewItem({...newItem, qty: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none" />
                    </div>
                    <div>
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Currency</label>
                       <select value={newItem.currency} onChange={e => setNewItem({...newItem, currency: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none">
                         <option value="USD">USD</option>
                         <option value="KSh">KSh</option>
                       </select>
                    </div>
                 </div>
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Tax % (Accountant Override)</label>
                       <input type="number" value={newItem.tax} onChange={e => setNewItem({...newItem, tax: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none" />
                    </div>
                    <div>
                       <label className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1 block">Discount Amount</label>
                       <input type="number" value={newItem.discount} onChange={e => setNewItem({...newItem, discount: Number(e.target.value)})} className="w-full bg-white/5 border border-white/10 rounded-xl p-3 text-white focus:outline-none" />
                    </div>
                 </div>
                 <label className="flex items-center gap-3 bg-emerald-500/10 p-4 rounded-xl border border-emerald-500/20 cursor-pointer">
                    <input type="checkbox" checked={newItem.isExempt} onChange={e => setNewItem({...newItem, isExempt: e.target.checked})} className="w-5 h-5 accent-emerald-500" />
                    <div>
                       <span className="font-bold text-emerald-400">Mark as Tax Exempt</span>
                       <p className="text-xs text-emerald-500/70">Overrides tax rates for this specific item.</p>
                    </div>
                 </label>
                 
                 <button 
                   onClick={() => createBillItem.mutate({ 
                     visitId: activeInvoice?.visitId || '', 
                     patientId: activeInvoice?.patientId || '', 
                     description: newItem.desc, 
                     quantity: newItem.qty, 
                     unitPrice: newItem.price, 
                     category: newItem.cat,
                     taxRate: newItem.tax,
                     discountAmount: newItem.discount,
                     isExempt: newItem.isExempt,
                     currency: newItem.currency
                   })}
                   disabled={createBillItem.isPending || !newItem.desc || !newItem.price}
                   className="w-full py-4 mt-4 bg-blue-600 hover:bg-blue-500 rounded-xl font-black text-white transition-all disabled:opacity-50"
                 >
                   {createBillItem.isPending ? 'Saving...' : 'Add to Invoice'}
                 </button>
              </div>
           </div>
        </div>
      )}
    </div>
  );
}
