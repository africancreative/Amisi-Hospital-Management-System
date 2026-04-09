/** @type {import('next').NextConfig} */
const path = require('path');

const nextConfig = {
  transpilePackages: ['@amisi/database', '@amisi/auth', '@amisi/ui', '@amisi/realtime', '@amisi/sync-engine'],
  webpack: (config, { isServer }) => {
    if (isServer) {
      config.externals = [...(config.externals || []), { '@prisma/client': '@prisma/client' }];
    }
    return config;
  },
  experimental: {
    outputFileTracingRoot: path.join(__dirname, '../../'),
    outputFileTracingExcludes: {
      '/**': [
        '**/node_modules/@aws-sdk/**',
        '**/node_modules/sharp/**',
      ],
    },
  },
};

module.exports = nextConfig;
