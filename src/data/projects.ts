/**
 * Portfolio Projects Data
 *
 * Struktur för portfolio-projekt. Lägg till nya projekt här
 * eller importera från extern källa i framtiden.
 */

export interface Project {
  id: string
  title: string
  category: string
  description: string
  color: string // Tailwind color class eller hex
  image?: string // Sökväg till bild
  url?: string // Extern länk om projektet är live
  tags: string[]
  featured: boolean // Om projektet ska visas på startsidan
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'Prometheus Poker',
    category: 'Web App',
    description:
      'AI-driven pokeranalysplattform med preflop/postflop-verktyg, battle mode och power ranking för seriösa pokerspelare.',
    color: 'bg-accent',
    image: '/images/portfolio/prometheus_hero.webp',
    url: 'https://prometheuspoker.com',
    tags: ['React', 'AI/ML', 'WebSocket', 'Node.js'],
    featured: true,
  },
  {
    id: '2',
    title: 'DG97 Kontorshotell',
    category: 'Business',
    description:
      'Modern webbplats för kontorshotell i Vasastan, Stockholm med online-bokning, konferensrum och virtuella visningar.',
    color: 'bg-tertiary',
    image: '/images/portfolio/dg97_hero.webp',
    url: 'https://www.dg97.se',
    tags: ['WordPress', 'Responsive', 'SEO', 'Bokning'],
    featured: true,
  },
  {
    id: '3',
    title: 'PYNN AI',
    category: 'Web App',
    description:
      'White-label AI-plattform för investerare och innovationsstakeholders med dealflow management, AI-analys och global marketplace.',
    color: 'bg-accent',
    image: '/images/portfolio/pynn_hero.webp',
    url: 'https://pynn.ai',
    tags: ['Next.js', 'TypeScript', 'AI/ML', 'PostgreSQL'],
    featured: true,
  },
  {
    id: '4',
    title: 'Raymond Media',
    category: 'Business',
    description:
      'Datadriven plattform för ringlistor och adressregister med avancerad filtrering för telemarketing och e-postmarknadsföring.',
    color: 'bg-tertiary',
    image: '/images/portfolio/raymond_hero.webp',
    url: 'https://raymondmedia.se',
    tags: ['WordPress', 'PHP', 'MySQL', 'SEO'],
    featured: true,
  },
  {
    id: '5',
    title: 'Prometheus Preflop',
    category: 'Web App',
    description:
      'Detaljerat preflop-analysverktyg som del av Prometheus Poker-sviten med realtidsberäkningar.',
    color: 'bg-accent',
    image: '/images/portfolio/prometheus_preflop.webp',
    url: 'https://prometheuspoker.com/preflop',
    tags: ['React', 'AI', 'Realtid', 'Poker'],
    featured: false,
  },
  {
    id: '6',
    title: 'DG97 Kontorsrum',
    category: 'Business',
    description: 'Visningssidor för DG97:s kontorsrum med 360-vyer och bokningsfunktionalitet.',
    color: 'bg-tertiary',
    image: '/images/portfolio/dg97_rooms.webp',
    url: 'https://www.dg97.se',
    tags: ['WordPress', 'Bokning', 'Responsiv', 'UX'],
    featured: false,
  },
  {
    id: '7',
    title: 'PYNN Dashboard',
    category: 'Web App',
    description:
      'Avancerad dashboard för PYNN:s investerarplattform med portföljöversikt och AI-driven startup-analys.',
    color: 'bg-accent',
    image: '/images/portfolio/pynn_dashboard.webp',
    url: 'https://pynn.ai',
    tags: ['Next.js', 'Dashboard', 'AI', 'Analytics'],
    featured: false,
  },
  {
    id: '8',
    title: 'Raymond Tjänster',
    category: 'Business',
    description:
      'Tjänstesidor för Raymond Medias dataerbjudanden med avancerad filtrering och beställningsflöde.',
    color: 'bg-tertiary',
    image: '/images/portfolio/raymond_services.webp',
    url: 'https://raymondmedia.se',
    tags: ['WordPress', 'PHP', 'Leadgenerering', 'B2B'],
    featured: false,
  },
]

export const categories = ['Alla', 'Web App', 'Business']

export const featuredProjects = projects.filter((p) => p.featured)
