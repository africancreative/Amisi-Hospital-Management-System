
Object.defineProperty(exports, "__esModule", { value: true });

const {
  Decimal,
  objectEnumValues,
  makeStrictEnum,
  Public,
  getRuntime,
  skip
} = require('./runtime/index-browser.js')


const Prisma = {}

exports.Prisma = Prisma
exports.$Enums = {}

/**
 * Prisma Client JS version: 5.22.0
 * Query Engine version: 605197351a3c8bdd595af2d2a9bc3025bca48ea2
 */
Prisma.prismaVersion = {
  client: "5.22.0",
  engine: "605197351a3c8bdd595af2d2a9bc3025bca48ea2"
}

Prisma.PrismaClientKnownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientKnownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)};
Prisma.PrismaClientUnknownRequestError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientUnknownRequestError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientRustPanicError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientRustPanicError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientInitializationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientInitializationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.PrismaClientValidationError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`PrismaClientValidationError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.NotFoundError = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`NotFoundError is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.Decimal = Decimal

/**
 * Re-export of sql-template-tag
 */
Prisma.sql = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`sqltag is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.empty = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`empty is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.join = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`join is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.raw = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`raw is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.validator = Public.validator

/**
* Extensions
*/
Prisma.getExtensionContext = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.getExtensionContext is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}
Prisma.defineExtension = () => {
  const runtimeName = getRuntime().prettyName;
  throw new Error(`Extensions.defineExtension is unable to run in this browser environment, or has been bundled for the browser (running in ${runtimeName}).
In case this error is unexpected for you, please report it in https://pris.ly/prisma-prisma-bug-report`,
)}

/**
 * Shorthand utilities for JSON filtering
 */
Prisma.DbNull = objectEnumValues.instances.DbNull
Prisma.JsonNull = objectEnumValues.instances.JsonNull
Prisma.AnyNull = objectEnumValues.instances.AnyNull

Prisma.NullTypes = {
  DbNull: objectEnumValues.classes.DbNull,
  JsonNull: objectEnumValues.classes.JsonNull,
  AnyNull: objectEnumValues.classes.AnyNull
}



/**
 * Enums
 */

exports.Prisma.TransactionIsolationLevel = makeStrictEnum({
  ReadUncommitted: 'ReadUncommitted',
  ReadCommitted: 'ReadCommitted',
  RepeatableRead: 'RepeatableRead',
  Serializable: 'Serializable'
});

exports.Prisma.HospitalSettingsScalarFieldEnum = {
  id: 'id',
  hospitalName: 'hospitalName',
  systemStatus: 'systemStatus',
  address: 'address',
  phone: 'phone',
  detailedAddress: 'detailedAddress',
  taxId: 'taxId',
  marketingSlogan: 'marketingSlogan',
  contactEmail: 'contactEmail',
  logoUrl: 'logoUrl',
  timezone: 'timezone',
  lastSyncedAt: 'lastSyncedAt',
  ehrEnabled: 'ehrEnabled',
  billingEnabled: 'billingEnabled',
  labEnabled: 'labEnabled',
  pharmacyEnabled: 'pharmacyEnabled',
  hrEnabled: 'hrEnabled'
};

exports.Prisma.LocalSubscriptionScalarFieldEnum = {
  id: 'id',
  planCode: 'planCode',
  status: 'status',
  validUntil: 'validUntil',
  gracePeriodEnd: 'gracePeriodEnd',
  signedToken: 'signedToken',
  lastSyncedAt: 'lastSyncedAt'
};

exports.Prisma.PatientScalarFieldEnum = {
  id: 'id',
  mrn: 'mrn',
  firstName: 'firstName',
  lastName: 'lastName',
  dob: 'dob',
  gender: 'gender',
  phone: 'phone',
  email: 'email',
  address: 'address',
  biometricHash: 'biometricHash',
  biometricType: 'biometricType',
  respiratoryScale: 'respiratoryScale',
  insuranceProvider: 'insuranceProvider',
  insuranceId: 'insuranceId',
  emergencyContactName: 'emergencyContactName',
  emergencyContactPhone: 'emergencyContactPhone',
  version: 'version',
  isSynced: 'isSynced',
  conflictStatus: 'conflictStatus',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChatMessageScalarFieldEnum = {
  id: 'id',
  content: 'content',
  patientId: 'patientId',
  authorId: 'authorId',
  authorName: 'authorName',
  authorRole: 'authorRole',
  timestamp: 'timestamp',
  isClinical: 'isClinical',
  isSystemGenerated: 'isSystemGenerated'
};

exports.Prisma.UserChatMessageScalarFieldEnum = {
  id: 'id',
  content: 'content',
  senderId: 'senderId',
  receiverId: 'receiverId',
  groupId: 'groupId',
  read: 'read',
  timestamp: 'timestamp',
  expiresAt: 'expiresAt'
};

exports.Prisma.ChatGroupScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  createdAt: 'createdAt'
};

exports.Prisma.ChatMemberScalarFieldEnum = {
  id: 'id',
  groupId: 'groupId',
  userId: 'userId',
  role: 'role',
  joinedAt: 'joinedAt'
};

exports.Prisma.InternalAttachmentScalarFieldEnum = {
  id: 'id',
  messageId: 'messageId',
  type: 'type',
  url: 'url',
  fileName: 'fileName',
  fileSize: 'fileSize',
  createdAt: 'createdAt'
};

