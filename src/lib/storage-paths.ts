import fs from 'fs'
import path from 'path'

/**
 * Resolve runtime storage locations for files that should live outside the build output.
 *
 * On Vercel (serverless): filesystem is read-only except /tmp. SQLite databases are
 * placed in /tmp and are ephemeral (recreated each cold start). This is fine for
 * caching/CMS defaults but NOT for persistent user data.
 *
 * On Render: mount a persistent disk and set DATA_DIR=/var/data.
 *
 * Locally: defaults to <repo>/data to preserve existing structure.
 */

const isVercel = !!process.env.VERCEL

export function getDataDir(): string {
  const envDir = process.env.DATA_DIR?.trim()

  // In development, warn if DATA_DIR is set (this is usually a mistake)
  if (process.env.NODE_ENV === 'development' && envDir) {
    const defaultDir = path.join(process.cwd(), 'data')
    console.warn(
      `⚠️  WARNING: DATA_DIR=${envDir} is set in development mode.\n` +
        `   This will save data to ${envDir} instead of ${defaultDir}.\n` +
        `   Comment out DATA_DIR in .env.local to use the default location.`
    )
  }

  if (envDir) {
    try {
      fs.mkdirSync(envDir, { recursive: true })
      return envDir
    } catch (error) {
      const defaultDir = path.join(process.cwd(), 'data')
      console.warn(`⚠️  Could not access DATA_DIR=${envDir}, falling back to ${defaultDir}`, error)
    }
  }

  // On Vercel, the regular filesystem is read-only — use /tmp for ephemeral SQLite
  if (isVercel) {
    const tmpDir = path.join('/tmp', 'sajtstudio-data')
    try {
      fs.mkdirSync(tmpDir, { recursive: true })
    } catch {
      // /tmp should always be writable on Vercel
    }
    return tmpDir
  }

  return path.join(process.cwd(), 'data')
}

export function getDbDir(): string {
  return path.join(getDataDir(), 'db')
}

export function getDbPath(filename: string): string {
  const dbDir = getDbDir()
  try {
    fs.mkdirSync(dbDir, { recursive: true })
  } catch {
    // Ignore mkdir failures. The DB open will fail with a clear error if needed.
  }
  return path.join(dbDir, filename)
}
