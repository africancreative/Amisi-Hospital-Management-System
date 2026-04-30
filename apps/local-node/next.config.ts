import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Required for Tauri
  output: 'export',
};

export default nextConfig;
