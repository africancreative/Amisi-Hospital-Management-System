/**
 * copy-prisma.js
 *
 * Copies Prisma engine binaries (.node files) from the monorepo's generated
 * client directories into every location that Prisma searches at runtime on
 * Vercel (rhel-openssl-3.0.x Lambda environment).
 *
 * IMPORTANT: This script must run BEFORE `next build` so that Next.js file
 * tracing (NFT) captures these binaries and includes them in the Lambda bundle.
 */

const fs = require('fs');
const path = require('path');

// Source: generated Prisma clients in the db package
const CLIENTS = [
  {
    src: path.resolve(__dirname, '../../../packages/db/generated/control-client'),
    name: 'control-client',
  },
  {
    src: path.resolve(__dirname, '../../../packages/db/generated/tenant-client'),
    name: 'tenant-client',
  },
];

// All locations Prisma searches for the engine file at runtime on Vercel
// Paths are relative to apps/web/ (cwd during Vercel build)
const DESTINATIONS = [
  '.next/server',
  'generated/control-client',
  'generated/tenant-client',
  '.prisma/client',
  'node_modules/.prisma/client',
];

let totalCopied = 0;
let totalErrors = 0;

CLIENTS.forEach(({ src, name }) => {
  if (!fs.existsSync(src)) {
    console.warn(`[copy-prisma] WARNING: Source directory not found: ${src}`);
    console.warn(`[copy-prisma] Run 'pnpm --filter @amisimedos/db generate' first.`);
    return;
  }

  // Only copy binary engine files (.node) — skip JS/TS/schema files
  const engineFiles = fs.readdirSync(src).filter(f => f.endsWith('.node'));

  if (engineFiles.length === 0) {
    console.warn(`[copy-prisma] WARNING: No .node engine files found in ${src}`);
    return;
  }

  console.log(`\n[copy-prisma] Processing ${name}: found ${engineFiles.length} engine file(s)`);
  engineFiles.forEach(f => console.log(`  → ${f} (${(fs.statSync(path.join(src, f)).size / 1024 / 1024).toFixed(1)} MB)`));

  engineFiles.forEach(engineFile => {
    const srcFile = path.join(src, engineFile);

    DESTINATIONS.forEach(dest => {
      const destPath = path.resolve(process.cwd(), dest, engineFile);
      const destDir = path.dirname(destPath);

      try {
        if (!fs.existsSync(destDir)) {
          fs.mkdirSync(destDir, { recursive: true });
        }
        fs.copyFileSync(srcFile, destPath);
        console.log(`  ✓ Copied to ${dest}/${engineFile}`);
        totalCopied++;
      } catch (err) {
        console.error(`  ✗ Failed to copy to ${dest}/${engineFile}: ${err.message}`);
        totalErrors++;
      }
    });
  });
});

console.log(`\n[copy-prisma] Done. ${totalCopied} copies succeeded, ${totalErrors} errors.`);

if (totalErrors > 0) {
  console.error('[copy-prisma] Some copies failed — check the errors above.');
  // Do not exit with error code — allow build to continue
}