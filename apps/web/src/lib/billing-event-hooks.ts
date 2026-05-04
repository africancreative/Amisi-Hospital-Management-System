'use client';

import { useState, useCallback } from 'react';
import {
  billConsultation,
  billLabOrder,
  billPrescription,
  addManualBillItem,
  processBillPayment,
  getInvoiceByEncounter,
  getInvoiceByVisit,
  deleteBillItem,
} from '@/lib/billing-event-actions';
import {
  BillingCategory,
  PaymentMethod,
  ConsultationBillingPayload,
  LabBillingPayload,
  PrescriptionBillingPayload,
  InvoiceSummary,
} from '@/lib/billing-event-types';

// ─── Auto-Billing Hooks ─────────────────────────────────────────────────

export function useAutoBilling() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastResult, setLastResult] = useState<{ success: boolean; billItemId?: string; amount?: number; invoiceId?: string; message?: string } | null>(null);

  const triggerConsultationBilling = useCallback(async (data: ConsultationBillingPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await billConsultation(data);
      setLastResult(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to bill consultation';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerLabBilling = useCallback(async (data: LabBillingPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await billLabOrder(data);
      setLastResult(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to bill lab order';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const triggerPrescriptionBilling = useCallback(async (data: PrescriptionBillingPayload) => {
    setLoading(true);
    setError(null);
    try {
      const result = await billPrescription(data);
      setLastResult(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to bill prescription';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const addManualItem = useCallback(async (data: {
    patientId: string;
    encounterId?: string;
    visitId?: string;
    description: string;
    category: BillingCategory;
    quantity: number;
    unitPrice: number;
  }) => {
    setLoading(true);
    setError(null);
    try {
      const result = await addManualBillItem(data);
      setLastResult(result);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to add bill item';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    lastResult,
    triggerConsultationBilling,
    triggerLabBilling,
    triggerPrescriptionBilling,
    addManualItem,
  };
}

// ─── Invoice Query Hooks ────────────────────────────────────────────────

export function useInvoiceByEncounter(encounterId: string | null) {
  const [invoice, setInvoice] = useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInvoice = useCallback(async () => {
    if (!encounterId) return;
    setLoading(true);
    try {
      const result = await getInvoiceByEncounter(encounterId);
      setInvoice(result);
    } finally {
      setLoading(false);
    }
  }, [encounterId]);

  return { invoice, loading, refresh: fetchInvoice };
}

export function useInvoiceByVisit(visitId: string | null) {
  const [invoice, setInvoice] = useState<InvoiceSummary | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchInvoice = useCallback(async () => {
    if (!visitId) return;
    setLoading(true);
    try {
      const result = await getInvoiceByVisit(visitId);
      setInvoice(result);
    } finally {
      setLoading(false);
    }
  }, [visitId]);

  return { invoice, loading, refresh: fetchInvoice };
}

// ─── Payment Hook ───────────────────────────────────────────────────────

export function useBillPayment() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const processPayment = useCallback(async (data: {
    invoiceId: string;
    amount: number;
    method: PaymentMethod;
    reference?: string;
    allocations?: { billItemId: string; amount: number }[];
  }) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    try {
      const result = await processBillPayment(data);
      if (result.success) {
        setSuccess(true);
      } else {
        setError(result.message ?? 'Payment failed');
      }
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment processing failed';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setError(null);
    setSuccess(false);
  }, []);

  return { loading, error, success, processPayment, reset };
}

// ─── Bill Item Management Hook ──────────────────────────────────────────

export function useBillItemManagement() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const removeItem = useCallback(async (billItemId: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await deleteBillItem(billItemId);
      return result;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to delete bill item';
      setError(message);
      return { success: false, message };
    } finally {
      setLoading(false);
    }
  }, []);

  return { loading, error, removeItem };
}
