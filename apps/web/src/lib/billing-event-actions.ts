'use server';

import { getTenantDb } from '@/lib/db';
import { getServerUser } from '@/lib/auth-utils';
import {
  BillingCategory,
  PaymentMethod,
  ConsultationBillingPayload,
  LabBillingPayload,
  PrescriptionBillingPayload,
  InvoiceSummary,
  InvoiceItemSummary,
  PaymentSummary,
  getServicePrice,
  DEFAULT_SERVICE_CATALOG,
} from '@/lib/billing-event-types';

// ─── Invoice Resolution ─────────────────────────────────────────────────

/**
 * Resolve or create an active invoice for a visit/encounter.
 * Returns the invoice ID for adding bill items.
 */
export async function resolveInvoiceForEncounter(encounterId: string, patientId: string, visitId?: string): Promise<string> {
  const db = await getTenantDb();

  // Check if invoice already exists for this encounter
  const existing = await db.invoice.findFirst({
    where: { encounterId },
    orderBy: { createdAt: 'desc' },
  });

  if (existing) return existing.id;

  // If visitId provided, check for existing invoice on visit
  if (visitId) {
    const visitInvoice = await db.invoice.findFirst({
      where: { visitId },
      orderBy: { createdAt: 'desc' },
    });

    if (visitInvoice) {
      // Link encounter to existing visit invoice
      await db.invoice.update({
        where: { id: visitInvoice.id },
        data: { encounterId },
      });
      return visitInvoice.id;
    }
  }

  // Create new invoice
  const invoice = await db.invoice.create({
    data: {
      patientId,
      encounterId,
      visitId,
      totalAmount: 0,
      balanceDue: 0,
      currency: 'KES',
      status: 'OPEN',
      payerType: 'CASH',
    },
  });

  return invoice.id;
}

// ─── Auto-Billing Triggers ──────────────────────────────────────────────

/**
 * Auto-bill when a consultation begins (encounter seen).
 * Triggers consultation fee based on department/doctor level.
 */
export async function billConsultation(data: ConsultationBillingPayload): Promise<any> {
  const db = await getTenantDb();

  // Check if already billed for this encounter (prevent duplicates)
  const existingBillItem = await db.billItem.findFirst({
    where: {
      encounterId: data.encounterId,
      category: 'CONSULTATION',
    },
  });

  if (existingBillItem) {
    return { success: false, message: 'Consultation already billed', billItemId: existingBillItem.id };
  }

  const invoiceId = await resolveInvoiceForEncounter(data.encounterId, data.patientId, data.visitId);

  // Determine consultation price based on department or servicePriceId
  const service = data.servicePriceId
    ? DEFAULT_SERVICE_CATALOG.find((s: any) => s.id === data.servicePriceId)
    : getServicePrice('CONSULTATION', data.department);

  const unitPrice = service?.price ?? 1500;
  const description = `Consultation - ${data.department ?? 'General'}`;

  const billItem = await db.billItem.create({
    data: {
      invoiceId,
      visitId: data.visitId ?? '',
      encounterId: data.encounterId,
      description,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice,
      category: 'CONSULTATION',
      status: 'UNPAID',
      currency: 'KES',
      taxRate: 0,
      taxAmount: 0,
      discountAmount: 0,
    },
  });

  // Update invoice totals
  await recalculateInvoiceTotals(invoiceId);

  return {
    success: true,
    billItemId: billItem.id,
    amount: unitPrice,
    description,
    invoiceId,
  };
}

/**
 * Auto-bill when a lab order is created.
 */
