/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'api.smart-odc.com',
        pathname: '/awsodclearning/api/files/**',
      },
      {
        protocol: 'https',
        hostname: 'smart-odc.com',
        pathname: '/**',
      },
    ],
  },
  // Headers pour compatibilité TV (type MIME CSS)
  async headers() {
    return [
      {
        source: '/:path*.css',
        headers: [
          {
            key: 'Content-Type',
            value: 'text/css; charset=utf-8',
          },
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
  // Optimisation du preload CSS pour éviter les avertissements
  // Désactiver le preload automatique des CSS chunks non critiques
  optimizeFonts: true,
  // Fix for Turbopack chunk loading issues
  experimental: {
    turbo: {
      resolveAlias: {
        // Ensure consistent module resolution
      },
    },
    // Optimiser le chargement CSS
    optimizeCss: true,
  },
  // Compiler options pour optimiser le bundle
  compiler: {
    // Supprimer les console.log en production (optionnel)
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
}

export default nextConfig
