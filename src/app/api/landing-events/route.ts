/**
 * Landing Page Events API
 *
 * POST /api/landing-events - Log a pageview, click, or leave event
 * GET  /api/landing-events - Get analytics data (for admin page)
 *
 * CORS enabled for the landing page iframe.
 */

import { NextRequest, NextResponse } from 'next/server'
import { logLandingEvent, getLandingStats } from '@/lib/preview-database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/** Allowed origins for CORS */
const ALLOWED_ORIGINS = [
  'https://landningssida.vercel.app',
  'https://www.sajtstudio.se',
  'https://sajtstudio.se',
  'http://localhost:3000',
  'http://localhost:1337',
]

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin)
  return {
    'Access-Control-Allow-Origin': allowed ? origin! : ALLOWED_ORIGINS[0],
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  }
}

/** Handle CORS preflight */
export async function OPTIONS(req: NextRequest) {
  const origin = req.headers.get('origin')
  return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
}

/** Log an event */
export async function POST(req: NextRequest) {
  const origin = req.headers.get('origin')
  const headers = corsHeaders(origin)

  try {
    const body = await req.json()
    const { session_id, event_type, destination } = body

    if (!session_id || !event_type) {
      return NextResponse.json(
        { error: 'session_id and event_type are required' },
        { status: 400, headers }
      )
    }

    if (!['pageview', 'click', 'leave'].includes(event_type)) {
      return NextResponse.json(
        { error: 'event_type must be pageview, click, or leave' },
        { status: 400, headers }
      )
    }

    // Extract IP and user agent from request
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown'
    const userAgent = req.headers.get('user-agent') || undefined
    const referrer = req.headers.get('referer') || undefined

    const event = logLandingEvent({
      session_id,
      event_type,
      ip_address: ip,
      user_agent: userAgent,
      referrer,
      destination: destination || undefined,
    })

    if (!event) {
      return NextResponse.json({ error: 'Failed to log event' }, { status: 500, headers })
    }

    return NextResponse.json({ ok: true, event }, { headers })
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400, headers })
  }
}

/** Get analytics data */
export async function GET(req: NextRequest) {
  const origin = req.headers.get('origin')
  const headers = corsHeaders(origin)

  try {
    const stats = getLandingStats()
    return NextResponse.json(stats, { headers })
  } catch {
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500, headers })
  }
}
