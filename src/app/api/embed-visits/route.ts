import { NextRequest, NextResponse } from 'next/server'

import {
  getAllEmbedVisits,
  getEmbedVisitsBySlug,
  getEmbedVisitStats,
  getAllProtectedEmbeds,
} from '@/lib/preview-database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * GET /api/embed-visits
 * Fetch visits for protected embeds (admin only)
 *
 * Query params:
 * - slug: filter by specific slug
 * - limit: max number of results (default 200)
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const slug = searchParams.get('slug')
    const limit = parseInt(searchParams.get('limit') || '200', 10)

    // Get visits
    const visits = slug ? getEmbedVisitsBySlug(slug, limit) : getAllEmbedVisits(limit)

    // Get stats
    const stats = getEmbedVisitStats()

    // Get embeds for reference
    const embeds = getAllProtectedEmbeds()

    return NextResponse.json({
      success: true,
      visits,
      stats,
      embeds,
    })
  } catch (error) {
    console.error('Failed to fetch embed visits:', error)
    return NextResponse.json({ error: 'Failed to fetch visits' }, { status: 500 })
  }
}
