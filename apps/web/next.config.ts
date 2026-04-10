import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  serverExternalPackages: ['@amisi/database'],
  transpilePackages: [
    "@amisi/auth",
    "@amisi/realtime",
    "@amisi/sync-engine",
    "@amisi/ui"
  ],
  experimental: {
    outputFileTracingIncludes: {
      "/**/*": [
        "../../packages/database/generated/control-client/**/*",
        "../../packages/database/generated/tenant-client/**/*",
      ],
    },
  },
};

export default nextConfig;
