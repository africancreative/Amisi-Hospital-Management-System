'use client';

import { FileText } from 'lucide-react';
import { generateInvoice } from '@/lib/reports';

interface ExportInvoiceButtonProps {
    invoice: any;
    hospitalSettings: any;
    variant?: 'icon' | 'full';
}

export default function ExportInvoiceButton({ invoice, hospitalSettings, variant = 'icon' }: ExportInvoiceButtonProps) {
    if (variant === 'full') {
        return (
            <button
                onClick={() => generateInvoice(invoice, hospitalSettings)}
                className="w-full py-4 px-6 border border-emerald-500/30 text-emerald-500 rounded-2xl font-black text-sm hover:bg-emerald-500/10 transition-all flex items-center justify-center gap-2"
            >
                <FileText className="h-4 w-4" />
                Generate Ledger Report
            </button>
        );
    }

    return (
        <button
            onClick={() => generateInvoice(invoice)}
            className="p-2 text-gray-400 hover:text-emerald-500 transition-colors"
            title="Download Invoice"
        >
            <FileText className="h-4 w-4" />
        </button>
    );
}
