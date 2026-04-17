const fs = require('fs');
const path = require('path');

const src = '../../packages/db/generated';
const dests = [
  '.next/server',
  'generated/control-client',
  'generated/tenant-client',
  '.prisma/client'
];

['control-client', 'tenant-client'].forEach(c => {
  const s = path.join(src, c);
  if (fs.existsSync(s)) {
    const files = fs.readdirSync(s).filter(f => f.endsWith('.node'));
    files.forEach(f => {
      const srcFile = path.join(s, f);
      dests.forEach(dest => {
        try {
          const destDir = path.dirname(path.join(dest, f));
          if (!fs.existsSync(destDir)) fs.mkdirSync(destDir, { recursive: true });
          fs.copyFileSync(srcFile, path.join(dest, f));
        } catch (e) {}
      });
    });
  }
});

console.log('Prisma engines copied');