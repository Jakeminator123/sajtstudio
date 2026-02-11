/**
 * Preview Page - Dynamic Demo Site Embedding
 * ==========================================
 *
 * This catch-all route handles two types of slugs:
 *
 * 1. PROTECTED EMBEDS (checked first)
 *    - Slug in protected_embeds table → password gate + iframe to target_url
 *    - Works regardless of SLUGS env var
 *
 * 2. PREVIEWS (when SLUGS=y)
 *    - /demo-xyz → Displays https://demo-xyz.vusercontent.net
 *    - /demo-xyz/page → Displays https://demo-xyz.vusercontent.net/page
 *
 * ## Security:
 * - Reserved routes are blocked (api, admin, etc.)
 * - Slug format is validated (alphanumeric + dashes/underscores only)
 *
 * @author Sajtstudio
 */

import { cookies, headers } from 'next/headers'
import { notFound } from 'next/navigation'
import fs from 'fs'
import path from 'path'

import EmbedPasswordGate from '@/components/preview/EmbedPasswordGate'
import PreviewWrapper from '@/components/preview/PreviewWrapper'
import { getEmbedCookieName, verifyEmbedSessionToken } from '@/lib/embed-auth'
import {
  getPreviewBySlug,
  getProtectedEmbedBySlug,
  logEmbedVisit,
  updateLastAccessed,
  updateProtectedEmbedLastAccessed,
} from '@/lib/preview-database'

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

function toQueryString(searchParams: Record<string, string | string[] | undefined> | undefined) {
  if (!searchParams) return ''
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(searchParams)) {
    if (v === undefined) continue
    if (Array.isArray(v)) {
      for (const item of v) usp.append(k, item)
    } else {
      usp.set(k, v)
    }
  }
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
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
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

export default async function PreviewPage({ params, searchParams }: PageProps) {
  const { slug, path: pathSegments } = await params

  // ---- VALIDATION ----

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

  // ---- PROTECTED EMBED (checked first) ----

  const embed = getProtectedEmbedBySlug(slug)
  if (embed) {
    const cookieStore = await cookies()
    const authCookie = cookieStore.get(getEmbedCookieName(slug))
    const isAuthed = authCookie ? verifyEmbedSessionToken(authCookie.value, slug) : false

    if (!isAuthed) {
      return <EmbedPasswordGate slug={slug} title={embed.title || slug} />
    }

    const resolvedSearchParams = searchParams ? await searchParams : undefined
    const pathString = pathSegments?.length ? `/${pathSegments.map(encodeURIComponent).join('/')}` : ''
    const query = toQueryString(resolvedSearchParams)
    const sourceUrl = `${embed.target_url}${pathString}${query}`

    try {
      updateProtectedEmbedLastAccessed(slug)
      const headersList = await headers()
      const ip =
        headersList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
        headersList.get('x-real-ip') ||
        headersList.get('cf-connecting-ip') ||
        'unknown'
      const userAgent = headersList.get('user-agent') || undefined
      const referer = headersList.get('referer') || undefined
      logEmbedVisit({
        slug,
        ip_address: ip,
        user_agent: userAgent,
        referer: referer,
        path: pathString || '/',
        query_string: query || undefined,
      })
    } catch {
      // Ignore
    }

    return (
      <PreviewWrapper
        proxyUrl={sourceUrl}
        sourceUrl={sourceUrl}
        previewImageSrc={null}
        preview={{
          slug,
          company_name: embed.title || slug,
          domain: new URL(embed.target_url).host,
        }}
      />
    )
  }

  // ---- PREVIEW (requires SLUGS=y) ----

  if (!slugsEnabled) {
    notFound()
  }

  const preview = getPreviewBySlug(slug)
  if (!preview) {
    notFound()
  }

  try {
    updateLastAccessed(slug)
  } catch {
    // Ignore
  }

  const pathString = pathSegments?.length ? `/${pathSegments.join('/')}` : ''
  let sourceUrl: string
  if (preview.target_url) {
    sourceUrl = `${preview.target_url}${pathString}`
  } else {
    const vusercontentSlug = preview.source_slug || slug
    sourceUrl = `https://${vusercontentSlug}${VUSERCONTENT_DOMAIN}${pathString}`
  }

  const previewImageSrc =
    findPreviewImage(slug) || (preview.source_slug ? findPreviewImage(preview.source_slug) : null)

  return (
    <PreviewWrapper
      proxyUrl={sourceUrl}
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

  if (!slug) {
    return { title: 'Inte hittad | Sajtstudio', robots: { index: false, follow: false } }
  }

  const embed = getProtectedEmbedBySlug(slug)
  if (embed) {
    return {
      title: embed.title ? `${embed.title} | Sajtstudio` : `Preview | Sajtstudio`,
      description: 'Skyddad förhandsgranskning',
      robots: { index: false, follow: false },
    }
  }

  if (!slugsEnabled) {
    return { title: 'Inte hittad | Sajtstudio', robots: { index: false, follow: false } }
  }

  const preview = getPreviewBySlug(slug)
  if (!preview) {
    return { title: 'Inte hittad | Sajtstudio', robots: { index: false, follow: false } }
  }

  return {
    title: preview.company_name
      ? `${preview.company_name} - Preview | Sajtstudio`
      : `Preview | Sajtstudio`,
    description: preview.domain
      ? `Förhandsgranskning av webbplats för ${preview.domain}`
      : 'Förhandsgranskning av webbplats skapad av Sajtstudio',
    robots: { index: false, follow: false },
  }
}
