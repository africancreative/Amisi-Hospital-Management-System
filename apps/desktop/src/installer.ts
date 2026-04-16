import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import crypto from 'crypto';

const execAsync = promisify(exec);

export interface InstallConfig {
  dbPassword: string;
  hospitalName: string;
  adminEmail: string;
  adminPassword: string;
  lanIp?: string;
  port?: number;
  cloudUrl?: string;
}

export interface InstallProgress {
  step: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  message?: string;
  progress: number;
}

export type InstallCallback = (progress: InstallProgress) => void;

const STEPS = [
  { name: 'prerequisites', message: 'Checking prerequisites', progress: 10 },
  { name: 'database', message: 'Setting up PostgreSQL', progress: 30 },
  { name: 'schema', message: 'Applying database schema', progress: 50 },
  { name: 'config', message: 'Creating configuration', progress: 70 },
  { name: 'app', message: 'Initializing application', progress: 85 },
  { name: 'complete', message: 'Installation complete', progress: 100 }
];

export class Installer {
  private config: InstallConfig;
  private onProgress: InstallCallback;
  private appDir: string;
  private dbInitialized = false;

  constructor(config: InstallConfig, onProgress: InstallCallback) {
    this.config = config;
    this.onProgress = onProgress;
    this.appDir = process.cwd();
  }

  private emitStep(stepName: string, status: InstallProgress['status'], message?: string) {
    const step = STEPS.find(s => s.name === stepName)!;
    this.onProgress({
      step: stepName,
      status,
      message: message || step.message,
      progress: step.progress
    });
  }

  async run(): Promise<{ success: boolean; error?: string }> {
    try {
      this.emitStep('prerequisites', 'in_progress');
      
      await this.checkPrerequisites();
      this.emitStep('prerequisites', 'completed');

      this.emitStep('database', 'in_progress');
      await this.setupDatabase();
      this.emitStep('database', 'completed');

      this.emitStep('schema', 'in_progress');
      await this.applySchema();
      this.emitStep('schema', 'completed');

      this.emitStep('config', 'in_progress');
      await this.createConfig();
      this.emitStep('config', 'completed');

      this.emitStep('app', 'in_progress');
      await this.initializeApp();
      this.emitStep('app', 'completed');

      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  private async checkPrerequisites(): Promise<void> {
    if (!this.config.hospitalName) throw new Error('Hospital name is required');
    if (!this.config.adminEmail) throw new Error('Admin email is required');
    if (!this.config.adminPassword) throw new Error('Admin password is required');

    try {
      await execAsync('psql --version');
    } catch {
      throw new Error('PostgreSQL is not installed. Please install PostgreSQL 14+ first.');
    }

    try {
      await execAsync('node --version');
    } catch {
      throw new Error('Node.js is not installed. Please install Node.js 18+ first.');
    }
  }

  private async setupDatabase(): Promise<void> {
    const dbName = 'amisimedos_' + this.sanitizeName(this.config.hospitalName);
    const dbUser = 'amisimedos';
    const dbPass = this.config.dbPassword;

    try {
      await execAsync(`sudo -u postgres createuser -s ${dbUser} 2>/dev/null || true`);
      await execAsync(`sudo -u postgres psql -c "ALTER USER ${dbUser} WITH PASSWORD '${dbPass}'"`);
      await execAsync(`sudo -u postgres createdb ${dbName} -O ${dbUser}`);
      
      this.dbInitialized = true;
      console.log(`[Installer] Database created: ${dbName}`);
    } catch (error: any) {
      if (error.message.includes('already exists')) {
        console.log(`[Installer] Database already exists, using existing`);
        this.dbInitialized = true;
        return;
      }
      throw error;
    }
  }

  private async applySchema(): Promise<void> {
    if (!this.dbInitialized) {
      throw new Error('Database not initialized');
    }

    const dbUrl = `postgresql://${this.config.dbPassword ? this.config.dbPassword + '@' : ''}localhost:5432/amisimedos_${this.sanitizeName(this.config.hospitalName)}`;
    
    process.env.DATABASE_URL = dbUrl;
    process.env.HOSPITAL_TENANT_ID = this.sanitizeName(this.config.hospitalName).toLowerCase();

    try {
      await execAsync('npx prisma db push --skip-generate', { env: { ...process.env, DATABASE_URL: dbUrl } });
      console.log('[Installer] Schema applied');
    } catch (error: any) {
      throw new Error(`Schema push failed: ${error.message}`);
    }
  }

  private async createConfig(): Promise<void> {
    const config = {
      HOSPITAL_TENANT_ID: this.sanitizeName(this.config.hospitalName).toLowerCase(),
      DATABASE_URL: `postgresql://amisimedos:${this.config.dbPassword}@localhost:5432/amisimedos_${this.sanitizeName(this.config.hospitalName)}`,
      PORT: this.config.port || 8080,
      CLOUD_SYNC_URL: this.config.cloudUrl || 'https://api.amisigenuine.com/api/sync',
      SYNC_SHARED_SECRET: crypto.randomBytes(32).toString('hex'),
      NEXTAUTH_SECRET: crypto.randomBytes(32).toString('hex'),
      NEXTAUTH_URL: `http://${this.config.lanIp || '192.168.1.100'}:${this.config.port || 8080}`,
      LOCAL_API_KEY: crypto.randomBytes(16).toString('hex')
    };

    const configPath = path.join(this.appDir, '.env.local');
    const configContent = Object.entries(config).map(([k, v]) => `${k}=${v}`).join('\n');
    
    fs.writeFileSync(configPath, configContent);
    console.log('[Installer] Configuration created');
  }

  private async initializeApp(): Promise<void> {
    try {
      await execAsync('npm run build', { cwd: this.appDir });
      console.log('[Installer] Application built');
    } catch (error: any) {
      console.log('[Installer] Build warning (continuing):', error.message);
    }

    const startupScript = `#!/bin/bash
cd ${this.appDir}
echo "Starting AmisiMedOS Local Node..."
echo "Web UI: http://${this.config.lanIp || '192.168.1.100'}:${this.config.port || 8080}"
echo "API: http://${this.config.lanIp || '192.168.1.100'}:${(this.config.port || 8080) + 1}/api"
npm run start
`;

    fs.writeFileSync(path.join(this.appDir, 'start.sh'), startupScript);
    fs.chmodSync(path.join(this.appDir, 'start.sh'), '755');

    console.log('[Installer] Installation complete!');
  }

  private sanitizeName(name: string): string {
    return name.toLowerCase().replace(/[^a-z0-9]/g, '_').replace(/_+/g, '_');
  }
}

export function createInstaller(config: InstallConfig, onProgress: InstallCallback): Installer {
  return new Installer(config, onProgress);
}

export function getDefaultConfig(): InstallConfig {
  return {
    dbPassword: 'amisimedos2024',
    hospitalName: 'My Hospital',
    adminEmail: 'admin@hospital.local',
    adminPassword: 'admin123',
    lanIp: '192.168.1.100',
    port: 8080,
    cloudUrl: 'https://api.amisigenuine.com/api/sync'
  };
}