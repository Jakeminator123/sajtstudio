/**
 * Process Content
 */

export interface ProcessStep {
  number: string;
  title: string;
  description: string;
}

export const processSteps: ProcessStep[] = [
  {
    number: '01',
    title: 'Analys & Strategi',
    description: 'Vi analyserar ditt företag, din bransch och dina mål med AI-drivet verktyg för att skapa en databaserad strategi.',
  },
  {
    number: '02',
    title: 'Design & Utveckling',
    description: 'Skräddarsydd design och utveckling baserat på analysen. Varje pixel är tänkt för att konvertera besökare till kunder.',
  },
  {
    number: '03',
    title: 'SEO & Optimering',
    description: 'Fullständig SEO-optimering från start. Vi säkerställer att din sajt rankar högt och är synlig för rätt målgrupp.',
  },
  {
    number: '04',
    title: 'Lansering & Support',
    description: 'Smidig lansering och pågående support. Vi finns här för att hjälpa dig växa och optimera kontinuerligt.',
  },
];

