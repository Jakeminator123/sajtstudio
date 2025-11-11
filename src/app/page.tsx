"use client";

import HeaderNav from "@/components/HeaderNav";
import HeroSection from "@/components/HeroSection";
import Footer from "@/components/Footer";
import dynamic from "next/dynamic";

// Critical components loaded immediately
import HeroAnimation from "@/components/HeroAnimation";
import AnimatedBackground from "@/components/AnimatedBackground";

import { SectionSkeleton } from "@/components/Skeleton";
import { usePrefetch } from "@/hooks/usePrefetch";

// Lazy load non-critical sections for better performance
const USPSection = dynamic(() => import("@/components/USPSection"), {
  loading: () => <SectionSkeleton />,
});

const ServicesSection = dynamic(() => import("@/components/ServicesSection"), {
  loading: () => <SectionSkeleton />,
});

const ProcessSection = dynamic(() => import("@/components/ProcessSection"), {
  loading: () => <SectionSkeleton />,
});

const PortfolioSection = dynamic(
  () => import("@/components/PortfolioSection"),
  {
    loading: () => <SectionSkeleton />,
  }
);

const TestimonialsSection = dynamic(
  () => import("@/components/TestimonialsSection"),
  {
    loading: () => <SectionSkeleton />,
  }
);

export default function Home() {
  // Prefetch links on hover for faster navigation
  usePrefetch();

  return (
    <>
      <AnimatedBackground />
      <HeaderNav />
      <main id="main-content" tabIndex={-1} className="relative z-10">
        <HeroSection />
        <HeroAnimation />
        <USPSection />
        <div id="tjanster">
          <ServicesSection />
        </div>
        <div id="process">
          <ProcessSection />
        </div>
        <PortfolioSection />
        <div id="omdomen">
          <TestimonialsSection />
        </div>
      </main>
      <Footer />
    </>
  );
}
