/**
 * USPSection Server Wrapper
 *
 * Fetches content from CMS and passes it to the client-side USPSection.
 */

import { getContent, CONTENT_KEYS } from '@/lib/get-content'
import USPSectionClient, { USPContent } from './USPSection'

export default function USPSection() {
  // Fetch USP content from CMS
  const content: USPContent = {
    title: getContent(CONTENT_KEYS.USP_TITLE, 'AI-drivet. Data-baserat. Resultatfokuserat.'),
    subtitle: getContent(CONTENT_KEYS.USP_SUBTITLE, 'Hemsidor som faktiskt genererar affärer'),
    description: getContent(
      CONTENT_KEYS.USP_DESC,
      'Vi erbjuder både skräddarsydd webbutveckling och AI-genererade webbplatser.'
    ),
    features: [
      {
        number: '01',
        title: getContent(CONTENT_KEYS.USP_1_TITLE, 'AI-generering eller Skräddarsydd Utveckling'),
        description: getContent(
          CONTENT_KEYS.USP_1_DESC,
          'Välj mellan vår AI-plattform SajtMaskin eller låt oss bygga en unik hemsida.'
        ),
      },
      {
        number: '02',
        title: getContent(CONTENT_KEYS.USP_2_TITLE, 'SEO-Optimering från Start'),
        description: getContent(
          CONTENT_KEYS.USP_2_DESC,
          'Varje hemsida är byggd för att ranka högt på Google.'
        ),
      },
      {
        number: '03',
        title: getContent(CONTENT_KEYS.USP_3_TITLE, 'Skräddarsydd för Dina Mål'),
        description: getContent(
          CONTENT_KEYS.USP_3_DESC,
          'Din hemsida designas utifrån vad ditt företag faktiskt erbjuder.'
        ),
      },
      {
        number: '04',
        title: getContent(CONTENT_KEYS.USP_4_TITLE, 'Redigera När Du Vill'),
        description: getContent(
          CONTENT_KEYS.USP_4_DESC,
          'Du behöver inte vara låst. Våra hemsidor är byggda så att du enkelt kan uppdatera.'
        ),
      },
    ],
    tagline: 'Sajter som levererar. Byggda med data, formade för resultat.',
    cta: {
      text: 'Låt oss bygga din nästa hemsida',
      buttonText: 'Starta ditt projekt →',
      href: '/kontakt',
    },
  }

  return <USPSectionClient content={content} />
}
