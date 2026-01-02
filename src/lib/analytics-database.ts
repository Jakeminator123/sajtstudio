/**
 * Analytics Database - SQLite-based page view tracking
 *
 * Stores anonymized page views using a per-browser visitor ID.
 * Used by the admin dashboard to show aggregate metrics.
 */

import Database from "better-sqlite3";
import path from "path";

// Database file location - in project root
const dbPath = path.join(process.cwd(), "analytics.db");

// Create database connection
const analyticsDb = new Database(dbPath);

// Initialize page view table
analyticsDb.exec(`
  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL,
    path TEXT NOT NULL,
    referrer TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Indexes for common queries
analyticsDb.exec(`
  CREATE INDEX IF NOT EXISTS idx_page_views_created_at ON page_views(created_at)
`);
analyticsDb.exec(`
  CREATE INDEX IF NOT EXISTS idx_page_views_visitor_id ON page_views(visitor_id)
`);
analyticsDb.exec(`
  CREATE INDEX IF NOT EXISTS idx_page_views_path ON page_views(path)
`);

export interface VisitorStats {
  totalPageViews: number;
  uniqueVisitors: number;
  todayPageViews: number;
  lastUpdated: string;
}

export interface RecordPageViewInput {
  visitorId: string;
  path: string;
  referrer?: string | null;
  userAgent?: string | null;
}

export function recordPageView(input: RecordPageViewInput): void {
  const stmt = analyticsDb.prepare(`
    INSERT INTO page_views (visitor_id, path, referrer, user_agent, created_at)
    VALUES (?, ?, ?, ?, datetime('now'))
  `);

  stmt.run(
    input.visitorId,
    input.path,
    input.referrer ?? null,
    input.userAgent ?? null
  );
}

export function getVisitorStats(): VisitorStats {
  const totalStmt = analyticsDb.prepare(
    "SELECT COUNT(*) as count FROM page_views"
  );
  const uniqueStmt = analyticsDb.prepare(
    "SELECT COUNT(DISTINCT visitor_id) as count FROM page_views"
  );
  const todayStmt = analyticsDb.prepare(`
    SELECT COUNT(*) as count FROM page_views
    WHERE date(created_at, 'localtime') = date('now', 'localtime')
  `);

  const totalPageViews = (totalStmt.get() as { count: number }).count;
  const uniqueVisitors = (uniqueStmt.get() as { count: number }).count;
  const todayPageViews = (todayStmt.get() as { count: number }).count;

  return {
    totalPageViews,
    uniqueVisitors,
    todayPageViews,
    lastUpdated: new Date().toISOString().split("T")[0],
  };
}

export default analyticsDb;

