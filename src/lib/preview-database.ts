/**
 * Preview Database - SQLite-based storage for valid preview slugs
 *
 * Only slugs in this database will be allowed to be proxied/displayed.
 * This prevents abuse from arbitrary slug access.
 */

import Database from 'better-sqlite3'
import path from 'path'

// Database file location - in project root
const dbPath = path.join(process.cwd(), 'data', 'db', 'previews.db')

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

// Auto-seed on module load
seedDefaultPreviews()

export default previewDb
