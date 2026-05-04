
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

exports.Prisma.TenantScalarFieldEnum = {
  id: 'id',
  name: 'name',
  slug: 'slug',
  dbUrl: 'dbUrl',
  encryptionKeyReference: 'encryptionKeyReference',
  tier: 'tier',
  region: 'region',
  status: 'status',
  suspensionReason: 'suspensionReason',
  suspendedAt: 'suspendedAt',
  address: 'address',
  logoUrl: 'logoUrl',
  primaryColor: 'primaryColor',
  secondaryColor: 'secondaryColor',
  trialEndsAt: 'trialEndsAt',
  enabledModules: 'enabledModules',
  queueConfig: 'queueConfig',
  billingConfig: 'billingConfig',
  staffRoles: 'staffRoles',
  publicKeySpki: 'publicKeySpki',
  sharedSecret: 'sharedSecret',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  complianceIsolation: 'complianceIsolation',
  facilityType: 'facilityType',
  moduleConfig: 'moduleConfig',
  subscriptionQuotas: 'subscriptionQuotas',
  workflowCustomization: 'workflowCustomization'
};

exports.Prisma.ModuleScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  description: 'description',
  basePrice: 'basePrice',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt',
  dependencies: 'dependencies',
  events: 'events',
  permissions: 'permissions'
};

exports.Prisma.TenantModuleScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  moduleId: 'moduleId',
  isEnabled: 'isEnabled',
  validUntil: 'validUntil',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SystemAdminScalarFieldEnum = {
  id: 'id',
  name: 'name',
  email: 'email',
  passwordHash: 'passwordHash',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.GlobalSettingsScalarFieldEnum = {
  id: 'id',
  platformName: 'platformName',
  platformLogoUrl: 'platformLogoUrl',
  platformSlogan: 'platformSlogan',
  heroTitle: 'heroTitle',
  heroSubtitle: 'heroSubtitle',
  heroCTA: 'heroCTA',
  heroImageUrl: 'heroImageUrl',
  showHero: 'showHero',
  showFeatures: 'showFeatures',
  feature1Title: 'feature1Title',
  feature1Desc: 'feature1Desc',
  feature1Icon: 'feature1Icon',
  feature2Title: 'feature2Title',
  feature2Desc: 'feature2Desc',
  feature2Icon: 'feature2Icon',
  feature3Title: 'feature3Title',
  feature3Desc: 'feature3Desc',
  feature3Icon: 'feature3Icon',
  paypalClientId: 'paypalClientId',
  paypalClientSecret: 'paypalClientSecret',
  paypalEnv: 'paypalEnv',
  mpesaConsumerKey: 'mpesaConsumerKey',
  mpesaConsumerSecret: 'mpesaConsumerSecret',
  mpesaPasskey: 'mpesaPasskey',
  mpesaShortcode: 'mpesaShortcode',
  updatedAt: 'updatedAt'
};

exports.Prisma.SystemPaymentScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  amount: 'amount',
  currency: 'currency',
  method: 'method',
  status: 'status',
  reference: 'reference',
  customerEmail: 'customerEmail',
  customerName: 'customerName',
  description: 'description',
  createdAt: 'createdAt'
};