export async function billLabOrder(data: LabBillingPayload): Promise<any> {
  const db = await getTenantDb();

  // Check if already billed
  const existingBillItem = await db.billItem.findFirst({
    where: {
      encounterId: data.encounterId,
      category: 'LAB',
      description: { contains: data.testPanelId },
    },
  });

  if (existingBillItem) {
    return { success: false, message: 'Lab order already billed', billItemId: existingBillItem.id };
  }

  let invoiceId: string | undefined;

  if (data.encounterId) {
    invoiceId = await resolveInvoiceForEncounter(data.encounterId, data.patientId, data.visitId);
  } else if (data.visitId) {
    // No encounter, create invoice for visit only
    const existing = await db.invoice.findFirst({
      where: { visitId: data.visitId, encounterId: null },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      invoiceId = existing.id;
    } else {
      const invoice = await db.invoice.create({
        data: {
          patientId: data.patientId,
          visitId: data.visitId,
          totalAmount: 0,
          balanceDue: 0,
          currency: 'KES',
          status: 'OPEN',
          payerType: 'CASH',
        },
      });
      invoiceId = invoice.id;
    }
  } else {
    // Standalone lab order - create standalone invoice
    const invoice = await db.invoice.create({
      data: {
        patientId: data.patientId,
        totalAmount: 0,
        balanceDue: 0,
        currency: 'KES',
        status: 'OPEN',
        payerType: 'CASH',
      },
    });
    invoiceId = invoice.id;
  }

  // Determine lab test price
  const service = data.servicePriceId
    ? DEFAULT_SERVICE_CATALOG.find((s: any) => s.id === data.servicePriceId)
    : getServicePrice('LAB', data.testPanelName);

  const unitPrice = service?.price ?? 500;
  const testName = data.testPanelName ?? service?.name ?? 'Lab Test';
  const description = `Lab: ${testName}`;

  const billItem = await db.billItem.create({
    data: {
      invoiceId,
      visitId: data.visitId ?? '',
      encounterId: data.encounterId,
      description,
      quantity: 1,
      unitPrice,
      totalPrice: unitPrice,
      category: 'LAB',
      status: 'UNPAID',
      currency: 'KES',
      taxRate: 0,
      taxAmount: 0,
      discountAmount: 0,
    },
  });

  // Update lab order billing flag
  await db.labOrder.updateMany({
    where: { id: data.labOrderId },
    data: { billedAmount: unitPrice, isBilled: true },
  });

  await recalculateInvoiceTotals(invoiceId);

  return {
    success: true,
    billItemId: billItem.id,
    amount: unitPrice,
    description,
    invoiceId,
  };
}

/**
 * Auto-bill when a prescription is written.
 * Charges pharmacy dispensing fee + drug costs if available.
 */
export async function billPrescription(data: PrescriptionBillingPayload): Promise<any> {
  const db = await getTenantDb();

  // Check if already billed
  const existingBillItem = await db.billItem.findFirst({
    where: {
      encounterId: data.encounterId,
      category: 'PHARMACY',
      description: { contains: data.prescriptionId },
    },
  });

  if (existingBillItem) {
    return { success: false, message: 'Prescription already billed', billItemId: existingBillItem.id };
  }

  let invoiceId: string | undefined;

  if (data.encounterId) {
    invoiceId = await resolveInvoiceForEncounter(data.encounterId, data.patientId, data.visitId);
  } else if (data.visitId) {
    const existing = await db.invoice.findFirst({
      where: { visitId: data.visitId, encounterId: null },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      invoiceId = existing.id;
    } else {
      const invoice = await db.invoice.create({
        data: {
          patientId: data.patientId,
          visitId: data.visitId,
          totalAmount: 0,
          balanceDue: 0,
          currency: 'KES',
          status: 'OPEN',
          payerType: 'CASH',
        },
      });
      invoiceId = invoice.id;
    }
  }

  if (!invoiceId) {
    return { success: false, message: 'No encounter or visit to link prescription to' };
  }

  // Calculate drug cost from inventory if not provided
  let drugCost = data.totalDrugCost ?? 0;

  if (drugCost === 0) {
    // Fetch prescription items with linked inventory
    const prescription = await db.prescription.findUnique({
      where: { id: data.prescriptionId },
      include: { items: { include: { inventoryItem: true } } },
    });

    if (prescription) {
      for (const pItem of prescription.items) {
        if (pItem.inventoryItem) {
          drugCost += pItem.inventoryItem.price * pItem.quantity;
        } else {
          // Fallback: use dispensing fee only
          drugCost += 0;
        }
      }
    }
  }

  // Pharmacy dispensing fee + drug cost
  const dispensingFee = getServicePrice('PHARMACY').price;
  const totalAmount = dispensingFee + drugCost;

  const description = `Pharmacy: ${data.itemCount} item(s) + dispensing fee`;

  const billItem = await db.billItem.create({
    data: {
      invoiceId,
      visitId: data.visitId ?? '',
      encounterId: data.encounterId,
      description,
      quantity: 1,
      unitPrice: totalAmount,
      totalPrice: totalAmount,
      category: 'PHARMACY',
      status: 'UNPAID',
      currency: 'KES',
      taxRate: 0,
      taxAmount: 0,
      discountAmount: 0,
    },
  });

  await recalculateInvoiceTotals(invoiceId);

  return {
    success: true,
    billItemId: billItem.id,
    amount: totalAmount,
    description,
    invoiceId,
  };
}

// ─── Manual Bill Item ───────────────────────────────────────────────────

export async function addManualBillItem(data: {
  patientId: string;
  encounterId?: string;
  visitId?: string;
  description: string;
  category: BillingCategory;
  quantity: number;
  unitPrice: number;
}): Promise<any> {
  const db = await getTenantDb();

  let invoiceId: string;

  if (data.encounterId) {
    invoiceId = await resolveInvoiceForEncounter(data.encounterId, data.patientId, data.visitId);
  } else if (data.visitId) {
    const existing = await db.invoice.findFirst({
      where: { visitId: data.visitId },
      orderBy: { createdAt: 'desc' },
    });

    if (existing) {
      invoiceId = existing.id;
    } else {
      const invoice = await db.invoice.create({
        data: {
          patientId: data.patientId,
          visitId: data.visitId,
          totalAmount: 0,
          balanceDue: 0,
          currency: 'KES',
          status: 'OPEN',
          payerType: 'CASH',
        },
      });
      invoiceId = invoice.id;
    }
  } else {
    const invoice = await db.invoice.create({
      data: {
        patientId: data.patientId,
        totalAmount: 0,
        balanceDue: 0,
        currency: 'KES',
        status: 'OPEN',
        payerType: 'CASH',
      },
    });
    invoiceId = invoice.id;
  }

  const totalPrice = data.quantity * data.unitPrice;

  const billItem = await db.billItem.create({
    data: {
      invoiceId,
      visitId: data.visitId ?? '',
      encounterId: data.encounterId,
      description: data.description,
      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalPrice,
      category: data.category,
      status: 'UNPAID',
      currency: 'KES',
      taxRate: 0,
      taxAmount: 0,
      discountAmount: 0,
    },
  });

  await recalculateInvoiceTotals(invoiceId);

  return { success: true, billItemId: billItem.id, invoiceId, amount: totalPrice };
}

// ─── Payment Processing ─────────────────────────────────────────────────

export async function processBillPayment(data: {
  invoiceId: string;
  amount: number;
  method: PaymentMethod;
  reference?: string;
  allocations?: { billItemId: string; amount: number }[];
}): Promise<any> {
  const db = await getTenantDb();
  const user = await getServerUser();

  // Validate invoice exists
  const invoice = await db.invoice.findUnique({
    where: { id: data.invoiceId },
    include: { billItems: true, payments: true },
  });

  if (!invoice) {
    return { success: false, message: 'Invoice not found' };
  }

  // Create payment
  const payment = await db.payment.create({
    data: {
      invoiceId: data.invoiceId,
      amount: data.amount,
      method: data.method,
      reference: data.reference,
      currency: 'KES',
    },
  });

  // Handle allocations
  if (data.allocations && data.allocations.length > 0) {
    for (const alloc of data.allocations) {
      await db.paymentAllocation.create({
        data: {
          paymentId: payment.id,
          billItemId: alloc.billItemId,
          amount: alloc.amount,
        },
      });

      // Update bill item status if fully paid
      const billItem = invoice.billItems.find((bi: any) => bi.id === alloc.billItemId);
      if (billItem) {
        const allocatedAmount = await getTotalAllocatedForBillItem(db, alloc.billItemId);
        if (allocatedAmount >= Number(billItem.totalPrice)) {
          await db.billItem.update({
            where: { id: alloc.billItemId },
            data: { status: 'PAID' },
          });
        } else if (allocatedAmount > 0) {
          await db.billItem.update({
            where: { id: alloc.billItemId },
            data: { status: 'PARTIAL' },
          });
        }
      }
    }
  } else {
    // Auto-allocate FIFO to oldest unpaid items
    await autoAllocatePayment(db, payment.id, data.invoiceId);
  }

  // Update invoice totals
  await recalculateInvoiceTotals(data.invoiceId);

  return { success: true, paymentId: payment.id, invoiceId: data.invoiceId };
}

async function getTotalAllocatedForBillItem(db: any, billItemId: string): Promise<number> {
  const allocations = await db.paymentAllocation.groupBy({
    by: ['billItemId'],
    where: { billItemId },
    _sum: { amount: true },
  });

  return allocations.length > 0 ? Number(allocations[0]._sum.amount ?? 0) : 0;
}

async function autoAllocatePayment(db: any, paymentId: string, invoiceId: string) {
  const payment = await db.payment.findUnique({
    where: { id: paymentId },
  });

  const billItems = await db.billItem.findMany({
    where: {
      invoiceId,
      status: { in: ['UNPAID', 'PARTIAL'] },
    },
    orderBy: { createdAt: 'asc' },
  });

  let remaining = Number(payment.amount);

  for (const item of billItems) {
    if (remaining <= 0) break;

    const alreadyAllocated = await getTotalAllocatedForBillItem(db, item.id);
    const stillOwed = Number(item.totalPrice) - alreadyAllocated;

    if (stillOwed <= 0) continue;

    const allocAmount = Math.min(remaining, stillOwed);

    await db.paymentAllocation.create({
      data: {
        paymentId,
        billItemId: item.id,
        amount: allocAmount,
      },
    });

    remaining -= allocAmount;

    // Update item status
    const newTotalAllocated = alreadyAllocated + allocAmount;
    if (newTotalAllocated >= Number(item.totalPrice)) {
      await db.billItem.update({
        where: { id: item.id },
        data: { status: 'PAID' },
      });
    } else {
      await db.billItem.update({
        where: { id: item.id },
        data: { status: 'PARTIAL' },
      });
    }
  }
}

// ─── Invoice Queries ────────────────────────────────────────────────────

export async function getInvoiceSummary(invoiceId: string): Promise<InvoiceSummary | null> {
  const db = await getTenantDb();

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: {
      billItems: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { createdAt: 'asc' } },
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
  });

  if (!invoice) return null;

  const totalPaid = invoice.payments.reduce((sum: any, p: any) => sum + Number(p.amount), 0);

  // Fetch related order paid statuses
  const labOrders = await db.labOrder.findMany({
    where: { encounterId: invoice.encounterId ?? undefined, isBilled: true },
    select: { id: true, isPaid: true },
  });
  const prescriptions = await db.prescription.findMany({
    where: { encounterId: invoice.encounterId ?? undefined, isBilled: true },
    select: { id: true, isPaid: true },
  });

  const labOrderMap = new Map(labOrders.map((lo: any) => [lo.id, lo.isPaid]));
  const prescriptionMap = new Map(prescriptions.map((p: any) => [p.id, p.isPaid]));

  return {
    id: invoice.id,
    patientId: invoice.patientId,
    encounterId: invoice.encounterId ?? undefined,
    visitId: invoice.visitId ?? undefined,
    totalAmount: Number(invoice.totalAmount),
    totalPaid,
    balanceDue: Number(invoice.balanceDue),
    status: invoice.status,
    currency: invoice.currency,
    payerType: invoice.payerType,
    itemCount: invoice.billItems.length,
    items: invoice.billItems.map((bi: any) => {
      let isPaid = bi.status === 'PAID';
      let labOrderId: string | undefined;
      let prescriptionId: string | undefined;

      if (bi.category === 'LAB') {
        isPaid = labOrders.some((lo: any) => lo.isPaid);
      } else if (bi.category === 'PHARMACY') {
        isPaid = prescriptions.some((p: any) => p.isPaid);
      }

      return {
        id: bi.id,
        description: bi.description,
        category: bi.category as BillingCategory,
        quantity: Number(bi.quantity),
        unitPrice: Number(bi.unitPrice),
        taxAmount: Number(bi.taxAmount),
        discountAmount: Number(bi.discountAmount),
        totalPrice: Number(bi.totalPrice),
        status: bi.status,
        isPaid,
        encounterId: bi.encounterId ?? undefined,
        labOrderId,
        prescriptionId,
      };
    }),
    payments: invoice.payments.map((p: any) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method as PaymentMethod,
      reference: p.reference ?? undefined,
      createdAt: p.createdAt,
    })),
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  };
}

