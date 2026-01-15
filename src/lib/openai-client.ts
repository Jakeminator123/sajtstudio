export interface WebsiteContent {
  url: string
  title: string
  description: string
  headings: string[]
  text: string
  images: number
  links: {
    internal: number
    external: number
  }
  meta: {
    keywords?: string
    author?: string
    viewport?: string
    robots?: string
  }
  hasSSL: boolean
  responseTime: number
  wordCount: number
  textPreview: string
}

export interface QuestionAnswers {
  industry: string
  industryDescription: string
  purpose: string
  audience: string
  content: string[]
  features: string[]
  budget?: string
  timeline?: string
}

export type PromptMessage = {
  role: 'system' | 'user'
  content: Array<{
    type: 'text'
    text: string
  }>
}

const AUDIT_SYSTEM_PROMPT = `Du är en senior webb- och teknikrevisor. Gör alltid en tydlig teknisk analys av webbplatsen och leverera ENDAST giltig JSON utan Markdown.

LEVERERA JSON MED FÖLJANDE FÄLT (FYLL ALLTID I, ÄVEN OM DU MÅSTE GÖRA EN KVALIFICERAD BEDÖMNING):
{
  "company": "Företagsnamn",
  "audit_scores": {
    "seo": 0-100,
    "technical_seo": 0-100,
    "ux": 0-100,
    "content": 0-100,
    "performance": 0-100,
    "accessibility": 0-100,
    "security": 0-100,
    "mobile": 0-100
  },
  "strengths": ["Minst 3 styrkor"],
  "issues": ["Minst 3 konkreta problem"],
  "improvements": [
    {
      "item": "Förbättring",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "why": "Varför detta behövs",
      "how": "Hur man åtgärdar det",
      "estimated_time": "Tidsuppskattning",
      "technologies": ["Tekniker/verktyg"]
    }
  ],
  "budget_estimate": {
    "immediate_fixes": { "low": 0, "high": 0 },
    "full_optimization": { "low": 0, "high": 0 },
    "currency": "SEK"
  },
  "expected_outcomes": ["Resultat med mätbar effekt"],
  "security_analysis": {
    "https_status": "Status",
    "headers_analysis": "Säkerhetshuvuden",
    "cookie_policy": "Bedömning",
    "vulnerabilities": ["Lista med risker"]
  },
  "technical_recommendations": [
    {
      "area": "Teknisk domän (t.ex. performance, säkerhet, front-end)",
      "current_state": "Vad som händer nu",
      "recommendation": "Åtgärd",
      "implementation": "Kort kod/konfiguration"
    }
  ],
  "technical_architecture": {
    "recommended_stack": {
      "frontend": "Förslag",
      "backend": "Förslag",
      "cms": "Förslag",
      "hosting": "Förslag"
    },
    "integrations": ["Rekommenderade integrationer"],
    "security_measures": ["Prioriterade säkerhetsåtgärder"]
  },
  "priority_matrix": {
    "quick_wins": ["Snabba åtgärder"],
    "major_projects": ["Större projekt"],
    "fill_ins": ["När tid finns"],
    "thankless_tasks": ["Låg ROI men nödvändigt"]
  },
  "target_audience_analysis": {
    "demographics": "Kort beskrivning",
    "behaviors": "Beteenden",
    "pain_points": "Smärtpunkter",
    "expectations": "Vad de förväntar sig"
  },
  "competitor_insights": {
    "industry_standards": "Vad som är standard",
    "missing_features": "Saker sajten saknar",
    "unique_strengths": "Vad som sticker ut"
  },
  "content_strategy": {
    "key_pages": ["Nyckelsidor"],
    "content_types": ["Format"],
    "seo_foundation": "SEO-plan",
    "conversion_paths": ["Vägar mot mål"]
  },
  "design_direction": {
    "style": "Designstil",
    "color_psychology": "Färgval",
    "ui_patterns": ["UI-mönster"],
    "accessibility_level": "WCAG-nivå"
  },
  "implementation_roadmap": {
    "phase_1": { "duration": "Tidsplan", "deliverables": ["Leverabler"] },
    "phase_2": { "duration": "Tidsplan", "deliverables": ["Leverabler"] },
    "phase_3": { "duration": "Tidsplan", "deliverables": ["Leverabler"] },
    "launch": { "activities": ["Aktiviteter"] }
  },
  "success_metrics": {
    "kpis": ["Exakta KPI:er"],
    "tracking_setup": "Hur det ska mätas",
    "review_schedule": "Hur ofta det ska följas upp"
  }
}

Var särskilt noga med den tekniska delen: identifiera brister i prestanda, tillgänglighet, säkerhet, kodstruktur och hosting. Ange alltid minst ett konkret tekniskt förbättringsförslag även om informationen är begränsad.`

