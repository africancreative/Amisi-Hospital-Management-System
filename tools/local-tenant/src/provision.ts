import * as fs from 'fs';
import * as path from 'path';
import {
  PgConnection,
  findPsql,
  testConnection,
  createAppRoleAndDatabases,
  runPsql,
  runPsqlFile,
} from './pg';
import { hashPassword, randomSecret, randomBase64Url } from './crypto';
import {
  MODULES,
  PLANS,
  SYSTEM_ADMINS,
  FACILITY_PRESETS,
  FacilityType,
  buildStaff,
  buildPatients,
  ACCOUNTS,
  MEDICATIONS,
  WARDS,
} from './seed-data';

export interface InstallConfig {
  hospitalName: string;
  slug: string;
  tier: string;
  facilityType: FacilityType;
  adminEmail: string;
  adminName: string;
  adminPassword: string;
  port: number;
  hostname: string;
  pgHost: string;
  pgPort: number;
  pgSuperuser: string;
  pgPassword: string;
  pgBinDir?: string;
  appDir: string;
  sqlDir: string;
  envFile: string;
}

export interface InstallResult {
  ok: boolean;
  controlDbUrl: string;
  tenantDbUrl: string;
  tenantSlug: string;
  adminEmail: string;
  accessUrl: string;
  error?: string;
}

export type ProgressFn = (message: string) => void;

const noop = () => {};

const jsonb = (v: unknown): string => `'${JSON.stringify(v).replace(/'/g, "''")}'::jsonb`;
const lit = (v: string): string => `'${v.replace(/'/g, "''")}'`;

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
}

export async function provision(cfg: InstallConfig, onProgress: ProgressFn = noop): Promise<InstallResult> {
  const slug = cfg.slug || slugify(cfg.hospitalName);
  if (!/^[a-z0-9-]+$/.test(slug)) {
    throw new Error(`Invalid hospital slug "${slug}". Use letters, numbers and hyphens only.`);
  }
  if (!cfg.hospitalName) throw new Error('Hospital name is required.');
  if (!cfg.adminEmail) throw new Error('Admin email is required.');
  if (!cfg.adminPassword || cfg.adminPassword.length < 6) {
    throw new Error('Admin password is required and must be at least 6 characters.');
  }

  const conn: PgConnection = {
    host: cfg.pgHost || 'localhost',
    port: cfg.pgPort || 5432,
    superuser: cfg.pgSuperuser || 'postgres',
    password: cfg.pgPassword,
    pgBinDir: cfg.pgBinDir,
  };

  const appRole = 'amisimedos';
  const appRolePassword = randomSecret(24);
  const controlDb = 'amisi_control';
  const tenantDb = `amisimedos_${slug.replace(/-/g, '_')}`;

  const sqlDir = cfg.sqlDir || path.join(path.dirname(__dirname), 'sql');
  const controlSql = path.join(sqlDir, 'control.sql');
  const tenantSql = path.join(sqlDir, 'tenant.sql');

  if (!fs.existsSync(controlSql)) throw new Error(`Missing control schema SQL: ${controlSql}`);
  if (!fs.existsSync(tenantSql)) throw new Error(`Missing tenant schema SQL: ${tenantSql}`);

  onProgress('Locating PostgreSQL client...');
  const psqlPath = findPsql(conn.pgBinDir);
  onProgress(`PostgreSQL client found: ${psqlPath}`);

  onProgress('Verifying PostgreSQL superuser connection...');
  if (!testConnection(conn)) {
    throw new Error(
      `Could not authenticate to PostgreSQL as "${conn.superuser}" on ${conn.host}:${conn.port}. Check the superuser name and password.`
    );
  }

  onProgress('Creating application role and tenant databases...');
  createAppRoleAndDatabases(conn, appRole, appRolePassword, controlDb, tenantDb);

  // Switch to the application role for all object creation so the runtime
  // credentials in .env have full ownership of their schemas.
  const appConn: PgConnection = {
    host: conn.host,
    port: conn.port,
    superuser: appRole,
    password: appRolePassword,
    pgBinDir: conn.pgBinDir,
  };

  onProgress(`Applying control-plane schema to "${controlDb}"...`);
  runPsqlFile(appConn, controlDb, controlSql);
  onProgress(`Applying tenant schema to "${tenantDb}"...`);
  runPsqlFile(appConn, tenantDb, tenantSql);

  const hostUrl = (db: string) =>
    `postgresql://${appRole}:${appRolePassword}@${conn.host}:${conn.port}/${db}`;

  onProgress('Seeding control plane (modules, plans, tenant registration)...');
  seedControl(appConn, controlDb, {
    hospitalName: cfg.hospitalName,
    slug,
    tier: cfg.tier,
    facilityType: cfg.facilityType,
    tenantDbUrl: hostUrl(tenantDb),
  });

  onProgress('Seeding tenant database (hospital settings, staff, patients)...');
  seedTenant(appConn, tenantDb, {
    hospitalName: cfg.hospitalName,
    slug,
    adminEmail: cfg.adminEmail,
    adminName: cfg.adminName,
    adminPassword: cfg.adminPassword,
  });

  onProgress('Writing runtime configuration (.env)...');
  const envContent = buildEnv(cfg, appRole, appRolePassword, conn, controlDb, tenantDb, slug);
  const envFile = cfg.envFile || path.join(cfg.appDir, '.env');
  if (!fs.existsSync(path.dirname(envFile))) fs.mkdirSync(path.dirname(envFile), { recursive: true });
  fs.writeFileSync(envFile, envContent, { encoding: 'utf8' });

  onProgress('Provisioning complete.');

  const accessUrl = `http://${cfg.hostname || 'localhost'}:${cfg.port}/${slug}`;
  return {
    ok: true,
    controlDbUrl: hostUrl(controlDb),
    tenantDbUrl: hostUrl(tenantDb),
    tenantSlug: slug,
    adminEmail: cfg.adminEmail,
    accessUrl,
  };
}

