/**
 * Content Database - SQLite-based CMS for homepage content
 *
 * Uses consistent key naming:
 * - T* for text content (T1, T2, T3...)
 * - B* for images/bilder (B1, B2, B3...)
 * - V* for videos (V1, V2, V3...)
 */

import Database from 'better-sqlite3'
import path from 'path'
import fs from 'fs'
import { getDbPath } from '@/lib/storage-paths'

// Database file location (defaults to <repo>/data/db; override with DATA_DIR in production)
const dbPath = getDbPath('content.db')

// Load default content from cache.json file (versioned in Git)
const cachePath = path.join(process.cwd(), 'content-cache.json')
let cacheContent: Record<string, Omit<NewContentEntry, 'key'>> = {}

try {
  if (fs.existsSync(cachePath)) {
    const cacheData = fs.readFileSync(cachePath, 'utf-8')
    cacheContent = JSON.parse(cacheData)
  }
} catch (error) {
  console.warn('Failed to load content-cache.json, using hardcoded defaults:', error)
}

// Create database connection
const contentDb = new Database(dbPath)

// Initialize the content table
contentDb.exec(`
  CREATE TABLE IF NOT EXISTS content (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('text', 'image', 'video')),
    section TEXT NOT NULL,
    value TEXT NOT NULL,
    label TEXT NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`)

// Create index for faster lookups
contentDb.exec(`
  CREATE INDEX IF NOT EXISTS idx_content_key ON content(key)
`)
contentDb.exec(`
  CREATE INDEX IF NOT EXISTS idx_content_section ON content(section)
`)

// Types
export interface ContentEntry {
  id: number
  key: string
  type: 'text' | 'image' | 'video'
  section: string
  value: string
  label: string
  updated_at: string
}

export interface NewContentEntry {
  key: string
  type: 'text' | 'image' | 'video'
  section: string
  value: string
  label: string
}

