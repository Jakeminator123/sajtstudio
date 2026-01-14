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
        ? '📊 Webbplatsanalys'
        : '🚀 Webbplatsrekommendationer'
    }\n\n`

    if (result.company) {
      markdown += `## ${result.company}\n\n`
    }

    if (result.domain) {
      markdown += `**🌐 Domän:** ${result.domain}\n\n`
    }

    markdown += `**📅 Datum:** ${new Date(
      result.timestamp || new Date()
    ).toLocaleDateString('sv-SE', { year: 'numeric', month: 'long', day: 'numeric' })}\n`
    markdown += `**💰 Kostnad:** ${result.cost.sek.toFixed(2)} SEK (${result.cost.tokens} tokens)\n\n`
    markdown += `---\n\n`

    if (result.audit_scores) {
      markdown += `## 📈 Poängöversikt\n\n`
      for (const [key, value] of Object.entries(result.audit_scores)) {
        const name =
          key.replace(/_/g, ' ').charAt(0).toUpperCase() +
          key.replace(/_/g, ' ').slice(1)
        const score = value as number
        const emoji = score >= 80 ? '🟢' : score >= 60 ? '🟡' : '🔴'
        markdown += `- ${emoji} **${name}:** ${score}/100\n`
      }
      markdown += '\n---\n\n'
    }

    if (result.strengths && result.strengths.length > 0) {
      markdown += `## ✅ Styrkor\n\n`
      result.strengths.forEach((strength: string, index: number) => {
        markdown += `${index + 1}. ${strength}\n`
      })
      markdown += '\n---\n\n'
    }

    if (result.issues && result.issues.length > 0) {
      markdown += `## ⚠️ Problem att åtgärda\n\n`
      result.issues.forEach((issue: string, index: number) => {
        markdown += `${index + 1}. ${issue}\n`
      })
      markdown += '\n---\n\n'
    }

    if (result.improvements && result.improvements.length > 0) {
      markdown += `## 🎯 Förbättringsförslag\n\n`
      result.improvements.forEach((improvement: Improvement, index: number) => {
        const impactEmoji = improvement.impact === 'high' ? '🔥' : improvement.impact === 'medium' ? '⚡' : '💡'
        const effortEmoji = improvement.effort === 'low' ? '✅' : improvement.effort === 'medium' ? '⚠️' : '🔧'
        markdown += `### ${index + 1}. ${improvement.item}\n\n`
        markdown += `${impactEmoji} **Påverkan:** ${improvement.impact === 'high' ? 'Hög' : improvement.impact === 'medium' ? 'Medel' : 'Låg'}\n`
        markdown += `${effortEmoji} **Svårighetsgrad:** ${improvement.effort === 'low' ? 'Låg' : improvement.effort === 'medium' ? 'Medel' : 'Hög'}\n`
        if (improvement.why) markdown += `\n**Varför:** ${improvement.why}\n`
        if (improvement.how) markdown += `\n**Hur:** ${improvement.how}\n`
        if (improvement.estimated_time) markdown += `\n⏱️ **Tidsuppskattning:** ${improvement.estimated_time}\n`
        markdown += '\n---\n\n'
      })
    }

    if (result.budget_estimate) {
      markdown += `## 💰 Budgetuppskattning\n\n`
      if (result.budget_estimate.low !== undefined && result.budget_estimate.high !== undefined) {
        markdown += `**Totalt:** ${result.budget_estimate.low.toLocaleString(
          'sv-SE'
        )} - ${result.budget_estimate.high.toLocaleString(
          'sv-SE'
        )} ${result.budget_estimate.currency}\n\n`
      }
      if (result.budget_estimate.immediate_fixes) {
        markdown += `**Omedelbara åtgärder:** ${result.budget_estimate.immediate_fixes.low.toLocaleString(
          'sv-SE'
        )} - ${result.budget_estimate.immediate_fixes.high.toLocaleString(
          'sv-SE'
        )} ${result.budget_estimate.currency}\n\n`
      }
      if (result.budget_estimate.full_optimization) {
        markdown += `**Full optimering:** ${result.budget_estimate.full_optimization.low.toLocaleString(
          'sv-SE'
        )} - ${result.budget_estimate.full_optimization.high.toLocaleString(
          'sv-SE'
        )} ${result.budget_estimate.currency}\n\n`
      }
      markdown += '---\n\n'
    }

    if (result.expected_outcomes && result.expected_outcomes.length > 0) {
      markdown += `## 🎯 Förväntade resultat\n\n`
      result.expected_outcomes.forEach((outcome: string, index: number) => {
        markdown += `${index + 1}. ${outcome}\n`
      })
      markdown += '\n---\n\n'
    }

    if (result.website_type_recommendation) {
      markdown += `## 🌐 Rekommenderad webbplatstyp\n\n`
      markdown += `${result.website_type_recommendation}\n\n`
      markdown += '---\n\n'
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
