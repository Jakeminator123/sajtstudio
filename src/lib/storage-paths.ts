import fs from 'fs'
import path from 'path'

/**
 * Resolve runtime storage locations for files that should live outside the build output.
 *
 * In production on Render, mount a persistent disk (commonly at /var/data) and set:
 *   DATA_DIR=/var/data
 *
 * Locally, this defaults to <repo>/data to preserve existing structure.
 *
 * IMPORTANT: In development, DATA_DIR should NOT be set. It will cause data to be saved
 * in the wrong location (e.g., /var/data on Windows) instead of the project's data/ folder.
 */
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
    // Render mounts the persistent disk at runtime, but it may not exist during build.
    // Fall back to <repo>/data if the env dir can't be created/accessed.
    try {
      fs.mkdirSync(envDir, { recursive: true })
      return envDir
    } catch (error) {
      // Fall back to default location if DATA_DIR can't be accessed
      const defaultDir = path.join(process.cwd(), 'data')
      console.warn(
        `⚠️  Could not access DATA_DIR=${envDir}, falling back to ${defaultDir}`,
        error
      )
    }
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
    // Ignore mkdir failures (e.g. read-only FS). The DB open will fail if needed.
  }
  return path.join(dbDir, filename)
}
