export interface CaseStudy {
  id: string
  title: string
  client: string
  thumbnail: string
  hero: string
  problem: string
  solution: string
  results: string[]
  tech: string[]
  images: string[]
  category?: string
}

export const caseStudies: CaseStudy[] = [
  {
    id: 'tech-innovations',
    title: 'Digital Transformation',
    client: 'Tech Innovations AB',
    category: 'E-commerce',
    thumbnail: '/images/portfolio/task_01k90mfa25f2etneptc7kekm99_1762031914_img_0.webp',
    hero: '/images/portfolio/task_01k90mfa25f2etneptc7kekm99_1762031914_img_0.webp',
    problem:
      'Tech Innovations AB hade en föråldrad e-handelsplattform som inte kunde hantera ökad trafik och hade dålig konverteringsgrad. Användarupplevelsen var frustrerande och konkurrensen tog marknadsandelar.',
    solution:
      'Vi byggde en helt ny e-handelsplattform med Next.js och headless CMS. Modern design med fokus på användarvänlighet och hastighet. Implementerade AI-driven produktrekommendationer och optimerade checkout-flödet.',
    results: [
      '150% ökning i konverteringsgrad',
      '3x snabbare laddningstider',
      '40% minskning i cart abandonment',
      '200% ökning i mobilförsäljning',
    ],
    tech: ['Next.js', 'React', 'Shopify', 'TypeScript', 'Tailwind CSS', 'Stripe'],
    images: [
      '/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp',
      '/images/portfolio/assets_task_01k816mxkwe908h5pg7v3yxtq9_1760977226_img_0.webp',
    ],
  },
  {
    id: 'nordic-design',
    title: 'Brand & Portfolio Platform',
    client: 'Nordic Design Studio',
    category: 'Portfolio',
    thumbnail: '/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp',
    hero: '/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp',
    problem:
      'Nordic Design Studio behövde en portfolio-site som verkligen visade deras kreativa förmåga. Deras gamla site var generisk och lyckades inte konvertera prospekts till kunder.',
    solution:
      'Vi skapade en visuellt stunning portfolio-plattform med custom animations och interaktiva case studies. Implementerade ett headless CMS för enkel uppdatering av projekt och en kontaktflow som konverterar.',
    results: [
      '300% ökning i kvalificerade leads',
      '90% av besökare browsear flera projekt',
      '50% ökning i genomsnittlig projektstorlek',
      'Vann "Best Design Agency Site 2024"',
    ],
    tech: ['Next.js', 'Sanity CMS', 'Framer Motion', 'GSAP', 'Vercel'],
    images: [
      '/images/portfolio/task_01k90mfa25f2etneptc7kekm99_1762031914_img_0.webp',
      '/images/portfolio/task_01k9akk4rjfcr83xkf3b7r0rdr_1762366467_img_1.webp',
    ],
  },
  {
    id: 'creative-agency',
    title: 'Full Digital Ecosystem',
    client: 'Creative Agency',
    category: 'Corporate',
    thumbnail: '/images/portfolio/assets_task_01k816mxkwe908h5pg7v3yxtq9_1760977226_img_0.webp',
    hero: '/images/portfolio/assets_task_01k816mxkwe908h5pg7v3yxtq9_1760977226_img_0.webp',
    problem:
      'Creative Agency hade fragmenterad digital närvaro med flera olika system som inte pratade med varandra. Svårt att hantera content och kunddata. Ineffektiv onboarding av nya kunder.',
    solution:
      'Vi byggde ett komplett digitalt ekosystem med webbplats, client portal och CRM-integration. Allt byggt i Next.js med Sanity som headless CMS. Automatiserade workflows och smooth onboarding-process.',
    results: [
      '70% mindre tid för administrativt arbete',
      '2x snabbare client onboarding',
      '100% förbättrad data synk mellan system',
      '45% ökning i customer satisfaction score',
    ],
    tech: ['Next.js', 'Sanity', 'PostgreSQL', 'Prisma', 'Stripe', 'SendGrid'],
    images: [
      '/images/portfolio/task_01k9akk4rjfcr83xkf3b7r0rdr_1762366467_img_1.webp',
      '/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp',
    ],
  },
  {
    id: 'startup-launch',
    title: 'SaaS Product Launch',
    client: 'TechStart Inc',
    category: 'SaaS',
    thumbnail: '/images/portfolio/task_01k9akk4rjfcr83xkf3b7r0rdr_1762366467_img_1.webp',
    hero: '/images/portfolio/task_01k9akk4rjfcr83xkf3b7r0rdr_1762366467_img_1.webp',
    problem:
      'En ny SaaS-produkt behövde en landing page som kunde konvertera early adopters och samla in beta-användare. Tight budget och deadline innan produktlansering.',
    solution:
      'Vi skapade en high-converting landing page med fokus på value proposition och social proof. Implementerade waitlist-funktionalitet och email automation. A/B-testing för att optimera konvertering.',
    results: [
      '5000+ beta signups på 3 månader',
      '12% konverteringsgrad från besök till signup',
      '80% email open rate i nurturing campaign',
      'Säkrade $2M i seed funding',
    ],
    tech: ['Next.js', 'Supabase', 'Resend', 'Vercel Analytics', 'Tailwind'],
    images: [],
  },
]
