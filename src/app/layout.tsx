import PageTransition from "@/components/layout/PageTransition";
import SkipLink from "@/components/layout/SkipLink";
import ErrorBoundary from "@/components/ui/ErrorBoundary";
import {
  generateSchemaScript,
  getOrganizationSchema,
  getServiceSchema,
  getWebSiteSchema,
} from "@/lib/structuredData";
import type { Metadata } from "next";
import { Dancing_Script, Inter, Press_Start_2P } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const dancingScript = Dancing_Script({
  subsets: ["latin"],
  variable: "--font-handwriting",
  weight: ["400", "500", "600", "700"],
});

const pressStart2P = Press_Start_2P({
  subsets: ["latin"],
  variable: "--font-pixel",
  weight: "400",
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
    <html lang="sv" className={`${inter.variable} ${dancingScript.variable} ${pressStart2P.variable} overflow-x-hidden w-full`} data-scroll-behavior="smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
        <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
        <link rel="dns-prefetch" href="https://agent.d-id.com" />
        {/* Prefetch assets that appear later without forcing preload warnings */}
        <link rel="prefetch" href="/logo.svg" />
        <link rel="prefetch" href="/videos/background.mp4" />
        <link rel="prefetch" href="/images/hero/hero-background.webp" />
        <link rel="prefetch" href="/images/backgrounds/8-bit.webp" />
        <link rel="prefetch" href="/videos/background_vid.mp4" />
        <link rel="prefetch" href="/videos/noir_hero.mp4" />
        <link rel="prefetch" href="/videos/telephone_ringin.mp4" />
        <link rel="prefetch" href="/images/portfolio/task_01k90mfa25f2etneptc7kekm99_1762031914_img_0.webp" />
        <link rel="prefetch" href="/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp" />
        <link rel="prefetch" href="/images/portfolio/assets_task_01k816mxkwe908h5pg7v3yxtq9_1760977226_img_0.webp" />
        <link rel="prefetch" href="/images/portfolio/task_01k9akk4rjfcr83xkf3b7r0rdr_1762366467_img_1.webp" />
        <link rel="prefetch" href="/images/backgrounds/section-background.webp" />
        <link rel="prefetch" href="/images/animations/hero-animation.gif" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={generateSchemaScript([
            getOrganizationSchema(),
            getWebSiteSchema(),
            getServiceSchema(),
          ])}
        />
      </head>
      <body className="antialiased overflow-x-hidden w-full max-w-screen relative">
        <SkipLink />
        <ErrorBoundary>
          <PageTransition>{children}</PageTransition>
        </ErrorBoundary>
        {/* Global error handler for unhandled fetch errors (e.g., from D-ID chatbot, antivirus, etc.) */}
        <Script
          id="global-error-handler"
          strategy="afterInteractive"
          src="/scripts/global-error-handler.js"
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
      </body>
    </html>
  );
}
