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

// ============================================================================
// SHARED HELPERS
// ============================================================================

/** Check if content-type or path indicates binary data (fonts, images, etc.) */
function isBinaryContent(contentType: string, path: string): boolean {
  return (
    contentType.includes('font') ||
    contentType.includes('woff') ||
    contentType.includes('octet-stream') ||
    contentType.startsWith('image/') ||
    contentType.startsWith('audio/') ||
    contentType.startsWith('video/') ||
    /\.(woff2?|ttf|otf|eot|png|jpe?g|gif|webp|avif|ico|svg|mp4|webm|pdf)$/i.test(path)
  )
}

/** File extensions that should never be served as text/html */
const NON_HTML_EXTENSIONS =
  /\.(js|mjs|css|json|map|xml|txt|svg|woff2?|ttf|otf|eot|png|jpe?g|gif|webp|avif|ico|mp4|webm|pdf)$/i

/**
 * Detect MIME type mismatch: upstream returned text/html for a static asset.
 * This happens when a SPA serves its index.html as fallback for unknown paths,
 * typically because static files live at the domain root while target_url includes a sub-path.
 */
function hasMimeTypeMismatch(contentType: string, path: string): boolean {
  return contentType.includes('text/html') && NON_HTML_EXTENSIONS.test(path)
}

/** Rewrite relative URLs in HTML so they route through the proxy */
function rewriteHtmlUrls(html: string, proxyBase: string): string {
  let result = html
  // href, src, action attributes starting with / (not // protocol-relative)
  result = result.replace(/(href|src|action)=(["'])\/(?!\/)/gi, `$1=$2${proxyBase}/`)
  // srcset values
  result = result.replace(
    /srcset=(["'])([^"']+)(["'])/gi,
    (_, q1, val, q2) =>
      `srcset=${q1}${val.replace(/\s*\/(?!\/)([^\s,]+)/g, ` ${proxyBase}/$1`)}${q2}`
  )
  // CSS url() values
  result = result.replace(/url\((["']?)\/(?!\/)([^)"']+)(["']?)\)/gi, `url($1${proxyBase}/$2$3)`)
  return result
}

/** Build a NextResponse from the upstream response, handling binary vs text content */
async function buildProxyResponse(
  upstreamResponse: Response,
  slug: string,
  pathStr: string
): Promise<NextResponse> {
  const contentType = upstreamResponse.headers.get('content-type') || ''

  // Binary content must be read as ArrayBuffer - .text() would corrupt the bytes
  if (isBinaryContent(contentType, pathStr.toLowerCase())) {
    const buffer = await upstreamResponse.arrayBuffer()
    return new NextResponse(buffer, {
      status: upstreamResponse.status,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  }

  let content = await upstreamResponse.text()

  // Rewrite URLs in HTML responses so links/assets route through proxy
  if (contentType.includes('text/html')) {
    content = rewriteHtmlUrls(content, `/api/embed-proxy/${slug}`)
  }

  return new NextResponse(content, {
    status: upstreamResponse.status,
    headers: {
      'Content-Type': contentType,
      'Cache-Control': 'no-store',
    },
  })
}

/** Validate auth cookie and return embed + resolved URL info, or an error response */
async function resolveRequest(
  request: NextRequest,
  params: Promise<{ slug: string; path?: string[] }>
) {
  const { slug, path } = await params
  const embed = getProtectedEmbedBySlug(slug)
  if (!embed) {
    return { error: new NextResponse('Embed not found', { status: 404 }) }
  }

  const cookieStore = await cookies()
  const authCookie = cookieStore.get(getEmbedCookieName(slug))
  if (!authCookie || !verifyEmbedSessionToken(authCookie.value, slug)) {
    return { error: new NextResponse('Unauthorized', { status: 401 }) }
  }

  const baseTarget = embed.target_url.replace(/\/$/, '')
  const targetOrigin = new URL(baseTarget).origin
  const pathStr = path?.length ? `/${path.map((p) => decodeURIComponent(p)).join('/')}` : '/'
  const query = request.nextUrl.searchParams.toString()
  const targetUrl = query ? `${baseTarget}${pathStr}?${query}` : `${baseTarget}${pathStr}`

  return { slug, pathStr, baseTarget, targetOrigin, targetUrl }
}

// ============================================================================
// ROUTE HANDLERS
// ============================================================================

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string; path?: string[] }> }
) {
  try {
    const resolved = await resolveRequest(request, params)
    if ('error' in resolved) return resolved.error
    const { slug, pathStr, baseTarget, targetOrigin, targetUrl } = resolved

    const fetchHeaders = {
      'User-Agent': request.headers.get('user-agent') || 'Mozilla/5.0',
      Accept: request.headers.get('accept') || '*/*',
      'Accept-Language': request.headers.get('accept-language') || 'sv-SE,sv;q=0.9',
      Referer: baseTarget + '/',
    }

    const response = await fetch(targetUrl, {
      headers: fetchHeaders,
      signal: AbortSignal.timeout(30000),
    })

    if (!response.ok) {
      return new NextResponse(`Upstream error: ${response.status}`, {
        status: response.status,
      })
    }

    // Detect MIME mismatch: SPA returned HTML for a static asset (JS/CSS/etc).
    // This happens when static files are served from the domain root but target_url
    // includes a sub-path (e.g. target_url="/app" but files live at origin "/static/...").
    // Retry from the domain root (origin + path) without the target_url sub-path.
    const upstreamCt = response.headers.get('content-type') || ''
    const rootUrl = targetOrigin !== baseTarget ? new URL(pathStr, targetOrigin).toString() : null

    if (rootUrl && hasMimeTypeMismatch(upstreamCt, pathStr)) {
      const query = request.nextUrl.searchParams.toString()
      const retryUrl = query ? `${rootUrl}?${query}` : rootUrl
      console.warn('[embed-proxy] MIME mismatch detected, retrying from origin root', {
        slug,
        path: pathStr,
        targetUrl,
        upstreamContentType: upstreamCt,
        retryUrl,
      })
      try {
        const retryResponse = await fetch(retryUrl, {
          headers: fetchHeaders,
          signal: AbortSignal.timeout(15000),
        })
        if (retryResponse.ok) {
          const retryCt = retryResponse.headers.get('content-type') || ''
          // Only use retry if it fixed the MIME mismatch
          if (!hasMimeTypeMismatch(retryCt, pathStr)) {
            console.info('[embed-proxy] MIME mismatch fixed by origin-root retry', {
              slug,
              path: pathStr,
              retryUrl,
              retryContentType: retryCt,
            })
            return buildProxyResponse(retryResponse, slug, pathStr)
          }
        }
      } catch {
        console.warn('[embed-proxy] Origin-root retry failed', {
          slug,
          path: pathStr,
          retryUrl,
        })
        // Fall through to original response
      }
    }

    return buildProxyResponse(response, slug, pathStr)
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
    const resolved = await resolveRequest(request, params)
    if ('error' in resolved) return resolved.error
    const { slug, pathStr, baseTarget, targetUrl } = resolved

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

    return buildProxyResponse(response, slug, pathStr)
  } catch (error) {
    console.error('Embed proxy POST error:', error)
    return new NextResponse('Proxy error', { status: 500 })
  }
}
