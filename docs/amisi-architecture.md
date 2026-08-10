# AmisiMedOS Architecture Design

Reference implementation: this document describes the **actual** system as implemented
in the repository. Where a design decision conflicts with an older design note
(e.g. `docs/TenantIsolation.md`, `docs/ARCHITECTURE.md`), this document wins.

---

## 1. System Architecture

### 1.1 Deployment Topology

```
                           ┌───────────────────────────────┐
                           │         CONTROL PLANE         │
                           │  (Vercel / Next.js, tRPC+REST)│
                           │                               │
                           │  control.prisma ──► Neon PG   │
                           │  (NEON_DATABASE_URL)          │
                           └───────────────┬───────────────┘
                                           │ HTTPS / wss   │
              ┌────────────────────────────┼───────────────────────────┐
              │                            │                           │
   ┌──────────▼─────────┐      ┌───────────▼─────────┐   ┌────────────▼──────────┐
   │   CLOUD TENANT     │      │  CLOUD API / SaaS   │   │  CLOUD TENANT         │
   │  postgres (dbUrl)  │      │  analytics, admin   │   │  postgres (dbUrl)     │
   │  tenant.prisma     │      │  control client     │   │  tenant.prisma        │
   └──────────┬─────────┘      └─────────┬───────────┘   └───────────┬───────────┘
              │ HTTPS / wss               │ HTTPS / wss               │ HTTPS / wss
              │  sync engine              │  sync engine              │  sync engine
   ┌──────────▼─────────┐                │                 ┌─────────▼───────────┐
   │  LOCAL NODE        │                │                 │  LOCAL NODE         │
   │  apps/local-node   │                │                 │  apps/local-node    │
   │  Postgres + WAL    │                │                 │  Postgres + WAL     │
   └──────────┬─────────┘                │                 └─────────┬───────────┘
              │ LAN                     │                            │ LAN
   ┌──────────▼─────────┐    ┌──────────▼─────────┐      ┌──────────▼──────────┐
   │  WEB (Next.js)     │    │  DESKTOP (Win)     │      │  MOBILE (Flutter)   │
   │  browser staff     │    │  apps/desktop      │      │  apps/mobile        │
   └────────────────────┘    └────────────────────┘      │  (offline queue)    │
                                                          └─────────────────────┘
```

### 1.2 Multi-Tenancy: Database-per-Tenant (not schema-per-tenant)

Older notes describe schema-per-tenant isolation. The shipped implementation uses a
**separate PostgreSQL database per tenant**, routed at runtime.

- Control plane DB: `packages/db/prisma/control.prisma`, datasource `NEON_DATABASE_URL`.
  Owns `Tenant` (incl. `dbUrl`, `encryptionKeyReference`, `enabledModules`,
  `queueConfig`, `billingConfig`, `staffRoles`, `publicKeySpki`, `sharedSecret`),
  `Module`, `Plan`, `Subscription`, `SyncNode`, feature flags, usage, audit.
- Tenant DBs: `packages/db/prisma/tenant.prisma` (~130 models), provisioned
  per tenant with full clinical/billing/HR/chat/imaging schemas.
- Runtime resolution: the API layer reads `x-tenant-id` and constructs/selects a
  tenant client (`packages/db/generated/tenant-client`) bound to that tenant's
  `dbUrl`. No `WHERE tenant_id = ?` is needed in tenant queries — isolation is at
  the connection boundary.
- Benefits: hard data boundary per facility, per-tenant backup/restore (`pg_dump`),
  clean offboarding (`DROP DATABASE`), per-tenant migration rollout, and per-tenant
  encryption key reference.

### 1.3 Component Stack

| Layer | Technology | Where |
|---|---|---|
| SaaS + API | Next.js (App Router), tRPC + REST catch-all | `apps/web`, `apps/api`, `apps/cloud-api` |
| Local node | Next.js service, Postgres, WAL | `apps/local-node` |
| Desktop | Tauri/Windows distributable | `apps/desktop` |
| Mobile | Flutter (Android APK + Windows EXE) | `apps/mobile` |
| Legacy RN | Expo (kept, not actively shipped) | `apps/mobile-app` |
| Admin panel | Next.js | `apps/admin-panel` |
| DB layer | Prisma clients (control + tenant) | `packages/db` |
| Sync engine | TS, journal + replication + offline fallback | `packages/sync` |
| Payments | M-Pesa, PayPal integrations | `packages/sync/mpesa.ts`, `paypal.ts` |
| Crypto | E2E key pair + shared secret per tenant | `packages/sync/crypto.ts`, `cryptography.ts` |

---

## 2. Database Schema

### 2.1 Control Plane — `control.prisma` (global SaaS registry)

