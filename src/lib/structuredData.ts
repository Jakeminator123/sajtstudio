// Structured data for SEO optimization

export function getOrganizationSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Sajtstudio',
    url: 'https://www.sajtstudio.se',
    logo: 'https://www.sajtstudio.se/logo.svg',
    description: 'Skräddarsydda, toppmoderna hemsidor för utvalda företag som vill leda inom sin bransch.',
    address: {
      '@type': 'PostalAddress',
      addressCountry: 'SE',
      addressLocality: 'Stockholm',
    },
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'customer service',
      availableLanguage: ['Swedish', 'English'],
    },
    sameAs: [
      // Add social media links here
    ],
  };
}

export function getWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    url: 'https://www.sajtstudio.se',
    name: 'Sajtstudio',
    description: 'Modern webbdesign för framgångsrika företag',
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: 'https://www.sajtstudio.se/search?q={search_term_string}',
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function getServiceSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: 'Web Development',
    provider: {
      '@type': 'Organization',
      name: 'Sajtstudio',
    },
    areaServed: {
      '@type': 'Country',
      name: 'Sweden',
    },
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Webbutveckling',
      itemListElement: [
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Modern Design',
            description: 'Vi skapar visuellt imponerande hemsidor som fångar besökarens uppmärksamhet',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Teknisk Excellens',
            description: 'Varje hemsida är byggd med senaste tekniker för optimal prestanda',
          },
        },
        {
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: 'Skräddarsydda Lösningar',
            description: 'Inga mallar eller generiska lösningar',
          },
        },
      ],
    },
  };
}

export function getBreadcrumbSchema(items: { name: string; url: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

// Helper function to inject schema into head
export function generateSchemaScript(schema: any) {
  return {
    __html: JSON.stringify(schema),
  };
}
