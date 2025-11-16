export interface WebsiteContent {
  url: string;
  title: string;
  description: string;
  headings: string[];
  text: string;
  images: number;
  links: {
    internal: number;
    external: number;
  };
  meta: {
    keywords?: string;
    author?: string;
    viewport?: string;
    robots?: string;
  };
  hasSSL: boolean;
  responseTime: number;
  wordCount: number;
  textPreview: string;
}

export interface QuestionAnswers {
  industry: string;
  industryDescription: string;
  purpose: string;
  audience: string;
  content: string[];
  features: string[];
  budget?: string;
  timeline?: string;
}

export type PromptMessage = {
  role: "system" | "user";
  content: Array<{
    type: "text";
    text: string;
  }>;
};

export function buildAuditPrompt(
  websiteContent: WebsiteContent,
  url: string
): PromptMessage[] {
  return [
    {
      role: "system",
      content: [
        {
          type: "text",
          text: `Du är en webb-konsult. Analysera första sidan av webbplatsen och leverera ENDAST giltig JSON.

LEVERERA JSON:
{
  "company": "Företagsnamn",
  "audit_scores": {
    "seo": 0-100,
    "technical_seo": 0-100,
    "ux": 0-100,
    "content": 0-100,
    "performance": 0-100,
    "accessibility": 0-100
  },
  "strengths": ["Styrka 1", "Styrka 2"],
  "issues": ["Problem 1", "Problem 2"],
  "improvements": [
    {
      "item": "Förbättring",
      "impact": "high|medium|low",
      "effort": "low|medium|high",
      "why": "Kort förklaring",
      "how": "Kort beskrivning"
    }
  ],
  "budget_estimate": {
    "low": 0,
    "high": 0,
    "currency": "SEK"
  },
  "expected_outcomes": ["Resultat 1", "Resultat 2"]
}`,
        },
      ],
    },
    {
      role: "user",
      content: [
        {
          type: "text",
          text: `Analysera första sidan av: ${url}

BASIC INFO:
- Titel: ${websiteContent.title}
- Beskrivning: ${websiteContent.description || "Saknas"}
- SSL: ${websiteContent.hasSSL ? "Ja" : "Nej"}
- Svarstid: ${websiteContent.responseTime}ms

RUBRIKER:
${websiteContent.headings.slice(0, 5).join("\n")}

TEXT (första 300 ord):
${(websiteContent.textPreview || "").substring(0, 500)}

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
  ];
}

export function buildRecommendationPrompt(
  answers: QuestionAnswers
): PromptMessage[] {
  return [
    {
      role: "system",
      content: [
        {
          type: "text",
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
      role: "user",
      content: [
        {
          type: "text",
          text: `Ett företag behöver en ny hemsida med följande profil:

FÖRETAGSPROFIL:
- Bransch: ${answers.industry}
- Verksamhet: ${answers.industryDescription}

HEMSIDANS SYFTE:
${answers.purpose}

MÅLGRUPP:
${answers.audience}

INNEHÅLL SOM SKA VISAS:
${answers.content.join(", ")}

ÖNSKADE FUNKTIONER:
${answers.features.join(", ")}

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
  ];
}
