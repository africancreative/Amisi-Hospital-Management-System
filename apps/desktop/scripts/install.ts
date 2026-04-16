#!/usr/bin/env node

import { createInstaller, getDefaultConfig, InstallConfig } from './installer';

const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  printHelp();
  process.exit(0);
}

const config: InstallConfig = {
  dbPassword: getArg('--dbpass') || 'amisimedos2024',
  hospitalName: getArg('--hospital') || 'My Hospital',
  adminEmail: getArg('--email') || 'admin@hospital.local',
  adminPassword: getArg('--adminpass') || 'admin123',
  lanIp: getArg('--ip') || undefined,
  port: parseInt(getArg('--port')) || 8080,
  cloudUrl: getArg('--cloud') || 'https://api.amisigenuine.com/api/sync'
};

console.log(`
╔═══════════════════════════════════════════════════════════╗
║           AmisiMedOS Local Node Installer                   ║
║                  One-Click Setup v4.0.0                     ║
╚═══════════════════════════════════════════════════════════╝
`);

console.log('Configuration:');
console.log(`  Hospital: ${config.hospitalName}`);
console.log(`  LAN IP: ${config.lanIp || 'Auto-detect'}`);
console.log(`  Port: ${config.port}`);
console.log(`  Cloud: ${config.cloudUrl}`);
console.log('');

const installer = createInstaller(config, (progress) => {
  const icons = { pending: '⏳', in_progress: '🔄', completed: '✅', failed: '❌' };
  console.log(`${icons[progress.status]} ${progress.message} (${progress.progress}%)`);
});

installer.run().then((result) => {
  if (result.success) {
    console.log(`
╔═══════════════════════════════════════════════════════════╗
║                    Installation Complete!                   ║
╠═══════════════════════════════════════════════════════════╣
║  Web UI:  http://${config.lanIp || '192.168.1.100'}:${config.port}             ║
║  API:     http://${config.lanIp || '192.168.1.100'}:${config.port + 1}/api     ║
║                                                               ║
║  Admin Login: ${config.adminEmail.padEnd(25)}║
║  Password:   ${config.adminPassword.padEnd(25)}║
╠═══════════════════════════════════════════════════════════╣
║  Run './start.sh' to start the server                     ║
╚═══════════════════════════════════════════════════════════╝
`);
  } else {
    console.error(`\n❌ Installation failed: ${result.error}\n`);
    process.exit(1);
  }
});

function getArg(name: string): string | undefined {
  const idx = args.indexOf(name);
  return idx >= 0 && args[idx + 1] ? args[idx + 1] : undefined;
}

function printHelp() {
  console.log(`
AmisiMedOS Installer

Usage: node install.js [options]

Options:
  --hospital <name>    Hospital name (default: "My Hospital")
  --email <email>     Admin email (default: admin@hospital.local)
  --adminpass <pass>  Admin password (default: admin123)
  --dbpass <pass>     Database password (default: amisimedos2024)
  --ip <address>      LAN IP address (auto-detect if not specified)
  --port <number>    Port number (default: 8080)
  --cloud <url>       Cloud sync URL
  --help, -h          Show this help message

Example:
  node install.js --hospital "City Hospital" --ip "192.168.1.50"
`);
}