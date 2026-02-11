import { NextRequest, NextResponse } from 'next/server'

import {
  getDeterministicPasswordForSlug,
  getPreviewBySlug,
  getProtectedEmbedBySlug,
} from '@/lib/preview-database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/
const MAX_SLUG_LENGTH = 100

/**
 * GET /api/password-generator?slug=xxx
 *
 * Returns the deterministic password for a slug.
 * Used by admin panel for embeds and kostnadsfri pages.
 * Same algorithm as sajtstudio_link_generator.py and SajtMaskin.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')?.trim().toLowerCase()

    if (!slug || slug.length > MAX_SLUG_LENGTH) {
      return NextResponse.json(
        { error: 'Slug is required and must be at most 100 characters' },
        { status: 400 }
      )
    }

    if (!SLUG_REGEX.test(slug)) {
      return NextResponse.json(
        { error: 'Slug must contain only letters, numbers, hyphens and underscores' },
        { status: 400 }
      )
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

    const embed = getProtectedEmbedBySlug(slug)
    const preview = getPreviewBySlug(slug)

    return NextResponse.json({
      success: true,
      slug,
      password,
      hasEmbed: !!embed,
      hasPreview: !!preview,
    })
  } catch (error) {
    console.error('Password generator error:', error)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
