/**
 * Vercel explicitly searches `/var/task/apps/web/node_modules/@prisma/control-client`
 * for the libquery_engine binary during Lambda execution. 
 * This script forces a physical copy of the binaries into that exact directory mapped
 * against Vercel's runtime environment just in case Next.js File Tracing skips the monorepo workspace.
 */

const fs = require('fs');
const path = require('path');

const srcControl = path.resolve(__dirname, '../../../packages/db/node_modules/@prisma/control-client');
const srcTenant = path.resolve(__dirname, '../../../packages/db/node_modules/@prisma/tenant-client');

const targetControl = path.resolve(__dirname, '../node_modules/@prisma/control-client');
const targetTenant = path.resolve(__dirname, '../node_modules/@prisma/tenant-client');

// Ensure @prisma directory exists in web's node_modules
const prismaDir = path.resolve(__dirname, '../node_modules/@prisma');
if (!fs.existsSync(prismaDir)) {
  fs.mkdirSync(prismaDir, { recursive: true });
}

function copyDir(src, dest) {
  if (!fs.existsSync(src)) return false;
  
  if (!fs.existsSync(dest)) {
    fs.mkdirSync(dest, { recursive: true });
  }

  const files = fs.readdirSync(src);
  files.forEach(file => {
    const srcPath = path.join(src, file);
    const destPath = path.join(dest, file);
    
    const stat = fs.statSync(srcPath);
    if (stat.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  });
  
  return true;
}

function copyClient(src, target, label) {
  if (!fs.existsSync(src)) {
    console.log(`[Vercel Engine Hack] Skipping ${label} - Source not found: ${src}`);
    return;
  }

  console.log(`[Vercel Engine Hack] Copying ${label} from ${src} to ${target}`);
  const success = copyDir(src, target);
  
  if (success) {
    console.log(`[Vercel Engine Hack] Successfully copied ${label}`);
  }
}

copyClient(srcControl, targetControl, 'control-client');
copyClient(srcTenant, targetTenant, 'tenant-client');

console.log('[Vercel Engine Hack] Complete.');
