const fs = require('fs');
const path = require('path');

// Create package.json files for the generated Prisma clients
// This ensures they're properly recognized as npm modules

const controlClientDir = path.join(__dirname, '../../node_modules/@amisi/control-client');
const tenantClientDir = path.join(__dirname, '../../node_modules/@amisi/tenant-client');

// Ensure directories exist
[controlClientDir, tenantClientDir].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Create package.json for control-client
const controlPackageJson = {
  name: '@amisi/control-client',
  version: '1.0.0',
  main: 'index.js',
  types: 'index.d.ts'
};

fs.writeFileSync(
  path.join(controlClientDir, 'package.json'),
  JSON.stringify(controlPackageJson, null, 2)
);

console.log('Created @amisi/control-client package.json');

// Create package.json for tenant-client
const tenantPackageJson = {
  name: '@amisi/tenant-client',
  version: '1.0.0',
  main: 'index.js',
  types: 'index.d.ts'
};

fs.writeFileSync(
  path.join(tenantClientDir, 'package.json'),
  JSON.stringify(tenantPackageJson, null, 2)
);

console.log('Created @amisi/tenant-client package.json');
