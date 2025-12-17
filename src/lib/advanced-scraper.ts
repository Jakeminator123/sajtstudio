import * as cheerio from "cheerio";
import type { CheerioAPI } from "cheerio";
import type { AnyNode } from "domhandler";

export interface PageContent {
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

export interface MultiPageScrapeResult {
  mainPage: PageContent;
  additionalPages: PageContent[];
  siteStructure: {
    totalPagesAnalyzed: number;
    importantPages: string[];
    navigationStructure: string[];
  };
}

interface CrawlOptions {
  maxPages?: number;
  includeSubdomains?: boolean;
  priorityPatterns?: string[];
  timeout?: number;
}

const DEFAULT_OPTIONS: CrawlOptions = {
  maxPages: 4,
  includeSubdomains: false,
  priorityPatterns: [
    "/om",
    "/om-oss",
    "/about",
    "/tjanster",
    "/services",
    "/produkter",
    "/products",
    "/kontakt",
    // NOTE: keep "/contact" out to avoid encouraging legacy paths in audits/scrapes.
    // The public contact page is "/kontakt".
    "/priser",
    "/pricing",
    "/portfolio",
    "/case",
    "/referenser",
  ],
  timeout: 10000,
};

// Helper to extract clean text from HTML
function extractCleanText($: CheerioAPI, selector: string = "body"): string {
  // Clone to avoid modifying original
  const clone = $.html();
  const $clone = cheerio.load(clone);

  // Remove unwanted elements
  $clone("script, style, noscript, iframe").remove();

  return $clone(selector).text().replace(/\s+/g, " ").trim();
}

// Extract all links from a page
function extractLinks(
  $: CheerioAPI,
  baseUrl: string
): { internal: string[]; external: string[] } {
  const internal = new Set<string>();
  const external = new Set<string>();
  const baseDomain = new URL(baseUrl).hostname;

  $("a[href]").each((_: number, el: AnyNode) => {
    const href = $(el).attr("href");
    if (!href) return;

    try {
      if (href.startsWith("http://") || href.startsWith("https://")) {
        const url = new URL(href);
        if (url.hostname === baseDomain) {
          internal.add(url.href);
        } else {
          external.add(url.href);
        }
      } else if (href.startsWith("/")) {
        // Relative URL
        const url = new URL(href, baseUrl);
        internal.add(url.href);
      }
    } catch {
      // Invalid URL, skip
    }
  });

  return {
    internal: Array.from(internal),
    external: Array.from(external),
  };
}

// Score a URL based on priority patterns
function scoreUrl(url: string, priorityPatterns: string[]): number {
  const urlPath = new URL(url).pathname.toLowerCase();

  // Exact matches get highest score
  for (let i = 0; i < priorityPatterns.length; i++) {
    if (
      urlPath === priorityPatterns[i] ||
      urlPath === priorityPatterns[i] + "/"
    ) {
      return 100 - i; // Earlier in list = higher priority
    }
  }

  // Partial matches get medium score
  for (let i = 0; i < priorityPatterns.length; i++) {
    if (urlPath.includes(priorityPatterns[i])) {
      return 50 - i;
    }
  }

  // Penalize deep URLs
  const depth = urlPath.split("/").filter((p) => p.length > 0).length;
  return Math.max(0, 20 - depth * 5);
}

// Scrape a single page
async function scrapePage(
  url: string,
  timeout: number = 10000
): Promise<PageContent | null> {
  const normalizedUrl = url.trim();
  const startTime = Date.now();

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    const response = await fetch(normalizedUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        Accept: "text/html,application/xhtml+xml",
        "Accept-Language": "sv-SE,sv;q=0.9,en;q=0.8",
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      console.error(`Failed to fetch ${url}: ${response.status}`);
      return null;
    }

    const html = await response.text();
    const responseTime = Date.now() - startTime;

    const $ = cheerio.load(html);

    // Extract title
    const title = $("title").text().trim() || "Ingen titel";

    // Extract meta description
    const description =
      $('meta[name="description"]').attr("content") ||
      $('meta[property="og:description"]').attr("content") ||
      "";

    // Extract headings
    const headings: string[] = [];
    $("h1, h2, h3").each((_, el) => {
      const text = $(el).text().trim();
      if (text && headings.length < 15) headings.push(text);
    });

    // Extract body text
    const bodyText = extractCleanText($, "body");
    const words = bodyText.split(" ").filter((w) => w.length > 0);
    const wordCount = words.length;
    const limitedText = words.slice(0, 500).join(" ");

    // Count images
    const images = $("img").length;

    // Count links
    const { internal: internalLinks, external: externalLinks } = extractLinks(
      $,
      normalizedUrl
    );

    // Extract meta tags
    const meta = {
      keywords: $('meta[name="keywords"]').attr("content"),
      author: $('meta[name="author"]').attr("content"),
      viewport: $('meta[name="viewport"]').attr("content"),
      robots: $('meta[name="robots"]').attr("content"),
    };

    // Check SSL
    const hasSSL = normalizedUrl.startsWith("https://");

    // Create text preview
    const textPreview =
      limitedText.substring(0, 300) + (limitedText.length > 300 ? "..." : "");

    return {
      url: normalizedUrl,
      title,
      description,
      headings,
      text: limitedText,
      images,
      links: {
        internal: internalLinks.length,
        external: externalLinks.length,
      },
      meta,
      hasSSL,
      responseTime,
      wordCount,
      textPreview,
    };
  } catch (error) {
    console.error(`Error scraping ${url}:`, error);
    return null;
  }
}

