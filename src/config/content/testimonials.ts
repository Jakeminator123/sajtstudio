/**
 * Testimonials Content
 */

export interface Testimonial {
  id: string;
  name: string;
  company: string;
  role: string;
  quote: string;
  rating: number; // 1-5
}

export const testimonials: Testimonial[] = [
  {
    id: '1',
    name: 'Anna Andersson',
    company: 'TechCorp',
    role: 'VD',
    quote: 'Sajtstudio skapade en hemsida som inte bara ser fantastisk ut, utan också genererar riktiga resultat. Vår konvertering ökade med 40% efter lanseringen.',
    rating: 5,
  },
  {
    id: '2',
    name: 'Marcus Larsson',
    company: 'Creative Studio',
    role: 'Grundare',
    quote: 'Professionellt arbete från början till slut. De förstod vår vision och förvandlade den till en verklighet som överträffade våra förväntningar.',
    rating: 5,
  },
  {
    id: '3',
    name: 'Emma Johansson',
    company: 'StartupXYZ',
    role: 'CMO',
    quote: 'AI-drivet och data-baserat – precis vad vi behövde. Vår nya sajt rankar högt på Google och genererar kvalificerade leads dagligen.',
    rating: 5,
  },
];

