import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

import { getEmbedCookieName, verifyEmbedSessionToken } from '@/lib/embed-auth'
import { getProtectedEmbedBySlug } from '@/lib/preview-database'

/**
 * Embed proxy - fetches content from protected embed target URLs and serves it
 * under our origin, bypassing X-Frame-Options. Requires valid auth cookie.
 */
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; path?: string[] }> }
) {
  try {
    const { slug, path } = await params
    const embed = getProtectedEmbedBySlug(slug)
    if (!embed) {
      return new NextResponse('Embed not found', { status: 404 })
    }

    const cookieStore = await cookies()
    const authCookie = cookieStore.get(getEmbedCookieName(slug))
    if (!authCookie || !verifyEmbedSessionToken(authCookie.value, slug)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const baseTarget = embed.target_url.replace(/\/$/, '')
    const pathStr = path?.length ? `/${path.map((p) => decodeURIComponent(p)).join('/')}` : '/'
    const query = request.nextUrl.searchParams.toString()
    const targetUrl = query ? `${baseTarget}${pathStr}?${query}` : `${baseTarget}${pathStr}`

    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
        Accept: request.headers.get('accept') || '*/*',
        'Accept-Language': request.headers.get('accept-language') || 'sv-SE,sv;q=0.9',
        Referer: baseTarget + '/',
      },
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      return new NextResponse(`Upstream error: ${response.status}`, {
        status: response.status,
      })
    }

    let content = await response.text()
    const contentType = response.headers.get('content-type') || ''

    if (contentType.includes('text/html')) {
      const proxyBase = `/api/embed-proxy/${slug}`

      // Only rewrite paths starting with / (not // protocol-relative)
      content = content.replace(/(href|src|action)=(["'])\/(?!\/)/gi, `$1=$2${proxyBase}/`)
      content = content.replace(
        /srcset=(["'])([^"']+)(["'])/gi,
        (_, q1, val, q2) =>
          `srcset=${q1}${val.replace(/\s*\/(?!\/)([^\s,]+)/g, ` ${proxyBase}/$1`)}${q2}`
      )
      content = content.replace(
        /url\((["']?)\/(?!\/)([^)"']+)(["']?)\)/gi,
        `url($1${proxyBase}/$2$3)`
      )
    }

    return new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    console.error('Embed proxy error:', error)
    if (error instanceof Error && error.name === 'AbortError') {
      return new NextResponse('Timeout', { status: 504 })
    }
    return new NextResponse('Proxy error', { status: 500 })
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; path?: string[] }> }
) {
  try {
    const { slug, path } = await params
    const embed = getProtectedEmbedBySlug(slug)
    if (!embed) {
      return new NextResponse('Embed not found', { status: 404 })
    }

    const cookieStore = await cookies()
    const authCookie = cookieStore.get(getEmbedCookieName(slug))
    if (!authCookie || !verifyEmbedSessionToken(authCookie.value, slug)) {
      return new NextResponse('Unauthorized', { status: 401 })
    }

    const baseTarget = embed.target_url.replace(/\/$/, '')
    const pathStr = path?.length ? `/${path.map((p) => decodeURIComponent(p)).join('/')}` : '/'
    const query = request.nextUrl.searchParams.toString()
    const targetUrl = query ? `${baseTarget}${pathStr}?${query}` : `${baseTarget}${pathStr}`

    const body = await request.text()

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/x-www-form-urlencoded',
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
        Referer: baseTarget + '/',
      },
      body,
      signal: AbortSignal.timeout(30000),
    })

    const content = await response.text()
    const contentType = response.headers.get('content-type') || ''

    return new NextResponse(content, {
      status: response.status,
      headers: { 'Content-Type': contentType },
    })
  } catch (error) {
    console.error('Embed proxy POST error:', error)
    return new NextResponse('Proxy error', { status: 500 })
  }
}
