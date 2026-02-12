import { NextRequest, NextResponse } from 'next/server'

import { getProtectedEmbedBySlug } from '@/lib/preview-database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/

/**
 * API key for admin auth. Accepts either variable so you can set just
 * NEXT_PUBLIC_DB_API_KEY (client + server) or both to the same value.
 * Client sends NEXT_PUBLIC_DB_API_KEY; server validates against either.
 */
function getAdminApiKey(): string {
  return process.env.DB_API_KEY?.trim() || process.env.NEXT_PUBLIC_DB_API_KEY?.trim() || ''
}

/** Same auth as protected-embeds: require API key in production. */
function isAuthorized(request: NextRequest): boolean {
  if (process.env.NODE_ENV === 'development') return true
  const apiKey = getAdminApiKey()
  if (!apiKey) return false
  const auth = request.headers.get('Authorization')
  return auth === `Bearer ${apiKey}`
}

/**
 * POST /api/sync-embed-to-production
 *
 * Sync a single embed from local DB to production.
 * Body: { slug: string }
 *
 * Requires:
 * - NEXT_PUBLIC_PRODUCTION_URL or similar (production base URL)
 * - DB_API_KEY or NEXT_PUBLIC_DB_API_KEY (for auth + outgoing call to production)
 * - Authorization: Bearer <key> (client sends NEXT_PUBLIC_DB_API_KEY)
 */
export async function POST(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const productionUrl =
      process.env.NEXT_PUBLIC_PRODUCTION_URL?.trim() ||
      process.env.PRODUCTION_URL?.trim() ||
      'https://www.sajtstudio.se'

    const apiKey = getAdminApiKey()
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'API key not configured',
          hint: 'Set DB_API_KEY or NEXT_PUBLIC_DB_API_KEY for admin auth and production sync',
        },
        { status: 503 }
      )
    }

    let body: { slug?: string }
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
    }

    const slug = body.slug?.trim().toLowerCase()
    if (!slug || !SLUG_REGEX.test(slug)) {
      return NextResponse.json({ error: 'Valid slug required' }, { status: 400 })
    }

    const embed = getProtectedEmbedBySlug(slug)
    if (!embed) {
      return NextResponse.json({ error: 'Embed not found', slug }, { status: 404 })
    }

    const targetUrl = `${productionUrl.replace(/\/$/, '')}/api/protected-embeds`
    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        slug: embed.slug,
        companyName: embed.title || embed.slug,
        targetUrl: embed.target_url,
      }),
    })

    const data = await response.json().catch(() => ({}))

    if (!response.ok) {
      return NextResponse.json(
        {
          error: data.error || 'Production sync failed',
          hint: data.hint,
          status: response.status,
        },
        { status: 502 }
      )
    }

    return NextResponse.json({
      success: true,
      embed: data.embed,
      password: data.password,
      url: data.url,
      message: `Synkad till produktion: ${data.url || `/${embed.slug}`}`,
    })
  } catch (error) {
    console.error('Sync to production error:', error)
    return NextResponse.json({ error: 'Sync failed', detail: String(error) }, { status: 500 })
  }
}
