#!/bin/bash

cd /vercel/share/v0-project

# Check git status
echo "Current git status:"
git status

# Add all changes
git add .

# Commit the changes
git commit -m "fix: resolve build errors - fix imports and add missing dependencies

- Added recharts dependency to apps/web/package.json
- Fixed imports from non-existent @amisi/tenant-client and @amisi/control-client packages
- Updated to use @prisma/client directly with local type definitions
- Fixed recordEvent imports to use @amisi/sync-engine/journal
- Updated database package exports (getControlDb, getTenantDb, provisionTenant, createTenantDatabase)
- Fixed web app modules.ts to import getControlDb from @amisi/database
- Updated all affected action files and components with corrected imports"

# Push to main
echo "Pushing to main branch..."
git push origin main

echo "Push complete!"