export function buildAuditPromptForReasoning(
  websiteContent: WebsiteContent,
  url: string,
  multiPageContent?: WebsiteContent[]
): string {
  const allPagesAnalysis =
    multiPageContent && multiPageContent.length > 0
      ? `\n\nYTTERLIGARE SIDOR ANALYSERADE:\n${multiPageContent
          .map(
            (page, i) =>
              `\n[Sida ${i + 2}: ${page.url}]\n- Titel: ${page.title}\n- Rubriker: ${page.headings.slice(0, 3).join(', ')}`
          )
          .join('')}`
      : ''

  return `Du är en expert på webbanalys. Analysera webbplatsen grundligt och leverera ENDAST ett komplett JSON-objekt enligt schemat nedan. Var extremt noggrann och detaljerad i din analys. Tänk steg för steg igenom varje område.

WEBBPLATS ATT ANALYSERA: ${url}

SIDINNEHÅLL:
- Titel: ${websiteContent.title}
- Beskrivning: ${websiteContent.description || 'Saknas'}
- SSL: ${websiteContent.hasSSL ? 'Ja' : 'Nej'}
- Svarstid: ${websiteContent.responseTime}ms
- Antal bilder: ${websiteContent.images}
- Antal länkar: Interna: ${websiteContent.links.internal}, Externa: ${websiteContent.links.external}

HUVUDRUBRIKER:
${websiteContent.headings.slice(0, 10).join('\n')}

TEXTINNEHÅLL (första 500 ord):
${websiteContent.textPreview}${allPagesAnalysis}

ANALYSERA FÖLJANDE OMRÅDEN MYCKET NOGGRANT:

1. SEO & Teknisk SEO (0-100):
   - Meta-taggar och strukturerade data
   - Rubrikstruktur och semantisk HTML
   - URL-struktur och intern länkning
   - Crawlbarhet och indexerbarhet

2. Användarupplevelse/UX (0-100):
   - Navigation och informationsarkitektur
   - Visuell hierarki och läsbarhet
   - Interaktionsmönster och användarvänlighet
   - Laddningstider och responsivitet

3. Innehåll (0-100):
   - Relevans och kvalitet på texten
   - Värdeproposition och budskap
   - Call-to-actions effektivitet
   - Multimedieinnehåll och bilder

4. Prestanda (0-100):
   - Uppskattad laddningstid
   - Resursoptimering
   - Caching och komprimering
   - Mobilprestanda

5. Tillgänglighet (0-100):
   - WCAG-efterlevnad
   - Skärmläsarkompatibilitet
   - Tangentbordsnavigering
   - Kontrastförhållanden

6. Säkerhet & GDPR:
   - HTTPS-implementation
   - Cookie-policy och samtycke
   - Datasäkerhet
   - Integritetspolicy

7. Konkurrentanalys:
   - Branschstandarder
   - Differentiering
   - Saknade funktioner

LEVERERA EXAKT DETTA JSON-SCHEMA:
{
  "company": "Företagsnamn extraherat från sajten",
  "audit_scores": {
    "seo": [0-100 med motivering],
    "technical_seo": [0-100],
    "ux": [0-100],
    "content": [0-100],
    "performance": [0-100],
    "accessibility": [0-100],
    "security": [0-100 NYT],
    "mobile": [0-100 NYT]
  },
  "strengths": [
    "Minst 5 konkreta styrkor med detaljer"
  ],
  "issues": [
    "Minst 7 specifika problem att åtgärda"
  ],
  "improvements": [
    {
      "item": "Specifik förbättring",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "why": "Detaljerad förklaring varför detta är viktigt",
      "how": "Konkreta implementeringssteg",
      "code_example": "Kodexempel om relevant",
      "estimated_time": "Tidsuppskattning"
    }
  ],
  "security_analysis": {
    "https_status": "OK/Problem",
    "headers_analysis": "Säkerhetshuvuden",
    "cookie_policy": "GDPR-efterlevnad",
    "vulnerabilities": []
  },
  "competitor_insights": {
    "industry_standards": "Vad är standard i branschen",
    "missing_features": "Vad konkurrenter har som saknas",
    "unique_strengths": "Unika fördelar"
  },
  "technical_recommendations": [
    {
      "area": "Område",
      "current_state": "Nuläge",
      "recommendation": "Förslag",
      "implementation": "Kod/konfiguration"
    }
  ],
  "budget_estimate": {
    "immediate_fixes": { "low": 15000, "high": 30000 },
    "full_optimization": { "low": 50000, "high": 150000 },
    "ongoing_monthly": { "low": 5000, "high": 15000 },
    "currency": "SEK"
  },
  "expected_outcomes": [
    "Mätbart resultat med procent/siffror"
  ],
  "priority_matrix": {
    "quick_wins": ["Snabba förbättringar"],
    "major_projects": ["Stora projekt"],
    "fill_ins": ["När tid finns"],
    "thankless_tasks": ["Nödvändigt men låg ROI"]
  }
}

Var EXTREMT detaljerad och ge minst 10-15 förbättringsförslag sorterade efter prioritet. Inkludera konkreta kodexempel där det är relevant.`
}

