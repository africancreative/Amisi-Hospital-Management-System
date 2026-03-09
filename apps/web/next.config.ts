import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@prisma/client', '@prisma/client/control', '@prisma/client/tenant'],
  transpilePackages: ["@amisi/database"]
};

export default nextConfig;