export async function getInvoiceByEncounter(encounterId: string): Promise<InvoiceSummary | null> {
  const db = await getTenantDb();

  const invoice = await db.invoice.findFirst({
    where: { encounterId },
    orderBy: { createdAt: 'desc' },
    include: {
      billItems: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { createdAt: 'asc' } },
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
  });

  if (!invoice) return null;

  const totalPaid = invoice.payments.reduce((sum: any, p: any) => sum + Number(p.amount), 0);

  // Fetch related order paid statuses
  const labOrders = await db.labOrder.findMany({
    where: { encounterId, isBilled: true },
    select: { id: true, isPaid: true },
  });
  const prescriptions = await db.prescription.findMany({
    where: { encounterId, isBilled: true },
    select: { id: true, isPaid: true },
  });

  return {
    id: invoice.id,
    patientId: invoice.patientId,
    encounterId: invoice.encounterId ?? undefined,
    visitId: invoice.visitId ?? undefined,
    totalAmount: Number(invoice.totalAmount),
    totalPaid,
    balanceDue: Number(invoice.balanceDue),
    status: invoice.status,
    currency: invoice.currency,
    payerType: invoice.payerType,
    itemCount: invoice.billItems.length,
    items: invoice.billItems.map((bi: any) => {
      let isPaid = bi.status === 'PAID';

      if (bi.category === 'LAB') {
        isPaid = labOrders.some((lo: any) => lo.isPaid);
      } else if (bi.category === 'PHARMACY') {
        isPaid = prescriptions.some((p: any) => p.isPaid);
      }

      return {
        id: bi.id,
        description: bi.description,
        category: bi.category as BillingCategory,
        quantity: Number(bi.quantity),
        unitPrice: Number(bi.unitPrice),
        taxAmount: Number(bi.taxAmount),
        discountAmount: Number(bi.discountAmount),
        totalPrice: Number(bi.totalPrice),
        status: bi.status,
        isPaid,
        encounterId: bi.encounterId ?? undefined,
      };
    }),
    payments: invoice.payments.map((p: any) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method as PaymentMethod,
      reference: p.reference ?? undefined,
      createdAt: p.createdAt,
    })),
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  };
}

