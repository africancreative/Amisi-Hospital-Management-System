/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['@amisi/database', '@amisi/auth', '@amisi/ui', '@amisi/realtime', '@amisi/sync-engine'],
};

export default nextConfig;
