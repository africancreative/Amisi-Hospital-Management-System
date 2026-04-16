# AmisiMedOS Monorepo

Welcome to the **AmisiMedOS Distributed Health Infrastructure**. This monorepo houses the complete suite of applications and shared services for a modern, scalable, and resilient hospital management ecosystem.

## 🚀 Architecture Overview

AmisiMedOS is built as a high-performance monorepo using **Turborepo** and **PNPM**, designed for both cloud-native and edge-capable deployments.

### Applications (`apps/`)
- **`web`**: Premium SaaS Managed Portal (Next.js 16+ / React 19).
- **`api`**: Distributed Cloud Hub (Express / Node.js).
- **`desktop`**: Clinical Edge Node (Tauri / Node.js).
- **`mobile`**: Bedside Nursing Assistant (Flutter).

## 🚀 SaaS Infrastructure & Routing

AmisiMedOS uses **Path-Based Multi-Tenancy**. Each hospital instance is resolved via its URL slug.
- **URL Pattern**: `https://amisigenuine.com/[hospital-slug]`
- **Local Dev**: `http://localhost:3000/amisi-premier`

## 🔑 Access Credentials (Dev/Demo)

### System Administration (Control Plane)
- **URL**: `http://localhost:3000` (Access via padlock icon in footer)
- **Email**: `admin@amisigenuine.com`
- **Password**: `admin123`

### Demo Hospital (Clinical Node)
- **URL**: `http://localhost:3000/amisi-premier`
- **Nursing Account**: `nurse@demo.com` / `nurse123`
- **Physician Account**: `doctor@demo.com` / `doctor123`
- **Branch Admin**: `admin@demo.com` / `admin123`

## 🛠 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (v22+)
- [PNPM](https://pnpm.io/) (v9+)
- [Neon.tech](https://neon.tech) account (Cloud) or [PostgreSQL](https://www.postgresql.org/) (Local Edge)

### Installation & Provisioning
```bash
pnpm install
# Provision the SaaS Hub and Demo Hospital
pnpm db:seed:system
pnpm db:seed:demo
```

### Development
```bash
pnpm dev
```

## 🔒 Security & Compliance
AmisiMedOS is designed for HIPAA/GDPR compliance:
- **AES-256-GCM Envelope Encryption** for all clinical PII.
- **Immutable Audit Chain** with SHA-256 hashing.
- **Sovereign KMS** orchestration for hospital data shards.

## 🏛 License
Private and Confidential. © 2026 AmisiMedOS Group.
