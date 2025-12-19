import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

// D-ID "post call webhook" receiver.
// This is NOT a replacement for your internal APIs; it's an inbound endpoint
// that external services (like StudioDID) can POST to.

function getBearerToken(request: NextRequest): string | null {
  const auth = request.headers.get("authorization") || "";
  const m = auth.match(/^Bearer\s+(.+)$/i);
  return m?.[1]?.trim() || null;
}

function pickFirstString(obj: any, keys: string[]): string | null {
  for (const k of keys) {
    const v = obj?.[k];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  return null;
}

export async function POST(request: NextRequest) {
  try {
    const expected = process.env.DID_WEBHOOK_SECRET;
    if (expected) {
      const token = getBearerToken(request) || request.headers.get("x-webhook-secret");
      if (!token || token !== expected) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
    }

    const payload = await request.json().catch(() => null);
    if (!payload || typeof payload !== "object") {
      return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
    }

    // D-ID payload shape can vary. We store a compact lead message so you can review it later.
    const name =
      pickFirstString(payload, ["name", "visitorName", "user_name"]) ||
      "D-ID agent";
    const email =
      pickFirstString(payload, ["email", "user_email", "visitorEmail"]) ||
      "did-agent@sajtstudio.se";
    const message =
      pickFirstString(payload, ["message", "text", "transcript", "summary"]) ||
      JSON.stringify(payload);

    // Reuse your existing /api/contact endpoint by writing directly to the same storage file format
    // (but without sending email). This keeps all inbound leads in one place.
    const fs = await import("fs/promises");
    const path = await import("path");

    const CONTACTS_FILE = path.join(process.cwd(), "data", "contacts.json");
    const dataDir = path.dirname(CONTACTS_FILE);
    await fs.mkdir(dataDir, { recursive: true });

    let contacts: any[] = [];
    try {
      const data = await fs.readFile(CONTACTS_FILE, "utf-8");
      contacts = JSON.parse(data);
    } catch {
      contacts = [];
    }

    const id = `contact_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    contacts.push({
      id,
      name,
      email,
      message,
      timestamp: new Date().toISOString(),
      source: "did-webhook",
    });

    await fs.writeFile(CONTACTS_FILE, JSON.stringify(contacts, null, 2), "utf-8");

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("D-ID webhook error:", error);
    return NextResponse.json({ error: "Webhook failed" }, { status: 500 });
  }
}