// Main function to scrape multiple pages
export async function scrapeMultiplePages(
  startUrl: string,
  options: CrawlOptions = {}
): Promise<MultiPageScrapeResult> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  // Normalize start URL
  let normalizedUrl = startUrl.trim();
  if (
    !normalizedUrl.startsWith("http://") &&
    !normalizedUrl.startsWith("https://")
  ) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  console.log(`Starting multi-page scrape from: ${normalizedUrl}`);

  // Scrape main page first
  const mainPage = await scrapePage(normalizedUrl, opts.timeout);
  if (!mainPage) {
    throw new Error("Kunde inte hämta huvudsidan");
  }

  // Extract links from main page for crawling
  const $ = cheerio.load(await (await fetch(normalizedUrl)).text());
  const { internal: internalUrls } = extractLinks($, normalizedUrl);

  // Score and sort URLs by priority
  const scoredUrls = internalUrls
    .filter((url) => url !== normalizedUrl) // Exclude the main page
    .map((url) => ({
      url,
      score: scoreUrl(url, opts.priorityPatterns || []),
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, (opts.maxPages || 4) - 1); // -1 because main page is already scraped

  console.log(
    `Found ${internalUrls.length} internal links, selected top ${scoredUrls.length} for analysis`
  );

  // Scrape additional pages in parallel
  const additionalPagePromises = scoredUrls.map(({ url }) =>
    scrapePage(url, opts.timeout)
  );

  const additionalPageResults = await Promise.all(additionalPagePromises);
  const additionalPages = additionalPageResults.filter(
    (page) => page !== null
  ) as PageContent[];

  console.log(`Successfully scraped ${additionalPages.length + 1} pages total`);

  // Extract navigation structure
  const navigationLinks = new Set<string>();
  $("nav a, header a, .navigation a, .menu a, #menu a").each((_, el) => {
    const text = $(el).text().trim();
    if (text && text.length < 30) {
      navigationLinks.add(text);
    }
  });

  return {
    mainPage,
    additionalPages,
    siteStructure: {
      totalPagesAnalyzed: 1 + additionalPages.length,
      importantPages: additionalPages.map((p) => p.url),
      navigationStructure: Array.from(navigationLinks),
    },
  };
}

// Export for backwards compatibility
export { scrapePage as scrapeWebsite };
