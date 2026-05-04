// ─── Billing Event Types ────────────────────────────────────────────────

export type BillingCategory = 'CONSULTATION' | 'LAB' | 'PHARMACY' | 'PROCEDURE' | 'RADIOLOGY' | 'WARD';

export type BillingTrigger = 
  | 'ENCOUNTER_SEEN'
  | 'ENCOUNTER_COMPLETED'
  | 'LAB_ORDERED'
  | 'LAB_COMPLETED'
  | 'PRESCRIPTION_WRITTEN'
  | 'PRESCRIPTION_DISPENSED'
  | 'RADIOLOGY_ORDERED'
  | 'PROCEDURE_PERFORMED'
  | 'WARD_ADMISSION'
  | 'MANUAL_ENTRY';

export type PaymentMethod = 'CASH' | 'MPESA' | 'CARD';

export interface BillingEvent {
  id: string;
  category: BillingCategory;
  trigger: BillingTrigger;
  description: string;
  amount: number;
  quantity: number;
  totalPrice: number;
  encounterId?: string;
  visitId?: string;
  patientId: string;
  resourceId?: string;
  resourceType?: string;
  createdAt: Date;
}

// ─── Service Catalog (MVP - hardcoded prices) ───────────────────────────

export interface ServicePrice {
  id: string;
  name: string;
  category: BillingCategory;
  price: number;
  description?: string;
  isDefault?: boolean;
}

export const DEFAULT_SERVICE_CATALOG: ServicePrice[] = [
  // Consultation fees
  { id: 'svc-consult-gp', name: 'General Consultation', category: 'CONSULTATION', price: 1500, description: 'GP consultation fee', isDefault: true },
  { id: 'svc-consult-specialist', name: 'Specialist Consultation', category: 'CONSULTATION', price: 3000, description: 'Specialist consultation fee' },
  { id: 'svc-consult-telemedicine', name: 'Telemedicine Consultation', category: 'CONSULTATION', price: 1000, description: 'Remote consultation fee' },
  { id: 'svc-consult-emergency', name: 'Emergency Consultation', category: 'CONSULTATION', price: 2500, description: 'Emergency department consultation' },

  // Common lab tests
  { id: 'svc-lab-cbc', name: 'Complete Blood Count (CBC)', category: 'LAB', price: 800, description: 'Full blood count analysis' },
  { id: 'svc-lab-malaria', name: 'Malaria Test (RDT)', category: 'LAB', price: 500, description: 'Rapid diagnostic test' },
  { id: 'svc-lab-urinalysis', name: 'Urinalysis', category: 'LAB', price: 400, description: 'Urine analysis' },
  { id: 'svc-lab-blood-sugar', name: 'Blood Sugar (RBS/FBS)', category: 'LAB', price: 300, description: 'Random/Fasting blood sugar' },
  { id: 'svc-lab-hba1c', name: 'HbA1c', category: 'LAB', price: 1500, description: 'Glycated hemoglobin test' },
  { id: 'svc-lab-lipid', name: 'Lipid Profile', category: 'LAB', price: 2000, description: 'Cholesterol panel' },
  { id: 'svc-lab-liver', name: 'Liver Function Test (LFT)', category: 'LAB', price: 1800, description: 'Liver enzymes and function' },
  { id: 'svc-lab-renal', name: 'Renal Function Test (RFT)', category: 'LAB', price: 1800, description: 'Kidney function panel' },
  { id: 'svc-lab-thyroid', name: 'Thyroid Function Test (TFT)', category: 'LAB', price: 2500, description: 'TSH, T3, T4 panel' },
  { id: 'svc-lab-hiv', name: 'HIV Test', category: 'LAB', price: 600, description: 'HIV screening' },
  { id: 'svc-lab-hepatitis', name: 'Hepatitis B/C Test', category: 'LAB', price: 1200, description: 'Hepatitis screening' },
  { id: 'svc-lab-culture', name: 'Culture & Sensitivity', category: 'LAB', price: 2500, description: 'Bacterial culture' },
  { id: 'svc-lab-stool', name: 'Stool Analysis', category: 'LAB', price: 500, description: 'Stool examination' },
  { id: 'svc-lab-general', name: 'General Lab Test', category: 'LAB', price: 500, description: 'Default lab test charge', isDefault: true },

  // Pharmacy charges (markup applied at dispensing)
  { id: 'svc-pharmacy-dispensing', name: 'Pharmacy Dispensing Fee', category: 'PHARMACY', price: 200, description: 'Standard dispensing fee', isDefault: true },

  // Ward charges
  { id: 'svc-ward-general', name: 'General Ward (per day)', category: 'WARD', price: 3000, description: 'General ward bed charge' },
  { id: 'svc-ward-private', name: 'Private Ward (per day)', category: 'WARD', price: 8000, description: 'Private room charge' },
  { id: 'svc-ward-icu', name: 'ICU (per day)', category: 'WARD', price: 15000, description: 'Intensive care unit charge' },
];

// ─── Price Lookup Helpers ───────────────────────────────────────────────

export function getServicePrice(category: BillingCategory, testName?: string): ServicePrice {
  if (testName) {
    const match = DEFAULT_SERVICE_CATALOG.find(
      (s) => s.category === category && s.name.toLowerCase().includes(testName.toLowerCase())
    );
    if (match) return match;
  }
  const defaultService = DEFAULT_SERVICE_CATALOG.find((s: any) => s.category === category && s.isDefault);
  return defaultService ?? DEFAULT_SERVICE_CATALOG.find((s: any) => s.category === category)!;
}

export function getServicePriceById(id: string): ServicePrice | undefined {
  return DEFAULT_SERVICE_CATALOG.find((s: any) => s.id === id);
}

export function getServicesByCategory(category: BillingCategory): ServicePrice[] {
  return DEFAULT_SERVICE_CATALOG.filter((s: any) => s.category === category);
}

// ─── Billing Event Payloads ─────────────────────────────────────────────

export interface ConsultationBillingPayload {
  encounterId: string;
  patientId: string;
  visitId?: string;
  department?: string;
  doctorId?: string;
  doctorName?: string;
  servicePriceId?: string;
}

export interface LabBillingPayload {
  labOrderId: string;
  patientId: string;
  encounterId?: string;
  visitId?: string;
  testPanelId: string;
  testPanelName?: string;
  orderedById?: string;
  servicePriceId?: string;
}

export interface PrescriptionBillingPayload {
  prescriptionId: string;
  patientId: string;
  encounterId?: string;
  visitId?: string;
  orderedBy?: string;
  itemCount: number;
  totalDrugCost?: number;
}

// ─── Invoice Summary ────────────────────────────────────────────────────

export interface InvoiceSummary {
  id: string;
  patientId: string;
  encounterId?: string;
  visitId?: string;
  totalAmount: number;
  totalPaid: number;
  balanceDue: number;
  status: string;
  currency: string;
  payerType: string;
  itemCount: number;
  items: InvoiceItemSummary[];
  payments: PaymentSummary[];
  createdAt: Date;
  updatedAt: Date;
}

export interface InvoiceItemSummary {
  id: string;
  description: string;
  category: BillingCategory;
  quantity: number;
  unitPrice: number;
  taxAmount: number;
  discountAmount: number;
  totalPrice: number;
  status: string;
  isPaid: boolean;
  encounterId?: string;
  labOrderId?: string;
  prescriptionId?: string;
}

export interface PaymentSummary {
  id: string;
  amount: number;
  method: PaymentMethod | string;
  reference?: string;
  createdAt: Date;
}
