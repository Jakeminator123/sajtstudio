import { MetadataRoute } from "next";

/**
 * Sitemap configuration for SEO
 *
 * Includes all main pages of the site with appropriate priorities:
 * - Home page: Highest priority (1.0)
 * - Portfolio: High priority (0.8) - frequently updated content
 * - Kontakt: Medium-high priority (0.7) - important conversion page
 * - Utvardera & Sajtgranskning: Medium priority (0.6) - service pages
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://www.sajtstudio.se";

  return [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 1,
    },
    {
      url: `${baseUrl}/portfolio`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/kontakt`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/utvardera`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
    {
      url: `${baseUrl}/sajtgranskning`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];
}
