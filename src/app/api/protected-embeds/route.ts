import { NextRequest, NextResponse } from 'next/server'

import {
  generateSlugFromCompanyName,
  getDeterministicPasswordForSlug,
  getProtectedEmbedBySlug,
  upsertProtectedEmbed,
} from '@/lib/preview-database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/

/** In production, require API key for sync. In development, allow without for local admin. */
function isAuthorized(request: NextRequest): boolean {
  if (process.env.NODE_ENV === 'development') return true
  const apiKey = process.env.DB_API_KEY?.trim()
  if (!apiKey) return true
  const auth = request.headers.get('Authorization')
  return auth === `Bearer ${apiKey}`
}
const MAX_SLUG_LENGTH = 100

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url)
    return parsed.protocol === 'https:' || parsed.protocol === 'http:'
  } catch {
    return false
  }
}

function ensureHttps(url: string): string {
  const trimmed = url.trim()
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed
  }
  return `https://${trimmed}`
}

/**
 * POST /api/protected-embeds
 *
 * Add a new protected embed.
 * Body: { companyName?: string, slug?: string, targetUrl: string }
 *
 * - If slug is provided, use it (companyName becomes title).
 * - If companyName is provided (and no slug), generate slug from company name.
 * - targetUrl is required (where iframe content is fetched from).
 */
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let body: { companyName?: string; slug?: string; targetUrl?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const { companyName, slug: slugInput, targetUrl: targetUrlInput } = body

    if (!targetUrlInput || typeof targetUrlInput !== 'string') {
      return NextResponse.json({ error: 'targetUrl is required' }, { status: 400 })
    }

    const targetUrl = ensureHttps(targetUrlInput)
    if (!isValidUrl(targetUrl)) {
      return NextResponse.json({ error: 'targetUrl must be a valid http(s) URL' }, { status: 400 })
    }

    let slug: string
    let title: string | undefined

    if (slugInput && typeof slugInput === 'string' && slugInput.trim()) {
      slug = slugInput.trim().toLowerCase()
      if (slug.length > MAX_SLUG_LENGTH || !SLUG_REGEX.test(slug)) {
        return NextResponse.json(
          { error: 'slug must be alphanumeric with hyphens/underscores only' },
          { status: 400 }
        )
      }
      title = companyName?.trim() || slug
    } else if (companyName && typeof companyName === 'string' && companyName.trim()) {
      slug = generateSlugFromCompanyName(companyName.trim())
      if (!slug) {
        return NextResponse.json(
          { error: 'Could not generate slug from company name' },
          { status: 400 }
        )
      }
      title = companyName.trim()
    } else {
      return NextResponse.json({ error: 'Provide either companyName or slug' }, { status: 400 })
    }

    const password = getDeterministicPasswordForSlug(slug)
    if (!password) {
      return NextResponse.json(
        {
          error: 'Seed not configured',
          hint: 'Set KOSTNADSFRI_PASSWORD_SEED or KOSTNADSFRI_API_KEY in environment',
        },
        { status: 503 }
      )
    }

    const existing = getProtectedEmbedBySlug(slug)
    const embed = upsertProtectedEmbed({
      slug,
      title: title || slug,
      target_url: targetUrl,
      password,
    })

    if (!embed) {
      return NextResponse.json({ error: 'Failed to save embed' }, { status: 500 })
    }

    const siteUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
      'https://www.sajtstudio.se'

    return NextResponse.json({
      success: true,
      embed: {
        slug: embed.slug,
        title: embed.title,
        target_url: embed.target_url,
      },
      password,
      url: `${siteUrl.replace(/\/$/, '')}/${slug}`,
      updated: !!existing,
    })
  } catch (error) {
    console.error('Protected embeds POST error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
