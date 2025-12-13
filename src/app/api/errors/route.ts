import { NextRequest, NextResponse } from "next/server";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

interface ErrorLog {
  timestamp: string;
  type: "error" | "warning" | "unhandled" | "boundary";
  message: string;
  stack?: string;
  source?: string;
  url?: string;
  userAgent?: string;
  componentStack?: string;
}

const LOG_DIR = join(process.cwd(), "logs");
const ERROR_LOG_FILE = join(LOG_DIR, "browser-errors.json");

function shouldIgnoreError(error: Partial<ErrorLog>): boolean {
  const message = (error.message || "").toLowerCase();
  const stack = (error.stack || "").toLowerCase();
  const source = (error.source || "").toLowerCase();
  const all = `${message} ${stack} ${source}`;

  // React DevTools / browser extensions noise
  if (all.includes("chrome-extension://")) return true;
  if (all.includes("not valid semver")) return true;

  // Turbopack + worker module registration issues (troika / drei Text)
  if (all.includes("__turbopack__imported__module__")) return true;
  if (all.includes("turbopack")) return true;
  if (all.includes("troika-worker-utils")) return true;
  if (all.includes("worker registermodule call")) return true;

  // Framer Motion scroll container warning (dev-only noise)
  if (all.includes("container has a non-static position")) return true;
  if (all.includes("scroll offset is calculated correctly")) return true;

  return false;
}

async function ensureLogDir() {
  try {
    await mkdir(LOG_DIR, { recursive: true });
  } catch {
    // Directory might already exist, ignore
  }
}

async function appendError(error: ErrorLog) {
  await ensureLogDir();

  try {
    // Read existing errors
    const fs = await import("fs/promises");
    let existingErrors: ErrorLog[] = [];

    try {
      const content = await fs.readFile(ERROR_LOG_FILE, "utf-8");
      existingErrors = JSON.parse(content);
    } catch {
      // File doesn't exist yet, start fresh
      existingErrors = [];
    }

    // Add new error
    existingErrors.push(error);

    // Keep only last 100 errors to prevent file from growing too large
    const recentErrors = existingErrors.slice(-100);

    // Write back
    await writeFile(
      ERROR_LOG_FILE,
      JSON.stringify(recentErrors, null, 2),
      "utf-8"
    );
  } catch (error) {
    console.error("Failed to write error log:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text();
    let errorData: Partial<ErrorLog> = {};

    if (rawBody?.trim()) {
      try {
        errorData = JSON.parse(rawBody);
      } catch (parseError) {
        console.error("Failed to parse error payload:", parseError);
        errorData.message = rawBody.slice(0, 500);
      }
    } else {
      errorData.message = "Unknown client error (no payload)";
    }

    // Ensure required fields
    if (!errorData.type) {
      errorData.type = "error";
    }

    if (!errorData.message) {
      errorData.message = "Okänd klientfel rapporterad utan detaljer";
    }

    errorData.timestamp = errorData.timestamp || new Date().toISOString();
    errorData.url = request.headers.get("referer") || errorData.url;
    errorData.userAgent =
      request.headers.get("user-agent") || errorData.userAgent;

    // Drop known dev/extension noise so logs stay useful
    if (shouldIgnoreError(errorData)) {
      return NextResponse.json(
        { success: true, ignored: true },
        { status: 200 }
      );
    }

    await appendError(errorData as ErrorLog);

    if (process.env.NODE_ENV === "development") {
      console.error("Browser error logged:", errorData);
    }

    return NextResponse.json({ success: true }, { status: 200 });
  } catch (error) {
    console.error("Error logging endpoint failed:", error);
    return NextResponse.json(
      { success: false, error: "Failed to log error" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const fs = await import("fs/promises");
    const content = await fs.readFile(ERROR_LOG_FILE, "utf-8");
    const errors = JSON.parse(content);
    return NextResponse.json({ errors }, { status: 200 });
  } catch {
    // File doesn't exist or is empty
    return NextResponse.json({ errors: [] }, { status: 200 });
  }
}
