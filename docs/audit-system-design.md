# AmisiMedOS Audit System Design

## Architecture Overview

The audit system provides a **cryptographically verifiable, immutable log** of every action taken within the hospital management system. It is built on three layers:

```
┌─────────────────────────────────────────────────────────┐
│                    Audit System                         │
├──────────────┬──────────────────┬───────────────────────┤
│  Activity    │  Record Change   │  Access & Chat Audit  │
│  Log         │  Snapshots       │  Trail                │
│  (who/did)   │  (before/after)  │  (who/saw/modified)   │
├──────────────┴──────────────────┴───────────────────────┤
│              SHA-256 Hash Chain (Immutable)             │
├─────────────────────────────────────────────────────────┤
│              EventJournal (Sync Layer)                  │
└─────────────────────────────────────────────────────────┘
```

## Design Principles

1. **Immutability**: Hash chain (SHA-256 of `prevHash + canonicalizedEntry`) — any tampering breaks the chain
2. **Completeness**: Every user action, record mutation, and data access is logged
3. **Non-repudiation**: Actor identity (userId, name, role) + IP + session ID
4. **Time-ordered**: UTC timestamps with monotonically increasing sequence numbers
5. **Tenant-isolated**: All audit data scoped to tenant; cross-tenant queries blocked
6. **Performant**: Composite indexes for common audit queries (by actor, by resource, by time window)

---

## Schema Additions

### 1. Enhanced `AuditLog` (modify existing model)

The existing `AuditLog` model is enhanced with session tracking, hash chain, categories, and compliance fields.

```prisma
model AuditLog {
  id               String   @id @default(uuid())
  
  // Actor context
  actorId          String   @map("actor_id")
  actorName        String   @map("actor_name")
  actorRole        String   @map("actor_role")
  sessionId        String?  @map("session_id")     // NEW: ties actions to a login session
  
  // Action details
  action           String   // 'CREATE', 'UPDATE', 'DELETE', 'ACCESS', 'LOGIN', 'LOGOUT', 'EXPORT', 'PRINT', 'SHARE'
  resource         String   // e.g., 'Patient', 'LabOrder', 'Invoice', 'ChatMessage'
  resourceId       String?  @map("resource_id")
  details          Json?    // lightweight metadata (no large payloads)
  
  // Request context
  ipAddress        String?  @map("ip_address")
  userAgent        String?  @map("user_agent")
  department       String?  // NEW: actor's department at time of action
  
  // Timing
  timestamp        DateTime @default(now())
  
  // NEW: Hash chain for immutability
  prevHash         String?  @map("prev_hash")      // SHA-256 of previous entry
  hash             String?  // SHA-256(prevHash + id + action + resource + resourceId + timestamp + actorId)
  chainPosition    BigInt   @default(0) @map("chain_position")  // monotonically increasing
  
  // NEW: Audit category for filtering & retention
  category         String   @default("ACTIVITY")   // 'ACTIVITY', 'AUTH', 'DATA_CHANGE', 'ACCESS', 'CHAT', 'ADMIN', 'BILLING'
  severity         String   @default("INFO")       // 'INFO', 'WARNING', 'CRITICAL'
  
  // NEW: Compliance
  isRetained       Boolean  @default(true) @map("is_retained")  // set false when retention policy expires
  retainUntil      DateTime? @map("retain_until")
  
  @@index([actorId])
  @@index([timestamp])
  @@index([category, timestamp])
  @@index([resource, resourceId])
  @@index([chainPosition])
  @@index([severity])
  @@map("audit_logs")
}
```

### 2. `AuditRecordChange` (new — before/after snapshots)

Tracks the actual data that changed for every CREATE, UPDATE, DELETE on audited entities.

```prisma
model AuditRecordChange {
  id               String   @id @default(uuid())
  
  // Link to parent audit log entry
  auditLogId       String   @map("audit_log_id")
  auditLog         AuditLog @relation(fields: [auditLogId], references: [id])
  
  // Entity being changed
  entityType       String   @map("entity_type")    // 'Patient', 'LabOrder', 'Prescription', etc.
  entityId         String   @map("entity_id")
  
  // Change type
  changeType       String   @map("change_type")    // 'CREATE', 'UPDATE', 'DELETE'
  
  // Snapshots (JSON)
  beforeState      Json?    @map("before_state")   // null for CREATE
  afterState       Json?    @map("after_state")    // null for DELETE
  changedFields    String[] @map("changed_fields") // ['firstName', 'phone', 'insuranceId']
  
  // Who made the change (redundant for query convenience)
  actorId          String   @map("actor_id")
  actorName        String   @map("actor_name")
  
  // When
  timestamp        DateTime @default(now())
  
  @@index([entityType, entityId])
  @@index([actorId, timestamp])
  @@index([changeType, timestamp])
  @@index([timestamp])
  @@map("audit_record_changes")
}
```

### 3. `AuditChatAction` (new — chat message audit trail)

Tracks every modification to chat messages: edits, deletes, forwards, screenshots, exports.

