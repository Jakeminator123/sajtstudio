/**
 * Stats Database - SQLite-based storage for visitor statistics
 */

import Database from 'better-sqlite3'
import { getDbPath } from '@/lib/storage-paths'

const dbPath = getDbPath('stats.db')

// Create database connection
const statsDb = new Database(dbPath)

// Initialize tables
statsDb.exec(`
  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT,
    page TEXT DEFAULT '/',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

statsDb.exec(`
  CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT UNIQUE NOT NULL,
    first_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_visit DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Store anonymized IP hashes to derive IP-based uniqueness without persisting raw IPs
statsDb.exec(`
  CREATE TABLE IF NOT EXISTS visitor_ips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    ip_hash TEXT UNIQUE NOT NULL,
    ip_prefix TEXT,
    first_seen DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_seen DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Backfill ip_prefix column if table already existed
try {
  statsDb.exec(`ALTER TABLE visitor_ips ADD COLUMN ip_prefix TEXT`)
} catch {
  // Column already exists; safe to ignore
}

// Create indexes
statsDb.exec(`CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(created_at)`)
statsDb.exec(`CREATE INDEX IF NOT EXISTS idx_visitors_id ON visitors(visitor_id)`)
statsDb.exec(`CREATE INDEX IF NOT EXISTS idx_visitor_ips_hash ON visitor_ips(ip_hash)`)

export interface StatsData {
  totalPageViews: number
  uniqueVisitors: number
  uniqueIpVisitors: number
  todayPageViews: number
  lastUpdated: string
  recentIpHashes: {
    hash: string
    lastSeen: string
    prefix: string | null
  }[]
}

/**
 * Record a page view
 */
export function recordPageView(
  visitorId: string,
  page: string = '/',
  ipHash?: string | null,
  ipPrefix?: string | null
): void {
  const insertView = statsDb.prepare(`
    INSERT INTO page_views (visitor_id, page) VALUES (?, ?)
  `)
  insertView.run(visitorId, page)

  // Upsert visitor
  const upsertVisitor = statsDb.prepare(`
    INSERT INTO visitors (visitor_id) VALUES (?)
    ON CONFLICT(visitor_id) DO UPDATE SET last_visit = datetime('now')
  `)
  upsertVisitor.run(visitorId)

  if (ipHash) {
    const upsertIp = statsDb.prepare(`
      INSERT INTO visitor_ips (ip_hash, ip_prefix) VALUES (?, ?)
      ON CONFLICT(ip_hash) DO UPDATE SET last_seen = datetime('now'), ip_prefix = excluded.ip_prefix
    `)
    upsertIp.run(ipHash, ipPrefix ?? null)
  }
}

/**
 * Get statistics for admin dashboard
 */
export function getStats(): StatsData {
  const today = new Date().toISOString().split('T')[0]

  const totalStmt = statsDb.prepare(`SELECT COUNT(*) as count FROM page_views`)
  const totalPageViews = (totalStmt.get() as { count: number }).count

  const uniqueStmt = statsDb.prepare(`SELECT COUNT(*) as count FROM visitors`)
  const uniqueVisitors = (uniqueStmt.get() as { count: number }).count

  const uniqueIpStmt = statsDb.prepare(`SELECT COUNT(*) as count FROM visitor_ips`)
  const uniqueIpVisitors = (uniqueIpStmt.get() as { count: number }).count

  const todayStmt = statsDb.prepare(`
    SELECT COUNT(*) as count FROM page_views
    WHERE date(created_at) = date('now')
  `)
  const todayPageViews = (todayStmt.get() as { count: number }).count

  const recentIpStmt = statsDb.prepare(`
    SELECT ip_hash as hash, last_seen as lastSeen, ip_prefix as prefix
    FROM visitor_ips
    ORDER BY last_seen DESC
    LIMIT 10
  `)
  const recentIpHashes = recentIpStmt.all() as {
    hash: string
    lastSeen: string
    prefix: string | null
  }[]

  return {
    totalPageViews,
    uniqueVisitors,
    uniqueIpVisitors,
    todayPageViews,
    lastUpdated: today,
    recentIpHashes,
  }
}

export default statsDb
