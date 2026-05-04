export type TenantId = string;
export type PatientId = string;
export type StaffId = string;
export type VisitId = string;

export enum ModuleName {
  PATIENT_MGMT = 'PATIENT_MGMT',
  TRIAGE = 'TRIAGE',
  EMR = 'EMR',
  CHAT = 'CHAT',
  LABS = 'LABS',
  PHARMACY = 'PHARMACY',
  BILLING = 'BILLING',
  HR = 'HR',
  ADMIN = 'ADMIN',
}

export enum TriageSeverity {
  CRITICAL = 1,
  URGENT = 2,
  STABLE = 3,
  ROUTINE = 4,
  NON_URGENT = 5,
}

export type SystemEvent = 
  | { type: 'PatientRegistered'; payload: { patientId: PatientId; tenantId: TenantId } }
  | { type: 'TriageCompleted'; payload: { triageId: string; patientId: PatientId; severity: TriageSeverity; vitals: any } }
  | { type: 'ConsultationStarted'; payload: { visitId: VisitId; patientId: PatientId; staffId: StaffId } }
  | { type: 'LabOrdered'; payload: { labId: string; visitId: VisitId; patientId: PatientId; testType: string } }
  | { type: 'PrescriptionIssued'; payload: { prescriptionId: string; visitId: VisitId; patientId: PatientId; medications: { itemId: string; qty: number }[] } }
  | { type: 'ChatMessageSent'; payload: { chatId: string; visitId: VisitId; patientId: PatientId; senderId: string; message: string } }
  | { type: 'PaymentRecorded'; payload: { invoiceId: string; amount: number; method: 'CASH' | 'MPESA' | 'CARD'; ref: string } }
  | { type: 'StockReduced'; payload: { itemId: string; qty: number; reason: string } };

export interface Event<T = any> {
  eventId: string;
  tenantId: TenantId;
  entity: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'TRIGGER';
  timestamp: string;
  payload: T;
  checksum: string;
}

export interface Patient {
  id: PatientId;
  tenantId: TenantId;
  externalId: string;
  firstName: string;
  lastName: string;
  dob: Date;
  gender: string;
  phone?: string;
  email?: string;
}

export interface TriageEntry {
  id: string;
  patientId: PatientId;
  severity: TriageSeverity;
  status: 'WAITING' | 'TREATING' | 'COMPLETED';
  vitals: Record<string, any>;
  createdAt: Date;
}