// Default content values - fallbacks when database is empty
// First try cache.json, then fall back to hardcoded values
const hardcodedDefaults: Record<string, Omit<NewContentEntry, 'key'>> = {
  // HERO SECTION
  T1: {
    type: 'text',
    section: 'hero',
    value: 'Hemsidor som betyder någonting',
    label: 'Hero huvudrubrik',
  },
  T2: {
    type: 'text',
    section: 'hero',
    value: 'Vi bygger digitala upplevelser som driver resultat',
    label: 'Hero underrubrik',
  },
  T3: { type: 'text', section: 'hero', value: 'Starta projekt', label: 'Hero CTA-knapptext' },
  T4: { type: 'text', section: 'hero', value: 'BYGG DIN SAJT NU!', label: 'Hero sekundär CTA' },
  B1: {
    type: 'image',
    section: 'hero',
    value: '/images/hero/hero-background.webp',
    label: 'Hero bakgrundsbild',
  },
  V1: {
    type: 'video',
    section: 'hero',
    value: '/videos/background.mp4',
    label: 'Hero bakgrundsvideo',
  },

  // ABOUT SECTION
  T5: { type: 'text', section: 'about', value: 'Om Sajtstudio', label: 'About titel' },
  T6: {
    type: 'text',
    section: 'about',
    value:
      'Vi är en digital byrå som kombinerar kreativitet med teknisk expertis för att skapa webbplatser som verkligen levererar resultat.',
    label: 'About beskrivning',
  },
  T7: { type: 'text', section: 'about', value: '50+', label: 'Statistik 1 - Antal projekt' },
  T8: { type: 'text', section: 'about', value: '5+', label: 'Statistik 2 - År erfarenhet' },
  T9: { type: 'text', section: 'about', value: '100%', label: 'Statistik 3 - Nöjda kunder' },

  // USP SECTION
  T10: {
    type: 'text',
    section: 'usp',
    value: 'AI-drivet. Data-baserat. Resultatfokuserat.',
    label: 'USP huvudrubrik',
  },
  T11: {
    type: 'text',
    section: 'usp',
    value: 'Hemsidor som faktiskt genererar affärer',
    label: 'USP underrubrik',
  },
  T12: {
    type: 'text',
    section: 'usp',
    value:
      'Vi erbjuder både skräddarsydd webbutveckling och AI-genererade webbplatser. Oavsett vilket alternativ du väljer bygger vi sajter utifrån vad som fungerar – inte bara vad som ser snyggt ut. Din hemsida ska jobba för dig.',
    label: 'USP beskrivning',
  },
  T13: {
    type: 'text',
    section: 'usp',
    value: 'AI-generering eller Skräddarsydd Utveckling',
    label: 'USP punkt 1 titel',
  },
  T14: {
    type: 'text',
    section: 'usp',
    value: 'SEO-Optimering från Start',
    label: 'USP punkt 2 titel',
  },
  T15: {
    type: 'text',
    section: 'usp',
    value: 'Skräddarsydd för Dina Mål',
    label: 'USP punkt 3 titel',
  },
  T16: { type: 'text', section: 'usp', value: 'Redigera När Du Vill', label: 'USP punkt 4 titel' },
  T17: {
    type: 'text',
    section: 'usp',
    value:
      'Välj mellan vår AI-plattform SajtMaskin som genererar professionella webbplatser på minuter, eller låt oss bygga en helt unik hemsida från grunden.',
    label: 'USP punkt 1 beskrivning',
  },
  T18: {
    type: 'text',
    section: 'usp',
    value:
      'Varje hemsida är byggd för att ranka högt på Google. Vi optimerar inte bara för sökmotorer – vi gör det så att AI-agenter, chatbots och framtida verktyg enkelt kan hitta och förstå ditt innehåll.',
    label: 'USP punkt 2 beskrivning',
  },
  T19: {
    type: 'text',
    section: 'usp',
    value:
      'Din hemsida designas utifrån vad ditt företag faktiskt erbjuder och vad du vill uppnå. Inte generiska mallar – utan unika lösningar som driver försäljning, leads eller vad ditt mål nu är.',
    label: 'USP punkt 3 beskrivning',
  },
  T20: {
    type: 'text',
    section: 'usp',
    value:
      'Du behöver inte vara låst. Våra hemsidor är byggda så att du enkelt kan uppdatera innehåll, lägga till sidor eller ändra design när behovet uppstår.',
    label: 'USP punkt 4 beskrivning',
  },

  // SERVICES SECTION
  T21: {
    type: 'text',
    section: 'services',
    value: 'AI-generering av Webbplatser',
    label: 'Tjänst 1 titel',
  },
  T22: { type: 'text', section: 'services', value: 'Webbdesign', label: 'Tjänst 2 titel' },
  T23: { type: 'text', section: 'services', value: 'Webbutveckling', label: 'Tjänst 3 titel' },
  T24: {
    type: 'text',
    section: 'services',
    value: 'Varumärke & Identitet',
    label: 'Tjänst 4 titel',
  },
  T25: {
    type: 'text',
    section: 'services',
    value: 'Skapa professionella webbplatser på minuter med AI',
    label: 'Tjänst 1 kort beskrivning',
  },
  T26: {
    type: 'text',
    section: 'services',
    value: 'Skräddarsydda, moderna webbplatser som sticker ut',
    label: 'Tjänst 2 kort beskrivning',
  },
  T27: {
    type: 'text',
    section: 'services',
    value: 'Kraftfulla och skalbara webbapplikationer',
    label: 'Tjänst 3 kort beskrivning',
  },
  T28: {
    type: 'text',
    section: 'services',
    value: 'Starka varumärken som berättar er historia',
    label: 'Tjänst 4 kort beskrivning',
  },
  T29: {
    type: 'text',
    section: 'services',
    value:
      'Vår AI-drivna plattform SajtMaskin gör det möjligt att generera kompletta, professionella webbplatser på bara minuter.',
    label: 'Tjänst 1 lång beskrivning',
  },
  T30: {
    type: 'text',
    section: 'services',
    value:
      'Vi skapar visuella upplevelser som inte bara är vackra, utan också meningsfulla. Varje pixel är genomtänkt.',
    label: 'Tjänst 2 lång beskrivning',
  },
  T31: {
    type: 'text',
    section: 'services',
    value:
      'Vi bygger hemsidor som är snabba, responsiva och användarvänliga. Tekniken är osynlig – det som syns är en smidig upplevelse.',
    label: 'Tjänst 3 lång beskrivning',
  },
  T32: {
    type: 'text',
    section: 'services',
    value:
      'Ett starkt varumärke är grunden för framgång. Vi hjälper dig skapa en konsekvent och minnesvärd identitet.',
    label: 'Tjänst 4 lång beskrivning',
  },
  V2: {
    type: 'video',
    section: 'services',
    value: '/videos/background_vid.mp4',
    label: 'Services bakgrundsvideo',
  },

  // PROCESS SECTION
  T33: {
    type: 'text',
    section: 'process',
    value: 'Analys & Strategi',
    label: 'Process steg 1 titel',
  },
  T34: {
    type: 'text',
    section: 'process',
    value: 'Design & Utveckling',
    label: 'Process steg 2 titel',
  },
  T35: {
    type: 'text',
    section: 'process',
    value: 'SEO & Optimering',
    label: 'Process steg 3 titel',
  },
  T36: {
    type: 'text',
    section: 'process',
    value: 'Lansering & Support',
    label: 'Process steg 4 titel',
  },
  T37: {
    type: 'text',
    section: 'process',
    value:
      'Vi analyserar ditt företag, din bransch och dina mål med AI-drivet verktyg för att skapa en databaserad strategi.',
    label: 'Process steg 1 beskrivning',
  },
  T38: {
    type: 'text',
    section: 'process',
    value:
      'Skräddarsydd design och utveckling baserat på analysen. Varje pixel är tänkt för att konvertera besökare till kunder.',
    label: 'Process steg 2 beskrivning',
  },
  T39: {
    type: 'text',
    section: 'process',
    value:
      'Fullständig SEO-optimering från start. Vi säkerställer att din sajt rankar högt och är synlig för rätt målgrupp.',
    label: 'Process steg 3 beskrivning',
  },
  T40: {
    type: 'text',
    section: 'process',
    value:
      'Smidig lansering och pågående support. Vi finns här för att hjälpa dig växa och optimera kontinuerligt.',
    label: 'Process steg 4 beskrivning',
  },
  B2: {
    type: 'image',
    section: 'process',
    value: '/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp',
    label: 'Process bakgrundsbild',
  },

  // TESTIMONIALS SECTION
  T41: {
    type: 'text',
    section: 'testimonials',
    value:
      'Sajtstudio skapade en hemsida som inte bara ser fantastisk ut, utan också genererar riktiga resultat. Vår konvertering ökade med 40% efter lanseringen.',
    label: 'Testimonial 1 citat',
  },
  T42: {
    type: 'text',
    section: 'testimonials',
    value:
      'Professionellt arbete från början till slut. De förstod vår vision och förvandlade den till en verklighet som överträffade våra förväntningar.',
    label: 'Testimonial 2 citat',
  },
  T43: {
    type: 'text',
    section: 'testimonials',
    value:
      'AI-drivet och data-baserat – precis vad vi behövde. Vår nya sajt rankar högt på Google och genererar kvalificerade leads dagligen.',
    label: 'Testimonial 3 citat',
  },
  T44: {
    type: 'text',
    section: 'testimonials',
    value: 'Anna Andersson',
    label: 'Testimonial 1 namn',
  },
  T45: {
    type: 'text',
    section: 'testimonials',
    value: 'Marcus Larsson',
    label: 'Testimonial 2 namn',
  },
  T46: {
    type: 'text',
    section: 'testimonials',
    value: 'Emma Johansson',
    label: 'Testimonial 3 namn',
  },
  T47: {
    type: 'text',
    section: 'testimonials',
    value: 'VD, TechCorp',
    label: 'Testimonial 1 företag/roll',
  },
  T48: {
    type: 'text',
    section: 'testimonials',
    value: 'Grundare, Creative Studio',
    label: 'Testimonial 2 företag/roll',
  },
  T49: {
    type: 'text',
    section: 'testimonials',
    value: 'CMO, StartupXYZ',
    label: 'Testimonial 3 företag/roll',
  },

  // BIGCTA SECTION
  T50: {
    type: 'text',
    section: 'bigcta',
    value: 'Redo att ta nästa steg?',
    label: 'BigCTA rubrik',
  },
  T51: {
    type: 'text',
    section: 'bigcta',
    value: 'Låt oss bygga något fantastiskt tillsammans',
    label: 'BigCTA undertext',
  },
  B3: {
    type: 'image',
    section: 'bigcta',
    value: '/images/contact_phone.webp',
    label: 'BigCTA telefon-bild',
  },

  // PORTFOLIO/ANIMATION
  B4: {
    type: 'image',
    section: 'portfolio',
    value: '/images/portfolio/task_01k90mfa25f2etneptc7kekm99_1762031914_img_0.webp',
    label: 'Portfolio bild 1',
  },
  B5: {
    type: 'image',
    section: 'portfolio',
    value: '/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp',
    label: 'Portfolio bild 2',
  },
  B6: {
    type: 'image',
    section: 'portfolio',
    value: '/images/portfolio/assets_task_01k816mxkwe908h5pg7v3yxtq9_1760977226_img_0.webp',
    label: 'Portfolio bild 3',
  },
  B7: {
    type: 'image',
    section: 'portfolio',
    value: '/images/portfolio/task_01k9akk4rjfcr83xkf3b7r0rdr_1762366467_img_1.webp',
    label: 'Portfolio bild 4',
  },
  B8: {
    type: 'image',
    section: 'portfolio',
    value: '/images/portfolio/assets_task_01k05sqa0wedsbvfk5c0773fz5_1752541456_img_0.webp',
    label: 'Portfolio bild 5',
  },
  B9: {
    type: 'image',
    section: 'portfolio',
    value: '/images/portfolio/assets_task_01k1c880wqft0s0bcr3p77v2me_1753831780_img_0.webp',
    label: 'Portfolio bild 6',
  },
  B10: {
    type: 'image',
    section: 'portfolio',
    value: '/images/portfolio/assets_task_01k80qdg0ze1rskjzfpj7r1za3_1760961264_img_0.webp',
    label: 'Portfolio bild 7',
  },
  B11: {
    type: 'image',
    section: 'portfolio',
    value: '/images/portfolio/task_01k9et3f60e4782n74d3pkapg7_1762507579_img_0.webp',
    label: 'Portfolio bild 8',
  },
  V3: {
    type: 'video',
    section: 'portfolio',
    value: '/videos/matrix_code.mp4',
    label: 'Matrix code video',
  },
  V4: { type: 'video', section: 'portfolio', value: '/videos/om_oss.mp4', label: 'Om oss video' },
  V5: {
    type: 'video',
    section: 'portfolio',
    value: '/videos/telephone_ringin.mp4',
    label: 'Telefon-ringing video',
  },
  V6: {
    type: 'video',
    section: 'portfolio',
    value: '/videos/unclear_md.mp4',
    label: 'Portfolio explosion video',
  },

  // EXTRA - Background images
  B12: {
    type: 'image',
    section: 'backgrounds',
    value: '/images/backgrounds/8-bit.webp',
    label: '8-bit bakgrund',
  },
  B13: {
    type: 'image',
    section: 'backgrounds',
    value: '/images/backgrounds/section-background.webp',
    label: 'Section bakgrund (dark)',
  },
  B14: {
    type: 'image',
    section: 'backgrounds',
    value: '/images/backgrounds/section-background-sunny.webp',
    label: 'Section bakgrund (light)',
  },
  B15: {
    type: 'image',
    section: 'backgrounds',
    value: '/images/backgrounds/city-background-sunny.webp',
    label: 'City bakgrund (light)',
  },

  // TEAM SECTION
  T52: {
    type: 'text',
    section: 'team',
    value: 'Teamet bakom Sajtstudio',
    label: 'Team sektion rubrik',
  },
  T53: {
    type: 'text',
    section: 'team',
    value:
      'Sajtstudio drivs av ett dynamiskt team av entreprenörer med bred erfarenhet inom teknik, media och affärer. Vi förenas av en passion för att skapa moderna webblösningar med verklig effekt för våra kunder. Tillsammans har vi byggt upp företag, utvecklat innovativa digitala produkter och hjälpt andra att växa genom smart marknadsföring. Resultatet är en unik kombination av kompetenser som genomsyrar allt vi gör – från AI-generering av webbplatser till strategisk webbdesign och digital marknadsföring.',
    label: 'Team intro text',
  },
  T54: { type: 'text', section: 'team', value: 'Jakob Eberg', label: 'Teammedlem 1 namn' },
  T55: { type: 'text', section: 'team', value: 'Oscar Guditz', label: 'Teammedlem 2 namn' },
  T56: { type: 'text', section: 'team', value: 'Joakim Hallsten', label: 'Teammedlem 3 namn' },
  T57: {
    type: 'text',
    section: 'team',
    value: 'Tech Lead & Utveckling',
    label: 'Teammedlem 1 roll',
  },
  T58: {
    type: 'text',
    section: 'team',
    value: 'Affärsutveckling & Partnerskap',
    label: 'Teammedlem 2 roll',
  },
  T59: {
    type: 'text',
    section: 'team',
    value: 'Media & Marknadsföring',
    label: 'Teammedlem 3 roll',
  },
  T60: {
    type: 'text',
    section: 'team',
    value:
      'En före detta professionell pokerspelare som bytte karriärbana till tech-världen. Med flera års erfarenhet av programmering och mjukvaruutveckling ansvarar han för den tekniska utvecklingen. Hans bakgrund av datadrivna beslut – från både pokerbordet och kodning – säkerställer att varje hemsida vi levererar håller högsta klass under huven.',
    label: 'Teammedlem 1 beskrivning',
  },
  T61: {
    type: 'text',
    section: 'team',
    value:
      'En serieentreprenör som har drivit flera digitala projekt och företag. Han har byggt och sålt webbplatser samt varit involverad i olika tech-startups, inklusive ett kontorshotell i centrala Stockholm. På Sajtstudio fokuserar han på projektledning, försäljning och partnerskap – och ser till att vi alltid ligger i framkant vad gäller nya digitala möjligheter.',
    label: 'Teammedlem 2 beskrivning',
  },
  T62: {
    type: 'text',
    section: 'team',
    value:
      'Vår expert inom media och marknadsföring med över ett decennium i branschen. Han har grundat och drivit bolag specialiserade på att leverera högkvalitativa leads och data för telemarketing, med erfarenhet av att leda team på över 90 anställda. Hos Sajtstudio ansvarar han för innehållsstrategi och SEO – han säkerställer att våra kunders budskap når ut och att deras webbplatser konverterar besökare till kunder.',
    label: 'Teammedlem 3 beskrivning',
  },
  T63: {
    type: 'text',
    section: 'team',
    value:
      'Tillsammans kombinerar vi teknisk expertis, kreativ marknadsföring och affärssinne. Vi bygger hemsidor som faktiskt genererar affärer åt våra kunder. Varje projekt vi tar oss an är SEO-optimerat från start, så att din webbplats rankar högt på Google och är lätt för både människor och AI-verktyg att hitta. Med vårt team i ryggen kan du lita på att din digitala närvaro utvecklas av erfarna proffs som brinner för att skapa resultat.',
    label: 'Team outro CTA',
  },
  T64: {
    type: 'text',
    section: 'team',
    value: 'https://www.linkedin.com/in/jakob-eberg/',
    label: 'Teammedlem 1 LinkedIn',
  },
  T65: {
    type: 'text',
    section: 'team',
    value: 'https://www.linkedin.com/in/oscar-guditz/',
    label: 'Teammedlem 2 LinkedIn',
  },
  T66: {
    type: 'text',
    section: 'team',
    value: 'https://www.linkedin.com/in/joakim-hallsten/',
    label: 'Teammedlem 3 LinkedIn',
  },
  B16: {
    type: 'image',
    section: 'team',
    value: '/images/team/jakob-eberg.webp',
    label: 'Jakob Eberg profilbild',
  },
  B17: {
    type: 'image',
    section: 'team',
    value: '/images/team/oscar-guditz.webp',
    label: 'Oscar Guditz profilbild',
  },
  B18: {
    type: 'image',
    section: 'team',
    value: '/images/team/joakim-hallsten.webp',
    label: 'Joakim Hallsten profilbild',
  },
}

