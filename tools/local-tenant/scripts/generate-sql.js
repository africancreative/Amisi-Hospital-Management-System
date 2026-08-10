// Regenerates control.sql and tenant.sql from the Prisma schemas using `prisma migrate diff`.
// Run from the monorepo root after schema changes.
const { execFileSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const repoRoot = path.join(__dirname, '..', '..', '..');
const prismaCli = path.join(repoRoot, 'packages', 'db', 'node_modules', 'prisma', 'build', 'index.js');
const sqlOut = path.join(__dirname, '..', 'sql');

function generate(schema, outFile, extraEnv) {
  const env = {
    ...process.env,
    NEON_DATABASE_URL: 'postgresql://postgres:placeholder@localhost:5432/amisi_control',
    NEON_DIRECT_URL: 'postgresql://postgres:placeholder@localhost:5432/amisi_control',
    LOCAL_EDGE_DATABASE_URL: 'postgresql://postgres:placeholder@localhost:5432/amisimedos_tenant',
    LOCAL_EDGE_DIRECT_URL: 'postgresql://postgres:placeholder@localhost:5432/amisimedos_tenant',
    ...extraEnv,
  };
  const out = execFileSync(
    'node',
    [prismaCli, 'migrate', 'diff', '--from-empty', '--to-schema-datamodel', schema, '--script'],
    { encoding: 'utf8', env }
  );
  fs.writeFileSync(path.join(sqlOut, outFile), out);
  console.log(`[generate-sql] Wrote ${outFile} (${out.split('\n').length} lines)`);
}

fs.mkdirSync(sqlOut, { recursive: true });
generate(path.join(repoRoot, 'packages', 'db', 'prisma', 'control.prisma'), 'control.sql');
generate(path.join(repoRoot, 'packages', 'db', 'prisma', 'tenant.prisma'), 'tenant.sql');
console.log('[generate-sql] Done.');
