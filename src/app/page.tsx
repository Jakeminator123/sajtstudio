import HeaderNav from '@/components/HeaderNav';
import HeroSection from '@/components/HeroSection';
import Footer from '@/components/Footer';
import dynamic from 'next/dynamic';

// Critical components loaded immediately
import HeroAnimation from '@/components/HeroAnimation';

import { SectionSkeleton } from '@/components/Skeleton';

// Lazy load non-critical sections for better performance
const USPSection = dynamic(() => import('@/components/USPSection'), {
  loading: () => <SectionSkeleton />,
});

const ServicesSection = dynamic(() => import('@/components/ServicesSection'), {
  loading: () => <SectionSkeleton />,
});

const ProcessSection = dynamic(() => import('@/components/ProcessSection'), {
  loading: () => <SectionSkeleton />,
});

const PortfolioSection = dynamic(() => import('@/components/PortfolioSection'), {
  loading: () => <SectionSkeleton />,
});

const TestimonialsSection = dynamic(() => import('@/components/TestimonialsSection'), {
  loading: () => <SectionSkeleton />,
});

export default function Home() {
  return (
    <>
      <HeaderNav />
      <main id="main-content" tabIndex={-1}>
        <HeroSection />
        <HeroAnimation />
        <USPSection />
        <ServicesSection />
        <ProcessSection />
        <PortfolioSection />
        <TestimonialsSection />
      </main>
      <Footer />
    </>
  );
}