// Export defaultContent: prefer cache.json, fallback to hardcoded
export const defaultContent: Record<string, Omit<NewContentEntry, 'key'>> = {
  ...hardcodedDefaults,
  ...cacheContent, // Cache.json overrides hardcoded if both exist
}

// CRUD Functions

/**
 * Get a single content entry by key
 * Returns default value if not found in database
 */
export function getContent(key: string): ContentEntry | null {
  const stmt = contentDb.prepare('SELECT * FROM content WHERE key = ?')
  const result = stmt.get(key) as ContentEntry | undefined

  if (result) {
    return result
  }

  // Return default if exists
  const defaultValue = defaultContent[key]
  if (defaultValue) {
    return {
      id: 0,
      key,
      ...defaultValue,
      updated_at: new Date().toISOString(),
    }
  }

  return null
}

/**
 * Get content value with fallback
 * This is the main function to use in components
 */
export function getContentValue(key: string, fallback?: string): string {
  const content = getContent(key)
  return content?.value ?? fallback ?? ''
}

/**
 * Get all content entries (for admin panel)
 */
export function getAllContent(): ContentEntry[] {
  const stmt = contentDb.prepare('SELECT * FROM content ORDER BY section, key')
  const dbContent = stmt.all() as ContentEntry[]

  // Merge with defaults (prefer database values)
  const merged: Map<string, ContentEntry> = new Map()

  // Add defaults first
  for (const [key, value] of Object.entries(defaultContent)) {
    merged.set(key, {
      id: 0,
      key,
      ...value,
      updated_at: new Date().toISOString(),
    })
  }

  // Override with database values
  for (const entry of dbContent) {
    merged.set(entry.key, entry)
  }

  // Sort by section then key
  return Array.from(merged.values()).sort((a, b) => {
    if (a.section !== b.section) {
      return a.section.localeCompare(b.section)
    }
    // Sort keys numerically (T1, T2, T10, etc.)
    const aNum = parseInt(a.key.slice(1)) || 0
    const bNum = parseInt(b.key.slice(1)) || 0
    return aNum - bNum
  })
}

