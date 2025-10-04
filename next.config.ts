import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  // Optimize for Vercel deployment
  output: 'standalone',
  // Suppress hydration warnings in development for browser extension compatibility
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // Experimental features to improve performance
  experimental: {
    // optimizeCss: true, // Disabled due to critters dependency issues
  },
  // External packages for server components
  serverExternalPackages: [],
  // Image optimization for Vercel
  images: {
    unoptimized: false,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Output file tracing root to fix workspace warning
  outputFileTracingRoot: __dirname,
  // ESLint configuration
  eslint: {
    ignoreDuringBuilds: true,
  },
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
