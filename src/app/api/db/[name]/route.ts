import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs/promises'

import { getDbPath } from '@/lib/storage-paths'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const ALLOWED_DB_NAMES = new Set(['previews.db', 'content.db', 'stats.db', 'leaderboard.db'])

function isAuthorized(request: NextRequest): boolean {
  const apiKey = process.env.DB_API_KEY?.trim()

  // Dev convenience: allow if key is not set.
  if (!apiKey) return process.env.NODE_ENV === 'development'

  const authHeader = request.headers.get('Authorization')
  return authHeader === `Bearer ${apiKey}`
}

function isValidDbName(name: string): boolean {
  // Avoid path traversal and only allow known DBs.
  return ALLOWED_DB_NAMES.has(name)
}

function isProbablySqlite(buffer: Buffer): boolean {
  // SQLite header: "SQLite format 3\0"
  if (buffer.length < 16) return false
  const header = buffer.subarray(0, 16).toString('utf8')
  return header.startsWith('SQLite format 3')
}

export async function GET(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params

  if (!isValidDbName(name)) {
    return NextResponse.json({ error: 'Invalid database name' }, { status: 400 })
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const dbPath = getDbPath(name)

  try {
    const data = await fs.readFile(dbPath)
    return new NextResponse(data, {
      status: 200,
      headers: {
        'Content-Type': 'application/x-sqlite3',
        'Content-Disposition': `attachment; filename="${name}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (error) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    if ((error as any)?.code === 'ENOENT') {
      return NextResponse.json({ error: 'Database not found' }, { status: 404 })
    }
    console.error('DB download error:', error)
    return NextResponse.json({ error: 'Failed to read database' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: Promise<{ name: string }> }) {
  const { name } = await params

  if (!isValidDbName(name)) {
    return NextResponse.json({ error: 'Invalid database name' }, { status: 400 })
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let buffer: Buffer
  try {
    const arrayBuffer = await request.arrayBuffer()
    buffer = Buffer.from(arrayBuffer)
  } catch {
    return NextResponse.json({ error: 'Invalid request body' }, { status: 400 })
  }

  if (!isProbablySqlite(buffer)) {
    return NextResponse.json(
      { error: 'File does not look like a SQLite database' },
      { status: 400 }
    )
  }

  // Write to temp file first, then swap (safer for running services).
  const finalPath = getDbPath(name)
  const tmpPath = getDbPath(`${name}.uploading`)
  const backupPath = getDbPath(`${name}.bak`)

  try {
    await fs.writeFile(tmpPath, buffer)

    // Move current DB out of the way (best effort).
    try {
      await fs.rename(finalPath, backupPath)
    } catch {
      // ignore (missing file or locked)
    }

    await fs.rename(tmpPath, finalPath)

    return NextResponse.json(
      {
        success: true,
        message:
          'Database uploaded. Restart the service to ensure all connections reload the new file.',
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('DB upload error:', error)
    return NextResponse.json({ error: 'Failed to write database' }, { status: 500 })
  }
}
