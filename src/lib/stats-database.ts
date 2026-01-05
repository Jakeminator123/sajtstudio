/**
 * Stats Database - SQLite-based storage for visitor statistics
 */

import Database from "better-sqlite3";
import path from "path";

const dbPath = path.join(process.cwd(), "data", "db", "stats.db");

// Create database connection
const statsDb = new Database(dbPath);

// Initialize tables
statsDb.exec(`
  CREATE TABLE IF NOT EXISTS page_views (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT,
    page TEXT DEFAULT '/',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

statsDb.exec(`
  CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT UNIQUE NOT NULL,
    first_visit DATETIME DEFAULT CURRENT_TIMESTAMP,
    last_visit DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

// Create indexes
statsDb.exec(`CREATE INDEX IF NOT EXISTS idx_page_views_date ON page_views(created_at)`);
statsDb.exec(`CREATE INDEX IF NOT EXISTS idx_visitors_id ON visitors(visitor_id)`);

export interface StatsData {
  totalPageViews: number;
  uniqueVisitors: number;
  todayPageViews: number;
  lastUpdated: string;
}

/**
 * Record a page view
 */
export function recordPageView(visitorId: string, page: string = "/"): void {
  const insertView = statsDb.prepare(`
    INSERT INTO page_views (visitor_id, page) VALUES (?, ?)
  `);
  insertView.run(visitorId, page);

  // Upsert visitor
  const upsertVisitor = statsDb.prepare(`
    INSERT INTO visitors (visitor_id) VALUES (?)
    ON CONFLICT(visitor_id) DO UPDATE SET last_visit = datetime('now')
  `);
  upsertVisitor.run(visitorId);
}

/**
 * Get statistics for admin dashboard
 */
export function getStats(): StatsData {
  const today = new Date().toISOString().split("T")[0];

  const totalStmt = statsDb.prepare(`SELECT COUNT(*) as count FROM page_views`);
  const totalPageViews = (totalStmt.get() as { count: number }).count;

  const uniqueStmt = statsDb.prepare(`SELECT COUNT(*) as count FROM visitors`);
  const uniqueVisitors = (uniqueStmt.get() as { count: number }).count;

  const todayStmt = statsDb.prepare(`
    SELECT COUNT(*) as count FROM page_views 
    WHERE date(created_at) = date('now')
  `);
  const todayPageViews = (todayStmt.get() as { count: number }).count;

  return {
    totalPageViews,
    uniqueVisitors,
    todayPageViews,
    lastUpdated: today,
  };
}

export default statsDb;

