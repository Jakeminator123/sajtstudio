import fs from 'fs'
import path from 'path'

/**
 * Resolve runtime storage locations for files that should live outside the build output.
 *
 * On Vercel (serverless): filesystem is read-only except /tmp. SQLite databases are
 * placed in /tmp and are ephemeral (recreated each cold start). This is fine for
 * caching/CMS defaults but NOT for persistent user data.
 *
 * On Render: /tmp is writable but ephemeral. For persistent data, mount a disk
 * at e.g. /var/data and set DATA_DIR=/var/data. If DATA_DIR is set but not
 * accessible (no disk mounted), we fall back to /tmp so the app can run.
 *
 * Locally: defaults to <repo>/data to preserve existing structure.
 */

const isVercel = !!process.env.VERCEL
const isRender = process.env.RENDER === 'true'

function getTmpDataDir(): string {
  const tmpDir = path.join('/tmp', 'sajtstudio-data')
  try {
    fs.mkdirSync(tmpDir, { recursive: true })
  } catch {
    // /tmp should be writable on Vercel and Render
  }
  return tmpDir
}

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
      // On Render/Vercel without working DATA_DIR: use /tmp (writable, ephemeral)
      if (isRender || isVercel) {
        const tmpDir = getTmpDataDir()
        console.warn(
          `⚠️  Could not access DATA_DIR=${envDir}, falling back to ${tmpDir} (ephemeral). ` +
            `On Render: add a persistent disk at ${envDir} for durable storage.`,
          error
        )
        return tmpDir
      }
      const defaultDir = path.join(process.cwd(), 'data')
      console.warn(`⚠️  Could not access DATA_DIR=${envDir}, falling back to ${defaultDir}`, error)
    }
  }

  // On Vercel and Render, the project dir is read-only — use /tmp (ephemeral)
  if (isVercel || isRender) {
    return getTmpDataDir()
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
