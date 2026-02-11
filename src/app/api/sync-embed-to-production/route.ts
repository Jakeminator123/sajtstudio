import { NextRequest, NextResponse } from 'next/server'

import { getProtectedEmbedBySlug } from '@/lib/preview-database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/

/**
 * POST /api/sync-embed-to-production
 *
 * Sync a single embed from local DB to production.
 * Body: { slug: string }
 *
 * Requires:
 * - NEXT_PUBLIC_PRODUCTION_URL or similar (production base URL)
 * - DB_API_KEY (sent to production for auth)
 */
export async function POST(request: NextRequest) {
  try {
    const productionUrl =
      process.env.NEXT_PUBLIC_PRODUCTION_URL?.trim() ||
      process.env.PRODUCTION_URL?.trim() ||
      'https://www.sajtstudio.se'

    const apiKey = process.env.DB_API_KEY?.trim()
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'DB_API_KEY not configured',
          hint: 'Set DB_API_KEY in .env.local to sync to production',
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
      return NextResponse.json(
        { error: 'Embed not found', slug },
        { status: 404 }
      )
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
    return NextResponse.json(
      { error: 'Sync failed', detail: String(error) },
      { status: 500 }
    )
  }
}
