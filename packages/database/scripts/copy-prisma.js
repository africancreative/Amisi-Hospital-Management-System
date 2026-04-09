#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function copyDir(src, dest) {
  if (!fs.existsSync(src)) {
    console.warn(`[Prisma] Source not found: ${src}`);
    return false;
  }

  fs.mkdirSync(dest, { recursive: true });
  
  try {
    execSync(`cp -r ${src}/* ${dest}/`, { stdio: 'pipe' });
    console.log(`[Prisma] Copied: ${src} -> ${dest}`);
    return true;
  } catch (error) {
    console.error(`[Prisma] Failed to copy ${src}: ${error.message}`);
    return false;
  }
}

console.log('[Prisma] Starting Prisma binary copy process...');

const dbDir = path.join(__dirname, '..');
const distDir = path.join(dbDir, 'dist');
const nodeModulesDir = path.join(dbDir, 'node_modules');

try {
  // Ensure dist directory exists
  if (!fs.existsSync(distDir)) {
    fs.mkdirSync(distDir, { recursive: true });
  }

  // Copy .prisma directory with binaries
  const prismaSourceDir = path.join(nodeModulesDir, '.prisma');
  const prismaDestDir = path.join(distDir, '.prisma');
  
  if (fs.existsSync(prismaSourceDir)) {
    copyDir(prismaSourceDir, prismaDestDir);
  }

  // Copy @prisma package
  const primaPackageSource = path.join(nodeModulesDir, '@prisma');
  const prismaPackageDest = path.join(distDir, '@prisma');
  
  if (fs.existsSync(primaPackageSource)) {
    copyDir(primaPackageSource, prismaPackageDest);
  }

  // Copy generated Prisma clients
  const controlSrc = path.join(dbDir, 'generated', 'control-client');
  const tenantSrc = path.join(dbDir, 'generated', 'tenant-client');
  const controlDest = path.join(distDir, 'generated', 'control-client');
  const tenantDest = path.join(distDir, 'generated', 'tenant-client');

  copyDir(controlSrc, controlDest);
  copyDir(tenantSrc, tenantDest);

  console.log('[Prisma] Binary copy process completed successfully');
  process.exit(0);
} catch (error) {
  console.error('[Prisma] Fatal error during copy:', error.message);
  process.exit(1);
}
