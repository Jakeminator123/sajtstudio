export interface Service {
  id: string;
  number: string;
  title: string;
  shortDesc: string;
  longDesc: string;
  features: string[];
  icon?: string;
}

export const services: Service[] = [
  {
    id: 'web-design',
    number: '01',
    title: 'Webbdesign',
    shortDesc: 'Skräddarsydda, moderna webbplatser som sticker ut',
    longDesc: 'Vi skapar visuella upplevelser som inte bara är vackra, utan också meningsfulla. Varje pixel är genomtänkt, varje färg har ett syfte, och varje animation berättar en del av din berättelse. Vårt designfilosofi bygger på balans mellan estetik och funktionalitet.',
    features: [
      'Responsive design för alla enheter',
      'Modern och minimalistisk estetik',
      'Användarvänlig navigation',
      'Optimerad för konvertering',
      'Skräddarsydd efter ditt varumärke',
      'SEO-optimerad struktur',
    ],
  },
  {
    id: 'web-development',
    number: '02',
    title: 'Webbutveckling',
    shortDesc: 'Kraftfulla och skalbara webbapplikationer',
    longDesc: 'Vi bygger hemsidor som är snabba, responsiva och användarvänliga. Tekniken är osynlig – det som syns är en smidig upplevelse som bara fungerar. Vår kod är ren, välstrukturerad och optimerad för att säkerställa att din hemsida inte bara ser bra ut, utan också presterar utmärkt.',
    features: [
      'Next.js & React för maximal prestanda',
      'Headless CMS integration',
      'API-utveckling och integration',
      'Progressive Web Apps (PWA)',
      'E-handel och betalningslösningar',
      'Säkerhet och GDPR-compliance',
    ],
  },
  {
    id: 'branding',
    number: '03',
    title: 'Varumärke & Identitet',
    shortDesc: 'Starka varumärken som berättar er historia',
    longDesc: 'Ett starkt varumärke är grunden för framgång. Vi hjälper dig skapa en konsekvent och minnesvärd identitet som resonerar med din målgrupp. Från logotyp till färgpalett och typografi – varje element arbetar tillsammans för att berätta din unika historia.',
    features: [
      'Logotypdesign och grafisk profil',
      'Varumärkesstrategi',
      'Typografi och färgpalett',
      'Brand guidelines',
      'Marknadsföringsmaterial',
      'Social media grafik',
    ],
  },
];

