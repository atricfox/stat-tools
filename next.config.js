// Fix self reference before any imports
if (typeof globalThis !== 'undefined' && typeof globalThis.self === 'undefined') {
  globalThis.self = globalThis;
}
if (typeof global !== 'undefined' && typeof global.self === 'undefined') {
  global.self = global;
}

/** @type {import('next').NextConfig} */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Permissions-Policy', value: 'geolocation=(), microphone=(), camera=()' },
]

const nextConfig = {
  eslint: {
    // Temporarily ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Dangerously allow production builds to successfully complete even if your project has type errors
    ignoreBuildErrors: true,
  },
  experimental: {
    // Disable worker threads to prevent runtime issues
    workerThreads: false,
  },
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
  generateBuildId: () => 'build',
  
  // Enhanced webpack configuration for code splitting
  webpack: (config, { dev, isServer }) => {
    // Fix Node.js polyfills for client-side bundles
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        stream: false,
        assert: false,
        http: false,
        https: false,
        os: false,
        url: false,
      };
    }
    
    // Fix self reference issue for both server and client
    const webpack = require('webpack');
    config.plugins = config.plugins || [];
    config.plugins.push(
      new webpack.DefinePlugin({
        'typeof self': isServer ? '"undefined"' : '"object"',
        ...(isServer && { 'self': 'globalThis' }),
      })
    );
    
    // Minimal optimizations to avoid webpack runtime issues
    if (!dev) {
      // Use Next.js default optimizations only
      config.optimization = {
        ...config.optimization,
        // Remove custom splitChunks that might cause issues
      };
    }

    // Performance optimizations
    if (!isServer) {
      // Resolve alias for better tree shaking
      config.resolve.alias = {
        ...config.resolve.alias,
        '@/lib/calculations': require.resolve('./src/lib/calculations.ts'),
        '@/lib/optimized-calculations': require.resolve('./src/lib/optimized-calculations.ts'),
      };
    }

    return config;
  },
  
  // Bundle analyzer configuration (development)
  ...(process.env.ANALYZE === 'true' && {
    webpack: (config, { isServer }) => {
      if (!isServer) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'server',
            openAnalyzer: true,
          })
        );
      }
      return config;
    },
  }),
  
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
    ]
  },
}

module.exports = nextConfig