exports.Prisma.AttachmentScalarFieldEnum = {
  id: 'id',
  messageId: 'messageId',
  type: 'type',
  url: 'url',
  fileName: 'fileName',
  fileSize: 'fileSize',
  createdAt: 'createdAt'
};

exports.Prisma.EncounterScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  visitId: 'visitId',
  doctorName: 'doctorName',
  type: 'type',
  notes: 'notes',
  plan: 'plan',
  esiLevel: 'esiLevel',
  triageNotes: 'triageNotes',
  triageStartedAt: 'triageStartedAt',
  mseCompletedAt: 'mseCompletedAt',
  isStabilized: 'isStabilized',
  dischargeSummary: 'dischargeSummary',
  dischargedAt: 'dischargedAt',
  version: 'version',
  isSynced: 'isSynced',
  conflictStatus: 'conflictStatus',
  conflictData: 'conflictData',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VisitScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  type: 'type',
  status: 'status',
  reason: 'reason',
  admittedAt: 'admittedAt',
  dischargedAt: 'dischargedAt',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ClinicalNoteScalarFieldEnum = {
  id: 'id',
  visitId: 'visitId',
  encounterId: 'encounterId',
  patientId: 'patientId',
  authorId: 'authorId',
  type: 'type',
  subjective: 'subjective',
  objective: 'objective',
  assessment: 'assessment',
  plan: 'plan',
  content: 'content',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.WardScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type',
  floor: 'floor'
};

exports.Prisma.BedScalarFieldEnum = {
  id: 'id',
  wardId: 'wardId',
  number: 'number',
  status: 'status'
};

