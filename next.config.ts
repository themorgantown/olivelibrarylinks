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
  serverExternalPackages: [],
  bundlePagesRouterDependencies: true,
  experimental: {
    optimizePackageImports: ['react', 'react-dom'],
    serverMinification: true,
  },
  async headers() {
    return [
      {
        source: '/api/links',
        headers: [
          {
            key: 'Cache-Control',
            value: 's-maxage=300, stale-while-revalidate',
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;

