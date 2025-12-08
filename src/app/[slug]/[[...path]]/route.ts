import { NextRequest, NextResponse } from "next/server";

// Base URL pattern for external sites
const EXTERNAL_BASE_URL = "https://";
const EXTERNAL_DOMAIN_SUFFIX = ".vusercontent.net";

// List of reserved routes that should not be proxied
const RESERVED_ROUTES = [
  "api",
  "contact",
  "portfolio",
  "generated",
  "sajtgranskning",
  "utvardera",
  "sajtmaskin",
  "engine",
  "_next",
  "favicon.ico",
];

/**
 * Optional catch-all route handler for generated sites
 * Handles routes like:
 * - /demo-kzmoqvc0t8a7dxke3a6j (path is undefined)
 * - /demo-kzmoqvc0t8a7dxke3a6j/some/path (path is ['some', 'path'])
 * Proxies to https://demo-kzmoqvc0t8a7dxke3a6j.vusercontent.net[/some/path]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string; path?: string[] } }
) {
  try {
    const { slug, path } = params;

    // Validate slug format
    if (!slug || typeof slug !== "string") {
      return new NextResponse("Invalid slug", { status: 400 });
    }

    // Check if slug is a reserved route
    if (RESERVED_ROUTES.includes(slug.toLowerCase())) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Validate slug format (alphanumeric, dashes, underscores allowed)
    const slugRegex = /^[a-zA-Z0-9_-]+$/;
    if (!slugRegex.test(slug)) {
      return new NextResponse("Invalid slug format", { status: 400 });
    }

    // Build the path to proxy (path is optional with [[...path]])
    const pathString = path && path.length > 0 ? `/${path.join("/")}` : "";

    // Build the external URL
    const externalUrl = `${EXTERNAL_BASE_URL}${slug}${EXTERNAL_DOMAIN_SUFFIX}${pathString}`;

    // Get query parameters from the request
    const searchParams = request.nextUrl.searchParams.toString();
    const targetUrl = searchParams
      ? `${externalUrl}?${searchParams}`
      : externalUrl;

    // Fetch content from external site
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
        Accept: request.headers.get("accept") || "*/*",
        "Accept-Language": request.headers.get("accept-language") || "sv-SE,sv;q=0.9",
        Referer: `${EXTERNAL_BASE_URL}${slug}${EXTERNAL_DOMAIN_SUFFIX}`,
      },
      signal: AbortSignal.timeout(30000),
    });

    if (!response.ok) {
      if (response.status === 404) {
        return new NextResponse("Site not found", { status: 404 });
      }
      return new NextResponse(
        `External site error: ${response.status}`,
        { status: response.status }
      );
    }

    // Get the content
    let content = await response.text();
    const contentType = response.headers.get("content-type") || "";

    // If it's HTML, rewrite URLs to point to our domain
    if (contentType.includes("text/html")) {
      const origin = request.nextUrl.origin;
      const escapedSlug = slug.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
      const escapedSuffix = EXTERNAL_DOMAIN_SUFFIX.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

      // Replace absolute URLs pointing to the external domain
      const externalUrlPattern = new RegExp(
        `https?://${escapedSlug}${escapedSuffix}(/[^"'>\\s]*)?`,
        "gi"
      );

      content = content.replace(externalUrlPattern, (match, urlPath) => {
        return `${origin}/${slug}${urlPath || ""}`;
      });

      // Also handle protocol-relative URLs
      const protocolRelativePattern = new RegExp(
        `//${escapedSlug}${escapedSuffix}(/[^"'>\\s]*)?`,
        "gi"
      );

      content = content.replace(protocolRelativePattern, (match, urlPath) => {
        return `${origin}/${slug}${urlPath || ""}`;
      });
    }

    // Return the proxied content
    return new NextResponse(content, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=60, s-maxage=300",
        "X-Frame-Options": "SAMEORIGIN",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return new NextResponse("Request timeout", { status: 504 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Handle POST requests
export async function POST(
  request: NextRequest,
  { params }: { params: { slug: string; path?: string[] } }
) {
  try {
    const { slug, path } = params;

    if (!slug || typeof slug !== "string") {
      return new NextResponse("Invalid slug", { status: 400 });
    }

    if (RESERVED_ROUTES.includes(slug.toLowerCase())) {
      return new NextResponse("Not Found", { status: 404 });
    }

    const slugRegex = /^[a-zA-Z0-9_-]+$/;
    if (!slugRegex.test(slug)) {
      return new NextResponse("Invalid slug format", { status: 400 });
    }

    const pathString = path && path.length > 0 ? `/${path.join("/")}` : "";
    const externalUrl = `${EXTERNAL_BASE_URL}${slug}${EXTERNAL_DOMAIN_SUFFIX}${pathString}`;
    const searchParams = request.nextUrl.searchParams.toString();
    const targetUrl = searchParams
      ? `${externalUrl}?${searchParams}`
      : externalUrl;

    const body = await request.text();

    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") || "application/json",
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
        Referer: `${EXTERNAL_BASE_URL}${slug}${EXTERNAL_DOMAIN_SUFFIX}`,
      },
      body,
      signal: AbortSignal.timeout(30000),
    });

    const content = await response.text();
    const contentType = response.headers.get("content-type") || "";

    return new NextResponse(content, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
      },
    });
  } catch (error) {
    console.error("Proxy POST error:", error);

    if (error instanceof Error && error.name === "AbortError") {
      return new NextResponse("Request timeout", { status: 504 });
    }

    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
