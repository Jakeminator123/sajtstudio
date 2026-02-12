import type { NextConfig } from 'next'
import path from 'path'

const nextConfig: NextConfig = {
  // Set workspace root to prevent multiple lockfile warning
  outputFileTracingRoot: path.join(__dirname),

  // Temporarily disable React Compiler to fix webpack module loading issues with dynamic imports
  // reactCompiler: true,

  // Disable Turbopack (use webpack instead) - fixes TurbopackInternalError
  // Turbopack is enabled by default in Next.js 16, but has bugs in 16.0.1
  webpack: (config, { isServer, dev }) => {
    // Fix webpack module loading issues with dynamic imports
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      }
    }

    // Workaround: Next 16 + React 19 can intermittently throw
    // "Cannot read properties of undefined (reading 'call')" from webpack.js in dev.
    // Disabling React Fast Refresh eliminates the crash at the cost of HMR convenience.
    if (dev && !isServer && Array.isArray(config.plugins)) {
      config.plugins = config.plugins.filter((plugin: any) => {
        const name = plugin?.constructor?.name ?? ''
        return !name.includes('ReactRefresh')
      })
    }

    // Fix worker-related deployment issues (PRODUCTION ONLY)
    // In dev, aggressive optimization/minification can break Fast Refresh/HMR.
    // Ensure optimization config exists.
    if (!config.optimization) {
      config.optimization = {}
    }

    if (dev) {
      // Keep dev predictable/stable for HMR
      config.optimization.minimize = false
    } else {
      // Production build: minimize and disable parallel workers to avoid worker null errors
      config.optimization.minimize = true

      if (config.optimization.minimizer) {
        config.optimization.minimizer = config.optimization.minimizer.map((minimizer: any) => {
          if (minimizer && typeof minimizer === 'object' && minimizer.constructor) {
            // Ensure minimizers don't use workers
            if (minimizer.options) {
              minimizer.options.parallel = false
            }
          }
          return minimizer
        })
      }
    }

    // NOTE: Avoid overriding webpack `target` in Next.js dev builds.
    // It can destabilize the runtime/HMR in Next 16 + React 19.

    return config
  },

  // Image optimization
  images: {
    formats: ['image/avif', 'image/webp'],
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
        key: 'Strict-Transport-Security',
        value: 'max-age=31536000; includeSubDomains; preload',
      },
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      {
        key: 'X-Frame-Options',
        value: 'SAMEORIGIN',
      },
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      {
        key: 'Cross-Origin-Opener-Policy',
        value: 'same-origin-allow-popups',
      },
      {
        key: 'Cross-Origin-Embedder-Policy',
        value: 'unsafe-none', // Required for D-ID chatbot to work
      },
      {
        key: 'Permissions-Policy',
        // Allow microphone for D‑ID chatbot (voice features). Keep camera/geolocation disabled.
        value:
          'camera=(), microphone=(self "https://agent.d-id.com"), geolocation=(), interest-cohort=()',
      },
      {
        key: 'Content-Security-Policy',
        value: [
          // Default: only allow same-origin
          "default-src 'self'",

          // Scripts: unsafe-inline required for Next.js hydration, unsafe-eval for D-ID chatbot
          // vusercontent.net for preview proxied content, sajtmaskin-1.onrender.com for proxied sajtmaskin
          "script-src 'self' blob: 'unsafe-inline' 'unsafe-eval' https://agent.d-id.com https://fonts.googleapis.com https://*.vusercontent.net https://sajtmaskin-1.onrender.com",

          // Styles: unsafe-inline required for Next.js styled-jsx and emotion
          // vusercontent.net for preview proxied content, sajtmaskin-1.onrender.com for proxied sajtmaskin
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://*.vusercontent.net https://sajtmaskin-1.onrender.com",

          // Images: allow data URIs for inline images, https for external
          "img-src 'self' data: https: blob:",

          // Fonts: Google Fonts + vusercontent.net + sajtmaskin
          "font-src 'self' data: https://fonts.gstatic.com https://*.vusercontent.net https://sajtmaskin-1.onrender.com",

          // API connections: D-ID chatbot + required CDNs + vusercontent.net for previews + sajtmaskin
          "connect-src 'self' https://agent.d-id.com https://api.d-id.com https://agents-results.d-id.com https://create-images-results.d-id.com https://notifications.d-id.com wss://notifications.d-id.com https://fonts.googleapis.com https://fonts.gstatic.com https://cdn.jsdelivr.net https://raw.githack.com https://api-js.mixpanel.com https://browser-intake-us3-datadoghq.com https://app.launchdarkly.com wss://agent.d-id.com wss://*.stt.speech.microsoft.com https://*.stt.speech.microsoft.com https://*.vusercontent.net https://sajtmaskin-1.onrender.com",

          // Media: self and D-ID for avatar videos + sajtmaskin
          "media-src 'self' https://agents-results.d-id.com blob: https://*.vusercontent.net https://sajtmaskin-1.onrender.com",

          // Frames: D-ID chatbot iframe + vusercontent.net previews + sajtmaskin + selected embeds
          "frame-src 'self' https://agent.d-id.com https://*.vusercontent.net https://sajtmaskin-1.onrender.com https://v0-juice-factory-website.vercel.app https://v0-roboticscare-website-design.vercel.app https://v0-architecture-website-design-nu-nine.vercel.app https://landningssida.vercel.app https://sajtmaskin.vercel.app https://v0-build-new-website-two.vercel.app",

          // Workers: blob for inlined workers
          "worker-src 'self' blob:",

          // Security hardening
          "object-src 'none'",
          "base-uri 'self'",
          "form-action 'self' https://sajtmaskin-1.onrender.com",
          "frame-ancestors 'self'",
          'upgrade-insecure-requests',
        ].join('; '),
      },
    ]

    return [
      // Security headers for all routes
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Cache headers for static assets
      {
        source: '/:all*(svg|jpg|jpeg|png|gif|ico|webp|avif)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(mp4|webm|mov|avi)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/:all*(woff|woff2|ttf|otf|eot)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ]
  },
}

export default nextConfig
