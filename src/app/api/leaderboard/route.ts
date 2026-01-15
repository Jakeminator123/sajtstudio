import { NextRequest, NextResponse } from 'next/server'
import { getTopScores, addScore, qualifiesForLeaderboard } from '@/lib/database'

// GET - Fetch top scores
export async function GET() {
  try {
    const scores = getTopScores(10)
    return NextResponse.json({ scores })
  } catch (error) {
    console.error('Error fetching leaderboard:', error)
    return NextResponse.json({ error: 'Failed to fetch leaderboard' }, { status: 500 })
  }
}

// POST - Add new score
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { company_name, email, player_name, score } = body

    // Validate required fields
    if (!company_name || !email || typeof score !== 'number') {
      return NextResponse.json(
        { error: 'Missing required fields: company_name, email, score' },
        { status: 400 }
      )
    }

    // Check if score qualifies
    const qualifies = qualifiesForLeaderboard(score)

    // Add score regardless (we store all scores)
    const entry = addScore({
      company_name,
      email,
      player_name,
      score,
    })

    return NextResponse.json({
      success: true,
      entry,
      qualifiesForTop10: qualifies,
    })
  } catch (error) {
    console.error('Error adding score:', error)
    return NextResponse.json({ error: 'Failed to add score' }, { status: 500 })
  }
}
