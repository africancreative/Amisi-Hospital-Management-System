# AmisiMedOS Mobile App — Architecture & Sync Design

Reference implementation: this document describes the **Flutter bedside app**
(`apps/mobile`) as designed and implemented against the AmisiMedOS backend
(`apps/api`, `apps/local-node`, `packages/sync`). It wins over any older mobile
notes.

---

## 1. Design Goals

1. **Offline-first by default.** Zero-connectivity wards must keep working:
   rounds and MAR entry are always accepted locally, never blocked by the network.
2. **LAN-first, cloud-fallback.** When the hospital LAN (local node) is reachable
   it is preferred for speed; the cloud hub is the automatic fallback and the
   final source of truth.
3. **Sub-second feedback.** Optimistic UI — the action renders instantly, the
   sync is async.
4. **Immutable clinical audit.** Every round observation and medication
   administration is timestamped, user-signed, and pushed through the event
   journal.

---

## 2. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FLUTTER APP (apps/mobile)               │
│                                                             │
│  ┌────────────┐  ┌─────────────┐  ┌──────────────────────┐  │
│  │ UI LAYER   │  │ STATE       │  │ SERVICES (change-    │  │
│  │ screens/   │→ │ Provider    │→ │  notifiers)          │  │
│  │ components │  │ Change-     │  │  SyncService         │  │
│  │            │  │ Notifiers   │  │  RoundsService       │  │
│  │            │  │             │  │  MARService          │  │
│  └────────────┘  └──────┬──────┘  │  TenantService       │  │
│                         │         │  AuthState           │  │
│                         │         └─────────┬────────────┘  │
│                         │                   │               │
│                ┌────────▼──────────┐  ┌─────▼────────────┐  │
│                │ LOCAL DATABASE    │  │ NETWORK ROUTER   │  │
│                │ (SQLite/sqflite)  │  │ ConnectivitySvc  │  │
│                │  sync_queue       │  │  LAN→cloud fail- │  │
│                │  patients_cache   │  │  over + Bearer   │  │
│                │  clinical_records │  │  token injection │  │
│                └─────────▲─────────┘  └─────────┬────────┘  │
└──────────────────────────┼──────────────────────┼───────────┘
                           │  HTTPS (3s timeout)  │
              ┌────────────▼──────────────┐      │
              │  LOCAL NODE (LAN)         │      │
              │  apps/local-node          │      │
              │  Postgres + EventJournal  │      │
              └────────────┬─────────────┘      │
                           │  sync engine        │
              ┌────────────▼─────────────┐      │
              │  CLOUD HUB (SaaS)        │◄─────┘
              │  tenant DB + EventJournal│
              └─────────────────────────┘
```

### 2.1 Layer Responsibilities

| Layer | Location (`apps/mobile/lib`) | Responsibility |
|---|---|---|
| UI | `screens/`, `components/` | Touch-first clinical screens (rounds, MAR, dashboard) |
| State | `main.dart` (Provider graph) | Singleton change-notifiers wired to UI |
| Services | `services/` | Sync, rounds, MAR, auth, tenant, connectivity |
| Local store | `services/database_service.dart` | SQLite cache + outbox queue |
| Network | `services/connectivity.dart` | Health-probe routing, LAN-first, token headers |

### 2.2 Technology Choices

| Concern | Choice | Why |
|---|---|---|
| Local storage | `sqflite` + `sqflite_common_ffi` | Works on Android and Windows EXE; FFI for desktop |
| Connectivity | `connectivity_plus` + HTTP health probes | Network interface + real endpoint reachability |
| State | `provider` (ChangeNotifier) | Small surface, fits singleton services |
| HTTP | `dart:io HttpClient` via `NetworkRouter` | No codegen; full header control for tenant slug + JWT |
| Tenant isolation | `x-tenant-slug` header | Server routes to the correct tenant DB |

---

## 3. Connectivity Model (LAN / Cloud)

`ConnectivityService` (`services/connectivity.dart`) maintains a tri-state status:

```
ConnectionStatus = online | degraded | offline | unknown
```

- **LAN-first:** a configured `localIp:port` health probe is tried before the
  cloud probe. A reachable LAN endpoint sets `useLocal=true`.
- **Cloud-only:** LAN unreachable, cloud reachable → `online`, `useLocal=false`.
- **Offline:** both probes fail → writes go to the SQLite outbox only.

`NetworkRouter` uses the best base URL and injects on every request:
- `x-tenant-slug` (multi-tenant routing)
- `Authorization: Bearer <JWT>` (RBAC)

On any request failure against LAN, the router transparently retries against
cloud (`services/connectivity.dart:123-149`).

---

## 4. Offline Data Model (SQLite)

Schema in `DatabaseService` (`services/database_service.dart:36-72`):

### 4.1 `sync_queue` — the Outbox
| Column | Purpose |
|---|---|
| `action_type` | `MAR_ADMINISTER`, `ROUNDS`, `BILL_ITEM`, ... |
| `endpoint` | REST/TRPC path to POST on reconnect |
| `payload` | JSON body (entity data + actor + timestamp) |
| `retry_count` | Incremented on push failure |
| `timestamp` | FIFO ordering |

### 4.2 `patients_cache` — read cache
| Column | Purpose |
|---|---|
| `id` | Patient UUID (PK) |
| `mrn`, `full_name`, `ward`, `bed` | Denormalized for list rendering |
| `data` | Full JSON payload (offline viewing) |

### 4.3 `clinical_records` — offline rounds/MAR history
Append-only log so the bedside nurse can review what was recorded offline.

---

## 5. Sync Logic

### 5.1 The Write Path (every clinical action)

```
User taps "Administer" / "Save vital"
        │
        ▼
