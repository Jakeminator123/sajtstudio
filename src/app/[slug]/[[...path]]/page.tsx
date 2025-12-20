/**
 * Preview Page - Database-validated preview wrapper
 *
 * This page only displays previews for slugs that exist in the previews database.
 * Invalid slugs return 404.
 *
 * URL structure: /demo-xyz or /demo-xyz/some/path
 * Displays: https://demo-xyz.vusercontent.net[/some/path] in an iframe with branding
 */

import { notFound } from "next/navigation";
import {
  getPreviewBySlug,
  updateLastAccessed,
} from "@/lib/preview-database";
import PreviewWrapper from "@/components/preview/PreviewWrapper";

// Runtime configuration - nodejs required for better-sqlite3
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// Reserved routes that should not be handled by this catch-all
const RESERVED_ROUTES = [
  "api",
  "admin",
  "contact",
  "kontakt",
  "portfolio",
  "generated",
  "sajtgranskning",
  "utvardera",
  "sajtmaskin",
  "engine",
  "_next",
  "favicon.ico",
];

// Check if SLUGS feature is disabled
const slugsDisabled = (() => {
  const flag = process.env.SLUGS;
  if (!flag) {
    return true; // Default to disabled if not set
  }
  const normalized = flag.trim().toLowerCase();
  if (["n", "no", "off", "0", "false"].includes(normalized)) {
    return true;
  }
  if (["y", "yes", "on", "1", "true"].includes(normalized)) {
    return false;
  }
  return true; // Default to disabled if invalid value
})();

// Base URL for vusercontent
const VUSERCONTENT_DOMAIN = ".vusercontent.net";

interface PageProps {
  params: Promise<{ slug: string; path?: string[] }>;
}

export default async function PreviewPage({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug, path } = resolvedParams;

  // Return 404 if slugs feature is disabled
  if (slugsDisabled) {
    notFound();
  }

  // Validate slug exists
  if (!slug || typeof slug !== "string" || slug.trim() === "") {
    notFound();
  }

  // Check if slug is a reserved route
  if (RESERVED_ROUTES.includes(slug.toLowerCase())) {
    notFound();
  }

  // Validate slug format (alphanumeric, dashes, underscores)
  const slugRegex = /^[a-zA-Z0-9_-]+$/;
  if (!slugRegex.test(slug)) {
    notFound();
  }

  // Check if slug exists in database
  const preview = getPreviewBySlug(slug);
  if (!preview) {
    notFound();
  }

  // Update last accessed timestamp (fire and forget)
  try {
    updateLastAccessed(slug);
  } catch {
    // Don't fail the request if stats update fails
  }

  // Build the URLs
  const pathString = path && path.length > 0 ? `/${path.join("/")}` : "";
  const sourceUrl = `https://${slug}${VUSERCONTENT_DOMAIN}${pathString}`;
  // Use our proxy to bypass X-Frame-Options
  const proxyUrl = `/api/preview/${slug}${pathString}`;

  return (
    <PreviewWrapper
      proxyUrl={proxyUrl}
      sourceUrl={sourceUrl}
      preview={{
        slug: preview.slug,
        company_name: preview.company_name,
        domain: preview.domain,
      }}
    />
  );
}

// Generate metadata for the page
export async function generateMetadata({ params }: PageProps) {
  const resolvedParams = await params;
  const { slug } = resolvedParams;

  if (slugsDisabled || !slug) {
    return { title: "Inte hittad | Sajtstudio" };
  }

  const preview = getPreviewBySlug(slug);

  if (!preview) {
    return { title: "Inte hittad | Sajtstudio" };
  }

  return {
    title: preview.company_name
      ? `${preview.company_name} - Preview | Sajtstudio`
      : `Preview | Sajtstudio`,
    description: preview.domain
      ? `Förhandsgranskning av webbplats för ${preview.domain}`
      : "Förhandsgranskning av webbplats skapad av Sajtstudio",
    robots: {
      index: false,
      follow: false,
    },
  };
}

