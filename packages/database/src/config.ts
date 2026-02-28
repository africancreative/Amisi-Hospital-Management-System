import { z } from 'zod';
import * as dotenv from 'dotenv';
import path from 'path';

// Load root workspace env. 
// In a real Vercel/Docker environment this happens natively, but locally we do this:
dotenv.config({ path: path.join(__dirname, '../../../.env') });

const ConfigSchema = z.object({
    NEON_DATABASE_URL: z.string().url('Must be a valid Postgres URL for the Control Plane'),
    // Depending on architecture, the default EDGE DB could be needed, or optional.
    LOCAL_EDGE_DATABASE_URL: z.string().url().optional(),
    NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

let config: z.infer<typeof ConfigSchema>;

try {
    config = ConfigSchema.parse(process.env);
} catch (error) {
    console.warn('[DB Config] Warning: Missing or invalid environment variables. Some database features may fail.');
    // Provide a dummy config so the module can load, but connections will fail later if actually used
    config = {
        NEON_DATABASE_URL: process.env.NEON_DATABASE_URL || '',
        LOCAL_EDGE_DATABASE_URL: process.env.LOCAL_EDGE_DATABASE_URL || '',
        NODE_ENV: 'development',
    };
}

export { config };