| Model | Purpose |
|---|---|
| `Tenant` | One row per facility. Carries `dbUrl`, `encryptionKeyReference`, `enabledModules`, `queueConfig`, `billingConfig`, `staffRoles`, `publicKeySpki`, `sharedSecret` |
| `Module` / `TenantModule` | Feature catalog + per-tenant activation |
| `Plan` / `Subscription` / `SystemPayment` | Billing tiers, subscription lifecycle, SaaS payments |
| `SystemAdmin` / `SystemUser` | Operator identities |
| `PatientIndex` | Cross-tenant patient dedup/biometric registry (identity, not PHI) |
| `TenantUsage` | Metering for quotas/billing |
| `SyncNode` | Registered nodes per tenant (cloud, local, mobile) |
| `FeatureFlag` / `FeatureFlagOverride` / `TenantFeatureFlag` | Progressive delivery + per-tenant flags |
| `TenantConfigAuditLog` | Audit of control-plane config changes |
| `Lead` / `CommunicationLog` / `Task` | Sales pipeline + outbound comms + ops tasks |

### 2.2 Tenant Plane — `tenant.prisma` (per-facility operational schema)

Grouped by domain:

- **Identity & compliance**: `Patient`, `HospitalSettings`, `RecordVersion`,
  `ReleaseRequest`, `ConsentForm`, `RecordAccessGrant` — audit on record release.
- **Clinical**: `Encounter`, `EncounterNote`, `EncounterChat`, `Visit`,
  `ClinicalNote`, `Diagnosis`, `Allergy`, `Vitals`, `PatientTimelineEvent`,
  `Prescription`, `PrescriptionItem`, `Medication`, `DispensingRecord`,
  `DispensingLog`, `DrugInteraction`, `MedicationAdministration`.
- **Wards & flow**: `Ward`, `Bed`, `Admission`, `AdtTransferEvent`
  (admit/discharge/transfer log).
- **Lab, radiology, procedures**: `DiagnosticOrder`, `DiagnosticResult`, `LabOrder`,
  `LabSample`, `LabResult`, `LabReport`, `RadiologyOrder`, `ImagingStudy`,
  `DicomSeries`, `DicomInstance`, `RadiologyReport`, `SurgeryRequest`, `OTSchedule`,
  `SurgeryPreOp/IntraOp/PostOp`.
- **Specialty**: `ICUMonitoring`, `VitalsLog`, `OncologyTreatment`, `ChemoSession`,
  `MaternityRecord`, `DeliveryLog`.
- **Pharmacy & inventory**: `InventoryItem`, `PharmacyInventory`, `InventoryLocation`,
  `InventoryBin`, `InventoryBatch`, `StockMovement`, `StockAlert`,
  `VendorCatalogItem`, `PurchaseOrder(Item)`, `GRN(Item)`, `AssetMaintenance`.
- **Billing & accounting (IFRS)**: `Invoice`, `BillItem`, `Payment`, `PaymentAllocation`,
  `Account`, `JournalEntry`, `JournalLine`, `TaxProfile`, `PricingRule`.
- **HR & payroll**: `Employee`, `ShiftSchedule`, `AttendanceLog`, `LeaveRequest`,
  `PayrollRecord`, `Payslip`.
- **Chat (3 channels)**: `ChatMessage` (patient-linked, with `isClinical`,
  `isSystemGenerated`, attachments, reply threads, read receipts), `UserChatMessage`
  + `ChatGroup`/`ChatMember`/`InternalAttachment`/`ChatMessageReadReceipt`
  (staff-to-staff, direct/group, expiry), `EncounterChat` (encounter-scoped).
- **Sync plumbing**: `EventJournal`, `SyncQueue`, `LocalSyncQueue`, `CloudSyncJournal`,
  `SyncMetadata`, `SyncNode`, `ChangeLog`.
- **Audit**: `AuditLog`, `AuditRecordChange`, `AuditChatAction`, `AuditAccessLog`.

### 2.3 Cross-Cutting Schema Conventions

- Every mutable entity carries `version Int @default(1)` and
  `isSynced Boolean @default(false)` — optimistic concurrency + sync dirty flag.
- IDs are UUIDs; all timestamps UTC (`created_at`, `updated_at`).
- Money is `Decimal(10,2)` + `currency` (never float); line-level tax/discount/
  exemption on `BillItem`.
- All models are snake_case-mapped via `@@map` for Postgres.

---

## 3. API Design

The Next.js App Router exposes two surfaces in `apps/web/src/app/api`:

- `api/trpc/[trpc]/route.ts` — **tRPC** procedures for typed internal clients.
- `api/[[...path]]/route.ts` — **REST catch-all** for external/mobile/desktop
  consumers (`/api/v1/*` style routing).

### 3.1 Auth & Tenant Resolution

- Staff authenticate → session cookie (web) / bearer token (mobile, desktop).
- Tenant is resolved from `x-tenant-id` header + verified against the control plane;
  the request handler binds the matching tenant Prisma client.
- Roles come from the tenant's `staffRoles` config; module access is gated by the
  tenant's `enabledModules`.

### 3.2 Core REST Surface (as implemented)

