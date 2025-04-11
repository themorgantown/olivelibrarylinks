import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Enable Vercel Data Cache
    useDataCache: true,
  },
};

export default nextConfig;
