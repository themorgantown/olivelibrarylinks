/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  // Bundle optimization settings
  output: 'standalone',
  poweredByHeader: false,
  serverExternalPackages: ['googleapis', 'google-auth-library'],
  bundlePagesRouterDependencies: true,
  // Enable compression
  compress: true,
  // Enable experimental optimizations (stable ones only)
  experimental: {
    optimizePackageImports: ['react', 'react-dom', '@vercel/analytics'],
    serverMinification: true,
  },
  // Optimize for better caching
  generateEtags: true,
  async headers() {
    return [
      {
        source: '/api/links',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=300, stale-while-revalidate=3600',
          },
        ],
      },
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
      // Cache static assets
      {
        source: '/favicon.ico',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
};

export default nextConfig;

