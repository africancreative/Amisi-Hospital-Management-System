import path from "path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: path.join(__dirname, "../../"),
  output: process.env.STANDALONE_BUILD === 'true' ? 'standalone' : undefined,
  serverExternalPackages: ['@amisimedos/db'],
  transpilePackages: [
    "@amisimedos/auth",
    "@amisimedos/chat",
    "@amisimedos/sync",
    "@amisimedos/ui"
  ],
  outputFileTracingIncludes: {
    "/**/*": [
      "../../packages/db/generated/control-client/**/*",
      "../../packages/db/generated/tenant-client/**/*",
    ],
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
        ],
      },
    ];
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
        // Redirection Firewall: Swap infrastructure logic for web-safe mocks
        config.resolve.alias = {
            ...config.resolve.alias,
            './provision': path.resolve(__dirname, '../../packages/db/src/provision.web.ts'),
            '@amisimedos/db/management': path.resolve(__dirname, '../../packages/db/src/provision.web.ts'),
        };

        config.resolve.fallback = {
            ...config.resolve.fallback,
            fs: false,
            path: false,
            child_process: false,
            crypto: false,
            os: false,
            dotenv: false,
            net: false,
            tls: false,
            dns: false,
            readline: false,
        };
    }
    return config;
  },
};

export default nextConfig;




