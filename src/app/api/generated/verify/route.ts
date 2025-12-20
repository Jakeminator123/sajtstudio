import { NextRequest, NextResponse } from "next/server";
import { getPreviewBySlug } from "@/lib/preview-database";

/**
 * Verifies password/slug and returns the corresponding slug if valid
 * Password format: e.g., "demo-kzmoqvc0t8a7dxke3a6j"
 * This will redirect to: /demo-kzmoqvc0t8a7dxke3a6j
 * 
 * Now validates against the previews database instead of making external requests.
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
    const passwordRegex = /^[a-zA-Z0-9_-]+$/;
    if (!passwordRegex.test(trimmedPassword)) {
      return NextResponse.json(
        { error: "Ogiltigt lösenordsformat" },
        { status: 400 }
      );
    }

    // Check if the slug exists in our database
    const preview = getPreviewBySlug(trimmedPassword);

    if (!preview) {
      return NextResponse.json(
        { error: "Ogiltigt lösenord" },
        { status: 401 }
      );
    }

    // Return success with the slug
    return NextResponse.json(
      {
        success: true,
        slug: trimmedPassword,
        company: preview.company_name,
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