export async function getInvoiceByVisit(visitId: string): Promise<InvoiceSummary | null> {
  const db = await getTenantDb();

  const invoice = await db.invoice.findFirst({
    where: { visitId },
    orderBy: { createdAt: 'desc' },
    include: {
      billItems: { orderBy: { createdAt: 'asc' } },
      payments: { orderBy: { createdAt: 'asc' } },
      patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
    },
  });

  if (!invoice) return null;

  const totalPaid = invoice.payments.reduce((sum: any, p: any) => sum + Number(p.amount), 0);

  // Fetch related order paid statuses (across all encounters in this visit)
  const encounters = await db.encounter.findMany({
    where: { visitId },
    select: { id: true },
  });
  const encounterIds = encounters.map((e: any) => e.id);

  const labOrders = await db.labOrder.findMany({
    where: { encounterId: { in: encounterIds }, isBilled: true },
    select: { id: true, isPaid: true },
  });
  const prescriptions = await db.prescription.findMany({
    where: { encounterId: { in: encounterIds }, isBilled: true },
    select: { id: true, isPaid: true },
  });

  return {
    id: invoice.id,
    patientId: invoice.patientId,
    encounterId: invoice.encounterId ?? undefined,
    visitId: invoice.visitId ?? undefined,
    totalAmount: Number(invoice.totalAmount),
    totalPaid,
    balanceDue: Number(invoice.balanceDue),
    status: invoice.status,
    currency: invoice.currency,
    payerType: invoice.payerType,
    itemCount: invoice.billItems.length,
    items: invoice.billItems.map((bi: any) => {
      let isPaid = bi.status === 'PAID';

      if (bi.category === 'LAB') {
        isPaid = labOrders.some((lo: any) => lo.isPaid);
      } else if (bi.category === 'PHARMACY') {
        isPaid = prescriptions.some((p: any) => p.isPaid);
      }

      return {
        id: bi.id,
        description: bi.description,
        category: bi.category as BillingCategory,
        quantity: Number(bi.quantity),
        unitPrice: Number(bi.unitPrice),
        taxAmount: Number(bi.taxAmount),
        discountAmount: Number(bi.discountAmount),
        totalPrice: Number(bi.totalPrice),
        status: bi.status,
        isPaid,
        encounterId: bi.encounterId ?? undefined,
      };
    }),
    payments: invoice.payments.map((p: any) => ({
      id: p.id,
      amount: Number(p.amount),
      method: p.method as PaymentMethod,
      reference: p.reference ?? undefined,
      createdAt: p.createdAt,
    })),
    createdAt: invoice.createdAt,
    updatedAt: invoice.updatedAt,
  };
}

