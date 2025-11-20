import {
  buildAuditPrompt,
  buildRecommendationPrompt,
  type PromptMessage,
} from "@/lib/openai-client";
import { ALLOWED_MODEL_IDS, DEFAULT_MODEL } from "@/config/openai";
import { scrapeWebsite } from "@/lib/webscraper";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import path from "path";
import type {
  AuditResult,
  Improvement,
  TechnicalRecommendation,
} from "@/types/audit";
import type { WebsiteContent } from "@/lib/openai-client";

// Extend Next.js route timeout to 5 minutes (300 seconds)
// This is required for long-running AI API calls
export const maxDuration = 300;

// Initialize OpenAI client with extended timeout
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 300000, // 5 minute timeout for all models (increased from 4 minutes)
  maxRetries: 3, // Increased retries for better reliability
});

// Cost calculation constants
const USD_TO_SEK = parseFloat(process.env.USD_TO_SEK || "11.0");
const PRICE_IN_PER_MTOK = parseFloat(
  process.env.OPENAI_PRICE_IN_PER_MTOK_USD || "1.25"
);
const PRICE_OUT_PER_MTOK = parseFloat(
  process.env.OPENAI_PRICE_OUT_PER_MTOK_USD || "10.0"
);

// Helper function to generate Markdown from result
function generateMarkdown(result: AuditResult): string {
  let markdown = `# ${
    result.audit_type === "website_audit"
      ? "Webbplatsanalys"
      : "Webbplatsrekommendationer"
  }\n\n`;

  if (result.domain) {
    markdown += `**Domän:** ${result.domain}\n\n`;
  }

  markdown += `**Datum:** ${new Date(
    result.timestamp || new Date()
  ).toLocaleDateString("sv-SE")}\n`;
  markdown += `**Kostnad:** ${result.cost.sek} SEK (${result.cost.tokens} tokens)\n\n`;

  if (result.audit_scores) {
    markdown += `## Poängöversikt\n\n`;
    for (const [key, value] of Object.entries(result.audit_scores)) {
      const name =
        key.replace(/_/g, " ").charAt(0).toUpperCase() +
        key.replace(/_/g, " ").slice(1);
      markdown += `- **${name}:** ${value}/100\n`;
    }
    markdown += "\n";
  }

  if (result.strengths && result.strengths.length > 0) {
    markdown += `## Styrkor\n\n`;
    result.strengths.forEach((strength: string) => {
      markdown += `- ${strength}\n`;
    });
    markdown += "\n";
  }

  if (result.issues && result.issues.length > 0) {
    markdown += `## Problem\n\n`;
    result.issues.forEach((issue: string) => {
      markdown += `- ${issue}\n`;
    });
    markdown += "\n";
  }

  if (result.improvements && result.improvements.length > 0) {
    markdown += `## Förbättringsförslag\n\n`;
    result.improvements.forEach((improvement: Improvement) => {
      markdown += `### ${improvement.item}\n`;
      markdown += `- **Påverkan:** ${improvement.impact}\n`;
      markdown += `- **Svårighetsgrad:** ${improvement.effort}\n`;
      if (improvement.why) markdown += `- **Varför:** ${improvement.why}\n`;
      if (improvement.how) markdown += `- **Hur:** ${improvement.how}\n`;
      markdown += "\n";
    });
  }

  if (result.budget_estimate) {
    markdown += `## Budgetuppskattning\n\n`;
    if (result.budget_estimate.low !== undefined) {
      markdown += `- **Minimum:** ${result.budget_estimate.low.toLocaleString(
        "sv-SE"
      )} ${result.budget_estimate.currency}\n`;
    }
    if (result.budget_estimate.high !== undefined) {
      markdown += `- **Maximum:** ${result.budget_estimate.high.toLocaleString(
        "sv-SE"
      )} ${result.budget_estimate.currency}\n\n`;
    }
  }

  if (result.expected_outcomes && result.expected_outcomes.length > 0) {
    markdown += `## Förväntade resultat\n\n`;
    result.expected_outcomes.forEach((outcome: string) => {
      markdown += `- ${outcome}\n`;
    });
    markdown += "\n";
  }

  if (result.website_type_recommendation) {
    markdown += `## Rekommenderad webbplatstyp\n\n`;
    markdown += `${result.website_type_recommendation}\n\n`;
  }

  // New fields for enhanced analysis
  if (result.security_analysis) {
    markdown += `## Säkerhetsanalys\n\n`;
    markdown += `- **HTTPS-status:** ${result.security_analysis.https_status}\n`;
    markdown += `- **Säkerhetshuvuden:** ${result.security_analysis.headers_analysis}\n`;
    markdown += `- **Cookie-policy:** ${result.security_analysis.cookie_policy}\n`;
    if (
      result.security_analysis.vulnerabilities &&
      result.security_analysis.vulnerabilities.length > 0
    ) {
      markdown += `- **Sårbarheter:**\n`;
      result.security_analysis.vulnerabilities.forEach((v: string) => {
        markdown += `  - ${v}\n`;
      });
    }
    markdown += "\n";
  }

  if (result.competitor_insights) {
    markdown += `## Konkurrentanalys\n\n`;
    markdown += `- **Branschstandarder:** ${result.competitor_insights.industry_standards}\n`;
    markdown += `- **Saknade funktioner:** ${result.competitor_insights.missing_features}\n`;
    markdown += `- **Unika styrkor:** ${result.competitor_insights.unique_strengths}\n\n`;
  }

  if (result.competitor_benchmarking) {
    markdown += `## Konkurrentbenchmarking\n\n`;
    if (
      Array.isArray(result.competitor_benchmarking.industry_leaders) &&
      result.competitor_benchmarking.industry_leaders.length > 0
    ) {
      markdown += `- **Ledande aktörer:**\n`;
      result.competitor_benchmarking.industry_leaders.forEach(
        (leader: string) => {
          markdown += `  - ${leader}\n`;
        }
      );
    }
    if (
      Array.isArray(result.competitor_benchmarking.common_features) &&
      result.competitor_benchmarking.common_features.length > 0
    ) {
      markdown += `- **Standardfunktioner:**\n`;
      result.competitor_benchmarking.common_features.forEach(
        (feature: string) => {
          markdown += `  - ${feature}\n`;
        }
      );
    }
    if (
      Array.isArray(
        result.competitor_benchmarking.differentiation_opportunities
      ) &&
      result.competitor_benchmarking.differentiation_opportunities.length > 0
    ) {
      markdown += `- **Differentieringsmöjligheter:**\n`;
      result.competitor_benchmarking.differentiation_opportunities.forEach(
        (opportunity: string) => {
          markdown += `  - ${opportunity}\n`;
        }
      );
    }
    markdown += "\n";
  }

  if (
    result.technical_recommendations &&
    result.technical_recommendations.length > 0
  ) {
    markdown += `## Tekniska rekommendationer\n\n`;
    result.technical_recommendations.forEach((rec: TechnicalRecommendation) => {
      markdown += `### ${rec.area}\n`;
      markdown += `- **Nuläge:** ${rec.current_state}\n`;
      markdown += `- **Rekommendation:** ${rec.recommendation}\n`;
      if (rec.implementation) {
        markdown += `- **Implementation:**\n\`\`\`\n${rec.implementation}\n\`\`\`\n`;
      }
      markdown += "\n";
    });
  }

  if (result.priority_matrix) {
    markdown += `## Prioritetsmatris\n\n`;
    if (
      result.priority_matrix.quick_wins &&
      result.priority_matrix.quick_wins.length > 0
    ) {
      markdown += `### Snabba vinster (Hög påverkan, Låg insats)\n`;
      result.priority_matrix.quick_wins.forEach((item: string) => {
        markdown += `- ${item}\n`;
      });
      markdown += "\n";
    }
    if (
      result.priority_matrix.major_projects &&
      result.priority_matrix.major_projects.length > 0
    ) {
      markdown += `### Stora projekt (Hög påverkan, Hög insats)\n`;
      result.priority_matrix.major_projects.forEach((item: string) => {
        markdown += `- ${item}\n`;
      });
      markdown += "\n";
    }
    if (
      result.priority_matrix.fill_ins &&
      result.priority_matrix.fill_ins.length > 0
    ) {
      markdown += `### Utfyllnadsarbete (Låg påverkan, Låg insats)\n`;
      result.priority_matrix.fill_ins.forEach((item: string) => {
        markdown += `- ${item}\n`;
      });
      markdown += "\n";
    }
  }

  if (result.target_audience_analysis) {
    markdown += `## Målgruppsanalys\n\n`;
    markdown += `- **Demografi:** ${result.target_audience_analysis.demographics}\n`;
    markdown += `- **Beteenden:** ${result.target_audience_analysis.behaviors}\n`;
    markdown += `- **Smärtpunkter:** ${result.target_audience_analysis.pain_points}\n`;
    markdown += `- **Förväntningar:** ${result.target_audience_analysis.expectations}\n\n`;
  }

  if (result.content_strategy) {
    markdown += `## Innehållsstrategi\n\n`;
    if (
      Array.isArray(result.content_strategy.key_pages) &&
      result.content_strategy.key_pages.length > 0
    ) {
      markdown += `- **Nyckelsidor:**\n`;
      result.content_strategy.key_pages.forEach((page: string) => {
        markdown += `  - ${page}\n`;
      });
    }
    if (
      Array.isArray(result.content_strategy.content_types) &&
      result.content_strategy.content_types.length > 0
    ) {
      markdown += `- **Innehållstyper:**\n`;
      result.content_strategy.content_types.forEach((type: string) => {
        markdown += `  - ${type}\n`;
      });
    }
    if (result.content_strategy.seo_foundation) {
      markdown += `- **SEO-grund:** ${result.content_strategy.seo_foundation}\n`;
    }
    if (
      Array.isArray(result.content_strategy.conversion_paths) &&
      result.content_strategy.conversion_paths.length > 0
    ) {
      markdown += `- **Konverteringsflöden:**\n`;
      result.content_strategy.conversion_paths.forEach((path: string) => {
        markdown += `  - ${path}\n`;
      });
    }
    markdown += "\n";
  }

  if (result.design_direction) {
    markdown += `## Designriktning\n\n`;
    markdown += `- **Stil:** ${result.design_direction.style}\n`;
    markdown += `- **Färgpsykologi:** ${result.design_direction.color_psychology}\n`;
    if (
      Array.isArray(result.design_direction.ui_patterns) &&
      result.design_direction.ui_patterns.length > 0
    ) {
      markdown += `- **UI-mönster:**\n`;
      result.design_direction.ui_patterns.forEach((pattern: string) => {
        markdown += `  - ${pattern}\n`;
      });
    }
    markdown += `- **Tillgänglighetsnivå:** ${result.design_direction.accessibility_level}\n\n`;
  }

  if (result.technical_architecture) {
    markdown += `## Teknisk arkitektur\n\n`;
    if (result.technical_architecture.recommended_stack) {
      markdown += `- **Rekommenderad stack:**\n`;
      Object.entries(result.technical_architecture.recommended_stack).forEach(
        ([key, value]) => {
          markdown += `  - ${key}: ${value}\n`;
        }
      );
    }
    if (
      Array.isArray(result.technical_architecture.integrations) &&
      result.technical_architecture.integrations.length > 0
    ) {
      markdown += `- **Integrationer:**\n`;
      result.technical_architecture.integrations.forEach(
        (integration: string) => {
          markdown += `  - ${integration}\n`;
        }
      );
    }
    if (
      Array.isArray(result.technical_architecture.security_measures) &&
      result.technical_architecture.security_measures.length > 0
    ) {
      markdown += `- **Säkerhetsåtgärder:**\n`;
      result.technical_architecture.security_measures.forEach(
        (measure: string) => {
          markdown += `  - ${measure}\n`;
        }
      );
    }
    markdown += "\n";
  }

  if (result.implementation_roadmap) {
    markdown += `## Implementeringsplan\n\n`;
    const roadmap = result.implementation_roadmap;
    ["phase_1", "phase_2", "phase_3", "launch"].forEach((phase) => {
      if (roadmap[phase]) {
        const phaseData = roadmap[phase];
        markdown += `### ${phase.replace("_", " ").toUpperCase()}\n`;
        if (phaseData.duration)
          markdown += `- **Tid:** ${phaseData.duration}\n`;
        if (phaseData.deliverables && phaseData.deliverables.length > 0) {
          markdown += `- **Leverabler:**\n`;
          phaseData.deliverables.forEach((d: string) => {
            markdown += `  - ${d}\n`;
          });
        }
        if (phaseData.activities && phaseData.activities.length > 0) {
          markdown += `- **Aktiviteter:**\n`;
          phaseData.activities.forEach((a: string) => {
            markdown += `  - ${a}\n`;
          });
        }
        markdown += "\n";
      }
    });
  }

  if (result.success_metrics) {
    markdown += `## Framgångsmått\n\n`;
    if (
      Array.isArray(result.success_metrics.kpis) &&
      result.success_metrics.kpis.length > 0
    ) {
      markdown += `- **KPI:er:**\n`;
      result.success_metrics.kpis.forEach((kpi: string) => {
        markdown += `  - ${kpi}\n`;
      });
    }
    if (result.success_metrics.tracking_setup) {
      markdown += `- **Spårningsupplägg:** ${result.success_metrics.tracking_setup}\n`;
    }
    if (result.success_metrics.review_schedule) {
      markdown += `- **Uppföljningsplan:** ${result.success_metrics.review_schedule}\n`;
    }
    markdown += "\n";
  }

  return markdown;
}

