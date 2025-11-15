/**
 * Portfolio Projects Data
 * 
 * Struktur för portfolio-projekt. Lägg till nya projekt här
 * eller importera från extern källa i framtiden.
 */

export interface Project {
  id: string;
  title: string;
  category: string;
  description: string;
  color: string; // Tailwind color class eller hex
  image?: string; // Sökväg till bild
  url?: string; // Extern länk om projektet är live
  tags: string[];
  featured: boolean; // Om projektet ska visas på startsidan
}

export const projects: Project[] = [
  {
    id: '1',
    title: 'Tech Startup',
    category: 'E-commerce',
    description: 'Modern e-handelsplattform med AI-drivet produktförslag och snabb checkout.',
    color: 'bg-accent',
    image: '/images/portfolio/task_01k9fec0n8ej5rv3m6x8rnfsfn_1762528837_img_1.webp',
    tags: ['Next.js', 'E-commerce', 'AI'],
    featured: true,
  },
  {
    id: '2',
    title: 'Creative Agency',
    category: 'Portfolio',
    description: 'Visuellt imponerande portfoliosajt för kreativt byrå med interaktiva case studies.',
    color: 'bg-tertiary',
    image: '/images/portfolio/task_01k90mfa25f2etneptc7kekm99_1762031914_img_0.webp',
    tags: ['React', 'Animation', 'Portfolio'],
    featured: true,
  },
  {
    id: '3',
    title: 'SaaS Platform',
    category: 'Web App',
    description: 'Skalbar SaaS-plattform med dashboard, analytics och team-collaboration.',
    color: 'bg-accent',
    image: '/images/portfolio/assets_task_01k816mxkwe908h5pg7v3yxtq9_1760977226_img_0.webp',
    tags: ['SaaS', 'Dashboard', 'Analytics'],
    featured: true,
  },
  {
    id: '4',
    title: 'Fashion Brand',
    category: 'E-commerce',
    description: 'Premium fashion e-handel med lookbook, virtual try-on och personaliserad shopping.',
    color: 'bg-tertiary',
    image: '/images/portfolio/task_01k9akk4rjfcr83xkf3b7r0rdr_1762366467_img_1.webp',
    tags: ['E-commerce', 'Fashion', 'AR'],
    featured: false,
  },
  {
    id: '5',
    title: 'Restaurant',
    category: 'Business',
    description: 'Modern restaurangwebbsida med online-bokning, meny och leveransintegration.',
    color: 'bg-accent',
    image: '/images/portfolio/task_01k9et3f60e4782n74d3pkapg7_1762507579_img_0.webp',
    tags: ['Business', 'Booking', 'Food'],
    featured: false,
  },
  {
    id: '6',
    title: 'Consulting Firm',
    category: 'Business',
    description: 'Professionell sajt för konsultföretag med case studies och expert-insights.',
    color: 'bg-tertiary',
    image: '/images/portfolio/assets_task_01k80qdg0ze1rskjzfpj7r1za3_1760961264_img_0.webp',
    tags: ['Business', 'Consulting', 'B2B'],
    featured: false,
  },
  {
    id: '7',
    title: 'Digital Agency',
    category: 'Portfolio',
    description: 'Innovativ digital byrå med fokus på användarupplevelse och konvertering.',
    color: 'bg-accent',
    image: '/images/portfolio/assets_task_01k1c880wqft0s0bcr3p77v2me_1753831780_img_0.webp',
    tags: ['UX', 'Design', 'Development'],
    featured: false,
  },
  {
    id: '8',
    title: 'Tech Innovation',
    category: 'Web App',
    description: 'Plattform för teknologisk innovation med avancerade visualiseringar.',
    color: 'bg-tertiary',
    image: '/images/portfolio/assets_task_01k05sqa0wedsbvfk5c0773fz5_1752541456_img_0.webp',
    tags: ['Innovation', 'Tech', 'Visualization'],
    featured: false,
  },
];

export const categories = ['Alla', 'E-commerce', 'Portfolio', 'Web App', 'Business'];

export const featuredProjects = projects.filter(p => p.featured);

