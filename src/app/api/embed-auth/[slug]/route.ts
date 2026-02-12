import { NextRequest, NextResponse } from 'next/server'

import { createEmbedSessionToken, getEmbedCookieName } from '@/lib/embed-auth'
import { verifyProtectedEmbedPassword } from '@/lib/preview-database'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const SLUG_REGEX = /^[a-zA-Z0-9_-]+$/
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params

    if (!slug || typeof slug !== 'string' || !SLUG_REGEX.test(slug)) {
      return NextResponse.json({ error: 'Ogiltig slug' }, { status: 400 })
    }

    let body: unknown
    try {
      body = await request.json()
    } catch {
      return NextResponse.json({ error: 'Ogiltig JSON' }, { status: 400 })
    }

    const password = (body as { password?: unknown })?.password
    if (!password || typeof password !== 'string' || !password.trim()) {
      return NextResponse.json({ error: 'Lösenord krävs' }, { status: 400 })
    }

    const ok = verifyProtectedEmbedPassword(slug, password.trim())
    if (!ok) {
      return NextResponse.json({ error: 'Ogiltigt lösenord' }, { status: 401 })
    }

    const token = createEmbedSessionToken(slug, SESSION_MAX_AGE_SECONDS)

    const response = NextResponse.json({ success: true }, { status: 200 })
    response.cookies.set(getEmbedCookieName(slug), token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: SESSION_MAX_AGE_SECONDS,
      // path: "/" so cookie is sent to /api/embed-proxy/[slug] as well as /[slug]
      path: '/',
    })

    return response
  } catch (error) {
    console.error('Embed auth error:', error)
    return NextResponse.json({ error: 'Serverfel' }, { status: 500 })
  }
}