const MAX_PERSISTED_AUDITS = 24;

async function pruneOldAuditFiles(
  directory: string,
  maxFiles = MAX_PERSISTED_AUDITS
) {
  try {
    const entries = await fs.readdir(directory);
    const auditFiles = entries.filter(
      (file) => file.startsWith("audit_") || file.startsWith("recommendation_")
    );

    if (auditFiles.length <= maxFiles) {
      return;
    }

    const filesWithMeta = await Promise.all(
      auditFiles.map(async (fileName) => {
        const fullPath = path.join(directory, fileName);
        try {
          const stats = await fs.stat(fullPath);
          return { fileName, mtime: stats.mtimeMs };
        } catch {
          return { fileName, mtime: 0 };
        }
      })
    );

    const filesToDelete = filesWithMeta
      .sort((a, b) => b.mtime - a.mtime)
      .slice(maxFiles);

    await Promise.all(
      filesToDelete.map(async ({ fileName }) => {
        const target = path.join(directory, fileName);
        try {
          await fs.unlink(target);
        } catch (error) {
          console.warn("Failed to prune audit file:", target, error);
        }
      })
    );
  } catch (error) {
    console.warn("Failed to prune old audit files:", error);
  }
}

function extractOutputText(response: Record<string, unknown>): string {
  if (
    typeof response?.output_text === "string" &&
    response.output_text.trim()
  ) {
    return response.output_text;
  }

  if (Array.isArray(response?.output)) {
    const combined = response.output
      .map((item: Record<string, unknown>) => {
        if (!item?.content) return "";
        if (!Array.isArray(item.content)) return "";

        return item.content
          .map((contentItem: Record<string, unknown>) => {
            const textCandidate = contentItem?.text ?? contentItem?.value;

            if (typeof textCandidate === "string") {
              return textCandidate;
            }

            if (Array.isArray(textCandidate)) {
              return textCandidate
                .map((entry: string | Record<string, unknown>) => {
                  if (typeof entry === "string") return entry;
                  if (typeof entry?.text === "string") return entry.text;
                  if (typeof entry?.value === "string") return entry.value;
                  return "";
                })
                .join("");
            }

            if (
              typeof textCandidate === "object" &&
              textCandidate !== null &&
              "text" in textCandidate &&
              typeof (textCandidate as { text: unknown }).text === "string"
            ) {
              return (textCandidate as { text: string }).text;
            }

            return "";
          })
          .join("");
      })
      .join("\n")
      .trim();

    if (combined) {
      return combined;
    }
  }

  return "";
}

