import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Required for Tauri static export in production
  ...(process.env.BUILD_TARGET === 'tauri' || process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
};

export default nextConfig;