```prisma
model AuditChatAction {
  id               String   @id @default(uuid())
  
  // Link to parent audit log
  auditLogId       String   @map("audit_log_id")
  auditLog         AuditLog @relation(fields: [auditLogId], references: [id])
  
  // Chat context
  messageId        String?  @map("message_id")
  groupId          String?  @map("group_id")
  patientId        String?  @map("patient_id")  // if clinical chat
  
  // Action type
  action           String   // 'EDIT', 'DELETE', 'FORWARD', 'SCREENSHOT', 'EXPORT', 'PIN', 'UNPIN', 'REACT'
  
  // Content audit
  originalContent  String?  @map("original_content") @db.Text  // what was changed FROM
  newContent       String?  @map("new_content") @db.Text      // what was changed TO (for EDIT)
  
  // Who
  actorId          String   @map("actor_id")
  actorName        String   @map("actor_name")
  
  // When
  timestamp        DateTime @default(now())
  
  @@index([messageId])
  @@index([patientId])
  @@index([actorId, timestamp])
  @@index([groupId, timestamp])
  @@index([timestamp])
  @@map("audit_chat_actions")
}
```

### 4. `AuditAccessLog` (new — who viewed what and when)

Tracks record access (view) events for compliance (HIPAA/GDPR).

```prisma
model AuditAccessLog {
  id               String   @id @default(uuid())
  
  // Link to parent audit log
  auditLogId       String   @map("audit_log_id")
  auditLog         AuditLog @relation(fields: [auditLogId], references: [id])
  
  // What was accessed
  resourceType     String   @map("resource_type")   // 'Patient', 'LabOrder', 'Invoice', 'Prescription'
  resourceId       String   @map("resource_id")
  
  // Patient context (if accessing patient-related data)
  patientId        String?  @map("patient_id")
  
  // Access context
  accessReason     String?  @map("access_reason")   // 'TREATMENT', 'BILLING', 'ADMIN', 'AUDIT', 'RESEARCH'
  accessDuration   Int?     @map("access_duration_ms")  // how long the record was viewed
  
  // Who
  actorId          String   @map("actor_id")
  actorName        String   @map("actor_name")
  actorRole        String   @map("actor_role")
  
  // Where
  ipAddress        String?  @map("ip_address")
  
  // When
  timestamp        DateTime @default(now())
  
  @@index([actorId, timestamp])
  @@index([resourceType, resourceId])
  @@index([patientId, timestamp])
  @@index([timestamp])
  @@map("audit_access_logs")
}
```

---

## Hash Chain Implementation

### Chain Initialization

The first entry in the chain uses a genesis hash:

```typescript
const GENESIS_HASH = crypto.createHash('sha256').update('amisimedos-audit-genesis-v1').digest('hex');
```

### Hash Computation

Each entry's hash is computed as:

```typescript
function computeHash(entry: AuditLogEntry, prevHash: string): string {
  const canonical = JSON.stringify({
    prevHash,
    id: entry.id,
    action: entry.action,
    resource: entry.resource,
    resourceId: entry.resourceId,
    actorId: entry.actorId,
    timestamp: entry.timestamp.toISOString(),
  });
  return crypto.createHash('sha256').update(canonical).digest('hex');
}
```

### Chain Verification

```typescript
async function verifyChain(tenantId: string, fromPosition: number = 0): Promise<{ valid: boolean; brokenAt?: bigint }> {
  const entries = await db.auditLog.findMany({
    where: { chainPosition: { gte: BigInt(fromPosition) } },
    orderBy: { chainPosition: 'asc' },
  });
  
  let expectedHash = GENESIS_HASH;
  for (const entry of entries) {
    const computed = computeHash(entry, entry.prevHash!);
    if (computed !== entry.hash) {
      return { valid: false, brokenAt: entry.chainPosition };
    }
    expectedHash = computed;
  }
  return { valid: true };
}
```

---

## Retention Policies

| Category    | Retention | Auto-delete |
|------------|-----------|-------------|
| ACTIVITY   | 2 years   | Yes         |
| AUTH       | 5 years   | No          |
| DATA_CHANGE| 7 years   | No          |
| ACCESS     | 3 years   | Yes         |
| CHAT       | 2 years   | Yes         |
| ADMIN      | 7 years   | No          |
| BILLING    | 7 years   | No          |

Retention job runs daily, marks `isRetained = false` for expired entries (soft delete; actual deletion requires compliance approval).

---

## Server-Side Actions

### `auditAction()` — log any user action

```typescript
'use server';
async function auditAction(params: {
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, unknown>;
  category?: string;
  severity?: string;
  patientId?: string;
  accessReason?: string;
}): Promise<AuditLogEntry>
```

### `recordChange()` — capture before/after snapshot

```typescript
'use server';
async function recordChange(params: {
  entityType: string;
  entityId: string;
  changeType: 'CREATE' | 'UPDATE' | 'DELETE';
  beforeState?: Record<string, unknown>;
  afterState?: Record<string, unknown>;
  changedFields?: string[];
}): Promise<void>
```

### `verifyAuditChain()` — verify integrity

```typescript
'use server';
async function verifyAuditChain(fromPosition?: number): Promise<{ valid: boolean; brokenAt?: bigint; totalEntries: number }>
```

---

## Client-Side Components

### `AuditLogViewer` — admin audit log panel

- Filter by actor, resource, date range, category, severity
- Expand entries to see details and related record changes
- Chain verification indicator
- Export to PDF/CSV

### `RecordHistory` — per-record audit timeline

- Attached to patient charts, lab orders, prescriptions
- Shows chronological list of all changes
- Diff view for field-level changes

### `ChatAuditIndicator` — message audit badge

- Shows "Edited", "Deleted" badges on messages
- Hover tooltip shows edit history
