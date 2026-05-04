# AmisiMedOS: Multi-Tenant Isolation Strategy

This document outlines the technical implementation of strict data isolation across tenants in the AmisiMedOS platform.

## 🛡️ Isolation Principle: Schema-per-Tenant

To ensure the highest level of security, compliance (HIPAA/GDPR), and performance, AmisiMedOS utilizes a **Schema-per-Tenant** isolation model on PostgreSQL.

### Why Schema-per-Tenant?
1.  **Strict Security**: Database users can be restricted to specific schemas, preventing accidental cross-tenant data leaks at the connection level.
2.  **Simplified Development**: Developers write standard queries without needing to append `WHERE tenant_id = ?` to every single statement.
3.  **Ease of Migration**: Schema changes can be rolled out per tenant, allowing for "Canary" deployments of database migrations.
4.  **Performance**: Smaller indexes and tables per tenant improve query execution plans.

---

## 🛠️ Implementation Workflow

### 1. Tenant Provisioning
When a new facility signs up, the **Control Plane** executes:
```sql
CREATE SCHEMA "tenant_hosp_123";
SET search_path TO "tenant_hosp_123";
-- Execute Drizzle/Prisma migration scripts here
```

### 2. Connection Pooling & Routing
The `packages/db` layer implements a **Tenant Connection Factory**.

```typescript
async function getTenantClient(tenantId: string) {
  const schemaName = `tenant_${tenantId}`;
  const client = await pool.connect();
  
  // Set the search path for the current session
  await client.query(`SET search_path TO ${schemaName}`);
  
  return drizzle(client);
}
```

### 3. Global Control Plane
Data that is shared across all tenants (e.g., global SNOMED codes, subscription tiers, system logs) resides in the `public` schema.

---

## 🔐 Data Ownership & Privacy

- **Encryption at Rest**: Every tenant's data is stored in encrypted volumes.
- **Data Portability**: Since each tenant has their own schema, exporting a full facility record is as simple as a `pg_dump` of their specific schema, natively supporting GDPR "Right to Data Portability."
- **Tenant Deletion**: Offboarding a tenant involves a simple `DROP SCHEMA`, ensuring no orphaned data remains in shared tables.

---

## 📊 Comparison with Column-Level Isolation

| Feature | Schema-per-Tenant (AmisiMedOS) | Column-Level Isolation (Shared Table) |
| :--- | :--- | :--- |
| **Security Risk** | Low (Logical separation) | High (Developer error in `WHERE` clause) |
| **Maintenance** | Medium (Multiple schemas) | Low (Single schema) |
| **Performance** | High (Small tables/indexes) | Medium (Large tables/indexes) |
| **Compliance** | Superior (Clear data boundaries) | Adequate |
