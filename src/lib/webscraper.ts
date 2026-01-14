import * as cheerio from "cheerio";

interface WebsiteContent {
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

export async function scrapeWebsite(url: string): Promise<WebsiteContent> {
  // Normalize URL
  let normalizedUrl = url.trim();
  if (
    !normalizedUrl.startsWith("http://") &&
    !normalizedUrl.startsWith("https://")
  ) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  const startTime = Date.now();

  try {
    // Fetch the website with a timeout
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000); // 10 second timeout

    let response: Response;
    try {
      response = await fetch(normalizedUrl, {
        signal: controller.signal,
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "sv-SE,sv;q=0.9,en;q=0.8",
        },
      });
    } catch (fetchError) {
      clearTimeout(timeout);
      if (fetchError instanceof Error && fetchError.name === "AbortError") {
        throw new Error("Timeout: Hemsidan svarade inte inom 10 sekunder");
      }
      throw fetchError;
    }

    clearTimeout(timeout);

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const html = await response.text();
    const responseTime = Date.now() - startTime;

    // Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Remove script and style tags to get clean text
    $("script, style").remove();

    // Extract title
    const title = $("title").text().trim() || "Ingen titel";

    // Extract meta description
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    // Extract headings (limit to first 10 for first page analysis)
    const headings: string[] = [];
    $("h1, h2, h3").each((_, el) => {
      const text = $(el).text().trim();
      if (text && headings.length < 10) headings.push(text);
    });

    // Extract body text
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    // Limit text to ~1000 words (first page only) to save tokens
    const words = bodyText.split(" ");
    const wordCount = words.length;
    const limitedText = words.slice(0, 1000).join(" ");

    // Count images
    const images = $("img").length;

    // Count links
    const internalLinks = $(`a[href^="/"], a[href^="${normalizedUrl}"]`).length;
    const externalLinks = $('a[href^="http"], a[href^="https"]').not(
      `a[href^="${normalizedUrl}"]`
    ).length;

    // Extract meta tags
    const meta = {
      keywords: $('meta[name="keywords"]').attr("content"),
      author: $('meta[name="author"]').attr("content"),
      viewport: $('meta[name="viewport"]').attr("content"),
      robots: $('meta[name="robots"]').attr("content"),
    };

    // Check if SSL
    const hasSSL = normalizedUrl.startsWith("https://");

    // Create text preview
    const textPreview =
      limitedText.substring(0, 500) + (limitedText.length > 500 ? "..." : "");

    return {
      url: normalizedUrl,
      title,
      description,
      headings: headings.slice(0, 20), // Limit to first 20 headings
      text: limitedText,
      images,
      links: {
        internal: internalLinks,
        external: externalLinks,
      },
      meta,
      hasSSL,
      responseTime,
      wordCount,
      textPreview,
    };
  } catch (error) {
    if (error instanceof Error) {
      if (error.name === "AbortError") {
        throw new Error("Timeout: Hemsidan svarade inte inom 10 sekunder");
      }
      throw new Error(`Kunde inte hämta hemsidan: ${error.message}`);
    }
    throw new Error("Ett okänt fel uppstod vid hämtning av hemsidan");
  }
}
