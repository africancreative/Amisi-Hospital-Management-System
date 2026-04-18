/**
 * Vercel explicitly searches `/var/task/apps/web/node_modules/@prisma/control-client`
 * for the libquery_engine binary during Lambda execution. 
 * This script forces a physical copy of the binaries into that exact directory mapped
 * against Vercel's runtime environment just in case Next.js File Tracing skips the monorepo workspace.
 */

const fs = require('fs');
const path = require('path');

const srcControl = path.resolve(__dirname, '../../../packages/db/generated/control-client');
const srcTenant = path.resolve(__dirname, '../../../packages/db/generated/tenant-client');

const targetControl = path.resolve(__dirname, '../generated/control-client');
const targetTenant = path.resolve(__dirname, '../generated/tenant-client');

function copyEngines(src, target, label) {
  if (!fs.existsSync(src)) {
    console.log(`[Vercel Engine Hack] Skipping ${label} - Source not found: ${src}`);
    return;
  }

  const files = fs.readdirSync(src);
  const engines = files.filter(f => f.endsWith('.node'));

  if (!fs.existsSync(target)) {
    fs.mkdirSync(target, { recursive: true });
  }

  // Copy the engine binaries AND the package.json so Node module resolution doesn't choke
  const filesToCopy = [...engines, 'package.json', 'index.js', 'index.d.ts'];

  filesToCopy.forEach(f => {
    const srcFile = path.join(src, f);
    const destFile = path.join(target, f);
    if (fs.existsSync(srcFile)) {
      fs.copyFileSync(srcFile, destFile);
      console.log(`[Vercel Engine Hack] Copied ${f} -> ${destFile}`);
    }
  });
}

copyEngines(srcControl, targetControl, 'control-client');
copyEngines(srcTenant, targetTenant, 'tenant-client');

console.log('[Vercel Engine Hack] Complete.');
