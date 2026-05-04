# AmisiMedOS System Architecture

## Overview
AmisiMedOS is a hybrid-cloud, multi-tenant hospital operating system designed for high availability and offline resilience.

## High-Level Architecture
### 1. Hybrid-Cloud Model
- **Cloud Layer**: Centralized authority, multi-tenant management, global backup, and cross-facility analytics.
- **Local Node (Edge)**: Deployed on the hospital LAN using Tauri. Handles real-time operations, EMR access, and triage.
- **Sync Engine**: Asynchronous event-driven synchronization using WebSockets and a write-ahead log (WAL) for offline resilience (72h).

### 2. Multi-Tenancy
- **Database Isolation**: Schema-based isolation or tenant-id partitioning in PostgreSQL.
- **Modular Activation**: Tenants can enable/disable modules (e.g., Pharmacy, HR) via the Admin SaaS panel.

### 3. Event-Driven Core
- All state changes are emitted as events.
- Local Node processes events immediately and queues them for Cloud sync.
- Cloud Node reconciles events and updates the global state.

## Component Stack
- **Frontend/API**: Next.js (React, TypeScript, Tailwind CSS)
- **Desktop Node**: Tauri (Rust core, Next.js frontend)
- **Mobile**: Flutter
- **Database**: PostgreSQL (Cloud + Local)
- **Real-time**: WebSockets (Socket.io / WS)
- **Communication**: gRPC / REST / WebSockets

## Module Breakdown
- **Patient Management**: Core identity and demographic data.
- **Queue & Triage**: Severity-based routing (Emergency -> Urgent -> Routine).
- **EMR**: Clinical notes, prescriptions, and history.
- **Chat**: Secure, patient-linked communication.
- **Lab & Diagnostics**: Integration with lab equipment and report management.
- **Pharmacy & Inventory**: Medication tracking and stock alerts.
- **Billing & Finance**: Invoice generation and insurance claims.
- **HR & Staff**: Rota management and payroll.
- **Admin SaaS**: Tenant provisioning and module management.