function extractFirstJsonObject(text: string): string | null {
  let start = text.indexOf("{");

  while (start !== -1) {
    let depth = 0;
    let inString = false;
    let escapeNext = false;

    for (let i = start; i < text.length; i++) {
      const char = text[i];

      if (inString) {
        if (escapeNext) {
          escapeNext = false;
          continue;
        }
        if (char === "\\") {
          escapeNext = true;
          continue;
        }
        if (char === '"') {
          inString = false;
        }
        continue;
      }

      if (char === '"') {
        inString = true;
        continue;
      }

      if (char === "{") {
        depth++;
      } else if (char === "}") {
        depth--;
        if (depth === 0) {
          return text.slice(start, i + 1);
        }
      }
    }

    start = text.indexOf("{", start + 1);
  }

  return null;
}

// Validation helper function
function validateAuditResult(result: unknown): result is AuditResult {
  if (!result || typeof result !== "object") return false;

  const r = result as Record<string, unknown>;

  // Check required fields
  if (
    !r.audit_type ||
    !["website_audit", "recommendation"].includes(r.audit_type as string)
  ) {
    return false;
  }

  if (!r.cost || typeof r.cost !== "object") {
    return false;
  }

  const cost = r.cost as Record<string, unknown>;
  if (
    typeof cost.tokens !== "number" ||
    typeof cost.sek !== "number" ||
    typeof cost.usd !== "number"
  ) {
    return false;
  }

  // At least one of these should exist
  const hasContent = Boolean(
    (typeof r.company === "string" && r.company.trim().length > 0) ||
      (Array.isArray(r.improvements) && r.improvements.length > 0) ||
      (r.audit_scores && typeof r.audit_scores === "object") ||
      (Array.isArray(r.strengths) && r.strengths.length > 0) ||
      (Array.isArray(r.issues) && r.issues.length > 0)
  );

  return hasContent;
}

