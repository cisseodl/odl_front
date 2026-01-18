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
