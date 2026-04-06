import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/client/control', '@prisma/client/tenant'],
  transpilePackages: [
    "@amisi/auth",
    "@amisi/database",
    "@amisi/realtime",
    "@amisi/sync-engine",
    "@amisi/ui"
  ],
};

export default nextConfig;
