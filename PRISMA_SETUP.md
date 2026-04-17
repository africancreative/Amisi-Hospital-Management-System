# Prisma Multi-Tenant Setup Guide

This document explains how the Prisma multi-tenant database configuration works and how to troubleshoot common issues.

## Architecture

AmisiMedOS uses a **multi-tenant Prisma setup** with two separate database schemas:

1. **Control Plane** (`@prisma/control-client`)
   - Source: `packages/db/prisma/control.prisma`
   - Output: `packages/db/node_modules/@prisma/control-client`
   - Purpose: Platform administration, tenant registry, subscriptions
   - Database: Neon (production)

2. **Tenant Client** (`@prisma/tenant-client`)
   - Source: `packages/db/prisma/tenant.prisma`
   - Output: `packages/db/node_modules/@prisma/tenant-client`
   - Purpose: Hospital-specific clinical data
   - Database: Dynamic per tenant (can be Neon or edge databases)

## Build Process

### Local Development

```bash
# From project root
pnpm install              # Installs all dependencies
pnpm build               # Builds all packages including Prisma clients
pnpm dev                 # Runs development server
```

The `postinstall` hook automatically generates the Prisma clients when dependencies are installed.

### Vercel Deployment

The web app's build process (`apps/web/package.json`):

1. **Build Dependencies**: Builds the db package and other dependencies
   ```bash
   pnpm --filter @amisimedos/db build
   pnpm --filter @amisimedos/ui build
   pnpm --filter @amisimedos/sync build
   pnpm --filter @amisimedos/chat build
   ```

2. **Validate Prisma Setup**: Checks that binaries are present
   ```bash
   node scripts/validate-prisma-setup.js
   ```

3. **Copy Engine Binaries**: Copies Prisma query engines to the web app
   ```bash
   node scripts/vercel-engine-hack.js
   ```
   This copies from `packages/db/node_modules/@prisma/*` to `apps/web/node_modules/@prisma/*`

4. **Build Next.js**: Creates the optimized build
   ```bash
   next build
   ```

## Common Issues & Solutions

### Error: "Query Engine for runtime 'rhel-openssl-3.0.x' not found"

**Cause**: Prisma query engine binaries are not in the expected location.

**Solutions**:

1. **Local Development**
   ```bash
   # Ensure db package is built
   pnpm --filter @amisimedos/db build
   
   # Verify binaries exist
   ls packages/db/node_modules/@prisma/*/libquery_engine-rhel-openssl-3.0.x.so.node
   
   # If missing, regenerate
   pnpm --filter @amisimedos/db db:generate
   ```

2. **Vercel Deployment**
   - Ensure `binaryTargets = ["native", "rhel-openssl-3.0.x"]` in both Prisma schemas
   - Check that `outputFileTracingIncludes` in `next.config.ts` includes all Prisma paths
   - Verify `serverExternalPackages` includes Prisma packages

### Error: "Module not found: @prisma/control-client"

**Cause**: The Prisma client packages are not installed in `packages/db/node_modules`.

**Solution**:
```bash
# From project root
pnpm install
pnpm --filter @amisimedos/db build
```

### Connection Issues in Production

**Cause**: Environment variables not set or Prisma clients not initialized properly.

**Solutions**:

1. **Check Environment Variables**
   ```bash
   # In Vercel Dashboard → Project Settings → Environment Variables
   # Ensure these are set:
   # - NEON_DATABASE_URL (control plane)
   # - LOCAL_EDGE_DATABASE_URL (optional, for edge caching)
   # - SYNC_SHARED_SECRET (optional, for replication)
   ```

2. **Verify Prisma Initialization**
   - The `prisma-init.ts` module automatically configures engine paths
   - Check server logs for `[Prisma Init]` messages

## File Structure

```
packages/db/
├── prisma/
│   ├── control.prisma          # Control plane schema
│   ├── tenant.prisma           # Tenant database schema
│   └── migrations/             # Database migrations (git-tracked)
├── src/
│   ├── client.ts               # Prisma client initialization (exports db, getControlDb, getTenantDb)
│   ├── prisma-init.ts          # Engine path configuration
│   ├── config.ts               # Database URL configuration
│   └── types.ts                # Exported types
├── node_modules/
│   └── @prisma/
│       ├── control-client/     # Generated control plane client
│       └── tenant-client/      # Generated tenant client
└── package.json

apps/web/
├── scripts/
│   ├── vercel-engine-hack.js   # Copies Prisma binaries to web node_modules
│   └── validate-prisma-setup.js # Validates Prisma setup
├── next.config.ts              # Configures file tracing and externals
└── package.json
```

## Key Configuration Files

### `packages/db/prisma/control.prisma`
- Defines the control plane schema
- Must have: `binaryTargets = ["native", "rhel-openssl-3.0.x"]`
- Outputs to: `../node_modules/@prisma/control-client`

### `packages/db/prisma/tenant.prisma`
- Defines the tenant data schema
- Must have: `binaryTargets = ["native", "rhel-openssl-3.0.x"]`
- Outputs to: `../node_modules/@prisma/tenant-client`

### `apps/web/next.config.ts`
- **serverExternalPackages**: Prevents bundling of Prisma clients
- **outputFileTracingIncludes**: Ensures binaries are copied to `.next` build output
- **transpilePackages**: Transpiles monorepo packages for Next.js

### `apps/web/scripts/vercel-engine-hack.js`
- Copies the complete `@prisma/control-client` and `@prisma/tenant-client` directories
- Runs before Next.js build on Vercel
- Ensures binaries are available in the Lambda runtime

## Debugging

### Check Generated Clients

```bash
# Verify generation
ls -la packages/db/generated/control-client/
ls -la packages/db/generated/tenant-client/
```

### Verify Binary Presence

```bash
# Check for query engine binaries
find packages/db/node_modules -name "libquery_engine-*.so.node"
```

### Test Database Connections

```bash
# In Node.js REPL or test script
const { getControlDb, getTenantDb } = require('@amisimedos/db');

const db = getControlDb();
console.log(await db.tenant.findMany());
```

### Enable Prisma Debug Logging

```bash
# Set environment variable
export DEBUG="prisma:*"

# Run your app
pnpm dev
```

## Best Practices

1. **Always build the db package first** before building other packages
2. **Keep Prisma schemas in sync** - changes to one should reflect in tests
3. **Use generated types** - import from `@amisimedos/db/types` instead of writing types manually
4. **Test migrations locally** before deploying to production
5. **Monitor database connections** - use connection pooling with Prisma for production

## References

- [Prisma Documentation](https://www.prisma.io/docs/)
- [Next.js & Prisma Integration](https://www.prisma.io/docs/guides/databases/postgres/deploy-to-vercel)
- [Monorepo Configuration](https://www.prisma.io/docs/guides/other/troubleshooting-orm/help-articles/monorepo-setup)
