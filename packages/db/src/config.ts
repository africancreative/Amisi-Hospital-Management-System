import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

/**
 * Resilient env loader — tries multiple commonly resolved paths so this
 * package works correctly whether consumed by:
 *   - Next.js (which loads from apps/web/.env.local natively)
 *   - CLI scripts (tsx seed-*.ts) run from packages/db/
 *   - Compiled dist/ output (where __dirname differs)
 */
function loadEnv() {
    const candidates = [
        // From compiled dist/ → packages/db/dist/ → go up 4 levels to workspace root
        path.join(__dirname, '../../../../.env'),
        // From source src/ → packages/db/src/ → go up 3 levels to workspace root
        path.join(__dirname, '../../../.env'),
        // From workspace root directly
        path.join(process.cwd(), '.env'),
        // From apps/web (Next.js working directory in dev)
        path.join(process.cwd(), '../../.env'),
    ];

    for (const candidate of candidates) {
        if (fs.existsSync(candidate)) {
            dotenv.config({ path: candidate });
            break;
        }
    }

    // Also try the Next.js .env.local in apps/web
    const nextLocalEnv = path.join(process.cwd(), '.env.local');
    if (fs.existsSync(nextLocalEnv)) {
        dotenv.config({ path: nextLocalEnv, override: false });
    }
}

loadEnv();

const ConfigSchema = z.object({
    NEON_DATABASE_URL: z.string().min(1, 'NEON_DATABASE_URL must not be empty'),
    LOCAL_EDGE_DATABASE_URL: z.string().url().optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
    SYNC_SHARED_SECRET: z.string().optional(),
});

let config: z.infer<typeof ConfigSchema>;

try {
    config = ConfigSchema.parse(process.env);
} catch (error) {
    const url = process.env.NEON_DATABASE_URL || process.env.DATABASE_URL || '';
    if (!url) {
        console.error('[DB Config] CRITICAL: Neither NEON_DATABASE_URL nor DATABASE_URL is set.');
        console.error('[DB Config] Ensure apps/web/.env.local contains NEON_DATABASE_URL.');
    }
    config = {
        NEON_DATABASE_URL: url,
        LOCAL_EDGE_DATABASE_URL: process.env.LOCAL_EDGE_DATABASE_URL || undefined,
        NODE_ENV: (process.env.NODE_ENV as any) || 'development',
        SYNC_SHARED_SECRET: process.env.SYNC_SHARED_SECRET,
    };
}

export { config };
