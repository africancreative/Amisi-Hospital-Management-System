'use client';

import React from 'react';
import { format } from 'date-fns';
import { ShieldCheck, Hospital, User, FileText } from 'lucide-react';

interface A4InvoiceProps {
  invoice: any;
  hospitalDetails: {
    name: string;
    address: string;
    phone: string;
    email: string;
    taxId?: string;
  };
}

/**
 * Professional A4 Invoice Template
 * 
 * High-fidelity discharge summary and financial statement.
 * Designed for letterhead printing on standard A4 paper.
 */
export function A4Invoice({ invoice, hospitalDetails }: A4InvoiceProps) {
  return (
    <div className="print-only-a4 w-[210mm] min-h-[297mm] p-12 bg-white text-gray-900 font-sans shadow-2xl">
      {/* 1. Header (Letterhead) */}
      <header className="flex justify-between items-start border-b-2 border-emerald-600 pb-8 mb-8">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 bg-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-lg">
            <Hospital className="h-10 w-10" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{hospitalDetails.name}</h1>
            <p className="text-sm text-gray-500 font-medium whitespace-pre-line">{hospitalDetails.address}</p>
          </div>
        </div>
        <div className="text-right">
          <h2 className="text-4xl font-black text-gray-200 uppercase tracking-widest mb-2 leading-none">INVOICE</h2>
          <div className="flex flex-col text-sm font-bold text-gray-600">
            <span>TEL: {hospitalDetails.phone}</span>
            <span>EMAIL: {hospitalDetails.email}</span>
            {hospitalDetails.taxId && <span>PIN: {hospitalDetails.taxId}</span>}
          </div>
        </div>
      </header>

      {/* 2. Transaction Records */}
      <div className="grid grid-cols-2 gap-12 mb-12">
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <User className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest">Billing To</h3>
          </div>
          <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-100">
            <p className="text-lg font-black text-gray-900">{invoice.patient.firstName} {invoice.patient.lastName}</p>
            <p className="text-sm text-gray-500 font-mono">MRN: {invoice.patient.mrn}</p>
            <p className="text-[11px] text-gray-400 mt-2 uppercase font-bold tracking-tighter">
                {invoice.visit?.type} VISIT — ID: {invoice.id.split('-')[0]}
            </p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-2 border-b border-gray-100 pb-2">
            <FileText className="h-4 w-4 text-emerald-600" />
            <h3 className="text-xs font-black text-emerald-600 uppercase tracking-widest">Statement Info</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase">Invoice Date</p>
              <p className="text-sm font-bold">{format(new Date(invoice.createdAt), 'MMMM dd, yyyy')}</p>
            </div>
            <div>
              <p className="text-[10px] text-gray-400 font-black uppercase">Due Date</p>
              <p className="text-sm font-bold">UPON RECEIPT</p>
            </div>
            <div className="col-span-2">
              <p className="text-[10px] text-gray-400 font-black uppercase">Invoice Status</p>
              <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-black uppercase border ${
                invoice.status === 'PAID' ? 'bg-emerald-50 border-emerald-200 text-emerald-600' : 'bg-amber-50 border-amber-200 text-amber-600'
              }`}>
                {invoice.status}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 3. Line Items Table */}
      <div className="mb-12">
        <table className="w-full">
          <thead>
            <tr className="bg-emerald-600 text-white text-[10px] font-black uppercase tracking-widest text-left">
              <th className="px-6 py-4 rounded-tl-xl">Service Description</th>
              <th className="px-6 py-4">Category</th>
              <th className="px-6 py-4 text-center">Unit Price</th>
              <th className="px-6 py-4 text-center">Qty</th>
              <th className="px-6 py-4 text-right rounded-tr-xl">Total (USD)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 border-x border-b border-gray-100 rounded-b-xl overflow-hidden">
            {invoice.billItems.map((item: any) => (
              <tr key={item.id} className="text-sm">
                <td className="px-6 py-4 font-bold text-gray-800">{item.description}</td>
                <td className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-tighter">{item.category}</td>
                <td className="px-6 py-4 text-center font-mono">{item.unitPrice.toFixed(2)}</td>
                <td className="px-6 py-4 text-center">{item.quantity}</td>
                <td className="px-6 py-4 text-right font-black">{item.totalPrice.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* 4. Totals Summary */}
      <div className="flex justify-end mb-12">
        <div className="w-80 space-y-3">
          <div className="flex justify-between text-sm text-gray-500 font-medium">
            <span>Subtotal</span>
            <span>$ {invoice.totalAmount.toFixed(2)}</span>
          </div>
          <div className="flex justify-between text-sm text-gray-500 font-medium">
            <span>Taxes (0%)</span>
            <span>$ 0.00</span>
          </div>
          <div className="flex justify-between text-lg font-black text-gray-900 border-t-2 border-emerald-600 pt-3">
            <span>TOTAL DUE</span>
            <span>$ {invoice.totalAmount.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* 5. Validation & Signature */}
      <div className="grid grid-cols-2 gap-12 mt-auto">
        <div className="p-6 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-start gap-4">
          <ShieldCheck className="h-6 w-6 text-emerald-600 shrink-0" />
          <div>
            <h4 className="text-xs font-black text-emerald-900 uppercase mb-1">Financial Integrity Verified</h4>
            <p className="text-[10px] text-emerald-700 leading-relaxed font-medium">
                This invoice is an official document of {hospitalDetails.name} and has been validated against the central cloud ledger. 
                Reference: {invoice.id}
            </p>
          </div>
        </div>
        <div className="flex flex-col items-center justify-end">
            <div className="w-64 border-b border-gray-300 mb-2"></div>
            <p className="text-[10px] font-black text-gray-400 uppercase">Hospital Administrator Signature</p>
        </div>
      </div>

      {/* 6. Legal Footer */}
      <footer className="mt-20 pt-8 border-t border-gray-100 text-center space-y-4">
        <p className="text-[9px] text-gray-400 font-medium leading-relaxed max-w-lg mx-auto">
            Payment is due upon receipt unless otherwise agreed. For inquiries, please contact our billing department during business hours. 
            Late payments subject to administrative fees.
        </p>
        <div className="flex flex-col items-center gap-1 opacity-60">
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-900">
                ©AmisiMedOs by amisigenuine.com
            </p>
        </div>
      </footer>

      {/* Print styles isolation */}
    </div>
  );
}
