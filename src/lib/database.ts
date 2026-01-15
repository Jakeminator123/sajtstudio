import Database from 'better-sqlite3'
import { getDbPath } from '@/lib/storage-paths'

// Database file location (defaults to <repo>/data/db; override with DATA_DIR in production)
const dbPath = getDbPath('leaderboard.db')

// Create database connection
const db = new Database(dbPath)

// Initialize the leaderboard table
db.exec(`
  CREATE TABLE IF NOT EXISTS leaderboard (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    company_name TEXT NOT NULL,
    email TEXT NOT NULL,
    player_name TEXT,
    score INTEGER NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Create index for faster queries
db.exec(`
  CREATE INDEX IF NOT EXISTS idx_score ON leaderboard(score DESC)
`)

export interface LeaderboardEntry {
  id: number
  company_name: string
  email: string
  player_name: string | null
  score: number
  created_at: string
}

export interface NewLeaderboardEntry {
  company_name: string
  email: string
  player_name?: string
  score: number
}

// Get top scores
export function getTopScores(limit: number = 10): LeaderboardEntry[] {
  const stmt = db.prepare(`
    SELECT id, company_name, email, player_name, score, created_at
    FROM leaderboard
    ORDER BY score DESC
    LIMIT ?
  `)
  return stmt.all(limit) as LeaderboardEntry[]
}

// Add new score
export function addScore(entry: NewLeaderboardEntry): LeaderboardEntry {
  const stmt = db.prepare(`
    INSERT INTO leaderboard (company_name, email, player_name, score)
    VALUES (?, ?, ?, ?)
  `)
  const result = stmt.run(entry.company_name, entry.email, entry.player_name || null, entry.score)

  // Return the inserted entry
  const getStmt = db.prepare('SELECT * FROM leaderboard WHERE id = ?')
  return getStmt.get(result.lastInsertRowid) as LeaderboardEntry
}

// Check if score qualifies for top 10
export function qualifiesForLeaderboard(score: number): boolean {
  const stmt = db.prepare(`
    SELECT COUNT(*) as count FROM leaderboard WHERE score >= ?
  `)
  const result = stmt.get(score) as { count: number }
  return result.count < 10
}

// Get player's best score by email
export function getBestScore(email: string): number | null {
  const stmt = db.prepare(`
    SELECT MAX(score) as best FROM leaderboard WHERE email = ?
  `)
  const result = stmt.get(email) as { best: number | null }
  return result.best
}

export default db
