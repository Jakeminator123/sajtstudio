/**
 * Projektkonfiguration och metadata
 */

export const siteConfig = {
  // Grundläggande information
  name: 'Sajtstudio',
  tagline: 'Modern webbdesign för framgångsrika företag',
  description: 'Skräddarsydda, toppmoderna hemsidor för utvalda företag',
  
  // Kontaktinformation
  contact: {
    email: 'hello@sajtstudio.se',
    phone: '+46 70 123 45 67',
    location: 'Stockholm, Sverige',
    timezone: 'Europe/Stockholm',
  },
  
  // SEO
  seo: {
    defaultTitle: 'Sajtstudio – Modern webbdesign för framgångsrika företag',
    defaultDescription: 'Skräddarsydda, toppmoderna hemsidor för utvalda företag',
    siteUrl: 'https://www.sajtstudio.se',
    ogImage: '/logo.svg',
  },
  
  // Navigation
  nav: {
    links: [
      { href: '/', label: 'Hem' },
      { href: '/portfolio', label: 'Portfolio' },
      { href: '/contact', label: 'Kontakt' },
    ],
    // Ankarlänkar för startsidan
    homeAnchors: [
      { href: '#tjanster', label: 'Tjänster' },
      { href: '#process', label: 'Process' },
      { href: '#omdomen', label: 'Omdömen' },
    ],
  },
  
  // Sociala länkar (lägg till när de finns)
  social: {
    // twitter: 'https://twitter.com/sajtstudio',
    // linkedin: 'https://linkedin.com/company/sajtstudio',
  },
} as const;

