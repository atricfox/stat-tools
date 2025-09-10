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
  typedRoutes: true,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  poweredByHeader: false,
  generateBuildId: () => 'build',
  
  // Force Node.js runtime to avoid edge-runtime issues
  serverExternalPackages: ['@edge-runtime/cookies'],
  
  
  // Enhanced webpack configuration for code splitting
  webpack: (config, { dev, isServer }) => {
    // Fix Node.js polyfills
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

    // Fix edge-runtime compatibility by providing polyfills
    if (isServer) {
      const webpack = require('webpack');
      config.plugins = config.plugins || [];
      config.plugins.push(
        new webpack.DefinePlugin({
          'self': 'globalThis',
        })
      );
    }
    // Production optimizations
    if (!dev) {
      // Split chunks configuration
      config.optimization.splitChunks = {
        chunks: 'all',
        cacheGroups: {
          // Vendor libraries
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: 10,
            reuseExistingChunk: true,
          },
          // React and Next.js core
          framework: {
            test: /[\\/]node_modules[\\/](react|react-dom|next)[\\/]/,
            name: 'framework',
            priority: 40,
            reuseExistingChunk: true,
          },
          // Mathematical and statistical libraries
          math: {
            test: /[\\/]node_modules[\\/](decimal\.js|mathjs|d3|plotly\.js)[\\/]/,
            name: 'math-libs',
            priority: 30,
            reuseExistingChunk: true,
          },
          // UI libraries
          ui: {
            test: /[\\/]node_modules[\\/](@headlessui|@heroicons|lucide-react|tailwindcss)[\\/]/,
            name: 'ui-libs',
            priority: 20,
            reuseExistingChunk: true,
          },
          // Calculator components
          calculator: {
            test: /[\\/]src[\\/]components[\\/]calculator[\\/]/,
            name: 'calculator-components',
            priority: 15,
            reuseExistingChunk: true,
            minChunks: 2,
          },
          // Statistical computation modules
          statistics: {
            test: /[\\/]src[\\/]lib[\\/](calculations|high-precision|optimized)[\\/]/,
            name: 'statistics',
            priority: 25,
            reuseExistingChunk: true,
          },
          // Common components
          common: {
            test: /[\\/]src[\\/]components[\\/]common[\\/]/,
            name: 'common-components',
            priority: 10,
            minChunks: 2,
            reuseExistingChunk: true,
          },
          // Default
          default: {
            minChunks: 2,
            priority: -10,
            reuseExistingChunk: true,
          },
        },
      };

      // Module concatenation for better tree shaking
      config.optimization.concatenateModules = true;
      
      // Better chunk naming for debugging
      config.optimization.chunkIds = 'named';
      config.optimization.moduleIds = 'named';
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
