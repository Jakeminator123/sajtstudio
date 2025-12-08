import { NextRequest, NextResponse } from "next/server";

// Base URL pattern for external sites
const EXTERNAL_BASE_URL = "https://";
const EXTERNAL_DOMAIN_SUFFIX = ".vusercontent.net";

/**
 * Verifies password and returns the corresponding slug
 * Password format: e.g., "demo-kzmoqvc0t8a7dxke3a6j"
 * This will redirect to: /demo-kzmoqvc0t8a7dxke3a6j
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { password } = body;

    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { error: "Lösenord krävs" },
        { status: 400 }
      );
    }

    const trimmedPassword = password.trim();

    if (!trimmedPassword) {
      return NextResponse.json(
        { error: "Lösenord kan inte vara tomt" },
        { status: 400 }
      );
    }

    // Validate password format (alphanumeric, dashes, underscores allowed)
    // This matches typical subdomain patterns
    const passwordRegex = /^[a-zA-Z0-9_-]+$/;
    if (!passwordRegex.test(trimmedPassword)) {
      return NextResponse.json(
        { error: "Ogiltigt lösenordsformat" },
        { status: 400 }
      );
    }

    // Verify that the external URL exists by checking if it's accessible
    // This ensures we only allow valid passwords that correspond to existing sites
    const externalUrl = `${EXTERNAL_BASE_URL}${trimmedPassword}${EXTERNAL_DOMAIN_SUFFIX}`;

    try {
      const checkResponse = await fetch(externalUrl, {
        method: "HEAD",
        headers: {
          "User-Agent": "Mozilla/5.0 (compatible; Sajtstudio/1.0)",
        },
        // Add timeout to prevent hanging
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });

      // If the site doesn't exist (404), reject the password
      if (!checkResponse.ok && checkResponse.status === 404) {
        return NextResponse.json(
          { error: "Ogiltigt lösenord" },
          { status: 401 }
        );
      }

      // If we get any other error (timeout, network error, etc.),
      // we'll still allow it but log for debugging
      if (!checkResponse.ok) {
        console.warn(`Warning: External URL check failed for ${trimmedPassword}: ${checkResponse.status}`);
        // Continue anyway - might be temporary network issue
      }
    } catch (fetchError) {
      // Network errors or timeouts - log but allow (might be temporary)
      console.warn(`Warning: Could not verify external URL for ${trimmedPassword}:`, fetchError);
      // Continue anyway - don't block user if there's a network issue
    }

    // Return success with the slug (which is the same as the password)
    return NextResponse.json(
      {
        success: true,
        slug: trimmedPassword,
        message: "Lösenord verifierat"
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error verifying password:", error);
    return NextResponse.json(
      { error: "Något gick fel. Försök igen senare." },
      { status: 500 }
    );
  }
}