exports.Prisma.PlanScalarFieldEnum = {
  id: 'id',
  name: 'name',
  code: 'code',
  description: 'description',
  price: 'price',
  currency: 'currency',
  billingCycle: 'billingCycle',
  features: 'features',
  maxPatients: 'maxPatients',
  maxUsers: 'maxUsers',
  maxBeds: 'maxBeds',
  isActive: 'isActive',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SubscriptionScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  planId: 'planId',
  status: 'status',
  startDate: 'startDate',
  endDate: 'endDate',
  signedToken: 'signedToken',
  autoRenew: 'autoRenew',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.PatientIndexScalarFieldEnum = {
  biometricHash: 'biometricHash',
  biometricType: 'biometricType',
  tenantId: 'tenantId',
  patientId: 'patientId',
  description: 'description',
  timestamp: 'timestamp',
  updatedAt: 'updatedAt'
};

exports.Prisma.TenantUsageScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  subscriptionId: 'subscriptionId',
  date: 'date',
  activeUsers: 'activeUsers',
  activePatients: 'activePatients',
  storageUsedMb: 'storageUsedMb',
  apiCallsCount: 'apiCallsCount',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
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

exports.Prisma.FeatureFlagScalarFieldEnum = {
  id: 'id',
  flagId: 'flagId',
  scope: 'scope',
  moduleId: 'moduleId',
  defaultValue: 'defaultValue',
  description: 'description',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.FeatureFlagOverrideScalarFieldEnum = {
  id: 'id',
  flagId: 'flagId',
  tenantId: 'tenantId',
  enabled: 'enabled',
  createdAt: 'createdAt'
};

exports.Prisma.TenantConfigAuditLogScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  actorId: 'actorId',
  actorName: 'actorName',
  actorRole: 'actorRole',
  action: 'action',
  field: 'field',
  oldValue: 'oldValue',
  newValue: 'newValue',
  ipAddress: 'ipAddress',
  userAgent: 'userAgent',
  timestamp: 'timestamp'
};

exports.Prisma.TenantFeatureFlagScalarFieldEnum = {
  id: 'id',
  tenantId: 'tenantId',
  flagId: 'flagId',
  enabled: 'enabled',
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
};

exports.Prisma.SortOrder = {
  asc: 'asc',
  desc: 'desc'
};

exports.Prisma.JsonNullValueInput = {
  JsonNull: Prisma.JsonNull
};

exports.Prisma.NullableJsonNullValueInput = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull
};

exports.Prisma.QueryMode = {
  default: 'default',
  insensitive: 'insensitive'
};

exports.Prisma.JsonNullValueFilter = {
  DbNull: Prisma.DbNull,
  JsonNull: Prisma.JsonNull,
  AnyNull: Prisma.AnyNull
};

exports.Prisma.NullsOrder = {
  first: 'first',
  last: 'last'
};
exports.DeploymentTier = exports.$Enums.DeploymentTier = {
  CLINIC: 'CLINIC',
  HOSPITAL: 'HOSPITAL',
  NETWORK: 'NETWORK',
  GENERAL: 'GENERAL',
  RESEARCH: 'RESEARCH',
  PHARMACY: 'PHARMACY',
  LAB: 'LAB',
  SPECIALIST: 'SPECIALIST'
};

exports.TenantStatus = exports.$Enums.TenantStatus = {
  active: 'active',
  suspended: 'suspended',
  terminated: 'terminated'
};

exports.FacilityType = exports.$Enums.FacilityType = {
  CLINIC: 'CLINIC',
  PHARMACY: 'PHARMACY',
  LAB: 'LAB',
  SPECIALIST: 'SPECIALIST',
  HOSPITAL: 'HOSPITAL'
};

exports.BillingCycle = exports.$Enums.BillingCycle = {
  MONTHLY: 'MONTHLY',
  YEARLY: 'YEARLY'
};

exports.Prisma.ModelName = {
  Tenant: 'Tenant',
  Module: 'Module',
  TenantModule: 'TenantModule',
  SystemAdmin: 'SystemAdmin',
  GlobalSettings: 'GlobalSettings',
  SystemPayment: 'SystemPayment',
  Plan: 'Plan',
  Subscription: 'Subscription',
  PatientIndex: 'PatientIndex',
  TenantUsage: 'TenantUsage',
  SyncNode: 'SyncNode',
  FeatureFlag: 'FeatureFlag',
  FeatureFlagOverride: 'FeatureFlagOverride',
  TenantConfigAuditLog: 'TenantConfigAuditLog',
  TenantFeatureFlag: 'TenantFeatureFlag'
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
