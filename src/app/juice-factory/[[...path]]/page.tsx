import type { Metadata } from 'next'

import PreviewWrapper from '@/components/preview/PreviewWrapper'

export const dynamic = 'force-dynamic'

const JUICE_FACTORY_URL = 'https://v0-juice-factory-website.vercel.app'

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
  const { path } = await params
  const resolvedSearchParams = searchParams ? await searchParams : undefined

  const pathPart = path?.length ? `/${path.map(encodeURIComponent).join('/')}` : ''
  const query = toQueryString(resolvedSearchParams)
  const sourceUrl = `${JUICE_FACTORY_URL}${pathPart}${query}`

  return (
    <PreviewWrapper
      proxyUrl={sourceUrl} // Legacy prop, kept for backwards compatibility
      sourceUrl={sourceUrl}
      previewImageSrc={null}
      preview={{
        slug: 'juice-factory',
        company_name: 'Juice Factory',
        domain: 'v0-juice-factory-website.vercel.app',
      }}
    />
  )
}
