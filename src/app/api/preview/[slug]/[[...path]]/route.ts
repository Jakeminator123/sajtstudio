import { NextRequest, NextResponse } from 'next/server'
import { getPreviewBySlug } from '@/lib/preview-database'

/**
 * Proxy route for preview content
 *
 * Fetches content from vusercontent.net and serves it, bypassing X-Frame-Options.
 * Only works for slugs that exist in the previews database.
 */

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const EXTERNAL_BASE_URL = 'https://'
const EXTERNAL_DOMAIN_SUFFIX = '.vusercontent.net'

// Check if SLUGS feature is disabled
const slugsDisabled = (() => {
  const flag = process.env.SLUGS
  if (!flag) return true
  const normalized = flag.trim().toLowerCase()
  if (['n', 'no', 'off', '0', 'false'].includes(normalized)) return true
  if (['y', 'yes', 'on', '1', 'true'].includes(normalized)) return false
  return true
})()

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; path?: string[] }> }
) {
  try {
    const resolvedParams = await params
    const { slug, path } = resolvedParams

    if (slugsDisabled) {
      return new NextResponse('Not Found', { status: 404 })
    }

    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return new NextResponse('Not Found', { status: 404 })
    }

    // Validate slug format
    const slugRegex = /^[a-zA-Z0-9_-]+$/
    if (!slugRegex.test(slug)) {
      return new NextResponse('Invalid slug format', { status: 400 })
    }

    // Check if slug exists in database
    const preview = getPreviewBySlug(slug)
    if (!preview) {
      return new NextResponse('Not Found', { status: 404 })
    }

    // Build the path to proxy
    const pathString = path && path.length > 0 ? `/${path.join('/')}` : ''
    const externalUrl = `${EXTERNAL_BASE_URL}${slug}${EXTERNAL_DOMAIN_SUFFIX}${pathString}`

    // Get query parameters
    const searchParams = request.nextUrl.searchParams.toString()
    const targetUrl = searchParams ? `${externalUrl}?${searchParams}` : externalUrl

    // Fetch content from external site
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
        Accept: request.headers.get('accept') || '*/*',
        'Accept-Language': request.headers.get('accept-language') || 'sv-SE,sv;q=0.9',
        Referer: `${EXTERNAL_BASE_URL}${slug}${EXTERNAL_DOMAIN_SUFFIX}`,
      },
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      if (response.status === 404) {
        return new NextResponse('Site not found', { status: 404 })
      }
      return new NextResponse(`External site error: ${response.status}`, {
        status: response.status,
      })
    }

    let content = await response.text()
    const contentType = response.headers.get('content-type') || ''

    // If it's HTML, rewrite URLs to point to external origin
    // Note: <base> tag doesn't work due to CSP base-uri 'self' restriction
    if (contentType.includes('text/html')) {
      const externalOrigin = `${EXTERNAL_BASE_URL}${slug}${EXTERNAL_DOMAIN_SUFFIX}`

      // Rewrite paths that start with / to point to external origin
      // This handles /_next/, /assets/, /images/, etc.
      content = content.replace(/(href|src|action)=(["'])\//gi, `$1=$2${externalOrigin}/`)

      // Handle srcset attributes
      content = content.replace(
        /srcset=(["'])([^"']+)(["'])/gi,
        (match, quote1, srcsetValue, quote2) => {
          const rewritten = srcsetValue.replace(/\s*\/([^\s,]+)/g, ` ${externalOrigin}/$1`)
          return `srcset=${quote1}${rewritten}${quote2}`
        }
      )

      // Handle CSS url() with absolute paths
      content = content.replace(
        /url\((["']?)\/([^)"']+)(["']?)\)/gi,
        `url($1${externalOrigin}/$2$3)`
      )
    }

    return new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=60, s-maxage=300',
        // Don't set X-Frame-Options to allow iframe embedding
      },
    })
  } catch (error) {
    console.error('Preview proxy error:', error)

    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return new NextResponse('Request timeout', { status: 504 })
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return new NextResponse('External site unavailable', { status: 503 })
      }
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

// Handle POST requests
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; path?: string[] }> }
) {
  try {
    const resolvedParams = await params
    const { slug, path } = resolvedParams

    if (slugsDisabled) {
      return new NextResponse('Not Found', { status: 404 })
    }

    if (!slug || typeof slug !== 'string' || slug.trim() === '') {
      return new NextResponse('Not Found', { status: 404 })
    }

    const slugRegex = /^[a-zA-Z0-9_-]+$/
    if (!slugRegex.test(slug)) {
      return new NextResponse('Invalid slug format', { status: 400 })
    }

    // Check if slug exists in database
    const preview = getPreviewBySlug(slug)
    if (!preview) {
      return new NextResponse('Not Found', { status: 404 })
    }

    const pathString = path && path.length > 0 ? `/${path.join('/')}` : ''
    const externalUrl = `${EXTERNAL_BASE_URL}${slug}${EXTERNAL_DOMAIN_SUFFIX}${pathString}`
    const searchParams = request.nextUrl.searchParams.toString()
    const targetUrl = searchParams ? `${externalUrl}?${searchParams}` : externalUrl

    const body = await request.text()

    const response = await fetch(targetUrl, {
      method: 'POST',
      headers: {
        'Content-Type': request.headers.get('content-type') || 'application/json',
        'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
        Referer: `${EXTERNAL_BASE_URL}${slug}${EXTERNAL_DOMAIN_SUFFIX}`,
      },
      body,
      signal: AbortSignal.timeout(30000),
    })

    const content = await response.text()
    const contentType = response.headers.get('content-type') || ''

    return new NextResponse(content, {
      status: response.status,
      headers: {
        'Content-Type': contentType,
      },
    })
  } catch (error) {
    console.error('Preview proxy POST error:', error)

    if (error instanceof Error) {
      if (error.name === 'AbortError' || error.message.includes('timeout')) {
        return new NextResponse('Request timeout', { status: 504 })
      }
      if (error.message.includes('fetch') || error.message.includes('network')) {
        return new NextResponse('External site unavailable', { status: 503 })
      }
    }

    return new NextResponse('Internal Server Error', { status: 500 })
  }
}
