'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Banknote,
  Smartphone,
  CreditCard,
  Check,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { InvoiceSummary, PaymentMethod } from '@/lib/billing-event-types';

interface PaymentCaptureDialogProps {
  invoice: InvoiceSummary;
  onClose: () => void;
  onPaymentComplete: (data: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
  }) => void;
}

export function PaymentCaptureDialog({ invoice, onClose, onPaymentComplete }: PaymentCaptureDialogProps) {
  const [method, setMethod] = useState<PaymentMethod>('CASH');
  const [amount, setAmount] = useState(invoice.balanceDue);
  const [reference, setReference] = useState('');
  const [cardNumber, setCardNumber] = useState('');
  const [cardHolder, setCardHolder] = useState('');
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setError(null);

    if (amount <= 0) {
      setError('Amount must be greater than zero');
      return;
    }

    if (amount > invoice.balanceDue) {
      setError(`Amount exceeds balance due (KES ${invoice.balanceDue.toLocaleString()})`);
      return;
    }

    if (method === 'MPESA' && !reference.trim()) {
      setError('M-Pesa confirmation code is required');
      return;
    }

    if (method === 'CARD' && !cardNumber.trim()) {
      setError('Card number is required');
      return;
    }

    setProcessing(true);

    try {
      await onPaymentComplete({
        invoiceId: invoice.id,
        amount,
        method,
        reference: method === 'MPESA' ? reference.trim() : method === 'CARD' ? cardNumber.trim().slice(-4) : undefined,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Payment processing failed');
    } finally {
      setProcessing(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={handleBackdropClick}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className="w-full max-w-md mx-4 rounded-2xl bg-[#0f0f14] border border-gray-800/50 shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-800/50">
          <div>
            <h2 className="text-base font-black uppercase tracking-wider">Record Payment</h2>
            <p className="text-[10px] font-bold text-gray-600 mt-0.5">Balance: KES {invoice.balanceDue.toLocaleString()}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-800/50 transition-colors"
          >
            <X className="h-4 w-4 text-gray-500" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Payment Method */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3 block">Payment Method</label>
            <div className="grid grid-cols-3 gap-2">
              <MethodButton
                icon={Banknote}
                label="Cash"
                method="CASH"
                selected={method === 'CASH'}
                onClick={() => setMethod('CASH')}
              />
              <MethodButton
                icon={Smartphone}
                label="M-Pesa"
                method="MPESA"
                selected={method === 'MPESA'}
                onClick={() => setMethod('MPESA')}
              />
              <MethodButton
                icon={CreditCard}
                label="Card"
                method="CARD"
                selected={method === 'CARD'}
                onClick={() => setMethod('CARD')}
              />
            </div>
          </div>

          {/* Amount */}
          <div>
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Amount (KES)</label>
            <div className="flex gap-2">
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                className="flex-1 px-4 py-3 rounded-xl bg-gray-900/50 border border-gray-700/50 text-lg font-black text-white placeholder-gray-700 focus:border-emerald-500/50 focus:outline-none"
                placeholder="0"
                min={0}
                max={invoice.balanceDue}
              />
              <button
                onClick={() => setAmount(invoice.balanceDue)}
                className="px-3 py-2 rounded-xl bg-gray-800/50 text-gray-400 text-[9px] font-black uppercase tracking-wider hover:text-white hover:bg-gray-700/50 transition-colors whitespace-nowrap"
              >
                Full
              </button>
            </div>
          </div>

          {/* M-Pesa Reference */}
          <AnimatePresence>
            {method === 'MPESA' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-green-500/5 border border-green-500/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <Smartphone className="h-4 w-4 text-green-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-green-400">M-Pesa Confirmation</span>
                  </div>
                  <input
                    type="text"
                    value={reference}
                    onChange={(e) => setReference(e.target.value.toUpperCase())}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700/50 text-sm font-mono text-white placeholder-gray-700 focus:border-green-500/50 focus:outline-none uppercase"
                    placeholder="Enter M-Pesa code (e.g. SJK7X2H9L0)"
                    maxLength={12}
                  />
                  <p className="text-[9px] text-gray-600">
                    Enter the confirmation code from the M-Pesa SMS received on the business till/paybill.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Card Details */}
          <AnimatePresence>
            {method === 'CARD' && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="p-4 rounded-xl bg-blue-500/5 border border-blue-500/10 space-y-3">
                  <div className="flex items-center gap-2">
                    <CreditCard className="h-4 w-4 text-blue-400" />
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Card Details</span>
                  </div>
                  <input
                    type="text"
                    value={cardNumber}
                    onChange={(e) => {
                      const v = e.target.value.replace(/\D/g, '').slice(0, 16);
                      setCardNumber(v.replace(/(.{4})/g, '$1 ').trim());
                    }}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700/50 text-sm font-mono text-white placeholder-gray-700 focus:border-blue-500/50 focus:outline-none"
                    placeholder="1234 5678 9012 3456"
                  />
                  <input
                    type="text"
                    value={cardHolder}
                    onChange={(e) => setCardHolder(e.target.value)}
                    className="w-full px-4 py-3 rounded-lg bg-gray-900/50 border border-gray-700/50 text-sm text-white placeholder-gray-700 focus:border-blue-500/50 focus:outline-none"
                    placeholder="Cardholder name"
                  />
                  <p className="text-[9px] text-gray-600">
                    Card details are recorded for reconciliation only. No gateway integration.
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Cash note */}
          {method === 'CASH' && (
            <div className="p-3 rounded-lg bg-emerald-500/5 border border-emerald-500/10">
              <p className="text-[9px] text-emerald-400/70">
                Cash payment recorded immediately. Issue receipt after confirmation.
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="flex items-center gap-2 p-3 rounded-lg bg-red-500/10 border border-red-500/20">
              <AlertTriangle className="h-4 w-4 text-red-400 shrink-0" />
              <p className="text-xs text-red-400">{error}</p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-800/50 flex gap-3">
          <button
            onClick={onClose}
            disabled={processing}
            className="flex-1 px-4 py-3 rounded-xl bg-gray-800/50 text-gray-400 text-xs font-black uppercase tracking-wider hover:text-white hover:bg-gray-700/50 transition-colors disabled:opacity-30"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={processing}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 text-white text-xs font-black uppercase tracking-wider hover:bg-emerald-500 transition-colors disabled:opacity-50 shadow-lg shadow-emerald-600/20"
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Processing...
              </>
            ) : (
              <>
                <Check className="h-4 w-4" />
                Confirm Payment
              </>
            )}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function MethodButton({
  icon: Icon,
  label,
  method,
  selected,
  onClick,
}: {
  icon: React.ElementType;
  label: string;
  method: PaymentMethod;
  selected: boolean;
  onClick: () => void;
}) {
  const colors: Record<PaymentMethod, { bg: string; border: string; icon: string; label: string }> = {
    CASH: {
      bg: selected ? 'bg-emerald-500/10' : 'bg-gray-800/30',
      border: selected ? 'border-emerald-500/40' : 'border-gray-700/30',
      icon: selected ? 'text-emerald-400' : 'text-gray-600',
      label: selected ? 'text-emerald-400' : 'text-gray-600',
    },
    MPESA: {
      bg: selected ? 'bg-green-500/10' : 'bg-gray-800/30',
      border: selected ? 'border-green-500/40' : 'border-gray-700/30',
      icon: selected ? 'text-green-400' : 'text-gray-600',
      label: selected ? 'text-green-400' : 'text-gray-600',
    },
    CARD: {
      bg: selected ? 'bg-blue-500/10' : 'bg-gray-800/30',
      border: selected ? 'border-blue-500/40' : 'border-gray-700/30',
      icon: selected ? 'text-blue-400' : 'text-gray-600',
      label: selected ? 'text-blue-400' : 'text-gray-600',
    },
  };

  const c = colors[method];

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center gap-2 p-3 rounded-xl border transition-all ${c.bg} ${c.border}`}
    >
      <Icon className={`h-5 w-5 ${c.icon}`} />
      <span className={`text-[10px] font-black uppercase tracking-wider ${c.label}`}>{label}</span>
    </button>
  );
}
