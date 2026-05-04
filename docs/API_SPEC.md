# AmisiMedOS API Specification

## 1. REST API (Next.js API Routes)
All endpoints are prefixed with `/api/v1`.

### Tenant Authentication
- `POST /auth/login`: Authenticate staff.
- `POST /auth/refresh`: Refresh session token.

### Patient Management
- `GET /patients`: List patients (filtered by tenant).
- `POST /patients`: Register new patient.
- `GET /patients/:id`: Get patient profile.
- `PATCH /patients/:id`: Update patient info.

### Triage & Queue
- `GET /triage/queue`: Get current triage queue sorted by severity.
- `POST /triage/entry`: Create new triage entry.
- `PATCH /triage/:id`: Update status (e.g., WAITING -> TREATING).

### EMR (Electronic Medical Records)
- `GET /records/:patientId`: Fetch all medical records.
- `POST /records`: Create a new clinical note/record.

### Admin SaaS
- `GET /admin/tenants`: List all tenants.
- `PATCH /admin/tenants/:id/modules`: Enable/Disable modules for a tenant.

## 2. Event-Driven Sync (WebSockets/gRPC)
Local nodes communicate with the cloud using an Event Stream.

### Event Structure
```json
{
  "eventId": "uuid",
  "tenantId": "uuid",
  "entity": "Patient",
  "action": "UPDATE",
  "timestamp": "ISO8601",
  "payload": { ... },
  "checksum": "sha256"
}
```

### Sync Workflow
1. **Local Write**: Client writes to Local Node DB $\rightarrow$ Local Node emits Event $\rightarrow$ Event stored in `EventLog` (synced=false).
2. **Push**: Local Node pushes `EventLog` entries to Cloud via WebSocket.
3. **Ack**: Cloud processes event $\rightarrow$ Updates Cloud DB $\rightarrow$ Sends Ack back to Local Node.
4. **Finalize**: Local Node marks event as `synced=true`.
5. **Pull**: Local Node fetches missing events from Cloud since last sync timestamp.
