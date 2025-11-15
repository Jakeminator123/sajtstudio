import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

// Rate limiting: 3 sökningar per dag per användare
const MAX_SEARCHES_PER_DAY = 3;
const COOKIE_NAME = "website_search_session";
const COOKIE_MAX_AGE = 24 * 60 * 60; // 24 timmar i sekunder

interface SearchSession {
  searches: number;
  resetAt: number; // Timestamp när räknaren återställs
}

// Validera URL
function isValidUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    // Tillåt endast http och https
    return urlObj.protocol === "http:" || urlObj.protocol === "https:";
  } catch {
    return false;
  }
}

// Normalisera URL (lägg till https:// om saknas)
function normalizeUrl(url: string): string {
  let normalized = url.trim().toLowerCase();

  // Ta bort whitespace
  normalized = normalized.replace(/\s+/g, "");

  // Lägg till protokoll om saknas
  if (!normalized.startsWith("http://") && !normalized.startsWith("https://")) {
    normalized = "https://" + normalized;
  }

  return normalized;
}

// Hämta eller skapa session
async function getSession(): Promise<SearchSession> {
  const cookieStore = await cookies();
  const sessionCookie = cookieStore.get(COOKIE_NAME);

  if (!sessionCookie) {
    return {
      searches: 0,
      resetAt: Date.now() + COOKIE_MAX_AGE * 1000,
    };
  }

  try {
    const session = JSON.parse(sessionCookie.value) as SearchSession;

    // Återställ om dagen har gått
    if (Date.now() > session.resetAt) {
      return {
        searches: 0,
        resetAt: Date.now() + COOKIE_MAX_AGE * 1000,
      };
    }

    return session;
  } catch {
    // Om cookie är korrupt, skapa ny session
    return {
      searches: 0,
      resetAt: Date.now() + COOKIE_MAX_AGE * 1000,
    };
  }
}

export async function POST(request: NextRequest) {
  try {
    // Hämta och validera input
    let body;
    try {
      body = await request.json();
    } catch (error) {
      return NextResponse.json(
        { error: "Ogiltig JSON i request body" },
        { status: 400 }
      );
    }

    const { url } = body;

    if (!url || typeof url !== "string") {
      return NextResponse.json({ error: "URL krävs" }, { status: 400 });
    }

    // Validera URL-längd (säkerhet)
    if (url.length > 2048) {
      return NextResponse.json({ error: "URL är för lång" }, { status: 400 });
    }

    // Normalisera och validera URL
    const normalizedUrl = normalizeUrl(url);

    if (!isValidUrl(normalizedUrl)) {
      return NextResponse.json(
        { error: "Ogiltig URL. Använd http:// eller https://" },
        { status: 400 }
      );
    }

    // Hämta session och kontrollera rate limit
    let session: SearchSession;
    try {
      session = await getSession();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error getting session:", error);
      }
      session = {
        searches: 0,
        resetAt: Date.now() + COOKIE_MAX_AGE * 1000,
      };
    }

    if (session.searches >= MAX_SEARCHES_PER_DAY) {
      const resetTime = new Date(session.resetAt);
      const hoursUntilReset = Math.ceil(
        (session.resetAt - Date.now()) / (1000 * 60 * 60)
      );

      const errorResponse = NextResponse.json(
        {
          error: "Du har nått din dagliga gräns på 3 sökningar",
          resetAt: resetTime.toISOString(),
          hoursUntilReset,
        },
        { status: 429 }
      );

      // Spara session även vid error
      errorResponse.cookies.set(COOKIE_NAME, JSON.stringify(session), {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: COOKIE_MAX_AGE,
        path: "/",
      });

      return errorResponse;
    }

    // Öka räknaren
    session.searches += 1;

    // Skapa response och spara session
    const response = NextResponse.json({
      success: true,
      url: normalizedUrl,
      searchesRemaining: MAX_SEARCHES_PER_DAY - session.searches,
      searchesUsed: session.searches,
      resetAt: new Date(session.resetAt).toISOString(),
      // Placeholder för analysresultat
      analysis: {
        message: "Analys kommer snart att implementeras",
      },
    });

    // Spara session i cookie
    response.cookies.set(COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error analyzing website:", error);
    }
    return NextResponse.json(
      { error: "Ett fel uppstod vid analysen" },
      { status: 500 }
    );
  }
}

// GET för att hämta nuvarande status
export async function GET() {
  try {
    let session: SearchSession;
    try {
      session = await getSession();
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error("Error getting session:", error);
      }
      session = {
        searches: 0,
        resetAt: Date.now() + COOKIE_MAX_AGE * 1000,
      };
    }

    const response = NextResponse.json({
      searchesUsed: session.searches,
      searchesRemaining: Math.max(0, MAX_SEARCHES_PER_DAY - session.searches),
      resetAt: new Date(session.resetAt).toISOString(),
    });

    // Uppdatera cookie även vid GET (för att säkerställa att den finns)
    response.cookies.set(COOKIE_NAME, JSON.stringify(session), {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: COOKIE_MAX_AGE,
      path: "/",
    });

    return response;
  } catch (error) {
    if (process.env.NODE_ENV === 'development') {
      console.error("Error getting session:", error);
    }
    return NextResponse.json({ error: "Ett fel uppstod" }, { status: 500 });
  }
}
