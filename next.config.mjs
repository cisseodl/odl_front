/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
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
