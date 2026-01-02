import { NextRequest, NextResponse } from "next/server";
import { recordPageView } from "@/lib/analytics-database";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "nodejs";

function toTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const v = value.trim();
  return v ? v : null;
}

function isValidPath(path: string): boolean {
  if (!path.startsWith("/")) return false;
  if (path.length > 2048) return false;
  // Basic sanity checks; avoid storing binary/whitespace-heavy strings
  if (/\s/.test(path)) return false;
  return true;
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);

    const path = toTrimmedString(body?.path);
    const visitorId = toTrimmedString(body?.visitorId);
    const referrer = toTrimmedString(body?.referrer);

    if (!path || !visitorId || !isValidPath(path)) {
      return NextResponse.json(
        { success: false, error: "Invalid payload" },
        { status: 400 }
      );
    }

    // Ignore internal/admin paths (defense in depth; client also avoids these)
    if (path.startsWith("/admin") || path.startsWith("/api")) {
      return NextResponse.json({ success: true, ignored: true });
    }

    const userAgentHeader = request.headers.get("user-agent");
    const userAgent =
      typeof userAgentHeader === "string"
        ? userAgentHeader.slice(0, 512)
        : null;

    recordPageView({
      visitorId: visitorId.slice(0, 128),
      path,
      referrer: referrer ? referrer.slice(0, 2048) : null,
      userAgent,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to record page view:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record page view" },
      { status: 500 }
    );
  }
}

