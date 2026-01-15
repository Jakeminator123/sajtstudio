import PageTransition from '@/components/layout/PageTransition'
import SkipLink from '@/components/layout/SkipLink'
import ErrorBoundary from '@/components/ui/ErrorBoundary'
import RouteAwareBanners from '@/components/layout/RouteAwareBanners'
import DidChatbotLoader from '@/components/integrations/DidChatbotLoader'
import PageViewTracker from '@/components/analytics/PageViewTracker'
import Providers from '@/components/providers/Providers'
import {
  generateSchemaScript,
  getOrganizationSchema,
  getServiceSchema,
  getWebSiteSchema,
} from '@/lib/structuredData'
import type { Metadata } from 'next'
import { Dancing_Script, Inter, Press_Start_2P } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap', // Optimize font loading
  preload: true, // Preload critical font
})

const dancingScript = Dancing_Script({
  subsets: ['latin'],
  variable: '--font-handwriting',
  weight: ['400', '500', '600', '700'],
  display: 'swap', // Optimize font loading
})

const pressStart2P = Press_Start_2P({
  subsets: ['latin'],
  variable: '--font-pixel',
  weight: '400',
  display: 'swap', // Optimize font loading
})

export const metadata: Metadata = {
  title: {
    default: 'Sajtstudio – Modern webbdesign och AI-generering av webbplatser',
    template: '%s | Sajtstudio',
  },
  description:
    'Skräddarsydda, toppmoderna hemsidor och AI-genererade webbplatser för framgångsrika företag. Vi erbjuder både skräddarsydd webbutveckling med React och Next.js, samt AI-drivna verktyg för att skapa professionella sajter på minuter. Perfekt för företag som vill ha en unik hemsida eller snabbt generera en webbplats med vår AI-plattform SajtMaskin.',
  keywords: [
    'webbdesign',
    'hemsidor',
    'webbutveckling',
    'AI-generering',
    'AI webbplatser',
    'SajtMaskin',
    'artificiell intelligens',
    'automatisk webbplatsgenerering',
    'Sverige',
    'Stockholm',
    'Next.js',
    'React',
    'modern design',
    'företagshemsidor',
    'responsiv design',
    'AI templates',
    'webbplatsgenerator',
  ],
  authors: [{ name: 'Sajtstudio', url: 'https://www.sajtstudio.se' }],
  creator: 'Sajtstudio',
  publisher: 'Sajtstudio',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL('https://www.sajtstudio.se'),
  alternates: {
    canonical: '/',
    languages: {
      'sv-SE': '/',
    },
  },
  openGraph: {
    title: 'Sajtstudio – Modern webbdesign för framgångsrika företag',
    description:
      'Skräddarsydda, toppmoderna hemsidor för utvalda företag som vill leda inom sin bransch.',
    url: 'https://www.sajtstudio.se',
    siteName: 'Sajtstudio',
    images: [
      {
        url: '/logo.svg',
        width: 1200,
        height: 630,
        alt: 'Sajtstudio - Bygger hemsidor som betyder något',
      },
    ],
    locale: 'sv_SE',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Sajtstudio – Modern webbdesign',
    description: 'Skräddarsydda, toppmoderna hemsidor för utvalda företag',
    images: ['/logo.svg'],
    creator: '@sajtstudio',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: '/favicon.svg',
    shortcut: '/favicon.svg',
    apple: '/favicon.svg',
  },
  manifest: '/site.webmanifest',
}

export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const isProd = process.env.NODE_ENV === 'production'

  // Best practice: make invasive client-side handlers configurable.
  // Default: enabled in production, disabled in dev unless explicitly turned on.
  const parseEnvBool = (value: string | undefined): boolean | undefined => {
    if (!value) return undefined
    const v = value.trim().toLowerCase()
    if (['true', '1', 'yes', 'y', 'on'].includes(v)) return true
    if (['false', '0', 'no', 'n', 'off'].includes(v)) return false
    return undefined
  }

  const globalHandlerFlag = parseEnvBool(process.env.NEXT_PUBLIC_ENABLE_GLOBAL_ERROR_HANDLER)
  const enableGlobalErrorHandler = globalHandlerFlag ?? (isProd ? true : false)

  return (
    <html
      lang="sv"
      className={`${inter.variable} ${dancingScript.variable} ${pressStart2P.variable} overflow-x-hidden w-full dark`}
      data-scroll-behavior="smooth"
      suppressHydrationWarning
    >
      <head>
        {/* Theme initialization script - runs before render to prevent flash */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('theme');
                  if (theme === 'light') {
                    document.documentElement.classList.remove('dark');
                    document.documentElement.classList.add('light');
                  } else {
                    // Default to dark (ignore system preference - dark is always default)
                    document.documentElement.classList.remove('light');
                    document.documentElement.classList.add('dark');
                  }
                } catch (e) {}
              })();
            `,
          }}
        />
        {/* Removed passive touch listener patch: it caused runtime errors in some environments. */}
        {/* Preconnect budget: keep under Lighthouse 4-connection warning */}
        {/* 1 & 2: Google Fonts */}
        <link rel="preconnect" href="https://fonts.googleapis.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Hero background loaded naturally by Next.js Image component with priority.
            Explicit preload removed - it caused warnings when intro animation delayed usage.
            Next.js Image with priority={true} handles LCP optimization automatically. */}
        {/* Avoid prefetching large media in <head>; it can steal bandwidth from LCP.
            Next.js will prefetch routes opportunistically via <Link> when appropriate. */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateSchemaScript([
            getOrganizationSchema(),
            getWebSiteSchema(),
            getServiceSchema(),
          ])}
        />
      </head>
      <body
        className="antialiased overflow-x-hidden w-full max-w-screen relative"
        suppressHydrationWarning
      >
        <Providers>
          <PageViewTracker />
          <RouteAwareBanners />
          <SkipLink />
          {/* Error boundary disabled in development to avoid webpack issues */}
          {process.env.NODE_ENV === 'production' ? (
            <ErrorBoundary>
              <PageTransition>{children}</PageTransition>
            </ErrorBoundary>
          ) : (
            <PageTransition>{children}</PageTransition>
          )}
          {/* Global error handler: keep prod clean from third‑party fetch noise */}
          {enableGlobalErrorHandler && (
            <Script
              id="global-error-handler"
              strategy="afterInteractive"
              src="/scripts/global-error-handler.js"
            />
          )}
          <DidChatbotLoader />
        </Providers>
      </body>
    </html>
  )
}
