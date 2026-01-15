import { NextRequest, NextResponse } from 'next/server'
import { promises as fs } from 'fs'
import path from 'path'

interface SavedAudit {
  id: string
  filename: string
  domain: string | null
  company: string | null
  type: 'audit' | 'recommendation'
  timestamp: string
  scores: {
    seo?: number
    ux?: number
    performance?: number
    overall?: number
  }
  cost: {
    sek: number
    tokens: number
  }
}

/**
 * GET /api/audits - List all saved audits
 * Returns metadata from saved JSON files without full content
 */
export async function GET(_request: NextRequest) {
  try {
    const auditsDir = path.join(process.cwd(), 'public', 'audits')

    // Check if directory exists
    try {
      await fs.access(auditsDir)
    } catch {
      return NextResponse.json({ audits: [], total: 0 })
    }

    // Read all files in directory
    const files = await fs.readdir(auditsDir)
    const jsonFiles = files.filter((f) => f.endsWith('.json'))

    // Parse each JSON file to extract metadata
    const audits: SavedAudit[] = []

    for (const filename of jsonFiles) {
      try {
        const filePath = path.join(auditsDir, filename)
        const content = await fs.readFile(filePath, 'utf-8')
        const data = JSON.parse(content)

        // Extract type from filename
        const isRecommendation = filename.startsWith('recommendation_')

        // Calculate overall score if audit_scores exist
        let overall: number | undefined
        if (data.audit_scores) {
          const scores = Object.values(data.audit_scores).filter(
            (v): v is number => typeof v === 'number'
          )
          if (scores.length > 0) {
            overall = Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
          }
        }

        audits.push({
          id: filename.replace('.json', ''),
          filename,
          domain: data.domain || null,
          company: data.company || null,
          type: isRecommendation ? 'recommendation' : 'audit',
          timestamp: data.timestamp || extractDateFromFilename(filename),
          scores: {
            seo: data.audit_scores?.seo,
            ux: data.audit_scores?.ux,
            performance: data.audit_scores?.performance,
            overall,
          },
          cost: {
            sek: data.cost?.sek || 0,
            tokens: data.cost?.tokens || 0,
          },
        })
      } catch (parseError) {
        console.error(`Failed to parse ${filename}:`, parseError)
        // Skip invalid files
      }
    }

    // Sort by timestamp (newest first)
    audits.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())

    return NextResponse.json({
      audits,
      total: audits.length,
    })
  } catch (error) {
    console.error('Failed to list audits:', error)
    return NextResponse.json({ error: 'Kunde inte hämta audits' }, { status: 500 })
  }
}

/**
 * POST /api/audits - Get full audit by ID
 *
 * Body: { id: string }
 * Returns the full audit JSON and markdown content
 *
 * Note: Uses POST instead of GET with query params for consistency
 * with Next.js App Router patterns in a single route file.
 */
export async function POST(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Audit ID krävs' }, { status: 400 })
    }

    // Sanitize ID to prevent path traversal
    const sanitizedId = id.replace(/[^a-zA-Z0-9_\-\.]/g, '')

    const auditsDir = path.join(process.cwd(), 'public', 'audits')
    const jsonPath = path.join(auditsDir, `${sanitizedId}.json`)
    const mdPath = path.join(auditsDir, `${sanitizedId}.md`)

    // Read JSON file
    let jsonContent
    try {
      const content = await fs.readFile(jsonPath, 'utf-8')
      jsonContent = JSON.parse(content)
    } catch {
      return NextResponse.json({ error: 'Audit hittades inte' }, { status: 404 })
    }

    // Try to read markdown file
    let markdown = null
    try {
      markdown = await fs.readFile(mdPath, 'utf-8')
    } catch {
      // Markdown file might not exist
    }

    return NextResponse.json({
      audit: jsonContent,
      markdown,
    })
  } catch (error) {
    console.error('Failed to get audit:', error)
    return NextResponse.json({ error: 'Kunde inte hämta audit' }, { status: 500 })
  }
}

/**
 * DELETE /api/audits - Delete an audit
 */
export async function DELETE(request: NextRequest) {
  try {
    const { id } = await request.json()

    if (!id || typeof id !== 'string') {
      return NextResponse.json({ error: 'Audit ID krävs' }, { status: 400 })
    }

    // Sanitize ID to prevent path traversal
    const sanitizedId = id.replace(/[^a-zA-Z0-9_\-\.]/g, '')

    const auditsDir = path.join(process.cwd(), 'public', 'audits')
    const jsonPath = path.join(auditsDir, `${sanitizedId}.json`)
    const mdPath = path.join(auditsDir, `${sanitizedId}.md`)

    // Delete both files
    try {
      await fs.unlink(jsonPath)
    } catch {
      return NextResponse.json({ error: 'Audit hittades inte' }, { status: 404 })
    }

    // Try to delete markdown (might not exist)
    try {
      await fs.unlink(mdPath)
    } catch {
      // Ignore if markdown doesn't exist
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete audit:', error)
    return NextResponse.json({ error: 'Kunde inte radera audit' }, { status: 500 })
  }
}

function extractDateFromFilename(filename: string): string {
  // Extract date from filename like "audit_www_amazon_com_2025-11-20.json"
  const dateMatch = filename.match(/(\d{4}-\d{2}-\d{2})/)
  if (dateMatch) {
    return new Date(dateMatch[1]).toISOString()
  }
  return new Date().toISOString()
}
