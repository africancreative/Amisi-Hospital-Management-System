import { getPatients } from '@/app/actions/ehr-actions';
import ServiceInvoiceForm from '@/components/ServiceInvoiceForm';
import { Receipt, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default async function NewInvoicePage() {
    const patients = await getPatients();

    return (
        <div className="flex-1 overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white font-sans">
            <div className="mx-auto max-w-5xl">
                <header className="mb-10 flex justify-between items-end">
                    <div>
                        <Link href="/billing" className="text-emerald-500 flex items-center gap-1 text-xs font-black uppercase tracking-widest mb-4 hover:underline">
                            <ArrowLeft className="h-3 w-3" /> Back to Billing
                        </Link>
                        <h1 className="text-4xl font-black tracking-tight flex items-center gap-3">
                            <Receipt className="h-10 w-10 text-emerald-500" />
                            Generate Service Invoice
                        </h1>
                        <p className="text-gray-500 font-medium mt-2">
                            Create a detailed clinical invoice with localized tax and payment terms.
                        </p>
                    </div>
                </header>

                <ServiceInvoiceForm patients={patients} />
            </div>
        </div>
    );
}
