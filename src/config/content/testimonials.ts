/**
 * Testimonials Content
 */

export interface Testimonial {
  id: string
  name: string
  company: string
  role: string
  quote: string
  rating: number // 1-5
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Martin Arnold',
    company: 'Prometheus Poker',
    role: 'CEO',
    quote:
      'They built exactly what we envisioned — an AI-powered platform that gives our users a real competitive edge. Professional, fast, and technically brilliant.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Joakim Hallsten',
    company: 'Raymond Media AB',
    role: 'VD',
    quote:
      'Sajtstudio har lyft vår digitala närvaro rejält. Professionellt, snabbt och med en förståelse för vad vi faktiskt behöver.',
    rating: 5,
  },
  {
    id: '3',
    name: 'DG97',
    company: 'dg97.se',
    role: 'Kontorshotell, Stockholm',
    quote:
      'En modern sajt som speglar kvaliteten i vår verksamhet. Resultatet överträffade förväntningarna.',
    rating: 5,
  },
]
