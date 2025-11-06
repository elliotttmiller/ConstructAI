/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: ["*.preview.same-app.com"],
  // Optimize page transitions and loading
  reactStrictMode: false, // Disable strict mode for faster development
  // Note: swcMinify is now the default in Next.js 15+ and has been removed
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  eslint: {
    // Completely disable ESLint during builds
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Skip TypeScript type checking during build
    ignoreBuildErrors: true,
  },
  experimental: {
    optimizeCss: true, // Optimize CSS loading
    optimizePackageImports: ['lucide-react', '@radix-ui/react-icons'], // Tree-shake icon libraries
  },
  images: {
    unoptimized: true,
    domains: [
      "source.unsplash.com",
      "images.unsplash.com",
      "ext.same-assets.com",
      "ugc.same-assets.com",
    ],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "source.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "images.unsplash.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ext.same-assets.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "ugc.same-assets.com",
        pathname: "/**",
      },
    ],
  },
};

module.exports = nextConfig;
