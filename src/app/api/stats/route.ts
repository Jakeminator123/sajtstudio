import { NextRequest, NextResponse } from "next/server";
import { recordPageView, getStats } from "@/lib/stats-database";

export const dynamic = "force-dynamic";

// GET - fetch stats for admin
export async function GET() {
  try {
    const stats = getStats();
    return NextResponse.json({ success: true, stats });
  } catch (error) {
    console.error("Failed to get stats:", error);
    return NextResponse.json(
      { success: false, error: "Failed to get stats" },
      { status: 500 }
    );
  }
}

// POST - record a page view
export async function POST(request: NextRequest) {
  try {
    const { visitorId, page } = await request.json();
    
    if (!visitorId) {
      return NextResponse.json(
        { success: false, error: "Missing visitorId" },
        { status: 400 }
      );
    }

    recordPageView(visitorId, page || "/");
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to record page view:", error);
    return NextResponse.json(
      { success: false, error: "Failed to record page view" },
      { status: 500 }
    );
  }
}

