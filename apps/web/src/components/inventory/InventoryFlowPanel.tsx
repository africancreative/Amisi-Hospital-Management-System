'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  FileText,
  Pill,
  Package,
  DollarSign,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ArrowRight,
  User,
  Stethoscope,
} from 'lucide-react';
import { getInvoiceByEncounter } from '@/lib/billing-event-actions';
import { checkStockForPrescription, StockCheckReport } from '@/lib/inventory-flow-actions';

interface InventoryFlowPanelProps {
  prescription: {
    id: string;
    encounterId?: string;
    patientId: string;
    patientName: string;
    orderedBy: string;
    status: string;
    isBilled: boolean;
    isPaid: boolean;
    items: Array<{
      id: string;
      drugName: string;
      dosage: string;
      quantity: number;
      inventoryItemId?: string;
      stockAvailable?: boolean;
      inventoryItem?: { name: string; quantity: number; minLevel: number; price: number; unit: string };
    }>;
  };
  compact?: boolean;
}

export function InventoryFlowPanel({ prescription, compact }: InventoryFlowPanelProps) {
  const [stockCheck, setStockCheck] = useState<StockCheckReport | null>(null);
  const [invoice, setInvoice] = useState<{ items: Array<{ category: string; status: string; totalPrice: number }> } | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setLoading(true);

    const items = prescription.items.map((i: any) => ({
      drugName: i.drugName,
      quantity: i.quantity,
      inventoryItemId: i.inventoryItemId,
    }));

    const stockData = await checkStockForPrescription(items);
    setStockCheck(stockData as any);

    if (prescription.encounterId) {
      const invoiceData = await getInvoiceByEncounter(prescription.encounterId);
      setInvoice(invoiceData as any);
    }

    setLoading(false);
  }, [prescription]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-6">
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-blue-500 border-t-transparent" />
      </div>
    );
  }

  if (compact) {
    const pharmacyItem = invoice?.items.find((i: any) => i.category === 'PHARMACY');

    return (
      <div className="flex items-center gap-2">
        <StepIndicator
          icon={FileText}
          label="Rx"
          status="complete"
        />
        <ArrowRight className="h-3 w-3 text-gray-700" />
        <StepIndicator
          icon={Package}
          label="Stock"
          status={stockCheck?.allAvailable ? 'complete' : 'error'}
        />
        <ArrowRight className="h-3 w-3 text-gray-700" />
        <StepIndicator
          icon={DollarSign}
          label="Bill"
          status={pharmacyItem ? (pharmacyItem.status === 'PAID' ? 'complete' : 'pending') : 'pending'}
        />
      </div>
    );
  }

  const pharmacyItem = invoice?.items.find((i: any) => i.category === 'PHARMACY');

  return (
    <div className="flex flex-col h-full bg-[#07070a] text-white">
      {/* Header */}
      <div className="px-6 py-4 border-b border-gray-800/50 shrink-0">
        <div className="flex items-center gap-3">
          <Pill className="h-5 w-5 text-purple-500" />
          <h2 className="text-sm font-black uppercase tracking-widest">Prescription Flow</h2>
        </div>
      </div>

      {/* Flow Steps */}
      <div className="flex-1 overflow-y-auto px-6 py-4">
        {/* Step 1: EMR/Prescription */}
        <FlowStep
          icon={FileText}
          title="Prescription Created"
          status="complete"
          details={[
            `Ordered by: ${prescription.orderedBy}`,
            `Patient: ${prescription.patientName}`,
            `${prescription.items.length} item(s) prescribed`,
          ]}
        />

        {/* Step 2: Stock Check */}
        <FlowStep
          icon={Package}
          title="Stock Verification"
          status={stockCheck?.allAvailable ? 'complete' : 'error'}
          details={stockCheck?.items.map((item: any) => {
            if (item.isAvailable) {
              return `${item.itemName}: ${item.availableQty} available ✓`;
            }
            return `${item.itemName}: ${item.shortageQty} short ✗`;
          }) ?? []}
        />

        {/* Step 3: Inventory Deduction */}
        <FlowStep
          icon={Package}
          title="Inventory Deduction"
          status={prescription.status === 'dispensed' ? 'complete' : prescription.status === 'pending' ? 'pending' : 'warning'}
          details={prescription.items.map((item: any) => {
            const invItem = item.inventoryItem;
            if (invItem) {
              return `${invItem.name}: -${item.quantity} (${invItem.quantity} remaining)`;
            }
            return `${item.drugName}: ${item.quantity} units`;
          })}
        />

        {/* Step 4: Billing */}
        <FlowStep
          icon={DollarSign}
          title="Billing"
          status={pharmacyItem ? (pharmacyItem.status === 'PAID' ? 'complete' : 'pending') : 'pending'}
          details={pharmacyItem ? [
            `Charge: KES ${pharmacyItem.totalPrice.toLocaleString()}`,
            `Status: ${pharmacyItem.status}`,
          ] : ['No bill generated yet']}
        />

        {/* Per-Item Flow */}
        <div className="mt-6">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-500 mb-3">Item-Level Tracking</h3>
          <div className="space-y-3">
            {prescription.items.map((item: any) => {
              const stockItem = stockCheck?.items.find((s: any) => s.itemName === item.drugName || s.itemName === item.inventoryItem?.name);

              return (
                <div key={item.id} className="p-3 rounded-xl bg-gray-900/30 border border-gray-800/30">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <Pill className="h-3.5 w-3.5 text-purple-400" />
                      <span className="text-xs font-bold">{item.drugName}</span>
                      <span className="text-[9px] text-gray-600">{item.dosage} × {item.quantity}</span>
                    </div>
                    {stockItem?.isAvailable ? (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400">
                        <CheckCircle2 className="h-3 w-3" />
                        <span className="text-[9px] font-black uppercase">In Stock</span>
                      </span>
                    ) : (
                      <span className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-500/10 text-red-400">
                        <AlertTriangle className="h-3 w-3" />
                        <span className="text-[9px] font-black uppercase">
                          {stockItem ? `${stockItem.shortageQty} Short` : 'No Match'}
                        </span>
                      </span>
                    )}
                  </div>

                  {/* Mini Flow */}
                  <div className="flex items-center gap-2 px-2">
                    <MiniStep icon={Stethoscope} label="Rx" complete />
                    <div className="h-px flex-1 bg-gray-800" />
                    <MiniStep
                      icon={Package}
                      label="Stock"
                      complete={stockItem?.isAvailable ?? false}
                    />
                    <div className="h-px flex-1 bg-gray-800" />
                    <MiniStep
                      icon={DollarSign}
                      label="Bill"
                      complete={pharmacyItem?.status === 'PAID'}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

function FlowStep({
  icon: Icon,
  title,
  status,
  details,
}: {
  icon: React.ElementType;
  title: string;
  status: 'complete' | 'pending' | 'error' | 'warning';
  details: string[];
}) {
  const statusColors: Record<string, string> = {
    complete: 'text-emerald-400',
    pending: 'text-gray-600',
    error: 'text-red-400',
    warning: 'text-amber-400',
  };

  const statusIcons: Record<string, React.ElementType> = {
    complete: CheckCircle2,
    pending: Clock,
    error: AlertTriangle,
    warning: AlertTriangle,
  };

  const StatusIcon = statusIcons[status];

  return (
    <div className="mb-4">
      <div className="flex items-center gap-3 mb-2">
        <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${
          status === 'complete' ? 'bg-emerald-500/10' :
          status === 'error' ? 'bg-red-500/10' :
          status === 'warning' ? 'bg-amber-500/10' :
          'bg-gray-800/30'
        }`}>
          <Icon className={`h-4 w-4 ${statusColors[status]}`} />
        </div>
        <span className="text-xs font-black uppercase tracking-wider">{title}</span>
        <StatusIcon className={`h-3.5 w-3.5 ml-auto ${statusColors[status]}`} />
      </div>
      <div className="ml-11 space-y-1">
        {details.map((detail: any, idx: any) => (
          <p key={idx} className="text-[10px] text-gray-500">{detail}</p>
        ))}
      </div>
    </div>
  );
}

function MiniStep({ icon: Icon, label, complete }: { icon: React.ElementType; label: string; complete: boolean }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className={`h-5 w-5 rounded flex items-center justify-center ${
        complete ? 'bg-emerald-500/20' : 'bg-gray-800/30'
      }`}>
        <Icon className={`h-3 w-3 ${complete ? 'text-emerald-400' : 'text-gray-600'}`} />
      </div>
      <span className={`text-[8px] font-black uppercase ${complete ? 'text-emerald-400' : 'text-gray-600'}`}>{label}</span>
    </div>
  );
}

function StepIndicator({
  icon: Icon,
  label,
  status,
}: {
  icon: React.ElementType;
  label: string;
  status: 'complete' | 'pending' | 'error';
}) {
  const colors: Record<string, string> = {
    complete: 'text-emerald-400 bg-emerald-500/10',
    pending: 'text-gray-600 bg-gray-800/30',
    error: 'text-red-400 bg-red-500/10',
  };

  return (
    <div className={`flex items-center gap-1 px-2 py-1 rounded-lg ${colors[status]}`}>
      <Icon className="h-3 w-3" />
      <span className="text-[9px] font-black uppercase">{label}</span>
    </div>
  );
}
