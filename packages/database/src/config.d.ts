import { z } from 'zod';
declare const ConfigSchema: z.ZodObject<{
    NEON_DATABASE_URL: z.ZodString;
    LOCAL_EDGE_DATABASE_URL: z.ZodOptional<z.ZodString>;
    NODE_ENV: z.ZodDefault<z.ZodEnum<["development", "production", "test"]>>;
}, "strip", z.ZodTypeAny, {
    NEON_DATABASE_URL: string;
    NODE_ENV: "development" | "production" | "test";
    LOCAL_EDGE_DATABASE_URL?: string | undefined;
}, {
    NEON_DATABASE_URL: string;
    LOCAL_EDGE_DATABASE_URL?: string | undefined;
    NODE_ENV?: "development" | "production" | "test" | undefined;
}>;
declare let config: z.infer<typeof ConfigSchema>;
export { config };
