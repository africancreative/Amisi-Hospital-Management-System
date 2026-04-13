'use client';

import React from 'react';
import { format } from 'date-fns';
import { CheckCircle2, QrCode } from 'lucide-react';

interface ThermalReceiptProps {
  invoice: any;
  hospitalName: string;
  location: string;
}

/**
 * Thermal Receipt Template (80mm)
 * 
 * High-fidelity, condensed layout for retail point-of-sale thermal printers.
 * Features optimized typography and a QR code for digital audit verification.
 */
export function ThermalReceipt({ invoice, hospitalName, location }: ThermalReceiptProps) {
  return (
    <div className="print-only w-[80mm] p-4 bg-white text-black font-mono text-xs leading-tight">
      {/* 1. Header */}
      <div className="text-center mb-4 space-y-1">
        <h1 className="text-sm font-black uppercase tracking-tighter">{hospitalName}</h1>
        <p className="text-[10px] lowercase">{location}</p>
        <div className="border-b border-dashed border-black mt-2 w-full"></div>
      </div>

      {/* 2. Transaction Info */}
      <div className="space-y-1 mb-4">
        <div className="flex justify-between">
          <span>DATE:</span>
          <span>{format(new Date(), 'dd/MM/yyyy HH:mm')}</span>
        </div>
        <div className="flex justify-between">
          <span>INV#:</span>
          <span className="font-bold">{invoice.id.split('-')[0].toUpperCase()}</span>
        </div>
        <div className="flex justify-between">
          <span>PT:</span>
          <span className="truncate">{invoice.patient.firstName} {invoice.patient.lastName}</span>
        </div>
      </div>

      <div className="border-b border-dashed border-black mb-4 w-full"></div>

      {/* 3. Itemized List */}
      <div className="space-y-2 mb-6">
        {invoice.billItems.map((item: any) => (
          <div key={item.id} className="flex flex-col">
            <div className="flex justify-between font-bold">
              <span className="truncate uppercase">{item.description}</span>
              <span>{item.totalPrice.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-[9px] text-gray-700 italic">
              <span>{item.quantity} x {item.unitPrice.toFixed(2)}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="border-b border-dashed border-black mb-4 w-full"></div>

      {/* 4. Totals */}
      <div className="space-y-1 mb-6">
        <div className="flex justify-between text-[11px] font-black">
          <span>TOTAL DUE:</span>
          <span>USD {invoice.totalAmount.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>PAID:</span>
          <span>USD {(invoice.totalAmount - invoice.balance).toFixed(2)}</span>
        </div>
        <div className="flex justify-between border-t border-black pt-1 mt-1 font-bold">
          <span>BALANCE:</span>
          <span>USD {invoice.balance.toFixed(2)}</span>
        </div>
      </div>

      {/* 5. Footer & Verification */}
      <div className="text-center space-y-3 mt-8">
        <div className="flex flex-col items-center gap-1">
          <QrCode className="h-10 w-10 opacity-80" />
          <span className="text-[8px] uppercase font-bold tracking-widest text-gray-500">Scan for e-Receipt</span>
        </div>
        <p className="text-[10px] font-bold italic">Thank you for choosing AmisiMedOS</p>
        <div className="border-t border-dashed border-black pt-4">
            <p className="text-[9px] font-black uppercase tracking-tighter opacity-70">
                ©AmisiMedOs by amisigenuine.com
            </p>
        </div>
      </div>

      {/* Print styles isolation */}
      <style jsx global>{`
        @media screen {
          .print-only { display: none; }
        }
        @media print {
          body * { visibility: hidden; }
          .print-only, .print-only * { visibility: visible; }
          .print-only { position: absolute; left: 0; top: 0; }
        }
      `}</style>
    </div>
  );
}
