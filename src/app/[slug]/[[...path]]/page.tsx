/**
 * Preview Page - Dynamic Demo Site Embedding
 * ==========================================
 *
 * This catch-all route displays AI-generated demo sites in a branded Sajtstudio wrapper.
 *
 * ## URL Structure:
 * - /demo-xyz           → Displays https://demo-xyz.vusercontent.net
 * - /demo-xyz/page      → Displays https://demo-xyz.vusercontent.net/page
 *
 * ## How it works:
 * 1. Validates the slug exists in the SQLite database (previews.db)
 * 2. Builds the direct URL to vusercontent.net
 * 3. Renders PreviewWrapper with iframe embedding
 *
 * ## Security:
 * - Only slugs in the database are allowed (prevents abuse)
 * - Reserved routes are blocked (api, admin, etc.)
 * - Slug format is validated (alphanumeric + dashes/underscores only)
 * - Feature can be disabled via SLUGS=false env var
 *
 * ## Key Discovery (2024-12-20):
 * vusercontent.net does NOT set X-Frame-Options, so we can embed directly
 * without proxying! This solved the "black iframe" problem.
 *
 * @author Sajtstudio
 * @see PreviewWrapper - The component that renders the iframe
 * @see preview-database.ts - SQLite database for valid slugs
 */

import { notFound } from 'next/navigation'
import { getPreviewBySlug, updateLastAccessed } from '@/lib/preview-database'
import PreviewWrapper from '@/components/preview/PreviewWrapper'
import fs from 'fs'
import path from 'path'

// ============================================================================
// CONFIGURATION
// ============================================================================

/** Required for better-sqlite3 database access */
export const runtime = 'nodejs'

/** Force dynamic rendering (no static generation) */
export const dynamic = 'force-dynamic'

/** Domain suffix for v0-generated demo sites */
const VUSERCONTENT_DOMAIN = '.vusercontent.net'

/** Supported screenshot file extensions (in priority order) */
const PREVIEW_IMAGE_EXTS = ['webp', 'png', 'jpg', 'jpeg'] as const

/**
 * Reserved routes that should NOT be handled by this catch-all.
 * These are real pages/routes in the app that take precedence.
 */
const RESERVED_ROUTES = [
  'api',
  'admin',
  'contact',
  'kontakt',
  'portfolio',
  'generated',
  'sajtgranskning',
  'utvardera',
  'sajtmaskin',
  'engine',
  '_next',
  'favicon.ico',
] as const

/**
 * Check if the SLUGS feature is enabled.
 * Default: DISABLED (must explicitly enable with SLUGS=y/yes/true/1/on)
 */
const slugsEnabled = (() => {
  const flag = process.env.SLUGS
  if (!flag) return false

  const normalized = flag.trim().toLowerCase()
  return ['y', 'yes', 'on', '1', 'true'].includes(normalized)
})()

// ============================================================================
// HELPERS
// ============================================================================

/**
 * Check if a slug is valid format (alphanumeric + dashes/underscores)
 */
function isValidSlugFormat(slug: string): boolean {
  return /^[a-zA-Z0-9_-]+$/.test(slug)
}

/**
 * Check if a slug is a reserved route
 */
function isReservedRoute(slug: string): boolean {
  return RESERVED_ROUTES.includes(slug.toLowerCase() as (typeof RESERVED_ROUTES)[number])
}

/**
 * Try to find a preview screenshot in public/previews/
 * Returns the path if found, null otherwise.
 */
function findPreviewImage(slug: string): string | null {
  const previewsDir = path.join(process.cwd(), 'public', 'previews')

  for (const ext of PREVIEW_IMAGE_EXTS) {
    const filename = `${slug}.${ext}`
    const filePath = path.join(previewsDir, filename)

    if (fs.existsSync(filePath)) {
      return `/previews/${filename}`
    }
  }

  return null
}

// ============================================================================
// PAGE COMPONENT
// ============================================================================

interface PageProps {
  params: Promise<{ slug: string; path?: string[] }>
}

export default async function PreviewPage({ params }: PageProps) {
  const { slug, path: pathSegments } = await params

  // ---- VALIDATION ----

  // Feature must be enabled
  if (!slugsEnabled) {
    notFound()
  }

  // Slug must exist and be a string
  if (!slug || typeof slug !== 'string' || slug.trim() === '') {
    notFound()
  }

  // Slug must not be a reserved route
  if (isReservedRoute(slug)) {
    notFound()
  }

  // Slug must have valid format
  if (!isValidSlugFormat(slug)) {
    notFound()
  }

  // Slug must exist in database
  const preview = getPreviewBySlug(slug)
  if (!preview) {
    notFound()
  }

  // ---- UPDATE STATS ----

  // Track last access time (fire and forget, don't fail on error)
  try {
    updateLastAccessed(slug)
  } catch {
    // Silently ignore - stats are not critical
  }

  // ---- BUILD URLs ----

  // Build path string from segments
  const pathString = pathSegments?.length ? `/${pathSegments.join('/')}` : ''

  // Determine the source URL:
  // 1. If target_url exists, use it directly (for non-vusercontent sites like Vercel apps)
  // 2. Otherwise, build URL from source_slug or slug + vusercontent.net
  let sourceUrl: string
  if (preview.target_url) {
    // Direct URL to external site (e.g., Vercel app)
    sourceUrl = `${preview.target_url}${pathString}`
  } else {
    // Use source_slug if available (allows nice URLs like /bostadsservice-ab)
    const vusercontentSlug = preview.source_slug || slug
    sourceUrl = `https://${vusercontentSlug}${VUSERCONTENT_DOMAIN}${pathString}`
  }

  // Find optional screenshot for fallback
  const previewImageSrc = findPreviewImage(slug) || (preview.source_slug ? findPreviewImage(preview.source_slug) : null)

  // ---- RENDER ----

  return (
    <PreviewWrapper
      proxyUrl={sourceUrl} // Legacy prop, now equals sourceUrl
      sourceUrl={sourceUrl}
      previewImageSrc={previewImageSrc}
      preview={{
        slug: preview.slug,
        company_name: preview.company_name,
        domain: preview.domain,
      }}
    />
  )
}

// ============================================================================
// METADATA
// ============================================================================

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params

  // Default metadata for invalid states
  if (!slugsEnabled || !slug) {
    return {
      title: 'Inte hittad | Sajtstudio',
      robots: { index: false, follow: false },
    }
  }

  const preview = getPreviewBySlug(slug)

  if (!preview) {
    return {
      title: 'Inte hittad | Sajtstudio',
      robots: { index: false, follow: false },
    }
  }

  return {
    title: preview.company_name
      ? `${preview.company_name} - Preview | Sajtstudio`
      : `Preview | Sajtstudio`,
    description: preview.domain
      ? `Förhandsgranskning av webbplats för ${preview.domain}`
      : 'Förhandsgranskning av webbplats skapad av Sajtstudio',
    // Don't index preview pages
    robots: {
      index: false,
      follow: false,
    },
  }
}