// ─── Control-plane seeding ───────────────────────────────────────────────────

interface ControlSeedParams {
  hospitalName: string;
  slug: string;
  tier: string;
  facilityType: FacilityType;
  tenantDbUrl: string;
}

function seedControl(conn: PgConnection, db: string, p: ControlSeedParams): void {
  const now = new Date().toISOString();
  const tenantId = p.slug;
  const preset = FACILITY_PRESETS[p.facilityType] || FACILITY_PRESETS.CLINIC;
  const sharedSecret = randomSecret(32);
  const keyRef = `kms-local-${randomSecret(8)}`;

  const moduleConfig: Record<string, { enabled: boolean; version: string }> = {};
  for (const m of MODULES) {
    moduleConfig[m.code] = { enabled: preset.includes(m.code), version: '1.0.0' };
  }

  const workflow = {
    queue_logic: { routing_rules: [], triage_levels: ['Critical', 'Urgent', 'Routine'] },
    billing_rules: { currency: 'USD', tax_rate: 0, payment_methods: ['CASH', 'CARD', 'MPESA'] },
    staff_roles: {},
  };
  const compliance = { isolation_policy: 'logical', data_residency: 'Local', byok_enabled: false };

  const sql: string[] = [];

  // System admins
  for (const a of SYSTEM_ADMINS) {
    sql.push(`
INSERT INTO "system_admins" ("id","name","email","password_hash","updated_at")
VALUES (gen_random_uuid(), ${lit(a.name)}, ${lit(a.email)}, ${lit(hashPassword(a.password))}, ${lit(now)})
ON CONFLICT ("email") DO UPDATE SET "password_hash" = EXCLUDED."password_hash", "name" = EXCLUDED."name", "updated_at" = EXCLUDED."updated_at";`);
  }

  // Global settings
  sql.push(`
INSERT INTO "global_settings" ("id","platform_name","platform_slogan","hero_title","hero_subtitle","hero_cta","show_hero","show_features","feature1_title","feature1_desc","feature1_icon","feature2_title","feature2_desc","feature2_icon","feature3_title","feature3_desc","feature3_icon","paypal_env","updated_at")
VALUES ('singleton', ${lit('AmisiMedOS')}, ${lit('Next-Gen Hospital Intelligence')}, ${lit('Intelligent Healthcare, Everywhere')}, ${lit('A cloud-native, multi-tenant hospital management platform built for Africa.')}, ${lit('Request a Demo')}, true, true,
  ${lit('FHIR R4 Interoperability')}, ${lit('Standards-based patient data exchange across all modules.')}, ${lit('stethoscope')},
  ${lit('Edge-Cloud Hybrid Sync')}, ${lit('Run offline at the hospital, sync to Neon cloud automatically.')}, ${lit('cloud')},
  ${lit('Role-Based Access Control')}, ${lit('Granular permissions for every clinical and administrative role.')}, ${lit('shield')},
  'sandbox', ${lit(now)})
ON CONFLICT ("id") DO NOTHING;`);

  // Plans
  for (const plan of PLANS) {
    sql.push(`
INSERT INTO "plans" ("id","name","code","description","price","currency","billing_cycle","features","max_patients","max_users","max_beds","is_active","updated_at")
VALUES (gen_random_uuid(), ${lit(plan.name)}, ${lit(plan.code)}, ${lit(plan.description)}, ${plan.price}, 'USD', '${plan.billingCycle}', ${jsonb(plan.features)}, ${plan.maxPatients}, ${plan.maxUsers}, ${plan.maxBeds}, true, ${lit(now)})
ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "description" = EXCLUDED."description", "price" = EXCLUDED."price", "features" = EXCLUDED."features", "max_patients" = EXCLUDED."max_patients", "max_users" = EXCLUDED."max_users", "max_beds" = EXCLUDED."max_beds", "updated_at" = EXCLUDED."updated_at";`);
  }

  // Modules
  for (const m of MODULES) {
    sql.push(`
INSERT INTO "modules" ("id","name","code","description","base_price","dependencies","events","permissions","updated_at")
VALUES (gen_random_uuid(), ${lit(m.name)}, ${lit(m.code)}, ${lit(m.description)}, ${m.basePrice}, ${jsonb(m.dependencies)}, ${jsonb(m.events)}, ${jsonb(m.permissions)}, ${lit(now)})
ON CONFLICT ("code") DO UPDATE SET "name" = EXCLUDED."name", "description" = EXCLUDED."description", "base_price" = EXCLUDED."base_price", "dependencies" = EXCLUDED."dependencies", "events" = EXCLUDED."events", "permissions" = EXCLUDED."permissions", "updated_at" = EXCLUDED."updated_at";`);
  }

  // Tenant registration
  sql.push(`
INSERT INTO "tenants" ("id","name","slug","db_url","encryption_key_reference","tier","region","status","enabled_modules","shared_secret","compliance_isolation","facility_type","module_config","subscription_quotas","workflow_customization","updated_at")
VALUES (${lit(tenantId)}, ${lit(p.hospitalName)}, ${lit(p.slug)}, ${lit(p.tenantDbUrl)}, ${lit(keyRef)}, '${p.tier}', 'Local', 'active', ${jsonb(preset)}, ${lit(sharedSecret)}, ${jsonb(compliance)}, '${p.facilityType}', ${jsonb(moduleConfig)}, ${jsonb({ seat_limit: 9999, storage_mb: 100000 })}, ${jsonb(workflow)}, ${lit(now)})
ON CONFLICT ("slug") DO UPDATE SET "name" = EXCLUDED."name", "db_url" = EXCLUDED."db_url", "status" = 'active', "enabled_modules" = EXCLUDED."enabled_modules", "shared_secret" = EXCLUDED."shared_secret", "facility_type" = EXCLUDED."facility_type", "module_config" = EXCLUDED."module_config", "workflow_customization" = EXCLUDED."workflow_customization", "updated_at" = EXCLUDED."updated_at";`);

  // Tenant module entitlements (link module ids to tenant)
  for (const code of preset) {
    sql.push(`
INSERT INTO "tenant_modules" ("id","tenant_id","module_id","is_enabled","updated_at")
SELECT gen_random_uuid(), ${lit(tenantId)}, "id", true, ${lit(now)} FROM "modules" WHERE "code" = ${lit(code)}
ON CONFLICT ("tenant_id","module_id") DO UPDATE SET "is_enabled" = true, "updated_at" = EXCLUDED."updated_at";`);
  }

  // Active subscription linked to the enterprise plan
  sql.push(`
INSERT INTO "subscriptions" ("id","tenant_id","plan_id","status","start_date","end_date","signed_token","auto_renew","updated_at")
SELECT gen_random_uuid(), ${lit(tenantId)}, "id", 'ACTIVE', ${lit(now)}, ${lit(new Date(Date.now() + 10 * 365 * 24 * 3600 * 1000).toISOString())}, ${lit(sharedSecret)}, true, ${lit(now)}
FROM "plans" WHERE "code" = 'ENTERPRISE_YEARLY'
ON CONFLICT DO NOTHING;`);

  runPsql(conn, db, sql.join('\n'));
}

