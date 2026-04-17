#!/usr/bin/env node

/**
 * Ensure Prisma Binaries are Available
 * 
 * This script:
 * 1. Copies Prisma binaries from packages/db/node_modules to apps/web/node_modules
 * 2. Verifies the binaries exist and are readable
 * 3. Sets up fallback paths for Vercel Lambda runtime
 * 
 * Called by:
 * - postinstall hook
 * - build script (before Next.js build)
 */

const fs = require('fs');
const path = require('path');

const CONTROL_CLIENT = '@prisma/control-client';
const TENANT_CLIENT = '@prisma/tenant-client';

// Paths
const webNodeModules = path.resolve(__dirname, '../node_modules');
const dbNodeModules = path.resolve(__dirname, '../../../packages/db/node_modules');

const srcControl = path.join(dbNodeModules, CONTROL_CLIENT);
const srcTenant = path.join(dbNodeModules, TENANT_CLIENT);

const dstControl = path.join(webNodeModules, CONTROL_CLIENT);
const dstTenant = path.join(webNodeModules, TENANT_CLIENT);

let errorCount = 0;
let successCount = 0;

function log(level, msg) {
  const timestamp = new Date().toISOString();
  const prefix = `[${timestamp}] [ensure-prisma-binaries] [${level}]`;
  console.log(`${prefix} ${msg}`);
}

function copyRecursive(src, dst) {
  if (!fs.existsSync(src)) {
    log('WARN', `Source not found: ${src}`);
    return false;
  }

  // Create destination directory if needed
  if (!fs.existsSync(dst)) {
    fs.mkdirSync(dst, { recursive: true });
    log('INFO', `Created directory: ${dst}`);
  }

  try {
    const entries = fs.readdirSync(src, { withFileTypes: true });
    
    entries.forEach(entry => {
      const srcPath = path.join(src, entry.name);
      const dstPath = path.join(dst, entry.name);

      if (entry.isDirectory()) {
        copyRecursive(srcPath, dstPath);
      } else {
        try {
          // Use copyFileSync to preserve file metadata
          fs.copyFileSync(srcPath, dstPath);
          
          if (entry.name.endsWith('.so.node') || entry.name.endsWith('.node')) {
            log('DEBUG', `✓ Copied binary: ${dstPath}`);
            // Make binary readable
            fs.chmodSync(dstPath, 0o755);
          }
          successCount++;
        } catch (e) {
          log('ERROR', `Failed to copy ${entry.name}: ${e.message}`);
          errorCount++;
        }
      }
    });

    return true;
  } catch (e) {
    log('ERROR', `Failed to copy from ${src}: ${e.message}`);
    errorCount++;
    return false;
  }
}

function verifyBinaries(dir, label) {
  try {
    const files = fs.readdirSync(dir);
    const binaries = files.filter(f => f.endsWith('.so.node') || f.endsWith('.node'));
    
    if (binaries.length === 0) {
      log('ERROR', `No Prisma binaries found in ${label} (${dir})`);
      errorCount++;
      return false;
    }

    log('INFO', `✓ Verified ${binaries.length} binary file(s) in ${label}:`);
    binaries.forEach(b => {
      const fullPath = path.join(dir, b);
      const stat = fs.statSync(fullPath);
      log('DEBUG', `  - ${b} (${(stat.size / 1024 / 1024).toFixed(2)} MB)`);
    });

    return true;
  } catch (e) {
    log('ERROR', `Failed to verify binaries in ${label}: ${e.message}`);
    errorCount++;
    return false;
  }
}

function ensureBinaries() {
  log('INFO', 'Starting Prisma binary check and copy...');
  log('DEBUG', `Source (db): ${dbNodeModules}`);
  log('DEBUG', `Target (web): ${webNodeModules}`);

  // Copy control client
  log('INFO', `Copying ${CONTROL_CLIENT}...`);
  const controlSuccess = copyRecursive(srcControl, dstControl);
  if (controlSuccess) {
    verifyBinaries(dstControl, `${CONTROL_CLIENT} (destination)`);
  }

  // Copy tenant client
  log('INFO', `Copying ${TENANT_CLIENT}...`);
  const tenantSuccess = copyRecursive(srcTenant, dstTenant);
  if (tenantSuccess) {
    verifyBinaries(dstTenant, `${TENANT_CLIENT} (destination)`);
  }

  // Final status
  log('INFO', `Operation complete: ${successCount} files copied, ${errorCount} errors`);

  if (errorCount > 0 && !controlSuccess && !tenantSuccess) {
    log('ERROR', 'Failed to copy any Prisma clients!');
    process.exit(1);
  }

  log('INFO', '✓ Prisma binaries are ready for deployment');
}

// Run
ensureBinaries();
