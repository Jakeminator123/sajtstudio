import { NextRequest, NextResponse } from "next/server";
import { getVisitorStats } from "@/lib/analytics-database";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function isAuthorized(request: NextRequest): boolean {
  // Reuse existing admin/content key patterns to avoid adding new env requirements.
  const apiKey =
    process.env.ANALYTICS_API_KEY ||
    process.env.CONTENT_API_KEY ||
    process.env.NEXT_PUBLIC_CONTENT_API_KEY;

  // If no key is set, allow in development.
  if (!apiKey) {
    return process.env.NODE_ENV === "development";
  }

  const authHeader = request.headers.get("Authorization");
  return authHeader === `Bearer ${apiKey}`;
}

export async function GET(request: NextRequest) {
  try {
    if (!isAuthorized(request)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const stats = getVisitorStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Failed to fetch visitor stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch visitor stats" },
      { status: 500 }
    );
  }
}

