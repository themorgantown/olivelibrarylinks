/** @type {import('next').NextConfig} */
/**
 * Next.js configuration object for the Olive Library Links application.
 * 
 * @property {boolean} reactStrictMode - Enables React's Strict Mode for highlighting potential problems in the application during development
 * @property {boolean} productionBrowserSourceMaps - Disables source map generation in production builds to reduce bundle size and protect source code
 * @property {Object} compiler - Compiler-level optimizations for the Next.js application
 * @property {boolean} compiler.removeConsole - Removes console statements from production builds to reduce bundle size and prevent logging in production
 * @property {string} output - Sets the build output mode to 'export' for static HTML export, enabling deployment to static hosting services
 * @property {string} basePath - Sets the base path prefix for the application, used when deploying to a subdirectory
 * @property {string} assetPrefix - Sets the prefix for static assets (CSS, JS, images), should match basePath for subdirectory deployments
 * @property {boolean} poweredByHeader - Disables the 'X-Powered-By: Next.js' HTTP header for security through obscurity
 * @property {boolean} compress - Enables gzip compression for responses to reduce bandwidth usage
 * @property {boolean} generateEtags - Enables ETag generation for HTTP caching, allowing browsers to cache unchanged resources
 */
const nextConfig = {
  reactStrictMode: true,
  productionBrowserSourceMaps: false,
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  output: 'export',
  basePath: '/olivelibrarylinks/source',
  assetPrefix: '/olivelibrarylinks/source',
  poweredByHeader: false,
  compress: true,
  generateEtags: true,
};

export default nextConfig;
