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
  getServiceSchema,
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
        url: "/logo.svg",
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
    images: ["/logo.svg"],
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
    <html lang="sv" className={inter.variable} data-scroll-behavior="smooth" style={{ overflowX: 'hidden', width: '100%' }}>
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
        {/* Preload hero video metadata only for faster initial load */}
        <link
          rel="preload"
          href="/videos/noir_hero.mp4"
          as="video"
          type="video/mp4"
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateSchemaScript([
            getOrganizationSchema(),
            getWebSiteSchema(),
            getServiceSchema(),
          ])}
        />
      </head>
      <body className="antialiased" style={{ overflowX: 'hidden', width: '100%', maxWidth: '100vw' }}>
        <SkipLink />
        <ErrorBoundary>
          <PageTransition>{children}</PageTransition>
        </ErrorBoundary>
        {/* Global error handler for unhandled fetch errors (e.g., from D-ID chatbot, antivirus, etc.) */}
        <Script
          id="global-error-handler"
          strategy="beforeInteractive"
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                // Initialize status early
                try { 
                  window.__didStatus = window.__didStatus || 'pending';
                } catch(_) {}
                
                // Override console.error and console.warn to filter D-ID errors and antivirus blocks
                const originalConsoleError = console.error;
                const originalConsoleWarn = console.warn;
                
                const shouldFilterMessage = function(...args) {
                  // Build a comprehensive message string from all arguments
                  let fullMessage = '';
                  for (const arg of args) {
                    if (typeof arg === 'string') {
                      fullMessage += ' ' + arg;
                    } else if (arg && typeof arg === 'object') {
                      // Check error objects, stack traces, etc.
                      if (arg.stack) {
                        fullMessage += ' ' + arg.stack;
                      }
                      if (arg.message) {
                        fullMessage += ' ' + arg.message;
                      }
                      try {
                        fullMessage += ' ' + JSON.stringify(arg);
                      } catch(_) {
                        fullMessage += ' ' + String(arg);
                      }
                    } else {
                      fullMessage += ' ' + String(arg);
                    }
                  }
                  const message = fullMessage.toLowerCase();
                  
                  return (
                    message.includes('d-id.com') ||
                    message.includes('agent.d-id.com') ||
                    message.includes('api.d-id.com') ||
                    message.includes('index-dqcaxkvx.js') ||
                    message.includes('main-d6iamsoh.js') ||
                    message.includes('failed to fetch') ||
                    message.includes('typeerror') ||
                    message.includes('cors policy') ||
                    message.includes('access-control-allow-origin') ||
                    message.includes('401') ||
                    message.includes('unauthorized') ||
                    message.includes('err_failed') ||
                    message.includes('net::err_failed') ||
                    message.includes('kaspersky') ||
                    message.includes('kis.v2.scr') ||
                    message.includes('fd126c42-ebfa-4e12') ||
                    message.includes('antivirus') ||
                    // Check if it's a TypeError with fetch and has antivirus/D-ID in context
                    (message.includes('typeerror') && message.includes('fetch') && (message.includes('kaspersky') || message.includes('d-id') || message.includes('agent')))
                  );
                };
                
                console.error = function(...args) {
                  if (shouldFilterMessage(...args)) {
                    // Silently ignore D-ID and antivirus errors
                    return;
                  }
                  // Log other errors normally
                  originalConsoleError.apply(console, args);
                };
                
                console.warn = function(...args) {
                  if (shouldFilterMessage(...args)) {
                    // Silently ignore D-ID and antivirus warnings
                    return;
                  }
                  // Log other warnings normally
                  originalConsoleWarn.apply(console, args);
                };
                
                // Suppress unhandled fetch errors from third-party scripts
                const originalFetch = window.fetch;
                window.fetch = function(...args) {
                  const url = args[0];
                  let urlString = '';
                  
                  // Extract URL string from various formats
                  if (typeof url === 'string') {
                    urlString = url;
                  } else if (url && typeof url === 'object') {
                    urlString = url.url || url.href || url.toString() || '';
                  }
                  
                  const isDIDRequest = urlString && (
                    urlString.includes('d-id.com') || 
                    urlString.includes('agent.d-id.com') ||
                    urlString.includes('api.d-id.com') ||
                    urlString.includes('/agents/')
                  );
                  
                  // Get call stack to check if this fetch is from D-ID scripts
                  let callStack = '';
                  try {
                    callStack = new Error().stack || '';
                  } catch(_) {}
                  
                  const isFromDIDScript = callStack && (
                    callStack.includes('agent.d-id.com') ||
                    callStack.includes('index-dqcaxkvx.js') ||
                    callStack.includes('main-d6iamsoh.js') ||
                    callStack.includes('d-id.com')
                  );
                  
                  const fetchPromise = originalFetch.apply(this, args);
                  
                  // Handle errors silently for D-ID requests or requests from D-ID scripts
                  if (isDIDRequest || isFromDIDScript) {
                    return fetchPromise.catch(function(error) {
                      // Check if it's a CORS error specifically
                      const isCORSError = error && (
                        error.message && (
                          error.message.includes('CORS') ||
                          error.message.includes('Access-Control-Allow-Origin') ||
                          error.message.includes('blocked by CORS policy')
                        ) ||
                        error.toString().includes('CORS') ||
                        error.toString().includes('Access-Control-Allow-Origin')
                      );
                      
                      // Silently handle D-ID fetch errors (including CORS)
                      try { 
                        window.__didStatus = 'error';
                        window.dispatchEvent(new Event('did-status-change'));
                      } catch(_) {}
                      // Return a rejected promise with a generic error to prevent console logging
                      // The error is still rejected so calling code can handle it, but it won't show in console
                      return Promise.reject(new Error('Network request failed'));
                    });
                  }
                  
                  // For other requests, wrap to catch potential D-ID errors that weren't caught above
                  return fetchPromise.catch(function(error) {
                    // Check if error is from D-ID or antivirus by examining error message/stack
                    const errorStr = (error?.message || error?.toString() || '').toLowerCase();
                    const stackStr = (error?.stack || callStack || '').toLowerCase();
                    const allErrorInfo = (errorStr + ' ' + stackStr).toLowerCase();
                    
                    const isDIDError = (
                      allErrorInfo.includes('d-id.com') ||
                      allErrorInfo.includes('agent.d-id.com') ||
                      allErrorInfo.includes('kaspersky') ||
                      allErrorInfo.includes('kis.v2.scr') ||
                      (allErrorInfo.includes('failed to fetch') && (allErrorInfo.includes('agent') || allErrorInfo.includes('d-id') || allErrorInfo.includes('anonymous')))
                    );
                    
                    if (isDIDError) {
                      try { 
                        window.__didStatus = 'error';
                        window.dispatchEvent(new Event('did-status-change'));
                      } catch(_) {}
                      // Return generic error to prevent console logging
                      return Promise.reject(new Error('Network request failed'));
                    }
                    
                    // Re-throw for non-D-ID errors so they're handled normally
                    throw error;
                  });
                };
                
                // Catch unhandled promise rejections from fetch (including from antivirus/extensions)
                window.addEventListener('unhandledrejection', function(event) {
                  const error = event.reason;
                  const errorString = error ? (error.message || error.toString() || String(error) || '') : '';
                  const stackString = error?.stack || '';
                  
                  // Get current call stack to check for D-ID or antivirus
                  let callStack = '';
                  try {
                    callStack = new Error().stack || '';
                  } catch(_) {}
                  
                  // Combine all stack information - check both error stack and current call stack
                  const allStackInfo = (stackString + ' ' + callStack + ' ' + errorString).toLowerCase();
                  
                  // Check if error message or stack contains D-ID or antivirus references
                  const hasDIDInStack = (
                    allStackInfo.includes('agent.d-id.com') || 
                    allStackInfo.includes('d-id.com') ||
                    allStackInfo.includes('api.d-id.com') ||
                    allStackInfo.includes('index-dqcaxkvx.js') ||
                    allStackInfo.includes('main-d6iamsoh.js')
                  );
                  const hasAntivirusInStack = (
                    allStackInfo.includes('kaspersky') || 
                    allStackInfo.includes('antivirus') ||
                    allStackInfo.includes('kis.v2.scr') ||
                    allStackInfo.includes('fd126c42-ebfa-4e12')
                  );
                  
                  // Check if it's a D-ID related error, antivirus block, or fetch error
                  const isFailedFetch = errorString.toLowerCase().includes('failed to fetch') || errorString.toLowerCase().includes('typeerror');
                  const hasAnonymousInStack = allStackInfo.includes('<anonymous>') || allStackInfo.includes('anonymous');
                  
                  const isDIDError = (
                    errorString.toLowerCase().includes('d-id.com') ||
                    errorString.toLowerCase().includes('cors') ||
                    errorString.toLowerCase().includes('401') ||
                    errorString.toLowerCase().includes('unauthorized') ||
                    errorString.toLowerCase().includes('networkerror') ||
                    errorString.toLowerCase().includes('err_failed') ||
                    hasDIDInStack ||
                    (hasAntivirusInStack && isFailedFetch) ||
                    (hasAntivirusInStack && hasDIDInStack) ||
                    // Catch any TypeError with Failed to fetch when antivirus is present
                    (hasAntivirusInStack && allStackInfo.includes('fetch')) ||
                    // Catch "Failed to fetch" errors from anonymous sources when D-ID or antivirus is involved
                    (isFailedFetch && hasAnonymousInStack && (hasAntivirusInStack || hasDIDInStack || allStackInfo.includes('window.fetch')))
                  );
                  
                  if (isDIDError) {
                    // Suppress D-ID related fetch errors completely
                    try { 
                      window.__didStatus = 'error';
                      window.dispatchEvent(new Event('did-status-change'));
                    } catch(_) {}
                    event.preventDefault();
                    event.stopPropagation();
                    event.stopImmediatePropagation();
                    return false;
                  }
                }, true); // Use capture phase to catch early
                
                // Also listen for error events that might be from fetch failures
                window.addEventListener('error', function(event) {
                  const error = event.error;
                  const message = event.message || '';
                  const filename = event.filename || '';
                  const source = event.filename || event.target?.src || '';
                  
                  // Check if it's a fetch-related error from D-ID or antivirus
                  const isDIDError = (
                    (message.includes('Failed to fetch') || message.includes('fetch') || message.includes('CORS')) &&
                    (filename.includes('d-id.com') || filename.includes('agent.d-id.com') || source.includes('d-id.com') || filename.includes('kaspersky') || source.includes('kaspersky'))
                  );
                  
                  if (isDIDError) {
                    try { 
                      window.__didStatus = 'error';
                      window.dispatchEvent(new Event('did-status-change'));
                    } catch(_) {}
                    event.preventDefault();
                    event.stopPropagation();
                    return false;
                  }
                }, true);
                
                // Also catch TypeError: Failed to fetch errors specifically via window.onerror
                const originalErrorHandler = window.onerror;
                window.onerror = function(message, source, lineno, colno, error) {
                  // Check if it's a D-ID or antivirus related error
                  const messageStr = String(message || '').toLowerCase();
                  const sourceStr = String(source || '').toLowerCase();
                  const errorStr = error ? (error.stack || error.toString() || '').toLowerCase() : '';
                  
                  // Get call stack if available
                  let callStack = '';
                  try {
                    callStack = (new Error().stack || '').toLowerCase();
                  } catch(_) {}
                  
                  // Combine all context for checking
                  const allContext = (messageStr + ' ' + sourceStr + ' ' + errorStr + ' ' + callStack);
                  
                  // Check if error is related to D-ID (even if blocked by antivirus)
                  const hasDIDInContext = (
                    allContext.includes('d-id.com') ||
                    allContext.includes('agent.d-id.com') ||
                    allContext.includes('api.d-id.com') ||
                    allContext.includes('index-dqcaxkvx.js') ||
                    allContext.includes('main-d6iamsoh.js')
                  );
                  
                  // Check if it's a "Failed to fetch" error that might be D-ID related
                  const isFailedFetch = messageStr.includes('failed to fetch') || messageStr.includes('typeerror');
                  const hasAntivirus = (
                    allContext.includes('kaspersky') ||
                    allContext.includes('kis.v2.scr') ||
                    allContext.includes('fd126c42-ebfa-4e12')
                  );
                  
                  const isDIDRelated = (
                    hasDIDInContext ||
                    (isFailedFetch && hasAntivirus) ||
                    (isFailedFetch && hasDIDInContext) ||
                    (hasAntivirus && allContext.includes('fetch') && allContext.includes('agent'))
                  );
                  
                  if (isDIDRelated) {
                    try { 
                      window.__didStatus = 'error';
                      window.dispatchEvent(new Event('did-status-change'));
                    } catch(_) {}
                    return true; // Prevent default error handling
                  }
                  
                  // Call original handler for other errors
                  if (originalErrorHandler) {
                    return originalErrorHandler.call(this, message, source, lineno, colno, error);
                  }
                  return false;
                };
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
                          // Agent script loaded but element not found - might be blocked by CORS
                          window.__didStatus = 'error';
                          window.dispatchEvent(new Event('did-status-change'));
                        }
                      } catch(_) {
                        window.__didStatus = 'error';
                        window.dispatchEvent(new Event('did-status-change'));
                      }
                    }, 2000); // Reduced from 3000 to detect CORS errors faster
                  };
                  
                  // Also listen for CORS errors immediately
                  script.addEventListener('error', function() {
                    try {
                      window.__didStatus = 'error';
                      window.dispatchEvent(new Event('did-status-change'));
                    } catch(_) {}
                  });
                  
                  // Also set a timeout - if status is still pending after 4 seconds, mark as error (CORS usually fails quickly)
                  setTimeout(function() {
                    try {
                      if (window.__didStatus === 'pending') {
                        window.__didStatus = 'error';
                        window.dispatchEvent(new Event('did-status-change'));
                      }
                    } catch(_) {}
                  }, 4000);
                  
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