// ─── Tenant-plane seeding ────────────────────────────────────────────────────

interface TenantSeedParams {
  hospitalName: string;
  slug: string;
  adminEmail: string;
  adminName: string;
  adminPassword: string;
}

function seedTenant(conn: PgConnection, db: string, p: TenantSeedParams): void {
  const now = new Date().toISOString();
  const farFuture = new Date(Date.now() + 10 * 365 * 24 * 3600 * 1000).toISOString();
  const sql: string[] = [];

  // Hospital settings
  sql.push(`
INSERT INTO "hospital_settings" ("id","hospital_name","system_status","address","phone","marketing_slogan","contact_email","timezone","ehr_enabled","billing_enabled","lab_enabled","pharmacy_enabled","hr_enabled")
VALUES ('default-settings', ${lit(p.hospitalName)}, 'ACTIVE', ${lit('Local deployment')}, ${lit('')}, ${lit('Excellence in Digital Healthcare')}, ${lit(p.adminEmail)}, 'UTC', true, true, true, true, true)
ON CONFLICT ("id") DO UPDATE SET "hospital_name" = EXCLUDED."hospital_name", "contact_email" = EXCLUDED."contact_email";`);

  // Local subscription
  sql.push(`
INSERT INTO "local_subscription" ("id","plan_code","status","valid_until","grace_period_end","signed_token","last_synced_at")
VALUES ('singleton', 'ENTERPRISE', 'ACTIVE', ${lit(farFuture)}, ${lit(farFuture)}, ${lit(randomBase64Url(48))}, ${lit(now)})
ON CONFLICT ("id") DO NOTHING;`);

  // Staff — seeded admin first with the installer-provided credentials
  const staff = buildStaff(p.slug);
  const adminParts = (p.adminName || 'Hospital Admin').split(' ').filter(Boolean);
  staff.push({
    employeeId: `ADMIN-${p.slug}-0`,
    firstName: adminParts[0] || 'Hospital',
    lastName: adminParts.slice(1).join(' ') || 'Administrator',
    email: p.adminEmail,
    role: 'ADMIN',
    department: 'Administration',
    baseSalary: '0',
    permissions: ['ALL'],
  });

  for (const s of staff) {
    const isSeededAdmin = s.email === p.adminEmail;
    const password = isSeededAdmin ? p.adminPassword : 'Demo@1234';
    sql.push(`
INSERT INTO "employees" ("id","employee_id","first_name","last_name","role","department","permissions","email","password_hash","status","contract_type","base_salary","currency","updated_at")
VALUES (gen_random_uuid(), ${lit(s.employeeId)}, ${lit(s.firstName)}, ${lit(s.lastName)}, '${s.role}', ${lit(s.department)}, ${jsonb(s.permissions)}, ${lit(s.email)}, ${lit(hashPassword(password))}, 'ACTIVE', 'FULL_TIME', ${s.baseSalary}, 'USD', ${lit(now)})
ON CONFLICT ("email") DO UPDATE SET "password_hash" = EXCLUDED."password_hash", "role" = EXCLUDED."role", "department" = EXCLUDED."department", "permissions" = EXCLUDED."permissions", "status" = 'ACTIVE', "updated_at" = EXCLUDED."updated_at";`);
  }

  // Patients
  const patients = buildPatients(p.slug);
  for (const pat of patients) {
    sql.push(`
INSERT INTO "patients" ("id","mrn","first_name","last_name","dob","gender","phone","email","address","updated_at")
VALUES (gen_random_uuid(), ${lit(pat.mrn)}, ${lit(pat.firstName)}, ${lit(pat.lastName)}, ${lit(pat.dob + 'T00:00:00.000Z')}, ${lit(pat.gender)}, ${lit(pat.phone || '')}, ${lit(pat.email || '')}, ${lit(pat.address || '')}, ${lit(now)})
ON CONFLICT ("mrn") DO NOTHING;`);
  }

  // Chart of accounts
  for (const acc of ACCOUNTS) {
    sql.push(`
INSERT INTO "accounts" ("id","code","name","type","updated_at")
VALUES (gen_random_uuid(), ${lit(acc.code)}, ${lit(acc.name)}, ${lit(acc.type)}, ${lit(now)})
ON CONFLICT ("code") DO NOTHING;`);
  }

  // Wards & beds
  for (const ward of WARDS) {
    sql.push(`
DO $$
DECLARE wid TEXT;
BEGIN
  IF NOT EXISTS (SELECT 1 FROM "wards" WHERE "name" = ${lit(ward.name)}) THEN
    INSERT INTO "wards" ("id","name","type","floor") VALUES (gen_random_uuid(), ${lit(ward.name)}, ${lit(ward.type)}, ${ward.floor}) RETURNING "id" INTO wid;
    FOREACH bed IN ARRAY ARRAY[${ward.beds.map((b) => lit(b)).join(',')}]
    LOOP
      INSERT INTO "beds" ("id","ward_id","number","status") VALUES (gen_random_uuid(), wid, bed, 'AVAILABLE');
    END LOOP;
  END IF;
END $$;`);
  }

  // Medications
  for (const med of MEDICATIONS) {
    sql.push(`
INSERT INTO "medications" ("id","name","generic_name","drug_class","unit","dosage_form","updated_at")
VALUES (gen_random_uuid(), ${lit(med.name)}, NULL, ${lit(med.drugClass)}, ${lit(med.unit)}, ${lit(med.dosageForm)}, ${lit(now)})
ON CONFLICT DO NOTHING;`);
  }

  runPsql(conn, db, sql.join('\n'));
}

