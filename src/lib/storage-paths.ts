import fs from 'fs'
import path from 'path'

/**
 * Resolve runtime storage locations for files that should live outside the build output.
 *
 * In production on Render, mount a persistent disk (commonly at /var/data) and set:
 *   DATA_DIR=/var/data
 *
 * Locally, this defaults to <repo>/data to preserve existing structure.
 */
export function getDataDir(): string {
  const envDir = process.env.DATA_DIR?.trim()
  if (envDir) {
    // Render mounts the persistent disk at runtime, but it may not exist during build.
    // Fall back to <repo>/data if the env dir can't be created/accessed.
    try {
      fs.mkdirSync(envDir, { recursive: true })
      return envDir
    } catch {
      // Fall back below
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
