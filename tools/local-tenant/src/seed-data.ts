/** Static catalogue mirroring packages/db/src/seed-cloud.ts (AmisiMedOS platform). */

export interface ModuleSeed {
  code: string;
  name: string;
  description: string;
  basePrice: string;
  dependencies: string[];
  events: string[];
  permissions: string[];
}

export const MODULES: ModuleSeed[] = [
  { code: 'MOD-PM', name: 'Patient Management', description: 'Registration, ID, Demographics', basePrice: '0', dependencies: [], events: ['patient.registered', 'patient.updated'], permissions: ['PATIENT_READ', 'PATIENT_WRITE'] },
  { code: 'MOD-TQ', name: 'Triage & Queue Engine', description: 'Severity classification, Smart queue routing', basePrice: '150', dependencies: ['MOD-PM'], events: ['triage.completed', 'queue.routed', 'queue.wait_updated'], permissions: ['TRIAGE_WRITE', 'QUEUE_MANAGE'] },
  { code: 'MOD-EC', name: 'EMR / Clinical', description: 'Consultations, Notes, Diagnoses, Prescriptions', basePrice: '200', dependencies: ['MOD-PM', 'MOD-TQ'], events: ['clinical.consultation', 'clinical.diagnosis_added', 'clinical.prescription_issued'], permissions: ['CLINICAL_WRITE', 'DIAGNOSIS_WRITE', 'PRESCRIPTION_WRITE'] },
  { code: 'MOD-LD', name: 'Lab & Diagnostics', description: 'Test orders, Results, Imaging integration', basePrice: '120', dependencies: ['MOD-PM', 'MOD-EC'], events: ['lab.order_created', 'lab.result_available', 'lab.validated'], permissions: ['LAB_ORDER', 'LAB_RESULT_WRITE'] },
  { code: 'MOD-PH', name: 'Pharmacy', description: 'Dispensing, Stock tracking, Drug interaction checks', basePrice: '120', dependencies: ['MOD-PM', 'MOD-EC'], events: ['pharmacy.dispensed', 'pharmacy.stock_low', 'pharmacy.interaction_alert'], permissions: ['PHARMACY_DISPENSE', 'PHARMACY_STOCK_MANAGE'] },
  { code: 'MOD-IS', name: 'Inventory & Supply Chain', description: 'Stock, Vendors, Expiry alerts', basePrice: '80', dependencies: ['MOD-PH'], events: ['inventory.stock_in', 'inventory.expiry_alert', 'inventory.reorder'], permissions: ['INV_AUDIT', 'INV_MANAGE'] },
  { code: 'MOD-BR', name: 'Billing & Revenue', description: 'Itemized billing, Payments, Insurance claims', basePrice: '100', dependencies: ['MOD-PM', 'MOD-EC', 'MOD-LD', 'MOD-PH'], events: ['billing.invoice_created', 'billing.payment_posted', 'billing.insurance_claim'], permissions: ['BILLING_WRITE', 'INSURANCE_CLAIM'] },
  { code: 'MOD-FA', name: 'Finance & Accounting', description: 'Revenue tracking, Expenses, Reports', basePrice: '90', dependencies: ['MOD-BR'], events: ['finance.journal_posted', 'finance.payroll_processed'], permissions: ['LEDGER_VIEW', 'PAYROLL_PROCESS'] },
  { code: 'MOD-HS', name: 'HR & Staff Management', description: 'Scheduling, Roles, Performance tracking', basePrice: '70', dependencies: [], events: ['hr.employee_added', 'hr.shift_assigned', 'hr.leave_approved'], permissions: ['HR_MANAGE', 'PAYROLL_PROCESS'] },
  { code: 'MOD-IC', name: 'Internal Communication', description: 'Messaging, Alerts, Patient-linked discussions', basePrice: '50', dependencies: ['MOD-PM'], events: ['chat.message_sent', 'chat.alert_triggered'], permissions: ['CHAT_SEND', 'ALERT_MANAGE'] },
  { code: 'MOD-RT', name: 'Referral & Transfer', description: 'Inter-facility transfers, Patient summaries', basePrice: '80', dependencies: ['MOD-PM', 'MOD-EC'], events: ['referral.initiated', 'referral.received', 'transfer.completed'], permissions: ['REFERRAL_WRITE', 'TRANSFER_MANAGE'] },
  { code: 'MOD-AR', name: 'Analytics & Reporting', description: 'Operational dashboards, Financial reports, Clinical insights', basePrice: '100', dependencies: ['MOD-PM', 'MOD-EC', 'MOD-BR'], events: ['analytics.report_generated', 'analytics.dashboard_viewed'], permissions: ['REPORTS_VIEW', 'ANALYTICS_ACCESS'] },
  { code: 'MOD-MR', name: 'Mobile & Rounds', description: 'Bedside care, Offline sync', basePrice: '90', dependencies: ['MOD-EC', 'MOD-PM'], events: ['mobile.sync_completed', 'mobile.rounds_started'], permissions: ['MOBILE_ACCESS', 'ROUNDS_WRITE'] },
  { code: 'MOD-SA', name: 'Security & Audit', description: 'RBAC, Audit logs, Compliance tracking', basePrice: '60', dependencies: [], events: ['security.login', 'security.audit_log', 'security.permission_changed'], permissions: ['SECURITY_ADMIN', 'AUDIT_VIEW'] },
  { code: 'MOD-IO', name: 'Interoperability', description: 'FHIR APIs, External integrations', basePrice: '110', dependencies: ['MOD-PM', 'MOD-EC'], events: ['fhir.patient_read', 'fhir.resource_created'], permissions: ['FHIR_API_ACCESS', 'EXTERNAL_INTEGRATE'] },
  { code: 'MOD-DM', name: 'Document Management', description: 'Reports, Scans, Attachments', basePrice: '70', dependencies: ['MOD-EC'], events: ['document.uploaded', 'document.shared'], permissions: ['DOC_UPLOAD', 'DOC_MANAGE'] },
  { code: 'MOD-SP', name: 'Specialty Modules', description: 'Maternity, Pediatrics, ICU, Radiology', basePrice: '150', dependencies: ['MOD-EC', 'MOD-PM', 'MOD-TQ'], events: ['specialty.consultation', 'specialty.icu_monitoring'], permissions: ['SPECIALTY_ACCESS', 'MATERNITY_WRITE', 'ICU_WRITE'] },
  { code: 'MOD-SM', name: 'SaaS Admin', description: 'Tenant onboarding, Subscription billing, Usage tracking', basePrice: '0', dependencies: ['MOD-SA'], events: ['saas.tenant_onboarded', 'saas.subscription_changed'], permissions: ['SAAS_ADMIN', 'TENANT_MANAGE'] },
];

