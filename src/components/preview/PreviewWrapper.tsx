"use client";

/**
 * PreviewWrapper Component
 * ========================
 * 
 * Displays external demo sites (from vusercontent.net) in a branded Sajtstudio frame.
 * 
 * ## How it works:
 * - Embeds the external site directly via iframe (no proxy needed)
 * - vusercontent.net does NOT set X-Frame-Options, so direct embedding works
 * - Shows Sajtstudio branding in header and CTA footer
 * 
 * ## Features:
 * - Loading state with spinner
 * - Error handling with fallback
 * - Optional screenshot fallback (for sites that fail to load)
 * - "Open original" button for direct access
 * - Responsive design
 * 
 * ## Props:
 * - sourceUrl: Direct URL to the external site (https://demo-xxx.vusercontent.net)
 * - proxyUrl: Legacy prop, now equals sourceUrl (proxy no longer needed)
 * - previewImageSrc: Optional screenshot fallback image
 * - preview: Metadata about the preview (slug, company_name, domain)
 * 
 * @author Sajtstudio
 * @since 2024-12-20 - Fixed: Changed from proxy to direct iframe embedding
 */

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useState, useEffect, useCallback, useRef } from "react";
import { useOfferModal } from "@/hooks/useOfferModal";

// ============================================================================
// TYPES
// ============================================================================

interface Preview {
  slug: string;
  company_name: string | null;
  domain: string | null;
}

interface PreviewWrapperProps {
  /** Direct URL to external site (vusercontent.net) */
  sourceUrl: string;
  /** Legacy: kept for backwards compatibility, now equals sourceUrl */
  proxyUrl: string;
  /** Optional: path to a screenshot fallback image */
  previewImageSrc?: string | null;
  /** Metadata about the preview */
  preview: Preview;
}

type ViewMode = "image" | "iframe";

// ============================================================================
// CONSTANTS
// ============================================================================

/** Time in ms before showing "taking too long" hint */
const SLOW_LOADING_THRESHOLD_MS = 5000;

// ============================================================================
// COMPONENT
// ============================================================================

