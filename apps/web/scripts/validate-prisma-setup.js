/**
 * Validates that Prisma binaries and clients are properly set up
 * for the monorepo and Vercel deployment.
 */

const fs = require('fs');
const path = require('path');

const checks = [];

function checkPath(description, targetPath) {
  const exists = fs.existsSync(targetPath);
  checks.push({
    description,
    path: targetPath,
    exists,
    status: exists ? '✓' : '✗'
  });
  return exists;
}

console.log('\n[Prisma Setup Validator] Running checks...\n');

// Check source locations
checkPath('Source: packages/db/node_modules/@prisma/control-client', 
  path.resolve(__dirname, '../../../packages/db/node_modules/@prisma/control-client'));
checkPath('Source: packages/db/node_modules/@prisma/tenant-client', 
  path.resolve(__dirname, '../../../packages/db/node_modules/@prisma/tenant-client'));

// Check generated clients
checkPath('Generated: packages/db/generated/control-client', 
  path.resolve(__dirname, '../../../packages/db/generated/control-client'));
checkPath('Generated: packages/db/generated/tenant-client', 
  path.resolve(__dirname, '../../../packages/db/generated/tenant-client'));

// Check if binaries exist
const controlBinary = path.resolve(__dirname, '../../../packages/db/node_modules/@prisma/control-client/libquery_engine-rhel-openssl-3.0.x.so.node');
const tenantBinary = path.resolve(__dirname, '../../../packages/db/node_modules/@prisma/tenant-client/libquery_engine-rhel-openssl-3.0.x.so.node');

checkPath('Binary: control-client RHEL binary', controlBinary);
checkPath('Binary: tenant-client RHEL binary', tenantBinary);

// Print results
console.log('\nValidation Results:');
console.log('─'.repeat(80));
checks.forEach(check => {
  const status = check.exists ? '✓' : '✗';
  console.log(`${status} ${check.description}`);
  if (!check.exists) {
    console.log(`  └─ Expected at: ${check.path}`);
  }
});

const allPassed = checks.every(c => c.exists);
console.log('─'.repeat(80));

if (allPassed) {
  console.log('\n✓ All Prisma setup checks passed!\n');
  process.exit(0);
} else {
  const failed = checks.filter(c => !c.exists);
  console.log(`\n✗ ${failed.length} checks failed!\n`);
  console.log('Failed checks:');
  failed.forEach(check => {
    console.log(`  • ${check.description}`);
  });
  console.log('\nTroubleshooting:');
  console.log('1. Run: pnpm --filter @amisimedos/db build');
  console.log('2. Run: pnpm install (to ensure all dependencies are installed)');
  console.log('3. Check that prisma binary targets include "rhel-openssl-3.0.x"');
  console.log('\n');
  process.exit(1);
}
