'use client'

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

import { motion, useReducedMotion } from 'framer-motion'
import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useCallback } from 'react'
import { useOfferModal } from '@/hooks/useOfferModal'
import { useMobileDetection } from '@/hooks/useMobileDetection'

// ============================================================================
// TYPES
// ============================================================================

interface Preview {
  slug: string
  company_name: string | null
  domain: string | null
}

interface PreviewWrapperProps {
  /** Direct URL to external site (vusercontent.net) */
  sourceUrl: string
  /** Legacy: kept for backwards compatibility, now equals sourceUrl */
  proxyUrl: string
  /** Optional: path to a screenshot fallback image */
  previewImageSrc?: string | null
  /** Metadata about the preview */
  preview: Preview
}

type ViewMode = 'image' | 'iframe'

// ============================================================================
// CONSTANTS
// ============================================================================

/** Time in ms before showing "taking too long" hint */
const SLOW_LOADING_THRESHOLD_MS = 5000

// ============================================================================
// COMPONENT
// ============================================================================

export default function PreviewWrapper({
  sourceUrl,
  previewImageSrc,
  preview,
}: PreviewWrapperProps) {
  const isMobile = useMobileDetection()
  const prefersReducedMotion = useReducedMotion()
  const shouldAnimateChrome = !isMobile && !prefersReducedMotion

  // Determine initial mode: show image if available, otherwise iframe
  const initialMode: ViewMode = previewImageSrc ? 'image' : 'iframe'

  // State
  const [mode, setMode] = useState<ViewMode>(initialMode)
  const [isLoading, setIsLoading] = useState(initialMode === 'iframe') // Only loading if iframe mode
  const [hasError, setHasError] = useState(false)
  const [showSlowHint, setShowSlowHint] = useState(false)
  const [isMounted, setIsMounted] = useState(false)
  const { openModal } = useOfferModal()

  // Mark as mounted on the client in a deferred callback to avoid hydration mismatch,
  // while also keeping eslint happy (no synchronous setState inside effect).
  useEffect(() => {
    const id = requestAnimationFrame(() => setIsMounted(true))
    return () => cancelAnimationFrame(id)
  }, [])

  // Listen for postMessage from iframe (in case demosajten wants to navigate)
  useEffect(() => {
    if (mode !== 'iframe' || typeof window === 'undefined') return

    const handleMessage = (event: MessageEvent) => {
      // Accept from target origin or our own (when using proxy, iframe is same-origin)
      try {
        const sourceOrigin = new URL(sourceUrl).origin
        const ourOrigin = typeof window !== 'undefined' ? window.location.origin : ''
        if (event.origin !== sourceOrigin && event.origin !== ourOrigin) return

        // Handle navigation requests
        if (event.data?.type === 'navigate' && event.data?.url) {
          const url = event.data.url
          // If it's a sajtmaskin URL, navigate to our proxy
          if (url.includes('sajtmaskin-1.onrender.com') || url.includes('sajtmaskin')) {
            window.location.href = '/sajtmaskin'
          }
        }
      } catch {
        // Ignore invalid URLs
      }
    }

    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [mode, sourceUrl])

  // Show hint after threshold if still loading
  useEffect(() => {
    if (mode !== 'iframe' || !isLoading || hasError) return

    const timer = setTimeout(() => {
      setShowSlowHint(true)
    }, SLOW_LOADING_THRESHOLD_MS)

    return () => clearTimeout(timer)
  }, [mode, isLoading, hasError])

  // Handler: iframe loaded successfully
  const handleIframeLoad = useCallback(() => {
    setIsLoading(false)
    setShowSlowHint(false)
  }, [])

  // Handler: iframe failed to load
  const handleIframeError = useCallback(() => {
    setIsLoading(false)
    setHasError(true)
  }, [])

  // Handler: toggle between image and iframe mode
  const handleToggleMode = useCallback(() => {
    setHasError(false)
    setShowSlowHint(false)
    if (mode === 'image') {
      setMode('iframe')
      setIsLoading(true)
    } else {
      setMode('image')
      setIsLoading(false)
    }
  }, [mode])

  // Display name for the preview
  const displayName = preview.company_name || preview.slug

  return (
    <div className="flex flex-col h-screen bg-black">
      {/* ================================================================
          HEADER - Sajtstudio branding + action buttons
          ================================================================ */}
      <motion.header
        // NOTE: On mobile, transforms can make text look blurry (subpixel/GPU). Keep header static.
        initial={shouldAnimateChrome ? { y: -60, opacity: 0 } : { opacity: 1 }}
        animate={shouldAnimateChrome ? { y: 0, opacity: 1 } : { opacity: 1 }}
        transition={shouldAnimateChrome ? { duration: 0.4, ease: 'easeOut' } : { duration: 0 }}
        className="flex items-center justify-between px-3 sm:px-4 py-2 bg-gray-950/95 border-b border-gray-800/60 shadow-md z-20"
      >
        {/* Logo and branding */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="relative w-7 h-7 overflow-hidden rounded-md bg-gradient-to-br from-accent/20 to-tertiary/20 p-0.5">
            <Image
              src="/logo.svg"
              alt="Sajtstudio"
              width={24}
              height={24}
              className="object-contain"
            />
          </div>
          <span className="text-base font-semibold text-white group-hover:text-accent transition-colors">
            Sajtstudio
          </span>
        </Link>

        {/* Preview info badge (desktop only) */}
        {preview.company_name && (
          <div className="hidden lg:flex items-center gap-2 text-xs text-gray-400">
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
            className="flex items-center gap-2 px-2.5 py-1.5 text-xs sm:text-sm font-medium text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-md border border-gray-700/50 hover:border-gray-600 transition-all"
            title="Öppna originalsidan i nytt fönster"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
            <span className="hidden sm:inline">Öppna original</span>
          </a>

          {/* Toggle mode button (only if screenshot exists) */}
          {previewImageSrc && (
            <button
              type="button"
              onClick={handleToggleMode}
              className="hidden sm:inline-flex items-center gap-2 px-2.5 py-1.5 text-sm font-medium text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 rounded-md border border-gray-700/50 hover:border-gray-600 transition-all"
              title={mode === 'image' ? 'Visa interaktiv preview' : 'Visa skärmbild'}
            >
              {mode === 'image' ? 'Interaktiv' : 'Skärmbild'}
            </button>
          )}
        </div>
      </motion.header>

      {/* ================================================================
          MAIN CONTENT - iframe or screenshot
          ================================================================ */}
      <div className="relative flex-1 overflow-hidden">
        {/* Screenshot mode */}
        {mode === 'image' && (
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

        {/* Loading spinner (iframe mode) */}
        {mode === 'iframe' && isLoading && !hasError && (
          <LoadingOverlay showSlowHint={showSlowHint} sourceUrl={sourceUrl} />
        )}

        {/* Error state (iframe mode) */}
        {mode === 'iframe' && hasError && <ErrorOverlay sourceUrl={sourceUrl} />}

        {/* Iframe - direct embedding (no proxy) - only render on client to avoid hydration mismatch */}
        {isMounted && mode === 'iframe' && (
          <iframe
            src={proxyUrl}
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
        // NOTE: Same as header: avoid transform-based entrance animations on mobile to prevent blur.
        initial={shouldAnimateChrome ? { y: 60, opacity: 0 } : { opacity: 1 }}
        animate={shouldAnimateChrome ? { y: 0, opacity: 1 } : { opacity: 1 }}
        transition={
          shouldAnimateChrome ? { duration: 0.4, ease: 'easeOut', delay: 0.2 } : { duration: 0 }
        }
        className="flex flex-col items-center gap-2 px-3 py-2.5 bg-gray-950/95 border-t border-gray-800/60 z-20"
      >
        <p className="text-gray-400 text-xs sm:text-sm text-center">
          <span className="hidden md:inline">Gillar du vad du ser? </span>
          <span className="text-white font-medium">Vi kan bygga något liknande för dig.</span>
        </p>

        <div className="flex items-center justify-center gap-2 flex-wrap">
          {/* Back to homepage */}
          <Link
            href="/"
            className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-gray-300 hover:text-white bg-gray-800/50 hover:bg-gray-700/50 border border-gray-600 hover:border-gray-500 rounded-md transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
              />
            </svg>
            <span className="hidden sm:inline">Till hemsidan</span>
          </Link>

          {/* Download site button - links to contact page */}
          <Link
            href="/kontakt"
            className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gray-800 hover:bg-gray-700 border border-gray-600 hover:border-gray-500 rounded-md transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
            <span className="hidden sm:inline">Ladda hem din sajt</span>
          </Link>

          {/* Create your own site - open OfferModal (3 choices) */}
          <button
            type="button"
            onClick={openModal}
            className="px-3.5 py-1.5 text-xs sm:text-sm font-semibold text-white bg-gradient-to-r from-accent to-tertiary hover:from-accent/90 hover:to-tertiary/90 rounded-md shadow-md shadow-accent/20 hover:shadow-accent/30 transition-all"
          >
            Bygg din egen sajt
          </button>
        </div>
      </motion.footer>
    </div>
  )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

/** Shown when no screenshot is available in image mode */
function NoScreenshotPlaceholder({ slug, sourceUrl }: { slug: string; sourceUrl: string }) {
  return (
    <div className="w-full h-full flex items-center justify-center text-center px-6">
      <div className="max-w-md">
        <h2 className="text-white font-semibold text-lg">Ingen skärmbild tillgänglig</h2>
        <p className="text-gray-400 text-sm mt-2">
          Lägg en bild i <code className="text-gray-300">public/previews/</code> med namn{' '}
          <code className="text-gray-300">{slug}.png</code> (eller .webp/.jpg) för att visa en
          statisk förhandsgranskning.
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
  )
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
  )
}

/** Error overlay when iframe fails to load */
function ErrorOverlay({ sourceUrl }: { sourceUrl: string }) {
  return (
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
        <h3 className="text-lg font-semibold text-white">Kunde inte ladda förhandsgranskningen</h3>
        <p className="text-gray-400 text-sm max-w-md">Sidan kan vara tillfälligt otillgänglig.</p>
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
  )
}
