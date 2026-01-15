/**
 * HeroSection Server Wrapper
 *
 * Fetches content from CMS and passes it to the client-side HeroSection.
 * This allows the heavy animation component to remain a client component
 * while still being able to use server-side content fetching.
 */

import { getSection, CONTENT_KEYS } from '@/lib/get-content'
import HeroSectionClient from './HeroSection'

// Content structure for hero section
export interface HeroContent {
  title: string
  subtitle: string
  ctaText: string
  ctaSecondary: string
  bgImage: string
  bgVideo: string
}

export default function HeroSection() {
  // Fetch all hero content server-side
  const heroContent = getSection('hero')

  // Map to expected format with fallbacks
  const content: HeroContent = {
    title: heroContent[CONTENT_KEYS.HERO_TITLE] || 'Hemsidor som betyder någonting',
    subtitle:
      heroContent[CONTENT_KEYS.HERO_SUBTITLE] ||
      'Vi bygger digitala upplevelser som driver resultat',
    ctaText: heroContent[CONTENT_KEYS.HERO_CTA] || 'Starta projekt',
    ctaSecondary: heroContent[CONTENT_KEYS.HERO_CTA_SECONDARY] || 'BYGG DIN SAJT NU!',
    bgImage: heroContent[CONTENT_KEYS.HERO_BG_IMAGE] || '/images/hero/hero-background.webp',
    bgVideo: heroContent[CONTENT_KEYS.HERO_BG_VIDEO] || '/videos/background.mp4',
  }

  // Pass content as props to client component
  // The HeroSection client component will use these values
  return <HeroSectionClient content={content} />
}