/**
 * Get content by section
 */
export function getContentBySection(section: string): ContentEntry[] {
  const all = getAllContent()
  return all.filter((entry) => entry.section === section)
}

/**
 * Update or insert a content entry
 */
export function updateContent(key: string, value: string): ContentEntry | null {
  const existing = defaultContent[key] || getContent(key)
  if (!existing) {
    return null
  }

  const stmt = contentDb.prepare(`
    INSERT INTO content (key, type, section, value, label, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
    ON CONFLICT(key) DO UPDATE SET
      value = excluded.value,
      updated_at = datetime('now')
  `)

  stmt.run(key, existing.type, existing.section, value, existing.label)

  return getContent(key)
}

/**
 * Seed database with default values
 * Only inserts entries that don't already exist (preserves user edits)
 * Uses cache.json if available, otherwise hardcoded defaults
 */
export function seedDefaults(): number {
  // Check which keys already exist in database
  const existingKeysStmt = contentDb.prepare('SELECT key FROM content')
  const existingKeys = new Set((existingKeysStmt.all() as { key: string }[]).map((row) => row.key))

  const insertStmt = contentDb.prepare(`
    INSERT INTO content (key, type, section, value, label, updated_at)
    VALUES (?, ?, ?, ?, ?, datetime('now'))
  `)

  let insertedCount = 0

  const transaction = contentDb.transaction(() => {
    for (const [key, entry] of Object.entries(defaultContent)) {
      // Only insert if key doesn't exist (preserves user edits)
      if (!existingKeys.has(key)) {
        const result = insertStmt.run(key, entry.type, entry.section, entry.value, entry.label)
        if (result.changes > 0) {
          insertedCount++
        }
      }
    }
  })

  transaction()
  return insertedCount
}

/**
 * Reset a content entry to its default value
 */
export function resetToDefault(key: string): ContentEntry | null {
  const defaultValue = defaultContent[key]
  if (!defaultValue) {
    return null
  }

  const stmt = contentDb.prepare('DELETE FROM content WHERE key = ?')
  stmt.run(key)

  return getContent(key)
}

/**
 * Get content stats for admin dashboard
 */
export function getContentStats(): { total: number; customized: number; sections: string[] } {
  const totalStmt = contentDb.prepare('SELECT COUNT(*) as count FROM content')
  const customized = (totalStmt.get() as { count: number }).count

  const sectionsStmt = contentDb.prepare('SELECT DISTINCT section FROM content')
  const dbSections = (sectionsStmt.all() as { section: string }[]).map((s) => s.section)

  // Get all unique sections from defaults
  const allSections = new Set([
    ...dbSections,
    ...Object.values(defaultContent).map((d) => d.section),
  ])

  return {
    total: Object.keys(defaultContent).length,
    customized,
    sections: Array.from(allSections).sort(),
  }
}

export default contentDb
