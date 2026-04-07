import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: true,
  serverExternalPackages: ['@amisi/database'],
  transpilePackages: [
    "@amisi/auth",
    "@amisi/database",
    "@amisi/realtime",
    "@amisi/sync-engine",
    "@amisi/ui"
  ],
};

export default nextConfig;
