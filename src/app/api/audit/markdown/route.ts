import { NextRequest, NextResponse } from 'next/server'
import type { Improvement } from '@/types/audit'

export async function POST(request: NextRequest) {
  try {
    const { result } = await request.json()

    if (!result) {
      return NextResponse.json({ error: 'Resultat krävs' }, { status: 400 })
    }

    // Generate markdown content
    let markdown = `# ${
      result.audit_type === 'website_audit'
        ? 'Webbplatsanalys'
        : 'Webbplatsrekommendationer'
    }\n\n`

    if (result.domain) {
      markdown += `**Domän:** ${result.domain}\n\n`
    }

    markdown += `**Datum:** ${new Date(
      result.timestamp || new Date()
    ).toLocaleDateString('sv-SE')}\n`
    markdown += `**Kostnad:** ${result.cost.sek} SEK (${result.cost.tokens} tokens)\n\n`

    if (result.audit_scores) {
      markdown += `## Poängöversikt\n\n`
      for (const [key, value] of Object.entries(result.audit_scores)) {
        const name =
          key.replace(/_/g, ' ').charAt(0).toUpperCase() +
          key.replace(/_/g, ' ').slice(1)
        markdown += `- **${name}:** ${value}/100\n`
      }
      markdown += '\n'
    }

    if (result.strengths && result.strengths.length > 0) {
      markdown += `## Styrkor\n\n`
      result.strengths.forEach((strength: string) => {
        markdown += `- ${strength}\n`
      })
      markdown += '\n'
    }

    if (result.issues && result.issues.length > 0) {
      markdown += `## Problem\n\n`
      result.issues.forEach((issue: string) => {
        markdown += `- ${issue}\n`
      })
      markdown += '\n'
    }

    if (result.improvements && result.improvements.length > 0) {
      markdown += `## Förbättringsförslag\n\n`
      result.improvements.forEach((improvement: Improvement) => {
        markdown += `### ${improvement.item}\n`
        markdown += `- **Påverkan:** ${improvement.impact}\n`
        markdown += `- **Svårighetsgrad:** ${improvement.effort}\n`
        if (improvement.why) markdown += `- **Varför:** ${improvement.why}\n`
        if (improvement.how) markdown += `- **Hur:** ${improvement.how}\n`
        markdown += '\n'
      })
    }

    if (result.budget_estimate) {
      markdown += `## Budgetuppskattning\n\n`
      if (result.budget_estimate.low !== undefined) {
        markdown += `- **Minimum:** ${result.budget_estimate.low.toLocaleString(
          'sv-SE'
        )} ${result.budget_estimate.currency}\n`
      }
      if (result.budget_estimate.high !== undefined) {
        markdown += `- **Maximum:** ${result.budget_estimate.high.toLocaleString(
          'sv-SE'
        )} ${result.budget_estimate.currency}\n\n`
      }
    }

    if (result.expected_outcomes && result.expected_outcomes.length > 0) {
      markdown += `## Förväntade resultat\n\n`
      result.expected_outcomes.forEach((outcome: string) => {
        markdown += `- ${outcome}\n`
      })
      markdown += '\n'
    }

    if (result.website_type_recommendation) {
      markdown += `## Rekommenderad webbplatstyp\n\n`
      markdown += `${result.website_type_recommendation}\n\n`
    }

    // Return markdown as blob
    return new Response(markdown, {
      headers: {
        'Content-Type': 'text/markdown',
        'Content-Disposition': `attachment; filename=audit-${
          new Date().toISOString().split('T')[0]
        }.md`,
      },
    })
  } catch (error) {
    console.error('Markdown generation error:', error)
    return NextResponse.json(
      { error: 'Kunde inte generera Markdown' },
      { status: 500 }
    )
  }
}
