import crypto from 'crypto'

const DEFAULT_MAX_AGE_SECONDS = 60 * 60 * 24 * 7 // 7 days

type EmbedSessionPayload = {
  v: 1
  slug: string
  exp: number // unix seconds
}

function getSecret(): string | null {
  const secret = process.env.EMBED_AUTH_SECRET?.trim()
  if (secret) return secret
  // Allow local development without extra env configuration.
  if (process.env.NODE_ENV !== 'production') {
    return 'dev-embed-auth-secret'
  }
  return null
}

export function getEmbedCookieName(slug: string): string {
  return `ss_embed_${slug}`
}

export function createEmbedSessionToken(
  slug: string,
  maxAgeSeconds: number = DEFAULT_MAX_AGE_SECONDS
) {
  const secret = getSecret()
  if (!secret) {
    throw new Error('EMBED_AUTH_SECRET is required to create embed sessions')
  }

  const payload: EmbedSessionPayload = {
    v: 1,
    slug,
    exp: Math.floor(Date.now() / 1000) + maxAgeSeconds,
  }

  const payloadB64 = Buffer.from(JSON.stringify(payload)).toString('base64url')
  const sigB64 = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url')
  return `${payloadB64}.${sigB64}`
}

export function verifyEmbedSessionToken(token: string, expectedSlug: string): boolean {
  const secret = getSecret()
  if (!secret) return false

  const parts = token.split('.')
  if (parts.length !== 2) return false
  const [payloadB64, sigB64] = parts
  if (!payloadB64 || !sigB64) return false

  const expectedSigB64 = crypto.createHmac('sha256', secret).update(payloadB64).digest('base64url')

  try {
    const sigBuf = Buffer.from(sigB64, 'base64url')
    const expectedBuf = Buffer.from(expectedSigB64, 'base64url')
    if (sigBuf.length !== expectedBuf.length) return false
    if (!crypto.timingSafeEqual(sigBuf, expectedBuf)) return false
  } catch {
    return false
  }

  let payload: EmbedSessionPayload
  try {
    payload = JSON.parse(
      Buffer.from(payloadB64, 'base64url').toString('utf8')
    ) as EmbedSessionPayload
  } catch {
    return false
  }

  if (payload?.v !== 1) return false
  if (payload.slug !== expectedSlug) return false
  if (typeof payload.exp !== 'number') return false

  const now = Math.floor(Date.now() / 1000)
  if (now > payload.exp) return false

  return true
}
