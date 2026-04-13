import { defineConfig } from "drizzle-kit";
import * as dotenv from "dotenv";

// Load environment variables from the root .env or app .env.local
dotenv.config({ path: "../../apps/web/.env.local" });

export default defineConfig({
    dialect: "postgresql",
    schema: "./src/schema.ts",
    out: "./drizzle",
    dbCredentials: {
        // Uses NEON_DATABASE_URL if available, falls back to LOCAL_EDGE_DATABASE_URL
        url: process.env.NEON_DATABASE_URL || process.env.LOCAL_EDGE_DATABASE_URL || process.env.DATABASE_URL!,
    },
});