// ─── Invoice Recalculation ──────────────────────────────────────────────

async function recalculateInvoiceTotals(invoiceId: string) {
  const db = await getTenantDb();

  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { billItems: true, payments: true },
  });

  if (!invoice) return;

  const totalAmount = invoice.billItems.reduce((sum: any, bi: any) => sum + Number(bi.totalPrice), 0);
  const totalPaid = invoice.payments.reduce((sum: any, p: any) => sum + Number(p.amount), 0);
  const balanceDue = totalAmount - totalPaid;

  // Determine status
  let status = 'OPEN';
  if (totalPaid >= totalAmount && totalAmount > 0) {
    status = 'PAID';
  } else if (totalPaid > 0) {
    status = 'PARTIAL';
  }

  await db.invoice.update({
    where: { id: invoiceId },
    data: {
      totalAmount,
      balanceDue,
      status,
    },
  });

  // Sync paid status back to source records (LabOrders, Prescriptions)
  await syncOrderPaymentStatus(db, invoiceId);
}

/**
 * Sync paid status from bill items back to their source records.
 * Uses encounterId + category + createdAt proximity to match bill items to orders.
 */
async function syncOrderPaymentStatus(db: any, invoiceId: string) {
  const invoice = await db.invoice.findUnique({
    where: { id: invoiceId },
    include: { billItems: true },
  });

  if (!invoice) return;

  const encounterId = invoice.encounterId;
  if (!encounterId) return;

  // Get all PAID bill items for this invoice
  const paidBillItems = invoice.billItems.filter((bi: any) => bi.status === 'PAID');

  for (const item of paidBillItems) {
    if (item.category === 'LAB') {
      // Match lab order by encounterId + closest createdAt
      const labOrder = await db.labOrder.findFirst({
        where: {
          encounterId,
          isBilled: true,
          isPaid: false,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (labOrder) {
        await db.labOrder.update({
          where: { id: labOrder.id },
          data: { isPaid: true },
        });
      }
    }

    if (item.category === 'PHARMACY') {
      const prescription = await db.prescription.findFirst({
        where: {
          encounterId,
          isBilled: true,
          isPaid: false,
        },
        orderBy: { createdAt: 'asc' },
      });

      if (prescription) {
        await db.prescription.update({
          where: { id: prescription.id },
          data: { isPaid: true },
        });
      }
    }
  }
}

// ─── Service Catalog Queries ────────────────────────────────────────────

export async function getServiceCatalog(): Promise<any> {
  return DEFAULT_SERVICE_CATALOG;
}

export async function getServiceCatalogByCategory(category: BillingCategory): Promise<any> {
  return DEFAULT_SERVICE_CATALOG.filter((s: any) => s.category === category);
}

// ─── Delete Bill Item (for corrections) ─────────────────────────────────

export async function deleteBillItem(billItemId: string): Promise<any> {
  const db = await getTenantDb();

  const billItem = await db.billItem.findUnique({
    where: { id: billItemId },
    include: { invoice: true },
  });

  if (!billItem) {
    return { success: false, message: 'Bill item not found' };
  }

  // Cannot delete if already paid
  if (billItem.status === 'PAID') {
    return { success: false, message: 'Cannot delete a paid bill item' };
  }

  // Delete associated payment allocations
  await db.paymentAllocation.deleteMany({
    where: { billItemId },
  });

  // Delete the bill item
  await db.billItem.delete({
    where: { id: billItemId },
  });

  // Recalculate invoice
  if (billItem.invoiceId) {
    await recalculateInvoiceTotals(billItem.invoiceId);
  }

  return { success: true };
}

// ─── Order Payment Status Queries ───────────────────────────────────────

export interface BilledLabOrder {
  id: string;
  testPanelId: string;
  status: string;
  billedAmount: number | null;
  isBilled: boolean;
  isPaid: boolean;
  orderedAt: Date;
}

export interface BilledPrescription {
  id: string;
  status: string;
  billedAmount: number | null;
  isBilled: boolean;
  isPaid: boolean;
  orderedBy: string;
  createdAt: Date;
  itemCount: number;
}

export async function getBilledLabOrders(encounterId: string): Promise<BilledLabOrder[]> {
  const db = await getTenantDb();

  const orders = await db.labOrder.findMany({
    where: {
      encounterId,
      isBilled: true,
    },
    select: {
      id: true,
      testPanelId: true,
      status: true,
      billedAmount: true,
      isBilled: true,
      isPaid: true,
      orderedAt: true,
    },
    orderBy: { orderedAt: 'desc' },
  });

  return orders.map((o: any) => ({
    ...o,
    billedAmount: o.billedAmount ? Number(o.billedAmount) : null,
  }));
}

export async function getBilledPrescriptions(encounterId: string): Promise<BilledPrescription[]> {
  const db = await getTenantDb();

  const prescriptions = await db.prescription.findMany({
    where: {
      encounterId,
      isBilled: true,
    },
    select: {
      id: true,
      status: true,
      billedAmount: true,
      isBilled: true,
      isPaid: true,
      orderedBy: true,
      createdAt: true,
      items: { select: { id: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return prescriptions.map((p: any) => ({
    ...p,
    billedAmount: p.billedAmount ? Number(p.billedAmount) : null,
    itemCount: p.items.length,
  }));
}
