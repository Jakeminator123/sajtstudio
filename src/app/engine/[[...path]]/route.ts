import { NextRequest, NextResponse } from "next/server";

const SAJTMASKIN_URL = "https://sajtmaskin-1.onrender.com";

export async function GET(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    // Build the path to proxy
    const path = params?.path ? `/${params.path.join("/")}` : "/";
    const searchParams = request.nextUrl.searchParams.toString();
    const targetUrl = `${SAJTMASKIN_URL}${path}${searchParams ? `?${searchParams}` : ""}`;

    // Fetch the content from sajtmaskin
    const response = await fetch(targetUrl, {
      headers: {
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
        Accept: request.headers.get("accept") || "*/*",
        "Accept-Language": request.headers.get("accept-language") || "sv-SE,sv;q=0.9",
      },
    });

    if (!response.ok) {
      return new NextResponse("Not Found", { status: 404 });
    }

    // Get the content
    let content = await response.text();
    const contentType = response.headers.get("content-type") || "";

    // If it's HTML, rewrite URLs to point to our proxy
    if (contentType.includes("text/html")) {
      // Replace all absolute URLs pointing to sajtmaskin
      content = content.replace(
        new RegExp(SAJTMASKIN_URL.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), "g"),
        `${request.nextUrl.origin}/engine`
      );

      // Replace relative URLs that might point to external resources
      content = content.replace(
        /href="(https?:\/\/[^"]+)"/g,
        (match, url) => {
          if (url.startsWith(SAJTMASKIN_URL)) {
            return `href="${url.replace(SAJTMASKIN_URL, `${request.nextUrl.origin}/engine`)}"`;
          }
          return match;
        }
      );

      content = content.replace(
        /src="(https?:\/\/[^"]+)"/g,
        (match, url) => {
          if (url.startsWith(SAJTMASKIN_URL)) {
            return `src="${url.replace(SAJTMASKIN_URL, `${request.nextUrl.origin}/engine`)}"`;
          }
          return match;
        }
      );
    }

    // Return the proxied content
    return new NextResponse(content, {
      status: response.status,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=60, s-maxage=300",
      },
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}

// Handle POST requests (for forms, etc.)
export async function POST(
  request: NextRequest,
  { params }: { params: { path?: string[] } }
) {
  try {
    const path = params?.path ? `/${params.path.join("/")}` : "/";
    const searchParams = request.nextUrl.searchParams.toString();
    const targetUrl = `${SAJTMASKIN_URL}${path}${searchParams ? `?${searchParams}` : ""}`;

    const body = await request.text();
    const response = await fetch(targetUrl, {
      method: "POST",
      headers: {
        "Content-Type": request.headers.get("content-type") || "application/json",
        "User-Agent": request.headers.get("user-agent") || "Mozilla/5.0",
      },
      body,
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
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