// ─── Runtime .env generation ─────────────────────────────────────────────────

function buildEnv(
  cfg: InstallConfig,
  appRole: string,
  appRolePassword: string,
  conn: PgConnection,
  controlDb: string,
  tenantDb: string,
  slug: string
): string {
  const controlUrl = `postgresql://${appRole}:${appRolePassword}@${conn.host}:${conn.port}/${controlDb}`;
  const tenantUrl = `postgresql://${appRole}:${appRolePassword}@${conn.host}:${conn.port}/${tenantDb}`;
  const host = cfg.hostname || 'localhost';
  const port = cfg.port || 3000;

  const vars: Record<string, string> = {
    NODE_ENV: 'production',
    PORT: String(port),
    HOSTNAME: host,

    NEON_DATABASE_URL: controlUrl,
    NEON_DIRECT_URL: controlUrl,
    LOCAL_EDGE_DATABASE_URL: tenantUrl,
    LOCAL_EDGE_DIRECT_URL: tenantUrl,
    DATABASE_URL: tenantUrl,

    JWT_SECRET: randomBase64Url(48),
    NEXTAUTH_SECRET: randomBase64Url(48),
    SYNC_SHARED_SECRET: randomSecret(32),
    LOCAL_API_KEY: randomSecret(16),
    CLOUD_MODE: 'false',
    AMISI_SITE_NAME: cfg.hospitalName,

    HOSPITAL_NAME: cfg.hospitalName,
    HOSPITAL_TENANT_ID: slug,
    NEXT_PUBLIC_TENANT_SLUG: slug,
    NEXT_PUBLIC_IS_LOCAL_EDGE_NODE: 'true',
    NEXT_PUBLIC_CLOUD_URL: `http://${host}:${port}`,
  };

  return Object.entries(vars)
    .map(([k, v]) => `${k}=${v}`)
    .join('\n') + '\n';
}