exports.Prisma.AdmissionScalarFieldEnum = {
  id: 'id',
  encounterId: 'encounterId',
  bedId: 'bedId',
  attendingPhysicianId: 'attendingPhysicianId',
  admissionReason: 'admissionReason',
  status: 'status',
  admittedAt: 'admittedAt',
  dischargedAt: 'dischargedAt',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AdtTransferEventScalarFieldEnum = {
  id: 'id',
  admissionId: 'admissionId',
  fromBedId: 'fromBedId',
  toBedId: 'toBedId',
  reasonForTransfer: 'reasonForTransfer',
  transferredByRole: 'transferredByRole',
  transferredAt: 'transferredAt',
  version: 'version',
  isSynced: 'isSynced'
};

exports.Prisma.MedicationAdministrationScalarFieldEnum = {
  id: 'id',
  encounterId: 'encounterId',
  medicationName: 'medicationName',
  dosage: 'dosage',
  route: 'route',
  status: 'status',
  reasonForSkip: 'reasonForSkip',
  administeredBy: 'administeredBy',
  administeredAt: 'administeredAt'
};

exports.Prisma.InventoryItemScalarFieldEnum = {
  id: 'id',
  name: 'name',
  description: 'description',
  category: 'category',
  subCategory: 'subCategory',
  sku: 'sku',
  quantity: 'quantity',
  unit: 'unit',
  minLevel: 'minLevel',
  expiryDate: 'expiryDate',
  isAsset: 'isAsset',
  serialNumber: 'serialNumber',
  batchEnabled: 'batchEnabled',
  price: 'price',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PrescriptionScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  encounterId: 'encounterId',
  orderedBy: 'orderedBy',
  status: 'status',
  notes: 'notes',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PrescriptionItemScalarFieldEnum = {
  id: 'id',
  prescriptionId: 'prescriptionId',
  drugName: 'drugName',
  dosage: 'dosage',
  frequency: 'frequency',
  duration: 'duration',
  quantity: 'quantity'
};

exports.Prisma.DispensingRecordScalarFieldEnum = {
  id: 'id',
  prescriptionId: 'prescriptionId',
  itemId: 'itemId',
  quantityDispensed: 'quantityDispensed',
  dispensedBy: 'dispensedBy',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.EmployeeScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  firstName: 'firstName',
  lastName: 'lastName',
  role: 'role',
  department: 'department',
  permissions: 'permissions',
  email: 'email',
  passwordHash: 'passwordHash',
  phone: 'phone',
  nationalId: 'nationalId',
  status: 'status',
  contractType: 'contractType',
  dateJoined: 'dateJoined',
  dateTerminated: 'dateTerminated',
  probationEnds: 'probationEnds',
  baseSalary: 'baseSalary',
  hourlyRate: 'hourlyRate',
  currency: 'currency',
  licenseNumber: 'licenseNumber',
  licenseExpiry: 'licenseExpiry',
  licenseBody: 'licenseBody',
  credentialsDocs: 'credentialsDocs',
  emergencyName: 'emergencyName',
  emergencyPhone: 'emergencyPhone',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PayrollRecordScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  periodMonth: 'periodMonth',
  periodYear: 'periodYear',
  baseAmount: 'baseAmount',
  bonusAmount: 'bonusAmount',
  deductionAmount: 'deductionAmount',
  netAmount: 'netAmount',
  status: 'status',
  paidAt: 'paidAt',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  incomeTax: 'incomeTax',
  nhif: 'nhif',
  nssf: 'nssf',
  allowances: 'allowances',
  overtimePay: 'overtimePay',
  hoursWorked: 'hoursWorked',
  overtimeHours: 'overtimeHours'
};

exports.Prisma.ShiftScheduleScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  shiftDate: 'shiftDate',
  startTime: 'startTime',
  endTime: 'endTime',
  shiftType: 'shiftType',
  department: 'department',
  ward: 'ward',
  swapRequestedWith: 'swapRequestedWith',
  swapStatus: 'swapStatus',
  isPublished: 'isPublished',
  notes: 'notes',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AttendanceLogScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  date: 'date',
  clockIn: 'clockIn',
  clockOut: 'clockOut',
  hoursWorked: 'hoursWorked',
  overtimeHrs: 'overtimeHrs',
  status: 'status',
  source: 'source',
  offlineMode: 'offlineMode',
  deviceId: 'deviceId',
  notes: 'notes',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt'
};

exports.Prisma.LeaveRequestScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  leaveType: 'leaveType',
  startDate: 'startDate',
  endDate: 'endDate',
  daysRequested: 'daysRequested',
  reason: 'reason',
  status: 'status',
  approvedBy: 'approvedBy',
  approvedAt: 'approvedAt',
  rejectionReason: 'rejectionReason',
  medicalCertUrl: 'medicalCertUrl',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PayslipScalarFieldEnum = {
  id: 'id',
  employeeId: 'employeeId',
  payrollRecordId: 'payrollRecordId',
  periodMonth: 'periodMonth',
  periodYear: 'periodYear',
  baseSalary: 'baseSalary',
  allowances: 'allowances',
  overtimePay: 'overtimePay',
  bonus: 'bonus',
  grossPay: 'grossPay',
  incomeTax: 'incomeTax',
  nhif: 'nhif',
  nssf: 'nssf',
  otherDeductions: 'otherDeductions',
  totalDeductions: 'totalDeductions',
  netPay: 'netPay',
  hoursWorked: 'hoursWorked',
  overtimeHours: 'overtimeHours',
  daysAbsent: 'daysAbsent',
  daysOnLeave: 'daysOnLeave',
  status: 'status',
  disbursedAt: 'disbursedAt',
  paymentRef: 'paymentRef',
  pdfUrl: 'pdfUrl',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt'
};

exports.Prisma.DiagnosticOrderScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  encounterId: 'encounterId',
  category: 'category',
  testName: 'testName',
  priority: 'priority',
  status: 'status',
  orderedBy: 'orderedBy',
  specimenId: 'specimenId',
  collectionTime: 'collectionTime',
  validatedAt: 'validatedAt',
  validatedBy: 'validatedBy',
  isCritical: 'isCritical',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DiagnosticResultScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  parameter: 'parameter',
  value: 'value',
  unit: 'unit',
  referenceRange: 'referenceRange',
  flag: 'flag',
  performedBy: 'performedBy',
  verifiedBy: 'verifiedBy',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VitalsScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  encounterId: 'encounterId',
  bloodPressure: 'bloodPressure',
  heartRate: 'heartRate',
  temperature: 'temperature',
  respiratoryRate: 'respiratoryRate',
  spO2: 'spO2',
  weight: 'weight',
  height: 'height',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DiagnosisScalarFieldEnum = {
  id: 'id',
  encounterId: 'encounterId',
  code: 'code',
  description: 'description',
  category: 'category',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.AllergyScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  substance: 'substance',
  reaction: 'reaction',
  severity: 'severity',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.InvoiceScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  encounterId: 'encounterId',
  visitId: 'visitId',
  totalAmount: 'totalAmount',
  balanceDue: 'balanceDue',
  status: 'status',
  payerType: 'payerType',
  insurancePolicyNumber: 'insurancePolicyNumber',
  preAuthCode: 'preAuthCode',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentScalarFieldEnum = {
  id: 'id',
  invoiceId: 'invoiceId',
  amount: 'amount',
  method: 'method',
  reference: 'reference',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.BillItemScalarFieldEnum = {
  id: 'id',
  visitId: 'visitId',
  invoiceId: 'invoiceId',
  description: 'description',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  totalPrice: 'totalPrice',
  status: 'status',
  category: 'category',
  inventoryItemId: 'inventoryItemId',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PaymentAllocationScalarFieldEnum = {
  id: 'id',
  paymentId: 'paymentId',
  billItemId: 'billItemId',
  amount: 'amount',
  createdAt: 'createdAt'
};

exports.Prisma.AccountScalarFieldEnum = {
  id: 'id',
  code: 'code',
  name: 'name',
  type: 'type',
  description: 'description',
  isActive: 'isActive',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JournalEntryScalarFieldEnum = {
  id: 'id',
  date: 'date',
  description: 'description',
  reference: 'reference',
  status: 'status',
  accountingStandard: 'accountingStandard',
  ledgerType: 'ledgerType',
  fiscalPeriod: 'fiscalPeriod',
  sourceType: 'sourceType',
  sourceId: 'sourceId',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.JournalLineScalarFieldEnum = {
  id: 'id',
  journalEntryId: 'journalEntryId',
  accountId: 'accountId',
  description: 'description',
  debit: 'debit',
  credit: 'credit'
};

exports.Prisma.VendorScalarFieldEnum = {
  id: 'id',
  name: 'name',
  taxId: 'taxId',
  contactPerson: 'contactPerson',
  email: 'email',
  phone: 'phone',
  address: 'address',
  paymentTerms: 'paymentTerms',
  isInsurance: 'isInsurance'
};

exports.Prisma.VendorCatalogItemScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  inventoryItemId: 'inventoryItemId',
  vendorSku: 'vendorSku',
  unitPrice: 'unitPrice',
  minimumOrderQty: 'minimumOrderQty',
  leadTimeDays: 'leadTimeDays'
};

exports.Prisma.PurchaseOrderScalarFieldEnum = {
  id: 'id',
  vendorId: 'vendorId',
  status: 'status',
  totalAmount: 'totalAmount',
  orderedBy: 'orderedBy',
  orderedAt: 'orderedAt',
  approvedById: 'approvedById'
};

exports.Prisma.PurchaseOrderItemScalarFieldEnum = {
  id: 'id',
  purchaseOrderId: 'purchaseOrderId',
  itemId: 'itemId',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  subtotal: 'subtotal'
};

exports.Prisma.GRNScalarFieldEnum = {
  id: 'id',
  purchaseOrderId: 'purchaseOrderId',
  receivedDate: 'receivedDate',
  receivedBy: 'receivedBy',
  deliveryNote: 'deliveryNote'
};

exports.Prisma.GRNItemScalarFieldEnum = {
  id: 'id',
  grnId: 'grnId',
  itemId: 'itemId',
  quantity: 'quantity',
  unitPrice: 'unitPrice',
  batchNumber: 'batchNumber',
  expiryDate: 'expiryDate'
};

exports.Prisma.InventoryLocationScalarFieldEnum = {
  id: 'id',
  name: 'name',
  type: 'type'
};

exports.Prisma.InventoryBinScalarFieldEnum = {
  id: 'id',
  locationId: 'locationId',
  code: 'code',
  description: 'description'
};

exports.Prisma.InventoryBatchScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  locationId: 'locationId',
  batchNumber: 'batchNumber',
  expiryDate: 'expiryDate',
  quantity: 'quantity'
};

exports.Prisma.AssetMaintenanceScalarFieldEnum = {
  id: 'id',
  itemId: 'itemId',
  lastServicedAt: 'lastServicedAt',
  technicianName: 'technicianName',
  notes: 'notes',
  nextDueDate: 'nextDueDate'
};

exports.Prisma.EventJournalScalarFieldEnum = {
  id: 'id',
  entityType: 'entityType',
  entityId: 'entityId',
  action: 'action',
  payload: 'payload',
  encryptedPayload: 'encryptedPayload',
  timestamp: 'timestamp',
  signature: 'signature',
  publicKeyId: 'publicKeyId',
  isSynced: 'isSynced',
  direction: 'direction',
  sequenceNumber: 'sequenceNumber'
};

exports.Prisma.AuditLogScalarFieldEnum = {
  id: 'id',
  actorId: 'actorId',
  actorName: 'actorName',
  actorRole: 'actorRole',
  action: 'action',
  resource: 'resource',
  resourceId: 'resourceId',
  details: 'details',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  timestamp: 'timestamp',
  hash: 'hash'
};

exports.Prisma.SyncNodeScalarFieldEnum = {
  id: 'id',
  nodeName: 'nodeName',
  nodeType: 'nodeType',
  lastHeartbeat: 'lastHeartbeat',
  version: 'version',
  status: 'status',
  config: 'config',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ICUMonitoringScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  encounterId: 'encounterId',
  bedId: 'bedId',
  admissionReason: 'admissionReason',
  apacheScore: 'apacheScore',
  sofaScore: 'sofaScore',
  ventilatorMode: 'ventilatorMode',
  fio2: 'fio2',
  tidalVolume: 'tidalVolume',
  peep: 'peep',
  isolationStatus: 'isolationStatus',
  codeStatus: 'codeStatus',
  admittedAt: 'admittedAt',
  dischargedAt: 'dischargedAt',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.VitalsLogScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  encounterId: 'encounterId',
  icuMonitoringId: 'icuMonitoringId',
  recordedAt: 'recordedAt',
  recordedBy: 'recordedBy',
  bloodPressure: 'bloodPressure',
  heartRate: 'heartRate',
  temperature: 'temperature',
  respiratoryRate: 'respiratoryRate',
  spO2: 'spO2',
  gcs: 'gcs',
  urineOutputMl: 'urineOutputMl',
  painScore: 'painScore',
  news2Score: 'news2Score',
  infusionData: 'infusionData',
  source: 'source',
  isCritical: 'isCritical',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt'
};

exports.Prisma.OncologyTreatmentScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  oncologistId: 'oncologistId',
  protocolName: 'protocolName',
  cancerType: 'cancerType',
  stage: 'stage',
  intent: 'intent',
  totalCycles: 'totalCycles',
  currentCycle: 'currentCycle',
  cycleIntervalDays: 'cycleIntervalDays',
  startDate: 'startDate',
  endDate: 'endDate',
  status: 'status',
  response: 'response',
  discontinuationReason: 'discontinuationReason',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChemoSessionScalarFieldEnum = {
  id: 'id',
  treatmentId: 'treatmentId',
  patientId: 'patientId',
  cycleNumber: 'cycleNumber',
  sessionNumber: 'sessionNumber',
  scheduledDate: 'scheduledDate',
  actualDate: 'actualDate',
  status: 'status',
  anc: 'anc',
  platelets: 'platelets',
  weightKg: 'weightKg',
  bsa: 'bsa',
  preChemoCleared: 'preChemoCleared',
  drugs: 'drugs',
  toxicities: 'toxicities',
  sessionNotes: 'sessionNotes',
  adverseEvent: 'adverseEvent',
  doseReduced: 'doseReduced',
  doseReductionReason: 'doseReductionReason',
  infusionStart: 'infusionStart',
  infusionEnd: 'infusionEnd',
  nurseId: 'nurseId',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.MaternityRecordScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  encounterId: 'encounterId',
  gravida: 'gravida',
  para: 'para',
  lmp: 'lmp',
  edd: 'edd',
  gestationalAgeWeeks: 'gestationalAgeWeeks',
  bloodGroup: 'bloodGroup',
  rhesus: 'rhesus',
  hivStatus: 'hivStatus',
  pmtctEnrolled: 'pmtctEnrolled',
  riskLevel: 'riskLevel',
  riskFactors: 'riskFactors',
  ancVisitCount: 'ancVisitCount',
  nextAncDate: 'nextAncDate',
  deliveryOutcome: 'deliveryOutcome',
  deliveryDate: 'deliveryDate',
  birthWeightKg: 'birthWeightKg',
  apgar1min: 'apgar1min',
  apgar5min: 'apgar5min',
  neonatalPatientId: 'neonatalPatientId',
  status: 'status',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DeliveryLogScalarFieldEnum = {
  id: 'id',
  maternityRecordId: 'maternityRecordId',
  patientId: 'patientId',
  midwifeId: 'midwifeId',
  obstetricianId: 'obstetricianId',
  labourOnsetAt: 'labourOnsetAt',
  membraneStatus: 'membraneStatus',
  liquorColor: 'liquorColor',
  partogramData: 'partogramData',
  deliveryTime: 'deliveryTime',
  deliveryMethod: 'deliveryMethod',
  cSectionIndication: 'cSectionIndication',
  placentaDeliveryTime: 'placentaDeliveryTime',
  bloodLossMl: 'bloodLossMl',
  episiotomy: 'episiotomy',
  perinealTear: 'perinealTear',
  isEmergency: 'isEmergency',
  babySex: 'babySex',
  birthWeightKg: 'birthWeightKg',
  apgar1min: 'apgar1min',
  apgar5min: 'apgar5min',
  resuscitationRequired: 'resuscitationRequired',
  oxytocinGiven: 'oxytocinGiven',
  vitaminKGiven: 'vitaminKGiven',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt'
};

exports.Prisma.MedicationScalarFieldEnum = {
  id: 'id',
  ndcCode: 'ndcCode',
  name: 'name',
  genericName: 'genericName',
  drugClass: 'drugClass',
  deaSchedule: 'deaSchedule',
  unit: 'unit',
  dosageForm: 'dosageForm',
  minDose: 'minDose',
  maxDose: 'maxDose',
  maxDailyDose: 'maxDailyDose',
  requiresRA: 'requiresRA',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PharmacyInventoryScalarFieldEnum = {
  id: 'id',
  medicationId: 'medicationId',
  locationId: 'locationId',
  batchNumber: 'batchNumber',
  lotNumber: 'lotNumber',
  expiryDate: 'expiryDate',
  quantityOnHand: 'quantityOnHand',
  quantityReserved: 'quantityReserved',
  unitCost: 'unitCost',
  isControlled: 'isControlled',
  storageCondition: 'storageCondition',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DrugInteractionScalarFieldEnum = {
  id: 'id',
  drugAId: 'drugAId',
  drugBId: 'drugBId',
  severity: 'severity',
  mechanism: 'mechanism',
  clinicalEffect: 'clinicalEffect',
  management: 'management',
  source: 'source',
  version: 'version',
  isSynced: 'isSynced',
  updatedAt: 'updatedAt'
};

exports.Prisma.DispensingLogScalarFieldEnum = {
  id: 'id',
  prescriptionId: 'prescriptionId',
  pharmacyInventoryId: 'pharmacyInventoryId',
  patientId: 'patientId',
  pharmacistId: 'pharmacistId',
  technicianId: 'technicianId',
  quantityDispensed: 'quantityDispensed',
  batchNumber: 'batchNumber',
  expiryDate: 'expiryDate',
  counselingNotes: 'counselingNotes',
  patientInstructed: 'patientInstructed',
  status: 'status',
  offlineMode: 'offlineMode',
  ipAddress: 'ipAddress',
  deviceId: 'deviceId',
  hash: 'hash',
  prevHash: 'prevHash',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt'
};

exports.Prisma.ControlledSubstanceLogScalarFieldEnum = {
  id: 'id',
  dispensingLogId: 'dispensingLogId',
  patientId: 'patientId',
  deaSchedule: 'deaSchedule',
  prescriberDea: 'prescriberDea',
  pharmacyDea: 'pharmacyDea',
  quantityDispensed: 'quantityDispensed',
  unit: 'unit',
  runningBalance: 'runningBalance',
  picId: 'picId',
  witnessId: 'witnessId',
  picSignedAt: 'picSignedAt',
  witnessSignedAt: 'witnessSignedAt',
  isSynced: 'isSynced',
  createdAt: 'createdAt'
};

exports.Prisma.RecordVersionScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  versionNumber: 'versionNumber',
  changedBy: 'changedBy',
  changedByRole: 'changedByRole',
  changeReason: 'changeReason',
  changeType: 'changeType',
  snapshotData: 'snapshotData',
  isEncrypted: 'isEncrypted',
  encryptionKeyId: 'encryptionKeyId',
  hash: 'hash',
  prevHash: 'prevHash',
  accessLevel: 'accessLevel',
  isSynced: 'isSynced',
  createdAt: 'createdAt'
};

exports.Prisma.ReleaseRequestScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  requestedBy: 'requestedBy',
  requesterType: 'requesterType',
  requesterOrg: 'requesterOrg',
  requesterEmail: 'requesterEmail',
  purposeOfUse: 'purposeOfUse',
  recordDateFrom: 'recordDateFrom',
  recordDateTo: 'recordDateTo',
  requestedFields: 'requestedFields',
  urgency: 'urgency',
  status: 'status',
  reviewedBy: 'reviewedBy',
  reviewedAt: 'reviewedAt',
  denialReason: 'denialReason',
  approvalNotes: 'approvalNotes',
  fulfilledAt: 'fulfilledAt',
  deliveryMethod: 'deliveryMethod',
  deliveryRef: 'deliveryRef',
  consentFormId: 'consentFormId',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ConsentFormScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  formType: 'formType',
  version: 'version',
  consentGiven: 'consentGiven',
  consentScope: 'consentScope',
  authorizedParty: 'authorizedParty',
  signedAt: 'signedAt',
  signedByName: 'signedByName',
  signatureMethod: 'signatureMethod',
  witnessId: 'witnessId',
  expiresAt: 'expiresAt',
  isRevoked: 'isRevoked',
  revokedAt: 'revokedAt',
  revokedReason: 'revokedReason',
  documentUrl: 'documentUrl',
  isEncrypted: 'isEncrypted',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RecordAccessGrantScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  grantedTo: 'grantedTo',
  grantedToRole: 'grantedToRole',
  grantedBy: 'grantedBy',
  accessLevel: 'accessLevel',
  scope: 'scope',
  reason: 'reason',
  expiresAt: 'expiresAt',
  isActive: 'isActive',
  revokedAt: 'revokedAt',
  revokedBy: 'revokedBy',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.RadiologyOrderScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  encounterId: 'encounterId',
  orderedById: 'orderedById',
  orderedAt: 'orderedAt',
  modality: 'modality',
  targetRegion: 'targetRegion',
  clinicalIndication: 'clinicalIndication',
  status: 'status',
  scheduledDate: 'scheduledDate',
  priority: 'priority',
  billedAmount: 'billedAmount',
  isBilled: 'isBilled',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ImagingStudyScalarFieldEnum = {
  id: 'id',
  orderId: 'orderId',
  patientId: 'patientId',
  encounterId: 'encounterId',
  dicomStudyUID: 'dicomStudyUID',
  accessionNumber: 'accessionNumber',
  modality: 'modality',
  studyDate: 'studyDate',
  studyDescription: 'studyDescription',
  referringPhysicianId: 'referringPhysicianId',
  radiologistId: 'radiologistId',
  status: 'status',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.DicomSeriesScalarFieldEnum = {
  id: 'id',
  studyId: 'studyId',
  dicomSeriesUID: 'dicomSeriesUID',
  seriesNumber: 'seriesNumber',
  modality: 'modality',
  seriesDescription: 'seriesDescription',
  bodyPartExamined: 'bodyPartExamined',
  numberOfInstances: 'numberOfInstances',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt'
};

exports.Prisma.DicomInstanceScalarFieldEnum = {
  id: 'id',
  seriesId: 'seriesId',
  dicomSOPInstanceUID: 'dicomSOPInstanceUID',
  instanceNumber: 'instanceNumber',
  storageUrl: 'storageUrl',
  fileSizeKb: 'fileSizeKb',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt'
};

exports.Prisma.RadiologyReportScalarFieldEnum = {
  id: 'id',
  studyId: 'studyId',
  patientId: 'patientId',
  encounterId: 'encounterId',
  findings: 'findings',
  impression: 'impression',
  addendums: 'addendums',
  isCriticalResult: 'isCriticalResult',
  signingRadiologistId: 'signingRadiologistId',
  status: 'status',
  signedAt: 'signedAt',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SurgeryRequestScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  encounterId: 'encounterId',
  requestedById: 'requestedById',
  diagnosis: 'diagnosis',
  procedureCode: 'procedureCode',
  requestedDate: 'requestedDate',
  priority: 'priority',
  status: 'status',
  medicalClearanceUrl: 'medicalClearanceUrl',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.OTScheduleScalarFieldEnum = {
  id: 'id',
  requestId: 'requestId',
  theatreRoomId: 'theatreRoomId',
  scheduledStartTime: 'scheduledStartTime',
  scheduledEndTime: 'scheduledEndTime',
  primarySurgeonId: 'primarySurgeonId',
  anesthesiologistId: 'anesthesiologistId',
  scrubNurseId: 'scrubNurseId',
  circulatingNurseId: 'circulatingNurseId',
  status: 'status',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SurgeryPreOpScalarFieldEnum = {
  id: 'id',
  otScheduleId: 'otScheduleId',
  consentSigned: 'consentSigned',
  consentDocumentUrl: 'consentDocumentUrl',
  fastingConfirmed: 'fastingConfirmed',
  surgicalSiteMarked: 'surgicalSiteMarked',
  anesthesiaCleared: 'anesthesiaCleared',
  bloodReservedUnits: 'bloodReservedUnits',
  crossmatchStatus: 'crossmatchStatus',
  clearedForSurgery: 'clearedForSurgery',
  clearedByNurseId: 'clearedByNurseId',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt'
};

exports.Prisma.SurgeryIntraOpScalarFieldEnum = {
  id: 'id',
  otScheduleId: 'otScheduleId',
  timeOutCompleted: 'timeOutCompleted',
  incisionTime: 'incisionTime',
  closureTime: 'closureTime',
  anesthesiaLog: 'anesthesiaLog',
  drugsUsed: 'drugsUsed',
  estimatedBloodLossMl: 'estimatedBloodLossMl',
  implantsUsed: 'implantsUsed',
  complications: 'complications',
  surgeonNotes: 'surgeonNotes',
  specimensSentToLab: 'specimensSentToLab',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SurgeryPostOpScalarFieldEnum = {
  id: 'id',
  otScheduleId: 'otScheduleId',
  pacuArrivalTime: 'pacuArrivalTime',
  arrivalAldreteScore: 'arrivalAldreteScore',
  dischargeAldreteScore: 'dischargeAldreteScore',
  vitalsLog: 'vitalsLog',
  postOpInstructions: 'postOpInstructions',
  pacuDischargeTime: 'pacuDischargeTime',
  dischargeDestination: 'dischargeDestination',
  dischargedByMD: 'dischargedByMD',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LabOrderScalarFieldEnum = {
  id: 'id',
  patientId: 'patientId',
  encounterId: 'encounterId',
  orderedById: 'orderedById',
  isStandalone: 'isStandalone',
  externalPatientSource: 'externalPatientSource',
  externalPatientData: 'externalPatientData',
  testPanelId: 'testPanelId',
  urgency: 'urgency',
  clinicalNotes: 'clinicalNotes',
  status: 'status',
  orderedAt: 'orderedAt',
  billedAmount: 'billedAmount',
  isBilled: 'isBilled',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LabSampleScalarFieldEnum = {
  id: 'id',
  labOrderId: 'labOrderId',
  specimenType: 'specimenType',
  containerType: 'containerType',
  barcode: 'barcode',
  collectedAt: 'collectedAt',
  collectedById: 'collectedById',
  isRejected: 'isRejected',
  rejectionReason: 'rejectionReason',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.LabResultScalarFieldEnum = {
  id: 'id',
  labOrderId: 'labOrderId',
  biomarkerName: 'biomarkerName',
  valueResult: 'valueResult',
  numericValue: 'numericValue',
  unit: 'unit',
  referenceRangeMin: 'referenceRangeMin',
  referenceRangeMax: 'referenceRangeMax',
  referenceText: 'referenceText',
  flag: 'flag',
  machineId: 'machineId',
  analyzedAt: 'analyzedAt',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt'
};

exports.Prisma.LabReportScalarFieldEnum = {
  id: 'id',
  labOrderId: 'labOrderId',
  pathologistId: 'pathologistId',
  clinicalInterpretation: 'clinicalInterpretation',
  isCritical: 'isCritical',
  validatedAt: 'validatedAt',
  status: 'status',
  pdfUrl: 'pdfUrl',
  version: 'version',
  isSynced: 'isSynced',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.ChangeLogScalarFieldEnum = {
  id: 'id',
  modelName: 'modelName',
  recordId: 'recordId',
  operation: 'operation',
  data: 'data',
  userId: 'userId',
  timestamp: 'timestamp',
  isProcessed: 'isProcessed',
  nodeId: 'nodeId'
};

exports.Prisma.SyncQueueScalarFieldEnum = {
  id: 'id',
  payload: 'payload',
  direction: 'direction',
  status: 'status',
  retryCount: 'retryCount',
  lastError: 'lastError',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};
exports.SystemStatus = exports.$Enums.SystemStatus = {
  ACTIVE: 'ACTIVE',
  SUSPENDED: 'SUSPENDED',
  MAINTENANCE: 'MAINTENANCE'
};

exports.Role = exports.$Enums.Role = {
  DOCTOR: 'DOCTOR',
  NURSE: 'NURSE',
  PHARMACIST: 'PHARMACIST',
  LAB_TECH: 'LAB_TECH',
  ACCOUNTANT: 'ACCOUNTANT',
  HR_MANAGER: 'HR_MANAGER',
  HR: 'HR',
  ADMIN: 'ADMIN',
  MIDWIFE: 'MIDWIFE',
  ICU_NURSE: 'ICU_NURSE',
  ONCOLOGY_NURSE: 'ONCOLOGY_NURSE',
  RADIOGRAPHER: 'RADIOGRAPHER',
  RADIOLOGIST: 'RADIOLOGIST',
  RECEPTIONIST: 'RECEPTIONIST',
  SECURITY: 'SECURITY',
  CLEANER: 'CLEANER',
  DRIVER: 'DRIVER',
  PATHOLOGIST: 'PATHOLOGIST',
  PROCUREMENT_MANAGER: 'PROCUREMENT_MANAGER',
  INVENTORY_CLERK: 'INVENTORY_CLERK',
  ADMISSIONS: 'ADMISSIONS',
  NURSE_MANAGER: 'NURSE_MANAGER',
  HIM_OFFICER: 'HIM_OFFICER',
  AUDITOR: 'AUDITOR',
  SURGEON: 'SURGEON',
  ANESTHESIOLOGIST: 'ANESTHESIOLOGIST',
  OT_MANAGER: 'OT_MANAGER',
  PATIENT_PORTAL: 'PATIENT_PORTAL'
};

exports.Prisma.ModelName = {
  HospitalSettings: 'HospitalSettings',
  LocalSubscription: 'LocalSubscription',
  Patient: 'Patient',
  ChatMessage: 'ChatMessage',
  UserChatMessage: 'UserChatMessage',
  ChatGroup: 'ChatGroup',
  ChatMember: 'ChatMember',
  InternalAttachment: 'InternalAttachment',
  Attachment: 'Attachment',
  Encounter: 'Encounter',
  Visit: 'Visit',
  ClinicalNote: 'ClinicalNote',
  Ward: 'Ward',
  Bed: 'Bed',
  Admission: 'Admission',
  AdtTransferEvent: 'AdtTransferEvent',
  MedicationAdministration: 'MedicationAdministration',
  InventoryItem: 'InventoryItem',
  Prescription: 'Prescription',
  PrescriptionItem: 'PrescriptionItem',
  DispensingRecord: 'DispensingRecord',
  Employee: 'Employee',
  PayrollRecord: 'PayrollRecord',
  ShiftSchedule: 'ShiftSchedule',
  AttendanceLog: 'AttendanceLog',
  LeaveRequest: 'LeaveRequest',
  Payslip: 'Payslip',
  DiagnosticOrder: 'DiagnosticOrder',
  DiagnosticResult: 'DiagnosticResult',
  Vitals: 'Vitals',
  Diagnosis: 'Diagnosis',
  Allergy: 'Allergy',
  Invoice: 'Invoice',
  Payment: 'Payment',
  BillItem: 'BillItem',
  PaymentAllocation: 'PaymentAllocation',
  Account: 'Account',
  JournalEntry: 'JournalEntry',
  JournalLine: 'JournalLine',
  Vendor: 'Vendor',
  VendorCatalogItem: 'VendorCatalogItem',
  PurchaseOrder: 'PurchaseOrder',
  PurchaseOrderItem: 'PurchaseOrderItem',
  GRN: 'GRN',
  GRNItem: 'GRNItem',
  InventoryLocation: 'InventoryLocation',
  InventoryBin: 'InventoryBin',
  InventoryBatch: 'InventoryBatch',
  AssetMaintenance: 'AssetMaintenance',
  EventJournal: 'EventJournal',
  AuditLog: 'AuditLog',
  SyncNode: 'SyncNode',
  ICUMonitoring: 'ICUMonitoring',
  VitalsLog: 'VitalsLog',
  OncologyTreatment: 'OncologyTreatment',
  ChemoSession: 'ChemoSession',
  MaternityRecord: 'MaternityRecord',
  DeliveryLog: 'DeliveryLog',
  Medication: 'Medication',
  PharmacyInventory: 'PharmacyInventory',
  DrugInteraction: 'DrugInteraction',
  DispensingLog: 'DispensingLog',
  ControlledSubstanceLog: 'ControlledSubstanceLog',
  RecordVersion: 'RecordVersion',
  ReleaseRequest: 'ReleaseRequest',
  ConsentForm: 'ConsentForm',
  RecordAccessGrant: 'RecordAccessGrant',
  RadiologyOrder: 'RadiologyOrder',
  ImagingStudy: 'ImagingStudy',
  DicomSeries: 'DicomSeries',
  DicomInstance: 'DicomInstance',
  RadiologyReport: 'RadiologyReport',
  SurgeryRequest: 'SurgeryRequest',
  OTSchedule: 'OTSchedule',
  SurgeryPreOp: 'SurgeryPreOp',
  SurgeryIntraOp: 'SurgeryIntraOp',
  SurgeryPostOp: 'SurgeryPostOp',
  LabOrder: 'LabOrder',
  LabSample: 'LabSample',
  LabResult: 'LabResult',
  LabReport: 'LabReport',
  ChangeLog: 'ChangeLog',
  SyncQueue: 'SyncQueue'
};

/**
 * This is a stub Prisma Client that will error at runtime if called.
 */
class PrismaClient {
  constructor() {
    return new Proxy(this, {
      get(target, prop) {
        let message
        const runtime = getRuntime()
        if (runtime.isEdge) {
          message = `PrismaClient is not configured to run in ${runtime.prettyName}. In order to run Prisma Client on edge runtime, either:
- Use Prisma Accelerate: https://pris.ly/d/accelerate
- Use Driver Adapters: https://pris.ly/d/driver-adapters
`;
        } else {
          message = 'PrismaClient is unable to run in this browser environment, or has been bundled for the browser (running in `' + runtime.prettyName + '`).'
        }
        
        message += `
If this is unexpected, please open an issue: https://pris.ly/prisma-prisma-bug-report`

        throw new Error(message)
      }
    })
  }
}

exports.PrismaClient = PrismaClient

Object.assign(exports, Prisma)
