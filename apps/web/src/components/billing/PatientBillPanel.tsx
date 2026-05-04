'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  CreditCard,
  Banknote,
  Smartphone,
  Receipt,
  ChevronDown,
  ChevronUp,
  FlaskConical,
  Pill,
  Stethoscope,
  Plus,
} from 'lucide-react';
import { getInvoiceByEncounter, getServiceCatalog } from '@/lib/billing-event-actions';
import {
  InvoiceSummary,
  InvoiceItemSummary,
  PaymentMethod,
  BillingCategory,
  ServicePrice,
  getServicesByCategory,
} from '@/lib/billing-event-types';
import { useAutoBilling, useBillPayment } from '@/lib/billing-event-hooks';
import { PaymentCaptureDialog } from './PaymentCaptureDialog';

interface PatientBillPanelProps {
  encounterId: string;
  patientId: string;
  visitId?: string;
  department?: string;
  compact?: boolean;
}

export function PatientBillPanel({ encounterId, patientId, visitId, department, compact }: PatientBillPanelProps) {
  const [invoice, setInvoice] = useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(!compact);
  const [showPaymentDialog, setShowPaymentDialog] = useState(false);
  const [serviceCatalog, setServiceCatalog] = useState<ServicePrice[]>([]);
  const [showAddItem, setShowAddItem] = useState(false);

  const fetchInvoice = useCallback(async () => {
    setLoading(true);
    const data = await getInvoiceByEncounter(encounterId);
    setInvoice(data);
    setLoading(false);
  }, [encounterId]);

  useEffect(() => {
    fetchInvoice();
    getServiceCatalog().then(setServiceCatalog);
  }, [fetchInvoice]);

  const { triggerConsultationBilling, triggerLabBilling, triggerPrescriptionBilling, addManualItem } = useAutoBilling();
  const { processPayment } = useBillPayment();

  const handlePaymentComplete = async (data: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
  }) => {
    const result = await processPayment(data);
    if (result.success) {
      setShowPaymentDialog(false);
      fetchInvoice();
    }
  };

  const handleAddConsultation = async () => {
    await triggerConsultationBilling({
      encounterId,
      patientId,
      visitId,
      department,
    });
    fetchInvoice();
  };

  const handleAddManualItem = async (data: {
    description: string;
    category: BillingCategory;
    quantity: number;
    unitPrice: number;
  }) => {
    await addManualItem({
      patientId,
      encounterId,
      visitId,
      ...data,
    });
    fetchInvoice();
    setShowAddItem(false);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-emerald-500 border-t-transparent" />
          <span className="text-[10px] font-black uppercase tracking-widest text-gray-600">Loading bill...</span>
        </div>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="p-4">
        <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">No bill generated yet</p>
        <button
          onClick={handleAddConsultation}
          className="mt-2 flex items-center gap-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500 transition-colors"
        >
          <Plus className="h-3 w-3" />
          Bill Consultation
        </button>
      </div>
    );
  }

  const balanceDue = invoice.balanceDue;
  const isFullyPaid = balanceDue <= 0 && invoice.totalAmount > 0;

  if (compact) {
    return (
      <>
        <div
          onClick={() => setExpanded(!expanded)}
          className="flex items-center justify-between px-4 py-3 cursor-pointer hover:bg-gray-800/30 transition-colors"
        >
          <div className="flex items-center gap-3">
            <Receipt className={`h-4 w-4 ${isFullyPaid ? 'text-emerald-400' : 'text-amber-400'}`} />
            <span className="text-[10px] font-black uppercase tracking-widest text-gray-400">Bill</span>
          </div>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-black ${isFullyPaid ? 'text-emerald-400' : 'text-amber-400'}`}>
              KES {balanceDue.toLocaleString()}
            </span>
            {expanded ? <ChevronUp className="h-3 w-3 text-gray-600" /> : <ChevronDown className="h-3 w-3 text-gray-600" />}
          </div>
        </div>

        <AnimatePresence>
          {expanded && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <BillContent
                invoice={invoice}
                serviceCatalog={serviceCatalog}
                onAddConsultation={handleAddConsultation}
                onAddManualItem={handleAddManualItem}
                onOpenPayment={() => setShowPaymentDialog(true)}
                onPaymentComplete={() => fetchInvoice()}
                encounterId={encounterId}
                patientId={patientId}
                visitId={visitId}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {showPaymentDialog && invoice && (
          <PaymentCaptureDialog
            invoice={invoice}
            onClose={() => setShowPaymentDialog(false)}
            onPaymentComplete={handlePaymentComplete}
          />
        )}
      </>
    );
  }

  return (
    <>
      <div className="flex flex-col h-full">
        <BillContent
          invoice={invoice}
          serviceCatalog={serviceCatalog}
          onAddConsultation={handleAddConsultation}
          onAddManualItem={handleAddManualItem}
          onOpenPayment={() => setShowPaymentDialog(true)}
          onPaymentComplete={() => fetchInvoice()}
          encounterId={encounterId}
          patientId={patientId}
          visitId={visitId}
        />
      </div>

      {showPaymentDialog && invoice && (
        <PaymentCaptureDialog
          invoice={invoice}
          onClose={() => setShowPaymentDialog(false)}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
    </>
  );
}

function BillContent({
  invoice,
  serviceCatalog,
  onAddConsultation,
  onAddManualItem,
  onOpenPayment,
  onPaymentComplete,
  encounterId,
  patientId,
  visitId,
}: {
  invoice: InvoiceSummary;
  serviceCatalog: ServicePrice[];
  onAddConsultation: () => void;
  onAddManualItem: (data: { description: string; category: BillingCategory; quantity: number; unitPrice: number }) => void;
  onOpenPayment: () => void;
  onPaymentComplete: () => void;
  encounterId: string;
  patientId: string;
  visitId?: string;
}) {
  const [showAddItem, setShowAddItem] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<BillingCategory>('CONSULTATION');
  const [selectedService, setSelectedService] = useState<string>('');

  const isFullyPaid = invoice.balanceDue <= 0 && invoice.totalAmount > 0;

  const categoryServices = getServicesByCategory(selectedCategory);

  const handleAddService = async () => {
    const service = categoryServices.find((s: any) => s.id === selectedService);
    if (!service) return;

    onAddManualItem({
      description: service.name,
      category: selectedCategory,
      quantity: 1,
      unitPrice: service.price,
    });
    setSelectedService('');
    setShowAddItem(false);
  };

  return (
    <div className="flex flex-col h-full bg-[#07070a] text-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800/50 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Receipt className="h-5 w-5 text-emerald-500" />
            <h2 className="text-sm font-black uppercase tracking-widest">Patient Bill</h2>
          </div>
          <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
            isFullyPaid
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
              : invoice.totalPaid > 0
              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
              : 'bg-gray-500/10 text-gray-400 border border-gray-500/20'
          }`}>
            {isFullyPaid ? 'Paid' : invoice.totalPaid > 0 ? 'Partial' : 'Unpaid'}
          </span>
        </div>
      </div>

      {/* Summary */}
      <div className="px-6 py-4 border-b border-gray-800/30 shrink-0">
        <div className="grid grid-cols-3 gap-4">
          <SummaryStat label="Total" value={`KES ${invoice.totalAmount.toLocaleString()}`} />
          <SummaryStat label="Paid" value={`KES ${invoice.totalPaid.toLocaleString()}`} color="emerald" />
          <SummaryStat
            label="Balance"
            value={`KES ${invoice.balanceDue.toLocaleString()}`}
            color={isFullyPaid ? 'emerald' : 'amber'}
          />
        </div>
      </div>

      {/* Bill Items */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500">Services & Orders</h3>
          <button
            onClick={() => setShowAddItem(!showAddItem)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-gray-800/50 text-gray-400 text-[9px] font-black uppercase tracking-wider hover:text-white hover:bg-gray-700/50 transition-colors"
          >
            <Plus className="h-3 w-3" />
            Add Item
          </button>
        </div>

        <AnimatePresence>
          {showAddItem && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden mb-4"
            >
              <div className="p-4 rounded-xl bg-gray-900/40 border border-gray-800/50 space-y-3">
                {/* Category Selector */}
                <div className="flex gap-1">
                  {(['CONSULTATION', 'LAB', 'PHARMACY', 'PROCEDURE', 'WARD'] as BillingCategory[]).map((cat: any) => (
                    <button
                      key={cat}
                      onClick={() => { setSelectedCategory(cat); setSelectedService(''); }}
                      className={`px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider transition-colors ${
                        selectedCategory === cat
                          ? 'bg-blue-600 text-white'
                          : 'bg-gray-800/50 text-gray-500'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                {/* Service Selector */}
                <select
                  value={selectedService}
                  onChange={(e) => setSelectedService(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-gray-800/50 border border-gray-700/50 text-sm text-white"
                >
                  <option value="">Select service...</option>
                  {categoryServices.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — KES {s.price.toLocaleString()}
                    </option>
                  ))}
                </select>

                <button
                  onClick={handleAddService}
                  disabled={!selectedService}
                  className="w-full px-3 py-2 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  Add to Bill
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Items List */}
        <div className="space-y-2">
          {invoice.items.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-xs text-gray-600">No items billed yet</p>
              <button
                onClick={onAddConsultation}
                className="mt-2 px-3 py-1.5 rounded-lg bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider hover:bg-emerald-500 transition-colors"
              >
                Bill Consultation
              </button>
            </div>
          ) : (
            invoice.items.map((item: any) => (
              <BillItemRow key={item.id} item={item} />
            ))
          )}
        </div>

        {/* Payments */}
        {invoice.payments.length > 0 && (
          <div className="mt-6">
            <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Payments</h3>
            <div className="space-y-2">
              {invoice.payments.map((payment: any) => (
                <PaymentRow key={payment.id} payment={payment} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Pay Button */}
      {!isFullyPaid && invoice.balanceDue > 0 && (
        <div className="px-6 py-4 border-t border-gray-800/50 shrink-0">
          <button
            onClick={onOpenPayment}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-500 transition-colors shadow-lg shadow-emerald-600/20"
          >
            <DollarSign className="h-4 w-4" />
            Pay KES {invoice.balanceDue.toLocaleString()}
          </button>
        </div>
      )}
    </div>
  );
}

function SummaryStat({ label, value, color = 'white' }: { label: string; value: string; color?: string }) {
  const colorClasses: Record<string, string> = {
    white: 'text-white',
    emerald: 'text-emerald-400',
    amber: 'text-amber-400',
  };

  return (
    <div className="text-center">
      <p className="text-[9px] font-black uppercase tracking-widest text-gray-600">{label}</p>
      <p className={`text-lg font-black ${colorClasses[color] ?? 'text-white'}`}>{value}</p>
    </div>
  );
}

function BillItemRow({ item }: { item: InvoiceItemSummary }) {
  const categoryIcons: Record<string, React.ElementType> = {
    CONSULTATION: Stethoscope,
    LAB: FlaskConical,
    PHARMACY: Pill,
    PROCEDURE: Receipt,
    WARD: Receipt,
  };

  const Icon = categoryIcons[item.category] ?? Receipt;

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-gray-900/30 border border-gray-800/30">
      <div className="flex items-center gap-3">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
          item.isPaid ? 'bg-emerald-500/10' : 'bg-gray-700/30'
        }`}>
          <Icon className={`h-4 w-4 ${item.isPaid ? 'text-emerald-400' : 'text-gray-500'}`} />
        </div>
        <div>
          <p className="text-xs font-bold text-white">{item.description}</p>
          <p className="text-[9px] text-gray-600 uppercase tracking-wider">{item.category}</p>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-black">KES {item.totalPrice.toLocaleString()}</p>
        </div>
        {item.isPaid ? (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
            <CheckCircle2 className="h-3 w-3" />
            <span className="text-[9px] font-black uppercase">Paid</span>
          </span>
        ) : (
          <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400">
            <Clock className="h-3 w-3" />
            <span className="text-[9px] font-black uppercase">Unpaid</span>
          </span>
        )}
      </div>
    </div>
  );
}

function PaymentRow({ payment }: { payment: { id: string; amount: number; method: string; reference?: string; createdAt: Date } }) {
  const methodIcons: Record<string, React.ElementType> = {
    CASH: Banknote,
    MPESA: Smartphone,
    CARD: CreditCard,
  };

  const Icon = methodIcons[payment.method] ?? DollarSign;

  const methodColors: Record<string, string> = {
    CASH: 'text-emerald-400',
    MPESA: 'text-green-400',
    CARD: 'text-blue-400',
  };

  return (
    <div className="flex items-center justify-between p-3 rounded-xl bg-emerald-500/5 border border-emerald-500/10">
      <div className="flex items-center gap-3">
        <div className="h-8 w-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
          <Icon className={`h-4 w-4 ${methodColors[payment.method] ?? 'text-emerald-400'}`} />
        </div>
        <div>
          <p className="text-xs font-bold text-white">{payment.method}</p>
          {payment.reference && (
            <p className="text-[9px] text-gray-500 font-mono">{payment.reference}</p>
          )}
        </div>
      </div>
      <div className="text-right">
        <p className="text-sm font-black text-emerald-400">KES {payment.amount.toLocaleString()}</p>
        <p className="text-[9px] text-gray-600">
          {new Date(payment.createdAt).toLocaleDateString()}
        </p>
      </div>
    </div>
  );
}
