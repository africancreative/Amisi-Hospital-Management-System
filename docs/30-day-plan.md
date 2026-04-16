# 30-Day Hospital Deployment Plan

## Executive Summary
**Goal**: Production-ready local hospital deployment  
**Timeline**: 30 days (4 sprints x 7 days)  
**Team**: 3 developers + 1 QA + CTO (you)

---

## Sprint 1: Local Node Foundation (Days 1-7)

### Week 1 - Core Infrastructure

| Day | Task | Owner | Deliverable |
|-----|------|-------|--------------|
| 1-2 | Tauri desktop shell setup | Dev1 | Runnable .exe |
| 2-3 | Express API server (0.0.0.0 binding) | Dev1 | API responds on LAN |
| 3-4 | PostgreSQL schema finalization | Dev2 | All tables created |
| 4-5 | Security middleware (CORS, rate limit, API key) | Dev2 | Security config |
| 5-6 | Local Node installer script | Dev3 | One-click install |
| 7 | **Sprint 1 Review** | All | Demo: Local Node running |

**Sprint 1 Goal**: Self-contained desktop app with working API

---

## Sprint 2: Patient System Core (Days 8-14)

### Week 2 - Patient Management

| Day | Task | Owner | Deliverable |
|-----|------|-------|--------------|
| 8-9 | Patient CRUD API | Dev1 | Create/Read/Update/Delete |
| 9-10 | Patient search (MRN, name, phone) | Dev1 | Search endpoints |
| 10-11 | Encounter workflow (OPD/ED/IPD) | Dev2 | Full workflow |
| 11-12 | Clinical notes per encounter | Dev2 | Notes + Chat |
| 12-13 | Vitals recording | Dev3 | Vitals CRUD |
| 13-14 | **Sprint 2 Review** | All | Demo: Patient registration → encounter |

**Sprint 2 Goal**: Complete patient journey from registration to discharge

---

## Sprint 3: Billing & Payments (Days 15-21)

### Week 3 - Financial System

| Day | Task | Owner | Deliverable |
|-----|------|-------|--------------|
| 15-16 | Bill items auto-generation | Dev1 | Each clinical step bills |
| 16-17 | Invoice generation | Dev1 | Invoice API |
| 17-18 | Payment recording (cash, M-Pesa) | Dev2 | Payment endpoints |
| 18-19 | Receipt printing (Thermal + A4) | Dev2 | Print HTML |
| 19-20 | Subscription validation | Dev3 | SaaS billing |
| 20-21 | Read-only mode after expiry | Dev3 | License check |
| 21 | **Sprint 3 Review** | All | Demo: Patient → Invoice → Receipt |

**Sprint 3 Goal**: End-to-end billing with payment and printing

---

## Sprint 4: Sync & Deployment (Days 22-30)

### Week 4 - Cloud Sync & Go-Live

| Day | Task | Owner | Deliverable |
|-----|------|-------|--------------|
| 22-23 | Event journal CDC extension | Dev1 | Auto-log all changes |
| 23-24 | Cloud push sync | Dev1 | Edge → Cloud |
| 24-25 | Cloud pull sync | Dev2 | Cloud → Edge |
| 25-26 | Offline queue + retry logic | Dev2 | Offline support |
| 26-27 | Connectivity auto-switch | Dev3 | LAN ↔ Cloud |
| 27-28 | Bootstrap recovery | Dev3 | Full data recovery |
| 29 | **Staging QA** | QA | Full system test |
| 30 | **GO-LIVE** | All | First hospital deployment |

**Sprint 4 Goal**: Production-ready with cloud sync

---

## Risk Mitigation

| Risk | Mitigation |
|------|------------|
| PostgreSQL on Windows | Use bundled PostgreSQL or Docker |
| M-Pesa sandbox access | Mock in demo mode |
| Network firewall | Document required ports |
| Data migration | Bootstrap from cloud if empty |

---

## Daily Standup Format (15 min)

```
1. What did you do yesterday?
2. What will you do today?
3. Any blockers?
```

---

## Key Milestones

| Day | Milestone |
|-----|-----------|
| Day 7 | Local Node runs on LAN |
| Day 14 | Patient system complete |
| Day 21 | Billing + printing works |
| Day 30 | **Production deployment** |

---

## Success Criteria

- [ ] Desktop app installs in <5 min
- [ ] API responds on LAN IP
- [ ] Complete patient workflow
- [ ] Invoice → Receipt generation
- [ ] Offline mode queues requests
- [ ] Sync recovers after network restore

---

## Quick Start (Day 1)

```bash
# Dev environment
npm install
npm run desktop:dev

# Build
npm run desktop:build

# Run installer
node apps/desktop/scripts/install.js --hospital "Test Hospital"
```

Let's build this. 🚀