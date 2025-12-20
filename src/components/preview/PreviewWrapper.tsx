"use client";

/**
 * PreviewWrapper Component
 *
 * Wraps external vusercontent.net previews in a branded sajtstudio frame.
 * Shows a minimal header with logo and a CTA footer.
 */

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

interface Preview {
  slug: string;
  company_name: string | null;
  domain: string | null;
}

interface PreviewWrapperProps {
  proxyUrl: string;
  sourceUrl: string;
  preview: Preview;
}

export default function PreviewWrapper({
  proxyUrl,
  sourceUrl,
  preview,
}: PreviewWrapperProps) {
  // Use proxy URL in iframe to bypass X-Frame-Options
  const iframeSrc = proxyUrl;
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* Header */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-b border-gray-800/50 shadow-lg"
      >
        {/* Logo and branding */}
        <Link
          href="/"
          className="flex items-center gap-3 group"
        >
          <div className="relative w-8 h-8 overflow-hidden rounded-lg bg-gradient-to-br from-accent/20 to-tertiary/20 p-0.5">
            <Image
              src="/logo.svg"
              alt="Sajtstudio"
              width={28}
              height={28}
              className="object-contain"
            />
          </div>
          <span className="text-lg font-bold text-white group-hover:text-accent transition-colors">
            Sajtstudio
          </span>
        </Link>

        {/* Preview info (optional) */}
        {preview.company_name && (
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
            <span className="px-2 py-1 rounded bg-gray-800/50 border border-gray-700/50">
              Preview: {preview.company_name}
            </span>
          </div>
        )}

        {/* Back button */}
        <Link
          href="/"
          className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 19l-7-7m0 0l7-7m-7 7h18"
            />
          </svg>
          <span className="hidden sm:inline">Tillbaka</span>
        </Link>
      </motion.header>

      {/* Main content - iframe */}
      <div className="relative flex-1 overflow-hidden">
        {/* Loading state */}
        {isLoading && !hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
            <div className="flex flex-col items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 border-4 border-gray-700 rounded-full animate-spin border-t-accent" />
              </div>
              <p className="text-gray-400 text-sm">Laddar förhandsgranskning...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {hasError && (
          <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
            <div className="flex flex-col items-center gap-4 text-center px-4">
              <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-red-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white">
                Kunde inte ladda förhandsgranskningen
              </h3>
              <p className="text-gray-400 text-sm max-w-md">
                Sidan kan vara tillfälligt otillgänglig eller blockeras av säkerhetsinställningar.
              </p>
              <Link
                href="/"
                className="mt-4 px-6 py-3 bg-accent hover:bg-accent/90 text-white font-medium rounded-lg transition-colors"
              >
                Gå till startsidan
              </Link>
            </div>
          </div>
        )}

        {/* Iframe - uses proxy URL to bypass X-Frame-Options */}
        <iframe
          src={iframeSrc}
          className="w-full h-full border-0"
          title={`Preview: ${preview.company_name || preview.slug}`}
          onLoad={() => setIsLoading(false)}
          onError={() => {
            setIsLoading(false);
            setHasError(true);
          }}
          loading="eager"
        />
      </div>

      {/* CTA Footer */}
      <motion.footer
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-t border-gray-800/50"
      >
        <p className="text-gray-400 text-sm text-center sm:text-left">
          <span className="hidden sm:inline">Gillar du vad du ser? </span>
          <span className="text-white font-medium">
            Vi kan bygga något liknande för dig.
          </span>
        </p>

        <div className="flex items-center gap-3">
          <Link
            href="/kontakt"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-accent to-tertiary hover:from-accent/90 hover:to-tertiary/90 rounded-lg shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all"
          >
            Skapa din egen sajt
          </Link>
        </div>
      </motion.footer>
    </div>
  );
}

