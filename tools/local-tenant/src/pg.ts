import { execFileSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

export interface PgConnection {
  host: string;
  port: number;
  superuser: string;
  password: string;
  /** Optional explicit PostgreSQL bin directory (e.g. C:\Program Files\PostgreSQL\18\bin). */
  pgBinDir?: string;
}

export interface PsqlResult {
  stdout: string;
  stderr: string;
}

/** Resolve psql.exe — PATH first, then common PostgreSQL install locations. */
export function findPsql(pgBinDir?: string): string {
  if (pgBinDir && fs.existsSync(path.join(pgBinDir, 'psql.exe'))) {
    return path.join(pgBinDir, 'psql.exe');
  }

  try {
    const found = execFileSync('where', ['psql'], { encoding: 'utf8' });
    const first = found.split(/\r?\n/).map((l) => l.trim()).filter(Boolean)[0];
    if (first && fs.existsSync(first)) return first;
  } catch {
    // not on PATH
  }

  const programFiles = [
    process.env['PROGRAMFILES'],
    process.env['PROGRAMFILES(X86)'],
  ].filter(Boolean) as string[];

  for (const base of programFiles) {
    const pgRoot = path.join(base, 'PostgreSQL');
    if (!fs.existsSync(pgRoot)) continue;
    const versions = fs.readdirSync(pgRoot)
      .filter((d) => /^\d+$/.test(d))
      .sort((a, b) => Number(b) - Number(a));
    for (const v of versions) {
      const candidate = path.join(pgRoot, v, 'bin', 'psql.exe');
      if (fs.existsSync(candidate)) return candidate;
    }
  }

  throw new Error(
    'PostgreSQL client (psql) was not found. Install PostgreSQL 14+ (https://www.postgresql.org/download/windows/) and ensure it is on your PATH.'
  );
}

export function psqlBinDir(psqlPath: string): string {
  return path.dirname(psqlPath);
}

/**
 * Run psql against a database. If `db` is omitted, no database is selected
 * (connects to the default database for the role).
 */
export function runPsql(conn: PgConnection, db: string | undefined, sql: string, onErrorStop = true): PsqlResult {
  const psql = findPsql(conn.pgBinDir);
  const args: string[] = [
    '-X',
    '-q',
    '-U', conn.superuser,
    '-h', conn.host,
    '-p', String(conn.port),
  ];
  if (onErrorStop) args.push('-v', 'ON_ERROR_STOP=1');
  if (db) args.push('-d', db);
  args.push('-c', sql);

  try {
    const stdout = execFileSync(psql, args, {
      encoding: 'utf8',
      input: '',
      env: { ...process.env, PGPASSWORD: conn.password, PGCLIENTENCODING: 'UTF8' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '' };
  } catch (err: any) {
    throw new Error(`psql failed: ${err.message}`);
  }
}

/** Execute a SQL script file against a database. */
export function runPsqlFile(conn: PgConnection, db: string, file: string): PsqlResult {
  const psql = findPsql(conn.pgBinDir);
  const args: string[] = [
    '-X',
    '-q',
    '-v', 'ON_ERROR_STOP=1',
    '-U', conn.superuser,
    '-h', conn.host,
    '-p', String(conn.port),
    '-d', db,
    '-f', file,
  ];

  try {
    const stdout = execFileSync(psql, args, {
      encoding: 'utf8',
      env: { ...process.env, PGPASSWORD: conn.password, PGCLIENTENCODING: 'UTF8' },
      stdio: ['pipe', 'pipe', 'pipe'],
    });
    return { stdout, stderr: '' };
  } catch (err: any) {
    throw new Error(`psql script failed for database "${db}": ${err.message}`);
  }
}

/** Verify superuser credentials by running a trivial query. */
export function testConnection(conn: PgConnection): boolean {
  try {
    const res = runPsql(conn, 'postgres', 'SELECT 1;', false);
    return res.stdout.includes('1');
  } catch {
    return false;
  }
}

export function databaseExists(conn: PgConnection, name: string): boolean {
  try {
    const res = runPsql(
      conn,
      'postgres',
      `SELECT 1 FROM pg_database WHERE datname = '${escIdent(name)}';`
    );
    return res.stdout.includes('1');
  } catch {
    return false;
  }
}

export function roleExists(conn: PgConnection, role: string): boolean {
  try {
    const res = runPsql(
      conn,
      'postgres',
      `SELECT 1 FROM pg_roles WHERE rolname = '${escIdent(role)}';`
    );
    return res.stdout.includes('1');
  } catch {
    return false;
  }
}

export function escIdent(s: string): string {
  return s.replace(/'/g, "''");
}

export function escLiteral(s: string): string {
  return "'" + s.replace(/'/g, "''") + "'";
}

/** Create (or reset) the app role and its databases. Returns the app role password. */
export function createAppRoleAndDatabases(
  conn: PgConnection,
  appRole: string,
  appRolePassword: string,
  controlDb: string,
  tenantDb: string
): void {
  runPsql(
    conn,
    'postgres',
    `
DO $$
BEGIN
  IF NOT EXISTS (SELECT FROM pg_roles WHERE rolname = '${escIdent(appRole)}') THEN
    CREATE ROLE ${appRole} LOGIN PASSWORD ${escLiteral(appRolePassword)} NOSUPERUSER NOCREATEDB NOCREATEROLE;
  ELSE
    ALTER ROLE ${appRole} LOGIN PASSWORD ${escLiteral(appRolePassword)};
  END IF;
END $$;
`
  );

  for (const dbName of [controlDb, tenantDb]) {
    if (!databaseExists(conn, dbName)) {
      runPsql(conn, 'postgres', `CREATE DATABASE "${dbName}" OWNER ${appRole};`);
    }
    runPsql(conn, 'postgres', `ALTER DATABASE "${dbName}" OWNER TO ${appRole};`);
    runPsql(conn, 'postgres', `GRANT ALL PRIVILEGES ON DATABASE "${dbName}" TO ${appRole};`);
    // Ensure the app role owns the schema objects it will create.
    runPsql(conn, dbName, `ALTER SCHEMA public OWNER TO ${appRole};`);
  }
}