export function buildAuditPrompt(websiteContent: WebsiteContent, url: string): PromptMessage[] {
  return [
    {
      role: 'system',
      content: [
        {
          type: 'text',
          text: AUDIT_SYSTEM_PROMPT,
        },
      ],
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Analysera första sidan av: ${url}

BASIC INFO:
- Titel: ${websiteContent.title}
- Beskrivning: ${websiteContent.description || 'Saknas'}
- SSL: ${websiteContent.hasSSL ? 'Ja' : 'Nej'}
- Svarstid: ${websiteContent.responseTime}ms

RUBRIKER:
${websiteContent.headings.slice(0, 5).join('\n')}

TEXT (första 300 ord):
${(websiteContent.textPreview || '').substring(0, 500)}

Bedöm snabbt:
- SEO basics (meta, rubriker)
- Teknisk (SSL, hastighet)
- UX (navigation, läsbarhet)
- Innehåll (relevans)

Ge 3-5 konkreta förbättringar med budget. Håll det kort och praktiskt.

Svara ENDAST med JSON.`,
        },
      ],
    },
  ]
}

export function buildRecommendationPromptForReasoning(answers: QuestionAnswers): string {
  return `Du är en senior webb-konsult och UX-expert. Analysera företagets behov och leverera ENDAST ett komplett JSON-objekt med detaljerade rekommendationer. Tänk djupt och strategiskt.

FÖRETAGSPROFIL:
- Bransch: ${answers.industry}
- Verksamhet: ${answers.industryDescription}
- Hemsidans syfte: ${answers.purpose}
- Målgrupp: ${answers.audience}
- Innehåll som ska visas: ${answers.content.join(', ')}
- Önskade funktioner: ${answers.features.join(', ')}

ANALYSERA:
1. Branschspecifika krav och förväntningar
2. Målgruppens digitala beteende och preferenser
3. Konkurrentlandskap och differentiering
4. Tekniska krav för skalbarhet
5. SEO och konverteringsoptimering från start
6. Säkerhet och GDPR-krav

LEVERERA DETTA JSON-SCHEMA:
{
  "company": "Företagsbeskrivning",
  "website_type_recommendation": "Detaljerad beskrivning av rekommenderad webbplatstyp och arkitektur",
  "target_audience_analysis": {
    "demographics": "Demografi",
    "behaviors": "Digitala beteenden",
    "pain_points": "Smärtpunkter",
    "expectations": "Förväntningar på sajten"
  },
  "competitor_benchmarking": {
    "industry_leaders": ["Exempel på ledande sajter"],
    "common_features": ["Branschstandardfunktioner"],
    "differentiation_opportunities": ["Möjligheter att sticka ut"]
  },
  "improvements": [
    {
      "item": "Specifik funktion/element",
      "category": "UX|Tech|Content|Marketing|Security",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "why": "Detaljerad business case",
      "how": "Implementeringsplan",
      "technologies": ["Rekommenderade teknologier"],
      "estimated_time": "2-4 veckor"
    }
  ],
  "technical_architecture": {
    "recommended_stack": {
      "frontend": "Framework och motivering",
      "backend": "Server/API-lösning",
      "cms": "CMS-rekommendation",
      "hosting": "Hostinglösning"
    },
    "integrations": ["Nödvändiga integrationer"],
    "security_measures": ["Säkerhetsåtgärder"]
  },
  "content_strategy": {
    "key_pages": ["Kritiska sidor med syfte"],
    "content_types": ["Innehållstyper"],
    "seo_foundation": "SEO-strategi",
    "conversion_paths": ["Konverteringsflöden"]
  },
  "design_direction": {
    "style": "Modern/Klassisk/Minimalistisk etc",
    "color_psychology": "Färgval baserat på bransch",
    "ui_patterns": ["Rekommenderade UI-mönster"],
    "accessibility_level": "WCAG AA/AAA"
  },
  "budget_estimate": {
    "initial_development": { "low": 50000, "high": 200000 },
    "annual_maintenance": { "low": 20000, "high": 60000 },
    "marketing_launch": { "low": 10000, "high": 50000 },
    "currency": "SEK",
    "payment_structure": "Rekommenderad betalningsplan"
  },
  "expected_outcomes": [
    "Specifikt mätbart resultat med ROI"
  ],
  "implementation_roadmap": {
    "phase_1": { "duration": "2-3 veckor", "deliverables": ["Lista"] },
    "phase_2": { "duration": "3-4 veckor", "deliverables": ["Lista"] },
    "phase_3": { "duration": "2-3 veckor", "deliverables": ["Lista"] },
    "launch": { "activities": ["Lanseringsaktiviteter"] }
  },
  "success_metrics": {
    "kpis": ["Konkreta KPIer"],
    "tracking_setup": "Analytics-rekommendation",
    "review_schedule": "Uppföljningsplan"
  }
}

Ge MINST 15 detaljerade förbättringsförslag. Var extremt specifik och inkludera moderna best practices.`
}

export function buildRecommendationPrompt(answers: QuestionAnswers): PromptMessage[] {
  return [
    {
      role: 'system',
      content: [
        {
          type: 'text',
          text: `Du är en senior webb-konsult som hjälper företag planera nya hemsidor.
Baserat på kundens svar, leverera ENDAST giltig JSON enligt schemat nedan.

LEVERERA JSON MED FÖLJANDE FORM:
{
  "company": "Företagsnamn eller beskrivning",
  "website_type_recommendation": "Detaljerad beskrivning av rekommenderad webbplatstyp",
  "improvements": [
    {
      "item": "Rekommenderad funktion/element",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "why": "Förklaring varför detta är viktigt för deras verksamhet",
      "how": "Hur detta implementeras"
    }
  ],
  "budget_estimate": {
    "low": 0,
    "high": 0,
    "currency": "SEK"
  },
  "expected_outcomes": ["Förväntat resultat 1", "Förväntat resultat 2", ...],
  "technical_requirements": ["Tekniskt krav 1", "Tekniskt krav 2", ...]
}`,
        },
      ],
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: `Ett företag behöver en ny hemsida med följande profil:

FÖRETAGSPROFIL:
- Bransch: ${answers.industry}
- Verksamhet: ${answers.industryDescription}

HEMSIDANS SYFTE:
${answers.purpose}

MÅLGRUPP:
${answers.audience}

INNEHÅLL SOM SKA VISAS:
${answers.content.join(', ')}

ÖNSKADE FUNKTIONER:
${answers.features.join(', ')}

Baserat på denna information:

1. Rekommendera vilken typ av hemsida som passar bäst
2. Lista de viktigaste elementen/funktionerna sorterade efter påverkan
3. Ge en realistisk budgetuppskattning för utveckling
4. Beskriv förväntade affärsresultat
5. Lista tekniska krav för implementation

Tänk på:
- Branschspecifika behov och standarder
- Målgruppens förväntningar och beteenden
- Modern webb-standard och best practices
- SEO och konverteringsoptimering från start
- Skalbarhet och framtida tillväxt

Svara ENDAST med JSON enligt schemat ovan.`,
        },
      ],
    },
  ]
}
