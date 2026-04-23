import { z } from 'zod';

/**
 * Resilient env loader — only executed on the server.
 */
function loadEnv() {
    if (typeof window !== 'undefined') return;
    
    try {
        // Dynamic require protects the browser bundler from seeing these imports
        const fs = require('fs');
        const path = require('path');
        const dotenv = require('dotenv');

        const candidates = [
            path.join(process.cwd(), '.env.local'),
            path.join(process.cwd(), '.env'),
            path.join(process.cwd(), '../../.env'), // Root from apps/x
            path.join(process.cwd(), '../../../.env'), // Root from apps/x/y
            path.join(__dirname, '../.env'), // Relative to this package's dist or src
            path.join(__dirname, '../../.env'), // Relative to root from this package
        ];

        for (const candidate of candidates) {
            if (fs.existsSync(candidate)) {
                dotenv.config({ path: candidate });
            }
        }
    } catch (e) {
        // Silently fail if modules not available (e.g. browser context during build)
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
