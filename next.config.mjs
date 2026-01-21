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
  // Fix for Turbopack chunk loading issues
  experimental: {
    turbo: {
      resolveAlias: {
        // Ensure consistent module resolution
      },
    },
  },
}

export default nextConfig
