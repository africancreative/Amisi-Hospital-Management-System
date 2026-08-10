import * as fs from 'fs';
import * as path from 'path';
import { provision, InstallConfig, InstallResult } from './provision';

function readConfigFile(configPath: string): InstallConfig {
  if (!fs.existsSync(configPath)) {
    throw new Error(`Configuration file not found: ${configPath}`);
  }
  const raw = JSON.parse(fs.readFileSync(configPath, 'utf-8')) as Partial<InstallConfig>;
  return {
    hospitalName: raw.hospitalName || '',
    slug: raw.slug || '',
    tier: raw.tier || 'HOSPITAL',
    facilityType: raw.facilityType || 'HOSPITAL',
    adminEmail: raw.adminEmail || '',
    adminName: raw.adminName || 'Hospital Administrator',
    adminPassword: raw.adminPassword || '',
    port: raw.port || 3000,
    hostname: raw.hostname || 'localhost',
    pgHost: raw.pgHost || 'localhost',
    pgPort: raw.pgPort || 5432,
    pgSuperuser: raw.pgSuperuser || 'postgres',
    pgPassword: raw.pgPassword || '',
    pgBinDir: raw.pgBinDir || undefined,
    appDir: raw.appDir || process.cwd(),
    sqlDir: raw.sqlDir || path.join(path.dirname(__dirname), 'sql'),
    envFile: raw.envFile || path.join(raw.appDir || process.cwd(), '.env'),
  };
}

function fail(message: string): never {
  console.error(JSON.stringify({ ok: false, error: message }));
  process.exit(1);
}

async function main(): Promise<void> {
  const [cmd, arg] = process.argv.slice(2);

  if (cmd === 'provision') {
    if (!arg) fail('Usage: local-tenant provision <config.json>');
    const cfg = readConfigFile(arg);
    const result = await provision(cfg, (msg) => console.log(`[step] ${msg}`));
    const out: InstallResult = result;
    console.log(JSON.stringify(out));
    return;
  }

  if (cmd === 'verify') {
    const cfg = readConfigFile(arg || '');
    // Lightweight check: print resolved configuration without touching the database.
    console.log(JSON.stringify({
      ok: true,
      hospitalName: cfg.hospitalName,
      slug: cfg.slug,
      appDir: cfg.appDir,
      sqlDir: cfg.sqlDir,
      envFile: cfg.envFile,
      pgHost: cfg.pgHost,
      pgPort: cfg.pgPort,
      pgSuperuser: cfg.pgSuperuser,
    }));
    return;
  }

  fail(`Unknown command "${cmd}". Supported: provision, verify`);
}

main().catch((err) => fail(err instanceof Error ? err.message : String(err)));
