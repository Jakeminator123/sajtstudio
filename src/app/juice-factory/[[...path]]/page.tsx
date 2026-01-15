import type { Metadata } from 'next'

import { cookies } from 'next/headers'
import { notFound } from 'next/navigation'

import EmbedPasswordGate from '@/components/preview/EmbedPasswordGate'
import PreviewWrapper from '@/components/preview/PreviewWrapper'
import { getEmbedCookieName, verifyEmbedSessionToken } from '@/lib/embed-auth'
import { getProtectedEmbedBySlug, updateProtectedEmbedLastAccessed } from '@/lib/preview-database'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const SLUG = 'juice-factory'

type PageProps = {
  params: Promise<{ path?: string[] }>
  searchParams?: Promise<Record<string, string | string[] | undefined>>
}

function toQueryString(searchParams: Record<string, string | string[] | undefined> | undefined) {
  if (!searchParams) return ''
  const usp = new URLSearchParams()
  for (const [k, v] of Object.entries(searchParams)) {
    if (v === undefined) continue
    if (Array.isArray(v)) {
      for (const item of v) usp.append(k, item)
    } else {
      usp.set(k, v)
    }
  }
  const qs = usp.toString()
  return qs ? `?${qs}` : ''
}

export const metadata: Metadata = {
  title: 'Juice Factory | Sajtstudio',
  description: 'Inbäddad demo av Juice Factory.',
  robots: { index: false, follow: false },
}

export default async function JuiceFactoryEmbedPage({ params, searchParams }: PageProps) {
  const embed = getProtectedEmbedBySlug(SLUG)
  if (!embed) {
    // Embed not configured in DB (or DB missing). Keep it explicit rather than silently opening access.
    notFound()
  }

  const cookieStore = await cookies()
  const authCookie = cookieStore.get(getEmbedCookieName(SLUG))
  const isAuthed = authCookie ? verifyEmbedSessionToken(authCookie.value, SLUG) : false

  if (!isAuthed) {
    return <EmbedPasswordGate slug={SLUG} title={embed.title || 'Juice Factory'} />
  }

  const { path } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const pathPart = path?.length ? `/${path.map(encodeURIComponent).join('/')}` : ''
  const query = toQueryString(resolvedSearchParams)
  const sourceUrl = `${embed.target_url}${pathPart}${query}`

  // Track access (best-effort)
  try {
    updateProtectedEmbedLastAccessed(SLUG)
  } catch {
    // Ignore - not critical
  }

  return (
    <PreviewWrapper
      proxyUrl={sourceUrl} // Legacy prop, kept for backwards compatibility
      sourceUrl={sourceUrl}
      previewImageSrc={null}
      preview={{
        slug: SLUG,
        company_name: embed.title || 'Juice Factory',
        domain: new URL(embed.target_url).host,
      }}
    />
  )
}
