import { NextRequest, NextResponse } from 'next/server'

const SKIP_PREFIXES = [
  '/api',
  '/_next',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/site.webmanifest',
] as const

function shouldSkip(pathname: string): boolean {
  if (SKIP_PREFIXES.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return true
  }

  // Skip static assets (e.g. /images/foo.webp, /videos/bar.mp4)
  if (pathname.includes('.')) {
    return true
  }

  return false
}

function decodeSegment(segment: string): string {
  try {
    return decodeURIComponent(segment)
  } catch {
    return segment
  }
}

function slugify(input: string): string {
  let slug = input.toLowerCase().trim()
  slug = slug
    .replace(/å/g, 'a')
    .replace(/ä/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/é/g, 'e')
    .replace(/ü/g, 'u')
  slug = slug.replace(/[^a-z0-9]+/g, '-')
  slug = slug.replace(/-+/g, '-').replace(/^-|-$/g, '')
  return slug
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (shouldSkip(pathname)) {
    return NextResponse.next()
  }

  const segments = pathname.split('/').filter(Boolean)
  if (segments.length === 0) {
    return NextResponse.next()
  }

  const [rawSlug, ...rest] = segments
  const decodedSlug = decodeSegment(rawSlug)
  const normalizedSlug = slugify(decodedSlug)

  if (!normalizedSlug || normalizedSlug === rawSlug) {
    return NextResponse.next()
  }

  const nextUrl = request.nextUrl.clone()
  nextUrl.pathname = `/${normalizedSlug}${rest.length ? `/${rest.join('/')}` : ''}`
  return NextResponse.redirect(nextUrl)
}

export const config = {
  matcher: ['/((?!_next|api|favicon.ico|robots.txt|sitemap.xml|site.webmanifest).*)'],
}
