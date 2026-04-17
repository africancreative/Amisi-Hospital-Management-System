const fs = require('fs');
const path = require('path');

const src = '../../packages/db/generated';
const dest1 = '.next/server';
const dest2 = 'generated';
const dest3 = '.prisma';

['control-client', 'tenant-client'].forEach(c => {
  const s = path.join(src, c);
  if (fs.existsSync(s)) {
    const files = fs.readdirSync(s).filter(f => f.endsWith('.node'));
    files.forEach(f => {
      const srcFile = path.join(s, f);
      try { fs.copyFileSync(srcFile, path.join(dest1, f)); } catch (e) {}
      try { fs.copyFileSync(srcFile, path.join(dest2, f)); } catch (e) {}
      try { fs.copyFileSync(srcFile, path.join(dest3, f)); } catch (e) {}
    });
  }
});

console.log('Prisma engines copied');