export default function PreviewWrapper({
  sourceUrl,
  previewImageSrc,
  preview,
}: PreviewWrapperProps) {
  // Determine initial mode: show image if available, otherwise iframe
  const initialMode: ViewMode = previewImageSrc ? "image" : "iframe";

  // State
  const [mode, setMode] = useState<ViewMode>(initialMode);
  const [isLoading, setIsLoading] = useState(true); // Always start loading
  const [hasError, setHasError] = useState(false);
  const [showSlowHint, setShowSlowHint] = useState(false);
  const [showDownloadModal, setShowDownloadModal] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const mountedRef = useRef(false);
  const { openModal: openOfferModal } = useOfferModal();

  // Mark as mounted on client to avoid hydration issues
  // Using requestAnimationFrame to avoid synchronous setState in effect
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    
    const frameId = requestAnimationFrame(() => {
      setIsMounted(true);
      if (mode === "image") {
        setIsLoading(false);
      }
    });
    
    return () => cancelAnimationFrame(frameId);
  }, [mode]);

  // Show hint after threshold if still loading
  useEffect(() => {
    if (mode !== "iframe" || !isLoading || hasError) return;
    
    const timer = setTimeout(() => {
      setShowSlowHint(true);
    }, SLOW_LOADING_THRESHOLD_MS);
    
    return () => clearTimeout(timer);
  }, [mode, isLoading, hasError]);

  // Handler: iframe loaded successfully
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false);
    setShowSlowHint(false);
  }, []);

  // Handler: iframe failed to load
  const handleIframeError = useCallback(() => {
    setIsLoading(false);
    setHasError(true);
  }, []);

  // Handler: toggle between image and iframe mode
  const handleToggleMode = useCallback(() => {
    setHasError(false);
    setShowSlowHint(false);
    if (mode === "image") {
      setMode("iframe");
      setIsLoading(true);
    } else {
      setMode("image");
      setIsLoading(false);
    }
  }, [mode]);

  // Display name for the preview
  const displayName = preview.company_name || preview.slug;

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* ================================================================
          HEADER - Sajtstudio branding + action buttons
          ================================================================ */}
      <motion.header
        initial={{ y: -60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-b border-gray-800/50 shadow-lg z-20"
      >
        {/* Logo and branding */}
        <Link href="/" className="flex items-center gap-3 group">
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

        {/* Preview info badge (desktop only) */}
        {preview.company_name && (
          <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
            <span className="px-2 py-1 rounded bg-gray-800/50 border border-gray-700/50">
              Preview: {preview.company_name}
            </span>
          </div>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {/* Open in new window */}
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all"
            title="Öppna originalsidan i nytt fönster"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            <span className="hidden sm:inline">Öppna original</span>
          </a>

          {/* Toggle mode button (only if screenshot exists) */}
          {previewImageSrc && (
            <button
              type="button"
              onClick={handleToggleMode}
              className="hidden sm:inline-flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all"
              title={mode === "image" ? "Visa interaktiv preview" : "Visa skärmbild"}
            >
              {mode === "image" ? "Interaktiv" : "Skärmbild"}
            </button>
          )}

          {/* Back button */}
          <Link
            href="/"
            className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-lg border border-gray-700/50 hover:border-gray-600 transition-all"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            <span className="hidden sm:inline">Tillbaka</span>
          </Link>
        </div>
      </motion.header>

      {/* ================================================================
          MAIN CONTENT - iframe or screenshot
          ================================================================ */}
      <div className="relative flex-1 overflow-hidden">
        {/* Screenshot mode */}
        {mode === "image" && (
          <div className="absolute inset-0 bg-black">
            {previewImageSrc ? (
              <Image
                src={previewImageSrc}
                alt={`Skärmbild: ${displayName}`}
                fill
                sizes="100vw"
                className="object-contain"
                priority
              />
            ) : (
              <NoScreenshotPlaceholder slug={preview.slug} sourceUrl={sourceUrl} />
            )}
          </div>
        )}

        {/* Loading spinner (iframe mode) - only show on client to avoid hydration issues */}
        {isMounted && mode === "iframe" && isLoading && !hasError && (
          <LoadingOverlay 
            showSlowHint={showSlowHint} 
            sourceUrl={sourceUrl} 
          />
        )}

        {/* Error state (iframe mode) */}
        {mode === "iframe" && hasError && (
          <ErrorOverlay sourceUrl={sourceUrl} />
        )}

        {/* Iframe - direct embedding (no proxy) */}
        {mode === "iframe" && (
          <iframe
            src={sourceUrl}
            className="w-full h-full border-0"
            title={`Preview: ${displayName}`}
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            loading="eager"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            referrerPolicy="no-referrer-when-downgrade"
          />
        )}
      </div>

      {/* ================================================================
          FOOTER - CTA to create own site + download button
          ================================================================ */}
      <motion.footer
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.2 }}
        className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-4 bg-gradient-to-r from-gray-950 via-gray-900 to-gray-950 border-t border-gray-800/50 z-20"
      >
        <p className="text-gray-400 text-sm text-center sm:text-left">
          <span className="hidden sm:inline">Gillar du vad du ser? </span>
          <span className="text-white font-medium">
            Vi kan bygga något liknande för dig.
          </span>
        </p>

        <div className="flex items-center gap-3">
          {/* Download site button */}
          <button
            type="button"
            onClick={() => setShowDownloadModal(true)}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-lg transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Ladda hem din sajt
          </button>

          {/* Create your own site - opens offer modal */}
          <button
            type="button"
            onClick={openOfferModal}
            className="px-5 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-accent to-tertiary hover:from-accent/90 hover:to-tertiary/90 rounded-lg shadow-lg shadow-accent/20 hover:shadow-accent/30 transition-all"
          >
            Skapa din egen sajt
          </button>
        </div>
      </motion.footer>

      {/* ================================================================
          DOWNLOAD MODAL - only render on client
          ================================================================ */}
      {isMounted && (
        <DownloadModal 
          isOpen={showDownloadModal} 
          onClose={() => setShowDownloadModal(false)}
          companyName={preview.company_name}
          slug={preview.slug}
        />
      )}
    </div>
  );
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Shown when no screenshot is available in image mode */
function NoScreenshotPlaceholder({ slug, sourceUrl }: { slug: string; sourceUrl: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-center px-6">
      <div className="max-w-md">
        <h2 className="text-white font-semibold text-lg">
          Ingen skärmbild tillgänglig
        </h2>
        <p className="text-gray-400 text-sm mt-2">
          Lägg en bild i <code className="text-gray-300">public/previews/</code>{" "}
          med namn <code className="text-gray-300">{slug}.png</code>{" "}
          (eller .webp/.jpg) för att visa en statisk förhandsgranskning.
        </p>
        <div className="mt-4">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
          >
            Öppna original i nytt fönster
          </a>
        </div>
      </div>
    </div>
  );
}

/** Loading overlay with spinner and slow-loading hint */
function LoadingOverlay({ showSlowHint, sourceUrl }: { showSlowHint: boolean; sourceUrl: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        <div className="w-12 h-12 border-4 border-gray-700 rounded-full animate-spin border-t-accent" />
        <p className="text-gray-400 text-sm">Laddar förhandsgranskning...</p>
        
        {showSlowHint && (
          <div className="flex flex-col items-center gap-2 mt-2">
            <p className="text-gray-500 text-xs max-w-md">
              Det tar längre tid än vanligt. Prova att öppna i nytt fönster.
            </p>
            <a
              href={sourceUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
            >
              Öppna i nytt fönster
            </a>
          </div>
        )}
      </div>
    </div>
  );
}

/** Error overlay when iframe fails to load */
function ErrorOverlay({ sourceUrl }: { sourceUrl: string }) {
  return (
    <div className="absolute inset-0 flex items-center justify-center bg-gray-950 z-10">
      <div className="flex flex-col items-center gap-4 text-center px-4">
        <div className="w-16 h-16 rounded-full bg-red-500/10 flex items-center justify-center">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-white">
          Kunde inte ladda förhandsgranskningen
        </h3>
        <p className="text-gray-400 text-sm max-w-md">
          Sidan kan vara tillfälligt otillgänglig.
        </p>
        <div className="flex gap-3 mt-2">
          <a
            href={sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 text-sm font-medium text-white bg-accent hover:bg-accent/90 rounded-lg transition-colors"
          >
            Öppna i nytt fönster
          </a>
          <Link
            href="/"
            className="px-4 py-2 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors"
          >
            Gå till startsidan
          </Link>
        </div>
      </div>
    </div>
  );
}

/** Download modal - shows instructions for getting the site */
function DownloadModal({ 
  isOpen, 
  onClose, 
  companyName,
  slug 
}: { 
  isOpen: boolean; 
  onClose: () => void;
  companyName: string | null;
  slug: string;
}) {
  const [isSending, setIsSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Send download request to backend
  const handleSendRequest = async () => {
    setIsSending(true);
    setError(null);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: companyName || "Demo-förfrågan",
          email: "demo-request@sajtstudio.se",
          message: `Hej! Jag vill ladda hem min demosajt.\n\nSlug: ${slug}\nFöretag: ${companyName || "Ej angivet"}\n\nSkicka gärna sajten till mig!`,
          subject: `Demo-nedladdning: ${slug}`,
          type: "demo_download",
        }),
      });

      if (response.ok) {
        setSent(true);
      } else {
        setError("Något gick fel. Skicka ett mejl direkt till hej@sajtstudio.se");
      }
    } catch {
      setError("Kunde inte skicka. Skicka ett mejl direkt till hej@sajtstudio.se");
    } finally {
      setIsSending(false);
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        className="bg-gray-900 rounded-2xl p-6 max-w-md w-full shadow-2xl border border-gray-800"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-500 hover:text-white transition-colors"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {!sent ? (
          <>
            {/* Header */}
            <div className="text-center mb-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gradient-to-br from-accent/20 to-tertiary/20 flex items-center justify-center">
                <svg className="w-8 h-8 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              </div>
              <h2 className="text-xl font-bold text-white mb-2">
                Ladda hem din sajt! 🎉
              </h2>
              <p className="text-gray-400 text-sm">
                Vi håller precis på att kicka igång med automatiska nedladdningar.
              </p>
            </div>

            {/* Content */}
            <div className="bg-gray-800/50 rounded-xl p-4 mb-6">
              <p className="text-gray-300 text-sm leading-relaxed">
                Skicka ett mejl till{" "}
                <a 
                  href={`mailto:hej@sajtstudio.se?subject=Ladda hem: ${slug}&body=Hej! Jag vill ladda hem min demosajt (${slug}). Tack!`}
                  className="text-accent hover:underline font-medium"
                >
                  hej@sajtstudio.se
                </a>{" "}
                så skickar vi sajten till dig! 😊
              </p>
            </div>

            {/* Actions */}
            <div className="flex flex-col gap-3">
              <a
                href={`mailto:hej@sajtstudio.se?subject=Ladda hem: ${slug}&body=Hej! Jag vill ladda hem min demosajt (${slug}). Tack!`}
                className="w-full px-5 py-3 text-sm font-semibold text-white bg-gradient-to-r from-accent to-tertiary hover:from-accent/90 hover:to-tertiary/90 rounded-lg text-center transition-all"
              >
                📧 Öppna mejlklient
              </a>
              
              <button
                onClick={handleSendRequest}
                disabled={isSending}
                className="w-full px-5 py-3 text-sm font-medium text-gray-300 hover:text-white bg-gray-800 hover:bg-gray-700 border border-gray-700 rounded-lg transition-all disabled:opacity-50"
              >
                {isSending ? "Skickar..." : "Eller klicka här så meddelar vi dig"}
              </button>

              {error && (
                <p className="text-red-400 text-xs text-center">{error}</p>
              )}
            </div>
          </>
        ) : (
          /* Success state */
          <div className="text-center py-4">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-green-500/20 flex items-center justify-center">
              <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-xl font-bold text-white mb-2">
              Tack! 🎉
            </h2>
            <p className="text-gray-400 text-sm mb-4">
              Vi har mottagit din förfrågan och återkommer snart!
            </p>
            <button
              onClick={onClose}
              className="px-5 py-2.5 text-sm font-medium text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-all"
            >
              Stäng
            </button>
          </div>
        )}
      </motion.div>
    </motion.div>
  );
}
