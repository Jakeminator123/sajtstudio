import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import PageTransition from "@/components/PageTransition";
import SkipLink from "@/components/SkipLink";
import ErrorBoundary from "@/components/ErrorBoundary";
import ChatFallback from "@/components/ChatFallback";
import {
  getOrganizationSchema,
  getWebSiteSchema,
  generateSchemaScript,
} from "@/lib/structuredData";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: {
    default: "Sajtstudio – Modern webbdesign för framgångsrika företag",
    template: "%s | Sajtstudio",
  },
  description:
    "Skräddarsydda, toppmoderna hemsidor för utvalda företag som vill leda inom sin bransch. Vi bygger hemsidor som betyder något.",
  keywords: [
    "webbdesign",
    "hemsidor",
    "webbutveckling",
    "Sverige",
    "Stockholm",
    "Next.js",
    "React",
    "modern design",
    "företagshemsidor",
    "responsiv design",
  ],
  authors: [{ name: "Sajtstudio", url: "https://www.sajtstudio.se" }],
  creator: "Sajtstudio",
  publisher: "Sajtstudio",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL("https://www.sajtstudio.se"),
  alternates: {
    canonical: "/",
    languages: {
      "sv-SE": "/",
    },
  },
  openGraph: {
    title: "Sajtstudio – Modern webbdesign för framgångsrika företag",
    description:
      "Skräddarsydda, toppmoderna hemsidor för utvalda företag som vill leda inom sin bransch.",
    url: "https://www.sajtstudio.se",
    siteName: "Sajtstudio",
    images: [
      {
        url: "/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "Sajtstudio - Bygger hemsidor som betyder något",
      },
    ],
    locale: "sv_SE",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Sajtstudio – Modern webbdesign",
    description: "Skräddarsydda, toppmoderna hemsidor för utvalda företag",
    images: ["/twitter-image.jpg"],
    creator: "@sajtstudio",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
    apple: "/favicon.svg",
  },
  manifest: "/site.webmanifest",
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="sv" className={inter.variable} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        {/* Preload critical resources */}
        <link rel="preload" href="/logo.svg" as="image" type="image/svg+xml" />
        <link
          rel="preload"
          href="/images/hero/alt_background.webp"
          as="image"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateSchemaScript([
            getOrganizationSchema(),
            getWebSiteSchema(),
          ])}
        />
      </head>
      <body className="antialiased">
        <SkipLink />
        <ErrorBoundary>
          <PageTransition>{children}</PageTransition>
        </ErrorBoundary>
        {/* Global error handler for unhandled fetch errors (e.g., from D-ID chatbot, antivirus, etc.) */}
        <Script
          id="global-error-handler"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Initialize status
                try { 
                  window.__didStatus = window.__didStatus || 'pending';
                } catch(_) {}
                
                // Suppress unhandled fetch errors from third-party scripts
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                  const url = args[0];
                  const urlString = typeof url === 'string' ? url : (url?.url || '');
                  const isDIDRequest = urlString && (
                    urlString.includes('d-id.com') || 
                    urlString.includes('agent.d-id.com') ||
                    urlString.includes('api.d-id.com')
                  );
                  
                  return originalFetch.apply(this, args).catch(function(error) {
                    // Silently handle D-ID fetch errors - don't log or throw
                    if (isDIDRequest) {
                      try { 
                        window.__didStatus = 'error';
                        window.dispatchEvent(new Event('did-status-change'));
                      } catch(_) {}
                      // Return a rejected promise but don't log it
                      return Promise.reject(error);
                    }
                    // Log other fetch errors only in development
                    if (typeof process !== 'undefined' && process.env && process.env.NODE_ENV === 'development') {
                      console.warn('Fetch error:', error);
                    }
                    return Promise.reject(error);
                  });
                };
                
                // Catch unhandled promise rejections from fetch (including from antivirus/extensions)
                window.addEventListener('unhandledrejection', function(event) {
                  const error = event.reason;
                  const errorString = error ? (error.message || error.toString() || '') : '';
                  const stackString = error?.stack || '';
                  
                  // Check if it's a D-ID related error or fetch error
                  const isDIDError = (
                    errorString.includes('d-id.com') ||
                    errorString.includes('Failed to fetch') ||
                    errorString.includes('NetworkError') ||
                    stackString.includes('agent.d-id.com') ||
                    stackString.includes('d-id.com')
                  );
                  
                  if (isDIDError) {
                    // Suppress D-ID related fetch errors (including from antivirus blocking)
                    try { 
                      window.__didStatus = 'error';
                      window.dispatchEvent(new Event('did-status-change'));
                    } catch(_) {}
                    event.preventDefault();
                    return false;
                  }
                }, true); // Use capture phase to catch early
                
                // Also listen for error events that might be from fetch failures
                window.addEventListener('error', function(event) {
                  const error = event.error;
                  const message = event.message || '';
                  const filename = event.filename || '';
                  
                  // Check if it's a fetch-related error from D-ID
                  if (
                    (message.includes('Failed to fetch') || message.includes('fetch')) &&
                    (filename.includes('d-id.com') || filename.includes('agent.d-id.com'))
                  ) {
                    try { 
                      window.__didStatus = 'error';
                      window.dispatchEvent(new Event('did-status-change'));
                    } catch(_) {}
                    event.preventDefault();
                    return false;
                  }
                }, true);
              })();
            `,
          }}
        />
        {/* D-ID Chatbot */}
        <Script
          id="d-id-chatbot"
          strategy="lazyOnload"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  // Check if script already exists
                  if (document.querySelector('script[data-name="did-agent"]')) {
                    return;
                  }
                  
                  const script = document.createElement('script');
                  script.type = 'module';
                  script.src = 'https://agent.d-id.com/v2/index.js';
                  script.setAttribute('data-mode', 'fabio');
                  script.setAttribute('data-client-key', 'Z29vZ2xlLW9hdXRoMnwxMTUyNzg1NzQzNDM2NzE1OTQ5ODU6VFFrU1I3SUNxWHptZHg3NHlNVHJ0');
                  script.setAttribute('data-agent-id', 'v2_agt_S5KManKi');
                  script.setAttribute('data-name', 'did-agent');
                  script.setAttribute('data-monitor', 'true');
                  script.setAttribute('data-orientation', 'horizontal');
                  script.setAttribute('data-position', 'right');
                  
                  // Add error handling
                  script.onerror = function() {
                    try { 
                      window.__didStatus = 'error';
                      window.dispatchEvent(new Event('did-status-change'));
                    } catch(_) {}
                  };
                  
                  // Check if chatbot actually loaded after a delay
                  script.onload = function() {
                    // Give it a moment to initialize, then check if it's actually working
                    setTimeout(function() {
                      try {
                        // Check if D-ID agent element exists
                        const agentElement = document.querySelector('[data-name="did-agent"]') || 
                                           document.querySelector('did-agent') ||
                                           document.querySelector('[id*="did"]');
                        if (agentElement) {
                          window.__didStatus = 'loaded';
                          window.dispatchEvent(new Event('did-status-change'));
                        } else {
                          // Agent script loaded but element not found - might be blocked
                          window.__didStatus = 'error';
                          window.dispatchEvent(new Event('did-status-change'));
                        }
                      } catch(_) {
                        window.__didStatus = 'error';
                        window.dispatchEvent(new Event('did-status-change'));
                      }
                    }, 3000);
                  };
                  
                  // Also set a timeout - if status is still pending after 5 seconds, mark as error
                  setTimeout(function() {
                    try {
                      if (window.__didStatus === 'pending') {
                        window.__didStatus = 'error';
                        window.dispatchEvent(new Event('did-status-change'));
                      }
                    } catch(_) {}
                  }, 5000);
                  
                  document.body.appendChild(script);
                } catch (error) {
                  try { 
                    window.__didStatus = 'error';
                    window.dispatchEvent(new Event('did-status-change'));
                  } catch(_) {}
                }
              })();
            `,
          }}
        />
        {/* Fallback FAB + modal if chatbot fails to load */}
        <ChatFallback />
      </body>
    </html>
  );
}
