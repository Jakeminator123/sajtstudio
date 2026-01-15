/**
 * Server-side content fetching utilities
 *
 * Use these functions in Server Components or Server Actions
 * to fetch CMS content with proper fallbacks.
 *
 * For Client Components, use the useContent hook from @/hooks/useContent
 */

import {
  getContentValue,
  getContentBySection,
  getAllContent,
  ContentEntry,
  defaultContent,
} from './content-database'

// Re-export types
export type { ContentEntry }

/**
 * Get a single content value by key with fallback
 *
 * @example
 * const heroTitle = getContent("T1", "Default Hero Title");
 */
export function getContent(key: string, fallback?: string): string {
  return getContentValue(key, fallback)
}

/**
 * Get multiple content values as an object
 *
 * @example
 * const hero = getContentMap(["T1", "T2", "T3", "T4"]);
 * // Returns { T1: "value1", T2: "value2", ... }
 */
export function getContentMap(keys: string[]): Record<string, string> {
  const result: Record<string, string> = {}
  for (const key of keys) {
    result[key] = getContentValue(key)
  }
  return result
}

/**
 * Get all content for a specific section
 *
 * @example
 * const heroContent = getSection("hero");
 * // Returns { T1: "...", T2: "...", B1: "...", V1: "..." }
 */
export function getSection(section: string): Record<string, string> {
  const entries = getContentBySection(section)
  const result: Record<string, string> = {}
  for (const entry of entries) {
    result[entry.key] = entry.value
  }
  return result
}

/**
 * Get all content entries (for admin or debugging)
 */
export function getAllContentEntries(): ContentEntry[] {
  return getAllContent()
}

/**
 * Get default value for a key (useful for comparisons)
 */
export function getDefaultValue(key: string): string | undefined {
  return defaultContent[key]?.value
}

/**
 * Check if content exists in database (vs using default)
 */
export function hasCustomContent(key: string): boolean {
  try {
    const entry = getAllContent().find((e) => e.key === key)
    return entry !== undefined && entry.id !== 0
  } catch {
    return false
  }
}

// Predefined content keys for type safety
export const CONTENT_KEYS = {
  // Hero
  HERO_TITLE: 'T1',
  HERO_SUBTITLE: 'T2',
  HERO_CTA: 'T3',
  HERO_CTA_SECONDARY: 'T4',
  HERO_BG_IMAGE: 'B1',
  HERO_BG_VIDEO: 'V1',

  // About
  ABOUT_TITLE: 'T5',
  ABOUT_DESC: 'T6',
  ABOUT_STAT1: 'T7',
  ABOUT_STAT2: 'T8',
  ABOUT_STAT3: 'T9',

  // USP
  USP_TITLE: 'T10',
  USP_SUBTITLE: 'T11',
  USP_DESC: 'T12',
  USP_1_TITLE: 'T13',
  USP_2_TITLE: 'T14',
  USP_3_TITLE: 'T15',
  USP_4_TITLE: 'T16',
  USP_1_DESC: 'T17',
  USP_2_DESC: 'T18',
  USP_3_DESC: 'T19',
  USP_4_DESC: 'T20',

  // Services
  SERVICE_1_TITLE: 'T21',
  SERVICE_2_TITLE: 'T22',
  SERVICE_3_TITLE: 'T23',
  SERVICE_4_TITLE: 'T24',
  SERVICE_1_SHORT: 'T25',
  SERVICE_2_SHORT: 'T26',
  SERVICE_3_SHORT: 'T27',
  SERVICE_4_SHORT: 'T28',
  SERVICE_1_LONG: 'T29',
  SERVICE_2_LONG: 'T30',
  SERVICE_3_LONG: 'T31',
  SERVICE_4_LONG: 'T32',
  SERVICES_VIDEO: 'V2',

  // Process
  PROCESS_1_TITLE: 'T33',
  PROCESS_2_TITLE: 'T34',
  PROCESS_3_TITLE: 'T35',
  PROCESS_4_TITLE: 'T36',
  PROCESS_1_DESC: 'T37',
  PROCESS_2_DESC: 'T38',
  PROCESS_3_DESC: 'T39',
  PROCESS_4_DESC: 'T40',
  PROCESS_BG: 'B2',

  // Testimonials
  TESTIMONIAL_1_QUOTE: 'T41',
  TESTIMONIAL_2_QUOTE: 'T42',
  TESTIMONIAL_3_QUOTE: 'T43',
  TESTIMONIAL_1_NAME: 'T44',
  TESTIMONIAL_2_NAME: 'T45',
  TESTIMONIAL_3_NAME: 'T46',
  TESTIMONIAL_1_ROLE: 'T47',
  TESTIMONIAL_2_ROLE: 'T48',
  TESTIMONIAL_3_ROLE: 'T49',

  // BigCTA
  BIGCTA_TITLE: 'T50',
  BIGCTA_SUBTITLE: 'T51',
  BIGCTA_IMAGE: 'B3',

  // Portfolio images
  PORTFOLIO_1: 'B4',
  PORTFOLIO_2: 'B5',
  PORTFOLIO_3: 'B6',
  PORTFOLIO_4: 'B7',
  PORTFOLIO_5: 'B8',
  PORTFOLIO_6: 'B9',
  PORTFOLIO_7: 'B10',
  PORTFOLIO_8: 'B11',

  // Videos
  MATRIX_VIDEO: 'V3',
  ABOUT_VIDEO: 'V4',
  PHONE_VIDEO: 'V5',
  EXPLOSION_VIDEO: 'V6',
} as const
