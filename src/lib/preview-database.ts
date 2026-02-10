/**
 * Preview Database - SQLite-based storage for valid preview slugs
 *
 * Only slugs in this database will be allowed to be proxied/displayed.
 * This prevents abuse from arbitrary slug access.
 */

import Database from 'better-sqlite3'
import crypto from 'crypto'
import { getDbPath } from '@/lib/storage-paths'

// Database file location (defaults to <repo>/data/db; override with DATA_DIR in production)
const dbPath = getDbPath('previews.db')

// Create database connection
const previewDb = new Database(dbPath)

// Initialize the previews table
previewDb.exec(`
  CREATE TABLE IF NOT EXISTS previews (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    source_slug TEXT,
    target_url TEXT,
    company_name TEXT,
    domain TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Migration: Add source_slug column if it doesn't exist (for existing databases)
try {
  previewDb.exec(`ALTER TABLE previews ADD COLUMN source_slug TEXT`)
} catch {
  // Column already exists, ignore
}

// Migration: Add target_url column if it doesn't exist (for non-vusercontent URLs)
try {
  previewDb.exec(`ALTER TABLE previews ADD COLUMN target_url TEXT`)
} catch {
  // Column already exists, ignore
}

// Create index for faster slug lookups
previewDb.exec(`
  CREATE INDEX IF NOT EXISTS idx_preview_slug ON previews(slug)
`)

// Initialize protected embeds (nice slugs + external target + password)
previewDb.exec(`
  CREATE TABLE IF NOT EXISTS protected_embeds (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT UNIQUE NOT NULL,
    title TEXT,
    target_url TEXT NOT NULL,
    password_salt TEXT NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

previewDb.exec(`
  CREATE INDEX IF NOT EXISTS idx_protected_embed_slug ON protected_embeds(slug)
`)

// Initialize embed visits table (tracks visitors to protected embeds)
previewDb.exec(`
  CREATE TABLE IF NOT EXISTS embed_visits (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    slug TEXT NOT NULL,
    ip_address TEXT NOT NULL,
    user_agent TEXT,
    referer TEXT,
    path TEXT,
    query_string TEXT,
    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

previewDb.exec(`
  CREATE INDEX IF NOT EXISTS idx_embed_visits_slug ON embed_visits(slug)
`)

previewDb.exec(`
  CREATE INDEX IF NOT EXISTS idx_embed_visits_visited_at ON embed_visits(visited_at)
`)

// Types
export interface Preview {
  id: number
  slug: string
  /** Optional: the actual vusercontent slug if different from slug (for nice URLs) */
  source_slug: string | null
  /** Optional: direct URL to embed (for non-vusercontent sites like Vercel apps) */
  target_url: string | null
  company_name: string | null
  domain: string | null
  created_at: string
  last_accessed: string
}

export interface NewPreview {
  slug: string
  /** Optional: the actual vusercontent slug if different from slug (for nice URLs) */
  source_slug?: string
  /** Optional: direct URL to embed (for non-vusercontent sites like Vercel apps) */
  target_url?: string
  company_name?: string
  domain?: string
}

export interface ProtectedEmbed {
  id: number
  slug: string
  title: string | null
  target_url: string
  created_at: string
  last_accessed: string
}

export interface NewProtectedEmbed {
  slug: string
  title?: string
  target_url: string
  password: string
}

export interface EmbedVisit {
  id: number
  slug: string
  ip_address: string
  user_agent: string | null
  referer: string | null
  path: string | null
  query_string: string | null
  visited_at: string
}

export interface NewEmbedVisit {
  slug: string
  ip_address: string
  user_agent?: string
  referer?: string
  path?: string
  query_string?: string
}

// Default previews - seed data from kungorelser_20251219.json
const defaultPreviews: NewPreview[] = [
  {
    slug: 'demo-kzmg2cyhi0ovhhxbb6mh',
    company_name: 'M44 Investment AB',
    domain: 'simplywall.st',
  },
  {
    slug: 'demo-kzmjkmdwg06zd3psmu7i',
    company_name: 'Aross AB',
    domain: 'arossnickeri.se',
  },
  {
    slug: 'demo-kzminzdc21qfv0qpfnm8',
    company_name: 'Ceviton Group AB',
    domain: 'cevitongroup.se',
  },
  {
    slug: 'demo-kzmj3iibwn2wkojrw12d',
    company_name: '100flow AB',
    domain: 'wisebear.se',
  },
  {
    slug: 'demo-kzmqexpaukvzht598u2w',
    company_name: 'A.Westerlund AB',
    domain: 'amcapgroup.se',
  },
  {
    slug: 'demo-kzmo8x89b5giaepmzfxl',
    company_name: 'POLARAIL AB',
    domain: 'polarail.se',
  },
  {
    slug: 'demo-kzmgczxaunmw1xbtqfxu',
    company_name: 'Norrbygruppen AB',
    domain: 'norrbygruppen.se',
  },
  {
    slug: 'demo-kzmh51ltrixfqy8l38s5',
    company_name: 'Peter Wallgren Sollefteå AB',
    domain: 'peterwallgrensolleftea.se',
  },
  {
    slug: 'bostadsservice-ab',
    source_slug: 'demo-kzmpc9tk45vsovp4cme1',
    company_name: 'Bostadservice AB',
    domain: 'bostadservice.se',
  },
  {
    slug: 'mts',
    target_url: 'https://v0-architecture-website-design-nu-nine.vercel.app',
    company_name: 'MTS Måleriteknik Specialister',
    domain: 'mts.se',
  },
  {
    slug: 'start',
    target_url: 'https://landningssida.vercel.app',
    company_name: 'SajtStudio',
    domain: 'sajtstudio.se',
  },
]

/**
 * Get a preview by slug
 * Returns null if not found (means slug is not allowed)
 */
export function getPreviewBySlug(slug: string): Preview | null {
  const stmt = previewDb.prepare('SELECT * FROM previews WHERE slug = ?')
  const result = stmt.get(slug) as Preview | undefined
  return result || null
}

/**
 * Update the last_accessed timestamp for a preview
 */
export function updateLastAccessed(slug: string): void {
  const stmt = previewDb.prepare(`
    UPDATE previews SET last_accessed = datetime('now') WHERE slug = ?
  `)
  stmt.run(slug)
}

/**
 * Get all previews (for admin purposes)
 */
export function getAllPreviews(): Preview[] {
  const stmt = previewDb.prepare('SELECT * FROM previews ORDER BY last_accessed DESC')
  return stmt.all() as Preview[]
}

/**
 * Add a new preview to the database
 */
export function addPreview(preview: NewPreview): Preview | null {
  try {
    const stmt = previewDb.prepare(`
      INSERT INTO previews (slug, source_slug, target_url, company_name, domain)
      VALUES (?, ?, ?, ?, ?)
    `)
    const result = stmt.run(
      preview.slug,
      preview.source_slug || null,
      preview.target_url || null,
      preview.company_name || null,
      preview.domain || null
    )

    if (result.lastInsertRowid) {
      return getPreviewBySlug(preview.slug)
    }
    return null
  } catch {
    // Slug already exists or other error
    return null
  }
}

/**
 * Remove a preview from the database
 */
export function removePreview(slug: string): boolean {
  const stmt = previewDb.prepare('DELETE FROM previews WHERE slug = ?')
  const result = stmt.run(slug)
  return result.changes > 0
}

/**
 * Seed the database with default previews
 * Only inserts previews that don't already exist
 */
export function seedDefaultPreviews(): number {
  const existingSlugsStmt = previewDb.prepare('SELECT slug FROM previews')
  const existingSlugs = new Set(
    (existingSlugsStmt.all() as { slug: string }[]).map((row) => row.slug)
  )

  const insertStmt = previewDb.prepare(`
    INSERT OR IGNORE INTO previews (slug, source_slug, target_url, company_name, domain)
    VALUES (?, ?, ?, ?, ?)
  `)

  let insertedCount = 0

  const transaction = previewDb.transaction(() => {
    for (const preview of defaultPreviews) {
      if (!existingSlugs.has(preview.slug)) {
        const result = insertStmt.run(
          preview.slug,
          preview.source_slug || null,
          preview.target_url || null,
          preview.company_name || null,
          preview.domain || null
        )
        if (result.changes > 0) {
          insertedCount++
        }
      }
    }
  })

  transaction()
  return insertedCount
}

/**
 * Get preview stats
 */
export function getPreviewStats(): {
  total: number
  recentlyAccessed: number
} {
  const totalStmt = previewDb.prepare('SELECT COUNT(*) as count FROM previews')
  const total = (totalStmt.get() as { count: number }).count

  // Accessed in last 24 hours
  const recentStmt = previewDb.prepare(`
    SELECT COUNT(*) as count FROM previews
    WHERE last_accessed > datetime('now', '-1 day')
  `)
  const recentlyAccessed = (recentStmt.get() as { count: number }).count

  return { total, recentlyAccessed }
}

// ============================================================================
// PROTECTED EMBEDS (nice slug + external URL + password)
// ============================================================================

const PASSWORD_CHARS = 'abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789'
const DETERMINISTIC_HEX_LENGTH = 12
const DETERMINISTIC_PASSWORD_LENGTH = 8

function createPasswordSalt(): string {
  return crypto.randomBytes(16).toString('hex')
}

function hashPassword(password: string, salt: string): string {
  // scrypt is available in Node and avoids adding extra deps.
  return crypto.scryptSync(password, salt, 32).toString('hex')
}

function timingSafeEqualHex(aHex: string, bHex: string): boolean {
  try {
    const a = Buffer.from(aHex, 'hex')
    const b = Buffer.from(bHex, 'hex')
    if (a.length !== b.length) return false
    return crypto.timingSafeEqual(a, b)
  } catch {
    return false
  }
}

function timingSafeEqualString(a: string, b: string): boolean {
  try {
    const aBuf = Buffer.from(a)
    const bBuf = Buffer.from(b)
    if (aBuf.length !== bBuf.length) return false
    return crypto.timingSafeEqual(aBuf, bBuf)
  } catch {
    return false
  }
}

function hexToReadablePassword(hex: string): string {
  let num = parseInt(hex, 16)
  const base = PASSWORD_CHARS.length
  let result = ''
  for (let i = 0; i < DETERMINISTIC_PASSWORD_LENGTH; i += 1) {
    result += PASSWORD_CHARS[num % base]
    num = Math.floor(num / base)
  }
  return result
}

function getDeterministicPasswordForSlug(slug: string): string | null {
  const seed =
    process.env.KOSTNADSFRI_PASSWORD_SEED?.trim() ||
    process.env.KOSTNADSFRI_API_KEY?.trim() ||
    null

  if (!seed) return null
  const digest = crypto.createHmac('sha256', seed).update(slug).digest('hex')
  return hexToReadablePassword(digest.slice(0, DETERMINISTIC_HEX_LENGTH))
}

export function getProtectedEmbedBySlug(slug: string): ProtectedEmbed | null {
  const stmt = previewDb.prepare(
    'SELECT id, slug, title, target_url, created_at, last_accessed FROM protected_embeds WHERE slug = ?'
  )
  const result = stmt.get(slug) as ProtectedEmbed | undefined
  return result || null
}

export function getAllProtectedEmbeds(): ProtectedEmbed[] {
  const stmt = previewDb.prepare(
    'SELECT id, slug, title, target_url, created_at, last_accessed FROM protected_embeds ORDER BY last_accessed DESC'
  )
  return stmt.all() as ProtectedEmbed[]
}

export function updateProtectedEmbedLastAccessed(slug: string): void {
  const stmt = previewDb.prepare(`
    UPDATE protected_embeds SET last_accessed = datetime('now') WHERE slug = ?
  `)
  stmt.run(slug)
}

export function upsertProtectedEmbed(embed: NewProtectedEmbed): ProtectedEmbed | null {
  const salt = createPasswordSalt()
  const passwordHash = hashPassword(embed.password, salt)

  const stmt = previewDb.prepare(`
    INSERT INTO protected_embeds (slug, title, target_url, password_salt, password_hash)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      target_url = excluded.target_url,
      password_salt = excluded.password_salt,
      password_hash = excluded.password_hash
  `)

  try {
    stmt.run(embed.slug, embed.title || null, embed.target_url, salt, passwordHash)
    return getProtectedEmbedBySlug(embed.slug)
  } catch {
    return null
  }
}

export function setProtectedEmbedPassword(slug: string, password: string): boolean {
  const salt = createPasswordSalt()
  const passwordHash = hashPassword(password, salt)

  const stmt = previewDb.prepare(`
    UPDATE protected_embeds
    SET password_salt = ?, password_hash = ?
    WHERE slug = ?
  `)

  const result = stmt.run(salt, passwordHash, slug)
  return result.changes > 0
}

export function verifyProtectedEmbedPassword(slug: string, password: string): boolean {
  const trimmed = password.trim()
  if (!trimmed) return false

  const sharedPassword = process.env.PW?.trim()
  if (sharedPassword && timingSafeEqualString(trimmed, sharedPassword)) {
    return true
  }

  const deterministicPassword = getDeterministicPasswordForSlug(slug)
  if (deterministicPassword && timingSafeEqualString(trimmed, deterministicPassword)) {
    return true
  }

  const stmt = previewDb.prepare(
    'SELECT password_salt as salt, password_hash as hash FROM protected_embeds WHERE slug = ?'
  )
  const row = stmt.get(slug) as { salt: string; hash: string } | undefined
  if (!row?.salt || !row?.hash) return false

  const candidate = hashPassword(trimmed, row.salt)
  return timingSafeEqualHex(candidate, row.hash)
}

const defaultProtectedEmbeds: Array<{ slug: string; title: string; target_url: string }> = [
  {
    slug: 'juice-factory',
    title: 'Juice Factory',
    target_url: 'https://v0-juice-factory-website.vercel.app',
  },
  {
    slug: 'robotics-care',
    title: 'RoboticsCare',
    target_url: 'https://v0-roboticscare-website-design.vercel.app',
  },
]

function getSeedPasswordForProtectedEmbed(slug: string): string | null {
  // Keep env names explicit so we don't accidentally expose them client-side.
  const sharedPassword = process.env.PW?.trim() || null
  const deterministicPassword = getDeterministicPasswordForSlug(slug)
  if (slug === 'juice-factory') {
    return (
      process.env.JUICE_FACTORY_PASSWORD?.trim() ||
      process.env.JUICE_FACTORY_EMBED_PASSWORD?.trim() ||
      sharedPassword ||
      deterministicPassword
    )
  }
  return sharedPassword || deterministicPassword
}

export function seedDefaultProtectedEmbeds(): number {
  const existingSlugsStmt = previewDb.prepare('SELECT slug FROM protected_embeds')
  const existingSlugs = new Set(
    (existingSlugsStmt.all() as { slug: string }[]).map((row) => row.slug)
  )

  const insertStmt = previewDb.prepare(`
    INSERT OR IGNORE INTO protected_embeds (slug, title, target_url, password_salt, password_hash)
    VALUES (?, ?, ?, ?, ?)
  `)
  const upsertStmt = previewDb.prepare(`
    INSERT INTO protected_embeds (slug, title, target_url, password_salt, password_hash)
    VALUES (?, ?, ?, ?, ?)
    ON CONFLICT(slug) DO UPDATE SET
      title = excluded.title,
      target_url = excluded.target_url,
      password_salt = excluded.password_salt,
      password_hash = excluded.password_hash
  `)

  let insertedCount = 0

  const transaction = previewDb.transaction(() => {
    for (const embed of defaultProtectedEmbeds) {
      const envPassword = getSeedPasswordForProtectedEmbed(embed.slug)
      if (!envPassword && existingSlugs.has(embed.slug)) continue

      const password = envPassword || crypto.randomBytes(18).toString('base64url')
      const salt = createPasswordSalt()
      const passwordHash = hashPassword(password, salt)

      try {
        const stmt = envPassword ? upsertStmt : insertStmt
        const result = stmt.run(embed.slug, embed.title, embed.target_url, salt, passwordHash)
        if (result.changes > 0) {
          insertedCount++
          if (!envPassword) {
            // Only log generated passwords, never log env-provided secrets.
            console.warn(`[protected-embeds] Generated password for /${embed.slug}: ${password}`)
          }
        }
      } catch {
        // Ignore duplicates/races.
      }
    }
  })

  transaction()
  return insertedCount
}

// ============================================================================
// EMBED VISITS (track visitors to protected embeds)
// ============================================================================

/**
 * Log a visit to a protected embed page
 * Stores full IP address for admin tracking
 */
export function logEmbedVisit(visit: NewEmbedVisit): EmbedVisit | null {
  const stmt = previewDb.prepare(`
    INSERT INTO embed_visits (slug, ip_address, user_agent, referer, path, query_string)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  try {
    const result = stmt.run(
      visit.slug,
      visit.ip_address,
      visit.user_agent || null,
      visit.referer || null,
      visit.path || null,
      visit.query_string || null
    )

    if (result.lastInsertRowid) {
      return getEmbedVisitById(Number(result.lastInsertRowid))
    }
    return null
  } catch {
    return null
  }
}

/**
 * Get a visit by ID
 */
export function getEmbedVisitById(id: number): EmbedVisit | null {
  const stmt = previewDb.prepare('SELECT * FROM embed_visits WHERE id = ?')
  const result = stmt.get(id) as EmbedVisit | undefined
  return result || null
}

/**
 * Get all visits for a specific slug
 */
export function getEmbedVisitsBySlug(slug: string, limit = 100): EmbedVisit[] {
  const stmt = previewDb.prepare(`
    SELECT * FROM embed_visits
    WHERE slug = ?
    ORDER BY visited_at DESC
    LIMIT ?
  `)
  return stmt.all(slug, limit) as EmbedVisit[]
}

/**
 * Get all visits across all embeds (for admin)
 */
export function getAllEmbedVisits(limit = 200): EmbedVisit[] {
  const stmt = previewDb.prepare(`
    SELECT * FROM embed_visits
    ORDER BY visited_at DESC
    LIMIT ?
  `)
  return stmt.all(limit) as EmbedVisit[]
}

/**
 * Get visit statistics for embeds
 */
export function getEmbedVisitStats(): {
  totalVisits: number
  uniqueIps: number
  todayVisits: number
  visitsBySlug: { slug: string; count: number }[]
} {
  const totalStmt = previewDb.prepare('SELECT COUNT(*) as count FROM embed_visits')
  const totalVisits = (totalStmt.get() as { count: number }).count

  const uniqueStmt = previewDb.prepare(
    'SELECT COUNT(DISTINCT ip_address) as count FROM embed_visits'
  )
  const uniqueIps = (uniqueStmt.get() as { count: number }).count

  const todayStmt = previewDb.prepare(`
    SELECT COUNT(*) as count FROM embed_visits
    WHERE visited_at > datetime('now', '-1 day')
  `)
  const todayVisits = (todayStmt.get() as { count: number }).count

  const bySlugStmt = previewDb.prepare(`
    SELECT slug, COUNT(*) as count FROM embed_visits
    GROUP BY slug
    ORDER BY count DESC
  `)
  const visitsBySlug = bySlugStmt.all() as { slug: string; count: number }[]

  return { totalVisits, uniqueIps, todayVisits, visitsBySlug }
}

/**
 * Delete old visits (cleanup)
 */
export function deleteOldEmbedVisits(daysOld = 90): number {
  const stmt = previewDb.prepare(`
    DELETE FROM embed_visits
    WHERE visited_at < datetime('now', '-' || ? || ' days')
  `)
  const result = stmt.run(daysOld)
  return result.changes
}

// ============================================================================
// LANDING PAGE EVENTS (track visitors and interactions on the landing page)
// ============================================================================

previewDb.exec(`
  CREATE TABLE IF NOT EXISTS landing_events (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id TEXT NOT NULL,
    event_type TEXT NOT NULL,
    ip_address TEXT,
    user_agent TEXT,
    referrer TEXT,
    destination TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

previewDb.exec(`
  CREATE INDEX IF NOT EXISTS idx_landing_events_session ON landing_events(session_id)
`)

previewDb.exec(`
  CREATE INDEX IF NOT EXISTS idx_landing_events_created ON landing_events(created_at)
`)

export interface LandingEvent {
  id: number
  session_id: string
  event_type: string
  ip_address: string | null
  user_agent: string | null
  referrer: string | null
  destination: string | null
  created_at: string
}

export interface NewLandingEvent {
  session_id: string
  event_type: 'pageview' | 'click' | 'leave'
  ip_address?: string
  user_agent?: string
  referrer?: string
  /** Which link was clicked (e.g. "sajtstudio", "sajtmaskin") */
  destination?: string
}

/**
 * Log a landing page event
 */
export function logLandingEvent(event: NewLandingEvent): LandingEvent | null {
  const stmt = previewDb.prepare(`
    INSERT INTO landing_events (session_id, event_type, ip_address, user_agent, referrer, destination)
    VALUES (?, ?, ?, ?, ?, ?)
  `)

  try {
    const result = stmt.run(
      event.session_id,
      event.event_type,
      event.ip_address || null,
      event.user_agent || null,
      event.referrer || null,
      event.destination || null
    )
    if (result.lastInsertRowid) {
      const getStmt = previewDb.prepare('SELECT * FROM landing_events WHERE id = ?')
      return getStmt.get(Number(result.lastInsertRowid)) as LandingEvent
    }
    return null
  } catch {
    return null
  }
}

/**
 * Get landing page analytics
 */
export function getLandingStats(): {
  totalPageviews: number
  uniqueVisitors: number
  todayPageviews: number
  clicksByDestination: { destination: string; count: number }[]
  recentEvents: LandingEvent[]
  hourlyPageviews: { hour: string; count: number }[]
} {
  const totalStmt = previewDb.prepare(
    "SELECT COUNT(*) as count FROM landing_events WHERE event_type = 'pageview'"
  )
  const totalPageviews = (totalStmt.get() as { count: number }).count

  const uniqueStmt = previewDb.prepare(
    'SELECT COUNT(DISTINCT ip_address) as count FROM landing_events WHERE ip_address IS NOT NULL'
  )
  const uniqueVisitors = (uniqueStmt.get() as { count: number }).count

  const todayStmt = previewDb.prepare(
    "SELECT COUNT(*) as count FROM landing_events WHERE event_type = 'pageview' AND created_at > datetime('now', '-1 day')"
  )
  const todayPageviews = (todayStmt.get() as { count: number }).count

  const clicksStmt = previewDb.prepare(`
    SELECT destination, COUNT(*) as count FROM landing_events
    WHERE event_type = 'click' AND destination IS NOT NULL
    GROUP BY destination ORDER BY count DESC
  `)
  const clicksByDestination = clicksStmt.all() as { destination: string; count: number }[]

  const recentStmt = previewDb.prepare(
    'SELECT * FROM landing_events ORDER BY created_at DESC LIMIT 50'
  )
  const recentEvents = recentStmt.all() as LandingEvent[]

  const hourlyStmt = previewDb.prepare(`
    SELECT strftime('%Y-%m-%d %H:00', created_at) as hour, COUNT(*) as count
    FROM landing_events WHERE event_type = 'pageview' AND created_at > datetime('now', '-7 days')
    GROUP BY hour ORDER BY hour DESC
  `)
  const hourlyPageviews = hourlyStmt.all() as { hour: string; count: number }[]

  return {
    totalPageviews,
    uniqueVisitors,
    todayPageviews,
    clicksByDestination,
    recentEvents,
    hourlyPageviews,
  }
}

// Auto-seed on module load - but ONLY at runtime, not during Next.js build
// During build, NEXT_PHASE is set to 'phase-production-build'
const isBuilding = process.env.NEXT_PHASE === 'phase-production-build'

if (!isBuilding) {
  // Wrap in try-catch to handle race conditions during parallel module loading
  try {
    seedDefaultPreviews()
  } catch (e) {
    // Ignore UNIQUE constraint errors from parallel seeding
    if (!(e instanceof Error && e.message.includes('UNIQUE constraint'))) {
      console.error('Failed to seed previews:', e)
    }
  }

  try {
    seedDefaultProtectedEmbeds()
  } catch (e) {
    // Ignore UNIQUE constraint errors from parallel seeding
    if (!(e instanceof Error && e.message.includes('UNIQUE constraint'))) {
      console.error('Failed to seed protected embeds:', e)
    }
  }
}

export default previewDb
