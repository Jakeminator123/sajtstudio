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
    id: 'ai-generation',
    number: '01',
    title: 'AI-generering av Webbplatser',
    shortDesc: 'Skapa professionella webbplatser på minuter med AI',
    longDesc: 'Vår AI-drivna plattform SajtMaskin gör det möjligt att generera kompletta, professionella webbplatser på bara minuter. Beskriv vad du vill bygga, välj från hundratals templates och komponenter, och få en färdig sajt som är optimerad för SEO, prestanda och konvertering. Perfekt för snabb lansering, prototyper eller kompletta projekt. AI:n analyserar dina behov, föreslår rätt design och genererar ren, produktionsklar kod som du kan ladda ner och använda direkt.',
    features: [
      'AI-genererade webbplatser på minuter',
      'Hundratals templates och komponenter',
      'Automatisk SEO-optimering',
      'Produktionsklar kod att ladda ner',
      'Anpassningsbara design-system',
      'Snabb prototyp och lansering',
    ],
  },
  {
    id: 'web-design',
    number: '02',
    title: 'Webbdesign',
    shortDesc: 'Skräddarsydda, moderna webbplatser som sticker ut',
    longDesc: 'Vi skapar visuella upplevelser som inte bara är vackra, utan också meningsfulla. Varje pixel är genomtänkt, varje färg har ett syfte, och varje animation berättar en del av din berättelse. Vårt designfilosofi bygger på balans mellan estetik och funktionalitet. Vi kombinerar AI-drivna designverktyg med mänsklig kreativitet för att skapa unika lösningar som både ser fantastiska ut och fungerar perfekt för dina användare.',
    features: [
      'Responsive design för alla enheter',
      'Modern och minimalistisk estetik',
      'Användarvänlig navigation',
      'Optimerad för konvertering',
      'Skräddarsydd efter ditt varumärke',
      'SEO-optimerad struktur',
      'AI-assisterad designprocess',
    ],
  },
  {
    id: 'web-development',
    number: '03',
    title: 'Webbutveckling',
    shortDesc: 'Kraftfulla och skalbara webbapplikationer',
    longDesc: 'Vi bygger hemsidor som är snabba, responsiva och användarvänliga. Tekniken är osynlig – det som syns är en smidig upplevelse som bara fungerar. Vår kod är ren, välstrukturerad och optimerad för att säkerställa att din hemsida inte bara ser bra ut, utan också presterar utmärkt. Vi använder modern teknik som Next.js, React och TypeScript, kombinerat med AI-verktyg för effektiv utveckling och kodgenerering.',
    features: [
      'Next.js & React för maximal prestanda',
      'Headless CMS integration',
      'API-utveckling och integration',
      'Progressive Web Apps (PWA)',
      'E-handel och betalningslösningar',
      'Säkerhet och GDPR-compliance',
      'AI-assisterad kodgenerering',
    ],
  },
  {
    id: 'branding',
    number: '04',
    title: 'Varumärke & Identitet',
    shortDesc: 'Starka varumärken som berättar er historia',
    longDesc: 'Ett starkt varumärke är grunden för framgång. Vi hjälper dig skapa en konsekvent och minnesvärd identitet som resonerar med din målgrupp. Från logotyp till färgpalett och typografi – varje element arbetar tillsammans för att berätta din unika historia. Vi använder AI-analys för att förstå din bransch och målgrupp, vilket hjälper oss skapa varumärken som verkligen resonerar.',
    features: [
      'Logotypdesign och grafisk profil',
      'Varumärkesstrategi',
      'Typografi och färgpalett',
      'Brand guidelines',
      'Marknadsföringsmaterial',
      'Social media grafik',
      'AI-driven marknadsanalys',
    ],
  },
];

