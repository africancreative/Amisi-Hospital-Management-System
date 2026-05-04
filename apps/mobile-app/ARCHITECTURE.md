# Flutter App Structure for AmisiMedOS

Since the mobile app is built with Flutter, the following architecture is implemented to ensure offline-first capability and multi-tenant support.

## 1. Directory Structure
```text
lib/
├── core/
│   ├── constants/
│   ├── network/          # Dio + WebSocket Client
│   └── sync/             # Offline Sync Manager
├── data/
│   ├── models/           # Patient, Visit, Event models
│   ├── repositories/     # Abstract Data Layer
│   └── sources/
│       ├── local/        # SQLite (sqflite) for offline storage
│       └── remote/       # API Client for Cloud/Local Node
├── domain/
│   ├── entities/
│   └── usecases/         # Business Logic (e.g., StartVisit)
└── presentation/
    ├── bloc/             # State Management
    ├── screens/
    │   ├── auth/
    │   ├── dashboard/
    │   └── emr/
    └── widgets/
```

## 2. Offline-First Strategy
- **Local Store**: Uses `sqflite` to cache the current patient and active queue.
- **Sync Manager**:
  - Intercepts all writes $\rightarrow$ Saves to local `events` table.
  - Background worker attempts to push `events` to the nearest available endpoint (LAN Local Node first, then Cloud API).
  - Implements exponential backoff for failed syncs.
- **Connectivity Listener**: Uses `connectivity_plus` to switch between `LAN_MODE` and `CLOUD_MODE` automatically.

## 3. Multi-tenancy
- The app requests a `tenantId` during the first login.
- All API requests include the `X-Tenant-ID` header.
- Local database is partitioned by `tenantId` to support multiple tenant accounts on one device.
