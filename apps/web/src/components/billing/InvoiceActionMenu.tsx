'use client';

import React, { useState } from 'react';
import { Printer, FileDown, MoreVertical, Layout, Receipt } from 'lucide-react';
import { ThermalReceipt } from './ThermalReceipt';
import { A4Invoice } from './A4Invoice';

interface InvoiceActionMenuProps {
  invoice: any;
}

/**
 * High-Fidelity Print & Action Menu
 * 
 * Central hub for dual-format printing (Thermal/A4).
 * Allows administrative staff to choose the correct output format 
 * based on the transaction type (Pharmacy roll vs. General discharge).
 */
export function InvoiceActionMenu({ invoice }: InvoiceActionMenuProps) {
  const [printMode, setPrintMode] = useState<'THERMAL' | 'A4' | null>(null);

  const triggerPrint = (mode: 'THERMAL' | 'A4') => {
    setPrintMode(mode);
    // Wait for state to update and template to render in 'print-only' mode
    setTimeout(() => {
      window.print();
    }, 200);
  };

  // Mock Hospital Details (In production, these come from context/settings)
  const hospitalDetails = {
    name: 'AMISI MEDOS COMMAND HUB',
    address: '12-A Corporate Tower, Level 5\nClinical Innovation District\nNairobi, Kenya',
    phone: '+254 700 000 000',
    email: 'billing@amisimedos.io',
    taxId: 'P0510123456Z'
  };

  return (
    <div className="flex items-center gap-2">
      {/* 1. Print Selection Group */}
      <div className="flex bg-gray-900/50 border border-gray-800 rounded-xl p-1 shadow-inner">
        <button 
          onClick={() => triggerPrint('THERMAL')}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg text-[10px] font-black uppercase text-gray-400 hover:text-white transition-all group"
        >
          <Receipt className="h-3.5 w-3.5 group-hover:text-emerald-500 transition-colors" />
          Thermal
        </button>
        <div className="w-[1px] bg-gray-800 my-1 mx-1"></div>
        <button 
          onClick={() => triggerPrint('A4')}
          className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg text-[10px] font-black uppercase text-gray-400 hover:text-white transition-all group"
        >
          <Layout className="h-3.5 w-3.5 group-hover:text-emerald-500 transition-colors" />
          A4 Professional
        </button>
      </div>

      {/* 2. Export / Secondary Actions */}
      <button className="h-10 w-10 flex items-center justify-center bg-gray-950 border border-gray-800 rounded-xl text-gray-500 hover:text-emerald-500 hover:border-emerald-500/50 transition-all">
         <FileDown className="h-4 w-4" />
      </button>

      {/* 3. Hidden Print Templates */}
      {printMode === 'THERMAL' && (
        <ThermalReceipt 
          invoice={invoice} 
          hospitalName={hospitalDetails.name}
          location="Clinical Point-Of-Sale"
        />
      )}
      {printMode === 'A4' && (
        <A4Invoice 
          invoice={invoice} 
          hospitalDetails={hospitalDetails}
        />
      )}
    </div>
  );
}
