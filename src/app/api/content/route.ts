/**
 * Content API Route
 * 
 * Endpoints for managing homepage content:
 * - GET /api/content - Get all content entries
 * - GET /api/content?key=T1 - Get specific content by key
 * - GET /api/content?section=hero - Get content by section
 * - PUT /api/content - Update content entry (requires API key)
 * - POST /api/content/seed - Seed database with defaults (requires API key)
 */

import { NextRequest, NextResponse } from "next/server";

// Ensure content is always fresh (no caching)
export const dynamic = "force-dynamic";
export const revalidate = 0;
import {
  getAllContent,
  getContent,
  getContentBySection,
  getContentStats,
  updateContent,
  seedDefaults,
} from "@/lib/content-database";

// Simple API key protection
function isAuthorized(request: NextRequest): boolean {
  // Prefer private server key, but fall back to public for environments
  // where only NEXT_PUBLIC_CONTENT_API_KEY is configured.
  const apiKey = process.env.CONTENT_API_KEY || process.env.NEXT_PUBLIC_CONTENT_API_KEY;
  
  // If no API key is set, allow all requests in development
  if (!apiKey) {
    return process.env.NODE_ENV === "development";
  }
  
  const authHeader = request.headers.get("Authorization");
  return authHeader === `Bearer ${apiKey}`;
}

/**
 * GET /api/content
 * 
 * Query params:
 * - key: Get specific content by key (e.g., ?key=T1)
 * - section: Get content by section (e.g., ?section=hero)
 * - stats: Get content statistics (e.g., ?stats=true)
 * 
 * No params: Returns all content entries
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const key = searchParams.get("key");
    const section = searchParams.get("section");
    const stats = searchParams.get("stats");
    
    // Get statistics
    if (stats === "true") {
      const contentStats = getContentStats();
      return NextResponse.json({
        success: true,
        stats: contentStats,
      });
    }
    
    // Get by key
    if (key) {
      const content = getContent(key);
      if (!content) {
        return NextResponse.json(
          { error: `Content not found: ${key}` },
          { status: 404 }
        );
      }
      return NextResponse.json({
        success: true,
        content,
      });
    }
    
    // Get by section
    if (section) {
      const content = getContentBySection(section);
      return NextResponse.json({
        success: true,
        section,
        count: content.length,
        content,
      });
    }
    
    // Get all content
    const allContent = getAllContent();
    return NextResponse.json({
      success: true,
      count: allContent.length,
      content: allContent,
    });
  } catch (error) {
    console.error("Error fetching content:", error);
    return NextResponse.json(
      { error: "Failed to fetch content" },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/content
 * 
 * Update a content entry by key.
 * Requires API key authorization.
 * 
 * Body: { key: string, value: string }
 */
export async function PUT(request: NextRequest) {
  try {
    // Check authorization
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { key, value } = body;
    
    // Validate input
    if (!key || typeof key !== "string") {
      return NextResponse.json(
        { error: "Missing or invalid key" },
        { status: 400 }
      );
    }
    
    if (value === undefined || value === null) {
      return NextResponse.json(
        { error: "Missing value" },
        { status: 400 }
      );
    }
    
    // Update content
    const updated = updateContent(key, String(value));
    
    if (!updated) {
      return NextResponse.json(
        { error: `Unknown content key: ${key}` },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Content ${key} updated`,
      content: updated,
    });
  } catch (error) {
    console.error("Error updating content:", error);
    return NextResponse.json(
      { error: "Failed to update content" },
      { status: 500 }
    );
  }
}

/**
 * POST /api/content
 * 
 * Special actions:
 * - { action: "seed" } - Seed database with default values
 * - { action: "reset", key: "T1" } - Reset specific key to default
 * 
 * Requires API key authorization.
 */
export async function POST(request: NextRequest) {
  try {
    // Check authorization
    if (!isAuthorized(request)) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }
    
    const body = await request.json();
    const { action, key } = body;
    
    if (action === "seed") {
      const count = seedDefaults();
      return NextResponse.json({
        success: true,
        message: `Seeded ${count} default content entries`,
        inserted: count,
      });
    }
    
    if (action === "reset" && key) {
      const { resetToDefault } = await import("@/lib/content-database");
      const content = resetToDefault(key);
      
      if (!content) {
        return NextResponse.json(
          { error: `Unknown content key: ${key}` },
          { status: 404 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: `Content ${key} reset to default`,
        content,
      });
    }
    
    return NextResponse.json(
      { error: "Invalid action. Use 'seed' or 'reset'" },
      { status: 400 }
    );
  } catch (error) {
    console.error("Error processing content action:", error);
    return NextResponse.json(
      { error: "Failed to process action" },
      { status: 500 }
    );
  }
}

