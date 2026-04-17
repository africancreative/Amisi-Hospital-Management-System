/**
 * Prisma Binary Fallback Handler
 * 
 * Ensures Prisma can locate binaries on Vercel Lambda and other environments
 * where the standard Node module resolution may fail.
 */

import path from 'path';
import fs from 'fs';

/**
 * Configures Prisma engine paths for multi-tenant architecture.
 * This is especially critical for Vercel deployments with monorepos.
 */
export function initializePrismaEnvironment() {
  // Check if we're in a Vercel environment
  const isVercel = process.env.VERCEL === '1' || process.env.VERCEL_ENV;
  
  if (isVercel && process.env.NODE_ENV === 'production') {
    const possibleEnginePaths = [
      // Primary: Copied by vercel-engine-hack.js to apps/web/node_modules
      path.resolve('/var/task/apps/web/node_modules/@prisma/control-client'),
      path.resolve('/var/task/apps/web/node_modules/@prisma/tenant-client'),
      
      // Secondary: Monorepo location
      path.resolve(process.cwd(), 'node_modules/@prisma/control-client'),
      path.resolve(process.cwd(), 'node_modules/@prisma/tenant-client'),
      
      // Tertiary: Packages location
      path.resolve(process.cwd(), '../../packages/db/node_modules/@prisma/control-client'),
      path.resolve(process.cwd(), '../../packages/db/node_modules/@prisma/tenant-client'),
    ];

    // Set PRISMA_QUERY_ENGINE_BINARY if we can find it
    for (const enginePath of possibleEnginePaths) {
      const binaryFile = path.join(enginePath, 'libquery_engine-rhel-openssl-3.0.x.so.node');
      if (fs.existsSync(binaryFile)) {
        console.log(`[Prisma Init] Found engine binary at: ${binaryFile}`);
        process.env.PRISMA_QUERY_ENGINE_BINARY = binaryFile;
        break;
      }
    }

    // Log engine location for debugging
    if (process.env.PRISMA_QUERY_ENGINE_BINARY) {
      console.log(`[Prisma Init] Using engine binary: ${process.env.PRISMA_QUERY_ENGINE_BINARY}`);
    } else {
      console.warn('[Prisma Init] WARNING: Could not locate Prisma query engine binary');
      console.warn(`[Prisma Init] Checked locations: ${possibleEnginePaths.join(', ')}`);
    }
  }
}

// Initialize on module load
if (typeof window === 'undefined') {
  // Only in server-side code
  initializePrismaEnvironment();
}
