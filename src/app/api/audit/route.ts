import {
  buildAuditPrompt,
  buildRecommendationPrompt,
  type PromptMessage,
} from "@/lib/openai-client";
import { scrapeWebsite } from "@/lib/webscraper";
import { promises as fs } from "fs";
import { NextRequest, NextResponse } from "next/server";
import { OpenAI } from "openai";
import path from "path";

// Initialize OpenAI client
if (!process.env.OPENAI_API_KEY) {
  console.error("OPENAI_API_KEY is not set in environment variables");
}

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
  timeout: 240000, // 4 minute timeout for reasoning models
  maxRetries: 2,
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
function generateMarkdown(result: any): string {
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
    result.improvements.forEach((improvement: any) => {
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
    markdown += `- **Minimum:** ${result.budget_estimate.low.toLocaleString(
      "sv-SE"
    )} ${result.budget_estimate.currency}\n`;
    markdown += `- **Maximum:** ${result.budget_estimate.high.toLocaleString(
      "sv-SE"
    )} ${result.budget_estimate.currency}\n\n`;
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

  return markdown;
}

function extractOutputText(response: any): string {
  if (
    typeof response?.output_text === "string" &&
    response.output_text.trim()
  ) {
    return response.output_text;
  }

  if (Array.isArray(response?.output)) {
    const combined = response.output
      .map((item: any) => {
        if (!item?.content) return "";
        if (!Array.isArray(item.content)) return "";

        return item.content
          .map((contentItem: any) => {
            const textCandidate = contentItem?.text ?? contentItem?.value;

            if (typeof textCandidate === "string") {
              return textCandidate;
            }

            if (Array.isArray(textCandidate)) {
              return textCandidate
                .map((entry: any) => {
                  if (typeof entry === "string") return entry;
                  if (typeof entry?.text === "string") return entry.text;
                  if (typeof entry?.value === "string") return entry.value;
                  return "";
                })
                .join("");
            }

            if (
              typeof textCandidate === "object" &&
              typeof textCandidate?.text === "string"
            ) {
              return textCandidate.text;
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

export async function POST(request: NextRequest) {
  try {
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error("Failed to parse request body:", parseError);
      return NextResponse.json(
        { error: "Ogiltig JSON i förfrågan" },
        { status: 400 }
      );
    }

    const { mode, url, answers } = body;

    if (!mode || !["audit", "questions"].includes(mode)) {
      return NextResponse.json({ error: "Ogiltigt läge" }, { status: 400 });
    }

    let result;
    let prompt: PromptMessage[];
    let websiteContent = null;

    if (mode === "audit") {
      // Website audit mode
      if (!url) {
        return NextResponse.json(
          { error: "URL krävs för audit" },
          { status: 400 }
        );
      }

      // Scrape website content
      try {
        websiteContent = await scrapeWebsite(url);
      } catch (error) {
        return NextResponse.json(
          {
            error:
              "Kunde inte hämta hemsidan. Kontrollera URL:en och försök igen.",
          },
          { status: 400 }
        );
      }

      prompt = buildAuditPrompt(websiteContent, url);
      console.log("Built audit prompt:", {
        promptLength: prompt.length,
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

      prompt = buildRecommendationPrompt(answers);
      console.log("Built recommendation prompt:", {
        promptLength: prompt.length,
        hasSystem: prompt.some((p) => p.role === "system"),
        hasUser: prompt.some((p) => p.role === "user"),
      });
    }

    // Call OpenAI Responses API
    let requestPayload: any;
    try {
      // Validate API key before making request
      if (!process.env.OPENAI_API_KEY) {
        console.error("OPENAI_API_KEY is missing");
        return NextResponse.json(
          { error: "API-nyckel saknas. Kontakta administratören." },
          { status: 500 }
        );
      }

      // Convert prompt to Responses API format
      // Responses API expects input as array of { role, content } where content can be string or array
      let formattedInput;
      try {
        formattedInput = prompt.map((msg) => {
          if (!msg.content || !Array.isArray(msg.content)) {
            throw new Error(`Invalid prompt format: content is not an array`);
          }
          return {
            role: msg.role,
            content: msg.content
              .map((c) => {
                if (typeof c !== "object" || !c.text) {
                  throw new Error(`Invalid content item format`);
                }
                return c.text;
              })
              .join("\n"), // Combine all text content
          };
        });
      } catch (formatError) {
        console.error("Failed to format prompt:", formatError, { prompt });
        return NextResponse.json(
          { error: "Fel vid formatering av prompt" },
          { status: 500 }
        );
      }

      // Use gpt-4o-mini without web_search for now
      // Web search seems to have compatibility issues
      requestPayload = {
        model: "gpt-4o-mini",  // Faster and cheaper model
        input: formattedInput,
        // NO web_search - causes compatibility issues
        max_output_tokens: 16000,  // Increased for better responses
        text: {
          format: { type: "json_object" },  // Re-enable JSON format since no web_search
        },
      };

      console.log("Calling OpenAI API with payload:", {
        model: requestPayload.model,
        hasPrompt: !!prompt,
        promptLength: JSON.stringify(prompt).length,
      });

      // @ts-ignore - Responses API typings lack text.format support
      const response = await openai.responses.create(requestPayload);

      console.log("OpenAI API response received:", {
        hasOutput: !!response?.output_text || !!response?.output,
        usage: response?.usage,
        status: response?.status,
        incompleteDetails: response?.incomplete_details,
      });

      // Check for incomplete responses (ran out of tokens)
      if (
        response?.status === "incomplete" &&
        response?.incomplete_details?.reason === "max_output_tokens"
      ) {
        console.warn(
          "Response incomplete - ran out of tokens. Consider increasing max_output_tokens."
        );
        // Still try to parse what we got
      }

      // Parse the response
      const outputText = extractOutputText(response);

      if (!outputText) {
        console.error("AI response empty or unreadable", response);
        return NextResponse.json(
          { error: "Kunde inte tolka AI-svaret" },
          { status: 500 }
        );
      }

      // Try to parse JSON from the response
      let auditResult;
      try {
        // Since we're using JSON format, try direct parsing first
        auditResult = JSON.parse(outputText);
      } catch (parseError) {
        // If direct parsing fails, try to extract JSON object
        const jsonString = extractFirstJsonObject(outputText);
        
        if (!jsonString) {
          console.error(
            "Failed to parse AI response (no JSON found):",
            parseError,
            outputText
          );
          return NextResponse.json(
            { error: "Kunde inte tolka AI-svaret" },
            { status: 500 }
          );
        }

        try {
          auditResult = JSON.parse(jsonString);
        } catch (fallbackError) {
          console.error(
            "Failed to parse AI response (fallback failed):",
            fallbackError,
            jsonString
          );
          return NextResponse.json(
            { error: "Kunde inte tolka AI-svaret" },
            { status: 500 }
          );
        }
      }

      // Calculate costs
      const usage = response.usage || {};
      const inputTokens = (usage as any).input_tokens || 0;
      const outputTokens = (usage as any).output_tokens || 0;

      const costUSD =
        (inputTokens * PRICE_IN_PER_MTOK + outputTokens * PRICE_OUT_PER_MTOK) /
        1_000_000;
      const costSEK = costUSD * USD_TO_SEK;

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
        ...auditResult,
        audit_type: mode === "audit" ? "website_audit" : "recommendation",
        domain,
        cost: {
          tokens: inputTokens + outputTokens,
          sek: parseFloat(costSEK.toFixed(2)),
          usd: parseFloat(costUSD.toFixed(4)),
        },
        timestamp: new Date().toISOString(),
      };

      // Save the result
      try {
        // Create directory if it doesn't exist
        const auditsDir = path.join(process.cwd(), "public", "audits");
        await fs.mkdir(auditsDir, { recursive: true });

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
        await fs.writeFile(jsonPath, JSON.stringify(result, null, 2), "utf-8");

        // Generate and save Markdown file
        const markdown = generateMarkdown(result);
        const mdPath = path.join(auditsDir, `${filePrefix}.md`);
        await fs.writeFile(mdPath, markdown, "utf-8");

        console.log(`Saved audit results to: ${filePrefix}`);
      } catch (saveError) {
        console.error("Failed to save audit results:", saveError);
        // Don't fail the request if saving fails
      }

      return NextResponse.json({
        result,
        success: true,
      });
    } catch (error: any) {
      // Detailed error logging for debugging
      console.error("OpenAI API error:", {
        message: error?.message,
        status: error?.status,
        code: error?.code,
        type: error?.type,
        response: error?.response,
        stack: error?.stack,
        requestPayload: requestPayload
          ? {
              model: requestPayload.model,
              hasPrompt: !!prompt,
              promptLength: JSON.stringify(prompt).length,
            }
          : null,
      });

      // Provide more specific error messages
      let errorMessage = "Fel vid AI-analys. Försök igen senare.";

      if (error?.status === 401) {
        errorMessage = "Ogiltig API-nyckel. Kontrollera OPENAI_API_KEY.";
      } else if (error?.status === 429) {
        errorMessage = "För många förfrågningar. Försök igen om en stund.";
      } else if (
        error?.status === 500 ||
        error?.status === 502 ||
        error?.status === 503
      ) {
        errorMessage =
          "OpenAI-tjänsten är tillfälligt otillgänglig. Försök igen om en stund.";
      } else if (
        error?.message?.includes("timeout") ||
        error?.code === "ETIMEDOUT"
      ) {
        errorMessage = "Timeout vid AI-analys. Försök igen.";
      } else if (error?.message) {
        errorMessage = `AI-analysfel: ${error.message}`;
      }

      return NextResponse.json(
        {
          error: errorMessage,
          details:
            process.env.NODE_ENV === "development"
              ? {
                  status: error?.status,
                  code: error?.code,
                  type: error?.type,
                }
              : undefined,
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error("Audit API error (outer catch):", {
      message: error?.message,
      stack: error?.stack,
      name: error?.name,
      error: error,
    });
    return NextResponse.json(
      {
        error: "Något gick fel. Försök igen senare.",
        details:
          process.env.NODE_ENV === "development" ? error?.message : undefined,
      },
      { status: 500 }
    );
  }
}
