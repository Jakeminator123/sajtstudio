import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Set workspace root to prevent multiple lockfile warning
  outputFileTracingRoot: path.join(__dirname),

  // Temporarily disable React Compiler to fix webpack module loading issues with dynamic imports
  // reactCompiler: true,

  // Add empty turbopack config to silence build errors
  turbopack: {},

  // Disable Turbopack (use webpack instead) - fixes TurbopackInternalError
  // Turbopack is enabled by default in Next.js 16, but has bugs in 16.0.1
  webpack: (config, { isServer }) => {
    // Fix webpack module loading issues with dynamic imports
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }

    // Fix worker-related deployment issues
    // Ensure optimization config exists and doesn't use workers
    if (!config.optimization) {
      config.optimization = {};
    }

    // Disable parallel processing to prevent worker null errors
    config.optimization.minimize = true;

    // Set maxParallelWorkers to prevent worker issues
    if (config.optimization.minimizer) {
      config.optimization.minimizer = config.optimization.minimizer.map((minimizer: any) => {
        if (minimizer && typeof minimizer === 'object' && minimizer.constructor) {
          // Ensure minimizers don't use workers
          if (minimizer.options) {
            minimizer.options.parallel = false;
          }
        }
        return minimizer;
      });
    }

    // Target modern browsers to reduce legacy JavaScript polyfills
    if (!isServer) {
      config.target = ['web', 'es2020'];
    }

    return config;
  },

  // Image optimization
  images: {
    formats: ["image/avif", "image/webp"],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
  },

  // Performance optimizations
  experimental: {
    optimizeCss: true, // Enable CSS optimization to reduce render blocking
    // Temporarily disabled optimizePackageImports to avoid webpack module loading issues
    // optimizePackageImports: [
    //   "framer-motion",
    //   "@/config",
    // ],
  },

  // Compression
  compress: true,

  // Headers for better caching
  async headers() {
    return [
      {
        source: "/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(mp4|webm|mov|avi)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/:all*(woff|woff2|ttf|otf|eot)",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
      {
        source: "/_next/static/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