export async function POST(request: NextRequest) {
  const requestStartTime = Date.now();
  let requestId = `req_${Date.now()}_${Math.random()
    .toString(36)
    .substring(7)}`;

  try {
    let body;
    try {
      body = await request.json();
      console.log(`[${requestId}] Request received:`, {
        mode: body.mode,
        hasUrl: !!body.url,
        hasAnswers: !!body.answers,
        model: body.model || DEFAULT_MODEL,
        webSearch: Boolean(body.webSearch),
      });
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse request body:`, parseError);
      return NextResponse.json(
        { error: "Ogiltig JSON i förfrågan" },
        { status: 400 }
      );
    }

    const {
      mode,
      url,
      answers,
      model = DEFAULT_MODEL,
      webSearch = false,
    } = body;

    if (!mode || !["audit", "questions"].includes(mode)) {
      console.error(`[${requestId}] Invalid mode:`, mode);
      return NextResponse.json({ error: "Ogiltigt läge" }, { status: 400 });
    }

    // Validate model - Only include models that are actually available
    if (!ALLOWED_MODEL_IDS.includes(model)) {
      console.error(`[${requestId}] Invalid model:`, model);
      return NextResponse.json(
        {
          error: `Ogiltig modell. Tillgängliga modeller: ${ALLOWED_MODEL_IDS.join(
            ", "
          )}`,
        },
        { status: 400 }
      );
    }

    let result: AuditResult;
    let prompt: PromptMessage[];
    let websiteContent: WebsiteContent | null = null;

    if (mode === "audit") {
      // Website audit mode
      if (!url) {
        return NextResponse.json(
          { error: "URL krävs för audit" },
          { status: 400 }
        );
      }

      // Scrape website content
      const scrapeStartTime = Date.now();
      try {
        websiteContent = await scrapeWebsite(url);
        const scrapeDuration = Date.now() - scrapeStartTime;
        console.log(
          `[${requestId}] Scraping completed in ${scrapeDuration}ms:`,
          {
            hasContent: !!websiteContent,
            title: websiteContent?.title?.substring(0, 50),
            wordCount: websiteContent?.wordCount || 0,
          }
        );
      } catch (error) {
        const scrapeDuration = Date.now() - scrapeStartTime;
        console.error(
          `[${requestId}] Scraping error after ${scrapeDuration}ms:`,
          {
            error: error instanceof Error ? error.message : String(error),
            url,
          }
        );
        return NextResponse.json(
          {
            error:
              "Kunde inte hämta hemsidan. Kontrollera URL:en och försök igen.",
          },
          { status: 400 }
        );
      }

      // Build prompt
      prompt = buildAuditPrompt(websiteContent, url);
      const promptTextLength = JSON.stringify(prompt).length;
      const actualContentLength = prompt.reduce((sum, msg) => {
        return (
          sum +
          (Array.isArray(msg.content)
            ? msg.content.reduce((s, c) => s + (c.text?.length || 0), 0)
            : 0)
        );
      }, 0);
      console.log("Built prompt:", {
        messageCount: prompt.length,
        actualContentLength,
        promptTextLength,
        hasSystem: prompt.some((p) => p.role === "system"),
        hasUser: prompt.some((p) => p.role === "user"),
      });
    } else {
      // Questions mode
      if (!answers) {
        return NextResponse.json(
          { error: "Svar krävs för rekommendationer" },
          { status: 400 }
        );
      }

      // Build prompt
      prompt = buildRecommendationPrompt(answers);
      const promptTextLength = JSON.stringify(prompt).length;
      const actualContentLength = prompt.reduce((sum, msg) => {
        return (
          sum +
          (Array.isArray(msg.content)
            ? msg.content.reduce((s, c) => s + (c.text?.length || 0), 0)
            : 0)
        );
      }, 0);
      console.log("Built recommendation prompt:", {
        messageCount: prompt.length,
        actualContentLength,
        promptTextLength,
        hasSystem: prompt.some((p) => p.role === "system"),
        hasUser: prompt.some((p) => p.role === "user"),
      });
    }

    // Call OpenAI Responses API
    type RequestPayload = {
      model: string;
      input: string;
      instructions?: string;
      max_output_tokens: number;
      text?: { format: { type: string } };
      tools?: Array<{ type: "web_search" | string }>;
    };
    let requestPayload: RequestPayload | undefined;
    try {
      // Validate API key before making request
      if (!process.env.OPENAI_API_KEY) {
        console.error("OPENAI_API_KEY is missing");
        return NextResponse.json(
          { error: "API-nyckel saknas. Kontakta administratören." },
          { status: 500 }
        );
      }

      // Format payload for Responses API
      let combinedInput = "";
      let combinedInstructions = "";
      try {
        const promptArray = prompt as PromptMessage[];

        // Validate prompt structure
        if (!Array.isArray(promptArray) || promptArray.length === 0) {
          throw new Error("Prompt must be a non-empty array");
        }

        promptArray.forEach((msg, idx) => {
          if (!msg || typeof msg !== "object") {
            throw new Error(
              `Invalid prompt format at index ${idx}: message is not an object`
            );
          }
          if (!msg.role || !["system", "user"].includes(msg.role)) {
            throw new Error(
              `Invalid prompt format at index ${idx}: invalid role "${msg.role}"`
            );
          }
          if (
            !msg.content ||
            !Array.isArray(msg.content) ||
            msg.content.length === 0
          ) {
            throw new Error(
              `Invalid prompt format at index ${idx}: content must be a non-empty array`
            );
          }

          const combinedContent = msg.content
            .map((c, cIdx) => {
              if (typeof c !== "object" || c === null) {
                throw new Error(
                  `Invalid content item format at message ${idx}, content ${cIdx}`
                );
              }
              if (c.type !== "text") {
                throw new Error(
                  `Unsupported content type "${c.type}" at message ${idx}, content ${cIdx}`
                );
              }
              if (typeof c.text !== "string") {
                throw new Error(
                  `Content text is not a string at message ${idx}, content ${cIdx}`
                );
              }
              return c.text;
            })
            .join("\n");

          if (!combinedContent || combinedContent.trim().length === 0) {
            throw new Error(`Empty content after formatting at message ${idx}`);
          }

          if (msg.role === "system") {
            combinedInstructions += combinedInstructions
              ? `\n\n${combinedContent}`
              : combinedContent;
          } else {
            combinedInput += combinedInput
              ? `\n\n${combinedContent}`
              : combinedContent;
          }
        });

        if (!combinedInput.trim()) {
          throw new Error("Prompt must contain at least one user message");
        }
      } catch (formatError) {
        console.error("Failed to format prompt:", formatError, {
          promptType: typeof prompt,
          promptIsArray: Array.isArray(prompt),
          promptLength: Array.isArray(prompt) ? prompt.length : "N/A",
          prompt: Array.isArray(prompt)
            ? JSON.stringify(prompt, null, 2).substring(0, 500)
            : String(prompt).substring(0, 500),
        });
        return NextResponse.json(
          {
            error: `Fel vid formatering av prompt: ${
              formatError instanceof Error ? formatError.message : "Okänt fel"
            }`,
          },
          { status: 500 }
        );
      }

      requestPayload = {
        model: model,
        input: combinedInput,
        instructions: combinedInstructions || undefined,
        max_output_tokens: 32000, // Increased from 16000 to handle larger responses
        text: webSearch
          ? undefined
          : {
              format: { type: "json_object" },
            },
        tools: webSearch ? [{ type: "web_search" }] : undefined,
      };

      // Calculate actual prompt length for logging
      const actualPromptLength = prompt.reduce((sum, msg) => {
        return (
          sum +
          (Array.isArray(msg.content)
            ? msg.content.reduce((s, c) => s + (c.text?.length || 0), 0)
            : 0)
        );
      }, 0);

      console.log("Calling OpenAI API with payload:", {
        model: requestPayload.model,
        hasPrompt: !!prompt,
        promptLength: actualPromptLength,
        promptLengthJSON: JSON.stringify(prompt).length,
        inputCount: requestPayload.input?.length || 0,
        webSearchEnabled: webSearch,
      });

      let response;
      const startTime = Date.now();
      try {
        // Use responses API
        // @ts-ignore - Responses API typings lack text.format support
        response = await openai.responses.create(requestPayload, {
          timeout: 300000, // 5 minutes explicit timeout
        });
        const elapsedTime = Date.now() - startTime;
        console.log(
          `OpenAI API call completed in ${elapsedTime}ms (${(
            elapsedTime / 1000
          ).toFixed(1)}s)`
        );
      } catch (apiError: unknown) {
        const elapsedTime = Date.now() - startTime;
        const err = apiError as {
          message?: string;
          code?: string;
          status?: number;
          error?: { code?: string; message?: string };
        };

        // Handle model_not_found error with fallback
        const isModelNotFound =
          err.code === "model_not_found" ||
          err.error?.code === "model_not_found" ||
          err.message?.toLowerCase().includes("model_not_found") ||
          (err.message?.toLowerCase().includes("model") &&
            err.message?.toLowerCase().includes("not found"));

        if (isModelNotFound && model !== "gpt-4o" && model !== "gpt-4o-mini") {
          console.warn(
            `[${requestId}] Model ${model} not found, falling back to gpt-4o`,
            {
              originalModel: model,
              fallbackModel: "gpt-4o",
            }
          );

          // Retry with fallback model
          const fallbackPayload = {
            ...requestPayload,
            model: "gpt-4o",
          };

          try {
            response = await openai.responses.create(fallbackPayload, {
              timeout: 300000,
            });
            console.log(
              `[${requestId}] Fallback to gpt-4o succeeded after ${
                Date.now() - startTime
              }ms`
            );
          } catch (fallbackError) {
            console.error(
              `[${requestId}] Fallback also failed:`,
              fallbackError
            );
            throw apiError; // Throw original error
          }
        } else {
          console.error(`OpenAI API call failed after ${elapsedTime}ms:`, {
            message: err.message,
            code: err.code,
            status: err.status,
            errorCode: err.error?.code,
          });
          throw apiError;
        }
      }

      console.log("OpenAI API response received:", {
        hasOutput:
          !!(response as { output_text?: string; output?: unknown })
            ?.output_text || !!(response as { output?: unknown })?.output,
        usage: (response as { usage?: unknown })?.usage,
        status: (response as { status?: unknown })?.status,
        incompleteDetails: (response as { incomplete_details?: unknown })
          ?.incomplete_details,
      });

      // Check for incomplete responses
      const standardResponse = response as {
        status?: string;
        incomplete_details?: { reason?: string };
      };
      if (
        standardResponse?.status === "incomplete" &&
        standardResponse?.incomplete_details?.reason === "max_output_tokens"
      ) {
        console.warn(
          "Response incomplete - ran out of tokens. Consider increasing max_output_tokens."
        );
      }

      // Parse the response
      const outputText = extractOutputText(
        response as unknown as Record<string, unknown>
      );
      console.log("Extracted output from responses API:", {
        hasContent: !!outputText,
        contentLength: outputText.length,
        preview: outputText.substring(0, 200),
      });

      if (!outputText || outputText.trim().length === 0) {
        console.error("AI response empty or unreadable", {
          responseType: typeof response,
          responseKeys:
            typeof response === "object" && response !== null
              ? Object.keys(response)
              : [],
          responsePreview: JSON.stringify(response).substring(0, 500),
        });
        return NextResponse.json(
          { error: "Kunde inte tolka AI-svaret - svaret var tomt" },
          { status: 500 }
        );
      }

      // Try to parse JSON from the response
      let auditResult;
      try {
        // Since we're using JSON format, try direct parsing first
        auditResult = JSON.parse(outputText);
        console.log("Successfully parsed JSON response directly");
      } catch (parseError) {
        console.warn(
          "Direct JSON parse failed, attempting to extract JSON object:",
          {
            parseError:
              parseError instanceof Error
                ? parseError.message
                : String(parseError),
            outputTextLength: outputText.length,
            outputTextPreview: outputText.substring(0, 300),
          }
        );

        // If direct parsing fails, try to extract JSON object
        const jsonString = extractFirstJsonObject(outputText);

        if (!jsonString) {
          console.error("Failed to parse AI response (no JSON found):", {
            parseError:
              parseError instanceof Error
                ? parseError.message
                : String(parseError),
            outputTextLength: outputText.length,
            outputTextPreview: outputText.substring(0, 500),
            outputTextEnd: outputText.substring(
              Math.max(0, outputText.length - 200)
            ),
          });
          return NextResponse.json(
            {
              error:
                "Kunde inte tolka AI-svaret - inget JSON hittades i svaret",
            },
            { status: 500 }
          );
        }

        try {
          auditResult = JSON.parse(jsonString);
          console.log("Successfully parsed JSON after extraction");
        } catch (fallbackError) {
          console.error("Failed to parse AI response (fallback failed):", {
            fallbackError:
              fallbackError instanceof Error
                ? fallbackError.message
                : String(fallbackError),
            jsonStringLength: jsonString.length,
            jsonStringPreview: jsonString.substring(0, 500),
          });
          return NextResponse.json(
            {
              error: "Kunde inte tolka AI-svaret - JSON-parsning misslyckades",
            },
            { status: 500 }
          );
        }
      }

      // Validate parsed result structure
      if (!auditResult || typeof auditResult !== "object") {
        console.error(`[${requestId}] Parsed result is not an object:`, {
          auditResultType: typeof auditResult,
          auditResult: auditResult,
        });
        return NextResponse.json(
          { error: "Kunde inte tolka AI-svaret - ogiltigt resultat" },
          { status: 500 }
        );
      }

      // Calculate costs FIRST (before validation, as validation requires cost object)
      interface Usage {
        input_tokens?: number;
        output_tokens?: number;
        prompt_tokens?: number;
        completion_tokens?: number;
      }
      const usage = (response.usage || {}) as Usage;
      const inputTokens = usage.input_tokens || usage.prompt_tokens || 0;
      const outputTokens = usage.output_tokens || usage.completion_tokens || 0;

      const costUSD =
        (inputTokens * PRICE_IN_PER_MTOK + outputTokens * PRICE_OUT_PER_MTOK) /
        1_000_000;
      const costSEK = costUSD * USD_TO_SEK;

      // Add cost and audit_type to auditResult before validation
      const auditResultWithCost = {
        ...auditResult,
        audit_type: mode === "audit" ? "website_audit" : "recommendation",
        cost: {
          tokens: inputTokens + outputTokens,
          sek: parseFloat(costSEK.toFixed(2)),
          usd: parseFloat(costUSD.toFixed(4)),
        },
      };

      // Deep validation of result structure (now includes cost and audit_type)
      if (!validateAuditResult(auditResultWithCost)) {
        const validationDetails = {
          hasAuditType: !!auditResultWithCost.audit_type,
          hasCost: !!auditResultWithCost.cost,
          hasCompany:
            typeof auditResultWithCost.company === "string" &&
            auditResultWithCost.company.trim().length > 0,
          hasImprovements:
            Array.isArray(auditResultWithCost.improvements) &&
            auditResultWithCost.improvements.length > 0,
          hasAuditScores:
            auditResultWithCost.audit_scores &&
            typeof auditResultWithCost.audit_scores === "object",
          hasStrengths:
            Array.isArray(auditResultWithCost.strengths) &&
            auditResultWithCost.strengths.length > 0,
          hasIssues:
            Array.isArray(auditResultWithCost.issues) &&
            auditResultWithCost.issues.length > 0,
          resultKeys: Object.keys(auditResultWithCost),
        };

        console.error(`[${requestId}] Result failed validation:`, {
          ...validationDetails,
          auditResult: JSON.stringify(auditResultWithCost, null, 2).substring(
            0,
            1000
          ),
        });

        const missingFields = [];
        if (
          !validationDetails.hasCompany &&
          !validationDetails.hasImprovements &&
          !validationDetails.hasAuditScores &&
          !validationDetails.hasStrengths &&
          !validationDetails.hasIssues
        ) {
          missingFields.push(
            "company, improvements, audit_scores, strengths eller issues"
          );
        }

        return NextResponse.json(
          {
            error: `Kunde inte tolka AI-svaret - resultatet saknar nödvändiga fält. ${
              missingFields.length > 0
                ? `Saknar: ${missingFields.join(", ")}`
                : ""
            }`,
          },
          { status: 500 }
        );
      }

      console.log(`[${requestId}] Result validation passed:`, {
        auditType: auditResultWithCost.audit_type,
        hasCompany: !!auditResultWithCost.company,
        improvementsCount: auditResultWithCost.improvements?.length || 0,
        scoresCount: auditResultWithCost.audit_scores
          ? Object.keys(auditResultWithCost.audit_scores).length
          : 0,
      });

      // Add metadata to result
      let domain = null;
      if (mode === "audit" && url) {
        try {
          domain = new URL(url).hostname;
        } catch (urlError) {
          console.error("Failed to parse URL:", urlError);
          // Continue without domain if URL parsing fails
        }
      }

      result = {
        ...auditResultWithCost,
        domain,
        timestamp: new Date().toISOString(),
      };

      // Save the result (non-blocking - don't fail request if this fails)
      const saveStartTime = Date.now();
      try {
        // Create directory if it doesn't exist
        const auditsDir = path.join(process.cwd(), "public", "audits");
        await fs.mkdir(auditsDir, { recursive: true });
        await pruneOldAuditFiles(auditsDir);

        // Generate filename based on date and domain/type
        const dateStr = new Date().toISOString().split("T")[0];
        const filePrefix =
          mode === "audit"
            ? `audit_${
                result.domain?.replace(/\./g, "_") || "unknown"
              }_${dateStr}`
            : `recommendation_${dateStr}_${Date.now()}`;

        // Save JSON file
        const jsonPath = path.join(auditsDir, `${filePrefix}.json`);
        const jsonContent = JSON.stringify(result, null, 2);
        await fs.writeFile(jsonPath, jsonContent, "utf-8");

        // Generate and save Markdown file
        const markdown = generateMarkdown(result);
        const mdPath = path.join(auditsDir, `${filePrefix}.md`);
        await fs.writeFile(mdPath, markdown, "utf-8");

        const saveDuration = Date.now() - saveStartTime;
        console.log(
          `[${requestId}] Saved audit results in ${saveDuration}ms:`,
          {
            filePrefix,
            jsonSize: jsonContent.length,
            markdownSize: markdown.length,
          }
        );
      } catch (saveError) {
        const saveDuration = Date.now() - saveStartTime;
        console.error(
          `[${requestId}] Failed to save audit results after ${saveDuration}ms:`,
          {
            error:
              saveError instanceof Error
                ? saveError.message
                : String(saveError),
            // Don't fail the request if saving fails - result is still returned
          }
        );
      }

      // Ensure result is properly formatted before returning
      if (!result || typeof result !== "object") {
        console.error("Invalid result format before returning:", result);
        return NextResponse.json(
          { error: "Kunde inte generera resultat - ogiltigt format" },
          { status: 500 }
        );
      }

      const totalDuration = Date.now() - requestStartTime;
      console.log(
        `[${requestId}] Returning successful response after ${totalDuration}ms (${(
          totalDuration / 1000
        ).toFixed(1)}s):`,
        {
          auditType: result.audit_type,
          hasCompany: !!result.company,
          hasCost: !!result.cost,
          costTokens: result.cost?.tokens,
          costSEK: result.cost?.sek,
          improvementsCount: result.improvements?.length || 0,
          strengthsCount: result.strengths?.length || 0,
          issuesCount: result.issues?.length || 0,
        }
      );

      return NextResponse.json(
        {
          result,
          success: true,
        },
        {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "X-Request-ID": requestId,
            "X-Response-Time": `${totalDuration}ms`,
          },
        }
      );
    } catch (error: unknown) {
      const totalDuration = Date.now() - requestStartTime;
      // Detailed error logging for debugging
      const err = error as {
        message?: string;
        status?: number;
        code?: string;
        type?: string;
        response?: unknown;
        stack?: string;
      };
      console.error(
        `[${requestId}] OpenAI API error after ${totalDuration}ms:`,
        {
          message: err.message,
          status: err.status,
          code: err.code,
          type: err.type,
          response: err.response,
          stack: err.stack,
          requestPayload: requestPayload
            ? {
                model: requestPayload.model,
                hasPrompt: !!prompt,
                promptLength: JSON.stringify(prompt).length,
              }
            : null,
        }
      );

      // Provide more specific error messages
      let errorMessage = "Fel vid AI-analys. Försök igen senare.";

      if (err.status === 401) {
        errorMessage = "Ogiltig API-nyckel. Kontrollera OPENAI_API_KEY.";
      } else if (err.status === 429) {
        errorMessage = "För många förfrågningar. Försök igen om en stund.";
      } else if (
        err.status === 500 ||
        err.status === 502 ||
        err.status === 503
      ) {
        errorMessage =
          "OpenAI-tjänsten är tillfälligt otillgänglig. Försök igen om en stund.";
      } else if (err.message?.includes("timeout") || err.code === "ETIMEDOUT") {
        errorMessage = "Timeout vid AI-analys. Försök igen.";
      } else if (err.message) {
        errorMessage = `AI-analysfel: ${err.message}`;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details:
            process.env.NODE_ENV === "development"
              ? {
                  status: err.status,
                  code: err.code,
                  type: err.type,
                }
              : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error: unknown) {
    const err = error as { message?: string; name?: string; stack?: string };
    console.error("Audit API error (outer catch):", {
      message: err.message,
      stack: err.stack,
      name: err.name,
      error: error,
    });
    return NextResponse.json(
      {
        error: "Något gick fel. Försök igen senare.",
        details:
          process.env.NODE_ENV === "development" ? err.message : undefined,
      },
      { status: 500 }
    );
  }
}