performAction(...)  SyncService.performAction()
        │                              │
        │  online?  ──────────yes───►  POST direct via NetworkRouter
        │                              │        (optimistic; on failure ↓)
        │  no / failed                 ▼
        ▼                       enqueue + notifyListeners
addToQueue(sync_queue)          (UI already shows success)
        │
        ▼
UI renders optimistic success immediately
        │
        ▼
background sync flushes queue when connectivity returns
```

Key properties:
- **Optimistic:** the UI is updated locally *before* any network round-trip.
- **Idempotency:** each queued item carries `requestId = mobile_sync_<id>` so a
  server retry after a dropped ACK cannot double-apply (`sync_service.dart:93`).
- **Signed:** every payload gets `timestamp` (ISO8601) and `doctorId` (the
  authenticated actor) before enqueue (`sync_service.dart:111-112`).
- **No data loss:** network failure mid-POST falls back to the outbox, never
  drops the record.

### 5.2 The Sync Loop

`SyncService.start()` (`services/sync_service.dart:26-39`):

```
initial sync on app launch (if authenticated)
        │
Timer.periodic(45s)
        │
  online && !alreadySyncing?
        │
        ▼
    syncAll()
      ├── 1. syncQueue()   push outbox → server (FIFO), remove on 2xx
      └── 2. pullPatients() GET /api/patients/active?limit=100 → refresh cache
```

Push semantics:
1. Read oldest queued item first (`orderBy: timestamp ASC`).
2. Add `requestId`, POST to stored endpoint.
3. On 2xx → delete from queue.
4. On 4xx → log and drop (permanent client error).
5. On 5xx/network → keep in queue, retry next cycle (with `retry_count`).

### 5.3 Conflict Resolution Strategy

Server model (see `packages/db/prisma/tenant.prisma`, `EventJournal` +
`packages/sync`): every mutable entity carries `version Int @default(1)` and
`isSynced Boolean`. Resolution rules:

| Case | Rule |
|---|---|
| Same entity, client version == server version | Apply, bump version |
| Client version < server version (stale write) | **Last-writer-wins** on the field level; round/MAR records are append-only so they conflict-proof |
| Administer / round events (append-only) | Always applied — the clinical event already happened on the device |

Rounds observations and MAR administrations are **immutable append-only** events,
so they are conflict-free by design. Editable entities (e.g. patient profile) rely
on optimistic `version` checks enforced server-side.

### 5.4 Retry & Backoff

The mobile app retries every 45 s while online. The server-side
`PersistentOfflineFallback` (`packages/sync/offline-fallback.ts`) applies
`maxRetries = 10` with `baseRetryDelay = 2000ms` exponential backoff for the
local-node → cloud leg, so the full chain is: device outbox → local node journal
→ cloud journal, each with retry.

### 5.5 Security & Audit

- **Transport:** HTTPS for cloud; bearer JWT per request.
- **Tenant:** `x-tenant-slug` isolates the tenant DB on the server.
- **Audit:** every pushed event lands in `EventJournal` (deviceId, actor,
  signature fields) which mirrors to `AuditLog`/`AuditRecordChange` server-side —
  nothing the app writes is invisible to the audit chain.

---

## 6. Feature Mappings

### 6.1 Clinical Rounds (`services/rounds.dart`)
| Workflow | Offline behavior |
|---|---|
| List wards / ward patients | Cache-first fallback (`database_service.cachePatients`) |
| `startRound` | Enqueued as `ROUNDS` event |
| `addVital` (BP/HR/SpO2/temp/RR) | Enqueued; stepper UI per ClinicalDesignSpec |
| `addNote` | Enqueued with author identity |
| `completeRound` (summary + interventions) | Enqueued, marked for doctor review if flagged |

### 6.2 Medication Tracking / MAR (`services/mar.dart`)
| Workflow | Offline behavior |
|---|---|
| Load scheduled meds for a ward | Pull from server when online; cached list offline |
| `administerMedication` | Optimistic UI → `SyncService.recordMAR` → outbox if offline |
| Vitals snapshot with dose | Attached to the MAR payload for the pre-administration check |

---

## 7. Recommended Evolution

1. **Per-table pull cursor** — store `last_sync_watermark` per entity and use
   `/api/sync/pull` deltas instead of re-fetching `patients/active`.
2. **Server-issued sequence numbers** — align the outbox with the
   `EventJournal.sequenceNumber` (BigInt) for ordered deltas.
3. **Encrypted local at-rest payloads** — wrap the SQLite DB with the tenant's
   `publicKeySpki`/`sharedSecret` (see `packages/sync/cryptography.ts`) for
   HIPAA-grade storage on the device.
4. **Foreground/background scheduling** — `workmanager`/`background_fetch` so the
   45 s timer keeps flushing when the app is backgrounded.
5. **Watchdog purge** — drop `sync_queue` items past the 72 h SLA with a manual
   export path, matching the documented offline window.
