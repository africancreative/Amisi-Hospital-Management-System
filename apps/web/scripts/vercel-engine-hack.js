/**
 * Vercel Engine Binary Copy Script
 * 
 * This script copies Prisma engine binaries from the monorepo workspace into the
 * apps/web/node_modules/@prisma/ directory where Vercel's Lambda runtime can find them.
 * 
 * Key points:
 * 1. Runs AFTER dependency install but BEFORE next build
 * 2. Copies entire @prisma client directories (not just binaries)
 * 3. Validates copy success before continuing
 * 4. Works in monorepo setups where packages/db has Prisma clients
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Source paths (where Prisma generated clients are)
const srcControl = path.resolve(__dirname, '../../../packages/db/node_modules/@prisma/control-client');
const srcTenant = path.resolve(__dirname, '../../../packages/db/node_modules/@prisma/tenant-client');

// Target paths (where Vercel's Lambda will look for them)
const targetControl = path.resolve(__dirname, '../node_modules/@prisma/control-client');
const targetTenant = path.resolve(__dirname, '../node_modules/@prisma/tenant-client');

// Ensure @prisma directory exists in web's node_modules
const prismaDir = path.resolve(__dirname, '../node_modules/@prisma');
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
  console.log(`[Prisma Copy] Created @prisma directory: ${prismaDir}`);
}

/**
 * Copy entire directory recursively
 */
function copyDirRecursive(src, dest) {
  if (!fs.existsSync(src)) {
    return false;
  }
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const entries = fs.readdirSync(src, { withFileTypes: true });
  
  entries.forEach(entry => {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    
    if (entry.isDirectory()) {
      copyDirRecursive(srcPath, destPath);
    } else {
      try {
        fs.copyFileSync(srcPath, destPath);
        if (entry.name.endsWith('.node')) {
          console.log(`[Prisma Copy] ✓ Copied binary: ${entry.name}`);
        }
      } catch (e) {
        console.error(`[Prisma Copy] ✗ Failed to copy ${entry.name}: ${e.message}`);
        throw e;
      }
    }
  });
  
  return true;
}

/**
 * Verify binaries exist in destination
 */
function verifyBinaries(target, label) {
  const binFiles = fs.readdirSync(target).filter(f => f.endsWith('.node'));
  if (binFiles.length === 0) {
    throw new Error(`[Prisma Copy] No .node binaries found in ${target} for ${label}`);
  }
  console.log(`[Prisma Copy] ✓ Verified ${binFiles.length} binary file(s) for ${label}`);
  return true;
}

/**
 * Copy Prisma clients
 */
function copyClient(src, target, label) {
  if (!fs.existsSync(src)) {
    console.log(`[Prisma Copy] ⚠ Source not found (skipping): ${src}`);
    return false;
  }

  try {
    console.log(`[Prisma Copy] Copying ${label}...`);
    const success = copyDirRecursive(src, target);
    
    if (success) {
      verifyBinaries(target, label);
      console.log(`[Prisma Copy] ✓ Successfully copied ${label}`);
      return true;
    }
  } catch (e) {
    console.error(`[Prisma Copy] ✗ Error copying ${label}: ${e.message}`);
    throw e;
  }
  
  return false;
}

// Execute copies
console.log('[Prisma Copy] Starting Prisma engine binary copy for Vercel Lambda...');

const controlSuccess = copyClient(srcControl, targetControl, 'control-client');
const tenantSuccess = copyClient(srcTenant, targetTenant, 'tenant-client');

if (!controlSuccess && !tenantSuccess) {
  throw new Error('[Prisma Copy] Failed to copy any Prisma clients. Build cannot continue.');
}

console.log('[Prisma Copy] ✓ Complete. Prisma binaries are ready for Vercel Lambda deployment.');
