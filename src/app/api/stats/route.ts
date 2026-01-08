import { NextRequest, NextResponse } from "next/server"
import { recordPageView, getStats } from "@/lib/stats-database"
import crypto from "crypto"

export const dynamic = "force-dynamic"

function hashIp(ip: string | null): string | null {
  if (!ip) return null
  const salt = process.env.STATS_IP_SALT || "sajtstudio_default_salt"
  return crypto.createHash("sha256").update(`${ip}|${salt}`).digest("hex")
}

// GET - fetch stats for admin
export async function GET() {
  try {
    const stats = getStats()
    return NextResponse.json({ success: true, stats })
  } catch (error) {
    console.error("Failed to get stats:", error)
    return NextResponse.json({ success: false, error: "Failed to get stats" }, { status: 500 })
  }
}

// POST - record a page view
export async function POST(request: NextRequest) {
  try {
    const { visitorId, page } = await request.json()

    if (!visitorId) {
      return NextResponse.json({ success: false, error: "Missing visitorId" }, { status: 400 })
    }

    const forwardedFor = request.headers.get("x-forwarded-for")
    const realIp = request.headers.get("x-real-ip")
    const ip = forwardedFor?.split(",")[0]?.trim() || realIp?.trim() || null
    const ipHash = hashIp(ip)

    recordPageView(visitorId, page || "/", ipHash)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Failed to record page view:", error)
    return NextResponse.json(
      { success: false, error: "Failed to record page view" },
      { status: 500 }
    )
  }
}
