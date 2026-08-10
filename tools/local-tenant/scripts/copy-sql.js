// Copies the generated schema SQL files into dist/ so the compiled CLI is self-contained.
const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, '..', 'sql');
const outDir = path.join(__dirname, '..', 'dist', 'sql');

fs.mkdirSync(outDir, { recursive: true });
for (const name of ['control.sql', 'tenant.sql']) {
  const src = path.join(srcDir, name);
  if (!fs.existsSync(src)) {
    console.error(`[copy-sql] Missing ${name} — run "pnpm --filter @amisimedos/local-tenant sql:generate" first.`);
    process.exit(1);
  }
  fs.copyFileSync(src, path.join(outDir, name));
}
console.log('[copy-sql] Schema SQL copied to dist/sql.');