| Method | Path | Purpose |
|---|---|---|
| POST | `/auth/login`, `/auth/refresh` | Staff auth |
| GET/POST | `/patients` | Register / list (by tenant) |
| GET/PATCH | `/patients/:id` | Profile read / update |
| POST | `/triage/entry`, GET `/triage/queue`, PATCH `/triage/:id` | Queue & severity routing |
| GET/POST | `/records/:patientId` | Clinical records |
| POST | `/encounters` | Open encounter / visit |
| POST | `/invoices`, POST `/invoices/:id/payments` | Bill at any stage |
| POST | `/prescriptions`, POST `/dispensing` | Pharmacy |
| GET/POST | `/chat/messages` (patient) , `/chat/user-messages` (staff) | 3 chat channels |
| GET/POST | `/sync/outbox`, `/sync/pull` | Node sync (see §4) |

### 3.3 Event / Sync Payload (used by `packages/sync`)

```jsonc
{
  "eventId": "uuid",
  "tenantId": "uuid",
  "entity": "Patient",          // table name
  "action": "UPDATE",            // CREATE | UPDATE | DELETE
  "version": 3,                  // optimistic concurrency
  "timestamp": "ISO8601",
  "payload": { ... },
  "checksum": "sha256"
}
```

### 3.4 Client SDKs

- Web uses tRPC procedures.
- Flutter (`apps/mobile`) calls the REST catch-all and enqueues to the local
  SQLite outbox for offline resilience (see `packages/sync/offline-fallback.ts`).
- Local node (`apps/local-node`) speaks to cloud via the sync engine; it exposes
  LAN endpoints served to in-hospital web/desktop clients.

---

## 4. Data Flow

### 4.1 Patient Journey (billing at any stage)

```
Register ──► Triage ──► Encounter ──► Visit / Admit (Ward/Bed)
   │           │          │  │            │
   │           │          │  ├─► BillItem  (consultation/lab/pharmacy/procedure)
   │           │          │  │      └──► Invoice (OPEN) ──► Payment ─► PaymentAllocation
   │           │          │  │             │  (partial → PARTIAL; full → PAID)
   │           │          │  │             └─► JournalEntry/Line (IFRS)
   │           │          │  └─► Prescription ─► Dispensing ─► Inventory stock -1
   │           │          │       └─► MedicationAdministration (MAR)
   │           │          └─► LabOrder ─► LabSample ─► LabResult ─► Report
   │           │          └─► ImagingOrder ─► Study ─► Series/Instance ─► Report
   └───────────┴──► Payments accepted at any step (cash/card/insurance/mobile_money)
```

Key property: **invoices are not tied to checkout** — `BillItem` attaches to the
`Visit` (and optionally `Encounter`/`Invoice`), so items accrue continuously and can
be paid in full, partially, or via insurance (`payerType`, `preAuthCode`), all
allocated per bill-item via `PaymentAllocation`.

### 4.2 Sync Flow (Local ⇄ Cloud)

```
1. WRITE      Client (web/desktop/mobile) writes to Local Node Postgres
              (mobile writes to local SQLite outbox while offline).
2. JOURNAL    packages/sync writes an EventJournal row (synced=false, version=n).
3. PUSH       replication-worker pushes outbox → Cloud via HTTPS/wss.
4. ACK        Cloud applies event to tenant DB, runs resolver,
              returns ack with checksum. Local marks event synced=true.
5. PULL       Local node pulls missing events since last sync marker
              (CloudSyncJournal/SyncMetadata) → applies → resolves conflicts.
6. RESOLVE    resolver.ts + backoff.ts handle conflicts/retries; offline-fallback
              queues when unreachable; recovery.ts replays on reconnect.
```

### 4.3 Resilience & Compliance

- **Offline**: 72h write-ahead journal; mobile SQLite outbox; status-poller +
  connectivity detection (`connectivity.ts`, `connectivity-auto.ts`).
- **Consistency**: `version` for optimistic locking; `checksum` per event;
  `purge-worker` prunes acknowledged journal entries.
- **E2E encryption**: per-tenant `publicKeySpki`/`sharedSecret` + `cryptography.ts`;
  at-rest keys referenced via `encryptionKeyReference`.
- **Audit**: every clinical/chat/config change is mirrored to audit tables
  (`AuditRecordChange`, `AuditChatAction`, `AuditAccessLog`, `TenantConfigAuditLog`).
- **Release compliance**: `ReleaseRequest`/`ConsentForm`/`RecordAccessGrant` gate
  record access; `RecordVersion` pins released snapshots.

---

## 5. Deployment Notes

- Vercel **12-serverless-function** limit: the catch-all `/api/[[...path]]` and
  tRPC route keep function count minimal for `apps/web` (each app is deployed
  separately; heavy logic lives in `apps/api` / `apps/cloud-api`).
- Local node and desktop bundle a local Postgres (WAL) — deployable to the
  hospital Windows/Linux server as a single unit.
- Mobile ships as a tenant-branded APK (AmisiMedOS logo) with the Windows EXE for
  server consoles; both sync through the tenant's local or cloud node.
