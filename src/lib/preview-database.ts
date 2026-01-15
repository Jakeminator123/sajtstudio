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
    company_name TEXT,
    domain TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_accessed DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

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

// Types
export interface Preview {
  id: number
  slug: string
  company_name: string | null
  domain: string | null
  created_at: string
  last_accessed: string
}

export interface NewPreview {
  slug: string
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
      INSERT INTO previews (slug, company_name, domain)
      VALUES (?, ?, ?)
    `)
    const result = stmt.run(preview.slug, preview.company_name || null, preview.domain || null)

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
    INSERT INTO previews (slug, company_name, domain)
    VALUES (?, ?, ?)
  `)

  let insertedCount = 0

  const transaction = previewDb.transaction(() => {
    for (const preview of defaultPreviews) {
      if (!existingSlugs.has(preview.slug)) {
        const result = insertStmt.run(
          preview.slug,
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
  const stmt = previewDb.prepare(
    'SELECT password_salt as salt, password_hash as hash FROM protected_embeds WHERE slug = ?'
  )
  const row = stmt.get(slug) as { salt: string; hash: string } | undefined
  if (!row?.salt || !row?.hash) return false

  const candidate = hashPassword(password, row.salt)
  return timingSafeEqualHex(candidate, row.hash)
}

const defaultProtectedEmbeds: Array<{ slug: string; title: string; target_url: string }> = [
  {
    slug: 'juice-factory',
    title: 'Juice Factory',
    target_url: 'https://v0-juice-factory-website.vercel.app',
  },
]

function getSeedPasswordForProtectedEmbed(slug: string): string | null {
  // Keep env names explicit so we don't accidentally expose them client-side.
  if (slug === 'juice-factory') {
    return (
      process.env.JUICE_FACTORY_PASSWORD?.trim() ||
      process.env.JUICE_FACTORY_EMBED_PASSWORD?.trim() ||
      null
    )
  }
  return null
}

export function seedDefaultProtectedEmbeds(): number {
  const existingSlugsStmt = previewDb.prepare('SELECT slug FROM protected_embeds')
  const existingSlugs = new Set(
    (existingSlugsStmt.all() as { slug: string }[]).map((row) => row.slug)
  )

  const insertStmt = previewDb.prepare(`
    INSERT INTO protected_embeds (slug, title, target_url, password_salt, password_hash)
    VALUES (?, ?, ?, ?, ?)
  `)

  let insertedCount = 0

  const transaction = previewDb.transaction(() => {
    for (const embed of defaultProtectedEmbeds) {
      if (existingSlugs.has(embed.slug)) continue

      const envPassword = getSeedPasswordForProtectedEmbed(embed.slug)
      const password = envPassword || crypto.randomBytes(18).toString('base64url')
      const salt = createPasswordSalt()
      const passwordHash = hashPassword(password, salt)

      try {
        const result = insertStmt.run(embed.slug, embed.title, embed.target_url, salt, passwordHash)
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

// Auto-seed on module load
seedDefaultPreviews()
seedDefaultProtectedEmbeds()

export default previewDb
