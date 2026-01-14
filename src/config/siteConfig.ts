/**
 * Projektkonfiguration och metadata
 *
 * Central konfigurationsfil för hela sajten.
 * Används av HeaderNav, Footer, SEO-komponenter och andra delar av applikationen.
 */

export const siteConfig = {
  // Grundläggande information
  name: "Sajtstudio",
  tagline: "Modern webbdesign och AI-generering av webbplatser",
  description:
    "Skräddarsydda, toppmoderna hemsidor och AI-genererade webbplatser för framgångsrika företag. Vi erbjuder både skräddarsydd webbutveckling och AI-drivna verktyg för att skapa professionella sajter på minuter.",

  // Kontaktinformation
  contact: {
    email: "hello@sajtstudio.se",
    phone: "+46 70 123 45 67",
    location: "Stockholm, Sverige",
    timezone: "Europe/Stockholm",
  },

  // SEO
  seo: {
    defaultTitle:
      "Sajtstudio – Modern webbdesign och AI-generering av webbplatser",
    defaultDescription:
      "Skräddarsydda, toppmoderna hemsidor och AI-genererade webbplatser för framgångsrika företag. Vi erbjuder både skräddarsydd webbutveckling med React och Next.js, samt AI-drivna verktyg för att skapa professionella sajter på minuter. Perfekt för företag som vill ha en unik hemsida eller snabbt generera en webbplats med vår AI-plattform SajtMaskin.",
    siteUrl: "https://www.sajtstudio.se",
    ogImage: "/logo.svg",
  },

  /**
   * Navigation struktur
   *
   * Navigation består av två typer av länkar:
   * 1. Page links (nav.links): Direkta länkar till sidor (/portfolio, /kontakt)
   *    - Visas på alla sidor i navigationen
   *    - Används för att navigera mellan huvudsidor
   *
   * 2. Anchor links (nav.homeAnchors): Ankarlänkar till sektioner på startsidan
   *    - Visas endast när användaren är på startsidan (/)
   *    - Används för att scrolla till specifika sektioner (#tjanster, #process, #omdomen)
   *    - HeaderNav hanterar logiken för att visa/dölja dessa baserat på aktuell sida
   *
   * Navigation flow:
   * - På startsidan: Visar Hem + Anchor links (Tjänster, Process, Omdömen) + Page links (Portfolio, Kontakt)
   * - På andra sidor: Visar Page links (Hem, Portfolio, Kontakt) - anchor links döljs
   */
  nav: {
    // Page links - visas på alla sidor
    links: [
      { href: "/", label: "Hem" },
      { href: "/portfolio", label: "Portfolio" },
      { href: "#erbjudande", label: "Erbjudande" }, // Opens modal instead of navigating
      { href: "/kontakt", label: "Kontakt" },
    ],
    // Anchor links - visas endast på startsidan (/)
    // Måste matcha id-attribut på motsvarande sektioner i page.tsx
    homeAnchors: [
      { href: "#tjanster", label: "Tjänster" }, // Motsvarar <div id="tjanster">
      { href: "#process", label: "Process" }, // Motsvarar <div id="process">
      { href: "#om-oss", label: "Om oss" }, // Motsvarar <div id="om-oss">
      { href: "#omdomen", label: "Omdömen" }, // Motsvarar <div id="omdomen">
    ],
  },

  // Sociala länkar (lägg till när de finns)
  social: {
    // twitter: 'https://twitter.com/sajtstudio',
    // linkedin: 'https://linkedin.com/company/sajtstudio',
  },
} as const;