export type FacilityType = 'CLINIC' | 'PHARMACY' | 'LAB' | 'SPECIALIST' | 'HOSPITAL';

export const FACILITY_PRESETS: Record<FacilityType, string[]> = {
  CLINIC: ['MOD-PM', 'MOD-TQ', 'MOD-EC', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-IC', 'MOD-AR'],
  PHARMACY: ['MOD-PM', 'MOD-PH', 'MOD-IS', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-DM'],
  LAB: ['MOD-PM', 'MOD-LD', 'MOD-IS', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-IO', 'MOD-DM'],
  SPECIALIST: ['MOD-PM', 'MOD-TQ', 'MOD-EC', 'MOD-SP', 'MOD-BR', 'MOD-SA', 'MOD-SM', 'MOD-RT', 'MOD-AR'],
  HOSPITAL: ['MOD-PM', 'MOD-TQ', 'MOD-EC', 'MOD-LD', 'MOD-PH', 'MOD-IS', 'MOD-BR', 'MOD-FA', 'MOD-HS', 'MOD-IC', 'MOD-RT', 'MOD-AR', 'MOD-MR', 'MOD-SA', 'MOD-IO', 'MOD-DM', 'MOD-SP', 'MOD-SM'],
};

export interface PlanSeed {
  name: string;
  code: string;
  description: string;
  price: string;
  billingCycle: 'MONTHLY' | 'YEARLY';
  maxPatients: number;
  maxUsers: number;
  maxBeds: number;
  features: string[];
}

export const PLANS: PlanSeed[] = [
  { name: 'Essential Plan', code: 'ESSENTIAL_MONTHLY', description: 'For Small Clinics & Dispensaries (50% Intro Offer)', price: '24.50', billingCycle: 'MONTHLY', maxPatients: 500, maxUsers: 10, maxBeds: 20, features: ['PATIENT_RECORDS', 'OPD', 'BASIC_BILLING', 'PHARMACY_BASIC', 'SCHEDULING', 'OFFLINE_MODE'] },
  { name: 'Essential Plan (Yearly)', code: 'ESSENTIAL_YEARLY', description: 'For Small Clinics & Dispensaries (50% Intro Offer)', price: '245', billingCycle: 'YEARLY', maxPatients: 500, maxUsers: 10, maxBeds: 20, features: ['PATIENT_RECORDS', 'OPD', 'BASIC_BILLING', 'PHARMACY_BASIC', 'SCHEDULING', 'OFFLINE_MODE'] },
  { name: 'Professional Plan', code: 'PROFESSIONAL_MONTHLY', description: 'For Growing Hospitals (50% Intro Offer)', price: '64.50', billingCycle: 'MONTHLY', maxPatients: 2000, maxUsers: 50, maxBeds: 100, features: ['PATIENT_RECORDS', 'OPD', 'FULL_BILLING', 'LAB_DIAGNOSTICS', 'IPD_WARD', 'PHARMACY_INTEGRATED', 'PATIENT_CHAT', 'INSURANCE_CLAIMS', 'CLOUD_HYBRID'] },
  { name: 'Professional Plan (Yearly)', code: 'PROFESSIONAL_YEARLY', description: 'For Growing Hospitals (50% Intro Offer)', price: '645', billingCycle: 'YEARLY', maxPatients: 2000, maxUsers: 50, maxBeds: 100, features: ['PATIENT_RECORDS', 'OPD', 'FULL_BILLING', 'LAB_DIAGNOSTICS', 'IPD_WARD', 'PHARMACY_INTEGRATED', 'PATIENT_CHAT', 'INSURANCE_CLAIMS', 'CLOUD_HYBRID'] },
  { name: 'Enterprise Plan', code: 'ENTERPRISE_MONTHLY', description: 'For Large & Multi-Specialty Hospitals (50% Intro Offer)', price: '149.50', billingCycle: 'MONTHLY', maxPatients: 99999, maxUsers: 9999, maxBeds: 9999, features: ['ALL_FEATURES', 'MULTI_BRANCH', 'CUSTOM_WORKFLOW', 'REALTIME_ANALYTICS', 'AUDIT_LOGS', 'DEDICATED_SERVER', 'API_INTEGRATIONS'] },
  { name: 'Enterprise Plan (Yearly)', code: 'ENTERPRISE_YEARLY', description: 'For Large & Multi-Specialty Hospitals (50% Intro Offer)', price: '1495', billingCycle: 'YEARLY', maxPatients: 99999, maxUsers: 9999, maxBeds: 9999, features: ['ALL_FEATURES', 'MULTI_BRANCH', 'CUSTOM_WORKFLOW', 'REALTIME_ANALYTICS', 'AUDIT_LOGS', 'DEDICATED_SERVER', 'API_INTEGRATIONS'] },
];

export const SYSTEM_ADMINS = [
  { email: 'admin@amisigenuine.com', name: 'Platform Admin', password: '@AmisiAdmin2026' },
  { email: 'amisi@amisigenuine.com', name: 'Amisi System Admin', password: '@theVerge#2047' },
];

export interface StaffSeed {
  employeeId: string;
  firstName: string;
  lastName: string;
  role: string;
  department: string;
  email: string;
  baseSalary: string;
  permissions: string[];
}

export function buildStaff(slug: string): StaffSeed[] {
  return [
    { employeeId: `ADMIN-${slug}`, firstName: 'Michael', lastName: 'Admin', email: `admin.michael@${slug}.demo`, role: 'ADMIN', department: 'Administration', baseSalary: '5000', permissions: ['ALL'] },
    { employeeId: `DOC-${slug}`, firstName: 'Sarah', lastName: 'Doctor', email: `dr.sarah@${slug}.demo`, role: 'DOCTOR', department: 'OPD', baseSalary: '4500', permissions: [] },
    { employeeId: `NURSE-${slug}`, firstName: 'Amina', lastName: 'Nurse', email: `nrs.amina@${slug}.demo`, role: 'NURSE', department: 'Triage', baseSalary: '2500', permissions: [] },
    { employeeId: `PHARM-${slug}`, firstName: 'Kelvin', lastName: 'Pharmacist', email: `phm.kelvin@${slug}.demo`, role: 'PHARMACIST', department: 'Pharmacy', baseSalary: '3200', permissions: [] },
    { employeeId: `LAB-${slug}`, firstName: 'Kamau', lastName: 'LabTech', email: `lab.kamau@${slug}.demo`, role: 'LAB_TECH', department: 'Laboratory', baseSalary: '2800', permissions: [] },
    { employeeId: `CASHIER-${slug}`, firstName: 'John', lastName: 'Cashier', email: `cashier.john@${slug}.demo`, role: 'RECEPTIONIST', department: 'Billing', baseSalary: '2200', permissions: [] },
  ];
}

export interface PatientSeed {
  mrn: string;
  firstName: string;
  lastName: string;
  dob: string;
  gender: string;
  email?: string;
  phone?: string;
  address?: string;
}

export function buildPatients(slug: string): PatientSeed[] {
  const prefix = slug.toUpperCase();
  return [
    { mrn: `${prefix}-P001`, firstName: 'John', lastName: 'Doe', dob: '1985-05-15', gender: 'Male' },
    { mrn: `${prefix}-P002`, firstName: 'Jane', lastName: 'Smith', dob: '1992-11-20', gender: 'Female' },
    { mrn: `${prefix}-P003`, firstName: 'Daniel', lastName: 'Aimoi', dob: '1987-01-01', gender: 'Male', email: 'amisiaimoi@gmail.com', phone: '+254700000000', address: 'Nairobi, Kenya' },
  ];
}

export const ACCOUNTS = [
  { code: '1010', name: 'Cash & Bank', type: 'ASSET' },
  { code: '1200', name: 'Accounts Receivable', type: 'ASSET' },
  { code: '4000', name: 'Patient Service Revenue', type: 'REVENUE' },
  { code: '5000', name: 'Salary & Wage Expense', type: 'EXPENSE' },
  { code: '5100', name: 'Tax Expense', type: 'EXPENSE' },
];

export const MEDICATIONS = [
  { name: 'Paracetamol', dosageForm: 'tablet', unit: '500mg', drugClass: 'Analgesic' },
  { name: 'Amoxicillin', dosageForm: 'capsule', unit: '250mg', drugClass: 'Antibiotic' },
  { name: 'Ibuprofen', dosageForm: 'tablet', unit: '400mg', drugClass: 'NSAID' },
];

export const WARDS = [
  { name: 'General Ward A', type: 'GENERAL', floor: 1, beds: ['G-101', 'G-102', 'G-103'] },
  { name: 'ICU', type: 'ICU', floor: 1, beds: ['ICU-1', 'ICU-2'] },
];
