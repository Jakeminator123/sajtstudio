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
      config.target = ['web', 'es2022']; // Updated to ES2022 for better optimization
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

  // Headers for security and caching
  async headers() {
    const securityHeaders = [
      {
        key: "Strict-Transport-Security",
        value: "max-age=31536000; includeSubDomains; preload",
      },
      {
        key: "X-Content-Type-Options",
        value: "nosniff",
      },
      {
        key: "X-Frame-Options",
        value: "SAMEORIGIN",
      },
      {
        key: "X-XSS-Protection",
        value: "1; mode=block",
      },
      {
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
      },
      {
        key: "Cross-Origin-Opener-Policy",
        value: "same-origin-allow-popups",
      },
      {
        key: "Cross-Origin-Embedder-Policy",
        value: "unsafe-none", // Required for D-ID chatbot to work
      },
      {
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
      },
      {
        key: "Content-Security-Policy",
        value: [
          "default-src 'self'",
          "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://agent.d-id.com https://fonts.googleapis.com", // unsafe-eval needed for D-ID, unsafe-inline for Next.js inline scripts
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com", // unsafe-inline needed for Next.js
          "img-src 'self' data: https: blob:", // Allow images from anywhere (needed for D-ID and external content)
          "font-src 'self' data: https://fonts.gstatic.com",
          "connect-src 'self' https://agent.d-id.com https://api.d-id.com https://agents-results.d-id.com https://create-images-results.d-id.com https://fonts.googleapis.com https://fonts.gstatic.com wss://agent.d-id.com", // WebSocket for D-ID
          "media-src 'self' https://agents-results.d-id.com blob:",
          "frame-src 'self' https://agent.d-id.com",
          "worker-src 'self' blob:",
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self'",
          "frame-ancestors 'self'",
          "upgrade-insecure-requests",
        ].join("; "),
      },
    ];

    return [
      // Security headers for all routes
      {
        source: "/:path*",
        headers: securityHeaders,
      },
      // Cache headers for static assets
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
