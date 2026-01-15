import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Portfolio – Sajtstudio',
  description:
    'Utvalda projekt som visar vad vi kan skapa. Moderna hemsidor för framgångsrika företag.',
  openGraph: {
    title: 'Portfolio – Sajtstudio',
    description: 'Utvalda projekt som visar vad vi kan skapa.',
    type: 'website',
  },
}

export default function PortfolioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
